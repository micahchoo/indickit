package deromanize_test

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"reflect"
	"testing"

	"github.com/micahchoo/indickit/deromanize"
	_ "github.com/micahchoo/indickit/deromanize/lang/arabic"
	_ "github.com/micahchoo/indickit/deromanize/lang/as"
	_ "github.com/micahchoo/indickit/deromanize/lang/bn"
	_ "github.com/micahchoo/indickit/deromanize/lang/brahmic"
	_ "github.com/micahchoo/indickit/deromanize/lang/brx"
	_ "github.com/micahchoo/indickit/deromanize/lang/doi"
	_ "github.com/micahchoo/indickit/deromanize/lang/gom"
	_ "github.com/micahchoo/indickit/deromanize/lang/gu"
	_ "github.com/micahchoo/indickit/deromanize/lang/hi"
	_ "github.com/micahchoo/indickit/deromanize/lang/kn"
	_ "github.com/micahchoo/indickit/deromanize/lang/ks"
	_ "github.com/micahchoo/indickit/deromanize/lang/mai"
	_ "github.com/micahchoo/indickit/deromanize/lang/meetei"
	_ "github.com/micahchoo/indickit/deromanize/lang/ml"
	_ "github.com/micahchoo/indickit/deromanize/lang/mni"
	_ "github.com/micahchoo/indickit/deromanize/lang/mr"
	_ "github.com/micahchoo/indickit/deromanize/lang/ne"
	_ "github.com/micahchoo/indickit/deromanize/lang/olchiki"
	_ "github.com/micahchoo/indickit/deromanize/lang/or"
	_ "github.com/micahchoo/indickit/deromanize/lang/pa"
	_ "github.com/micahchoo/indickit/deromanize/lang/sa"
	_ "github.com/micahchoo/indickit/deromanize/lang/sat"
	_ "github.com/micahchoo/indickit/deromanize/lang/sd"
	_ "github.com/micahchoo/indickit/deromanize/lang/ta"
	_ "github.com/micahchoo/indickit/deromanize/lang/te"
	_ "github.com/micahchoo/indickit/deromanize/lang/ur"
)

// testdata/conformance.jsonl.gz: from the Python reference (linguistic-utilities
// jobs/deromanize/export.py --conformance): [mode, lang, latin, [first 4]].
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
		var mode, lang, word string
		var want []string
		var row [4]json.RawMessage
		if err := json.Unmarshal(sc.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		json.Unmarshal(row[0], &mode)
		json.Unmarshal(row[1], &lang)
		json.Unmarshal(row[2], &word)
		json.Unmarshal(row[3], &want)
		got := deromanize.Word(word, lang, deromanize.Mode(mode), 4)
		rows++
		if len(got) == 0 && len(want) == 0 {
			continue
		}
		if !reflect.DeepEqual(got, want) {
			bad++
			if bad <= 5 {
				t.Errorf("%s %s %q: got %q, want %q", mode, lang, word, got, want)
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

func TestLanguages(t *testing.T) {
	if n := len(deromanize.Languages(deromanize.Words)); n != 21 {
		t.Errorf("words mode: %d languages, want 21", n)
	}
	if n := len(deromanize.Languages(deromanize.Names)); n != 22 {
		t.Errorf("names mode: %d languages, want 22", n)
	}
}

func TestDeterministic(t *testing.T) {
	a := deromanize.Word("bhavishyavaaniyaan", "hi", deromanize.Words, 4)
	for i := 0; i < 3; i++ {
		if b := deromanize.Word("bhavishyavaaniyaan", "hi", deromanize.Words, 4); !reflect.DeepEqual(a, b) {
			t.Fatalf("%q then %q", a, b)
		}
	}
}

// A spelling that writes nothing for a consonant is cut short; the re-rank's
// frequency bonus put such strings first in names mode (ml murmu → മു, ur
// chandrayaan → ان, ks rajnath → راج; rules 2026-10-09). The silent letters still
// write nothing: the inherent a (kamal → कमल), a doubled consonant (mohammad → محمد).
func TestCutShortSpellingIsNotFirst(t *testing.T) {
	cases := []struct {
		word, lang string
		mode       deromanize.Mode
		want       []string // the first answer is one of these
		not        string   // the cut-short spelling v0.8.0 gave first
	}{
		{"murmu", "ml", deromanize.Names, []string{"മുര്മു"}, "മു"},
		{"chandrayaan", "ur", deromanize.Names, []string{"چندریان"}, "ان"},
		{"rajnath", "ks", deromanize.Names, []string{"رجناتھ", "راجناتھ"}, "راج"},
		{"rajnath", "gom", deromanize.Names, []string{"राज्नाथ", "रजनाथ", "राजनाथ"}, "राजन"},
		{"rajnath", "mni", deromanize.Names, []string{"ꯔꯥꯖꯅ", "ꯔꯥꯖꯅꯠ", "ꯔꯥꯖꯅꯥꯠ"}, "ꯔꯥꯖ"},
		{"murmu", "mni", deromanize.Names, []string{"ꯃꯨꯔꯃꯨ"}, "ꯃꯨ"},
		{"kamal", "hi", deromanize.Words, []string{"कमल"}, ""},
		{"mohammad", "ur", deromanize.Names, []string{"محمد"}, ""},
	}
	for _, c := range cases {
		got := deromanize.Word(c.word, c.lang, c.mode, 4)
		if len(got) == 0 || got[0] == c.not {
			t.Errorf("%s %s %q: got %q, a cut-short spelling first", c.mode, c.lang, c.word, got)
			continue
		}
		ok := false
		for _, w := range c.want {
			ok = ok || got[0] == w
		}
		if !ok {
			t.Errorf("%s %s %q: got %q, want one of %q first", c.mode, c.lang, c.word, got, c.want)
		}
	}
	if deromanize.RulesVersion < "2026-10-09" {
		t.Errorf("rules version %s predates the cut-short guard", deromanize.RulesVersion)
	}
}
