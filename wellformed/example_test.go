package wellformed_test

import (
	"fmt"

	"github.com/micahchoo/indickit/wellformed"
)

func ExampleCheck() {
	fmt.Println(wellformed.Check("िहन्दी")) // the vowel sign ि has no letter before it
	fmt.Println(wellformed.Check("हिन्दी"))
	// Output:
	// false
	// true
}

func ExampleBrokenAt() {
	fmt.Println(wellformed.BrokenAt("प्राप्त"))
	fmt.Println(wellformed.BrokenAt("क्ि")) // a vowel sign after a virama: byte 6
	// Output:
	// -1
	// 6
}
