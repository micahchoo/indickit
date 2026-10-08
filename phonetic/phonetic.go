// Package phonetic gives a name a key that is the same in every script it is
// written in: राम, ರಾಮ, രാമ, ராம, رام and "Ram" share a key.
//
// A word has a SET of keys (most have one); two names match when they have
// the same number of words and each pair of words shares a key.
//
// The rules change between versions, and a change makes stored keys stale.
// Store RulesVersion next to your keys, and recompute them when it changes.
package phonetic

import (
	_ "embed"
	"encoding/json"
	"regexp"
	"strings"
	"unicode"
	"unicode/utf8"

	"golang.org/x/text/unicode/norm"

	"github.com/micahchoo/indickit/internal/unorm"
)

//go:embed rules.json
var rulesJSON []byte

var std = func() *engine {
	e, err := load(rulesJSON)
	if err != nil {
		panic("phonetic: bad embedded rules.json: " + err.Error())
	}
	return e
}()

// RulesVersion names the rules every key in this package was made with.
var RulesVersion = func() string {
	var v struct {
		Version string `json:"version"`
	}
	_ = json.Unmarshal(rulesJSON, &v)
	return v.Version
}()

// MaxNameKeys caps NameKeys: a long Tamil name can have many key combinations.
const MaxNameKeys = 256

// normalize puts a word in the form the rules read: Latin lower-cased with
// its accents removed (ā → a), anything else in Unicode NFC.
func normalize(word string) string {
	var plain strings.Builder
	latin := true
	for _, r := range norm.NFD.String(word) {
		if unicode.Is(unicode.Mn, r) {
			continue
		}
		if r >= 0x80 {
			latin = false
			break
		}
		plain.WriteRune(r)
	}
	if latin {
		return strings.ToLower(plain.String())
	}
	return unorm.NFC(word)
}

// Keys returns the sorted keys of one word. An empty result means the word
// holds no letter the rules read.
func Keys(word string) []string {
	w := normalize(word)
	if w == "" {
		return nil
	}
	return std.keys(w)
}

var (
	bracketed = regexp.MustCompile(`\([^)]*\)`)
	// The spaces are Python's \s (str.isspace), the reference's splitter
	// (linguistic-utilities lu/names.py#words); RE2's \s is ASCII only, and
	// JavaScript's \s also holds U+FEFF.
	separator = regexp.MustCompile(`[\t\n\v\f\r\x1c-\x1f \x{85}\x{a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}.\-,'’]+`)
)

// Words splits a name the way NameKeys and Match do: on spaces and
// punctuation, with anything in brackets removed.
func Words(name string) []string {
	var out []string
	for _, w := range separator.Split(bracketed.ReplaceAllString(name, " "), -1) {
		if w != "" {
			out = append(out, w)
		}
	}
	return out
}

// NameKeys returns the keys of a whole name, one per combination of its
// words' keys, each word's key separated by a space. Two names match when
// their NameKeys share an element, so these are what to index. At most
// MaxNameKeys are returned.
func NameKeys(name string) []string {
	var all [][]string // the keys of each word that has a key
	for _, w := range Words(name) {
		if ks := Keys(w); len(ks) > 0 {
			all = append(all, ks)
		}
	}
	if len(all) == 0 {
		return nil
	}
	// The combinations come in order, the last word changing fastest, and
	// stop at MaxNameKeys. So only the last words whose combinations reach
	// MaxNameKeys change; every word before them takes its first key. Each
	// result is built once: the time is linear in the length of the result.
	n, tail := 1, len(all)
	for tail > 0 && n < MaxNameKeys {
		tail--
		n *= len(all[tail])
	}
	n = min(n, MaxNameKeys)
	var b strings.Builder
	for _, ks := range all[:tail] {
		b.WriteString(ks[0])
		b.WriteByte(' ')
	}
	head := b.String()
	out := make([]string, n)
	pick := make([]int, len(all)-tail) // the key chosen for each of the last words
	for i := range out {
		b.Reset()
		b.WriteString(head)
		for j, k := range pick {
			if j > 0 {
				b.WriteByte(' ')
			}
			b.WriteString(all[tail+j][k])
		}
		out[i] = b.String()
		for j := len(pick) - 1; j >= 0; j-- {
			if pick[j]++; pick[j] < len(all[tail+j]) {
				break
			}
			pick[j] = 0
		}
	}
	return out
}

// JoinedKeys returns the keys of a name written as one word, its words
// joined: Ram Nath and இராம்நாத் share no NameKeys, but they share a joined
// key. Only keys of at least JoinedMinClasses classes are returned: shorter
// ones find too many names. A search looks them up only when NameKeys find
// nobody; Match does not use them.
func JoinedKeys(name string) []string {
	var b strings.Builder
	for _, w := range Words(name) {
		b.WriteString(normalize(w))
	}
	if b.Len() == 0 {
		return nil
	}
	var out []string
	for _, k := range std.keys(b.String()) {
		if utf8.RuneCountInString(k) >= std.joinedMin {
			out = append(out, k)
		}
	}
	return out
}

// JoinedMinClasses is the length below which a joined key is not returned.
var JoinedMinClasses = std.joinedMin

// Match reports whether two names have the same number of words and every
// pair of words, in order, shares a key.
func Match(a, b string) bool {
	wa, wb := Words(a), Words(b)
	if len(wa) == 0 || len(wa) != len(wb) {
		return false
	}
	for i := range wa {
		if !shareOne(Keys(wa[i]), Keys(wb[i])) {
			return false
		}
	}
	return true
}

func shareOne(a, b []string) bool {
	for _, x := range a {
		for _, y := range b {
			if x == y {
				return true
			}
		}
	}
	return false
}
