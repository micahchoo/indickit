package segment

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strings"
	"testing"
)

// testdata/conformance.jsonl.gz: every case of Unicode's
// GraphemeBreakTest-17.0.0, every context the joins decide, and every
// distinct word of the evaluation text, with the boundaries the Python
// reference gave. The TypeScript build reads the same file.
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
		var row [2]json.RawMessage
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var input string
		var want []int
		json.Unmarshal(row[0], &input)
		json.Unmarshal(row[1], &want)
		n++
		if got := CodePointBounds(input); fmt.Sprint(got) != fmt.Sprint(want) && !(len(got) == 0 && len(want) == 0) {
			if wrong < 10 {
				t.Errorf("%q: %v, want %v", input, got, want)
			}
			wrong++
		}
	}
	if err := s.Err(); err != nil {
		t.Fatal(err)
	}
	if n < 850_000 {
		t.Fatalf("only %d inputs", n)
	}
	if wrong > 0 {
		t.Fatalf("%d of %d inputs differ", wrong, n)
	}
}

func TestCases(t *testing.T) {
	cases := []struct {
		in   string
		want []string
	}{
		{"ಲಕ್ಷ್ಮಿ", []string{"ಲ", "ಕ್ಷ್ಮಿ"}},
		{"ਪ੍ਰੀਤ", []string{"ਪ੍ਰੀ", "ਤ"}},
		{"অ্যাপ", []string{"অ্যা", "প"}},
		{"ஸ்ரீ", []string{"ஸ்ரீ"}},
		{"लक्ष्मी", []string{"ल", "क्ष्मी"}},
		{"ਕ੍ਕ", []string{"ਕ੍", "ਕ"}},             // Gurmukhi shows the halant
		{"க்ரீ", []string{"க்", "ரீ"}},           // only ஸ்ரீ is one shape
		{"ಕ್\u200cಷ", []string{"ಕ್\u200c", "ಷ"}}, // ZWNJ asks for two
		{"👨\u200d👩\u200d👧🇮🇳e\u0301", []string{"👨\u200d👩\u200d👧", "🇮🇳", "e\u0301"}},
		{"", nil},
	}
	for _, c := range cases {
		if got := Segment(c.in); !reflect.DeepEqual(got, c.want) {
			t.Errorf("Segment(%q) = %q, want %q", c.in, got, c.want)
		}
	}
	if Count("ಕನ್ನಡ") != 3 {
		t.Errorf("Count(ಕನ್ನಡ) = %d, want 3", Count("ಕನ್ನಡ"))
	}
	for _, s := range []string{"ಲಕ್ಷ್ಮಿ ನಾರಾಯಣ", "ਪੰਜਾਬ", "a\r\nb", "🏳\ufe0f\u200d🌈x"} {
		if got := strings.Join(Segment(s), ""); got != s {
			t.Errorf("Segment(%q) joins to %q", s, got)
		}
	}
	if RulesVersion != "2026-10-06" || UnicodeVersion != "17.0.0" {
		t.Errorf("versions %q %q", RulesVersion, UnicodeVersion)
	}
}

func BenchmarkSegment(b *testing.B) {
	words := []string{"ಲಕ್ಷ್ಮಿ", "ಕನ್ನಡ", "ਪੰਜਾਬ", "ਪ੍ਰੀਤ", "हिन्दी", "English", "👨\u200d👩\u200d👧"}
	for i := 0; i < b.N; i++ {
		for _, w := range words {
			Segment(w)
		}
	}
}
