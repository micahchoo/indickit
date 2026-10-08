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
