package segment_test

import (
	"fmt"

	"github.com/micahchoo/indickit/segment"
)

func ExampleSegment() {
	fmt.Println(segment.Segment("ಲಕ್ಷ್ಮಿ"))
	fmt.Println(segment.Segment("ਕ੍ਕ")) // Gurmukhi shows this virama: two letters
	// Output:
	// [ಲ ಕ್ಷ್ಮಿ]
	// [ਕ੍ ਕ]
}

func ExampleCount() {
	fmt.Println(segment.Count("ಕನ್ನಡ"))
	// Output: 3
}
