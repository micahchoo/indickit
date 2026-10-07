package phonetic

import (
	"encoding/json"
	"math/rand/v2"
	"os"
	"slices"
	"strings"
	"testing"
)

// testdata/separators.json lists every code point the reference's word
// splitter (linguistic-utilities lu/names.py#SEPARATOR) splits on. Words must
// split on these and on nothing else, for every code point.
func TestWordsSplitLikeTheReference(t *testing.T) {
	data, err := os.ReadFile("testdata/separators.json")
	if err != nil {
		t.Fatal(err)
	}
	var seps []rune
	if err := json.Unmarshal(data, &seps); err != nil {
		t.Fatal(err)
	}
	for c := rune(0); c <= 0x10FFFF; c++ {
		if c >= 0xD800 && c <= 0xDFFF || c == '(' || c == ')' {
			continue
		}
		got := len(Words("क" + string(c) + "ख"))
		if want := 1 + btoi(slices.Contains(seps, c)); got != want {
			t.Errorf("Words(क %U ख): %d words, want %d", c, got, want)
		}
	}
	if !Match("र\u093eम\u00a0स\u093f\u0902ह", "र\u093eम स\u093f\u0902ह") {
		t.Error("a no-break space changes the match")
	}
}

func btoi(b bool) int {
	if b {
		return 1
	}
	return 0
}

// nameKeysQuadratic is NameKeys as it was before v0.4.4: each word extends
// every prefix. NameKeys must give the same list in the same order.
func nameKeysQuadratic(name string) []string {
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

func TestNameKeysSameAsQuadratic(t *testing.T) {
	// words with one, two and many keys, and words with none
	pool := []string{"र\u093eम", "க\u0bbe", "க\u0bcdஷ", "ஹர\u0bbf", "!", "Ram", "مولانا", "سید", "১২", "ഹര\u0d3f", "ab", "?"}
	r := rand.New(rand.NewPCG(1, 2))
	for range 5000 {
		var name []string
		for range r.IntN(14) {
			name = append(name, pool[r.IntN(len(pool))])
		}
		s := strings.Join(name, " ")
		if got, want := NameKeys(s), nameKeysQuadratic(s); !slices.Equal(got, want) {
			t.Fatalf("NameKeys(%q) = %q, want %q", s, got, want)
		}
	}
}
