# Changelog

Each version is one Git tag `v<version>`, one npm version, and one Go
module version. The **Rules** line of an entry names the rules version of
each utility. When a utility's rules version changed, some inputs give a
different output than before: recompute what you stored from the old
version, and compare `RULES_VERSION` (or `SEARCH_VERSION`) to know which
rows. A version whose rules line equals the one before it gives every
input the same output.

## Unreleased

Rules: phonetic 2026-10-11.7, normalize 2026-10-11, segment 2026-10-11, stem 2026-10-11, romanize 2026-10-11.2, deromanize 2026-10-09.2, phonetic-search 2026-10-11.7

- Faster, same output: `deromanize` 2.0x in Go and 1.35x in TypeScript (a
  Hindi word in Go: 11.0 -> 4.4 ms); `romanize` 1.5-2.0x in Go and 1.1x in
  TypeScript (a Hindi sentence in Go: 31 -> 15 ms). The n-gram tables are
  sorted arrays, not one map entry per pair, and the last letter builds only
  the spellings that can be returned, best first.
- Faster, same output: `Search` 2.0x in Go and 2.4x in TypeScript, `NewIndex`
  1.6x and 1.8x. A word's keys are computed once per call, and a pair of
  words is scored once.
- Less memory, faster loads: a loaded Hindi deromanizer keeps 18 MB of heap
  in Go (was 35 MB) and loads in 36 ms (was 111 ms); a romanizer keeps 15 MB
  (was 29 MB) and loads in 40 ms (was 96 ms). The Go word lists are kept as
  bytes. (0.11.0 already made TypeScript's tables flat: a Hindi deromanizer
  130 -> 35 MB, a romanizer 194 -> 42 MB.) A test in each port fails if a
  loaded language grows back past its bound.

## 0.11.0 (2026-10-12)

Rules: phonetic 2026-10-11.7, normalize 2026-10-11, segment 2026-10-11, stem 2026-10-11, romanize 2026-10-11.2, deromanize 2026-10-09.2, phonetic-search 2026-10-11.7

- Changed output: normalize rules 2026-10-07 → 2026-10-11, Tamil only. A
  ZWNJ or ZWJ between consonant + pulli and a consonant is deleted, unless
  the pair is one of the three Tamil conjuncts (க்ஷ, ஶ்ர, ஸ்ர): ப் + ZWNJ + ப →
  ப்ப. Before, a class-based rule kept most of these and deleted the ZWNJ of
  க்ஷ in some words, a change a reader could see. On IndicCorp Tamil text,
  look-alike groups with a joiner made equal: 89.6% → 98.8%. `fold` follows.
  `rules.json` gains `pairs`; the ports read it.
- Changed output: segment rules 2026-10-06 → 2026-10-11, Odia only. ଓ +
  virama + ବ is one letter (ଓ୍ବି in ଓ୍ବିକେଟ୍ "wicket"); Odia news words split
  wrongly: 0.13% → 0.04%. ଓ୍ୱ stays two letters (two fonts draw it apart).
- Docs: normalize's Malayalam limits (the most possible is 71.0% in 15
  fonts; a ZWJ before a vowel sign; Suruma lacks the atomic chillus).
- Added: deromanize `textMixed` / Go `TextMixed`, and `isEnglish` / Go
  `English`, for Hindi typed with English words in it (Hinglish): a word on
  the Hindi English list (10,000 English Wikipedia words, less those a Hindi
  typist writes often) stays as typed. TypeScript fetches the list (22 KB
  gzipped) only with `load("hi", "words", { english: true })`. On
  L3Cube-HingLID, read once, 87.4% of words are called right (IndicLID
  roman: 72.1%); 2.4% of Hindi words stay in Latin. Every other output is
  unchanged, so the deromanize rules version is unchanged.
- Added: romanize mode `"places"` (Go `romanize.Places`), rules
  2026-10-11 → 2026-10-11.2, for place names. Own tables for bn hi ml mr or
  sat ta te ur, learned from Wikidata place names and, for hi mr or, village
  names of the Local Government Directory; the words tables in the other
  languages. Held out, read once, the training's own names left out: village
  names 57.6% first spelling right (words mode 48.0%, IndicXlit 52.8%);
  OpenStreetMap place names 44.4% (40.6%, IndicXlit 49.1%). The words and
  names modes are unchanged since 2026-10-11.
- Changed output: romanize rules 2026-10-09 → 2026-10-11, words mode.
  Bodo writes ख थ फ as kh th ph, as Bodo speakers type them (थाखाय →
  thakhai, was takai), not as Aksharantar's k t f. On typed Bodo sentences
  (Bhasha-Abhijnaanam, read once) the first spelling is right 71.9% of the
  time, was 50.3% (IndicXlit 49.3%); on Aksharantar's word list it falls
  from 75.6% to 45.6%. The shared Brahmic table was retrained, so a few
  lower-ranked spellings in other languages change too (61 of 1,018 words
  conformance rows; no language's first spelling moved by more than 0.2
  points). The names mode is unchanged.

- Changed output: stem rules 2026-10-09 → 2026-10-11, Sanskrit only. 17
  endings added (the anusvara spellings ानां ां ायां, the passive यते यन्ते,
  the infinitive तुं, the absolutive त्वा, and others); 1,301 of the 418,730
  conformance rows change, all Sanskrit. On lemmas of the Digital Corpus of
  Sanskrit, read once, recall rises from 34.6% to 40.5% at 2.7% wrong hits.
- Docs: `stem` damages some names (README Limits, `docs/stem.md#names`).
- Changed output: phonetic 2026-10-07 → 2026-10-11.7. Recompute stored keys.
  `Keys` gives more keys to some words; every key a word had in 0.10.0 it
  still has (checked on every test word, but two long Urdu words whose
  readings exceed the cap of 32 keys a word, was 16), so every pair 0.10.0
  matched still matches. On held-out OpenStreetMap place names the key
  finds 89% of name pairs (romanize + Soundex: 71%).
  - Bengali-script ং and Devanagari ं also read as ŋ: সিং = Singh (Bengali
    and Assamese), and Bodo spelling (दं = dong; Bodo running text 74% →
    86% of words).
  - Tamil ட்ச also reads as க்ஷ: லட்சுமி = Lakshmi. A Tamil name ending in
    ன் or ர் is also keyed without it; a Tamil word starting with a vowel
    also keys with h (உசைன் = Hussain). Latin zh is ழ (Kanimozhi);
    Malayalam റ്റ is also tt and ന്റ also nt (ആന്റണി = Antony). Tamil +1.6 and
    Malayalam +1.9 points on Wikidata (DEV); on BPCC name pairs, read once,
    Tamil +0.9 and Malayalam +1.5.
  - Assamese: ৱ after a vowel (not before i) is also a glide (গোৱেল =
    Goyal), and the case endings ৰ, ৱে, লৈ, ৰপৰা are also read off.
  - A one-letter Latin word also keys as its spoken name: M = em = एम =
    எம். M and N, and H and S, now share a key as initials.
  - Santali: an initial ᱚ is also a (Ol Chiki writes the Indic short a
    with it: Arjun = ᱚᱨᱡᱩᱱ), and ᱣ ᱶ after a vowel is also a glide;
    Santali 74.1% → 84.7% on Wikidata (DEV).
  - Sindhi in Devanagari: the implosives ॻ ॼ ॾ ॿ are read (they had no
    key); व्ह is also v (चव्हाण = Chavan); the long Marathi / Konkani case
    endings (च्या ांच्या मध्ये ांना), the Konkani -ान -ीन -ाईन -ाक -ाचो -ाची
    -ाचें, the Sanskrit -स्य and the Sindhi / Bodo -नि are also read off. On
    BPCC name pairs, read once, +0.49 points (Bodo +3.5).
  - Urdu, Kashmiri and Sindhi script: an initial alif or ع is also i, e or u
    (اندر = Indra, عمران = Imran, which did not match before), and ہ ح
    after a consonant is also silent (جہانگیانی = Jhangiani). Urdu +4.8,
    Kashmiri +4.3 points on Wikidata (DEV); on BPCC name pairs, read once,
    Urdu +3.2. Latin zh is ழ's l or z + h, so both Kanimozhi and Mazhar
    (مظہر) match.
  - Tamil's இ or உ before an initial r or l is also dropped (இராஜ்பால் =
    Rajpal); व after a consonant and before u is also the au glide (கவுர் =
    Kaur); ड ढ after the first letter are also r, the flap written without its nukta
    (राबडी = Rabri). Tamil +3.8 points on Wikidata (DEV).
- Changed output: `NameKeys`, `JoinedKeys` and `Match` (`nameKeys`,
  `joinedKeys`, `match`) drop the leading titles (Shri, Smt., Dr, श्रीमती,
  திரு, …; `titles` in rules.json) of each comma-separated part of a name:
  "Bajwa, Sardar Partap Singh" reads as Bajwa Partap Singh. A name of titles
  only keeps its last word. `Words` still splits only. A second roster as
  written, the Rajya Sabha: the key finds 54.8% → 87.7%.
- Changed output: `JoinedKeys` (`joinedKeys`) returns keys of 6 classes
  or more (`JoinedMinClasses`, was 8): a name written as one word in one
  script and as two in another meets more often (Amartya Sen =
  अमर्त्यसेन). +1.6 points on Wikidata (DEV), +2.7 on OpenStreetMap places
  (read once).
- Changed output: phonetic search 2026-10-09 → 2026-10-11.7. It keys with
  phonetic rules 2026-10-11.7, drops titles as `NameKeys` does, and its
  thresholds were chosen again on the same data: names 74 → 76, villages
  72 → 73, text 80 → 81 and 70 → 71 (`Thresholds` / `THRESHOLDS`). On held-out
  OpenStreetMap places it finds 93% of places in five languages (ICU +
  fuzzy match: 74%), at about 3 wrong places per search per 10,000 names.
- Size: the title list, the letter names and the new rules add about
  1.3 KB gzipped to `phonetic`: 6.9 → 8.2 KB. `phonetic-search` falls
  17.0 → 14.5 KB: its 2^x tables are stored as second differences, and its
  two fine rules files as patches over `rules.json` (every score unchanged).
- Changed output: stem, in the same rules 2026-10-11. Gujarati, Marathi,
  Maithili and Santali run their endings twice, as Kannada does; Maithili
  and Santali gain 7 endings each. On text no rule saw, read once:
  Gujarati +1.7 and Marathi +1.6 points of recall (PIB), Maithili +0.95
  (BPCC), Santali +0.56 (FLORES+); precision falls by at most 1.3 points
  against the old output. About 12,900 conformance rows change, in these
  four languages only.
- `stem`: Sindhi in Perso-Arabic and Manipuri in Bengali script get their
  own endings in the same tables, chosen on FLORES+ and checked once on its
  unseen half (Manipuri: 5.6 points more of the right sentences than exact
  search). Sindhi in Perso-Arabic then gained more endings, checked once on
  the unseen test part of the Sindhi UD treebank: the share of inflected
  forms that reach their word's stem rose from 20.2% to 33.0%, level with
  Snowball's Arabic stemmer, with fewer wrong merges. Words in those
  scripts were returned unchanged before; no Devanagari or Meetei Mayek
  output changes.
- New: `indickit/search-key` (Go `searchkey.Key`), one search key per word:
  normalize, stem, then fold, the order measured best. Fold after stem
  finds 2.4 points more of the right passages in Hindi (MIRACL) and changes
  nothing in Bengali or Telugu. The README's search recipe now uses it, and
  `docs/stem.md` gives an OpenSearch/Elasticsearch setup with a trigram
  field beside the keys.
- New in `stem`: two options. `minStem` (Go `StemWith`, `Options.MinStem`)
  keeps stems longer, for fields of names; 4 halves the names a search
  loses. `indickit/stem-compounds` (Go `CompoundKey`), a separate 1.6 KB
  file, keys a Malayalam word by its first compound member; on held-out
  news it finds 5.5 points more than `stem` alone. The default output does
  not change.
- New in `stem`: Bodo, Dogri, Kashmiri, Konkani, Maithili, Manipuri
  (Meetei Mayek), Santali and Sindhi (Devanagari), in the same rules
  2026-10-11: `stem` now covers all 22 languages. Endings chosen on BPCC's
  human translations; on a part no rule saw, 3.7–11.4 points more of the
  right sentences than exact search, at most 4.4 points less precise.
  About 254,000 conformance rows are new; none changed. The browser file
  grows to 4 KB gzipped.
- Language tags: `ory` (Odia) and `npi` (Nepali), as FLORES+ and NLLB
  write them, now name the `or` and `ne` tables.
- New in `stem`: Odia (`or`), in the same rules 2026-10-11. 11 endings
  chosen on PIB search; on FLORES+, read once, 6.9 points more of the right
  sentences than exact search, 3.4 points less precise. Odia's 24,578
  conformance rows are new.

## 0.10.0 (2026-10-09)

Rules: phonetic 2026-10-07, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-09, romanize 2026-10-09, deromanize 2026-10-09.2, phonetic-search 2026-10-09

- Changed output: phonetic search 2026-10-08 → 2026-10-09, for language
  tags only. `NewIndex` and `Score` (Go), `loadSearch` (TypeScript) took
  a bare code (`hi`) where every other utility takes a tag: `hi-IN`,
  `HI` and `hin` found no Latin table and scored by the fine keys alone.
  They now read the tag as the other utilities do. The tables are
  unchanged: every score for a bare code is the same.
- Changed output: `kok` (the Konkani macrolanguage) names the `gom`
  tables in every utility's tag reading. romanize and deromanize did
  this already; stem and normalize hold no Konkani table, so nothing
  changes there.
- Removed exports: TypeScript `_internal` (phonetic) and `unify`
  (romanize), which no documented use needed. The phonetic engine now
  lives in `js/phonetic-engine.ts`, shared by `phonetic` and
  `phonetic-search`, not an entry of the package.
- Fixed: `phonetic.NewIndex` and `Score` (Go), `index` and `score`
  (TypeScript) given a profile name other than `names` or `text` crashed
  later with no cause named (Go: divide by zero in the first `Search`;
  TypeScript: a `TypeError`). They now fail at once, naming the profile.
- Fixed: the search index built every combination of a name's word keys
  before cutting to 256 (a 26-word name of two-key words: 2^26 strings,
  8 s in Go, 4.9 s in TypeScript). It now builds the first 256 only, as
  `NameKeys` does; the keys are the same.
- Go `stem` checks at load that `max_end + min_stem` in rules.json is
  below its fixed walk (16): a larger value would have cut differently
  from the reference, silently.

## 0.9.0 (2026-10-09)

Rules: phonetic 2026-10-07, normalize 2026-10-07, segment 2026-10-06, stem 2026-10-09, romanize 2026-10-09, deromanize 2026-10-09.2, phonetic-search 2026-10-08

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
- Changed output, TypeScript only: `romanize` text() keeps a ZWJ or ZWNJ
  that no run of the script goes on from (at the start, after a space,
  after an unassigned code point), as Go always did; it deleted it.
- Changed output: romanize rules 2026-10-08 -> 2026-10-09 and deromanize
  2026-10-09 -> 2026-10-09.1. A word of more than 256 letters (`max_letters`)
  gets one spelling: the first spelling of each 256-letter piece, joined.
  Words that long are not words; the beam was quadratic on a long run of
  characters it has no table for (32,000 random code points: 49 s).
- Faster, same output: `deromanize` 1.5-1.6x (a Hindi word in the browser:
  19 -> 12 ms) and `romanize` 1.2-1.4x, in Go and TypeScript. The
  `romanize` browser file is now 9 KB.
- Changed output: deromanize rules 2026-10-09.1 -> 2026-10-09.2. No
  spelling is empty: "q" in Bengali gave ক, ক্ and an empty spelling; the
  empty one is dropped, as `romanize` always did (11 of 3,033 conformance
  rows change, each by that drop).
- The browser files are minified: each is 0.3 to 3.5 KB smaller gzipped
  (`phonetic` 7 KB, `normalize` 16 KB, `romanize` 7 KB, `deromanize`
  21 KB, `phonetic-search` 17 KB). Same code, same output (`check-dist`).

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
