package phonetic

// The search: the key finds candidates, and a learned scorer ranks them,
// 0..100. The reference is linguistic-utilities jobs/phonetic/scorer.py; every
// table is in scorer/ and every step is integer arithmetic, so Go, TypeScript
// and the reference give the same scores (testdata/scorer-conformance.jsonl.gz).

import (
	"embed"
	"encoding/json"
	"math"
	"sort"
	"strings"
	"sync"
	"unicode"
	"unicode/utf8"

	"github.com/micahchoo/indickit/internal/unidata"
	"github.com/micahchoo/indickit/internal/unorm"
)

//go:embed scorer
var scorerFiles embed.FS

// The two scoring profiles. Names: lists of names (a roster, a directory).
// Text: a name among the words of a running text.
const (
	ProfileNames = "names"
	ProfileText  = "text"
)

type profile struct {
	Key, Cost, Vowel, Div int
	StopPermille          *int `json:"stop_permille"`
	StopMinNames          int  `json:"stop_min_names"` // no stop share in a smaller index
	Round                 bool
}

var searchRules = func() (r struct {
	Version     string             `json:"version"`
	Profiles    map[string]profile `json:"profiles"`
	Temperature int64              `json:"posterior_temperature"`
	DeletionMin int                `json:"deletion_min_classes"`
	LooseMin    int                `json:"loose_joined_min_classes"`
	Thresholds  map[string]int     `json:"thresholds"`
	Pow         []int64            `json:"pow"`
	Exp2        []int64            `json:"exp2"`
}) {
	data, err := scorerFiles.ReadFile("scorer/search.json")
	if err == nil {
		err = json.Unmarshal(data, &r)
	}
	if err != nil {
		panic("phonetic: bad embedded scorer/search.json: " + err.Error())
	}
	return
}()

// SearchVersion names the scorer's tables; scores change when it does.
var SearchVersion = searchRules.Version

// Thresholds are the scores measured for each use (README): names in a list
// 74, villages 72, a name in text 80 (at most 10% of hits wrong) or 70 (20%).
var Thresholds = searchRules.Thresholds

func mustEngine(name string) *engine {
	data, err := scorerFiles.ReadFile("scorer/" + name)
	if err == nil {
		var e *engine
		if e, err = load(data); err == nil {
			return e
		}
	}
	panic("phonetic: bad embedded scorer/" + name + ": " + err.Error())
}

var fineEngine, fine2Engine = mustEngine("fine.json"), mustEngine("fine2.json")

const inf = int64(1) << 30

// ---- integer helpers ---------------------------------------------------------

// pow2neg is 2^-(k/100) x 10^6, from the table; 0 past its end.
func pow2neg(k int64) int64 {
	if k < 0 || k >= int64(len(searchRules.Pow)) {
		return 0
	}
	return searchRules.Pow[k]
}

// log2x10 is floor(10 x log2(num / den)) for num >= den > 0.
func log2x10(num, den int64) int64 {
	e := searchRules.Exp2
	q := 0
	for q+1 < len(e) && den*e[q+1] <= num*65536 {
		q++
	}
	return int64(q)
}

// ratio is rapidfuzz's ratio in hundredths: 20000 x LCS / (len a + len b), rounded.
func ratio(a, b []rune) int64 {
	n := int64(len(a) + len(b))
	if n == 0 {
		return 10000
	}
	prev := make([]int64, len(b)+1)
	cur := make([]int64, len(b)+1)
	for _, x := range a {
		cur[0] = 0
		for j, y := range b {
			if x == y {
				cur[j+1] = prev[j] + 1
			} else {
				cur[j+1] = max(prev[j+1], cur[j])
			}
		}
		prev, cur = cur, prev
	}
	return (40000*prev[len(b)] + n) / (2 * n)
}

func rounded(num, den int64) int64 { return (2*num + den) / (2 * den) }

// ---- words -------------------------------------------------------------------

// searchWords splits a name as the reference does: Latin read a-z and digits,
// anything else in NFC.
func searchWords(name string) []string {
	var out []string
	for _, w := range Words(name) {
		w = normalize(w)
		if isASCII(w) {
			w = strings.Map(func(r rune) rune {
				if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
					return r
				}
				return -1
			}, w)
		}
		if w != "" && len(std.keys(w)) > 0 {
			out = append(out, w)
		}
	}
	return out
}

func isASCII(s string) bool {
	for i := 0; i < len(s); i++ {
		if s[i] >= 0x80 {
			return false
		}
	}
	return true
}

func latSyms(w string) []rune {
	var out []rune
	for _, r := range strings.ToLower(w) {
		if r >= 'a' && r <= 'z' {
			out = append(out, r)
		}
	}
	return out
}

func natSyms(w string) []rune {
	var out []rune
	for _, r := range unorm.NFC(w) {
		if r != 0x200c && r != 0x200d && !unicode.IsSpace(r) {
			out = append(out, r)
		}
	}
	return out
}

func deletions(k string) []string {
	rs := []rune(k)
	if len(rs) < searchRules.DeletionMin {
		return nil
	}
	out := make([]string, len(rs))
	for i := range rs {
		out[i] = string(rs[:i]) + string(rs[i+1:])
	}
	return out
}

func fineKey(w string) []rune {
	ks := fineEngine.keys(w)
	if len(ks) == 0 {
		return nil
	}
	return []rune(ks[0])
}

func fine2Keys(w string) [][]rune {
	arabic := false
	for _, r := range w {
		if r >= 0x0600 && r <= 0x06FF {
			arabic = true
		}
	}
	seen := map[string]bool{}
	var out [][]rune
	for _, f := range fine2Engine.keys(w) {
		rs := []rune(f)
		g := rs[:1:1]
		for _, r := range rs[1:] {
			switch r {
			case 'a':
			case 'y':
				g = append(g, 'i')
			default:
				g = append(g, r)
			}
		}
		if arabic && len(g) > 1 && g[len(g)-1] == 'h' {
			g = g[:len(g)-1]
		}
		if !seen[string(g)] {
			seen[string(g)] = true
			out = append(out, g)
		}
	}
	return out
}

func vowelRatio(a, b string) int64 {
	var best int64
	for _, x := range fine2Keys(a) {
		for _, y := range fine2Keys(b) {
			best = max(best, ratio(x, y))
		}
	}
	return best
}

var blocks = []struct {
	lo, hi rune
	name   string
}{{0x0600, 0x06FF, "arab"}, {0x0750, 0x077F, "arab"}, {0x0900, 0x097F, "deva"},
	{0x0980, 0x09FF, "beng"}, {0x0A00, 0x0A7F, "guru"}, {0x0A80, 0x0AFF, "gujr"},
	{0x0B00, 0x0B7F, "orya"}, {0x0B80, 0x0BFF, "taml"}, {0x0C00, 0x0C7F, "telu"},
	{0x0C80, 0x0CFF, "knda"}, {0x0D00, 0x0D7F, "mlym"}, {0x1C50, 0x1C7F, "olck"},
	{0xABC0, 0xABFF, "mtei"}}

func scriptOf(w string) string {
	for _, r := range w {
		if unidata.IsLetter(r) {
			for _, b := range blocks {
				if r >= b.lo && r <= b.hi {
					return b.name
				}
			}
			return ""
		}
	}
	return ""
}

// ---- the learned tables ---------------------------------------------------------

type costTable struct {
	idx   map[rune]int32
	v     int
	c     []int64           // v x v
	units map[int32][]int64 // i*v + j -> costs by target id (two-letter Latin units)
}

type rawTable struct {
	Latin, Native, X, Y []string
	C                   [][]json.RawMessage
	Units               [][]json.RawMessage
}

func (t *costTable) at(i, j int32) int64 { return t.c[int(i)*t.v+int(j)] }

func buildTable(src, dst []string, rows [][]json.RawMessage) *costTable {
	alpha := append(append([]string{}, src...), dst...)
	t := &costTable{idx: map[rune]int32{}, v: len(alpha) + 1}
	for i, s := range alpha {
		t.idx[one(s)] = int32(i + 1)
	}
	t.c = make([]int64, t.v*t.v)
	for i := range t.c {
		t.c[i] = inf
	}
	for r, row := range rows {
		var d int64
		var ex [][2]int64
		json.Unmarshal(row[0], &d)
		json.Unmarshal(row[1], &ex)
		for j := 0; j < t.v; j++ {
			t.c[r*t.v+j] = d
		}
		for _, e := range ex {
			t.c[r*t.v+int(e[0])] = e[1]
		}
	}
	t.c[0] = 0
	return t
}

var tables sync.Map // "latin/hi" or "pairs/arab-deva" -> *costTable (nil: none)

func loadTable(path string) *costTable {
	if t, ok := tables.Load(path); ok {
		return t.(*costTable)
	}
	var t *costTable
	if data, err := scorerFiles.ReadFile("scorer/" + path + ".json"); err == nil {
		var raw rawTable
		if json.Unmarshal(data, &raw) == nil {
			if raw.Latin != nil {
				t = buildTable(raw.Latin, raw.Native, raw.C)
				t.units = map[int32][]int64{}
				nl := int64(len(raw.Latin))
				for _, u := range raw.Units {
					var i, j, d int64
					var ex [][2]int64
					json.Unmarshal(u[0], &i)
					json.Unmarshal(u[1], &j)
					json.Unmarshal(u[2], &d)
					json.Unmarshal(u[3], &ex)
					row := make([]int64, t.v)
					for k := range row {
						row[k] = inf
						if int64(k) > nl && d >= 0 {
							row[k] = d
						}
					}
					for _, e := range ex {
						if e[1] < 0 {
							row[e[0]] = inf
						} else {
							row[e[0]] = e[1]
						}
					}
					t.units[int32(i)*int32(t.v)+int32(j)] = row
				}
			} else {
				t = buildTable(raw.X, raw.Y, raw.C)
			}
		}
	}
	actual, _ := tables.LoadOrStore(path, t)
	return actual.(*costTable)
}

func (t *costTable) ids(rs []rune) []int32 {
	out := make([]int32, len(rs))
	for i, r := range rs {
		out[i] = t.idx[r] // 0 when the table never saw it
	}
	return out
}

// align is the cheapest edit path, with two-letter Latin units when withUnits.
func (t *costTable) align(a, b []int32, withUnits bool) int64 {
	n, m := len(a), len(b)
	D := make([]int64, (n+1)*(m+1))
	w := m + 1
	for i := 1; i <= n; i++ {
		D[i*w] = D[(i-1)*w] + t.at(a[i-1], 0)
	}
	for j := 1; j <= m; j++ {
		D[j] = D[j-1] + t.at(0, b[j-1])
	}
	for i := 1; i <= n; i++ {
		for j := 1; j <= m; j++ {
			best := D[(i-1)*w+j-1] + t.at(a[i-1], b[j-1])
			best = min(best, D[(i-1)*w+j]+t.at(a[i-1], 0))
			best = min(best, D[i*w+j-1]+t.at(0, b[j-1]))
			if withUnits && i >= 2 {
				if row := t.units[a[i-2]*int32(t.v)+a[i-1]]; row != nil {
					best = min(best, D[(i-2)*w+j-1]+row[b[j-1]])
				}
			}
			D[i*w+j] = best
		}
	}
	return D[n*w+m]
}

// cost is a word pair's cost per letter in 0.01-bit units, or ok = false with no table.
func cost(a, b, lang string) (int64, bool) {
	aa, ba := isASCII(a), isASCII(b)
	var t *costTable
	var x, y []rune
	var n int
	withUnits := false
	switch {
	case aa != ba:
		lat, nat := a, b
		if !aa {
			lat, nat = b, a
		}
		if t = loadTable("latin/" + lang); t == nil {
			return 0, false
		}
		x, y, withUnits = latSyms(lat), natSyms(nat), true
		n = max(len(x), 1)
	case !aa:
		sa, sb := scriptOf(a), scriptOf(b)
		if sa == "" || sb == "" || sa == sb {
			return 0, false
		}
		if sa > sb {
			a, b, sa, sb = b, a, sb, sa
		}
		if t = loadTable("pairs/" + sa + "-" + sb); t == nil {
			return 0, false
		}
		x, y = natSyms(a), natSyms(b)
		n = max(len(x), len(y), 1)
	default:
		return 0, false
	}
	total := t.align(t.ids(x), t.ids(y), withUnits)
	return (20*total + int64(n)) / (2 * int64(n)), true
}

// calibrations: for query word a, each candidate word's rel + posterior (0..200).
func calibrations(a string, cands []string, lang string) map[string]int64 {
	cs := map[string]int64{}
	for _, b := range cands {
		if c, ok := cost(a, b, lang); ok {
			cs[b] = c
		}
	}
	if len(cs) == 0 {
		return nil
	}
	// The true minimums, as the reference: a cost x length can pass inf (a
	// query word of 10,000 letters), and a minimum started at inf then made
	// every weight 0 and z 0.
	best, lo := int64(math.MaxInt64), int64(math.MaxInt64)
	na := int64(len(natSyms(a)))
	if isASCII(a) {
		na = int64(len(latSyms(a)))
	}
	na = max(na, 1)
	for _, c := range cs {
		best, lo = min(best, c), min(lo, c*na)
	}
	w := map[string]int64{}
	var z int64
	for b, c := range cs {
		w[b] = pow2neg((c*na - lo) / searchRules.Temperature)
		z += w[b]
	}
	out := map[string]int64{}
	for b, c := range cs {
		rel := (100*pow2neg(c-best) + 500_000) / 1_000_000
		post := (100*w[b] + z/2) / z
		out[b] = rel + post
	}
	return out
}

func (p profile) finish(num, den int64) int64 {
	if p.Round {
		return rounded(num, den)
	}
	return num / den
}

func wordSim(a, b, lang string, cal map[string]int64, p profile) int64 {
	var meet int64
	if shareOne(std.keys(a), std.keys(b)) {
		meet = 1
	}
	var c2, v int64
	if isASCII(a) && isASCII(b) {
		v = ratio(latSyms(a), latSyms(b))
		c2 = 2 * v
	} else if c, ok := cal[b]; ok {
		c2, v = 100*c, vowelRatio(a, b)
	} else if _, ok := cost(a, b, lang); ok {
		c2, v = 20000, vowelRatio(a, b)
	} else {
		v = ratio(fineKey(a), fineKey(b))
		c2 = 2 * v
	}
	num := 2*int64(p.Key)*10000*meet + int64(p.Cost)*c2 + 2*int64(p.Vowel)*v
	return p.finish(num, 200*int64(p.Div))
}

// ---- the index -------------------------------------------------------------------

// Index holds names to search, keyed once. The Latin tables are per language,
// so an index holds the names of one language (lang: hi, ta, ur, ...).
type Index struct {
	lang    string
	profile profile
	words   [][]string
	n       int64
	df      map[string]int64
	strict  map[string][]int
	joined  map[string][]int
	loose   map[string][]int
	near    map[string][]int
}

// Hit is a name found by Search: its position in the index, and its score.
type Hit struct {
	Name  int
	Score int
}

func joinedOf(ws []string, minClasses int) []string {
	j := strings.Join(ws, "")
	if j == "" {
		return nil
	}
	var out []string
	for _, k := range std.keys(j) {
		if utf8.RuneCountInString(k) >= minClasses {
			out = append(out, k)
		}
	}
	return out
}

func strictKeys(ws []string) []string {
	var all [][]string
	for _, w := range ws {
		if ks := std.keys(w); len(ks) > 0 {
			all = append(all, ks)
		}
	}
	if len(all) == 0 {
		return nil
	}
	out := []string{""}
	for i, ks := range all { // the product, the last word fastest, cut at MaxNameKeys
		var next []string
		for _, p := range out {
			for _, k := range ks {
				if i > 0 {
					next = append(next, p+"\x1f"+k)
				} else {
					next = append(next, k)
				}
			}
		}
		out = next
	}
	if len(out) > MaxNameKeys {
		out = out[:MaxNameKeys]
	}
	return out
}

// NewIndex keys names of one language for Search. profile is ProfileNames or
// ProfileText; any other name panics.
func NewIndex(names []string, lang, profileName string) *Index {
	p, ok := searchRules.Profiles[profileName]
	if !ok {
		panic(`phonetic: unknown profile "` + profileName + `" (ProfileNames or ProfileText)`)
	}
	ix := &Index{lang: lang, profile: p, n: int64(len(names)),
		df: map[string]int64{}, strict: map[string][]int{}, joined: map[string][]int{},
		loose: map[string][]int{}, near: map[string][]int{}}
	ix.words = make([][]string, len(names))
	for i, name := range names {
		ix.words[i] = searchWords(name)
		seen := map[string]bool{}
		for _, w := range ix.words[i] {
			for _, k := range std.keys(w) {
				if !seen[k] {
					seen[k] = true
					ix.df[k]++
				}
			}
		}
	}
	add := func(m map[string][]int, k string, i int) {
		if l := m[k]; len(l) == 0 || l[len(l)-1] != i {
			m[k] = append(l, i)
		}
	}
	for i, ws := range ix.words {
		for _, k := range strictKeys(ws) {
			add(ix.strict, k, i)
		}
		for _, k := range joinedOf(ws, std.joinedMin) {
			add(ix.joined, k, i)
		}
		for _, k := range joinedOf(ws, searchRules.LooseMin) {
			add(ix.loose, k, i)
		}
		for _, w := range ws {
			for _, k := range std.keys(w) {
				if ix.common(k) {
					continue
				}
				add(ix.near, k, i)
				for _, d := range deletions(k) {
					add(ix.near, d, i)
				}
			}
		}
	}
	return ix
}

func (ix *Index) common(k string) bool {
	s := ix.profile.StopPermille
	return s != nil && ix.n >= int64(ix.profile.StopMinNames) && ix.df[k]*1000 > ix.n*int64(*s)
}

func (ix *Index) weight(w string) int64 {
	var best int64
	for _, k := range std.keys(w) {
		best = max(best, log2x10(ix.n, max(ix.df[k], 1)))
	}
	return best
}

func (ix *Index) candidates(qws []string) map[int]bool {
	out := map[int]bool{}
	for _, k := range strictKeys(qws) {
		for _, i := range ix.strict[k] {
			out[i] = true
		}
	}
	if len(out) == 0 {
		for _, k := range joinedOf(qws, std.joinedMin) {
			for _, i := range ix.joined[k] {
				out[i] = true
			}
		}
	}
	for _, k := range joinedOf(qws, searchRules.LooseMin) {
		for _, i := range ix.loose[k] {
			out[i] = true
		}
	}
	for _, w := range qws {
		for _, k := range std.keys(w) {
			if ix.common(k) {
				continue
			}
			for _, d := range append([]string{k}, deletions(k)...) {
				for _, i := range ix.near[d] {
					out[i] = true
				}
			}
		}
	}
	return out
}

func (ix *Index) nameScore(qws, dws []string, cal map[string]map[string]int64) int64 {
	var num, den int64
	for side := 0; side < 2; side++ {
		a, b := qws, dws
		if side == 1 {
			a, b = dws, qws
		}
		for _, w := range a {
			x := ix.weight(w)
			den += x
			var best int64
			for _, o := range b {
				var s int64
				if side == 0 {
					s = wordSim(w, o, ix.lang, cal[w], ix.profile)
				} else {
					s = wordSim(o, w, ix.lang, cal[o], ix.profile)
				}
				best = max(best, s)
			}
			num += x * best
		}
	}
	var soft int64
	if den > 0 {
		soft = (num + den/2) / den
	}
	if len(qws) != len(dws) && len(qws) > 0 && len(dws) > 0 {
		jq, jd := strings.Join(qws, ""), strings.Join(dws, "")
		var meet int64
		if shareOne(joinedOf([]string{jq}, searchRules.LooseMin), joinedOf([]string{jd}, searchRules.LooseMin)) {
			meet = 1
		}
		var c, v int64
		if _, ok := cost(jq, jd, ix.lang); ok {
			c, v = 10000, vowelRatio(jq, jd)
		} else {
			c = ratio(fineKey(jq), fineKey(jd))
			v = c
		}
		p := ix.profile
		num := int64(p.Key)*10000*meet + int64(p.Cost)*c + int64(p.Vowel)*v
		soft = max(soft, p.finish(num, 100*int64(p.Div)))
	}
	return soft
}

func (ix *Index) scoreAll(query string, which []int) []Hit {
	qws := searchWords(query)
	seen := map[string]bool{}
	var cw []string
	for _, i := range which {
		for _, w := range ix.words[i] {
			if !seen[w] {
				seen[w] = true
				cw = append(cw, w)
			}
		}
	}
	cal := map[string]map[string]int64{}
	for _, a := range qws {
		cal[a] = calibrations(a, cw, ix.lang)
	}
	out := make([]Hit, len(which))
	for k, i := range which {
		out[k] = Hit{i, int(ix.nameScore(qws, ix.words[i], cal))}
	}
	return out
}

// Search returns the names scoring at least threshold, best first (ties in
// index order). Scores are relative to the other candidates the key found, so
// a score belongs to its search, not to a pair of names.
func (ix *Index) Search(query string, threshold int) []Hit {
	cands := ix.candidates(searchWords(query))
	which := make([]int, 0, len(cands))
	for i := range cands {
		which = append(which, i)
	}
	sort.Ints(which)
	var out []Hit
	for _, h := range ix.scoreAll(query, which) {
		if h.Score >= threshold {
			out = append(out, h)
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Score > out[j].Score })
	return out
}

// Score gives one score per candidate name, calibrated among these candidates.
func Score(query string, candidates []string, lang, profileName string) []int {
	ix := NewIndex(candidates, lang, profileName)
	which := make([]int, len(candidates))
	for i := range which {
		which[i] = i
	}
	hits := ix.scoreAll(query, which)
	out := make([]int, len(hits))
	for i, h := range hits {
		out[i] = h.Score
	}
	return out
}
