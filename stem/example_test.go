package stem_test

import (
	"fmt"

	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/stem"
)

func ExampleStem() {
	fmt.Println(stem.Stem("किताबों", "hi"))
	fmt.Println(stem.Stem("ஆண்டில்", "ta") == stem.Stem("ஆண்டு", "ta"))
	fmt.Println(stem.Stem("किताबों", "xx")) // no table: the word comes back
	// Output:
	// किताब
	// true
	// किताबों
}

// The README's search recipe: normalize, then stem.
func ExampleStem_normalizeFirst() {
	fmt.Println(stem.Stem(normalize.Text("किताबों", "hi"), "hi"))
	// Output: किताब
}
