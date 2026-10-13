package romanize

import "testing"

// Options{Route: true} without the route's files is an error, not a silent names list.
func TestRouteWithoutItsFilesIsAnError(t *testing.T) {
	mu.Lock()
	saved := files["hi.known.bin"]
	delete(files, "hi.known.bin")
	mu.Unlock()
	defer func() { mu.Lock(); files["hi.known.bin"] = saved; mu.Unlock() }()
	if saved == nil {
		t.Skip("lang/hi is not imported")
	}
	if _, err := WordWith("गेवरा", "hi", Names, 4, Options{Route: true}); err == nil {
		t.Error("WordWith: no error without hi.known.bin")
	}
	if _, err := TextWith("गेवरा", "hi", Names, Options{Route: true}); err == nil {
		t.Error("TextWith: no error without hi.known.bin")
	}
	if got := Word("गेवरा", "hi", Names, 1); len(got) != 1 {
		t.Errorf("Word without the route's files: %v", got)
	}
}
