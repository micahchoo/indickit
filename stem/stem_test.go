package stem

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
)

// testdata/conformance.jsonl.gz: [lang, word, stem] from the Python
// reference (linguistic-utilities eval/stem.py): every distinct word of
// PIB and FLORES+ in each language, every ending alone and after a few
// letters, words of another language, and an unknown language. The
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
	n, wrong := 0, 0
	for s.Scan() {
		var row [3]string
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		n++
		if got := Stem(row[1], row[0]); got != row[2] {
			if wrong < 10 {
				t.Errorf("Stem(%q, %q) = %q, want %q", row[1], row[0], got, row[2])
			}
			wrong++
		}
	}
	if err := s.Err(); err != nil {
		t.Fatal(err)
	}
	if n < 400_000 {
		t.Fatalf("only %d inputs", n)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
}

func TestCases(t *testing.T) {
	if Stem("ஆண்டில்", "ta") != Stem("ஆண்டு", "ta") {
		t.Error("Tamil: a case ending and the enunciative u should meet")
	}
	if Stem("ಪ್ರಧಾನಮಂತ್ರಿಯವರು", "kn") != Stem("ಪ್ರಧಾನಮಂತ್ರಿ", "kn") {
		t.Error("Kannada: two passes should take the honorific and the stem vowel")
	}
	if got := Stem("ஆண்டில்", "xx"); got != "ஆண்டில்" {
		t.Errorf("unknown language: %q, want the word unchanged", got)
	}
	if got := Stem("क", "hi"); got != "क" {
		t.Errorf("too short to cut: %q", got)
	}
	if len(Languages()) != 13 || RulesVersion == "" {
		t.Errorf("languages %v, version %q", Languages(), RulesVersion)
	}
}
