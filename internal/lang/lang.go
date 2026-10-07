// Package lang reads a language tag the same way in every indickit utility,
// in Go, in TypeScript (js/lang.ts) and in the Python reference
// (linguistic-utilities lu/lang.py).
package lang

import "strings"

// Code gives the code the rules files use for a language tag: lower case,
// the first subtag only (hi-IN, hi_IN → hi), and an ISO 639-2 code of a
// language with a two-letter code as that code (hin → hi). Any other tag
// comes back lower-cased, and the rules files hold no table for it.
func Code(tag string) string {
	t := strings.ToLower(tag)
	if i := strings.IndexAny(t, "-_"); i >= 0 {
		t = t[:i]
	}
	if c, ok := iso6392[t]; ok {
		return c
	}
	return t
}

// The ISO 639-2 codes of the 22 languages of the Eighth Schedule that have
// an ISO 639-1 code. The other six (brx doi gom kok mai mni sat) have only
// a three-letter code, which BCP 47 uses as it is.
var iso6392 = map[string]string{
	"asm": "as", "ben": "bn", "guj": "gu", "hin": "hi", "kan": "kn", "kas": "ks",
	"mal": "ml", "mar": "mr", "nep": "ne", "ori": "or", "pan": "pa", "san": "sa",
	"snd": "sd", "tam": "ta", "tel": "te", "urd": "ur",
}
