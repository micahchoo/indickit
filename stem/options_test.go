package stem

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
)

func rows(t *testing.T, path string, each func(raw []byte)) int {
	t.Helper()
	f, err := os.Open(path)
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
	n := 0
	for s.Scan() {
		each(s.Bytes())
		n++
	}
	if err := s.Err(); err != nil {
		t.Fatal(err)
	}
	return n
}

// testdata/conformance-min4.jsonl.gz: [lang, word, stem at MinStem 4], every
// tenth input of the main file, from the Python reference.
func TestMinStemConformance(t *testing.T) {
	wrong := 0
	n := rows(t, "testdata/conformance-min4.jsonl.gz", func(raw []byte) {
		var row [3]string
		if err := json.Unmarshal(raw, &row); err != nil {
			t.Fatal(err)
		}
		if got := StemWith(row[1], row[0], Options{MinStem: 4}); got != row[2] {
			if wrong < 10 {
				t.Errorf("StemWith(%q, %q, MinStem 4) = %q, want %q", row[1], row[0], got, row[2])
			}
			wrong++
		}
	})
	if n < 50_000 || wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
	if StemWith("करीना", "hi", Options{}) != Stem("करीना", "hi") {
		t.Error("the zero Options must be Stem")
	}
}

// testdata/conformance-compounds-ml.jsonl.gz: [word, first member or null] for
// every Malayalam input of the main file, from the Python reference.
func TestCompoundConformance(t *testing.T) {
	wrong, keyed := 0, 0
	n := rows(t, "testdata/conformance-compounds-ml.jsonl.gz", func(raw []byte) {
		var row [2]*string
		if err := json.Unmarshal(raw, &row); err != nil {
			t.Fatal(err)
		}
		got, ok := CompoundKey(*row[0])
		want, wantOK := "", row[1] != nil
		if wantOK {
			want = *row[1]
			keyed++
		}
		if got != want || ok != wantOK {
			if wrong < 10 {
				t.Errorf("CompoundKey(%q) = %q, %v; want %q, %v", *row[0], got, ok, want, wantOK)
			}
			wrong++
		}
	})
	if n < 50_000 || keyed < 5_000 || wrong > 0 {
		t.Fatalf("%d of %d inputs differ (%d keyed)", wrong, n, keyed)
	}
}
