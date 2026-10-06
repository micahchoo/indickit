package normalize_test

import (
	"fmt"

	"github.com/micahchoo/indickit/normalize"
)

func ExampleText() {
	fmt.Println(normalize.Text("അവന്\u200d", "ml") == "അവൻ") // the old chillu becomes the atomic one
	fmt.Println(normalize.Text("ಸಿಕಾರ್\u200c", "kn"))        // a ZWNJ at the end draws nothing
	// Output:
	// true
	// ಸಿಕಾರ್
}

func ExampleFold() {
	fmt.Println(normalize.Fold("हिन्दी", "hi"))
	fmt.Println(normalize.Fold("गाँव", "hi"))
	// Output:
	// हिंदी
	// गांव
}
