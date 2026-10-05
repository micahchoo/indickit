package phonetic

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"sort"
	"strings"
	"testing"
)

// testdata/conformance.jsonl.gz holds every word of the evaluation data with
// the keys the Python reference gave it. The TypeScript build reads the same
// file; both must agree with it on every word.
func TestConformance(t *testing.T) {
	f, err := os.Open("testdata/conformance.jsonl.gz")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	s := bufio.NewScanner(gz)
	n, wrong := 0, 0
	for s.Scan() {
		var row [2]json.RawMessage
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var word string
		var want []string
		json.Unmarshal(row[0], &word)
		json.Unmarshal(row[1], &want)
		sort.Strings(want)
		n++
		if got := Keys(word); strings.Join(got, " ") != strings.Join(want, " ") {
			if wrong < 10 {
				t.Errorf("%s: %v, want %v", word, got, want)
			}
			wrong++
		}
	}
	if n < 190_000 {
		t.Fatalf("only %d words", n)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d words differ", wrong, n)
	}
}

func TestMatch(t *testing.T) {
	for _, c := range []struct {
		a, b string
		want bool
	}{
		{"राम", "ರಾಮ", true},
		{"Ram", "राम", true},
		{"मोहनलाल", "മോഹൻലാൽ", true},
		{"सुरेश", "சுரேஷ்", true},
		{"Parvez Khan", "پرویز خان", true},
		{"Imran", "عمران", false},   // known miss: ع is read as a, "Imran" starts with i
		{"Rāma", "राम", true},       // accents are removed
		{"राम", "काम", false},       // Rām is not kām
		{"Ram Singh", "राम", false}, // word counts differ
	} {
		if got := Match(c.a, c.b); got != c.want {
			t.Errorf("Match(%q, %q) = %v, want %v", c.a, c.b, got, c.want)
		}
	}
}

func TestNameKeys(t *testing.T) {
	a, b := NameKeys("Shri Narendra Modi (politician)"), NameKeys("श्री नरेंद्र मोदी")
	if !shareOne(a, b) {
		t.Errorf("NameKeys do not meet: %v and %v", a, b)
	}
	if RulesVersion == "" {
		t.Error("RulesVersion is empty")
	}
}

func BenchmarkKeys(b *testing.B) {
	words := []string{"मोहनलाल", "മോഹൻലാൽ", "சுரேஷ்", "عمران", "bhattacharya", "ꯃꯤꯇꯩ"}
	for i := 0; i < b.N; i++ {
		Keys(words[i%len(words)])
	}
}
