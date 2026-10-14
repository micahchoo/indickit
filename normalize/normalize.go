// Package normalize gives one encoding to text that looks the same. Two
// strings that a reader cannot tell apart (an invisible joiner, an old
// Malayalam chillu, a ज़ typed as one code point or two) get the same bytes;
// what a reader sees never changes. Use Text before you store, index or
// compare text.
//
// Fold is Text, then a merge of accepted spellings of one word (हिन्दी and
// हिंदी, गाँव and गांव). Its output is still readable, but it loses
// information on purpose: apply it to a query and to an index, never to
// stored text.
//
// lang is a language tag ("as", "hi", "as-IN", "asm") or "". Only its
// language counts: case, region and script do not. Assamese text needs it:
// after a virama, Assamese ৰ and Bengali র look alike, and each language
// keeps its own.
//
// The rules change between versions. Store RulesVersion next to output that
// you keep, and recompute it when the version changes.
package normalize

import (
	_ "embed"
	"encoding/json"
	"slices"

	langtag "github.com/micahchoo/indickit/internal/lang"
	"github.com/micahchoo/indickit/internal/unorm"
)

//go:embed rules.json
var rulesJSON []byte

var std = func() *engine {
	e, err := load(rulesJSON)
	if err != nil {
		panic("normalize: bad embedded rules.json: " + err.Error())
	}
	return e
}()

// RulesVersion names the rules that every output of this package was made with.
var RulesVersion = std.version

// Text gives one encoding to text that looks the same; it never changes what
// a reader sees.
func Text(s, lang string) string { return std.fixed(std.onePass, s, langtag.Code(lang)) }

// Fold is Text, then a merge of accepted spellings of one word. For search only.
func Fold(s, lang string) string { return std.fixed(std.foldPass, s, langtag.Code(lang)) }

const digits = "0123456789abcdefghijklmnopqrstuvwxyz"

type rawRules struct {
	Version   string `json:"version"`
	MaxPasses int    `json:"max_passes"`
	// rule 1b: a multi-part vowel sign typed in another order -> the sign,
	// only after a character whose offset in its Brahmic block (U+0900 to
	// U+0D7F) is in after (a consonant or a nukta)
	Order struct {
		Map   map[string]string `json:"map"`
		After [][2]rune         `json:"after"`
	} `json:"order"`
	Chillu struct {
		Map       map[string]string `json:"map"`
		Virama    string            `json:"virama"`
		Joiner    string            `json:"joiner"`
		NotBefore string            `json:"not_before"`
	} `json:"chillu"`
	Ra struct {
		Virama        string   `json:"virama"`
		Assamese      string   `json:"assamese"`
		Bengali       string   `json:"bengali"`
		AssameseLangs []string `json:"assamese_langs"`
		// rules 2026-10-13: ra + Zwnj + virama + Ya is ra + Zwj + virama + Ya; the other ra +
		// virama before a consonant in RephBefore is the language's own (the reph)
		Zwnj       string    `json:"zwnj"`
		Zwj        string    `json:"zwj"`
		Ya         string    `json:"ya"`
		RephBefore [][2]rune `json:"reph_before"`
	} `json:"ra"`
	KhandaTa struct {
		From      string    `json:"from"`
		To        string    `json:"to"`
		NotBefore [][2]rune `json:"not_before"`
		// nor where the ZWJ joins ত্ to the next cluster: a reph, or a cluster
		// with a left-side vowel sign
		Cluster struct {
			Consonants [][2]rune `json:"consonants"`
			Nukta      string    `json:"nukta"`
			Virama     string    `json:"virama"`
			LeftSigns  string    `json:"left_signs"`
			Reph       string    `json:"reph"`
			// nor where ত itself carries a reph
			NotAfterReph bool `json:"not_after_reph"`
		} `json:"cluster"`
	} `json:"khanda_ta"`
	Invisible map[string]string    `json:"invisible"`
	Width     [2]int               `json:"width"`
	Scripts   [][2]json.RawMessage `json:"scripts"`
	Classes   [][3]json.RawMessage `json:"classes"`
	Tree      json.RawMessage      `json:"tree"`
	// rule 4, before the tree: consonant + virama + ZWNJ/ZWJ + consonant, by the pair
	Pairs map[string]struct {
		Virama     string              `json:"virama"`
		Consonants string              `json:"consonants"`
		Keep       map[string][]string `json:"keep"` // joiner symbol -> the pairs that keep it
	} `json:"pairs"`
	Fold []struct {
		Step     string            `json:"step"`
		Map      map[string]string `json:"map"`
		Blocks   []rune            `json:"blocks"`
		Virama   rune              `json:"virama"`
		Anusvara rune              `json:"anusvara"`
		Rows     [][3]rune         `json:"rows"`
		Langs    []string          `json:"langs"`  // the step runs only for these languages
		Before   [][2]rune         `json:"before"` // map only where the next character is in a range
		After    [][2]rune         `json:"after"`  // map only where the previous character is in a range
	} `json:"fold"`
}

// node is a joiner-tree node: a leaf (kids == nil, invisible) or a test of
// feature f. A value with no child keeps the character.
type node struct {
	invisible bool
	f         int
	kids      map[byte]*node
}

// pairRule decides a joiner between consonant + virama and a consonant, for
// one script: it stays only for the pairs in keep.
type pairRule struct {
	consonants map[rune]bool
	keep       map[byte]map[[2]rune]bool
}

type foldStep struct {
	langs         []string
	before, after [][2]rune // the neighbours are read from the step's input
	mapping       map[rune][]rune
	anusvara      *struct {
		blocks           []rune
		virama, anusvara rune
		rows             [][3]rune
	}
}

type engine struct {
	version          string
	maxPasses        int
	order            map[string][]rune // rule 1b: typed order -> the sign
	orderFirst       map[rune]bool     // the characters a typed order can start with
	orderLongest     int               // the longest typed order, in code points
	orderAfter       [][2]rune         // block offsets of the characters it may follow
	invisible        map[rune]byte
	left, right      int
	scripts          [][][2]rune // index i is the script digits[i]
	classes          map[rune]byte
	tree             *node
	pairs            map[rune]pairRule // by virama
	chillu           map[rune]rune
	chVirama, chJoin rune
	chNotBefore      []rune // no chillu before these: RRA, and every vowel sign
	raVirama         rune
	raAssamese       rune
	raBengali        rune
	assameseLangs    []string
	raZwnj, raZwj    rune
	raYa             rune
	rephBefore       [][2]rune
	khandaFrom       []rune
	khandaTo         rune
	khandaNotBefore  [][2]rune
	khCons           [][2]rune // the cluster that khanda ta must not join
	khNukta, khVir   rune
	khLeft, khReph   []rune
	khNotAfterReph   bool
	fold             []foldStep
}

func first(s string) rune { return []rune(s)[0] }

func parseTree(raw json.RawMessage) (*node, error) {
	var leaf int
	if json.Unmarshal(raw, &leaf) == nil {
		if leaf == 1 {
			return &node{invisible: true}, nil
		}
		return nil, nil // keep
	}
	var pair [2]json.RawMessage
	if err := json.Unmarshal(raw, &pair); err != nil {
		return nil, err
	}
	n := &node{kids: map[byte]*node{}}
	if err := json.Unmarshal(pair[0], &n.f); err != nil {
		return nil, err
	}
	var kids map[string]json.RawMessage
	if err := json.Unmarshal(pair[1], &kids); err != nil {
		return nil, err
	}
	for values, child := range kids {
		c, err := parseTree(child)
		if err != nil {
			return nil, err
		}
		for i := 0; i < len(values); i++ { // every value is one ASCII byte
			n.kids[values[i]] = c
		}
	}
	return n, nil
}

func load(data []byte) (*engine, error) {
	var r rawRules
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, err
	}
	e := &engine{
		version: r.Version, maxPasses: r.MaxPasses,
		invisible: map[rune]byte{}, left: r.Width[0], right: r.Width[1],
		classes: map[rune]byte{}, chillu: map[rune]rune{},
		chVirama: first(r.Chillu.Virama), chJoin: first(r.Chillu.Joiner), chNotBefore: []rune(r.Chillu.NotBefore),
		raVirama: first(r.Ra.Virama), raAssamese: first(r.Ra.Assamese), raBengali: first(r.Ra.Bengali),
		assameseLangs: r.Ra.AssameseLangs,
		raZwnj:        first(r.Ra.Zwnj), raZwj: first(r.Ra.Zwj), raYa: first(r.Ra.Ya), rephBefore: r.Ra.RephBefore,
		khandaFrom: []rune(r.KhandaTa.From), khandaTo: first(r.KhandaTa.To), khandaNotBefore: r.KhandaTa.NotBefore,
		khCons: r.KhandaTa.Cluster.Consonants, khNukta: first(r.KhandaTa.Cluster.Nukta),
		khVir: first(r.KhandaTa.Cluster.Virama), khLeft: []rune(r.KhandaTa.Cluster.LeftSigns),
		khReph: []rune(r.KhandaTa.Cluster.Reph), khNotAfterReph: r.KhandaTa.Cluster.NotAfterReph,
	}
	e.order, e.orderAfter = map[string][]rune{}, r.Order.After
	e.orderFirst = map[rune]bool{}
	for from, to := range r.Order.Map {
		fromRunes := []rune(from)
		e.orderFirst[fromRunes[0]] = true
		e.order[from] = []rune(to)
		e.orderLongest = max(e.orderLongest, len(fromRunes))
	}
	for c, sym := range r.Invisible {
		e.invisible[first(c)] = sym[0]
	}
	for _, sc := range r.Scripts {
		var ranges [][2]rune
		if err := json.Unmarshal(sc[1], &ranges); err != nil {
			return nil, err
		}
		e.scripts = append(e.scripts, ranges)
	}
	for _, c := range r.Classes {
		var lo, hi rune
		var k string
		if err := json.Unmarshal(c[0], &lo); err != nil {
			return nil, err
		}
		json.Unmarshal(c[1], &hi)
		json.Unmarshal(c[2], &k)
		for o := lo; o <= hi; o++ {
			e.classes[o] = k[0]
		}
	}
	e.pairs = map[rune]pairRule{}
	for _, p := range r.Pairs {
		pr := pairRule{consonants: map[rune]bool{}, keep: map[byte]map[[2]rune]bool{}}
		for _, c := range p.Consonants {
			pr.consonants[c] = true
		}
		for sym, pairs := range p.Keep {
			pr.keep[sym[0]] = map[[2]rune]bool{}
			for _, ab := range pairs {
				r := []rune(ab)
				pr.keep[sym[0]][[2]rune{r[0], r[1]}] = true
			}
		}
		e.pairs[first(p.Virama)] = pr
	}
	var err error
	if e.tree, err = parseTree(r.Tree); err != nil {
		return nil, err
	}
	for from, to := range r.Chillu.Map {
		e.chillu[first(from)] = first(to)
	}
	for _, st := range r.Fold {
		fs := foldStep{langs: st.Langs, before: st.Before, after: st.After}
		if st.Step == "map" {
			fs.mapping = map[rune][]rune{}
			for from, to := range st.Map {
				fs.mapping[first(from)] = []rune(to)
			}
		} else {
			fs.anusvara = &struct {
				blocks           []rune
				virama, anusvara rune
				rows             [][3]rune
			}{st.Blocks, st.Virama, st.Anusvara, st.Rows}
		}
		e.fold = append(e.fold, fs)
	}
	return e, nil
}

// script gives the script's digit, or 0 when c is not in one of our scripts.
func (e *engine) script(c rune) byte {
	for i, ranges := range e.scripts {
		for _, r := range ranges {
			if c >= r[0] && c <= r[1] {
				return digits[i]
			}
		}
	}
	return 0
}

// sym gives c's context symbol: an invisible character's letter, a class,
// '?' for one of our characters with no class, 0 for any other character.
func (e *engine) sym(c rune) byte {
	if s, ok := e.invisible[c]; ok {
		return s
	}
	if k, ok := e.classes[c]; ok {
		return k
	}
	if e.script(c) != 0 {
		return '?'
	}
	return 0
}

// khandaJoined says whether the ZWJ of khanda ta joins ত্ to the cluster at
// j: a reph, or a cluster with a left-side vowel sign, which HarfBuzz then
// draws before ত. at gives -1 past the end.
func (e *engine) khandaJoined(at func(int) rune, j int) bool {
	cons := func(c rune) bool {
		for _, r := range e.khCons {
			if c >= r[0] && c <= r[1] {
				return true
			}
		}
		return false
	}
	if slices.Contains(e.khReph, at(j)) && at(j+1) == e.khVir {
		return true
	}
	if !cons(at(j)) {
		return false
	}
	k := j + 1
	if at(k) == e.khNukta {
		k++
	}
	for at(k) == e.khVir && cons(at(k+1)) {
		k += 2
		if at(k) == e.khNukta {
			k++
		}
	}
	return slices.Contains(e.khLeft, at(k))
}

// deletes says whether invisible character c, between before and after, is
// invisible in its context: by the pair in a conjunct context of a pairs
// script, else by the tree. A context the tree does not hold keeps it.
func (e *engine) deletes(before []rune, c rune, after []rune) bool {
	if (c == '\u200c' || c == '\u200d') && len(before) >= 2 && len(after) > 0 {
		if p, ok := e.pairs[before[len(before)-1]]; ok && p.consonants[before[len(before)-2]] && p.consonants[after[0]] {
			return !p.keep[e.invisible[c]][[2]rune{before[len(before)-2], after[0]}]
		}
	}
	var sc byte
	for i := len(before) - 1; i >= 0; i-- {
		if _, inv := e.invisible[before[i]]; !inv {
			sc = e.script(before[i])
			break
		}
	}
	if sc == 0 {
		for _, a := range after {
			if _, inv := e.invisible[a]; !inv {
				sc = e.script(a)
				break
			}
		}
	}
	if sc == 0 {
		return false
	}
	x := make([]byte, 0, 2+e.left+e.right)
	x = append(x, sc, e.invisible[c])
	n := 0
	for i := len(before) - 1; i >= 0 && n < e.left; i-- {
		s := e.sym(before[i])
		if s == 0 {
			break
		}
		x = append(x, s)
		n++
	}
	for ; n < e.left; n++ {
		x = append(x, '^')
	}
	n = 0
	for _, a := range after {
		s := e.sym(a)
		if s == 0 || n == e.right {
			break
		}
		x = append(x, s)
		n++
	}
	for ; n < e.right; n++ {
		x = append(x, '$')
	}
	t := e.tree
	for t != nil && t.kids != nil {
		t = t.kids[x[t.f]]
	}
	return t != nil && t.invisible
}

// reorder is rule 1b: a multi-part vowel sign typed in another order becomes
// the sign, where the character before it (in s) is a base of orderAfter.
func (e *engine) reorder(s []rune) []rune {
	if len(e.order) == 0 {
		return s
	}
	base := func(c rune) bool {
		if c < 0x0900 || c > 0x0D7F {
			return false
		}
		for _, r := range e.orderAfter {
			if c%0x80 >= r[0] && c%0x80 <= r[1] {
				return true
			}
		}
		return false
	}
	out := make([]rune, 0, len(s))
	for i := 0; i < len(s); i++ {
		if i > 0 && base(s[i-1]) && e.orderFirst[s[i]] {
			if n, to := e.orderAt(s[i:]); n > 0 {
				out = append(out, to...)
				i += n - 1
				continue
			}
		}
		out = append(out, s[i])
	}
	return out
}

// orderAt gives the length of the longest typed order at the start of rest,
// and its sign; 0 when none starts there.
func (e *engine) orderAt(rest []rune) (int, []rune) {
	for n := min(len(rest), e.orderLongest); n > 1; n-- {
		if to, ok := e.order[string(rest[:n])]; ok {
			return n, to
		}
	}
	return 0, nil
}

func (e *engine) onePass(text, lang string) string {
	s := e.reorder([]rune(unorm.NFC(text))) // rule 1, then 1b
	at := func(i int) rune {                // -1 past the end
		if i < len(s) {
			return s[i]
		}
		return -1
	}
	// rule 2: consonant + virama + ZWJ -> chillu, not after a virama, not before NotBefore
	out := make([]rune, 0, len(s))
	for i := 0; i < len(s); i++ {
		if to, ok := e.chillu[s[i]]; ok && (i == 0 || s[i-1] != e.chVirama) && at(i+1) == e.chVirama &&
			at(i+2) == e.chJoin && !slices.Contains(e.chNotBefore, at(i+3)) {
			out = append(out, to)
			i += 2
		} else {
			out = append(out, s[i])
		}
	}
	// rule 3: after a virama, the language's own ra; then khanda ta
	own, other := e.raBengali, e.raAssamese
	if slices.Contains(e.assameseLangs, lang) {
		own, other = e.raAssamese, e.raBengali
	}
	s, out = out, make([]rune, 0, len(out))
	for i := 0; i < len(s); i++ {
		if s[i] == e.raVirama && at(i+1) == other {
			out = append(out, e.raVirama, own)
			i++
		} else {
			out = append(out, s[i])
		}
	}
	// rule 3, 2026-10-13: ra + ZWNJ + virama + ya is ra + ZWJ + virama + ya; then the reph
	if e.raZwnj != 0 {
		s, out = out, make([]rune, 0, len(out))
		for i := 0; i < len(s); i++ {
			if (s[i] == e.raBengali || s[i] == e.raAssamese) && at(i+1) == e.raZwnj && at(i+2) == e.raVirama && at(i+3) == e.raYa {
				out = append(out, s[i], e.raZwj)
				i++
			} else {
				out = append(out, s[i])
			}
		}
		s, out = out, make([]rune, 0, len(out))
		for i := 0; i < len(s); i++ {
			c := s[i]
			if c == other && at(i+1) == e.raVirama {
				if next := at(i + 2); next != -1 && slices.ContainsFunc(e.rephBefore, func(r [2]rune) bool { return next >= r[0] && next <= r[1] }) {
					c = own
				}
			}
			out = append(out, c)
		}
	}
	s, out = out, make([]rune, 0, len(out))
	k := len(e.khandaFrom)
	for i := 0; i < len(s); i++ {
		match := i+k <= len(s) && slices.Equal(s[i:i+k], e.khandaFrom)
		if match {
			if next := at(i + k); next != -1 {
				for _, r := range e.khandaNotBefore {
					if next >= r[0] && next <= r[1] {
						match = false
					}
				}
			}
		}
		if match && (e.khandaJoined(at, i+k) ||
			e.khNotAfterReph && i >= 2 && slices.Contains(e.khReph, s[i-2]) && s[i-1] == e.khVir) {
			match = false
		}
		if match {
			out = append(out, e.khandaTo)
			i += k - 1
		} else {
			out = append(out, s[i])
		}
	}
	// rule 4: invisible characters, in the context of the output so far
	s, out = out, make([]rune, 0, len(out))
	for i, c := range s {
		if _, inv := e.invisible[c]; inv &&
			e.deletes(out[max(0, len(out)-e.left):], c, s[i+1:min(len(s), i+1+e.right)]) {
			continue
		}
		out = append(out, c)
	}
	return unorm.NFC(string(out))
}

// context reports whether s[i]'s neighbours satisfy the step's before and
// after ranges; a missing neighbour satisfies neither.
func (st foldStep) context(s []rune, i int) bool {
	in := func(c rune, ranges [][2]rune) bool {
		for _, r := range ranges {
			if c >= r[0] && c <= r[1] {
				return true
			}
		}
		return false
	}
	if st.before != nil && (i+1 >= len(s) || !in(s[i+1], st.before)) {
		return false
	}
	if st.after != nil && (i == 0 || !in(s[i-1], st.after)) {
		return false
	}
	return true
}

func (e *engine) foldPass(text, lang string) string {
	s := []rune(Text(text, lang))
	for _, st := range e.fold {
		if st.langs != nil && !slices.Contains(st.langs, lang) {
			continue
		}
		out := make([]rune, 0, len(s))
		if st.mapping != nil {
			for i, c := range s {
				if to, ok := st.mapping[c]; ok && st.context(s, i) {
					out = append(out, to...)
				} else {
					out = append(out, c)
				}
			}
		} else { // nasal + virama -> anusvara, before a consonant of the nasal's own row
			a := st.anusvara
			for i := 0; i < len(s); i++ {
				done := false
				for _, b := range a.blocks {
					if s[i] < b || s[i] >= b+0x80 || i+2 >= len(s) || s[i+1] != b+a.virama {
						continue
					}
					for _, row := range a.rows {
						if s[i] == b+row[0] && s[i+2] >= b+row[1] && s[i+2] <= b+row[2] {
							out = append(out, b+a.anusvara)
							i++
							done = true
							break
						}
					}
					break
				}
				if !done {
					out = append(out, s[i])
				}
			}
		}
		s = out
	}
	return string(s)
}

// fixed applies pass again until nothing changes: deleting one invisible
// character can change the context of the next.
func (e *engine) fixed(pass func(string, string) string, s, lang string) string {
	for range e.maxPasses {
		t := pass(s, lang)
		if t == s {
			break
		}
		s = t
	}
	return s
}
