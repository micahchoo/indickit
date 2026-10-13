package romanize_test

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"slices"
	"strings"
	"testing"
	"unicode"

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
// Word returns for a known name; route rows ["names-routed", lang, word, [top 4]] are
// what WordWith returns in the names mode with Options{Route: true} (Hindi, rules 2026-10-13).
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
		case "names-routed":
			var err error
			if got, err = romanize.WordWith(word, lang, romanize.Names, 4, romanize.Options{Route: true}); err != nil {
				t.Fatal(err)
			}
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

// A run of the script starts at a letter or a mark, never at a joiner: a joiner
// where no run goes on (the text's start, after a space, after an unassigned code
// point) is other text, and Text keeps it. TypeScript deleted it (perf job, phase 2).
func TestTextKeepsAJoinerOutsideARun(t *testing.T) {
	for _, c := range []struct{ lang, in, want string }{
		{"ta", "\u0b95\u0ba1\u200d\u0ba8\u0bca", "ka\u0ba1\u200dnoo"},
		{"hi", "\u200d\u0915\u092e\u0932", "\u200dkamal"},
		{"hi", "\u0915\u092e\u0932 \u200c\u0915\u092e\u0932", "kamal \u200ckamal"},
	} {
		if got := romanize.Text(c.in, c.lang, romanize.Words); got != c.want {
			t.Errorf("Text(%+q) = %+q, want %+q", c.in, got, c.want)
		}
	}
}

// A word over max_letters gets one spelling: each piece's first, joined. The beam's
// ties made a long run quadratic (perf job, phase 3b: 32K code points, 49 s).
func TestALongWordIsRomanizedInPieces(t *testing.T) {
	const cap = 256
	rs := []rune(strings.Repeat("\u0915\u092e\u0932", 100)) // कमल x 100: 300 code points
	var want strings.Builder
	for i := 0; i < len(rs); i += cap {
		want.WriteString(romanize.Word(string(rs[i:min(i+cap, len(rs))]), "hi", romanize.Words, 1)[0])
	}
	if got := romanize.Word(string(rs), "hi", romanize.Words, 4); fmt.Sprint(got) != fmt.Sprint([]string{want.String()}) {
		t.Errorf("Word of 300 code points = %v, want [%s]", got, want.String())
	}
	if got := romanize.Text(string(rs), "hi", romanize.Words); got != want.String() {
		t.Errorf("Text of 300 code points = %q, want %q", got, want.String())
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

// Places mode (rules 2026-10-11.1): its own tables on the route, the Words tables elsewhere.
func TestPlacesRoute(t *testing.T) {
	if n := len(romanize.Languages(romanize.Places)); n != 22 {
		t.Errorf("places mode: %d languages, want 22", n)
	}
	for _, w := range []string{"ಬೆಂಗಳೂರು", "ಮೈಸೂರು", "ಹುಬ್ಬಳ್ಳಿ"} { // Kannada is off the route
		if p, q := romanize.Word(w, "kn", romanize.Places, 4), romanize.Word(w, "kn", romanize.Words, 4); !reflect.DeepEqual(p, q) {
			t.Errorf("kn %s: places %v, words %v", w, p, q)
		}
	}
	differ := 0
	for _, w := range []string{"திருச்சிராப்பள்ளி", "காஞ்சிபுரம்", "தஞ்சாவூர்", "கோயம்புத்தூர்"} { // Tamil is on it
		if !reflect.DeepEqual(romanize.Word(w, "ta", romanize.Places, 4), romanize.Word(w, "ta", romanize.Words, 4)) {
			differ++
		}
	}
	if differ == 0 {
		t.Error("ta: places mode gives the words mode's lists: its own tables are not loaded")
	}
}

// The Hindi route is an option (rules 2026-10-13): Word in the names mode routes
// nothing; WordWith with Options{Route: true} keeps the names list for a word the
// names tables were trained on and gives any other word the words list. Unseen names
// in news are spelled better by the words tables in Hindi (PIB, held out: 55.0% to
// 62.2%), not in the other languages (Wikidata's unseen names fall).
func TestHindiNamesRoute(t *testing.T) {
	route := romanize.Options{Route: true}
	word := func(w, lang string) []string {
		got, err := romanize.WordWith(w, lang, romanize.Names, 4, route)
		if err != nil {
			t.Fatal(err)
		}
		return got
	}
	// पुष्पेन्द्र is in hi.known.bin: the names list either way (the words list ends pushpandra, pushpendr)
	for _, got := range [][]string{romanize.Word("पुष्पेन्द्र", "hi", romanize.Names, 4), word("पुष्पेन्द्र", "hi")} {
		if fmt.Sprint(got) != "[pushpendra pushpender pushpinder puspendra]" {
			t.Errorf("a known name: %v", got)
		}
	}
	for _, w := range []string{"गेवरा", "झुमरीतलैया"} { // not in the list
		names, words := romanize.Word(w, "hi", romanize.Names, 4), romanize.Word(w, "hi", romanize.Words, 4)
		if got := word(w, "hi"); !reflect.DeepEqual(got, words) {
			t.Errorf("hi %s routed: %v, words %v", w, got, words)
		}
		if reflect.DeepEqual(names, words) {
			t.Errorf("hi %s: Word in the names mode gives the words list %v: the default routed", w, names)
		}
	}
	for _, w := range []string{"गेवरा", "झुमरीतलैया", "पुष्पेन्द्र"} { // Marathi has no route: the option changes nothing
		if got, want := word(w, "mr"), romanize.Word(w, "mr", romanize.Names, 4); !reflect.DeepEqual(got, want) {
			t.Errorf("mr %s: routed %v, names %v", w, got, want)
		}
	}
	got, err := romanize.TextWith("पुष्पेन्द्र गेवरा", "hi", romanize.Names, route)
	if err != nil || got != "pushpendra "+romanize.Word("गेवरा", "hi", romanize.Words, 1)[0] {
		t.Errorf("TextWith: %q, %v", got, err)
	}
	if !slices.Contains(romanize.Languages(romanize.Names), "hi") {
		t.Error("Languages(Names) lacks hi")
	}
}

// Text cuts a run at punctuation, so a known word with punctuation ('धूमिल', अल-अबिदीन) could
// never match the route's list: the list holds the bare runs Text sees (rules 2026-10-13).
func TestRouteListHoldsBareRuns(t *testing.T) {
	b, err := os.ReadFile("lang/hi/hi.known.bin")
	if err != nil {
		t.Fatal(err)
	}
	for _, w := range strings.Split(string(b[5:]), "\n") { // "IKR1", then 0: no strings
		for _, r := range w {
			if !unicode.IsLetter(r) && !unicode.IsMark(r) {
				t.Errorf("hi.known.bin %q: %U is not a letter or a mark", w, r)
				break
			}
		}
	}
	route := romanize.Options{Route: true}
	got, err := romanize.TextWith("'धूमिल' अल-अबिदीन", "hi", romanize.Names, route)
	var want []string
	for _, w := range []string{"धूमिल", "अल", "अबिदीन"} {
		s, _ := romanize.WordWith(w, "hi", romanize.Names, 1, route)
		want = append(want, s[0])
	}
	if err != nil || got != fmt.Sprintf("'%s' %s-%s", want[0], want[1], want[2]) {
		t.Errorf("TextWith: %q (%v), want the routed words %v", got, err, want)
	}
}
