// Package romanize writes Indian-language text in Latin letters the way
// people spell it: लक्ष्मी → lakshmi, മലൈക → malaika, پرویز → parvez.
//
// It returns a ranked list: one word has several accepted spellings
// (Choudhury, Chowdhury), and the first is the most likely. Two modes:
// Words, for running text (the default), and Names, for fields known to
// hold person names, where a lookup of known names comes first.
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
	_ "embed"
	"encoding/binary"
	"encoding/json"
	"math"
	"sort"
	"strings"
	"sync"
	"unicode"

	langtag "github.com/micahchoo/indickit/internal/lang"
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

var rules struct {
	Version        int          `json:"version"`
	RulesVersion   string       `json:"rules_version"`
	Beam           map[Mode]int `json:"beam"`
	MaxN           int          `json:"max_n"`
	Order          int          `json:"order"`
	Bos            string       `json:"bos"`
	Eos            string       `json:"eos"`
	UnknownPenalty float64      `json:"unknown_penalty"`
	Unify          struct {
		From    [2]rune `json:"from"`
		ToBlock rune    `json:"to_block"`
		Mask    rune    `json:"mask"`
	} `json:"unify"`
	Groups   map[string][2]rune `json:"groups"`
	Families map[Mode]map[string]struct {
		Tag    string `json:"tag"`
		Group  string `json:"group"`
		File   string `json:"file"`
		Pooled string `json:"pooled"`
	} `json:"families"`
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
	files  = map[string][]byte{} // file name → its bytes, from the lang packages
	tables = map[string]*mix{}   // lang + "." + mode → its loaded tables
	pooled = map[string]*model{} // pooled file name → its model
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
		if files[l.File] != nil && files[l.Pooled] != nil {
			out = append(out, lang)
		}
	}
	sort.Strings(out)
	return out
}

func code(lang string) string {
	c := langtag.Code(lang)
	if c == "kok" {
		return "gom"
	}
	return c
}

// Word returns up to n spellings of one word (n ≤ 0 means 4), most likely
// first. It returns nil when the language's files are not imported for
// this mode, or the word has none of the language's letters.
func Word(word, lang string, mode Mode, n int) []string {
	if n <= 0 {
		n = 4
	}
	x := get(code(lang), mode)
	if x == nil {
		return nil
	}
	w := norm.NFC.String(word)
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
	c := code(lang)
	l, ok := rules.Families[mode][c]
	if !ok || get(c, mode) == nil {
		return text
	}
	rng := rules.Groups[l.Group]
	in := func(r rune) bool {
		return r >= rng[0] && r <= rng[1] || r == 0x200C || r == 0x200D
	}
	var b strings.Builder
	rs := []rune(norm.NFC.String(text))
	for i := 0; i < len(rs); {
		if !in(rs[i]) || !(unicode.IsLetter(rs[i]) || unicode.IsMark(rs[i])) {
			b.WriteRune(rs[i])
			i++
			continue
		}
		j := i
		for j < len(rs) && in(rs[j]) && (unicode.IsLetter(rs[j]) || unicode.IsMark(rs[j]) || rs[j] == 0x200C || rs[j] == 0x200D) {
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
	key := lang + "." + string(mode)
	mu.Lock()
	defer mu.Unlock()
	if x, ok := tables[key]; ok {
		return x
	}
	l, ok := rules.Families[mode][lang]
	if !ok || files[l.File] == nil || files[l.Pooled] == nil {
		return nil
	}
	x := newMix(files[l.File], files[l.Pooled], l.Tag, rules.Beam[mode])
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

type level struct {
	stats  map[uint64][2]float64 // context → (total, types)
	counts map[uint64]int32      // context<<idBits | token → count
}

type model struct {
	vocab  int
	levels []level
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
	for l := r.varint(); l > 0; l-- {
		lv := level{stats: map[uint64][2]float64{}, counts: map[uint64]int32{}}
		for c := r.varint(); c > 0; c-- {
			ctx := make([]int32, r.varint())
			for i := range ctx {
				ctx[i] = in.id(strs[r.varint()])
			}
			key := ctxKey(ctx)
			var total float64
			types := 0
			prev := 0
			for t := r.varint(); t > 0; t-- {
				prev += r.varint()
				k := r.varint()
				lv.counts[key<<idBits|uint64(in.id(strs[prev]))] = int32(k)
				total += float64(k)
				types++
			}
			lv.stats[key] = [2]float64{total, float64(types)}
		}
		m.levels = append(m.levels, lv)
	}
	return m
}

// ctxStats are one model's statistics for one context, at each order: computed once per
// hypothesis, then used for every token that can follow it.
type ctxStats struct {
	key       [3]uint64 // the context of order n, packed
	has       [3]bool
	total, wb [3]float64 // total count, and the Witten-Bell weight total / (total + types)
}

func (m *model) stats(ctx []int32) ctxStats {
	var c ctxStats
	for n := 0; n < len(m.levels); n++ {
		c.key[n] = ctxKey(ctx[len(ctx)-n:])
		st, ok := m.levels[n].stats[c.key[n]]
		if ok && st[1] != 0 {
			c.has[n], c.total[n], c.wb[n] = true, st[0], st[0]/(st[0]+st[1])
		}
	}
	return c
}

// prob: Witten-Bell interpolation, lowest order first (as the reference).
func (m *model) prob(c *ctxStats, tok int32) float64 {
	p := 1.0 / float64(m.vocab+1)
	for n := 0; n < len(m.levels); n++ {
		if !c.has[n] {
			continue
		}
		lam := c.wb[n]
		p = lam*float64(m.levels[n].counts[c.key[n]<<idBits|uint64(tok)])/c.total[n] + (1-lam)*p
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
		for key := range m.levels[0].counts {
			t := int32(key & (1<<idBits - 1))
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

type hyp struct {
	score float64
	out   string
	ctx   []int32
}

// cand is a hypothesis before the beam cut: its context is built only if it survives.
type cand struct {
	score  float64
	out    string
	parent *hyp
	tok    int32 // -1 for an unknown character: the context does not move
	idx    int   // insertion order, the stable sort's last key
}

func before(a, b *cand) bool { // the stable sort's order: score down, spelling up, then insertion
	if a.score != b.score {
		return a.score > b.score
	}
	if a.out != b.out {
		return a.out < b.out
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

// top returns the first k candidates of cs in the stable sort's order.
func top(cs []cand, k int) []*cand {
	best := make([]*cand, 0, k+1)
	for i := range cs {
		c := &cs[i]
		if len(best) == k && !before(c, best[k-1]) {
			continue
		}
		j := sort.Search(len(best), func(p int) bool { return before(c, best[p]) })
		best = append(best, nil)
		copy(best[j+1:], best[j:])
		best[j] = c
		if len(best) > k {
			best = best[:k]
		}
	}
	return best
}

// decode: beam search over the ways to cut w into chunks; the n best spellings.
func (x *mix) decode(word string, n int) []string {
	w := []rune(word)
	h := rules.Order - 1
	root := &hyp{0, "", x.start}
	beams := make([][]cand, len(w)+1)
	beams[0] = []cand{{0, "", nil, -1, 0}}
	for i := 0; i < len(w); i++ {
		if len(beams[i]) == 0 {
			continue
		}
		for _, c := range top(beams[i], x.beam) {
			hy := root
			if i > 0 {
				hy = &hyp{c.score, c.out, c.context(h)}
			}
			moved := false
			sa, sb := x.a.stats(hy.ctx), x.b.stats(hy.ctx)
			for k := 1; k <= rules.MaxN && i+k <= len(w); k++ {
				for _, o := range x.options[string(w[i:i+k])] {
					beams[i+k] = append(beams[i+k], cand{hy.score + x.logp(&sa, &sb, o.tok), hy.out + o.en, hy, o.tok, len(beams[i+k])})
					moved = true
				}
			}
			if !moved {
				beams[i+1] = append(beams[i+1], cand{hy.score - rules.UnknownPenalty, hy.out, hy, -1, len(beams[i+1])})
			}
		}
	}
	final := map[string]float64{}
	for i := range beams[len(w)] {
		c := &beams[len(w)][i]
		ctx := x.start
		if c.parent != nil {
			ctx = c.context(h)
		}
		sa, sb := x.a.stats(ctx), x.b.stats(ctx)
		s := c.score + x.logp(&sa, &sb, x.eos)
		if v, ok := final[c.out]; !ok || s > v {
			final[c.out] = s
		}
	}
	type res struct {
		s float64
		o string
	}
	rs := make([]res, 0, len(final))
	for o, s := range final {
		rs = append(rs, res{s, o})
	}
	sort.Slice(rs, func(p, q int) bool {
		if rs[p].s != rs[q].s {
			return rs[p].s > rs[q].s
		}
		return rs[p].o < rs[q].o
	})
	out := make([]string, 0, n)
	for i := 0; i < len(rs) && i < n; i++ {
		out = append(out, rs[i].o) // as the reference: an empty spelling stays in the list
	}
	return out
}
