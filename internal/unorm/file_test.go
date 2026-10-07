package unorm

import (
	"bufio"
	"encoding/json"
	"os"
	"strings"
	"testing"

	"golang.org/x/text/unicode/norm"
)

// TestAgainstFile compares NFC with a file of [input, NFC] lines from Python
// (linguistic-utilities jobs/release/measure/code_floor/nfc_cases.py). It runs
// only when NFC_CASES names the file.
func TestAgainstFile(t *testing.T) {
	f, err := os.Open(os.Getenv("NFC_CASES"))
	if err != nil {
		t.Skip(err)
	}
	s := bufio.NewScanner(f)
	s.Buffer(make([]byte, 1<<20), 1<<20)
	n, bad, slow, xbad := 0, 0, 0, 0
	for s.Scan() {
		var row [2]string
		json.Unmarshal(s.Bytes(), &row)
		n++
		if norm.NFC.String(row[0]) != row[1] {
			xbad++
		}
		if strings.Count(norm.NFC.String(row[0]), "\u034f") != strings.Count(row[0], "\u034f") {
			slow++
		}
		if norm.NFC.IsNormalString(row[0]) && row[0] != row[1] {
			t.Errorf("IsNormal wrong: %+q", row[0])
		}
		if got := NFC(row[0]); got != row[1] {
			if bad < 5 {
				t.Errorf("%+q: got %+q want %+q", row[0], got, row[1])
			}
			bad++
		}
	}
	t.Logf("%d cases, %d take the slow path, x/text alone wrong on %d, NFC wrong on %d", n, slow, xbad, bad)
}
