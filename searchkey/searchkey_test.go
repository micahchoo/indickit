package searchkey

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
)

// ../stem/testdata/conformance-search-key.jsonl.gz: [lang, word, key], every
// tenth input of stem's file, from the Python reference (stem.search_key).
func TestConformance(t *testing.T) {
	f, err := os.Open("../stem/testdata/conformance-search-key.jsonl.gz")
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
		if got := Key(row[1], row[0]); got != row[2] {
			if wrong < 10 {
				t.Errorf("Key(%q, %q) = %q, want %q", row[1], row[0], got, row[2])
			}
			wrong++
		}
	}
	if n < 50_000 || wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
}

func TestSpellingsMeet(t *testing.T) {
	if Key("हिन्दी", "hi") != Key("हिंदी", "hi") {
		t.Error("two spellings of one word should give one key")
	}
}
