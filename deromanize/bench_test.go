package deromanize_test

import (
	"testing"

	"github.com/micahchoo/indickit/deromanize"
)

func BenchmarkWordHindi(b *testing.B) {
	deromanize.Word("namaste", "hi", deromanize.Words, 4) // load
	ws := []string{"bhavishyavaaniyaan", "kamal", "pradhanmantri", "sarkar", "dilli", "aur", "ke", "vikas"}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		deromanize.Word(ws[i%len(ws)], "hi", deromanize.Words, 4)
	}
}

func BenchmarkLoadHindi(b *testing.B) {
	for i := 0; i < b.N; i++ {
		deromanize.ResetForBench()
		deromanize.Word("namaste", "hi", deromanize.Words, 4)
	}
}
