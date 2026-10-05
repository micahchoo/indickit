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
	} `json:"meetei"`
	OlChiki struct {
		From       rune              `json:"from"`
		To         rune              `json:"to"`
		Letters    map[string]string `json:"letters"`
		Aspiration string            `json:"aspiration"`
	} `json:"ol_chiki"`
	Latin struct {
		Groups  [][2]string       `json:"groups"`
		Letters map[string]string `json:"letters"`
	} `json:"latin"`
	ClassMap map[string]string `json:"class_map"`
	Vowels   string            `json:"vowels"`
	Steps    map[string]bool   `json:"steps"`
	Branches []struct {
		From  rune   `json:"from"`
		To    rune   `json:"to"`
		Class string `json:"class"`
		Also  string `json:"also"`
	} `json:"branches"`
	MaxKeys  int `json:"max_keys"`
	Suffixes []struct {
		From    rune     `json:"from"`
		To      rune     `json:"to"`
		Endings []string `json:"endings"`
	} `json:"suffixes"`
}

type branch struct {
	from, to    rune
	class, also rune
}

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
	olFrom, olTo             rune
	groups                   []group
	latin                    [128]rune // 0 = not coded
	isVowel                  map[rune]bool
	ngK, initialVowels       bool
	dropH, dropY, dropVowels bool
	dropFinalVowel           bool
	branches                 []branch
	suffixes                 []suffix
	maxKeys                  int
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
		isVowel: map[rune]bool{}, maxKeys: r.MaxKeys,
		ngK: r.Steps["ng-k"], initialVowels: r.Steps["initial-vowels-alike"],
		dropH: r.Steps["drop-h"], dropY: r.Steps["drop-y"], dropVowels: r.Steps["drop-vowels"],
		dropFinalVowel: r.Steps["drop-final-vowel"],
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
	for _, v := range r.Vowels {
		k.isVowel[v] = true
	}
	for _, b := range r.Branches {
		k.branches = append(k.branches, branch{b.From, b.To, one(b.Class), one(b.Also)})
	}
	for _, s := range r.Suffixes {
		k.suffixes = append(k.suffixes, suffix{s.From, s.To, s.Endings})
	}
	return k, nil
}

func (k *engine) readBrahmic(word string, out []rune) []rune {
	for _, ch := range word {
		if x, ok := k.extra[ch]; ok {
			out = append(out, x)
			continue
		}
		if ch < k.from || ch > k.to {
			continue
		}
		off := ch & 0x7f
		switch {
		case off == k.virama:
		case off == k.candra:
			out = append(out, k.candraClass)
		case k.byOffset[off] != 0:
			out = append(out, k.byOffset[off])
		}
	}
	return out
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
		return k.readTable(word, k.meetei, false, out)
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
			if c == b.class && len(vs)*2 <= k.maxKeys {
				n := len(vs)
				for _, v := range vs[:n] {
					w := append([]rune(nil), v...)
					w[i] = b.also
					vs = append(vs, w)
				}
			}
		}
	}
	return vs
}

// keys returns the sorted, distinct keys of one normalized word.
func (k *engine) keys(word string) []string {
	bases := []string{word}
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
	var buf [64]rune
	out := make([]string, 0, 2)
	for _, b := range bases {
		for _, v := range k.variants(b) {
			s := k.fold(v, buf[:])
			dup := false
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
