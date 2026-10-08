package romanize_test

import (
	"fmt"

	"github.com/micahchoo/indickit/romanize"
)

// The README's Go example: a program imports the languages it needs.
func ExampleWord() {
	fmt.Println(romanize.Word("लक्ष्मी", "hi", romanize.Words, 2))
	fmt.Println(romanize.Word("پرویز", "ur", romanize.Names, 1))
	// Output:
	// [lakshmi laxmi]
	// [parvez]
}

func ExampleText() {
	fmt.Println(romanize.Text("भारत के प्रधानमंत्री", "hi", romanize.Words))
	// Output: bharat ke pradhaanmantri
}
