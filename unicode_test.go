package indickit_test

import (
	"encoding/json"
	"os"
	"slices"
	"strconv"
	"testing"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

// Finding 5 of the release job's code floor is a scope, not a fix: Go reads
// Unicode 15.0 and TypeScript reads the host's data (node 24: 17.0). Inside
// the blocks indickit reads, both agree with 15.0: every code point's NFD
// and its Mn category (js/regression.test.ts checks the TypeScript side).
// testdata/unicode15.json comes from Python's unicodedata (15.0.0).
func TestUnicodeDataInOurBlocks(t *testing.T) {
	data, err := os.ReadFile("testdata/unicode15.json")
	if err != nil {
		t.Fatal(err)
	}
	var u struct {
		Ranges [][2]rune         `json:"ranges"`
		Mn     []rune            `json:"mn"`
		NFD    map[string][]rune `json:"nfd"`
	}
	if err := json.Unmarshal(data, &u); err != nil {
		t.Fatal(err)
	}
	for _, r := range u.Ranges {
		for c := r[0]; c <= r[1]; c++ {
			if got, want := unicode.Is(unicode.Mn, c), slices.Contains(u.Mn, c); got != want {
				t.Errorf("%U: Mn %v, Unicode 15.0 says %v", c, got, want)
			}
			want, ok := u.NFD[strconv.Itoa(int(c))]
			if !ok {
				want = []rune{c}
			}
			if got := []rune(norm.NFD.String(string(c))); !slices.Equal(got, want) {
				t.Errorf("%U: NFD %U, Unicode 15.0 says %U", c, got, want)
			}
		}
	}
}
