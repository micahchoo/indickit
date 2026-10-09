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

// A joiner after the virama shapes the letter and spells nothing. Left in place, it put
// the beam on the path that spells everything before it as "" (प्राप्\u200dत gave "the";
// the demo job, 2026-10-08). Word deletes U+200C and U+200D before the lookup and the decode.
func TestJoinersAreDeleted(t *testing.T) {
	for _, c := range []struct{ joined, plain string }{
		{"प्राप्\u200dत", "प्राप्त"}, {"उन्\u200dहोंने", "उन्होंने"}, {"विश्\u200dव", "विश्व"}, {"प्राप्\u200cत", "प्राप्त"},
	} {
		for _, mode := range []romanize.Mode{romanize.Words, romanize.Names} {
			got, want := romanize.Word(c.joined, "hi", mode, 4), romanize.Word(c.plain, "hi", mode, 4)
			if fmt.Sprint(got) != fmt.Sprint(want) {
				t.Errorf("%s %q: %v, without the joiner %v", mode, c.joined, got, want)
			}
		}
	}
	if got := romanize.Text("प्राप्\u200dत", "hi", romanize.Words); got != "praapt" {
		t.Errorf("Text with a joiner: %q", got)
	}
	if got := romanize.Word("\u200d", "hi", romanize.Words, 4); len(got) != 0 {
		t.Errorf("a joiner alone: %v", got)
	}
}

// Manipuri is written in Meetei Mayek and in Bengali script. Its own tables hold Meetei
// Mayek only; a Bengali-script word is spelled by the shared Brahmic table, so the pooled
// file must be the Brahmic one (v0.6.0 loaded a Meetei-only file: রামেন gave "en").
func TestManipuriInBengaliScript(t *testing.T) {
	for w, want := range map[string]string{"রামেন": "ramen", "ওরাম": "oram", "রামদারশ": "ramdarsh", "ꯔꯥꯝ": "ram"} {
		if got := romanize.Word(w, "mni", romanize.Names, 1); len(got) != 1 || got[0] != want {
			t.Errorf("mni names %q: %v, want %q", w, got, want)
		}
	}
	if got := romanize.Text("ꯔꯥꯝ, রামেন", "mni", romanize.Names); got != "ram, ramen" {
		t.Errorf("Text in both scripts: %q", got)
	}
}
