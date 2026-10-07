package lang

import "testing"

// The same cases as linguistic-utilities tests/test_lang.py.
func TestCode(t *testing.T) {
	for tag, want := range map[string]string{
		"as": "as", "AS": "as", "as-IN": "as", "as_IN": "as", "asm": "as", "hin": "hi",
		"hi-Deva-IN": "hi", "ori": "or", "mai": "mai", "en": "en", "xx": "xx", "": "",
	} {
		if got := Code(tag); got != want {
			t.Errorf("Code(%q) = %q, want %q", tag, got, want)
		}
	}
}
