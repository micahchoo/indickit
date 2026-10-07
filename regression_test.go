// Regression tests for the code-floor findings of the release job
// (linguistic-utilities jobs/release/reports/02-battletest-code-floor.md;
// the fixes: 03-code-floor-fixes.md). Each test failed on v0.4.3.
package indickit_test

import (
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/stem"
)

// Finding 1: Words splits on the reference's spaces (Python \s), in Go and
// in TypeScript. phonetic/words_test.go checks every code point.
func TestWordsSplitOnUnicodeSpace(t *testing.T) {
	for _, sp := range []string{"\u00a0", "\u2003", "\u202f", "\u3000", "\u2028", "\u0085"} {
		if got := phonetic.Words("र\u093eम" + sp + "स\u093f\u0902ह"); len(got) != 2 {
			t.Errorf("Words(र\u093eम %+q स\u093f\u0902ह) = %+q, want 2 words", sp, got)
		}
	}
	if got := phonetic.Words("\ufeffर\u093eम"); len(got) != 1 {
		t.Errorf("a BOM is not a space: Words = %+q", got)
	}
	if !phonetic.Match("र\u093eम\u00a0स\u093f\u0902ह", "र\u093eम स\u093f\u0902ह") {
		t.Error("a no-break space changes the match")
	}
}

// Finding 2 (Go side of the 1 MB failures): NameKeys is linear. Before
// v0.4.4 it copied every prefix for every word: 60 KB of "கா " took about
// 2.6 s, and 1 MB of Tamil 70 s.
func TestNameKeysLinear(t *testing.T) {
	name := strings.Repeat("க\u0bbe ", 20000)
	start := time.Now()
	ks := phonetic.NameKeys(name)
	if d := time.Since(start); d > 2*time.Second {
		t.Errorf("NameKeys of 60 KB took %v", d)
	}
	if len(ks) != phonetic.MaxNameKeys {
		t.Errorf("%d keys, want %d", len(ks), phonetic.MaxNameKeys)
	}
}

// Finding 4: x/text's NFC puts U+034F after every 30 non-starters (the
// Stream-Safe Text Format); ICU and Python's unicodedata do not, and
// neither does indickit (internal/unorm).
func TestNoGraphemeJoinerInserted(t *testing.T) {
	s := "क" + strings.Repeat("\u094d", 31)
	if got := normalize.Text(s, "hi"); got != s {
		t.Errorf("Text(क + 31 viramas) has %d extra runes", len([]rune(got))-len([]rune(s)))
	}
	if got, want := normalize.Text("e"+strings.Repeat("\u0301", 31), ""), "é"+strings.Repeat("\u0301", 30); got != want {
		t.Errorf("Text(e + 31 acutes) = %+q", got)
	}
}

// Finding 6, first promise, with its scope: normalizing twice gives what
// normalizing once gives, for text with at most 8 invisible characters.
// Each pass deletes one BOM or WJ of a chain before a sign with no class
// (U+0AF0), and the rules stop after 8 passes (normalize/rules.json
// max_passes). Widening the scope is a rules change for the research repo.
func TestTextTwiceIsOnce(t *testing.T) {
	for _, inv := range []string{"\ufeff", "\u2060", "\u200b", "\u200c", "\u200d", "\u00ad"} {
		for n := 1; n <= 8; n++ {
			s := strings.Repeat(inv, n) + "૰"
			if once := normalize.Text(s, ""); normalize.Text(once, "") != once {
				t.Errorf("Text(%d x %+q + ૰) is not settled after one call", n, inv)
			}
		}
	}
	// The edge of the scope. When this fails, the promise is wider: update
	// the README and this test.
	s := strings.Repeat("\ufeff", 9) + "૰"
	if once := normalize.Text(s, ""); normalize.Text(once, "") == once {
		t.Error("9 BOMs + ૰ now settle in one call: widen the promise in the README")
	}
}

// Finding 6, second promise, with its scope: normalize changes no key of a
// word with no invisible character. A word that holds one can change: the
// Urdu reader's first and last letter see it, and a word of marks and Latin
// letters is read as Latin only without it. The known cases are below.
func TestKeysUnchangedByNormalize(t *testing.T) {
	for _, s := range []string{"फ\u093c\u093eत\u093fम\u093e", "فاطمہ", "عمران", "മ\u0d4bഹൻല\u0d3eൽ", "অ\u0982শগ\u09cdরহণ", "Rāma", "ஸ\u0bcdர\u0bc0", "১২"} {
		if a, b := phonetic.Keys(s), phonetic.Keys(normalize.Text(s, "")); !reflect.DeepEqual(a, b) {
			t.Errorf("Keys(%+q) = %v, Keys(Text) = %v", s, a, b)
		}
	}
	for _, s := range []string{"فاطمہ\u200c", "\ufeffعمران", "\u0b01\u200c", "\u0ce2\u200cR"} {
		if a, b := phonetic.Keys(s), phonetic.Keys(normalize.Text(s, "")); reflect.DeepEqual(a, b) {
			t.Errorf("Keys(%+q) no longer changes under Text: widen the promise in the README", s)
		}
	}
}

// Finding 7: a word with no letter and no number has no key, so it matches
// nothing (rules 2026-10-06.1).
func TestNoLetterNoKey(t *testing.T) {
	if got := phonetic.Keys("!!!"); len(got) != 0 {
		t.Errorf("Keys(!!!) = %q, want none", got)
	}
	for _, p := range [][2]string{{"!", "?"}, {"Søren", "Bjørn"}, {"\ufeffRam", "\u200bSita"}, {"Block 1", "Block 2"}} {
		if phonetic.Match(p[0], p[1]) {
			t.Errorf("Match(%+q, %+q) = true", p[0], p[1])
		}
	}
}

// Finding 8: a language tag counts only by its language: case, region and
// script do not, and an ISO 639-2 code is its two-letter code.
func TestLanguageTags(t *testing.T) {
	as := normalize.Text("অ\u0982শগ\u09cdরহণ", "as")
	if as == normalize.Text("অ\u0982শগ\u09cdরহণ", "") {
		t.Fatal("the test word does not depend on the language")
	}
	for _, tag := range []string{"AS", "as-IN", "as_IN", "asm", "As-Beng-IN"} {
		if got := normalize.Text("অ\u0982শগ\u09cdরহণ", tag); got != as {
			t.Errorf("Text(…, %q) is not Text(…, as)", tag)
		}
	}
	ta := stem.Stem("ஆண\u0bcdட\u0bbfல\u0bcd", "ta")
	for _, tag := range []string{"TA", "ta-IN", "tam", "ta_LK"} {
		if got := stem.Stem("ஆண\u0bcdட\u0bbfல\u0bcd", tag); got != ta {
			t.Errorf("Stem(…, %q) = %q, want %q", tag, got, ta)
		}
	}
	for _, tag := range []string{"en", "xx", ""} {
		if got := stem.Stem("ஆண\u0bcdட\u0bbfல\u0bcd", tag); got != "ஆண\u0bcdட\u0bbfல\u0bcd" {
			t.Errorf("Stem(…, %q) = %q, want the word", tag, got)
		}
	}
}
