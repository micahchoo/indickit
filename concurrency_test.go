// Concurrency: the packages hold their engines in package-level variables.
// Many goroutines call every function at once on conformance inputs; each
// result must equal the serial one. Run with -race.
// INDICKIT_DIR: the indickit root (default "."; this file sits there in indickit).
package indickit_test

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/segment"
	"github.com/micahchoo/indickit/stem"
)

// sample streams the first n inputs of a conformance file; field is the
// index of the input text in each row.
func sample(t *testing.T, file string, field, n int) []string {
	root := os.Getenv("INDICKIT_DIR")
	if root == "" {
		root = "."
	}
	f, err := os.Open(filepath.Join(root, file))
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	s := bufio.NewScanner(gz)
	s.Buffer(make([]byte, 1<<20), 1<<20)
	var out []string
	for s.Scan() && len(out) < n {
		var row []json.RawMessage
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			t.Fatal(err)
		}
		var x string
		json.Unmarshal(row[field], &x)
		out = append(out, x)
	}
	return out
}

func all(s string) string {
	return strings.Join([]string{
		normalize.Text(s, "hi"), normalize.Fold(s, "as"),
		strings.Join(phonetic.Keys(s), " "), strings.Join(phonetic.NameKeys(s), "|"),
		strings.Join(segment.Segment(s), "|"), stem.Stem(s, "hi"), stem.Stem(s, "ta"),
	}, "\x00")
}

func TestConcurrentCalls(t *testing.T) {
	var in []string
	in = append(in, sample(t, "normalize/testdata/conformance.jsonl.gz", 0, 3000)...)
	in = append(in, sample(t, "phonetic/testdata/conformance.jsonl.gz", 0, 3000)...)
	in = append(in, sample(t, "segment/testdata/conformance.jsonl.gz", 0, 3000)...)
	in = append(in, sample(t, "stem/testdata/conformance.jsonl.gz", 1, 3000)...)
	want := make([]string, len(in))
	for i, s := range in {
		want[i] = all(s)
	}
	const workers = 16
	var wg sync.WaitGroup
	var mu sync.Mutex
	bad := 0
	for w := range workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for k := range in {
				i := (k*7 + w*131) % len(in) // each goroutine in its own order
				if all(in[i]) != want[i] {
					mu.Lock()
					bad++
					mu.Unlock()
				}
			}
		}()
	}
	wg.Wait()
	if bad > 0 {
		t.Fatalf("%d concurrent results differ from the serial ones", bad)
	}
	t.Logf("%d inputs x %d goroutines agree", len(in), workers)
}
