package romanize

import "strings"

// A script converter (rules 2026-10-13.2; rules.json "converters"): the script route's
// first step for a language whose second script its tables cannot read. Every letter
// and switch is data; the two engines are only the loops of the reference
// (linguistic-utilities jobs/romanize/converters.py), which writes the conformance rows.
type converter struct {
	Kind            string            `json:"kind"`
	Halant          string            `json:"halant"`
	Skip            string            `json:"skip"`
	Consonants      map[string]string `json:"consonants"`
	Signs           map[string]string `json:"signs"`
	SignsAfterVowel map[string]string `json:"signs_after_vowel"`
	VowelsInitial   map[string]string `json:"vowels_initial"`
	VowelsMedial    map[string]string `json:"vowels_medial"`
	Vowels          map[string]string `json:"vowels"`
	Nasals          map[string]string `json:"nasals"`
	Prothetic       struct {
		Letters string `json:"letters"`
		Out     string `json:"out"`
	} `json:"prothetic"`
	// bengali_meetei only
	Lonsum       map[string]string `json:"lonsum"`
	Other        map[string]string `json:"other"`
	AA           string            `json:"aa"`
	Nung         string            `json:"nung"`
	LonsumNg     string            `json:"lonsum_ng"`
	Nga          string            `json:"nga"`
	Khanda       string            `json:"khanda"`
	Ya           string            `json:"ya"`
	YaI          string            `json:"ya_i"`
	WLetter      string            `json:"w_letter"`
	WAfter       string            `json:"w_after"`
	WOut         string            `json:"w_out"`
	ConjunctNext string            `json:"conjunct_next"`
	Apun         string            `json:"apun"`
	Joiners      string            `json:"joiners"`
	Ou           string            `json:"ou"`
	OuNotBefore  []string          `json:"ou_not_before"`
	OuOut        string            `json:"ou_out"`
}

type unit struct {
	kind    byte // C consonant, V vowel letter, N nasal, S lone sign, O other
	c, sign string
	hal     bool
}

func (cv *converter) units(w string) []unit {
	rs := []rune(w)
	vowels := cv.Vowels
	if vowels == nil {
		vowels = cv.VowelsInitial
	}
	var out []unit
	for i := 0; i < len(rs); {
		c := string(rs[i])
		if i+1 < len(rs) {
			if _, ok := cv.Consonants[string(rs[i:i+2])]; ok {
				c = string(rs[i : i+2])
			}
		}
		if _, ok := cv.Consonants[c]; ok {
			j := i + len([]rune(c))
			u := unit{kind: 'C', c: c}
			if j < len(rs) {
				if _, ok := cv.Signs[string(rs[j])]; ok {
					u.sign = string(rs[j])
				}
				u.hal = string(rs[j]) == cv.Halant
			}
			out = append(out, u)
			i = j
			if u.sign != "" || u.hal {
				i++
			}
			if i < len(rs) && cv.Skip != "" && strings.ContainsRune(cv.Skip, rs[i]) {
				i++
			}
			continue
		}
		kind := byte('O')
		if _, ok := vowels[c]; ok {
			kind = 'V'
		} else if _, ok := cv.Nasals[c]; ok {
			kind = 'N'
		} else if _, ok := cv.Signs[c]; ok && cv.Kind == "abjad" {
			kind = 'S'
		}
		out = append(out, unit{kind: kind, c: c})
		i++
	}
	return out
}

func (cv *converter) convert(w string) string {
	if cv.Kind == "abjad" {
		return cv.abjad(w)
	}
	return cv.bengaliMeetei(w)
}

func (cv *converter) abjad(w string) string {
	us := cv.units(w)
	var b strings.Builder
	if len(us) > 1 && us[0].kind == 'C' && strings.Contains(cv.Prothetic.Letters, us[0].c) && us[0].hal {
		b.WriteString(cv.Prothetic.Out)
	}
	for k, u := range us {
		switch u.kind {
		case 'V':
			if k == 0 {
				b.WriteString(cv.VowelsInitial[u.c])
			} else {
				b.WriteString(cv.VowelsMedial[u.c])
			}
		case 'N':
			b.WriteString(cv.Nasals[u.c])
		case 'S':
			if s, ok := cv.SignsAfterVowel[u.c]; ok {
				b.WriteString(s)
			} else {
				b.WriteString(cv.Signs[u.c])
			}
		case 'C':
			b.WriteString(cv.Consonants[u.c])
			if u.sign != "" {
				s, ok := cv.SignsAfterVowel[u.sign]
				if ok && k > 0 && (us[k-1].kind == 'V' || us[k-1].kind == 'S') {
					b.WriteString(s)
				} else {
					b.WriteString(cv.Signs[u.sign])
				}
			}
		}
	}
	return b.String()
}

func (cv *converter) bengaliMeetei(w string) string {
	us := cv.units(w)
	var b strings.Builder
	closing := func(m string) string {
		if l, ok := cv.Lonsum[m]; ok {
			return l
		}
		return m
	}
	syllables := 0 // units that are a consonant or a vowel and not halant: the final-aa rule
	for _, u := range us {
		if (u.kind == 'C' || u.kind == 'V') && !u.hal {
			syllables++
		}
	}
	for k, u := range us {
		var prv, nxt *unit
		if k > 0 {
			prv = &us[k-1]
		}
		if k+1 < len(us) {
			nxt = &us[k+1]
		}
		last := nxt == nil
		switch u.kind {
		case 'V':
			if strings.Contains(cv.Ou, u.c) && prv != nil && (prv.sign != "" || prv.kind == 'V') &&
				!(nxt != nil && containsString(cv.OuNotBefore, nxt.c)) {
				b.WriteString(cv.OuOut)
				continue
			}
			b.WriteString(cv.Vowels[u.c])
		case 'N':
			if prv != nil && prv.kind == 'C' && prv.sign == "" {
				b.WriteString(cv.Nung)
			} else {
				b.WriteString(cv.LonsumNg)
			}
		case 'O':
			b.WriteString(cv.Other[u.c])
		case 'C':
			m := cv.Consonants[u.c]
			if u.c == cv.WLetter && prv != nil && prv.kind == 'C' && prv.hal && strings.Contains(cv.WAfter, prv.c) {
				m = cv.WOut
			}
			if u.c == cv.Ya && u.sign == "" && prv != nil && (prv.sign != "" || prv.kind == 'V') && (last || nxt.kind == 'C') {
				b.WriteString(cv.YaI)
				continue
			}
			if u.hal {
				switch {
				case k == 0 && strings.Contains(cv.Prothetic.Letters, u.c):
					b.WriteString(cv.Prothetic.Out)
				case nxt != nil && nxt.kind == 'C' && (nxt.c == cv.ConjunctNext || (nxt.c == cv.WLetter && strings.Contains(cv.WAfter, u.c))):
					b.WriteString(m + cv.Apun)
				case nxt != nil && nxt.kind == 'C' && strings.Contains(cv.Joiners, cv.Consonants[nxt.c]) && cv.Lonsum[m] == "":
					b.WriteString(m + cv.Apun)
				default:
					b.WriteString(closing(m))
				}
				continue
			}
			if u.sign != "" {
				if u.sign == cv.AA && last && syllables > 1 {
					b.WriteString(m)
				} else {
					b.WriteString(m + cv.Signs[u.sign])
				}
				continue
			}
			switch {
			case last:
				b.WriteString(closing(m))
			case u.c == cv.Nga && prv != nil && nxt.kind == 'C':
				if prv.kind == 'C' && prv.sign == "" && !prv.hal {
					b.WriteString(cv.Nung)
				} else {
					b.WriteString(cv.LonsumNg)
				}
			case nxt.kind == 'C' && prv != nil && prv.sign != "":
				b.WriteString(closing(m))
			case nxt.kind == 'C' && k >= 2 && open2(us[k-2:k], cv.Khanda):
				b.WriteString(closing(m))
			default:
				b.WriteString(m)
			}
		}
	}
	return b.String()
}

// open2: both units are a bare consonant (no sign, no halant) and not the khanda ta.
func open2(us []unit, khanda string) bool {
	for _, u := range us {
		if u.kind != 'C' || u.sign != "" || u.hal || u.c == khanda {
			return false
		}
	}
	return true
}

func containsString(xs []string, s string) bool {
	for _, x := range xs {
		if x == s {
			return true
		}
	}
	return false
}
