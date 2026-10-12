// Package romanize writes Indian-language text in Latin letters the way
// people spell it: लक्ष्मी → lakshmi, മലൈക → malaika, پرویز → parvez.
//
// It returns a ranked list: one word has several accepted spellings
// (Choudhury, Chowdhury), and the first is the most likely. Three modes:
// Words, for running text (the default); Names, for fields known to hold
// person names, where a lookup of known names comes first; and Places, for
// place names (its own tables in nine languages, the Words tables in the
// others).
//
// The tables are learned from data (see the README for what, and how good
// they are) and loaded per language: import the languages you need,
//
//	import _ "github.com/micahchoo/indickit/romanize/lang/hi"
//
// and a program carries only their files. The output is deterministic:
// the same input gives the same list on every platform.
package romanize

import (
	"bytes"
	"cmp"
	_ "embed"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"math"
	"slices"
	"sort"
	"strings"
	"sync"

	langtag "github.com/micahchoo/indickit/internal/lang"
	"github.com/micahchoo/indickit/internal/unidata"
	"github.com/micahchoo/indickit/internal/unorm"
)

//go:embed rules.json
var rulesJSON []byte

// Mode chooses the tables: Words for running text, Names for person names,
// Places for place names.
type Mode string

const (
	Words Mode = "words"
	Names Mode = "names"
	// Places has its own tables for Bengali, Hindi, Malayalam, Marathi,
	// Odia, Santali, Tamil, Telugu and Urdu, learned from Wikidata place
	// names and village names; every other language uses its Words tables.
	Places Mode = "places"
)

var rules struct {
	Version        int          `json:"version"`
	RulesVersion   string       `json:"rules_version"`
	Beam           map[Mode]int `json:"beam"`
	MaxN           int          `json:"max_n"`
	MaxLetters     int          `json:"max_letters"` // a longer word is romanized piece by piece (Word)
	Order          int          `json:"order"`
	Bos            string       `json:"bos"`
	Eos            string       `json:"eos"`
	UnknownPenalty float64      `json:"unknown_penalty"`
	Unify          struct {
		From    [2]rune `json:"from"`
		ToBlock rune    `json:"to_block"`
		Mask    rune    `json:"mask"`
	} `json:"unify"`
	Groups   map[string][][2]rune `json:"groups"`
	Families map[Mode]map[string]struct {
		Tag    string `json:"tag"`
		Group  string `json:"group"`
		File   string `json:"file"`
		Pooled string `json:"pooled"`
	} `json:"families"`
	// Rescore, by mode (Names): the letter n-gram that reorders the list (rules
	// 2026-10-12), its file in lang/shared, and the knobs: the list of Depth spellings
	// by alignment score, each plus Beta × the log probability of its letters.
	Rescore map[Mode]struct {
		File  string  `json:"file"`
		Beta  float64 `json:"beta"`
		Depth int     `json:"depth"`
		Order int     `json:"order"`
		Bos   string  `json:"bos"`
		Eos   string  `json:"eos"`
	} `json:"rescore"`
}

// RulesVersion changes whenever any output changes: store it beside
// romanized text, and romanize again when it differs.
var RulesVersion string

func init() {
	if err := json.Unmarshal(rulesJSON, &rules); err != nil {
		panic("romanize: rules.json: " + err.Error())
	}
	RulesVersion = rules.RulesVersion
}

var (
	mu     sync.Mutex
	files  = map[string][]byte{}    // file name → its bytes, from the lang packages
	tables = map[string]*mix{}      // lang + "." + mode → its loaded tables
	pooled = map[string]*model{}    // pooled file name → its model
	lms    = map[string]*letterLM{} // rescore file name → its letter n-gram
)

// Register is called by the lang packages; a program does not call it.
func Register(file string, data []byte) {
	mu.Lock()
	files[file] = data
	mu.Unlock()
}

// Languages lists the codes whose files are imported, for one mode.
func Languages(mode Mode) []string {
	mu.Lock()
	defer mu.Unlock()
	var out []string
	for lang, l := range rules.Families[mode] {
		if files[l.File] != nil && files[l.Pooled] != nil && rescoreFile(mode) {
			out = append(out, lang)
		}
	}
	sort.Strings(out)
	return out
}

// rescoreFile: the mode's letter n-gram is imported, or the mode has none (mu held).
func rescoreFile(mode Mode) bool {
	rc, ok := rules.Rescore[mode]
	return !ok || files[rc.File] != nil
}

// Word returns up to n spellings of one word (n ≤ 0 means 4), most likely
// first. It returns nil when the language's files are not imported for
// this mode, or the word has none of the language's letters. Joiners
// (U+200C, U+200D) are deleted first: they shape a letter and spell nothing.
func Word(word, lang string, mode Mode, n int) []string {
	if n <= 0 {
		n = 4
	}
	x := get(langtag.Code(lang), mode)
	if x == nil {
		return nil
	}
	w := stripJoiners(unorm.NFC(word))
	if rs := []rune(w); len(rs) > rules.MaxLetters {
		// One spelling: each piece's first, joined. The beam's ties made a long run
		// quadratic (32K code points: 49 s); real words are far shorter.
		var b strings.Builder
		for i := 0; i < len(rs); i += rules.MaxLetters {
			if s := Word(string(rs[i:min(i+rules.MaxLetters, len(rs))]), lang, mode, 1); len(s) > 0 {
				b.WriteString(s[0])
			}
		}
		if b.Len() == 0 {
			return nil
		}
		return []string{b.String()}
	}
	if s, ok := x.lookup[w]; ok {
		return append([]string(nil), s[:min(n, len(s))]...)
	}
	var out []string
	for _, s := range x.decode(unify(w), n) {
		if s != "" { // a word with none of the table's letters romanizes to nothing
			out = append(out, s)
		}
	}
	return out
}

// Text romanizes every run of the language's script in text (top spelling
// of each word) and keeps everything else as it is.
func Text(text, lang string, mode Mode) string {
	c := langtag.Code(lang)
	l, ok := rules.Families[mode][c]
	if !ok || get(c, mode) == nil {
		return text
	}
	ranges := rules.Groups[l.Group]
	in := func(r rune) bool {
		if r == 0x200C || r == 0x200D {
			return true
		}
		for _, rng := range ranges {
			if r >= rng[0] && r <= rng[1] {
				return true
			}
		}
		return false
	}
	var b strings.Builder
	rs := []rune(unorm.NFC(text))
	for i := 0; i < len(rs); {
		if !in(rs[i]) || !(unidata.IsLetter(rs[i]) || unidata.IsMark(rs[i])) {
			b.WriteRune(rs[i])
			i++
			continue
		}
		j := i
		for j < len(rs) && in(rs[j]) && (unidata.IsLetter(rs[j]) || unidata.IsMark(rs[j]) || rs[j] == 0x200C || rs[j] == 0x200D) {
			j++
		}
		if out := Word(string(rs[i:j]), c, mode, 1); len(out) > 0 {
			b.WriteString(out[0])
		} else {
			b.WriteString(string(rs[i:j]))
		}
		i = j
	}
	return b.String()
}

// stripJoiners deletes ZWNJ and ZWJ. The tables hold a "\u200d" → "" chunk from the
// training text; left in place, a joiner puts the beam on the path that spells every
// chunk before it as "", and the letters before the joiner are lost. The reference
// (jsm.Model.decode) deletes them the same way.
func stripJoiners(s string) string {
	return strings.Map(func(r rune) rune {
		if r == 0x200C || r == 0x200D {
			return -1
		}
		return r
	}, s)
}

// unify moves every Brahmic code point to the Devanagari block by its offset:
// one table serves every Brahmic script (rules.json "unify").
func unify(w string) string {
	u := rules.Unify
	rs := []rune(w)
	for i, r := range rs {
		if r >= u.From[0] && r <= u.From[1] {
			rs[i] = u.ToBlock + r&u.Mask
		}
	}
	return string(rs)
}

func get(lang string, mode Mode) *mix {
	mu.Lock()
	defer mu.Unlock()
	l, ok := rules.Families[mode][lang]
	if !ok || files[l.File] == nil || files[l.Pooled] == nil || !rescoreFile(mode) {
		return nil
	}
	// keyed by the tables, not the mode: Places reuses the Words tables of most languages
	rc, rescored := rules.Rescore[mode]
	key := fmt.Sprintf("%s|%s|%s|%d|%s", l.File, l.Pooled, l.Tag, rules.Beam[mode], rc.File)
	if x, ok := tables[key]; ok {
		return x
	}
	x := newMix(files[l.File], files[l.Pooled], l.Tag, rules.Beam[mode])
	if rescored {
		lm, ok := lms[rc.File]
		if !ok {
			lm = readLetterLM(files[rc.File], rc.Order, rc.Bos, rc.Eos)
			lms[rc.File] = lm
		}
		x.lm, x.beta, x.depth = lm, rc.Beta, rc.Depth
	}
	tables[key] = x
	return x
}

// ---- the file format (linguistic-utilities jobs/romanize/export.py)

type reader struct {
	b   []byte
	pos int
}

func (r *reader) varint() int {
	v, n := binary.Uvarint(r.b[r.pos:])
	if n <= 0 {
		panic("romanize: corrupt file")
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

func open(b []byte) (*reader, []string) {
	if !bytes.HasPrefix(b, []byte("IKR1")) {
		panic("romanize: not an IKR1 file")
	}
	r := &reader{b: b, pos: 4}
	strs := make([]string, r.varint())
	for i := range strs {
		strs[i] = r.str()
	}
	return r, strs
}

// ---- the tables in memory: integer ids, pointer-free maps (the garbage
// collector never scans them). A context of the last one or two tokens is
// one uint64; a count is keyed by (context, token).

const idBits = 21 // up to 2M distinct tokens per language

// level is one order of a model, flat: a context's index by its key, and its
// continuations as one run of (token, count) pairs sorted by token (perf phase 8: one
// map entry per pair cost a hash lookup per probability).
type level struct {
	index     map[uint64]int32 // context → its index
	total, wb []float64        // by context: total count, and total / (total + types)
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
	toks   []int32 // the unigram level's tokens, in file order
}

// interner gives one id per token string, shared by a language's two models.
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

func ctxKey(ctx []int32) uint64 { // the last tokens, most recent lowest
	var k uint64
	for _, t := range ctx {
		k = k<<idBits | uint64(t+1)
	}
	return k
}

func readModel(r *reader, strs []string, in *interner) *model {
	m := &model{vocab: r.varint()}
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
			var total float64
			run = run[:0]
			prev := 0
			for t := r.varint(); t > 0; t-- {
				prev += r.varint()
				k := r.varint()
				tok := in.id(strs[prev])
				run = append(run, pair{tok, int32(k)})
				total += float64(k) // in file order, as before: the same float
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
			lv.total[c], lv.wb[c] = total, total/(total+float64(len(run)))
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
	return m
}

// letterLM is the names mode's letter n-gram (rules 2026-10-12; jsm.LetterLM): a
// Witten-Bell model over the training English spellings, letters as tokens, read from
// the same file format. Few tokens and short contexts: plain maps keyed by the context's
// letters, looked up a few hundred times a word.
type letterLM struct {
	order    int
	vocab    int
	bos, eos string
	levels   []map[string]*lmCtx // level n: the last n letters → its continuations
}

type lmCtx struct {
	total, wb float64 // total count, and the Witten-Bell weight total / (total + types)
	count     map[string]int32
}

func readLetterLM(b []byte, order int, bos, eos string) *letterLM {
	r, strs := open(b)
	lm := &letterLM{order: order, bos: bos, eos: eos, vocab: r.varint()}
	for l := r.varint(); l > 0; l-- {
		lv := map[string]*lmCtx{}
		for c := r.varint(); c > 0; c-- {
			var key strings.Builder
			for i := r.varint(); i > 0; i-- {
				key.WriteString(strs[r.varint()])
			}
			e := &lmCtx{count: map[string]int32{}}
			prev := 0
			for t := r.varint(); t > 0; t-- {
				prev += r.varint()
				k := int32(r.varint())
				e.count[strs[prev]] = k
				e.total += float64(k)
			}
			e.wb = e.total / (e.total + float64(len(e.count)))
			lv[key.String()] = e
		}
		lm.levels = append(lm.levels, lv)
	}
	return lm
}

// logp of a spelling: the sum over its letters and the end token of the Witten-Bell
// probability, lowest order first, as prob (the reference: jsm.LetterLM.logp).
func (lm *letterLM) logp(s string) float64 {
	toks := make([]string, 0, lm.order+len(s))
	for i := 0; i < lm.order-1; i++ {
		toks = append(toks, lm.bos)
	}
	for _, c := range s {
		toks = append(toks, string(c))
	}
	toks = append(toks, lm.eos)
	sum := 0.0
	for i := lm.order - 1; i < len(toks); i++ {
		p := 1.0 / float64(lm.vocab+1)
		for n := 0; n < lm.order && n < len(lm.levels); n++ {
			e, ok := lm.levels[n][strings.Join(toks[i-n:i], "")]
			if !ok {
				continue
			}
			p = e.wb*float64(e.count[toks[i]])/e.total + (1-e.wb)*p
		}
		sum += math.Log(p)
	}
	return sum
}

// ctxStats are one model's statistics for one context, at each order: computed once per
// hypothesis, then used for every token that can follow it.
type ctxStats struct {
	at        [3]int32   // the context's index at order n; -1: none, or a context with no continuation
	total, wb [3]float64 // total count, and the Witten-Bell weight total / (total + types)
}

func (m *model) stats(ctx []int32) ctxStats {
	c := ctxStats{at: [3]int32{-1, -1, -1}}
	for n := 0; n < len(m.levels); n++ {
		lv := &m.levels[n]
		if i, ok := lv.index[ctxKey(ctx[len(ctx)-n:])]; ok && lv.start[i+1] != lv.start[i] {
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

// option is one way to write a native chunk: its token and its English letters.
type option struct {
	tok int32
	en  string
}

// mix interpolates the language's own model with its script group's pooled model.
type mix struct {
	a, b    *model
	lam     float64
	ids     *interner
	beam    int
	start   []int32
	eos     int32
	options map[string][]option // native chunk → its options, English sorted
	lookup  map[string][]string
	// the names mode's rescoring (rules 2026-10-12): the depth best spellings by
	// alignment score are reordered by score + beta × lm.logp(spelling)
	lm    *letterLM
	beta  float64
	depth int
}

func newMix(own, pool []byte, tag string, beam int) *mix {
	in := &interner{ids: map[string]int32{}}
	x := &mix{ids: in, beam: beam, lookup: map[string][]string{}}
	r, strs := open(pool)
	x.b = readModel(r, strs, in)
	r, strs = open(own)
	x.lam = math.Float64frombits(binary.LittleEndian.Uint64(r.b[r.pos:]))
	r.pos += 8
	x.a = readModel(r, strs, in)
	for k := r.varint(); k > 0; k-- {
		native := r.str()
		sp := make([]string, r.varint())
		for i := range sp {
			sp[i] = strs[r.varint()]
		}
		x.lookup[native] = sp
	}
	for i := 0; i < rules.Order-2; i++ {
		x.start = append(x.start, in.id(rules.Bos))
	}
	x.start = append(x.start, in.id("<s:"+tag+">"))
	x.eos = in.id(rules.Eos)
	// the options of a chunk: every unigram token "chunk|english" of either model but the end token
	seen := map[int32]bool{}
	x.options = map[string][]option{}
	for _, m := range []*model{x.a, x.b} {
		for _, t := range m.toks {
			if t == x.eos || seen[t] {
				continue
			}
			seen[t] = true
			s := in.strs[t]
			i := strings.Index(s, "|")
			x.options[s[:i]] = append(x.options[s[:i]], option{t, s[i+1:]})
		}
	}
	for k, v := range x.options {
		sort.Slice(v, func(p, q int) bool { return v[p].en < v[q].en })
		x.options[k] = v
	}
	if len(x.start) > 2 || len(in.strs) >= 1<<idBits {
		panic("romanize: order or vocabulary beyond the engine's limits")
	}
	return x
}

// logp of tok after the context whose statistics are sa (own model) and sb (pooled).
func (x *mix) logp(sa, sb *ctxStats, tok int32) float64 {
	pa := math.Exp(math.Log(x.a.prob(sa, tok)))
	pb := math.Exp(math.Log(x.b.prob(sb, tok)))
	return math.Log(x.lam*pa + (1-x.lam)*pb)
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
}

// cand is a hypothesis before the beam cut: its context is built only if it survives.
type cand struct {
	score  float64
	parent *hyp
	piece  string
	tok    int32 // -1 for an unknown character: the context does not move
	idx    int   // insertion order, the stable sort's last key
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

func before(a, b *cand) bool { // the stable sort's order: score down, spelling up, then insertion
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

// scored is one spelling and its score: the alignment's log probability, or, after the
// names mode's rescoring, that plus beta × the letter n-gram's.
type scored struct {
	s float64
	o string
}

func sortScored(rs []scored) { // score down, then the string up: the reference's order
	sort.Slice(rs, func(p, q int) bool {
		if rs[p].s != rs[q].s {
			return rs[p].s > rs[q].s
		}
		return rs[p].o < rs[q].o
	})
}

// decode: beam search over the ways to cut w into chunks; the n best spellings. With a
// letter n-gram (names, rules 2026-10-12), the max(n, depth) best by alignment score are
// built, each scores alignment + beta × the n-gram's log probability of its letters, and
// the n best of that order are returned (ties by the string): jsm.decode_rescored.
func (x *mix) decode(word string, n int) []string {
	if n <= 0 {
		return []string{}
	}
	rs := x.beamSearch(word, max(n, x.depth))
	if x.lm != nil {
		for i := range rs {
			rs[i].s += x.beta * x.lm.logp(rs[i].o)
		}
		sortScored(rs)
	}
	out := make([]string, 0, n)
	for i := 0; i < len(rs) && i < n; i++ {
		out = append(out, rs[i].o) // as the reference: an empty spelling stays in the list
	}
	return out
}

// beamSearch: the n best spellings of word by alignment score, with their scores.
func (x *mix) beamSearch(word string, n int) []scored {
	w := []rune(stripJoiners(word))
	h := rules.Order - 1
	root := &hyp{ctx: x.start}
	beams := make([]beam, len(w)+1)
	for i := range beams {
		beams[i] = beam{k: x.beam, all: i == len(w)}
	}
	beams[0].add(cand{tok: -1})
	opts := make([][]option, rules.MaxN+1) // the options of w[i:i+k], by k
	for i := 0; i < len(w); i++ {
		seen := map[uint64]*lpCache{} // by context, at this position: options are this position's
		for _, c := range beams[i].best {
			// A log probability is at most 0, so no candidate of c scores above c. Where the
			// next beam's last place already scores above c, nothing of c can enter: its
			// options are counted (insertion order) and not scored (perf job, phase 6).
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
				hy = &hyp{score: c.score, parent: c.parent, piece: c.piece, at: i, ctx: c.context(h)}
			}
			if !moved {
				beams[i+1].add(cand{score: hy.score - rules.UnknownPenalty, parent: hy, tok: -1})
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
					beams[i+k].add(cand{score: hy.score + e.lp[k][j], parent: hy, piece: o.en, tok: o.tok})
				}
			}
		}
	}
	// The last position keeps every candidate, but only the n best spellings are
	// returned. Each candidate's final score needs no string: the end-of-word log
	// probability, once per context. The spellings are then built best first, and the
	// walk stops at the first score below the n-th: no candidate after it can enter, and a
	// spelling's first candidate holds its best score (perf phase 8: building every
	// spelling was most of a call's memory). Equal scores go on: a tie is ordered by its string.
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
	var rs []scored
	seen := map[string]bool{}
	spelled := map[*hyp]string{}
	for _, i := range order {
		s := fin[i]
		if len(rs) >= n && s < rs[n-1].s {
			break
		}
		c := &every[i]
		o := c.piece
		if c.parent != nil {
			ps, ok := spelled[c.parent]
			if !ok {
				ps = c.parent.spelling()
				spelled[c.parent] = ps
			}
			o = ps + c.piece
		}
		if !seen[o] {
			seen[o] = true
			rs = append(rs, scored{s, o})
		}
	}
	sortScored(rs)
	if len(rs) > n {
		rs = rs[:n]
	}
	return rs
}
