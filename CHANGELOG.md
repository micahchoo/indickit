# Changelog

Each version is one Git tag `v<version>`, one npm version, and one Go
module version. The **Rules** line of an entry names the rules version of
each utility. When a utility's rules version changed, some inputs give a
different output than before: recompute what you stored from the old
version, and compare `RULES_VERSION` (or `SEARCH_VERSION`) to know which
rows. A version whose rules line equals the one before it gives every
input the same output.

## Unreleased

Rules: phonetic 2026-10-07, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-09, romanize 2026-10-08, deromanize 2026-10-09, phonetic-search 2026-10-08

- New: `wellformed`, a check that a word is drawn as written
  (`indickit/wellformed`).
- Changed output: stem rules 2026-10-06 → 2026-10-09. Kannada applies its
  stem twice (ಪ್ರಧಾನಮಂತ್ರಿಯವರು → ಪ್ರಧಾನಮಂತ್ರಿ): on held-out PIB text,
  recall +0.86 points, precision −0.75. No other language changes.
- Changed output: romanize rules 2026-10-07 → 2026-10-08. A ZWJ or ZWNJ
  inside a word no longer cuts the word (प्राप्\u200dत gave "the"). Manipuri
  in Bengali script is romanized from the Brahmic tables (রামেন gave "en");
  the `meetei` table group is gone, and `words-brahmic.bin` grows from
  2,543 to 2,679 KB.
- Changed output: deromanize rules 2026-10-08 → 2026-10-09. Names mode no
  longer ranks first a spelling that writes nothing for a consonant
  (ml "murmu" gave മു, ks "rajnath" gave راج). Still open: sd "Rafi" in
  words mode keeps a comma chunk, ranked second.
- Changed output, Go only: NFC now equals Python and ICU on long runs of
  combining marks (Go inserted U+034F after 30 marks). Names split on the
  same spaces in Go and TypeScript (Go missed 24, among them the no-break
  space).
- Language tags: `hi-IN`, `HI` and `hin` now mean Hindi in Go and
  TypeScript; before, they silently meant no language.
- Fixed: TypeScript `normalize` and `fold` threw `RangeError` above about
  125,000 code points; Go `NameKeys` took quadratic time (70.6 s → 0.09 s
  on 1 MB of Tamil).
- Go and TypeScript read one pinned Unicode 15.0 table for the blocks
  indickit has rules for. Cost: about 2.9 KB gzipped in each bundle that
  reads it; the phonetic, normalize and romanize bundles are now over their
  README budgets.
- Fixed: Go `phonetic.Score` and `Index.Search` panicked (integer divide
  by zero) on a query word of about 10,000 letters; they now give the
  reference's scores. TypeScript `score` threw `RangeError` from about
  125,000 candidates in Node.
- Faster on long input, same output: `wellformed` (262,144 code points:
  2.3 s -> 0.03 s in Go, 7.2 s -> 0.04 s in TypeScript) and the `romanize`
  and `deromanize` decoders (a 4,096-letter word ran out of 6 GB in Go). `phonetic-search`
  still grows with (query words) x (candidate words): cap user input
  (README, Limits).

## 0.8.0 (2026-10-08)

Rules: phonetic 2026-10-07, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-06, romanize 2026-10-07, deromanize 2026-10-08, phonetic-search 2026-10-08

- New: `deromanize`, Latin typing to Indian script (`indickit/deromanize`).
- New: `phonetic-search`, a scored search over phonetic keys
  (`indickit/phonetic-search`).
- Changed output: phonetic rules 2026-10-06.1 → 2026-10-07, which added the
  folds `brahmic-av-u`, `flap-r` and `latin-ngh`.
- README: a table of the 22 languages and what each utility covers.
- 0.7.0 was committed but never tagged or published; its work is here.

## 0.6.0 (2026-10-07)

Rules: phonetic 2026-10-06.1, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-06, romanize 2026-10-07

- New: `romanize`, Indian text in Latin letters as people spell it
  (`indickit/romanize`). Its tables load at run time, beside the module or
  from jsDelivr at this version's tag.

## 0.5.0 (2026-10-07)

Rules: phonetic 2026-10-06.1, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-06

- Changed output: `fold` rules 2026-10-07.
- Changed output: phonetic 2026-10-06.1, a fix for digits.
- Language tags on `normalize` and `fold`.

## 0.4.3 (2026-10-06)

Rules: phonetic 2026-10-06, normalize 2026-10-05, segment 2026-10-06, stem 2026-10-06

- First version on npm. README names the floors: Go 1.22, Node 20,
  TypeScript `moduleResolution` nodenext or bundler.

## 0.4.2, 0.4.1 (2026-10-06)

Rules: as 0.4.0.

- Go floor 1.22. 0.4.1 failed its README test and was not published.

## 0.4.0 (2026-10-06)

Rules: phonetic 2026-10-06, normalize 2026-10-05, segment 2026-10-06, stem 2026-10-06

- New: `stem`, one search key for the forms of a word, 13 languages.

## 0.3.0 (2026-10-06)

Rules: phonetic 2026-10-06, normalize 2026-10-05, segment 2026-10-06

- New: `segment`, the letters a reader sees.

## 0.2.0 (2026-10-06)

Rules: phonetic 2026-10-06, normalize 2026-10-05

- New: `normalize`, one encoding for text that looks the same.
- Changed output: phonetic rules 2026-10-05 → 2026-10-06.

## 0.1.0 (2026-10-05)

Rules: phonetic 2026-10-05

- New: `phonetic`, a key that matches one name across scripts.
