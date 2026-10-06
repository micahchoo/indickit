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
// lang is a language code ("as", "hi", ...) or "". Assamese text needs it:
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

	"golang.org/x/text/unicode/norm"
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
func Text(s, lang string) string { return std.fixed(std.onePass, s, lang) }

// Fold is Text, then a merge of accepted spellings of one word. For search only.
func Fold(s, lang string) string { return std.fixed(std.foldPass, s, lang) }

const digits = "0123456789abcdefghijklmnopqrstuvwxyz"

type rawRules struct {
	Version   string `json:"version"`
	MaxPasses int    `json:"max_passes"`
	Chillu    struct {
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
	} `json:"ra"`
	KhandaTa struct {
		From      string    `json:"from"`
		To        string    `json:"to"`
		NotBefore [][2]rune `json:"not_before"`
	} `json:"khanda_ta"`
	Invisible map[string]string    `json:"invisible"`
	Width     [2]int               `json:"width"`
	Scripts   [][2]json.RawMessage `json:"scripts"`
	Classes   [][3]json.RawMessage `json:"classes"`
	Tree      json.RawMessage      `json:"tree"`
	Fold      []struct {
		Step     string            `json:"step"`
		Map      map[string]string `json:"map"`
		Blocks   []rune            `json:"blocks"`
		Virama   rune              `json:"virama"`
		Anusvara rune              `json:"anusvara"`
		Rows     [][3]rune         `json:"rows"`
	} `json:"fold"`
}

// node is a joiner-tree node: a leaf (kids == nil, invisible) or a test of
// feature f. A value with no child keeps the character.
type node struct {
	invisible bool
	f         int
	kids      map[byte]*node
}

type foldStep struct {
	mapping  map[rune][]rune
	anusvara *struct {
		blocks           []rune
		virama, anusvara rune
		rows             [][3]rune
	}
}

type engine struct {
	version          string
	maxPasses        int
	invisible        map[rune]byte
	left, right      int
	scripts          [][][2]rune // index i is the script digits[i]
	classes          map[rune]byte
	tree             *node
	chillu           map[rune]rune
	chVirama, chJoin rune
	chNotBefore      rune
	raVirama         rune
	raAssamese       rune
	raBengali        rune
	assameseLangs    []string
	khandaFrom       []rune
	khandaTo         rune
	khandaNotBefore  [][2]rune
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
		chVirama: first(r.Chillu.Virama), chJoin: first(r.Chillu.Joiner), chNotBefore: first(r.Chillu.NotBefore),
		raVirama: first(r.Ra.Virama), raAssamese: first(r.Ra.Assamese), raBengali: first(r.Ra.Bengali),
		assameseLangs: r.Ra.AssameseLangs,
		khandaFrom:    []rune(r.KhandaTa.From), khandaTo: first(r.KhandaTa.To), khandaNotBefore: r.KhandaTa.NotBefore,
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
	var err error
	if e.tree, err = parseTree(r.Tree); err != nil {
		return nil, err
	}
	for from, to := range r.Chillu.Map {
		e.chillu[first(from)] = first(to)
	}
	for _, st := range r.Fold {
		var fs foldStep
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

// deletes says whether invisible character c, between before and after, is
// invisible in its context. A context the tree does not hold keeps it.
func (e *engine) deletes(before []rune, c rune, after []rune) bool {
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

func (e *engine) onePass(text, lang string) string {
	s := []rune(norm.NFC.String(text))
	at := func(i int) rune { // -1 past the end
		if i < len(s) {
			return s[i]
		}
		return -1
	}
	// rule 2: consonant + virama + ZWJ -> chillu, not after a virama, not before NotBefore
	out := make([]rune, 0, len(s))
	for i := 0; i < len(s); i++ {
		if to, ok := e.chillu[s[i]]; ok && (i == 0 || s[i-1] != e.chVirama) && at(i+1) == e.chVirama &&
			at(i+2) == e.chJoin && at(i+3) != e.chNotBefore {
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
	return norm.NFC.String(string(out))
}

func (e *engine) foldPass(text, lang string) string {
	s := []rune(Text(text, lang))
	for _, st := range e.fold {
		out := make([]rune, 0, len(s))
		if st.mapping != nil {
			for _, c := range s {
				if to, ok := st.mapping[c]; ok {
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
