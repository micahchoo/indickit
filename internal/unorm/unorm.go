// Package unorm gives Unicode NFC as ICU (JavaScript) and Python's
// unicodedata give it. golang.org/x/text/unicode/norm differs in two ways:
//
//   - It follows the Stream-Safe Text Format (UAX #15): it puts U+034F after
//     every 30 non-starters in a row, and reorders marks only inside each
//     group of 30. ICU and Python reorder the whole run and insert nothing.
//   - It can compose a starter with a mark that a later vowel sign of
//     combining class 0 blocks (t + U+0BBE + ... + U+0326 gives U+021B).
//
// So x/text decides only whether a string is already NFC; its answer agreed
// with Python 3.12 (Unicode 15.0) on 100,000 random strings with runs of up
// to 70 marks (linguistic-utilities jobs/release/reports/03-code-floor-fixes.md).
// That quick check stays right under a newer x/text: a string it calls
// normal has no decomposable code point, no composable pair and its marks in
// order under the newer data, so under the pinned data too (the pinned data
// knows fewer code points, each inert).
//
// The three questions of the algorithm, a code point's decomposition, its
// combining class and the composite of two code points, go to internal/unidata:
// the pinned table inside indickit's blocks, x/text outside them.
package unorm

import (
	"slices"

	"github.com/micahchoo/indickit/internal/unidata"
	"golang.org/x/text/unicode/norm"
)

// NFC is Unicode NFC with no limit on a run of non-starters.
func NFC(s string) string {
	if norm.NFC.IsNormalString(s) {
		return s
	}
	return compose(decompose(s))
}

func ccc(r rune) uint8 { return unidata.CCC(r) }

// decompose is NFD: each code point decomposed alone (no decomposition is
// longer than 18 code points, so x/text inserts nothing), then the canonical
// order: a stable sort by combining class inside each run of non-starters.
func decompose(s string) []rune {
	var d []rune
	for _, r := range s {
		d = append(d, unidata.NFD(r)...)
	}
	for i := 0; i < len(d); {
		if ccc(d[i]) == 0 {
			i++
			continue
		}
		j := i
		for j < len(d) && ccc(d[j]) != 0 {
			j++
		}
		slices.SortStableFunc(d[i:j], func(a, b rune) int { return int(ccc(a)) - int(ccc(b)) })
		i = j
	}
	return d
}

// compose is the canonical composition algorithm of UAX #15 on a string in
// NFD.
func compose(d []rune) string {
	out := make([]rune, 0, len(d))
	starter := -1 // index in out of the last starter
	for _, c := range d {
		cc := ccc(c)
		if starter >= 0 && (len(out)-1 == starter || ccc(out[len(out)-1]) < cc) {
			if p, ok := pair(out[starter], c); ok {
				out[starter] = p
				continue
			}
		}
		if cc == 0 {
			starter = len(out)
		}
		out = append(out, c)
	}
	return string(out)
}

func pair(a, b rune) (rune, bool) { return unidata.Pair(a, b) }
