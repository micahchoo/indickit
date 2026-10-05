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

	"golang.org/x/text/unicode/norm"
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
	return norm.NFC.String(word)
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
	separator = regexp.MustCompile(`[\s.\-,'’]+`)
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
	out := []string{""}
	for _, w := range Words(name) {
		ks := Keys(w)
		if len(ks) == 0 {
			continue
		}
		var next []string
		for _, prefix := range out {
			for _, k := range ks {
				if len(next) == MaxNameKeys {
					break
				}
				if prefix == "" {
					next = append(next, k)
				} else {
					next = append(next, prefix+" "+k)
				}
			}
		}
		out = next
	}
	if len(out) == 1 && out[0] == "" {
		return nil
	}
	return out
}

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
