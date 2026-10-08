package romanize_test

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/micahchoo/indickit/romanize"
	_ "github.com/micahchoo/indickit/romanize/lang/arabic"
	_ "github.com/micahchoo/indickit/romanize/lang/as"
	_ "github.com/micahchoo/indickit/romanize/lang/bn"
	_ "github.com/micahchoo/indickit/romanize/lang/brahmic"
	_ "github.com/micahchoo/indickit/romanize/lang/brx"
	_ "github.com/micahchoo/indickit/romanize/lang/doi"
	_ "github.com/micahchoo/indickit/romanize/lang/gom"
	_ "github.com/micahchoo/indickit/romanize/lang/gu"
	_ "github.com/micahchoo/indickit/romanize/lang/hi"
	_ "github.com/micahchoo/indickit/romanize/lang/kn"
	_ "github.com/micahchoo/indickit/romanize/lang/ks"
	_ "github.com/micahchoo/indickit/romanize/lang/mai"
	_ "github.com/micahchoo/indickit/romanize/lang/meetei"
	_ "github.com/micahchoo/indickit/romanize/lang/ml"
	_ "github.com/micahchoo/indickit/romanize/lang/mni"
	_ "github.com/micahchoo/indickit/romanize/lang/mr"
	_ "github.com/micahchoo/indickit/romanize/lang/ne"
	_ "github.com/micahchoo/indickit/romanize/lang/olchiki"
	_ "github.com/micahchoo/indickit/romanize/lang/or"
	_ "github.com/micahchoo/indickit/romanize/lang/pa"
	_ "github.com/micahchoo/indickit/romanize/lang/sa"
	_ "github.com/micahchoo/indickit/romanize/lang/sat"
	_ "github.com/micahchoo/indickit/romanize/lang/sd"
	_ "github.com/micahchoo/indickit/romanize/lang/ta"
	_ "github.com/micahchoo/indickit/romanize/lang/te"
	_ "github.com/micahchoo/indickit/romanize/lang/ur"
)

// testdata/conformance.jsonl.gz: from the Python reference (linguistic-utilities
// jobs/romanize/export.py). Decode rows [family, lang, unified word, [top 4]] are the
// model's own lists; lookup rows ["names-lookup", lang, word, [spellings]] are what
// Word returns for a known name.
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
	sc := bufio.NewScanner(gz)
	sc.Buffer(make([]byte, 1<<20), 1<<24)
	rows, bad := 0, 0
	for sc.Scan() {
		var row [4]json.RawMessage
		if err := json.Unmarshal(sc.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var fam, lang, word string
		var want []string
		json.Unmarshal(row[0], &fam)
		json.Unmarshal(row[1], &lang)
		json.Unmarshal(row[2], &word)
		json.Unmarshal(row[3], &want)
		var got []string
		switch fam {
		case "names-lookup":
			got = romanize.Word(word, lang, romanize.Names, 4)
		default:
			got = romanize.Decode(word, lang, romanize.Mode(fam), 4)
		}
		rows++
		if fmt.Sprint(got) != fmt.Sprint(want) {
			bad++
			if bad <= 10 {
				t.Errorf("%s %s %q: got %v, want %v", fam, lang, word, got, want)
			}
		}
	}
	if rows < 2000 {
		t.Fatalf("only %d conformance rows", rows)
	}
	if bad > 0 {
		t.Fatalf("%d of %d rows differ", bad, rows)
	}
}

func TestWordAndText(t *testing.T) {
	if got := romanize.Word("लक्ष्मी", "hi", romanize.Words, 1); len(got) != 1 || got[0] == "" {
		t.Errorf("Word: %v", got)
	}
	if got := romanize.Word("लक्ष्मी", "xx", romanize.Words, 1); got != nil {
		t.Errorf("unknown language: %v", got)
	}
	if got := romanize.Text("नमस्ते, दुनिया! 2026", "hi", romanize.Words); got == "नमस्ते, दुनिया! 2026" || got[len(got)-6:] != "! 2026" {
		t.Errorf("Text: %q", got)
	}
	if romanize.Word("लक्ष्मी", "hin", romanize.Words, 1)[0] != romanize.Word("लक्ष्मी", "hi-IN", romanize.Words, 1)[0] {
		t.Error("language tags hin and hi-IN differ")
	}
}

func TestDeterministic(t *testing.T) {
	a := romanize.Word("ಲಕ್ಷ್ಮಿ", "kn", romanize.Words, 4)
	for i := 0; i < 20; i++ {
		if b := romanize.Word("ಲಕ್ಷ್ಮಿ", "kn", romanize.Words, 4); fmt.Sprint(a) != fmt.Sprint(b) {
			t.Fatalf("run %d: %v, then %v", i, a, b)
		}
	}
}
