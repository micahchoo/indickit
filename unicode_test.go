package indickit_test

import (
	"encoding/json"
	"os"
	"slices"
	"strconv"
	"testing"
	"unicode"

	"golang.org/x/text/unicode/norm"

	"github.com/micahchoo/indickit/internal/unidata"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/romanize"
	_ "github.com/micahchoo/indickit/romanize/lang/brahmic"
	_ "github.com/micahchoo/indickit/romanize/lang/te"
)

// Inside the blocks indickit has rules for, both ports read one pinned table
// of Unicode 15.0 data, internal/unidata/unicode15.json (js/unidata.ts is
// the TypeScript side; js/unidata.test.ts the twin of this file). These tests
// pin the table from two sides: Python's unicodedata (testdata/unicode15.json,
// from linguistic-utilities jobs/release/measure/code_floor/unicode15.py) and
// Go's own 15.0 data (the unicode package and x/text v0.21.0).

type oracle struct {
	Unicode string            `json:"unicode"`
	Ranges  [][2]rune         `json:"ranges"`
	Mn      []rune            `json:"mn"`
	NFD     map[string][]rune `json:"nfd"`
}

func readOracle(t *testing.T) oracle {
	data, err := os.ReadFile("testdata/unicode15.json")
	if err != nil {
		t.Fatal(err)
	}
	var u oracle
	if err := json.Unmarshal(data, &u); err != nil {
		t.Fatal(err)
	}
	if u.Unicode != unidata.Version {
		t.Fatalf("oracle is Unicode %s, the table %s", u.Unicode, unidata.Version)
	}
	return u
}

func nfdOf(u oracle, c rune) []rune {
	if d, ok := u.NFD[strconv.Itoa(int(c))]; ok {
		return d
	}
	return []rune{c}
}

// The table says what Python's unicodedata says, for every code point of
// its blocks: the Mn category and the full decomposition.
func TestTableIsPythonsUnicode15(t *testing.T) {
	u := readOracle(t)
	n := 0
	for _, r := range u.Ranges {
		for c := r[0]; c <= r[1]; c++ {
			if !unidata.InBlocks(c) {
				continue
			}
			n++
			if got, want := unidata.IsMn(c), slices.Contains(u.Mn, c); got != want {
				t.Errorf("%U: table Mn %v, Python says %v", c, got, want)
			}
			if got, want := unidata.NFD(c), nfdOf(u, c); !slices.Equal(got, want) {
				t.Errorf("%U: table NFD %U, Python says %U", c, got, want)
			}
		}
	}
	if n < 2000 {
		t.Errorf("the oracle covers only %d code points of the table", n)
	}
}

// The table says what Go's Unicode 15.0 data says: every category, class,
// decomposition and composite inside the blocks. Go's data is 15.0 in Go
// 1.21–1.26 and x/text v0.21.0; under a newer version this test is skipped,
// and the Python oracle above still holds the table.
func TestTableIsGosUnicode15(t *testing.T) {
	if v := [2]string{unicode.Version, norm.Version}; v != [2]string{unidata.Version, unidata.Version} {
		t.Skipf("Go's unicode package is %s, x/text %s, the table %s", v[0], v[1], unidata.Version)
	}
	var starters, seconds []rune
	for c := rune(0); c <= unicode.MaxRune; c++ {
		if !unidata.InBlocks(c) {
			continue
		}
		if got, want := unidata.IsMn(c), unicode.Is(unicode.Mn, c); got != want {
			t.Errorf("%U: table Mn %v, Go says %v", c, got, want)
		}
		if got, want := unidata.IsMark(c), unicode.IsMark(c); got != want {
			t.Errorf("%U: table M %v, Go says %v", c, got, want)
		}
		if got, want := unidata.IsLetter(c), unicode.IsLetter(c); got != want {
			t.Errorf("%U: table L %v, Go says %v", c, got, want)
		}
		p := norm.NFD.PropertiesString(string(c))
		if got, want := unidata.CCC(c), p.CCC(); got != want {
			t.Errorf("%U: table ccc %d, x/text says %d", c, got, want)
		}
		d := []rune(norm.NFD.String(string(c)))
		if got := unidata.NFD(c); !slices.Equal(got, d) {
			t.Errorf("%U: table NFD %U, x/text says %U", c, got, d)
		}
		if p.CCC() == 0 {
			starters = append(starters, c)
		}
		if p.CCC() != 0 {
			seconds = append(seconds, c)
		}
		if len(d) == 2 {
			seconds = append(seconds, d[1])
		}
	}
	// Every pair a starter can compose with: a mark, or the second half of
	// some decomposition. The table composes the pair when x/text does.
	for _, a := range starters {
		for _, b := range seconds {
			got, ok := unidata.Pair(a, b)
			want := []rune(norm.NFC.String(string([]rune{a, b})))
			if ok != (len(want) == 1) || (ok && got != want[0]) {
				t.Errorf("%U + %U: table composite %U %v, x/text gives %U", a, b, got, ok, want)
			}
		}
	}
	// A code point of the blocks composes with nothing outside them.
	for _, a := range starters {
		for b := rune(0x0300); b <= 0x036F; b++ {
			if _, ok := unidata.Pair(a, b); ok {
				t.Errorf("%U + %U: a composite across the edge of the blocks", a, b)
			}
		}
	}
}

// Outside the table the host answers, and the Latin blocks indickit reads
// are closed: every code point of U+0000–024F, U+0300–036F, U+1E00–1EFF and
// U+2000–206F is assigned, and Unicode's stability policy freezes the
// decomposition and the combining class of an assigned code point. So on
// these questions the host is Unicode 15.0 whatever version it ships; this
// test says so against the Python oracle.
func TestHostAgreesInTheClosedBlocks(t *testing.T) {
	u := readOracle(t)
	for _, r := range u.Ranges {
		for c := r[0]; c <= r[1]; c++ {
			if unidata.InBlocks(c) {
				continue
			}
			if got, want := unicode.Is(unicode.Mn, c), slices.Contains(u.Mn, c); got != want {
				t.Errorf("%U: host Mn %v, Unicode 15.0 says %v", c, got, want)
			}
			if got, want := []rune(norm.NFD.String(string(c))), nfdOf(u, c); !slices.Equal(got, want) {
				t.Errorf("%U: host NFD %U, Unicode 15.0 says %U", c, got, want)
			}
		}
	}
}

// The utilities read the table, not the host. U+0C5C and U+0CDC are letters
// since Unicode 16.0 and unassigned in 15.0: with Go's 15.0 data the two
// agree, so this pins the behaviour the TypeScript twin sees differ from its
// host (node 24: Unicode 17.0): romanize.Text ends a word at them.
func TestUtilitiesReadTheTable(t *testing.T) {
	for _, c := range []rune{0x0C5C, 0x0CDC} {
		if unidata.IsLetter(c) || unidata.IsMark(c) {
			t.Errorf("%U: a letter or mark to the table", c)
		}
	}
	w := romanize.Text("రామ", "te", romanize.Words)
	if got, want := romanize.Text("రామ౜రామ", "te", romanize.Words), w+"౜"+w; got != want {
		t.Errorf("Text = %q, want %q", got, want)
	}
	// The phonetic key strips a Devanagari Mn from a Latin word through the table.
	if got, want := phonetic.Keys("Ram्"), phonetic.Keys("Ram"); !slices.Equal(got, want) {
		t.Errorf("Keys(Ram + virama) = %v, Keys(Ram) = %v", got, want)
	}
}
