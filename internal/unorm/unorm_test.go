package unorm

import (
	"strings"
	"testing"

	"golang.org/x/text/unicode/norm"
)

// Each want is Python's unicodedata.normalize("NFC", in) (Unicode 15.0),
// which is also what ICU (node 24, bun 1.3) gives.
func TestNFCLikeICUAndPython(t *testing.T) {
	r := strings.Repeat
	for _, c := range []struct{ in, want string }{
		// x/text puts U+034F after 30 non-starters
		{"क" + r("\u094d", 31), "क" + r("\u094d", 31)},
		{"e" + r("\u0301", 31), "é" + r("\u0301", 30)},
		// x/text reorders only inside each group of 30
		{"a" + r("\u0301\u0316", 20), "á" + r("\u0316", 20) + r("\u0301", 19)},
		{"क\u093c" + r("\u0951\u0952", 16) + "\u094d", "क\u093c\u094d" + r("\u0952", 16) + r("\u0951", 16)},
		// x/text composes t with U+0326 across the vowel sign U+0BBE
		{"t\u0bbe\u1dc6\u09be\u0f75\u0f82\u0326\u05a3\u0326", "t\u0bbe\u1dc6\u09be\u0f71\u0f74\u0326\u05a3\u0326\u0f82"},
		{"\u0bc6" + r("\u0301", 35) + "\u0bbe", "\u0bc6" + r("\u0301", 35) + "\u0bbe"},
		{"\u09c7\u09be", "\u09cb"},
		{"", ""},
	} {
		if got := NFC(c.in); got != c.want {
			t.Errorf("NFC(%+q) = %+q, want %+q", c.in, got, c.want)
		}
		if got := compose(decompose(c.in)); got != c.want {
			t.Errorf("compose(decompose(%+q)) = %+q, want %+q", c.in, got, c.want)
		}
	}
}

// Text with no long run of marks: NFC gives what x/text gives.
func TestNFCSameAsXText(t *testing.T) {
	for _, s := range []string{"र\u093eम", "क\u093c", "क़", "\u09cb", "\u09c7\u09be", "Ra\u0301ma", "ஸ\u0bcdர\u0bc0", "ന\u0d4d\u200d"} {
		if got, want := NFC(s), norm.NFC.String(s); got != want {
			t.Errorf("NFC(%+q) = %+q, x/text %+q", s, got, want)
		}
	}
}
