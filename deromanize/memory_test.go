package deromanize

import (
	"runtime"
	"testing"
)

// What one loaded language keeps on the heap. One map entry per n-gram pair and a
// map of the word list kept Hindi at 35 MB (perf job, phase 8); flat tables and the
// list as bytes keep it near 18. The bound leaves room for the runtime, not for that layout.
func TestLoadedHindiKeepsLittleHeap(t *testing.T) {
	heap := func() uint64 {
		runtime.GC()
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		return m.HeapAlloc
	}
	ResetForBench()
	before := heap()
	Word("a", "hi", Words, 1)
	if mb := float64(heap()-before) / (1 << 20); mb > 25 {
		t.Fatalf("a loaded Hindi deromanizer keeps %.1f MB of heap, want under 25", mb)
	}
}
