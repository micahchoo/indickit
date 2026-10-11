package stem

import (
	_ "embed"
	"encoding/json"
)

//go:embed compounds_ml.json
var compoundsJSON []byte

var (
	compoundMembers = map[string]bool{}
	compoundRest    int
	compoundLongest int // in code points
)

func init() {
	var c struct {
		Rest    int      `json:"rest"`
		Members []string `json:"members"`
	}
	if err := json.Unmarshal(compoundsJSON, &c); err != nil {
		panic("stem: compounds_ml.json: " + err.Error())
	}
	compoundRest = c.Rest
	for _, m := range c.Members {
		compoundMembers[m] = true
		if n := len([]rune(m)); n > compoundLongest {
			compoundLongest = n
		}
	}
}

// CompoundKey returns the Malayalam first member that starts word, the
// longest that leaves at least two code points after it, and true; or "",
// false. Use it in place of the stem for Malayalam:
//
//	key, ok := stem.CompoundKey(w)
//	if !ok {
//		key = stem.Stem(w, "ml")
//	}
//
// It finds compounds and some oblique forms (കേരളസർക്കാർ and
// കേരളത്തിലെ share കേരള). On held-out news it found 5.5 points more of the
// right sentences than Stem alone, and was 2.9 points less precise. word
// must be normalized.
func CompoundKey(word string) (string, bool) {
	r := []rune(word)
	for k := min(compoundLongest, len(r)-compoundRest); k >= 5; k-- {
		if p := string(r[:k]); compoundMembers[p] {
			return p, true
		}
	}
	return "", false
}
