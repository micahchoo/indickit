package phonetic_test

import (
	"fmt"

	"github.com/micahchoo/indickit/phonetic"
)

func ExampleMatch() {
	fmt.Println(phonetic.Match("Mohanlal", "മോഹൻലാൽ"))
	fmt.Println(phonetic.Match("राम", "काम")) // Rām is not kām
	// Output:
	// true
	// false
}

func ExampleKeys() {
	for _, w := range []string{"राम", "ರಾಮ", "رام", "Ram", "மோகன்"} {
		fmt.Println(w, phonetic.Keys(w))
	}
	// Output:
	// राम [rn]
	// ರಾಮ [rn]
	// رام [rn]
	// Ram [rn]
	// மோகன் [nhn nkn]
}

func ExampleNameKeys() {
	// Index every key of a name; look up every key of a query.
	fmt.Println(phonetic.NameKeys("सचिन तेंदुलकर"))
	// Output:
	// [cn tntlkr]
}
