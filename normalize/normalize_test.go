package normalize

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
)

// testdata/conformance.jsonl.gz holds [text, lang, normalize, fold] from the
// Python reference: corpus words that either function changes, planted
// invisible characters, fuzz strings. The TypeScript build reads the same
// file; both must agree with it on every line.
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
		var row [4]*string
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		lang := ""
		if row[1] != nil {
			lang = *row[1]
		}
		n++
		gotN, gotF := Text(*row[0], lang), Fold(*row[0], lang)
		if gotN != *row[2] || gotF != *row[3] {
			if wrong < 10 {
				t.Errorf("%+q (%s): Text %+q, Fold %+q; want %+q, %+q", *row[0], lang, gotN, gotF, *row[2], *row[3])
			}
			wrong++
		}
	}
	if err := s.Err(); err != nil {
		t.Fatal(err)
	}
	if n < 300_000 {
		t.Fatalf("only %d inputs", n)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
}

func TestCases(t *testing.T) {
	const zwnj, zwj = "\u200c", "\u200d"
	cases := []struct{ in, lang, want string }{
		{"र्" + zwj + "य", "mr", "र्" + zwj + "य"},                                 // eyelash ra: the ZWJ is visible
		{"ಸಿಕಾರ್" + zwnj, "kn", "ಸಿಕಾರ್"},                                          // a final ZWNJ draws nothing
		{"അവന്" + zwj, "ml", "അവൻ"},                                                // old chillu -> atomic chillu
		{"অংশগ্রহণ", "as", "অংশগ্ৰহণ"},                                             // Assamese ra
		{"\U0001F468" + zwj + "\U0001F469", "", "\U0001F468" + zwj + "\U0001F469"}, // emoji: not ours
	}
	for _, c := range cases {
		if got := Text(c.in, c.lang); got != c.want {
			t.Errorf("Text(%+q, %q) = %+q, want %+q", c.in, c.lang, got, c.want)
		}
	}
	if got := Fold("हिन्दी", "hi"); got != "हिंदी" {
		t.Errorf("Fold(हिन्दी) = %+q", got)
	}
}
