// Package deromanize writes Indian-language text from Latin typing, the
// reverse of romanize: namaste → नमस्ते, ahmad → احمد, vanakkam → வணக்கம்.
//
// It returns a ranked list: one typed word can stand for several native
// words (kamal: कमल, कमाल), and the first is the most likely. Two modes:
// Words, for running text (the default), and Names, for fields known to
// hold person names.
//
// It writes the word it is given in the language's script, so English words
// in mixed text ("kal meeting hai") are written in it too: identify each
// word's language first.
//
// The tables are learned from data and loaded per language: import the
// languages you need,
//
//	import _ "github.com/micahchoo/indickit/deromanize/lang/hi"
//
// and a program carries only their files. The output is deterministic.
package deromanize

import (
	"bytes"
	"cmp"
	_ "embed"
	"encoding/binary"
	"encoding/json"
	"math"
	"slices"
	"sort"
	"strings"
	"sync"
	"unicode"

	langtag "github.com/micahchoo/indickit/internal/lang"
	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/wellformed"
	"golang.org/x/text/unicode/norm"
)

//go:embed rules.json
var rulesJSON []byte

// Mode chooses the tables: Words for running text, Names for person names.
type Mode string

const (
	Words Mode = "words"
	Names Mode = "names"
)

type family struct {
	Tag    string `json:"tag"`
	Group  string `json:"group"`
	File   string `json:"file"`
	Pooled string `json:"pooled"`
}

var rules struct {
	Version        int                  `json:"version"`
	RulesVersion   string               `json:"rules_version"`
	Beam           int                  `json:"beam"`
	NBest          int                  `json:"nbest"`
	MaxN           int                  `json:"max_n"`
	MaxLetters     int                  `json:"max_letters"` // a longer word is written piece by piece (Word)
	Order          int                  `json:"order"`
	Bos            string               `json:"bos"`
	Eos            string               `json:"eos"`
	UnknownPenalty float64              `json:"unknown_penalty"`
	Alpha          map[Mode]float64     `json:"alpha"`
	Silent         string               `json:"silent"`
	CutModes       []Mode               `json:"cut_modes"` // the modes whose re-rank skips a cut-short spelling
	CutLangs       map[Mode][]string    `json:"cut_langs"` // per mode, the languages whose re-rank skips it too
	WfModes        []Mode               `json:"wf_modes"`  // the modes that put a broken spelling after every whole one
	Blocks         map[string]rune      `json:"blocks"`
	Groups         map[string][][2]rune `json:"groups"`
	Unify          struct {
		From    [2]rune `json:"from"`
		ToBlock rune    `json:"to_block"`
		Mask    rune    `json:"mask"`
	} `json:"unify"`
	Families map[Mode]map[string]family   `json:"families"`
	Lists    map[string]map[string]string `json:"lists"`
}

// RulesVersion changes whenever any output changes.
var RulesVersion string

func init() {
	if err := json.Unmarshal(rulesJSON, &rules); err != nil {
		panic("deromanize: rules.json: " + err.Error())
	}
	RulesVersion = rules.RulesVersion
}

var (
	mu     sync.Mutex
	files  = map[string][]byte{}      // file name → its bytes, from the lang packages
	tables = map[string]*mix{}        // family + "." + lang → its loaded tables
	pooled = map[string]*model{}      // pooled file name → its model, shared by a group
	lists  = map[string][]*wordList{} // lang + "." + mode → its word lists
)

// Register is called by the lang packages; a program does not call it.
func Register(file string, data []byte) {
	mu.Lock()
	files[file] = data
	mu.Unlock()
}

func families(mode Mode) []Mode {
	if mode == Names {
		return []Mode{Names, Words}
	}
	return []Mode{Words}
}

// Languages lists the codes whose files are imported, for one mode.
func Languages(mode Mode) []string {
	seen := map[string]bool{}
	var out []string
	for _, f := range families(mode) {
		for lang := range rules.Families[f] {
			if !seen[lang] && get(f, lang) != nil {
				seen[lang] = true
				out = append(out, lang)
			}
		}
	}
	sort.Strings(out)
	return out
}

// clean reads the input as the training pairs were read: accents removed,
// lower case, the letters a-z only.
func clean(s string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(stripMarks(s)) {
		if r >= 'a' && r <= 'z' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func stripMarks(s string) string {
	var b strings.Builder
	for _, r := range norm.NFD.String(s) {
		if !unicode.Is(unicode.Mn, r) && !unicode.Is(unicode.Me, r) && !unicode.Is(unicode.Mc, r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// Word returns up to n native spellings of one Latin-typed word (n ≤ 0
// means 4), most likely first. It returns nil when the language's files are
// not imported, or the word has no letter a-z.
func Word(latin, lang string, mode Mode, n int) []string {
	if n <= 0 {
		n = 4
	}
	c := langtag.Code(lang)
	w := clean(latin)
	if len(w) > rules.MaxLetters { // a-z only: bytes are letters
		// One spelling: each piece's first, joined. The beam's ties made a long run
		// quadratic (32K letters: 49 s); real words are far shorter.
		var b strings.Builder
		for i := 0; i < len(w); i += rules.MaxLetters {
			if s := Word(w[i:min(i+rules.MaxLetters, len(w))], lang, mode, 1); len(s) > 0 {
				b.WriteString(s[0])
			}
		}
		if b.Len() == 0 {
			return nil
		}
		return []string{b.String()}
	}
	best := candidates(w, c, mode)
	if best == nil {
		return nil
	}
	ranked := normalized(rerank(best, c, list(c, mode), rules.Alpha[mode], guarded(mode, c)), c)
	if slices.Contains(rules.WfModes, mode) {
		ranked = wholeFirst(ranked)
	}
	var out []string // a spelling that writes nothing is no suggestion: dropped, as in romanize
	for _, o := range ranked {
		if o != "" {
			out = append(out, o)
		}
	}
	return out[:min(n, len(out))]
}

// Text writes every run of Latin letters in text as its first native
// spelling, and keeps everything else as it is.
func Text(text, lang string, mode Mode) string { return write(text, lang, mode, false) }

// TextMixed is Text for mixed text such as Hinglish: a word in the
// language's English list stays as typed ("kal meeting hai" → "कल meeting
// है"). Only Hindi has a list; for another language it equals Text.
func TextMixed(text, lang string, mode Mode) string { return write(text, lang, mode, true) }

// English reports whether a Latin-typed word, read as Word reads it, is in
// the language's English list: an English word that a typist of the
// language writes in English. Only Hindi has a list; for another language,
// or when its package is not imported, it returns false.
func English(word, lang string) bool {
	_, ok := countOf(englishList(langtag.Code(lang)), clean(word))
	return ok
}

func write(text, lang string, mode Mode, keepEnglish bool) string {
	var b strings.Builder
	rs := []rune(text)
	for i := 0; i < len(rs); {
		if !isLatin(rs[i]) {
			b.WriteRune(rs[i])
			i++
			continue
		}
		j := i
		for j < len(rs) && isLatin(rs[j]) {
			j++
		}
		if keepEnglish && English(string(rs[i:j]), lang) {
			b.WriteString(string(rs[i:j]))
		} else if out := Word(string(rs[i:j]), lang, mode, 1); len(out) > 0 {
			b.WriteString(out[0])
		} else {
			b.WriteString(string(rs[i:j]))
		}
		i = j
	}
	return b.String()
}

// isLatin: a letter that reads as a-z once accents are removed, or a combining accent.
func isLatin(r rune) bool { return clean(string(r)) != "" || r >= 0x0300 && r <= 0x036F }

type scored struct {
	s   float64
	o   string
	cut bool // every path to o wrote nothing for a consonant (cuts): the re-rank skips it
}

func byScore(rs []scored) {
	sort.Slice(rs, func(p, q int) bool {
		if rs[p].s != rs[q].s {
			return rs[p].s > rs[q].s
		}
		return rs[p].o < rs[q].o
	})
}

// candidates decodes w with the mode's models; names mode merges both families,
// each string at its better score, full if either model writes it in full.
func candidates(w, lang string, mode Mode) []scored {
	if w == "" {
		return nil
	}
	merged := map[string]scored{}
	found := false
	for _, f := range families(mode) {
		x := get(f, lang)
		if x == nil {
			continue
		}
		found = true
		for _, r := range x.decode(w) {
			o := deunify(r.o, lang)
			if v, ok := merged[o]; !ok {
				merged[o] = scored{r.s, o, r.cut}
			} else {
				merged[o] = scored{max(v.s, r.s), o, v.cut && r.cut}
			}
		}
	}
	if !found {
		return nil
	}
	out := make([]scored, 0, len(merged))
	for _, v := range merged {
		out = append(out, v)
	}
	byScore(out)
	return out
}

// guarded: does the re-rank skip cut-short spellings? In the modes of rules "cut_modes"
// (names), and in a mode for the languages rules "cut_langs" lists under it (words: ks mni
// sa sd, each judged in its own language).
func guarded(mode Mode, lang string) bool {
	return slices.Contains(rules.CutModes, mode) || slices.Contains(rules.CutLangs[mode], lang)
}

// normalized: each spelling as normalize.Text writes it, in its place; a duplicate that
// results is dropped, the first kept (rules 2026-10-12.1). The output is normalized text:
// a spelling with a two-part vowel sign typed in the other order (জােট) is keyed as the
// frequent word (জোট) and took its count, and the user received a string normalize rewrites.
func normalized(ranked []string, lang string) []string {
	out := make([]string, 0, len(ranked))
	for _, o := range ranked {
		if o = normalize.Text(o, lang); !slices.Contains(out, o) {
			out = append(out, o)
		}
	}
	return out
}

// wholeFirst: the spellings a renderer draws whole first, then the broken ones, each in
// its order (rules "wf_modes"). Broken: wellformed.Check is false (a dotted circle: two
// vowel signs, a sign after a virama), or it holds punctuation (a danda learned inside a
// chunk: अभवत्।).
func wholeFirst(ranked []string) []string {
	out := make([]string, 0, len(ranked))
	var broken []string
	for _, o := range ranked {
		if wellformed.Check(o) && !strings.ContainsFunc(o, unicode.IsPunct) {
			out = append(out, o)
		} else {
			broken = append(broken, o)
		}
	}
	return append(out, broken...)
}

// rerank: known strings by log score + α · log(count) in the word list, then the
// rest in model order. A string is looked up by normalize.Text, then normalize.Fold.
// With guard, a cut-short string is not known, whatever the list says: a short,
// common string (murmu → മു) would otherwise take the bonus and come first.
func rerank(best []scored, lang string, lists []*wordList, alpha float64, guard bool) []string {
	var known []scored
	var rest []string
	for _, b := range best {
		if c, ok := countOf(lists, normalize.Fold(normalize.Text(b.o, lang), lang)); ok && !(guard && b.cut) {
			known = append(known, scored{b.s + alpha*math.Log(float64(c)), b.o, false})
		} else {
			rest = append(rest, b.o)
		}
	}
	byScore(known)
	out := make([]string, 0, len(best))
	for _, k := range known {
		out = append(out, k.o)
	}
	return append(out, rest...)
}

func deunify(w, lang string) string {
	base, ok := rules.Blocks[lang]
	if !ok {
		return w
	}
	rs := []rune(w)
	for i, r := range rs {
		if r >= 0x0900 && r <= 0x097F {
			rs[i] = base + r&0x7F
		}
	}
	return string(rs)
}

func groupOf(r rune) string {
	for g, ranges := range rules.Groups {
		for _, rg := range ranges {
			if r >= rg[0] && r <= rg[1] {
				return g
			}
		}
	}
	return ""
}

func get(f Mode, lang string) *mix {
	key := string(f) + "." + lang
	mu.Lock()
	defer mu.Unlock()
	if x, ok := tables[key]; ok {
		return x
	}
	l, ok := rules.Families[f][lang]
	if !ok || files[l.File] == nil || files[l.Pooled] == nil {
		return nil
	}
	pm, ok := pooled[l.Pooled]
	if !ok {
		r, strs := open(files[l.Pooled], "IKD1")
		pm = readModel(r, strs, &interner{ids: map[string]int32{}})
		pooled[l.Pooled] = pm
	}
	x := newMix(files[l.File], pm, l.Tag, l.Group)
	tables[key] = x
	return x
}

func list(lang string, mode Mode) []*wordList {
	key := lang + "." + string(mode)
	mu.Lock()
	defer mu.Unlock()
	if c, ok := lists[key]; ok {
		return c
	}
	var ls []*wordList
	kinds := []string{"words"}
	if mode == Names {
		kinds = append(kinds, "names")
	}
	for _, k := range kinds {
		if l := readList(rules.Lists[lang][k]); l != nil {
			ls = append(ls, l)
		}
	}
	lists[key] = ls
	return ls
}

func englishList(lang string) []*wordList {
	key := lang + ".english"
	mu.Lock()
	defer mu.Unlock()
	if c, ok := lists[key]; ok {
		return c
	}
	var ls []*wordList
	if l := readList(rules.Lists[lang]["english"]); l != nil {
		ls = append(ls, l)
	}
	lists[key] = ls
	return ls
}

// countOf is a string's count: the sum over the lists that hold it.
func countOf(ls []*wordList, s string) (int, bool) {
	sum, found := 0, false
	for _, l := range ls {
		if c, ok := l.get(s); ok {
			sum, found = sum+c, true
		}
	}
	return sum, found
}

// wordList is an IKL2 word list kept as bytes: the keys end to end, in byte order, and
// their counts (perf phase 8: a map of 200,000 strings was scanned by every GC cycle, a
// third of a call's time).
type wordList struct {
	keys   []byte
	ends   []int32 // key i is keys[ends[i-1]:ends[i]] (from 0 for the first)
	counts []int
}

func (l *wordList) key(i int) []byte {
	from := int32(0)
	if i > 0 {
		from = l.ends[i-1]
	}
	return l.keys[from:l.ends[i]]
}

func (l *wordList) get(s string) (int, bool) {
	i := sort.Search(len(l.ends), func(i int) bool { return string(l.key(i)) >= s })
	if i < len(l.ends) && string(l.key(i)) == s {
		return l.counts[i], true
	}
	return 0, false
}

// readList reads an IKL2 file: keys in byte order, front-coded (bytes shared with the
// previous key). A key twice is one key, its counts summed.
func readList(name string) *wordList {
	if name == "" || files[name] == nil {
		return nil
	}
	b := files[name]
	if !bytes.HasPrefix(b, []byte("IKL2")) {
		panic("deromanize: not an IKL2 file")
	}
	r := &reader{b: b, pos: 4}
	n := r.varint()
	l := &wordList{keys: make([]byte, 0, 2*len(b)), ends: make([]int32, 0, n), counts: make([]int, 0, n)}
	from := 0 // where the last key starts
	for ; n > 0; n-- {
		shared, size := r.varint(), len(l.keys)
		l.keys = append(l.keys, l.keys[from:from+shared]...)
		k := r.varint()
		l.keys = append(l.keys, r.b[r.pos:r.pos+k]...)
		r.pos += k
		count := r.varint()
		if len(l.ends) > 0 {
			switch c := bytes.Compare(l.keys[size:], l.keys[from:size]); {
			case c < 0:
				panic("deromanize: a word list out of byte order")
			case c == 0:
				l.counts[len(l.counts)-1] += count
				l.keys = l.keys[:size]
				continue
			}
		}
		l.ends = append(l.ends, int32(len(l.keys)))
		l.counts = append(l.counts, count)
		from = size
	}
	l.keys = slices.Clip(l.keys)
	return l
}

// ---- the file format (linguistic-utilities jobs/deromanize/export.py)

type reader struct {
	b   []byte
	pos int
}

func (r *reader) varint() int {
	v, n := binary.Uvarint(r.b[r.pos:])
	if n <= 0 {
		panic("deromanize: corrupt file")
	}
	r.pos += n
	return int(v)
}

func (r *reader) str() string {
	n := r.varint()
	s := string(r.b[r.pos : r.pos+n])
	r.pos += n
	return s
}

func open(b []byte, magic string) (*reader, []string) {
	if !bytes.HasPrefix(b, []byte(magic)) {
		panic("deromanize: not an " + magic + " file")
	}
	r := &reader{b: b, pos: 4}
	strs := make([]string, r.varint())
	for i := range strs {
		strs[i] = r.str()
	}
	return r, strs
}

// ---- the tables in memory: integer ids, pointer-free maps (the garbage collector
// never scans them). A context of the last one or two tokens is one uint64; a count is
// keyed by (context, token). A context's totals are the whole pooled model's (IKD1), so a
// group's file gives the whole model's probabilities. One interner per pooled file: its
// languages' own models hold only tokens the pooled model holds.

const idBits = 21 // up to 2M distinct tokens per script group

type interner struct {
	ids  map[string]int32
	strs []string
}

func (in *interner) id(s string) int32 {
	if v, ok := in.ids[s]; ok {
		return v
	}
	v := int32(len(in.strs))
	in.ids[s] = v
	in.strs = append(in.strs, s)
	return v
}

func ctxKey(ctx []int32) uint64 {
	var k uint64
	for _, t := range ctx {
		k = k<<idBits | uint64(t+1)
	}
	return k
}

// level is one order of a model, flat: a context's index by its key, and its
// continuations as one run of (token, count) pairs sorted by token (perf phase 8: one
// map entry per pair cost a hash lookup per probability).
type level struct {
	index     map[uint64]int32 // context → its index
	total, wb []float64        // by context: the whole model's total, and total / (total + types)
	start     []int32          // context i's pairs are start[i] .. start[i+1]
	tok       []int32
	count     []int32
	dense     []int32 // a level of one context (the unigrams): counts by token
}

// countOf is tok's count after context i.
func (lv *level) countOf(i, tok int32) int32 {
	if lv.dense != nil {
		if int(tok) < len(lv.dense) {
			return lv.dense[tok]
		}
		return 0
	}
	run := lv.tok[lv.start[i]:lv.start[i+1]]
	j, ok := slices.BinarySearch(run, tok)
	if !ok {
		return 0
	}
	return lv.count[int(lv.start[i])+j]
}

type model struct {
	vocab  int
	levels []level
	ids    *interner
	toks   []int32 // the unigram level's tokens
}

func readModel(r *reader, strs []string, in *interner) *model {
	m := &model{vocab: r.varint(), ids: in}
	type pair struct{ tok, count int32 }
	var run []pair
	for l := r.varint(); l > 0; l-- {
		n := r.varint()
		lv := level{index: make(map[uint64]int32, n), total: make([]float64, n), wb: make([]float64, n), start: make([]int32, n+1)}
		for c := 0; c < n; c++ {
			ctx := make([]int32, r.varint())
			for i := range ctx {
				ctx[i] = in.id(strs[r.varint()])
			}
			total, types := float64(r.varint()), float64(r.varint())
			run = run[:0]
			prev := 0
			for t := r.varint(); t > 0; t-- {
				prev += r.varint()
				tok := in.id(strs[prev])
				run = append(run, pair{tok, int32(r.varint())})
				if len(m.levels) == 0 {
					m.toks = append(m.toks, tok)
				}
			}
			slices.SortFunc(run, func(a, b pair) int { return int(a.tok - b.tok) })
			for _, p := range run {
				lv.tok = append(lv.tok, p.tok)
				lv.count = append(lv.count, p.count)
			}
			lv.index[ctxKey(ctx)] = int32(c)
			lv.total[c], lv.wb[c] = total, total/(total+types)
			lv.start[c+1] = int32(len(lv.tok))
		}
		if n == 1 && len(lv.tok) > 0 {
			lv.dense = make([]int32, lv.tok[len(lv.tok)-1]+1)
			for j, t := range lv.tok {
				lv.dense[t] = lv.count[j]
			}
		}
		m.levels = append(m.levels, lv)
	}
	if len(in.strs) >= 1<<idBits {
		panic("deromanize: vocabulary beyond the engine's limits")
	}
	return m
}

// ctxStats: one model's statistics for one context, at each order, computed once per
// hypothesis and used for every token that can follow it. A context present with no
// continuation still applies its discount (as the reference).
type ctxStats struct {
	at        [3]int32 // the context's index at order n; -1: the model has no such context
	total, wb [3]float64
}

func (m *model) stats(ctx []int32) ctxStats {
	c := ctxStats{at: [3]int32{-1, -1, -1}}
	for n := 0; n < len(m.levels); n++ {
		lv := &m.levels[n]
		if i, ok := lv.index[ctxKey(ctx[len(ctx)-n:])]; ok {
			c.at[n], c.total[n], c.wb[n] = i, lv.total[i], lv.wb[i]
		}
	}
	return c
}

// prob: Witten-Bell interpolation, lowest order first (as the reference).
func (m *model) prob(c *ctxStats, tok int32) float64 {
	p := 1.0 / float64(m.vocab+1)
	for n := 0; n < len(m.levels); n++ {
		if c.at[n] < 0 {
			continue
		}
		lam := c.wb[n]
		p = lam*float64(m.levels[n].countOf(c.at[n], tok))/c.total[n] + (1-lam)*p
	}
	return p
}

type option struct {
	tok    int32
	native string
}

// mix interpolates the language's own model with its script group's pooled model.
type mix struct {
	a, b    *model
	lam     float64
	start   []int32
	eos     int32
	options map[string][]option // Latin chunk → native chunks of the language's script, sorted
}

func newMix(own []byte, pool *model, tag, group string) *mix {
	x := &mix{b: pool}
	r, strs := open(own, "IKD1")
	x.lam = math.Float64frombits(binary.LittleEndian.Uint64(r.b[r.pos:]))
	r.pos += 8
	x.a = readModel(r, strs, pool.ids)
	for i := 0; i < rules.Order-2; i++ {
		x.start = append(x.start, pool.ids.id(rules.Bos))
	}
	x.start = append(x.start, pool.ids.id("<s:"+tag+">"))
	x.eos = pool.ids.id(rules.Eos)
	x.options = map[string][]option{}
	for _, tk := range pool.toks {
		t := pool.ids.strs[tk]
		i := strings.Index(t, "|")
		if i < 0 {
			continue
		}
		ok := true
		for _, c := range t[i+1:] {
			if g := groupOf(c); g != "" && g != group {
				ok = false
				break
			}
		}
		if ok {
			x.options[t[:i]] = append(x.options[t[:i]], option{tk, t[i+1:]})
		}
	}
	for k, v := range x.options {
		sort.Slice(v, func(p, q int) bool { return v[p].native < v[q].native })
		x.options[k] = v
	}
	return x
}

func (x *mix) logp(sa, sb *ctxStats, tok int32) float64 {
	return math.Log(x.lam*x.a.prob(sa, tok) + (1-x.lam)*x.b.prob(sb, tok))
}

// A spelling is a chain: each hypothesis holds its parent and the piece it
// adds, and a whole string is built only at the last position. A copy of the
// whole string in every candidate made a long word cost (length)^2 in time
// and memory (perf job, phase 1).
type hyp struct {
	score  float64
	parent *hyp
	piece  string
	at     int // letters read: the root 0
	ctx    []int32
	cut    bool // the path wrote nothing for a consonant (cuts)
}

// cand is a hypothesis before the beam cut: its context is built only if it survives.
type cand struct {
	score  float64
	parent *hyp
	piece  string
	tok    int32 // -1 for an unknown character: the context does not move
	idx    int   // insertion order, the stable sort's last key
	cut    bool
}

// spelling: the pieces from the root to h, joined.
func (h *hyp) spelling() string {
	var pieces []string
	for p := h; p != nil; p = p.parent {
		pieces = append(pieces, p.piece)
	}
	var b strings.Builder
	for i := len(pieces) - 1; i >= 0; i-- {
		b.WriteString(pieces[i])
	}
	return b.String()
}

// compareSpellings orders two spellings as strings.Compare does. They share
// the spelling of their nearest common hypothesis, so only the pieces after
// it are read: a few letters, where a whole spelling is the word so far.
func compareSpellings(a, b *cand) int {
	ra, rb := []string{a.piece}, []string{b.piece}
	pa, pb := a.parent, b.parent
	for pa != pb {
		switch {
		case pb == nil || pa != nil && pa.at > pb.at:
			ra, pa = append(ra, pa.piece), pa.parent
		case pa == nil || pb.at > pa.at:
			rb, pb = append(rb, pb.piece), pb.parent
		default:
			ra, pa = append(ra, pa.piece), pa.parent
			rb, pb = append(rb, pb.piece), pb.parent
		}
	}
	join := func(r []string) string {
		var b strings.Builder
		for i := len(r) - 1; i >= 0; i-- {
			b.WriteString(r[i])
		}
		return b.String()
	}
	return strings.Compare(join(ra), join(rb))
}

// cuts: does writing nothing for w[i:i+k] cut the word short? Yes if one of its
// letters is a consonant that does not repeat the letter before it (tt, mm: one
// sound). The letters that may write nothing are rules.Silent: the vowels, h
// (aspiration is written with the consonant before it), y and w (a glide fuses
// into a vowel sign).
func cuts(w []rune, i, k int) bool {
	for j := i; j < i+k; j++ {
		if !strings.ContainsRune(rules.Silent, w[j]) && !(j > 0 && w[j] == w[j-1]) {
			return true
		}
	}
	return false
}

func before(a, b *cand) bool { // the reference's stable sort: score down, spelling up, then insertion
	if a.score != b.score {
		return a.score > b.score
	}
	if c := compareSpellings(a, b); c != 0 {
		return c < 0
	}
	return a.idx < b.idx
}

func (c *cand) context(h int) []int32 {
	if c.tok < 0 {
		return c.parent.ctx
	}
	ctx := append(append(make([]int32, 0, len(c.parent.ctx)+1), c.parent.ctx...), c.tok)
	return ctx[len(ctx)-h:]
}

// beam holds the first k candidates of one position in the stable sort's
// order, kept as they arrive: the same k that sorting them all gives. n counts
// every candidate, for the insertion order. With all set, it keeps every
// candidate (the last position, where the end-of-word score reorders them).
type beam struct {
	k     int
	all   bool
	n     int
	best  []*cand
	every []cand // with all set: every candidate, by value (no allocation each)
}

// lpCache: one context's statistics and its options' log probabilities, by chunk length.
type lpCache struct {
	sa, sb ctxStats
	lp     [][]float64
}

// closed: no candidate scoring at most s (with a margin for rounding: a mixed
// probability can pass 1 by an ulp) can enter. The last position keeps all.
func (bm *beam) closed(s float64) bool {
	return !bm.all && len(bm.best) == bm.k && s+1e-9 < bm.best[bm.k-1].score
}

func (bm *beam) add(c cand) {
	c.idx = bm.n
	bm.n++
	full := !bm.all && len(bm.best) == bm.k
	if full && c.score < bm.best[bm.k-1].score {
		return // the common case: nothing is built for a candidate that loses
	}
	if bm.all {
		bm.every = append(bm.every, c)
		return
	}
	p := new(cand)
	*p = c
	if full && !before(p, bm.best[bm.k-1]) {
		return
	}
	j := sort.Search(len(bm.best), func(q int) bool { return before(p, bm.best[q]) })
	if !full {
		bm.best = append(bm.best, nil)
	}
	copy(bm.best[j+1:], bm.best[j:])
	bm.best[j] = p
}

// decode: beam search over the ways to cut w into Latin chunks; the NBest spellings
// (in the unified block) with their scores. A spelling is cut when every path that
// reaches it wrote nothing for a consonant.
func (x *mix) decode(word string) []scored {
	w := []rune(word)
	h := rules.Order - 1
	root := &hyp{ctx: x.start}
	beams := make([]beam, len(w)+1)
	for i := range beams {
		beams[i] = beam{k: rules.Beam, all: i == len(w)}
	}
	beams[0].add(cand{tok: -1})
	opts := make([][]option, rules.MaxN+1) // the options of w[i:i+k], by k
	for i := 0; i < len(w); i++ {
		seen := map[uint64]*lpCache{} // by context, at this position: options are this position's
		for _, c := range beams[i].best {
			// A log probability is at most 0, so no candidate of c scores above c. Where the
			// next beam's 40th already scores above c, nothing of c can enter: its options are
			// counted (insertion order) and not scored. The beams are read best first, so this
			// skips most of the work (perf job, phase 6).
			moved, open := false, false
			for k := 1; k <= rules.MaxN && i+k <= len(w); k++ {
				opts[k] = x.options[string(w[i:i+k])]
				if len(opts[k]) > 0 {
					moved = true
					open = open || !beams[i+k].closed(c.score)
				}
			}
			if moved && !open {
				for k := 1; k <= rules.MaxN && i+k <= len(w); k++ {
					beams[i+k].n += len(opts[k])
				}
				continue
			}
			hy := root
			if i > 0 {
				hy = &hyp{c.score, c.parent, c.piece, i, c.context(h), c.cut}
			}
			if !moved {
				beams[i+1].add(cand{score: hy.score - rules.UnknownPenalty, parent: hy, tok: -1, cut: hy.cut || cuts(w, i, 1)})
				continue
			}
			// Hypotheses here that share a context share every option's log probability:
			// computed once per context (the same function on the same inputs: the same floats).
			e := seen[ctxKey(hy.ctx)]
			if e == nil {
				e = &lpCache{sa: x.a.stats(hy.ctx), sb: x.b.stats(hy.ctx), lp: make([][]float64, rules.MaxN+1)}
				seen[ctxKey(hy.ctx)] = e
			}
			for k := 1; k <= rules.MaxN && i+k <= len(w); k++ {
				if beams[i+k].closed(hy.score) {
					beams[i+k].n += len(opts[k])
					continue
				}
				if e.lp[k] == nil {
					e.lp[k] = make([]float64, len(opts[k]))
					for j, o := range opts[k] {
						e.lp[k][j] = x.logp(&e.sa, &e.sb, o.tok)
					}
				}
				for j, o := range opts[k] {
					beams[i+k].add(cand{score: hy.score + e.lp[k][j], parent: hy, piece: o.native, tok: o.tok,
						cut: hy.cut || o.native == "" && cuts(w, i, k)})
				}
			}
		}
	}
	// The last position keeps every candidate (thousands for a short word), but only the
	// NBest best spellings are returned. Each candidate's final score needs no string: the
	// end-of-word log probability, once per context. The spellings are then built best
	// first, and the walk stops at the first score below the NBest-th: no candidate after it
	// can enter, and a spelling's first candidate holds its best score (perf phase 8:
	// building every spelling was most of a call's memory). Equal scores go on: a tie is
	// ordered by its string.
	every := beams[len(w)].every
	eos := map[uint64]float64{}
	fin := make([]float64, len(every))
	order := make([]int32, len(every))
	for i := range every {
		c := &every[i]
		ctx := x.start
		if c.parent != nil {
			ctx = c.context(h)
		}
		key := ctxKey(ctx)
		lp, ok := eos[key]
		if !ok {
			sa, sb := x.a.stats(ctx), x.b.stats(ctx)
			lp = x.logp(&sa, &sb, x.eos)
			eos[key] = lp
		}
		fin[i], order[i] = c.score+lp, int32(i)
	}
	slices.SortFunc(order, func(p, q int32) int { return cmp.Compare(fin[q], fin[p]) })
	spelled := map[*hyp]string{}
	spell := func(c *cand) string {
		if c.parent == nil {
			return c.piece
		}
		ps, ok := spelled[c.parent]
		if !ok {
			ps = c.parent.spelling()
			spelled[c.parent] = ps
		}
		return ps + c.piece
	}
	at := map[string]int{} // a spelling's place in out
	var out []scored
	j := 0
	for ; j < len(order); j++ {
		s := fin[order[j]]
		if len(out) >= rules.NBest && s < out[rules.NBest-1].s {
			break
		}
		c := &every[order[j]]
		o := spell(c)
		if k, ok := at[o]; ok {
			out[k].cut = out[k].cut && c.cut
			continue
		}
		at[o] = len(out)
		out = append(out, scored{s, o, c.cut})
	}
	// A spelling is cut only if every path to it is: a candidate left may still clear one.
	if slices.ContainsFunc(out, func(v scored) bool { return v.cut }) {
		for ; j < len(order); j++ {
			if c := &every[order[j]]; !c.cut {
				if k, ok := at[spell(c)]; ok {
					out[k].cut = false
				}
			}
		}
	}
	byScore(out)
	if len(out) > rules.NBest {
		out = out[:rules.NBest]
	}
	return out
}
