// Package stem gives a search key for the forms of one word:
// Stem("ஆண்டில்", "ta") == Stem("ஆண்டு", "ta").
//
// Stem strips the longest ending listed for the language that leaves at
// least two code points; in languages with the vowel step it then drops one
// final vowel sign (the Dravidian enunciative u). A word with no listed
// ending is its own stem, and so is every word of a language with no table.
// Kannada, whose endings stack, runs all of this twice.
//
// A stem is a key, not text. Apply Stem once to the words you index and
// once to the query, and compare. Stem(Stem(w)) may cut again, as Snowball
// and Lucene stems do. Normalize text first: Stem compares code points.
//
// The tables (rules.json) were chosen on real search, judged by the English
// side of parallel text, under a budget of 4% wrong hits; the numbers are in
// the README.
package stem

import (
	_ "embed"
	"encoding/json"
	"sort"
	"unicode/utf8"

	langtag "github.com/micahchoo/indickit/internal/lang"
)

//go:embed rules.json
var rulesJSON []byte

type table struct {
	endings map[string]bool
	vowel   bool
	passes  int
}

var (
	minStem, maxEnd int
	vowelSigns      = map[rune]bool{}
	tables          = map[string]table{}
	// RulesVersion changes whenever any word's stem changes: store it beside
	// stems, and stem again when it differs.
	RulesVersion string
)

func init() {
	var r struct {
		Version    string `json:"version"`
		MinStem    int    `json:"min_stem"`
		MaxEnd     int    `json:"max_end"`
		VowelSigns []rune `json:"vowel_signs"`
		Languages  map[string]struct {
			VowelStep bool     `json:"vowel_step"`
			Passes    int      `json:"passes"`
			Endings   []string `json:"endings"`
		} `json:"languages"`
	}
	if err := json.Unmarshal(rulesJSON, &r); err != nil {
		panic("stem: rules.json: " + err.Error())
	}
	RulesVersion, minStem, maxEnd = r.Version, r.MinStem, r.MaxEnd
	for _, c := range r.VowelSigns {
		vowelSigns[c] = true
	}
	for lang, l := range r.Languages {
		t := table{endings: map[string]bool{}, vowel: l.VowelStep, passes: l.Passes}
		for _, e := range l.Endings {
			t.endings[e] = true
		}
		tables[lang] = t
	}
}

// Languages lists the language codes that have a table.
func Languages() []string {
	out := make([]string, 0, len(tables))
	for lang := range tables {
		out = append(out, lang)
	}
	sort.Strings(out)
	return out
}

// Stem returns the search key of word in language lang (as bn gu hi kn ml
// mr ne pa sa ta te ur). Only the tag's language counts: "ta-IN", "TA" and
// "tam" are "ta". For any other lang it returns word unchanged.
func Stem(word, lang string) string {
	t, ok := tables[langtag.Code(lang)]
	if !ok {
		return word
	}
	for range t.passes {
		word = t.cut(word)
	}
	return word
}

// cut is one pass: the longest listed ending, then the vowel step.
func (t table) cut(word string) string {
	// Walk back over code points; every candidate ending is a substring of
	// word, so no lookup copies. starts[k] is the byte where the last k code
	// points begin.
	var starts [16]int
	n, i := 0, len(word)
	for n < maxEnd+minStem && n < len(starts)-1 && i > 0 {
		i--
		for i > 0 && word[i]&0xC0 == 0x80 { // a continuation byte
			i--
		}
		n++
		starts[n] = i
	}
	if i > 0 { // more code points than we walked: none of them is a limit
		n = len(starts)
	}
	end := len(word)
	for k := min(maxEnd, n-minStem); k > 0; k-- {
		if t.endings[word[starts[k]:]] {
			end = starts[k]
			n -= k
			break
		}
	}
	if t.vowel && n > minStem {
		if c, size := utf8.DecodeLastRuneInString(word[:end]); vowelSigns[c] {
			end -= size
		}
	}
	return word[:end]
}
