package wellformed

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
	"unicode/utf8"
)

// testdata/conformance.jsonl.gz: [text, i] from the Python reference, i the
// code-point index of the first broken character or null. Clean and broken
// words of every script (corpus and PDF text layers), planted invisible
// characters and damage, whole sentences, Arabic and Ol Chiki runs. The
// TypeScript build reads the same file.
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
	s.Buffer(make([]byte, 1<<20), 1<<20)
	n, broken, wrong := 0, 0, 0
	for s.Scan() {
		var row [2]json.RawMessage
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var input string
		var want *int
		json.Unmarshal(row[0], &input)
		json.Unmarshal(row[1], &want)
		n++
		got := BrokenAt(input)
		gotCP := -1
		if got >= 0 {
			gotCP = utf8.RuneCountInString(input[:got])
		}
		wantCP := -1
		if want != nil {
			wantCP = *want
			broken++
		}
		if gotCP != wantCP || Check(input) != (want == nil) {
			if wrong < 10 {
				t.Errorf("%q: broken at %d, want %d", input, gotCP, wantCP)
			}
			wrong++
		}
	}
	if err := s.Err(); err != nil {
		t.Fatal(err)
	}
	if n < 30_000 || broken < 6_000 {
		t.Fatalf("only %d inputs, %d broken", n, broken)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
}

func TestCases(t *testing.T) {
	cases := []struct {
		in   string
		want int // byte index, or -1
	}{
		{"िहन्दी", 0}, // a vowel sign at the start of a word
		{"हिन्दी", -1},
		{"प्राप्त", -1},
		{"क\u200dि", -1}, // a ZWJ between a consonant and its vowel sign
		{"क्ि", 6},  // a vowel sign after a virama
		{"कंंं", 9}, // a third anusvara
		{"", -1},
		{"abc 123", -1},     // not our scripts
		{"\U0001f600िह", 4}, // the index counts bytes, past the emoji
		{"कि தமிழ்", -1},
		{"कि ि", 7},     // the second word is broken
		{"കൎ", 3},       // Malayalam dot reph at the end of a run
		{"കൎക", -1},     // whole before a consonant
		{"ِا", -1},      // Arabic: always whole
		{"ᱥᱟᱱᱛᱟᱲᱤ", -1}, // Ol Chiki: always whole
	}
	for _, c := range cases {
		if got := BrokenAt(c.in); got != c.want {
			t.Errorf("BrokenAt(%q) = %d, want %d", c.in, got, c.want)
		}
		if got := Check(c.in); got != (c.want < 0) {
			t.Errorf("Check(%q) = %v", c.in, got)
		}
	}
	if RulesVersion != "2026-10-07" {
		t.Errorf("RulesVersion %q", RulesVersion)
	}
}

func BenchmarkCheck(b *testing.B) {
	words := []string{"हिन्दी", "प्राप्त", "िहन्दी", "ಲಕ್ಷ್ಮಿ", "തിരുവനന്തപുരം", "اردو", "English"}
	for i := 0; i < b.N; i++ {
		for _, w := range words {
			Check(w)
		}
	}
}
