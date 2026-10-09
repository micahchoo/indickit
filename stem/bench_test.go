package stem

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"os"
	"testing"
)

// BenchmarkStem stems every conformance input once per iteration: the real
// PIB and FLORES+ words of every language. ns/op divided by the row count
// is the cost of one word.
func BenchmarkStem(b *testing.B) {
	f, err := os.Open("testdata/conformance.jsonl.gz")
	if err != nil {
		b.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		b.Fatal(err)
	}
	s := bufio.NewScanner(gz)
	s.Buffer(make([]byte, 1<<20), 1<<20)
	var rows [][2]string
	for s.Scan() {
		var row [3]string
		if err := json.Unmarshal(s.Bytes(), &row); err != nil {
			b.Fatal(err)
		}
		rows = append(rows, [2]string{row[0], row[1]})
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		for _, r := range rows {
			Stem(r[1], r[0])
		}
	}
	b.ReportMetric(float64(b.Elapsed().Nanoseconds())/float64(b.N*len(rows)), "ns/word")
}
