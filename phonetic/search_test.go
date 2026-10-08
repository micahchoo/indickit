package phonetic

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"os"
	"testing"
)

// testdata/scorer-conformance.jsonl.gz holds scores and searches from the
// Python reference (linguistic-utilities jobs/phonetic/scorer_conformance.py);
// the TypeScript build reads the same file. Every row must agree exactly.
func TestSearchConformance(t *testing.T) {
	f, err := os.Open("testdata/scorer-conformance.jsonl.gz")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	s := bufio.NewScanner(gz)
	s.Buffer(make([]byte, 1<<20), 1<<24)
	rows, wrong := map[string]int{}, 0
	fail := func(format string, args ...any) {
		if wrong < 10 {
			t.Errorf(format, args...)
		}
		wrong++
	}
	for s.Scan() {
		var r struct {
			T, Lang, Profile, Q string
			C                   []string
			S                   []int
			Names, Queries      []string
			Hits                [][][2]int
			Ratio               [][3]json.RawMessage
			Log2x10             [][3]int64
			Pow2neg             [][2]int64
		}
		if err := json.Unmarshal(s.Bytes(), &r); err != nil {
			t.Fatal(err)
		}
		rows[r.T]++
		switch r.T {
		case "unit":
			for _, x := range r.Ratio {
				var a, b string
				var want int64
				json.Unmarshal(x[0], &a)
				json.Unmarshal(x[1], &b)
				json.Unmarshal(x[2], &want)
				if got := ratio([]rune(a), []rune(b)); got != want {
					fail("ratio(%q, %q) = %d, want %d", a, b, got, want)
				}
			}
			for _, x := range r.Log2x10 {
				if got := log2x10(x[0], x[1]); got != x[2] {
					fail("log2x10(%d, %d) = %d, want %d", x[0], x[1], got, x[2])
				}
			}
			for _, x := range r.Pow2neg {
				if got := pow2neg(x[0]); got != x[1] {
					fail("pow2neg(%d) = %d, want %d", x[0], got, x[1])
				}
			}
		case "score":
			if got := Score(r.Q, r.C, r.Lang, r.Profile); fmt.Sprint(got) != fmt.Sprint(r.S) {
				fail("Score(%q, %d candidates, %s, %s) = %v, want %v", r.Q, len(r.C), r.Lang, r.Profile, got, r.S)
			}
		case "search":
			ix := NewIndex(r.Names, r.Lang, r.Profile)
			for i, q := range r.Queries {
				var got [][2]int
				for _, h := range ix.Search(q, 0) {
					got = append(got, [2]int{h.Name, h.Score})
				}
				if fmt.Sprint(got) != fmt.Sprint(r.Hits[i]) && !(len(got) == 0 && len(r.Hits[i]) == 0) {
					fail("Search(%q) in %s/%s: %v, want %v", q, r.Lang, r.Profile, got, r.Hits[i])
				}
			}
		}
	}
	if rows["score"] < 800 || rows["search"] < 140 || rows["unit"] != 1 {
		t.Fatalf("rows: %v", rows)
	}
	if wrong > 0 {
		t.Fatalf("%d disagreements", wrong)
	}
}
