// Package unidata answers every Unicode property question indickit asks
// inside the blocks it has rules for (Arabic, Devanagari to Malayalam, Ol
// Chiki, Vedic, Devanagari Extended, Meetei Mayek) from one pinned table,
// unicode15.json, which js/unidata.ts also reads. So Go and TypeScript give
// one answer whatever Unicode version their host ships, and a move to a new
// Unicode version is a change to the table: a rules change, with a
// conformance run (MAINTAINING.md, "Upkeep").
//
// Outside the blocks the host answers: Go's unicode package and x/text.
// The Latin blocks indickit also reads are closed (every code point is
// assigned), and Unicode's stability policy freezes the decomposition and
// combining class of an assigned code point, so the host cannot drift there.
//
// The table comes from linguistic-utilities
// jobs/release/measure/code_floor/unicode_table.py.
package unidata

import (
	_ "embed"
	"encoding/json"
	"strconv"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

//go:embed unicode15.json
var raw []byte

// Version is the Unicode version of the table.
var Version string

const (
	fMn = 1 << iota
	fM
	fL
)

// prop holds every code point of the blocks: flags in the low bits, the
// combining class above them. A code point absent here is outside the blocks.
var prop = map[rune]uint16{}
var decomp = map[rune][]rune{}
var pairs = map[[2]rune]rune{}

func init() {
	var t struct {
		Unicode string            `json:"unicode"`
		Ranges  []rune            `json:"ranges"`
		Mn      []rune            `json:"mn"`
		M       []rune            `json:"m"`
		L       []rune            `json:"l"`
		CCC     []uint16          `json:"ccc"`
		Decomp  map[string][]rune `json:"decomp"`
		Excl    []rune            `json:"excl"`
	}
	if err := json.Unmarshal(raw, &t); err != nil {
		panic("unidata: " + err.Error())
	}
	Version = t.Unicode
	for i := 0; i < len(t.Ranges); i += 2 {
		for c := t.Ranges[i]; c <= t.Ranges[i+1]; c++ {
			prop[c] = 0
		}
	}
	set := func(flat []rune, f uint16) {
		for i := 0; i < len(flat); i += 2 {
			for c := flat[i]; c <= flat[i+1]; c++ {
				prop[c] |= f
			}
		}
	}
	set(t.Mn, fMn)
	set(t.M, fM)
	set(t.L, fL)
	for i := 0; i < len(t.CCC); i += 3 {
		for c := rune(t.CCC[i]); c <= rune(t.CCC[i+1]); c++ {
			prop[c] |= t.CCC[i+2] << 4
		}
	}
	excl := map[rune]bool{}
	for _, c := range t.Excl {
		excl[c] = true
	}
	for k, d := range t.Decomp {
		c, err := strconv.Atoi(k)
		if err != nil {
			panic("unidata: " + err.Error())
		}
		decomp[rune(c)] = d
		if len(d) == 2 && !excl[rune(c)] {
			pairs[[2]rune{d[0], d[1]}] = rune(c)
		}
	}
}

// InBlocks reports whether the table answers for r.
func InBlocks(r rune) bool { _, ok := prop[r]; return ok }

// IsMn: General_Category Mn.
func IsMn(r rune) bool {
	if p, ok := prop[r]; ok {
		return p&fMn != 0
	}
	return unicode.Is(unicode.Mn, r)
}

// IsMark: General_Category Mn, Mc or Me.
func IsMark(r rune) bool {
	if p, ok := prop[r]; ok {
		return p&fM != 0
	}
	return unicode.IsMark(r)
}

// IsLetter: General_Category L.
func IsLetter(r rune) bool {
	if p, ok := prop[r]; ok {
		return p&fL != 0
	}
	return unicode.IsLetter(r)
}

// CCC is the Canonical_Combining_Class.
func CCC(r rune) uint8 {
	if p, ok := prop[r]; ok {
		return uint8(p >> 4)
	}
	return norm.NFD.PropertiesString(string(r)).CCC()
}

// NFD is the full canonical decomposition of one code point.
func NFD(r rune) []rune {
	if _, ok := prop[r]; ok {
		d, ok := decomp[r]
		if !ok {
			return []rune{r}
		}
		var out []rune
		for _, x := range d {
			out = append(out, NFD(x)...)
		}
		return out
	}
	return []rune(norm.NFD.String(string(r)))
}

// Pair gives the primary composite of a and b, when there is one.
func Pair(a, b rune) (rune, bool) {
	_, ina := prop[a]
	_, inb := prop[b]
	if ina && inb {
		c, ok := pairs[[2]rune{a, b}]
		return c, ok
	}
	if ina || inb {
		// A composite of two assigned code points is never added later
		// (stability policy), and none joins a block of the table to a code
		// point outside it.
		return 0, false
	}
	t := norm.NFC.String(string([]rune{a, b}))
	rs := []rune(t)
	if len(rs) != 1 {
		return 0, false
	}
	return rs[0], true
}
