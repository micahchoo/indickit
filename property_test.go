// Properties that strings alone can check (indickit MAINTAINING.md, step
// 14), on random strings drawn from the Indic blocks, invisible
// characters, Latin and combining marks. Each Fuzz target is also a plain
// test: `go test` runs its seeds; `go test -fuzz=FuzzX -fuzztime=60s` searches.
//
// From the release job's code floor (linguistic-utilities
// jobs/release/reports/02-battletest-code-floor.md). Two promises hold only
// in a scope; regression_test.go pins the edge of each.
package indickit_test

import (
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/micahchoo/indickit/internal/unorm"
	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/segment"
	"github.com/micahchoo/indickit/stem"
	"golang.org/x/text/unicode/norm"
)

// pool: the characters the generator draws from.
var pool = func() []rune {
	var p []rune
	for c := rune(0x0900); c <= 0x0D7F; c++ { // Devanagari .. Malayalam
		p = append(p, c)
	}
	for c := rune(0x0600); c <= 0x06FF; c++ { // Arabic
		p = append(p, c)
	}
	for c := rune(0xABC0); c <= 0xABFF; c++ { // Meetei Mayek
		p = append(p, c)
	}
	for c := rune(0x1C50); c <= 0x1C7F; c++ { // Ol Chiki
		p = append(p, c)
	}
	for c := rune(0x0300); c <= 0x036F; c++ { // combining marks
		p = append(p, c)
	}
	p = append(p, []rune("abcdefghijklmnopqrstuvwxyzAEIOUKRS -.'()")...)
	inv := []rune{0x200C, 0x200D, 0x200B, 0x2060, 0xFEFF, 0x00AD}
	for range 40 { // weight the invisible characters and the viramas up
		p = append(p, inv...)
		p = append(p, 0x094D, 0x09CD, 0x0A4D, 0x0ACD, 0x0B4D, 0x0BCD, 0x0C4D, 0x0CCD, 0x0D4D)
	}
	return p
}()

// gen turns fuzz bytes into a string from pool: two bytes a character.
func gen(data []byte) string {
	var b strings.Builder
	for i := 0; i+1 < len(data) && i < 64; i += 2 {
		b.WriteRune(pool[(int(data[i])<<8|int(data[i+1]))%len(pool)])
	}
	return b.String()
}

// invisibles counts the invisible characters of normalize/rules.json.
func invisibles(s string) int {
	n := 0
	for _, r := range s {
		if strings.ContainsRune(invisible, r) {
			n++
		}
	}
	return n
}

const invisible = "\u200c\u200d\u200b\u2060\ufeff\u00ad"

var langs = []string{"", "hi", "as", "bn", "ta", "ml", "kn", "pa", "ur", "mr", "te", "gu", "ne", "sa"}

func seeds(f *testing.F) {
	for _, s := range []string{"र\u093eम", "ಲಕ\u0ccdಷ\u0ccdಮ\u0cbf", "അവന\u0d4d\u200d", "ম\u09cbদ\u09bfয\u09bc\u09c7র", "\u200c\u200d\u200c", "க\u0bcdஷ", "Rāma"} {
		f.Add([]byte(s), uint8(1))
	}
	f.Add([]byte{0x01, 0x02, 0xff, 0x10, 0x20, 0x00}, uint8(3))
}

func FuzzNormalize(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		s, lang := gen(data), langs[int(l)%len(langs)]
		n := normalize.Text(s, lang)
		// twice = once is promised for at most 8 invisible characters
		// (TestTextTwiceIsOnce); 17.4M strings found no exception in it.
		if invisibles(s) <= 8 && normalize.Text(n, lang) != n {
			t.Errorf("Text not idempotent: %+q (%s) -> %+q -> %+q", s, lang, n, normalize.Text(n, lang))
		}
		fo := normalize.Fold(s, lang)
		if invisibles(s) <= 8 && normalize.Fold(fo, lang) != fo {
			t.Errorf("Fold not idempotent: %+q (%s) -> %+q -> %+q", s, lang, fo, normalize.Fold(fo, lang))
		}
		// NFC as ICU and Python give it: x/text calls a run of 31 marks not
		// normal (the Stream-Safe Text Format), and unorm does not.
		if unorm.NFC(n) != n {
			t.Errorf("Text output not NFC: %+q (%s) -> %+q", s, lang, n)
		}
	})
}

func FuzzSegment(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, _ uint8) {
		s := gen(data)
		segs := segment.Segment(s)
		if strings.Join(segs, "") != s {
			t.Errorf("pieces do not join: %+q", s)
		}
		if segment.Count(s) != len(segs) {
			t.Errorf("Count %d != %d pieces: %+q", segment.Count(s), len(segs), s)
		}
		b := segment.CodePointBounds(s)
		n := utf8.RuneCountInString(s)
		for i, x := range b {
			if x <= 0 || x >= n || (i > 0 && x <= b[i-1]) {
				t.Errorf("bounds %v not strictly inside (0,%d): %+q", b, n, s)
				break
			}
		}
		if len(s) > 0 && len(b)+1 != len(segs) {
			t.Errorf("%d bounds, %d pieces: %+q", len(b), len(segs), s)
		}
	})
}

// FuzzSegmentBytes: raw bytes, invalid UTF-8 included; only "no panic" and
// the counts hold (Go reads invalid UTF-8 as U+FFFD, README "Limits").
func FuzzSegmentBytes(f *testing.F) {
	f.Add([]byte("\xff\xe0\xa4"), uint8(0))
	f.Fuzz(func(t *testing.T, data []byte, _ uint8) {
		s := string(data)
		if segment.Count(s) != len(segment.Segment(s)) {
			t.Errorf("Count != pieces: %+q", s)
		}
		normalize.Text(s, "hi")
		phonetic.NameKeys(s)
		stem.Stem(s, "hi")
	})
}

const alphabet = "acehiklnoprtuy" // every class after the search key's class map (phonetic/rules.json)

// isNumber: rules 2026-10-06.1 key a word of digits by its value ("12").
func isNumber(k string) bool { return k != "" && strings.Trim(k, "0123456789") == "" }

func FuzzPhonetic(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		s := gen(data)
		ks := phonetic.Keys(s)
		for _, k := range ks {
			if k == "" {
				t.Errorf("an empty key for %+q", s)
			}
			if isNumber(k) {
				continue
			}
			for _, c := range k {
				if !strings.ContainsRune(alphabet, c) {
					t.Errorf("key %q of %+q has %q, not a class", k, s, c)
				}
			}
		}
		if len(ks) > 16*2 { // max_keys per base, and at most one suffix base
			t.Errorf("%d keys: %+q", len(ks), s)
		}
		half := len(data) / 2
		a, b := gen(data[:half]), gen(data[half:])
		if phonetic.Match(a, b) != phonetic.Match(b, a) {
			t.Errorf("Match not symmetric: %+q, %+q", a, b)
		}
		if strings.Join(phonetic.Keys(norm.NFD.String(s)), " ") != strings.Join(phonetic.Keys(norm.NFC.String(s)), " ") {
			t.Errorf("Keys(NFD) != Keys(NFC): %+q", s)
		}
		lang := langs[int(l)%len(langs)]
		// normalize changes no key of a word with no invisible character
		// (TestKeysUnchangedByNormalize).
		if got, want := strings.Join(phonetic.Keys(normalize.Text(s, lang)), " "), strings.Join(ks, " "); invisibles(s) == 0 && got != want {
			t.Errorf("Keys(Text(x, %q)) = [%s], Keys(x) = [%s]: %+q", lang, got, want, s)
		}
		if len(phonetic.NameKeys(s)) > phonetic.MaxNameKeys {
			t.Errorf("NameKeys over the cap: %+q", s)
		}
	})
}

// Stem: idempotence is NOT promised (README: "Do not stem a stem"); this
// target only checks that a stem is a prefix of the word and that it never panics.
func FuzzStem(f *testing.F) {
	seeds(f)
	f.Fuzz(func(t *testing.T, data []byte, l uint8) {
		s, lang := gen(data), langs[int(l)%len(langs)]
		st := stem.Stem(s, lang)
		if !strings.HasPrefix(s, st) {
			t.Errorf("stem %+q is not a prefix of %+q (%s)", st, s, lang)
		}
	})
}
