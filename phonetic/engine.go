package phonetic

// The engine: every table and switch is in rules.json; this is only the loop.

import (
	"encoding/json"
	"sort"
	"strconv"
	"strings"
	"unicode/utf8"
)

type rawRules struct {
	Version string `json:"version"`
	Brahmic struct {
		From              rune              `json:"from"`
		To                rune              `json:"to"`
		ClassByOffset     map[string]string `json:"class_by_offset"`
		ViramaOffset      rune              `json:"virama_offset"`
		CandrabinduOffset rune              `json:"candrabindu_offset"`
		CandrabinduClass  string            `json:"candrabindu_class"`
		NuktaOffset       rune              `json:"nukta_offset"`
		FlapOffsets       []rune            `json:"flap_offsets"`
		FlapClass         string            `json:"flap_class"`
		Rewrite           [][2]string       `json:"rewrite"`
		RewriteBases      [][2]string       `json:"rewrite_bases"`
	} `json:"brahmic"`
	Extra map[string]string `json:"extra"`
	Urdu  struct {
		From          rune              `json:"from"`
		To            rune              `json:"to"`
		Letters       map[string]string `json:"letters"`
		Ain           string            `json:"ain"`
		Waw           string            `json:"waw"`
		WawVBefore    string            `json:"waw_v_before"`
		FinalHe       string            `json:"final_he"`
		FinalHeHAfter string            `json:"final_he_h_after"`
	} `json:"urdu"`
	Meetei struct {
		Ranges  [][2]rune         `json:"ranges"`
		Letters map[string]string `json:"letters"`
		// rules 2026-10-13: Carrier before one of CarrierBefore is not read (mni-atiya);
		// Nung before a letter whose class is not a vowel reads NungClass (mni-nung)
		Carrier       string `json:"carrier"`
		CarrierBefore string `json:"carrier_before"`
		Nung          string `json:"nung"`
		NungClass     string `json:"nung_class"`
	} `json:"meetei"`
	OlChiki struct {
		From       rune              `json:"from"`
		To         rune              `json:"to"`
		Letters    map[string]string `json:"letters"`
		Aspiration string            `json:"aspiration"`
	} `json:"ol_chiki"`
	Latin struct {
		Groups      [][2]string       `json:"groups"`
		Letters     map[string]string `json:"letters"`
		WUnlessNext string            `json:"w_ambiguous_unless_before"`
	} `json:"latin"`
	ClassMap map[string]string `json:"class_map"`
	Vowels   string            `json:"vowels"`
	Steps    map[string]bool   `json:"steps"`
	Branches []struct {
		From      rune    `json:"from"`
		To        rune    `json:"to"`
		Class     string  `json:"class"`
		Also      string  `json:"also"`
		After     *string `json:"after"`
		Before    *string `json:"before"`
		NotBefore string  `json:"not_before"`
	} `json:"branches"`
	InitialBranches []struct {
		From rune   `json:"from"`
		To   rune   `json:"to"`
		Also string `json:"also"`
	} `json:"initial_branches"`
	Joined struct {
		MinClasses int `json:"min_classes"`
	} `json:"joined"`
	DigitZeros []rune              `json:"digit_zeros"`
	Initials   map[string][]string `json:"initials"`
	// place-abbr: a Latin abbreviation also keys as the word it stands for (bk = budruk)
	Abbreviations map[string][]string `json:"abbreviations"`
	// ta-aa-r: a word holding the first spelling also keys with every one read as the second
	SecondReadings [][2]string `json:"second_readings"`
	Titles         []string    `json:"titles"`
	MaxKeys        int         `json:"max_keys"`
	Suffixes       []struct {
		From    rune     `json:"from"`
		To      rune     `json:"to"`
		Endings []string `json:"endings"`
	} `json:"suffixes"`
}

// A branch gives a word a second key with one class read as another (also);
// also == 0 deletes the class. after/before name the classes that may stand
// next to it ("^" is the word's start, "$" its end); nil means any.
type branch struct {
	from, to      rune
	class, also   rune
	after, before *string
	notBefore     string
}

// deleted marks a class that a branch removes, until the fold drops it.
const deleted = rune(-1)

type suffix struct {
	from, to rune
	endings  []string
}

type group struct {
	text    string
	classes []rune
}

// engine computes the keys of one word. It is read-only after load, so it is
// safe for concurrent use.
type engine struct {
	from, to, virama, candra rune
	candraClass              rune
	byOffset                 [128]rune // 0 = not coded
	extra, urdu, meetei, ol  map[rune]rune
	classMap                 map[rune]rune
	urduFrom, urduTo         rune
	ain, waw, aspiration     rune
	wawVBefore, finalHe      string
	finalHeHAfter            string
	meeteiRanges             [][2]rune
	carrier, nung, nungClass rune // 0 = not in the rules
	carrierBefore            string
	olFrom, olTo             rune
	groups                   []group
	latin                    [128]rune // 0 = not coded
	wUnlessNext              string    // a later w before none of these is "w": v or a vowel
	isVowel                  map[rune]bool
	ngK, initialVowels       bool
	dropH, dropY, dropVowels bool
	dropFinalVowel           bool
	branches                 []branch
	suffixes                 []suffix
	digitZeros               []rune // a word of these digits (zero, then 1-9) only is a number
	maxKeys                  int
	nukta, flapClass         rune // a nukta after a flap offset (ड ढ) reads it as the flap
	flapOffsets              []rune
	joinedMin                int                 // joined keys shorter than this find too many names
	initials                 map[string][]string // a one-letter Latin word also keys as its spoken name
	abbreviations            map[string][]string // a Latin abbreviation also keys as its word (bk = budruk)
	secondReadings           [][2]string         // a word holding p[0] also keys with every p[0] read as p[1]
	titles                   map[string]bool     // a name's leading words in this set are dropped
	rewrite                  [][2]string         // Brahmic spellings rewritten, in order, before reading (ml-tta)
	rewriteBases             [][2]string         // the same, as one more base after the suffix stems (ml-tta-add)
	initialBranches          []branch            // a word in range whose first class is a vowel also keys with it read as also
}

func one(s string) rune { r, _ := utf8.DecodeRuneInString(s); return r }

func runeMap(m map[string]string) map[rune]rune {
	out := make(map[rune]rune, len(m))
	for k, v := range m {
		out[one(k)] = one(v)
	}
	return out
}

func load(data []byte) (*engine, error) {
	var r rawRules
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, err
	}
	k := &engine{
		from: r.Brahmic.From, to: r.Brahmic.To,
		virama: r.Brahmic.ViramaOffset, candra: r.Brahmic.CandrabinduOffset,
		candraClass: one(r.Brahmic.CandrabinduClass),
		extra:       runeMap(r.Extra), urdu: runeMap(r.Urdu.Letters),
		meetei: runeMap(r.Meetei.Letters), ol: runeMap(r.OlChiki.Letters),
		classMap: runeMap(r.ClassMap), urduFrom: r.Urdu.From, urduTo: r.Urdu.To,
		ain: one(r.Urdu.Ain), waw: one(r.Urdu.Waw), aspiration: one(r.OlChiki.Aspiration),
		wawVBefore: r.Urdu.WawVBefore, finalHe: r.Urdu.FinalHe, finalHeHAfter: r.Urdu.FinalHeHAfter,
		meeteiRanges: r.Meetei.Ranges, olFrom: r.OlChiki.From, olTo: r.OlChiki.To,
		carrier: one(r.Meetei.Carrier), carrierBefore: r.Meetei.CarrierBefore,
		nung: one(r.Meetei.Nung), nungClass: one(r.Meetei.NungClass),
		isVowel: map[rune]bool{}, digitZeros: r.DigitZeros, maxKeys: r.MaxKeys,
		ngK: r.Steps["ng-k"], initialVowels: r.Steps["initial-vowels-alike"],
		dropH: r.Steps["drop-h"], dropY: r.Steps["drop-y"], dropVowels: r.Steps["drop-vowels"],
		dropFinalVowel: r.Steps["drop-final-vowel"],
		nukta:          r.Brahmic.NuktaOffset, flapClass: one(r.Brahmic.FlapClass),
		flapOffsets: r.Brahmic.FlapOffsets, joinedMin: r.Joined.MinClasses,
		initials: r.Initials, abbreviations: r.Abbreviations, secondReadings: r.SecondReadings,
		titles: map[string]bool{},
	}
	for _, t := range r.Titles {
		k.titles[t] = true
	}
	k.rewrite, k.rewriteBases = r.Brahmic.Rewrite, r.Brahmic.RewriteBases
	for _, b := range r.InitialBranches {
		k.initialBranches = append(k.initialBranches, branch{from: b.From, to: b.To, also: one(b.Also)})
	}
	for o, c := range r.Brahmic.ClassByOffset {
		n, _ := strconv.Atoi(o)
		k.byOffset[n] = one(c)
	}
	for l, c := range r.Latin.Letters {
		k.latin[l[0]] = one(c)
	}
	for _, g := range r.Latin.Groups {
		k.groups = append(k.groups, group{g[0], []rune(g[1])})
	}
	k.wUnlessNext = r.Latin.WUnlessNext
	for _, v := range r.Vowels {
		k.isVowel[v] = true
	}
	for _, b := range r.Branches {
		also := deleted
		if b.Also != "" {
			also = one(b.Also)
		}
		k.branches = append(k.branches, branch{b.From, b.To, one(b.Class), also, b.After, b.Before, b.NotBefore})
	}
	for _, s := range r.Suffixes {
		k.suffixes = append(k.suffixes, suffix{s.From, s.To, s.Endings})
	}
	return k, nil
}

func (k *engine) readBrahmic(word string, out []rune) []rune {
	for _, p := range k.rewrite {
		word = strings.ReplaceAll(word, p[0], p[1])
	}
	last := rune(-1) // offset of the last letter read, for the nukta
	for _, ch := range word {
		if x, ok := k.extra[ch]; ok {
			out = append(out, x)
			last = -1
			continue
		}
		if ch < k.from || ch > k.to {
			continue
		}
		off := ch & 0x7f
		switch {
		case off == k.nukta && k.isFlap(last) && len(out) > 0:
			out[len(out)-1] = k.flapClass
		case off == k.virama:
		case off == k.candra:
			out = append(out, k.candraClass)
		case k.byOffset[off] != 0:
			out = append(out, k.byOffset[off])
		}
		if k.byOffset[off] != 0 {
			last = off
		} else if off != k.nukta && off != k.virama {
			last = -1
		}
	}
	return out
}

func (k *engine) isFlap(off rune) bool {
	for _, f := range k.flapOffsets {
		if off == f {
			return true
		}
	}
	return false
}

func (k *engine) readLatin(word string, out []rune) []rune {
outer:
	for i := 0; i < len(word); {
		for _, g := range k.groups {
			if strings.HasPrefix(word[i:], g.text) {
				out = append(out, g.classes...)
				i += len(g.text)
				continue outer
			}
		}
		ch := word[i]
		if ch == 'c' {
			if i+1 < len(word) && (word[i+1] == 'e' || word[i+1] == 'i' || word[i+1] == 'y') {
				out = append(out, 's')
			} else {
				out = append(out, 'k')
			}
		} else if ch == 'w' && i > 0 && (i+1 == len(word) || !strings.ContainsRune(k.wUnlessNext, rune(word[i+1]))) {
			out = append(out, 'w')
		} else if c := k.latin[ch&0x7f]; c != 0 {
			out = append(out, c)
		}
		i++
	}
	return out
}

func (k *engine) readUrdu(word string, out []rune) []rune {
	cs := []rune(word)
	if cs[0] == k.ain {
		out = append(out, 'a')
	}
	for i, ch := range cs {
		if ch == k.waw && i > 0 && !(i+1 < len(cs) && strings.ContainsRune(k.wawVBefore, cs[i+1])) {
			out = append(out, 'w')
		} else if c, ok := k.urdu[ch]; ok {
			out = append(out, c)
		}
	}
	n := len(cs)
	if n > 1 && strings.ContainsRune(k.finalHe, cs[n-1]) && !strings.ContainsRune(k.finalHeHAfter, cs[n-2]) {
		out[len(out)-1] = 'a'
	}
	return out
}

func (k *engine) readTable(word string, table map[rune]rune, olChiki bool, out []rune) []rune {
	for _, ch := range word {
		if olChiki && ch == k.aspiration && len(out) > 0 && !k.isVowel[out[len(out)-1]] {
			continue
		}
		if c, ok := table[ch]; ok {
			out = append(out, c)
		}
	}
	return out
}

// readMeetei reads Meetei Mayek by its table, with the carrier and nung rules (rules 2026-10-13).
func (k *engine) readMeetei(word string, out []rune) []rune {
	cs := []rune(word)
	for i, ch := range cs {
		if k.carrier != 0 && ch == k.carrier && i+1 < len(cs) && strings.ContainsRune(k.carrierBefore, cs[i+1]) {
			continue
		}
		if k.nung != 0 && ch == k.nung && i+1 < len(cs) {
			if c, ok := k.meetei[cs[i+1]]; ok && !k.isVowel[c] {
				out = append(out, k.nungClass)
				continue
			}
		}
		if c, ok := k.meetei[ch]; ok {
			out = append(out, c)
		}
	}
	return out
}

func (k *engine) read(word string) []rune {
	out := make([]rune, 0, len(word))
	ascii := true
	for i := 0; i < len(word); i++ {
		if word[i] >= 0x80 {
			ascii = false
			break
		}
	}
	if ascii {
		return k.readLatin(word, out)
	}
	ol, me := false, false
	for _, ch := range word {
		if ch >= k.urduFrom && ch <= k.urduTo {
			return k.readUrdu(word, out)
		}
		if ch >= k.olFrom && ch <= k.olTo {
			ol = true
		} else {
			for _, r := range k.meeteiRanges {
				if ch >= r[0] && ch <= r[1] {
					me = true
				}
			}
		}
	}
	if ol {
		return k.readTable(word, k.ol, true, out)
	}
	if me {
		return k.readMeetei(word, out)
	}
	return k.readBrahmic(word, out)
}

func (k *engine) fold(in []rune, buf []rune) string {
	codes := buf[:0]
	for i, c := range in {
		if x, ok := k.classMap[c]; ok {
			codes = append(codes, x)
		} else {
			codes = append(codes, c)
		}
		if k.ngK && c == 'ṅ' && !(i+1 < len(in) && in[i+1] == 'k') {
			codes = append(codes, 'k') // no fold maps k
		}
	}
	if len(codes) == 0 {
		return ""
	}
	if k.initialVowels && k.isVowel[codes[0]] {
		codes[0] = 'a'
	}
	n := 1
	for _, c := range codes[1:] { // in-place filter: writes trail reads
		if (k.dropH && c == 'h') || (k.dropY && c == 'y') || (k.dropVowels && k.isVowel[c]) {
			continue
		}
		codes[n] = c
		n++
	}
	codes = codes[:n]
	if k.dropFinalVowel && len(codes) > 1 && k.isVowel[codes[len(codes)-1]] {
		codes = codes[:len(codes)-1]
	}
	var sb strings.Builder
	sb.Grow(len(codes) * 2)
	for i, c := range codes {
		if i == 0 || c != codes[i-1] {
			sb.WriteRune(c)
		}
	}
	return sb.String()
}

func (k *engine) variants(word string) [][]rune {
	classes := k.read(word)
	vs := [][]rune{classes}
	for _, b := range k.branches {
		has, inScript := false, false
		for _, c := range classes {
			if c == b.class {
				has = true
				break
			}
		}
		if !has {
			continue
		}
		for _, ch := range word {
			if ch >= b.from && ch <= b.to {
				inScript = true
				break
			}
		}
		if !inScript {
			continue
		}
		for i, c := range classes {
			if c == b.class && len(vs)*2 <= k.maxKeys && b.fits(classes, i) {
				n := len(vs)
				for _, v := range vs[:n] {
					w := append([]rune(nil), v...)
					w[i] = b.also
					vs = append(vs, w)
				}
			}
		}
	}
	for _, b := range k.initialBranches { // after the branches, as reference.py#_variants
		if len(classes) == 0 || !k.isVowel[classes[0]] || len(vs)*2 > k.maxKeys || !inRange(word, b.from, b.to) {
			continue
		}
		n := len(vs)
		for _, v := range vs[:n] {
			w := append([]rune(nil), v...)
			w[0] = b.also
			vs = append(vs, w)
		}
	}
	for j, v := range vs { // every variant kept the reader's length; now drop the deleted
		n := 0
		for _, c := range v {
			if c != deleted {
				v[n] = c
				n++
			}
		}
		vs[j] = v[:n]
	}
	return vs
}

// dropTitles gives the words of a name written in comma-separated parts
// (normalized words), each part without its leading titles; if every word
// is a title, the last word stays (reference.py#name_parts).
func (k *engine) dropTitles(parts [][]string) []string {
	var out, all []string
	for _, ws := range parts {
		i := 0
		for i < len(ws) && k.titles[ws[i]] {
			i++
		}
		out = append(out, ws[i:]...)
		all = append(all, ws...)
	}
	if len(out) == 0 && len(all) > 0 {
		return all[len(all)-1:]
	}
	return out
}

func inRange(word string, from, to rune) bool {
	for _, ch := range word {
		if ch >= from && ch <= to {
			return true
		}
	}
	return false
}

// fits reports whether position i of the reader's classes stands in the
// branch's context (reference.py#_fits).
func (b branch) fits(classes []rune, i int) bool {
	prev, next := '^', '$'
	if i > 0 {
		prev = classes[i-1]
	}
	if i+1 < len(classes) {
		next = classes[i+1]
	}
	return (b.after == nil || strings.ContainsRune(*b.after, prev)) &&
		(b.before == nil || strings.ContainsRune(*b.before, next)) &&
		!strings.ContainsRune(b.notBefore, next)
}

// number returns the value of a word of digits only, in ASCII (१२ → "12").
func (k *engine) number(word string) (string, bool) {
	var b strings.Builder
	for _, r := range word {
		digit := false
		for _, z := range k.digitZeros {
			if r >= z && r <= z+9 {
				b.WriteRune('0' + r - z)
				digit = true
				break
			}
		}
		if !digit {
			return "", false
		}
	}
	return b.String(), b.Len() > 0
}

// keys returns the sorted, distinct keys of one normalized word. It never
// holds "": a word with no letter and no number has no key.
func (k *engine) keys(word string) []string {
	if n, ok := k.number(word); ok {
		return []string{n}
	}
	bases := append([]string{word}, k.initials[word]...) // M = em = एम = எம்
	bases = append(bases, k.abbreviations[word]...)      // Bk = budruk = बुद्रुक
	first, _ := utf8.DecodeRuneInString(word)
	for _, s := range k.suffixes {
		if first < s.from || first > s.to {
			continue
		}
		for _, e := range s.endings {
			if strings.HasSuffix(word, e) && utf8.RuneCountInString(word)-utf8.RuneCountInString(e) >= 2 {
				bases = append(bases, word[:len(word)-len(e)])
				break
			}
		}
	}
	for _, p := range k.secondReadings { // Tamil ா் typed for ர் (reference.py#keys, ta-aa-r)
		if strings.Contains(word, p[0]) {
			bases = append(bases, strings.ReplaceAll(word, p[0], p[1]))
		}
	}
	if len(k.rewriteBases) > 0 { // a second reading of each base (reference.py#keys, ml-tta-add)
		for _, b := range bases[:len(bases):len(bases)] {
			r := b
			for _, p := range k.rewriteBases {
				r = strings.ReplaceAll(r, p[0], p[1])
			}
			if r != b {
				bases = append(bases, r)
			}
		}
	}
	var buf [64]rune
	out := make([]string, 0, 2)
	for _, b := range bases {
		for _, v := range k.variants(b) {
			s := k.fold(v, buf[:])
			dup := s == ""
			for _, o := range out {
				if o == s {
					dup = true
					break
				}
			}
			if !dup {
				out = append(out, s)
			}
		}
	}
	sort.Strings(out)
	return out
}
