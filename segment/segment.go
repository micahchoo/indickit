// Package segment splits text into the letters a reader sees:
// Segment("ಲಕ್ಷ್ಮಿ") is ["ಲ" "ಕ್ಷ್ಮಿ"].
//
// Unicode's grapheme clusters (UAX #29) keep a conjunct whole only where the
// script's virama is a conjunct linker: not in Kannada or Gurmukhi, so most
// segmenters give ಲ|ಕ್|ಷ್|ಮಿ. Segment is the grapheme clusters of Unicode
// 17.0, computed here from rules.json (Go's own Unicode version does not
// matter), then a few joins after a virama, each measured: every consonant in
// Kannada, ਰ and ਹ in Gurmukhi, য before া in Bengali (অ্যা), and Tamil ஸ்ரீ.
package segment

import (
	_ "embed"
	"encoding/json"
	"sort"
	"strings"
)

//go:embed rules.json
var rulesJSON []byte

// Grapheme_Cluster_Break values.
const (
	bOther = iota
	bCR
	bLF
	bControl
	bExtend
	bZWJ
	bRI
	bPrepend
	bSpacingMark
	bL
	bV
	bT
	bLV
	bLVT
	bLVLVT
)

var breakNames = map[string]uint8{
	"CR": bCR, "LF": bLF, "Control": bControl, "Extend": bExtend, "ZWJ": bZWJ,
	"Regional_Indicator": bRI, "Prepend": bPrepend, "SpacingMark": bSpacingMark,
	"L": bL, "V": bV, "T": bT, "LV": bLV, "LVT": bLVT, "LV_LVT": bLVLVT,
}

// Indic_Conjunct_Break values.
const (
	cNone = iota
	cLinker
	cConsonant
	cExtend
)

var incbNames = map[string]uint8{"Linker": cLinker, "Consonant": cConsonant, "Extend": cExtend}

const zwj = 0x200D

// ranges are sorted, non-overlapping [first, last] code-point ranges.
type ranges struct {
	first, last []rune
	value       []uint8
}

func (r *ranges) get(cp rune) uint8 {
	i := sort.Search(len(r.last), func(i int) bool { return r.last[i] >= cp })
	if i < len(r.first) && r.first[i] <= cp {
		return r.value[i]
	}
	return 0
}

type join struct {
	consonants, after string
	sign              rune // 0: any
}

type classes struct {
	letters, nuktas, signs string
}

type engine struct {
	breaks, pict, incb ranges
	joins              map[rune][]join
	classes            map[rune]classes
}

type rulesFile struct {
	Version       string               `json:"version"`
	Unicode       string               `json:"unicode"`
	GraphemeBreak [][3]json.RawMessage `json:"grapheme_break"`
	Pictographic  [][2]rune            `json:"extended_pictographic"`
	InCB          [][3]json.RawMessage `json:"incb"`
	Joins         []struct {
		Virama, Consonants, Sign, After string
	} `json:"joins"`
	Classes map[string]struct {
		Letters string `json:"letters"`
		Nuktas  string `json:"nuktas"`
		Signs   string `json:"signs"`
	} `json:"classes"`
}

func load(data []byte) (*engine, *rulesFile, error) {
	var r rulesFile
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, nil, err
	}
	named := func(rows [][3]json.RawMessage, names map[string]uint8) (ranges, error) {
		var out ranges
		for _, row := range rows {
			var lo, hi rune
			var name string
			for i, dst := range []any{&lo, &hi, &name} {
				if err := json.Unmarshal(row[i], dst); err != nil {
					return out, err
				}
			}
			out.first = append(out.first, lo)
			out.last = append(out.last, hi)
			out.value = append(out.value, names[name])
		}
		return out, nil
	}
	e := &engine{joins: map[rune][]join{}, classes: map[rune]classes{}}
	var err error
	if e.breaks, err = named(r.GraphemeBreak, breakNames); err != nil {
		return nil, nil, err
	}
	if e.incb, err = named(r.InCB, incbNames); err != nil {
		return nil, nil, err
	}
	for _, p := range r.Pictographic {
		e.pict.first = append(e.pict.first, p[0])
		e.pict.last = append(e.pict.last, p[1])
		e.pict.value = append(e.pict.value, 1)
	}
	for _, j := range r.Joins {
		v := []rune(j.Virama)[0]
		var sign rune
		if j.Sign != "" {
			sign = []rune(j.Sign)[0]
		}
		e.joins[v] = append(e.joins[v], join{j.Consonants, j.After, sign})
	}
	for v, k := range r.Classes {
		e.classes[[]rune(v)[0]] = classes{k.Letters, k.Nuktas, k.Signs}
	}
	return e, &r, nil
}

var std, stdRules = func() (*engine, *rulesFile) {
	e, r, err := load(rulesJSON)
	if err != nil {
		panic("segment: bad embedded rules.json: " + err.Error())
	}
	return e, r
}()

// RulesVersion names the rules; stored letter counts go stale when it changes.
var RulesVersion = stdRules.Version

// UnicodeVersion is the Unicode version of the grapheme-cluster data.
var UnicodeVersion = stdRules.Unicode

func (e *engine) breakOf(cp rune) uint8 {
	b := e.breaks.get(cp)
	if b == bLVLVT {
		if (cp-0xAC00)%28 == 0 {
			return bLV
		}
		return bLVT
	}
	return b
}

// graphemeBounds gives the UAX #29 boundaries between the code points
// (index i: before cps[i]), rules GB3 to GB999.
func (e *engine) graphemeBounds(cps []rune) []int {
	var out []int
	if len(cps) == 0 {
		return out
	}
	prev := e.breakOf(cps[0])
	ri := 0
	if prev == bRI {
		ri = 1
	}
	pictExt := e.pict.get(cps[0]) == 1 // the text ends in ExtPict Extend*
	zwjAfterPict := false              // ... then a ZWJ
	conj := 0                          // GB9c: 1 after a consonant, 2 after consonant ... linker
	if e.incb.get(cps[0]) == cConsonant {
		conj = 1
	}
	for i := 1; i < len(cps); i++ {
		cp := cps[i]
		cur := e.breakOf(cp)
		isPict := e.pict.get(cp) == 1
		inc := e.incb.get(cp)
		var brk bool
		switch {
		case prev == bCR && cur == bLF: // GB3
			brk = false
		case prev == bControl || prev == bCR || prev == bLF: // GB4
			brk = true
		case cur == bControl || cur == bCR || cur == bLF: // GB5
			brk = true
		case prev == bL && (cur == bL || cur == bV || cur == bLV || cur == bLVT): // GB6
			brk = false
		case (prev == bLV || prev == bV) && (cur == bV || cur == bT): // GB7
			brk = false
		case (prev == bLVT || prev == bT) && cur == bT: // GB8
			brk = false
		case cur == bExtend || cur == bZWJ: // GB9
			brk = false
		case cur == bSpacingMark: // GB9a
			brk = false
		case prev == bPrepend: // GB9b
			brk = false
		case conj == 2 && inc == cConsonant: // GB9c
			brk = false
		case zwjAfterPict && isPict: // GB11
			brk = false
		case prev == bRI && cur == bRI: // GB12, GB13
			brk = ri%2 == 0
		default: // GB999
			brk = true
		}
		if brk {
			out = append(out, i)
		}
		if cur == bRI {
			if brk {
				ri = 1
			} else {
				ri++
			}
		} else {
			ri = 0
		}
		zwjAfterPict = cur == bZWJ && pictExt
		pictExt = isPict || (cur == bExtend && pictExt)
		switch {
		case inc == cConsonant:
			conj = 1
		case inc == cLinker && conj > 0:
			conj = 2
		case inc != cExtend:
			conj = 0
		}
		prev = cur
	}
	return out
}

// joined says whether a join removes the boundary before cps[i]
// (segment.py#joined in the research repo).
func (e *engine) joined(cps []rune, i int) bool {
	v := cps[i-1]
	rs, ok := e.joins[v]
	if !ok || i < 2 {
		return false
	}
	k := e.classes[v]
	x := i - 2
	for x > 0 && strings.ContainsRune(k.nuktas, cps[x]) {
		x--
	}
	if !strings.ContainsRune(k.letters, cps[x]) {
		return false
	}
	n := i + 1
	for n < len(cps) && strings.ContainsRune(k.nuktas, cps[n]) {
		n++
	}
	if n+1 < len(cps) && cps[n] == v && cps[n+1] == zwj {
		return false
	}
	var sign rune = -1
	if n < len(cps) && strings.ContainsRune(k.signs, cps[n]) {
		sign = cps[n]
	}
	for _, r := range rs {
		if strings.ContainsRune(r.consonants, cps[i]) &&
			(r.sign == 0 || r.sign == sign) &&
			(r.after == "" || strings.ContainsRune(r.after, cps[x])) {
			return true
		}
	}
	return false
}

func (e *engine) bounds(cps []rune) []int {
	var out []int
	for _, i := range e.graphemeBounds(cps) {
		if !e.joined(cps, i) {
			out = append(out, i)
		}
	}
	return out
}

// CodePointBounds gives the inner letter boundaries of s, as code-point
// offsets.
func CodePointBounds(s string) []int {
	return std.bounds([]rune(s))
}

// Segment gives the letters of s, in order; joined, they give s back.
func Segment(s string) []string {
	cps := []rune(s)
	if len(cps) == 0 {
		return nil
	}
	cuts := append(append([]int{0}, std.bounds(cps)...), len(cps))
	out := make([]string, 0, len(cuts)-1)
	for i := 1; i < len(cuts); i++ {
		out = append(out, string(cps[cuts[i-1]:cuts[i]]))
	}
	return out
}

// Count gives how many letters a reader sees in s.
func Count(s string) int {
	return len(Segment(s))
}
