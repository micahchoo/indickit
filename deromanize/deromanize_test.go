package deromanize_test

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"reflect"
	"slices"
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
	"github.com/micahchoo/indickit/normalize"
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

// Rules 2026-10-12: a spelling the renderer draws broken, or with punctuation inside (a
// danda or an Arabic comma learned into a chunk), goes after every whole one, in both
// modes (rule wf); and the cut-short guard is on in words mode for ks mni sa sd, each
// judged in its own language (rules "cut_langs").
func TestBrokenOrCutWordIsNotFirst(t *testing.T) {
	cases := []struct {
		word, lang string
		want, not  string // the first answer now, and the one rules 2026-10-09.2 gave
	}{
		{"diyagayahe", "ur", "دیاگیاہے", "دیاگیاہے۔"},     // wf: punctuation
		{"hataaundathe", "ne", "हाताउँदथे", "हाताउँदथे।"}, // wf: a danda
		{"rafi", "sd", "رافي", "ري،"},                     // the guard (sd) and wf
		{"hinzi", "ks", "ہنزی", "ہندی"},                   // the guard (ks): nothing written for z
	}
	for _, c := range cases {
		got := deromanize.Word(c.word, c.lang, deromanize.Words, 4)
		if len(got) == 0 || got[0] != c.want {
			t.Errorf("%s %q: got %q, want %q first (not %q)", c.lang, c.word, got, c.want, c.not)
		}
	}
	if deromanize.RulesVersion < "2026-10-12" {
		t.Errorf("rules version %s predates rule wf and cut_langs", deromanize.RulesVersion)
	}
}

// Rules 2026-10-12.1: the output is normalized text. With normalize 2026-10-12.1 a spelling
// with a two-part vowel sign typed in the other order (জােট) is keyed as the frequent word
// (জোট) and took its count, so it rose to second as a string normalize would rewrite.
func TestOutputIsNormalizedText(t *testing.T) {
	for _, c := range []struct{ word, lang string }{{"jaate", "bn"}, {"hoayar", "bn"}, {"phogat", "ta"}} {
		for _, mode := range []deromanize.Mode{deromanize.Words, deromanize.Names} {
			got := deromanize.Word(c.word, c.lang, mode, 4)
			if len(got) == 0 {
				t.Fatalf("%s %q %s: nothing", c.lang, c.word, mode)
			}
			for i, o := range got {
				if n := normalize.Text(o, c.lang); n != o {
					t.Errorf("%s %q %s: %q is not normalized (normalize writes %q)", c.lang, c.word, mode, o, n)
				}
				if slices.Contains(got[:i], o) {
					t.Errorf("%s %q %s: %q twice in %q", c.lang, c.word, mode, o, got)
				}
			}
		}
	}
	if deromanize.RulesVersion < "2026-10-12.1" {
		t.Errorf("rules version %s predates the normalized output", deromanize.RulesVersion)
	}
}

// testdata/english-conformance.jsonl.gz: from the Python reference (linguistic-utilities
// jobs/deromanize/export.py --conformance): ["english", lang, word, bool] and
// ["text-mixed", lang, text, output].
func TestEnglishConformance(t *testing.T) {
	f, err := os.Open("testdata/english-conformance.jsonl.gz")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	sc := bufio.NewScanner(gz)
	rows := 0
	for sc.Scan() {
		var row [4]json.RawMessage
		if err := json.Unmarshal(sc.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var kind, lang, in string
		json.Unmarshal(row[0], &kind)
		json.Unmarshal(row[1], &lang)
		json.Unmarshal(row[2], &in)
		rows++
		switch kind {
		case "english":
			var want bool
			json.Unmarshal(row[3], &want)
			if got := deromanize.English(in, lang); got != want {
				t.Errorf("English(%q, %s) = %v, want %v", in, lang, got, want)
			}
		case "text-mixed":
			var want string
			json.Unmarshal(row[3], &want)
			if got := deromanize.TextMixed(in, lang, deromanize.Words); got != want {
				t.Errorf("TextMixed(%q, %s) = %q, want %q", in, lang, got, want)
			}
		default:
			t.Fatalf("unknown row kind %q", kind)
		}
	}
	if rows < 40 {
		t.Fatalf("only %d rows", rows)
	}
}

// A language with no English list: TextMixed is Text.
func TestTextMixedWithoutList(t *testing.T) {
	for _, s := range []string{"kal meeting hai", "the office", ""} {
		if a, b := deromanize.TextMixed(s, "mr", deromanize.Words), deromanize.Text(s, "mr", deromanize.Words); a != b {
			t.Errorf("mr %q: TextMixed %q, Text %q", s, a, b)
		}
	}
}
