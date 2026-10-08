package deromanize

// ResetForBench drops the loaded tables, so a benchmark can time loading.
func ResetForBench() {
	mu.Lock()
	tables, pooled, lists = map[string]*mix{}, map[string]*model{}, map[string]map[string]int{}
	mu.Unlock()
}
