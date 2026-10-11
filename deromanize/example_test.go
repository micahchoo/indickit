package deromanize_test

import (
	"fmt"

	"github.com/micahchoo/indickit/deromanize"
)

// The README's Go example: a program imports the languages it needs.
func ExampleWord() {
	fmt.Println(deromanize.Word("namaste", "hi", deromanize.Words, 1))
	fmt.Println(deromanize.Word("ahmad", "ur", deromanize.Names, 1))
	// Output:
	// [नमस्ते]
	// [احمد]
}

// Mixed Hinglish text: a word in the Hindi English list stays as typed.
func ExampleTextMixed() {
	fmt.Println(deromanize.TextMixed("mera office band hai", "hi", deromanize.Words))
	fmt.Println(deromanize.English("office", "hi"), deromanize.English("hai", "hi"))
	// Output:
	// मेरा office बंद है
	// true false
}
