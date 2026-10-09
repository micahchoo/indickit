// Fuzz targets for the utilities that property_test.go does not reach:
// romanize, deromanize, wellformed and phonetic search. Same generator
// (gen, seeds); each target checks what strings alone can check, and that
// no input panics.
//
// From the perf job (linguistic-utilities jobs/perf, phase 2).
package indickit_test

import (
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/micahchoo/indickit/deromanize"
	_ "github.com/micahchoo/indickit/deromanize/lang/bn"
	_ "github.com/micahchoo/indickit/deromanize/lang/hi"
	_ "github.com/micahchoo/indickit/deromanize/lang/ta"
	_ "github.com/micahchoo/indickit/deromanize/lang/ur"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/romanize"
	_ "github.com/micahchoo/indickit/romanize/lang/bn"
	_ "github.com/micahchoo/indickit/romanize/lang/hi"
	_ "github.com/micahchoo/indickit/romanize/lang/mni"
	_ "github.com/micahchoo/indickit/romanize/lang/ta"
	_ "github.com/micahchoo/indickit/romanize/lang/ur"
	"github.com/micahchoo/indickit/wellformed"
)

var tableLangs = []string{"hi", "bn", "ta", "ur"}

// spellings: at most n, none empty, no two equal, each UTF-8. Both utilities
// drop a spelling that writes nothing (deromanize kept one until rules
// 2026-10-09.2: "q" in Bengali gave ক, ক্, "").
func spellings(t *testing.T, what string, got []string, n int) {
	t.Helper()
	if len(got) > n {
		t.Errorf("%s: %d spellings, asked for %d", what, len(got), n)
	}
	seen := map[string]bool{}
	for _, s := range got {
		if s == "" || seen[s] || !utf8.ValidString(s) {
			t.Errorf("%s: spelling %+q empty, repeated or not UTF-8 in %+q", what, s, got)
		}
		seen[s] = true
	}
}

func FuzzRomanize(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		s := gen(data)
		lang := append(tableLangs, "mni")[int(l)%5]
		for _, mode := range []romanize.Mode{romanize.Words, romanize.Names} {
			got := romanize.Word(s, lang, mode, 4)
			spellings(t, "romanize.Word "+lang+" "+string(mode)+" "+s, got, 4)
			for _, w := range got {
				if strings.Trim(w, "abcdefghijklmnopqrstuvwxyz") != "" {
					t.Errorf("romanize.Word(%+q, %s, %s) wrote %+q: not a-z", s, lang, mode, w)
				}
			}
			if out := romanize.Text(s, lang, mode); !utf8.ValidString(out) {
				t.Errorf("romanize.Text(%+q, %s, %s) is not UTF-8", s, lang, mode)
			}
		}
	})
}

func FuzzDeromanize(f *testing.F) {
	seeds(f)
	f.Add([]byte("rajnath singh"), uint8(0))
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		s := gen(data)
		lang := tableLangs[int(l)%len(tableLangs)]
		for _, mode := range []deromanize.Mode{deromanize.Words, deromanize.Names} {
			got := deromanize.Word(s, lang, mode, 4)
			spellings(t, "deromanize.Word "+lang+" "+string(mode)+" "+s, got, 4)
			for _, w := range got {
				if strings.ContainsAny(w, "abcdefghijklmnopqrstuvwxyz") {
					t.Errorf("deromanize.Word(%+q, %s, %s) kept Latin: %+q", s, lang, mode, w)
				}
			}
			if out := deromanize.Text(s, lang, mode); !utf8.ValidString(out) {
				t.Errorf("deromanize.Text(%+q, %s, %s) is not UTF-8", s, lang, mode)
			}
		}
	})
}

func FuzzWellformed(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, _ uint8) {
		s := gen(data)
		i := wellformed.BrokenAt(s)
		if wellformed.Check(s) != (i < 0) {
			t.Errorf("Check(%+q) = %v, BrokenAt = %d", s, wellformed.Check(s), i)
		}
		if i < -1 || i >= len(s) || i >= 0 && !utf8.RuneStart(s[i]) {
			t.Errorf("BrokenAt(%+q) = %d: not -1 and not a character start", s, i)
		}
	})
}

func FuzzPhoneticSearch(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		lang := langs[int(l)%len(langs)]
		third := len(data) / 3
		q, a, b := gen(data[:third]), gen(data[third:2*third]), gen(data[2*third:])
		cands := []string{a, b, q}
		scores := phonetic.Score(q, cands, lang, phonetic.ProfileNames)
		if len(scores) != len(cands) {
			t.Fatalf("Score: %d scores for %d candidates", len(scores), len(cands))
		}
		for _, sc := range scores {
			if sc < 0 {
				t.Errorf("Score(%+q, %+q) has %d", q, cands, sc)
			}
		}
		hits := phonetic.NewIndex(cands, lang, phonetic.ProfileText).Search(q, 0)
		for k, h := range hits {
			if h.Name < 0 || h.Name >= len(cands) || k > 0 && hits[k-1].Score < h.Score {
				t.Errorf("Search(%+q) in %+q: hits %+v out of range or out of order", q, cands, hits)
			}
		}
	})
}
