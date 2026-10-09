// Package wellformed says whether a font can draw text whole. A text
// renderer (HarfBuzz) draws a dotted circle (◌) where a character cannot
// join the syllable before it: a vowel sign with no letter before it (ि at
// the start of a word, as PDF text layers give it), a vowel sign after a
// virama, a third anusvara. Check("िहन्दी") is false; BrokenAt gives
// the byte index of the first such character. Use it to reject or flag
// text before you store or index it.
//
// The rules are HarfBuzz's own verdicts, swept over every character after
// every character of each script, and kept in rules.json; this code only
// walks them. A text is cut into runs of one script (with the invisible
// characters and the placeholders NBSP and ◌ between them); a space, a
// digit or a letter of another script ends a run. In a run, a character is
// broken when it starts the run and its class is in the start set, or the
// widest window that holds its class and up to three classes before it
// says so (quads, then triples, then pairs), or it ends the run and its
// class is pending (Malayalam dot reph ൎ, which waits for a consonant).
//
// Arabic and Ol Chiki runs are always whole: HarfBuzz draws no dotted
// circle inside them. Only HarfBuzz was tested; DirectWrite and CoreText
// have their own grammars.
package wellformed

import (
	_ "embed"
	"encoding/json"
	"strconv"
)

//go:embed rules.json
var rulesJSON []byte

type rulesFile struct {
	Version     string `json:"version"`
	Invisible   string `json:"invisible"`
	Placeholder string `json:"placeholder"`
	Scripts     map[string]struct {
		Names         []string          `json:"names"`
		Blocks        map[string]string `json:"blocks"`
		Shared        string            `json:"shared"`
		Start         string            `json:"start"`
		Pending       string            `json:"pending"`
		Pairs         map[string]string `json:"pairs"`
		TriplesBroken map[string]string `json:"triples_broken"`
		TriplesWhole  map[string]string `json:"triples_whole"`
		QuadsBroken   map[string]string `json:"quads_broken"`
		QuadsWhole    map[string]string `json:"quads_whole"`
	} `json:"scripts"`
}

// script holds one script's tables. A class is a one-character string; a
// window is the classes of its characters, joined.
type script struct {
	class                 map[rune]string
	start, pending        map[string]bool
	pairs, tb, tw, qb, qw map[string]bool
}

type engine struct {
	version string
	own     map[rune]*script // a character of one of our scripts: its script
	shared  map[rune]bool    // invisible characters and placeholders: they stay in the run around them
}

func load(data []byte) (*engine, error) {
	var r rulesFile
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, err
	}
	e := &engine{version: r.Version, own: map[rune]*script{}, shared: map[rune]bool{}}
	shared := []rune(r.Invisible + r.Placeholder)
	for _, c := range shared {
		e.shared[c] = true
	}
	set := func(classes string) map[string]bool {
		out := map[string]bool{}
		for i := range classes {
			out[classes[i:i+1]] = true
		}
		return out
	}
	tuples := func(byPrefix map[string]string) map[string]bool {
		out := map[string]bool{}
		for prefix, ys := range byPrefix {
			for i := range ys {
				out[prefix+ys[i:i+1]] = true
			}
		}
		return out
	}
	for _, t := range r.Scripts {
		s := &script{class: map[rune]string{}, start: set(t.Start), pending: set(t.Pending),
			pairs: tuples(t.Pairs), tb: tuples(t.TriplesBroken), tw: tuples(t.TriplesWhole),
			qb: tuples(t.QuadsBroken), qw: tuples(t.QuadsWhole)}
		for first, run := range t.Blocks {
			lo, err := strconv.ParseUint(first, 16, 32)
			if err != nil {
				return nil, err
			}
			for i := range run {
				if run[i] != '.' {
					c := rune(lo) + rune(i)
					s.class[c] = run[i : i+1]
					e.own[c] = s
				}
			}
		}
		for i, c := range shared {
			s.class[c] = t.Shared[i : i+1]
		}
	}
	return e, nil
}

var std = func() *engine {
	e, err := load(rulesJSON)
	if err != nil {
		panic("wellformed: bad embedded rules.json: " + err.Error())
	}
	return e
}()

// RulesVersion names the rules; a stored verdict goes stale when it changes.
var RulesVersion = std.version

// Check is true when a font draws s with no dotted circle.
func Check(s string) bool { return std.brokenAt(s) < 0 }

// BrokenAt is the byte index in s of the first character a font draws with
// a dotted circle, or -1 when s is whole.
func BrokenAt(s string) int { return std.brokenAt(s) }

// check gives the index in run of its first broken character, or -1.
func (s *script) check(run []rune) int {
	h := "" // the classes so far
	for i, c := range run {
		y := s.class[c]
		n := len(h)
		var bad bool
		switch {
		case n == 0:
			bad = s.start[y]
		case n >= 3 && s.qb[h[n-3:]+y]:
			bad = true
		case n >= 3 && s.qw[h[n-3:]+y]:
			bad = false
		case n >= 2 && s.tb[h[n-2:]+y]:
			bad = true
		case n >= 2 && s.tw[h[n-2:]+y]:
			bad = false
		default:
			bad = s.pairs[h[n-1:]+y]
		}
		if bad {
			return i
		}
		h += y
	}
	if n := len(h); n > 0 && s.pending[h[n-1:]] {
		return len(run) - 1
	}
	return -1
}

func (e *engine) brokenAt(text string) int {
	var sc *script // the script of the run so far
	var run []rune
	var pos []int // the byte offset of each character of run
	flush := func() int {
		if sc != nil && len(run) > 0 {
			if i := sc.check(run); i >= 0 {
				return pos[i]
			}
		}
		return -1
	}
	for i, c := range text {
		o := e.own[c]
		if (o == nil && e.shared[c]) || (o != nil && (sc == nil || o == sc)) {
			run = append(run, c)
			pos = append(pos, i)
			if o != nil {
				sc = o
			}
			continue
		}
		if at := flush(); at >= 0 {
			return at
		}
		run, pos, sc = run[:0], pos[:0], nil
		if o != nil {
			run, pos, sc = append(run, c), append(pos, i), o
		}
	}
	return flush()
}
