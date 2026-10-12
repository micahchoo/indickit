package romanize

import (
	"runtime"
	"testing"
)

// What one loaded language keeps on the heap. One map entry per n-gram pair kept
// Hindi at 29 MB (perf job, phase 8); flat tables keep it near 15. The bound leaves
// room for the runtime, not for that layout.
func TestLoadedHindiKeepsLittleHeap(t *testing.T) {
	heap := func() uint64 {
		runtime.GC()
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		return m.HeapAlloc
	}
	mu.Lock()
	tables, pooled = map[string]*mix{}, map[string]*model{}
	mu.Unlock()
	before := heap()
	Word("क", "hi", Words, 1)
	if mb := float64(heap()-before) / (1 << 20); mb > 22 {
		t.Fatalf("a loaded Hindi romanizer keeps %.1f MB of heap, want under 22", mb)
	}
}
