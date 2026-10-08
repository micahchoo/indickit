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

// testdata/conformance-joined.jsonl.gz: a sample of names (all their words)
// with the joined keys the reference gave them (linguistic-utilities
// jobs/phonetic/export.py writes the sample).
func TestJoinedConformance(t *testing.T) {
	f, err := os.Open("testdata/conformance-joined.jsonl.gz")
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
		var row struct {
			words, want []string
		}
		var raw [2]json.RawMessage
		if err := json.Unmarshal(s.Bytes(), &raw); err != nil {
			t.Fatal(err)
		}
		json.Unmarshal(raw[0], &row.words)
		json.Unmarshal(raw[1], &row.want)
		n++
		if got := JoinedKeys(strings.Join(row.words, " ")); strings.Join(got, " ") != strings.Join(row.want, " ") {
			if wrong < 10 {
				t.Errorf("%v: %v, want %v", row.words, got, row.want)
			}
			wrong++
		}
	}
	if n < 25_000 {
		t.Fatalf("only %d names", n)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d names differ", wrong, n)
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
		{"Imran", "عمران", false},      // known miss: ع is read as a, "Imran" starts with i
		{"Rāma", "राम", true},          // accents are removed
		{"राम", "काम", false},          // Rām is not kām
		{"Ram Singh", "राम", false},    // word counts differ
		{"Block 1", "Block 2", false},  // a number is keyed by its value
		{"Block 12", "ब्लॉक १२", true}, // in any script
		{"1", "2", false},
		{"Singh", "सिंह", true},           // rules 2026-10-07: Latin "ngh" is anusvara + h
		{"Bidhuri", "बिधू\u0921\u093cी", true}, // the flap, as NFC writes it: ड + nukta
		{"Rao", "राव", true},              // व after a is also a vowel
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
	if got := NameKeys("Block 1"); len(got) != 1 || got[0] != "plk 1" {
		t.Errorf(`NameKeys("Block 1") = %q, want ["plk 1"]`, got)
	}
	if got := Keys("॰"); len(got) != 0 { // no letter, no digit: no key, not ""
		t.Errorf(`Keys("॰") = %q, want none`, got)
	}
	if got := JoinedKeys("Ram Nath"); len(got) != 0 { // rnnt: 4 classes, below the floor
		t.Errorf(`JoinedKeys("Ram Nath") = %q, want none`, got)
	}
	a, b = JoinedKeys("Subramanian Swaminathan"), JoinedKeys("சுப்ரமணியன்சுவாமிநாதன்")
	if len(a) == 0 || !shareOne(a, b) { // written apart in one script, joined in another
		t.Errorf("JoinedKeys do not meet: %v and %v", a, b)
	}
	if RulesVersion != "2026-10-07" {
		t.Errorf("RulesVersion = %q", RulesVersion)
	}
}

func BenchmarkKeys(b *testing.B) {
	words := []string{"मोहनलाल", "മോഹൻലാൽ", "சுரேஷ்", "عمران", "bhattacharya", "ꯃꯤꯇꯩ"}
	for i := 0; i < b.N; i++ {
		Keys(words[i%len(words)])
	}
}
