// Linear on long input: the perf job (linguistic-utilities jobs/perf) found
// functions whose cost grew with the square of the input, so one request of a
// few KB took seconds or gigabytes. Each case allocates for an input of n and
// of 2n code points; linear gives a ratio of about 2, quadratic about 4, and
// the test fails above 3. Bytes allocated are deterministic, unlike time.
// phonetic search is not here: it grows with (query words) x (candidate
// words) by design, and its docs tell callers to cap user input.
package indickit_test

import (
	"runtime"
	"strings"
	"testing"

	"github.com/micahchoo/indickit/deromanize"
	_ "github.com/micahchoo/indickit/deromanize/lang/hi"
	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/romanize"
	_ "github.com/micahchoo/indickit/romanize/lang/hi"
	"github.com/micahchoo/indickit/segment"
	"github.com/micahchoo/indickit/wellformed"
)

func allocated(f func()) uint64 {
	var a, b runtime.MemStats
	runtime.GC()
	runtime.ReadMemStats(&a)
	f()
	runtime.ReadMemStats(&b)
	return b.TotalAlloc - a.TotalAlloc
}

func TestLinearOnLongInput(t *testing.T) {
	word := func(n int) string { // one word of Devanagari syllables, no space
		return string([]rune(strings.Repeat("कार्यक्रम", n))[:n])
	}
	text := func(n int) string { // Tamil words, as running text
		return string([]rune(strings.Repeat("நரேந்திர மோடி ", n))[:n])
	}
	latin := func(n int) string { return strings.Repeat("bharatsarkar", n/12+1)[:n] }
	for _, c := range []struct {
		name string
		n    int
		f    func(int)
	}{
		{"wellformed", 1 << 16, func(n int) { wellformed.BrokenAt(word(n)) }},
		{"normalize", 1 << 16, func(n int) { normalize.Text(word(n), "hi") }},
		{"segment", 1 << 16, func(n int) { segment.Segment(word(n)) }},
		{"NameKeys", 1 << 15, func(n int) { phonetic.NameKeys(text(n)) }},
		{"romanize", 1 << 13, func(n int) { romanize.Word(word(n), "hi", romanize.Words, 4) }},
		{"deromanize", 1 << 11, func(n int) { deromanize.Word(latin(n), "hi", deromanize.Words, 4) }},
	} {
		t.Run(c.name, func(t *testing.T) {
			c.f(64) // load tables
			a, b := allocated(func() { c.f(c.n) }), allocated(func() { c.f(2 * c.n) })
			if r := float64(b) / float64(a); r > 3 {
				t.Errorf("%d -> %d bytes from %d to %d code points (x%.2f): grows faster than the input", a, b, c.n, 2*c.n, r)
			}
		})
	}
}
