package romanize

// Decode exposes the decoder without the lookup or the empty-spelling filter, for the
// conformance test: the reference's rows are the model's own lists.
func Decode(word, lang string, mode Mode, n int) []string {
	x := get(code(lang), mode)
	if x == nil {
		return nil
	}
	return x.decode(word, n)
}
