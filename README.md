# indickit

Small, exact utilities for text in the languages of India, in Go and
TypeScript. They fix the places where ordinary string code goes wrong on
Indian text: a search that misses a word because it is spelled, encoded or
inflected another way, a letter count that cuts a letter in two, a name
that must be written in Latin letters, and Latin typing that must be written
in an Indian script.

```
stem      किताब  किताबें  किताबों              →  किताब
phonetic  राम  ರಾಮ  രാമ  ராம  رام  Ram       →  rn
segment   ಲಕ್ಷ್ಮಿ                              →  ಲ  ಕ್ಷ್ಮಿ
romanize  लक्ष्मी  ലക്ഷ്മി  லக்ஷ்மி              →  lakshmi
deromanize  namaste                         →  नमस्ते
```

Each utility gives the same output in Go and in TypeScript, and each was
measured on data that its rules were never built on.

## Which one you need

| You want to | Use |
|---|---|
| store text so that one look has one encoding | `normalize` |
| let a search for किताब also find किताबों | `normalize`, then `stem` |
| let a search for हिन्दी also find हिंदी, and keep words whole | `fold` |
| find a person's name typed in another script | `phonetic` |
| find a name in a long list, as people write it (titles, initials), or in running text | `phonetic-search` |
| count letters, cut at a length, or move a cursor | `segment` |
| write a name or a text in Latin letters (लक्ष्मी → lakshmi) | `romanize` |
| write Latin typing in an Indian script (namaste → नमस्ते) | `deromanize` |

## Install

Go 1.22 or later:

```sh
go get github.com/micahchoo/indickit
```

JavaScript or TypeScript, on Node 20 or later, Bun or Deno:

```sh
npm install indickit
bun add indickit
deno add npm:indickit
```

The package is ES modules only; `require()` works from Node 20.19. In
TypeScript, set `moduleResolution` to `nodenext` or `bundler`; the old
`node10` cannot find the four utilities.

In a browser, with no build step:

```js
import { normalize } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/normalize.js";
import { stem } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/stem.js";
import { match } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/phonetic.js";
import { segment } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/segment.js";
import { load } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/romanize.js";
import { loadSearch } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/phonetic-search.js";
import { load as loadDeromanize } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.8.0/dist/deromanize.js";
```

Each utility is its own file, so a page loads only the rules it uses.
`romanize` also loads one language's tables when you ask for them (0.2–1.8
MB), `deromanize` one language's tables and word list (0.3–3.1 MB), and
`phonetic-search` one language's table (2–6 KB). The npm package carries no tables: `load()` reads them beside the
module (a jsDelivr or GitHub-tag install), else from jsDelivr at the same
version. Offline, pass your own `fetch`. In Go, `go get` downloads the
tables of every language once (`romanize` 14 MB, `deromanize` 52 MB); a
program carries only the languages it imports.

## Recipes

### Store text

Two strings can look the same and differ in their bytes: an invisible
joiner, an old Malayalam chillu, a ज़ typed as one code point or two.
`normalize` gives them one encoding, and it never changes what a reader
sees. Store text after `normalize`.

```ts
import { normalize } from "indickit/normalize";

normalize("ಸಿಕಾರ್\u200c", "kn"); // "ಸಿಕಾರ್": a ZWNJ at the end draws nothing
normalize("അവന്\u200d", "ml"); // "അവൻ": the old chillu becomes the atomic one
normalize("र्\u200dय", "mr"); // "र्\u200dय": eyelash ra; this ZWJ is visible, so it stays
```

### Search words in their other forms

Give every word of a document a key, and give the query the same key. The
key for a word is `stem(normalize(word, lang), lang)`:

```ts
import { normalize } from "indickit/normalize";
import { stem } from "indickit/stem";

stem(normalize("किताबों", "hi"), "hi"); // "किताब"
stem(normalize("ஆண்டில்", "ta"), "ta"); // "ஆண்ட"
stem(normalize("ஆண்டு", "ta"), "ta"); // "ஆண்ட"
stem(normalize("ಸರ್ಕಾರಕ್ಕೆ", "kn"), "kn"); // "ಸರ್ಕಾರ"
stem(normalize("حکومتوں", "ur"), "ur"); // "حکومت"
```

In 13 languages, a search with stems finds 6–15 points more of the right
sentences than an exact search. In a search engine over Wikipedia passages,
it finds 2–11.5 points more in 10 of 13 test sets, and nothing more in
Hindi or Punjabi. It also finds some wrong ones: a stem merges forms by
their endings, not by their meaning. Do not add fuzzy matching to stems:
together they find less than stems alone.

You need only one of `stem` and `fold`. If you use both, stem first, then
fold: `fold` before `stem` loses 3–10 points in Assamese. `fold` alone
merges accepted spellings of one word (हिन्दी and हिंदी) and keeps the word
whole, for a search that must not merge forms:

```ts
import { fold } from "indickit/normalize";

fold("हिन्दी", "hi"); // "हिंदी"
fold("गाँव", "hi"); // "गांव"
```

### Find a name in any script

One person's name is typed in Devanagari on one form, in Malayalam on a
second, and in English on a third. `phonetic` gives each spelling a key;
equal keys mean "this sounds like the same name".

```ts
import { match } from "indickit/phonetic";

match("Mohanlal", "മോഹൻലാൽ"); // true
match("Mohan", "மோகன்"); // true
match("राम", "काम"); // false: Rām is not kām
```

To search a list of names, store every key of each name, and look up every
key of the query. A name can have more than one key: Tamil writes both k
and h with க, so மோகன், Mohan, has two.

```ts
import { nameKeys, RULES_VERSION } from "indickit/phonetic";

for (const key of nameKeys("सचिन तेंदुलकर")) db.insert({ key, personId, rules: RULES_VERSION });
// later
const hits = nameKeys(query).flatMap((key) => db.find({ key }));
```

Equal keys mean "sounds alike", not "the same person". Before you merge two
records, weigh the evidence: a shared rare name says more than a shared
common one.

### Search a list of names

`phonetic-search` uses the keys to find candidates, and a scorer learned
from data to rank them from 0 to 100. It finds names as people write them,
with titles, initials and joined words, and names in running text.

```ts
import { loadSearch, THRESHOLDS } from "indickit/phonetic-search";

const s = await loadSearch("hi"); // fetches the Hindi table (3 KB)
const ix = s.index(["नरेश मोदी", "नरेंद्र मोदी", "मनमोहन सिंह"]);
ix.search("Narendra Modi", THRESHOLDS.names); // [{ name: 1, score: 100 }]
ix.search("Manmohan Singh", THRESHOLDS.names); // [{ name: 2, score: 96 }]
```

Use the threshold for your task: `THRESHOLDS.names` (74) for a list of
people, `THRESHOLDS.villages` (72) for place names, `THRESHOLDS.text_10`
(80) or `text_20` (70) with `s.index(words, "text")` for a name among the
words of a text. A score is relative to the other candidates of its search.

### Count and cut letters

A cursor, a backspace, a letter count and a cut at a length limit must
treat ಕ್ಷ್ಮಿ as one letter. `Intl.Segmenter` splits it in Kannada and
Gurmukhi; `segment` keeps it whole.

```ts
import { segment, count } from "indickit/segment";

segment("ಲಕ್ಷ್ಮಿ"); // ["ಲ","ಕ್ಷ್ಮಿ"]
segment("ਪ੍ਰੀਤ"); // ["ਪ੍ਰੀ","ਤ"]
segment("ਕ੍ਕ"); // ["ਕ੍","ਕ"]: Gurmukhi shows this virama, so these are two letters
count("ಕನ್ನಡ"); // 3
```

### Write it in Latin letters

`romanize` gives a ranked list of spellings, most likely first. Use the
`"words"` mode for text and the `"names"` mode for a field that holds a
person's name:

```ts
import { load } from "indickit/romanize";

const hi = await load("hi");          // fetches the Hindi tables
hi.word("लक्ष्मी", 2);                 // ["lakshmi","laxmi"]
hi.text("भारत के प्रधानमंत्री");          // "bharat ke pradhaanmantri"
const ur = await load("ur", "names");
ur.word("پرویز", 1);                   // ["parvez"]
```

In Go, import the languages you need; a program carries only their tables:

```go
import (
	"github.com/micahchoo/indickit/romanize"
	_ "github.com/micahchoo/indickit/romanize/lang/hi"
)

romanize.Word("लक्ष्मी", "hi", romanize.Words, 2) // [lakshmi laxmi]
```

### Write Latin typing in an Indian script

`deromanize` is the reverse: it gives a ranked list of native spellings for
a Latin-typed word, most likely first. It writes every word it is given in
the Indian script, English words too: in mixed text, find each word's
language first.

```ts
import { load } from "indickit/deromanize";

const hi = await load("hi");          // fetches the Hindi tables and word list
hi.word("namaste", 1);                // ["नमस्ते"]
hi.text("bharat ke pradhanmantri");   // "भारत के प्रधानमंत्री"
const ur = await load("ur", "names");
ur.word("ahmad", 1);                  // ["احمد"]
```

In Go:

```go
import (
	"github.com/micahchoo/indickit/deromanize"
	_ "github.com/micahchoo/indickit/deromanize/lang/hi"
)

deromanize.Word("namaste", "hi", deromanize.Words, 1) // [नमस्ते]
```

### The same in Go

```go
import (
	"github.com/micahchoo/indickit/normalize"
	"github.com/micahchoo/indickit/phonetic"
	"github.com/micahchoo/indickit/segment"
	"github.com/micahchoo/indickit/stem"
)

normalize.Text("അവന്\u200d", "ml")               // "അവൻ"
stem.Stem(normalize.Text("किताबों", "hi"), "hi") // किताब
phonetic.Match("Mohanlal", "മോഹൻലാൽ")            // true
phonetic.NewIndex(names, "hi", phonetic.ProfileNames).Search("Narendra Modi", phonetic.Thresholds["names"])
segment.Segment("ಲಕ್ಷ್ಮಿ")                       // [ಲ ಕ್ಷ್ಮಿ]
```

## Reference

| Go | TypeScript | Returns |
|---|---|---|
| `normalize.Text(s, lang)` | `normalize(text, lang?)` | one encoding; the look never changes |
| `normalize.Fold(s, lang)` | `fold(text, lang?)` | `normalize`, then one spelling of each word |
| `stem.Stem(word, lang)` | `stem(word, lang)` | the search key of a word |
| `stem.Languages()` | `LANGUAGES` | the languages with a stem table |
| `phonetic.Keys(word)` | `keys(word)` | the keys of one word |
| `phonetic.NameKeys(name)` | `nameKeys(name)` | the keys of a whole name; index these |
| `phonetic.Match(a, b)` | `match(a, b)` | same word count, and each pair of words shares a key |
| `phonetic.Words(name)` | `words(name)` | the words, split as the others split them |
| `phonetic.JoinedKeys(name)` | `joinedKeys(name)` | the keys of the name with its words joined (8+ classes) |
| `phonetic.NewIndex(names, lang, profile)` | `(await loadSearch(lang)).index(names, profile?)` | names keyed once for searching |
| `ix.Search(query, threshold)` | `ix.search(query, threshold?)` | the names scoring at least threshold, best first |
| `phonetic.Score(query, names, lang, profile)` | `(await loadSearch(lang)).score(query, names, profile?)` | one score (0..100) per candidate |
| `segment.Segment(s)` | `segment(text)` | the letters, in order; joined, they give the text back |
| `segment.Count(s)` | `count(text)` | how many letters a reader sees |
| `romanize.Word(w, lang, mode, n)` | `(await load(lang, mode)).word(w, n?)` | up to n spellings, most likely first |
| `romanize.Text(s, lang, mode)` | `(await load(lang, mode)).text(text)` | each word of the language's script in Latin letters |
| `romanize.Languages(mode)` | `languages(mode)` | the languages with tables (Go: those imported) |
| `deromanize.Word(latin, lang, mode, n)` | `(await load(lang, mode)).word(latin, n?)` | up to n native spellings, most likely first |
| `deromanize.Text(s, lang, mode)` | `(await load(lang, mode)).text(text)` | each run of Latin letters in the language's script |
| `deromanize.Languages(mode)` | `languages(mode)` | the languages with tables (Go: those imported) |

Three things hold for all of them:

- **Language codes** are ISO 639: `hi`, `ta`, `as`, and so on. `phonetic`
  needs none: it reads the script. `normalize` and `fold` use the code for
  a few rules that belong to one language (Assamese ৰ, for example). `stem`
  needs it, and returns the word unchanged for a language with no table.
- **Keys are not text.** A stem (ஆண்ட), a `phonetic` key (`rn`) and the
  output of `fold` are for comparing, not for showing or storing as text.
  Do not stem a stem: `stem` may cut it again, as other stemmers do.
- **Rules change, and stored keys go stale.** Each utility exports
  `RULES_VERSION` (Go: `RulesVersion`). Store it beside the keys you save,
  and compute them again when it changes. Before 1.0, a minor version may
  change the rules.

## How good it is

Each result is on data that no rule was chosen on. The details, the
other tools tried and each weak spot are in `docs/`.

| Utility | Result | Best other tool | Browser file | Details |
|---|---|---|---|---|
| `normalize` | makes 88.1% of look-alike spellings equal, and changes the look of no word | Indic NLP Library: 82.4%, and changes 0.68% of words | 14 KB | [docs/normalize.md](docs/normalize.md) |
| `stem` | finds 6–15 points more of the right sentences than exact search, in 13 languages | ahead in 5 languages, level in 2, a trade in 4, behind in Nepali | 3 KB | [docs/stem.md](docs/stem.md) |
| `phonetic` | finds the right person 84% of the time, in 21 languages, on clean names; 42% on a real roster as written (70% with titles and initials removed); with `phonetic-search`, 86% of a real roster as written and 85% of villages | romanize + Soundex: 23% in Tamil, 70% in Hindi; cannot read Urdu; ICU + fuzzy match: 78% and 65% | 5 KB | [docs/phonetic.md](docs/phonetic.md) |
| `segment` | cuts 0.05% of Kannada words wrongly | `Intl.Segmenter`: 50.3% | 9 KB | [docs/segment.md](docs/segment.md) |
| `romanize` | writes 48.9% of the words of running text as people typed them, in 11 languages; 71.3% of names (tables: 0.2–1.8 MB a language) | IndicXlit (Python, a 119 MB model): 37.9% and 49.0% | 5 KB | [docs/romanize.md](docs/romanize.md) |
| `deromanize` | writes the right word first for 87.1% of the words of Hindi news typed in Latin, and in four for 97.4%; 69.7% of names in 19 languages (tables: 0.3–3.1 MB a language) | IndicXlit: 86.1%, 89.7% and 66.4%; behind on rare words out of context | 20 KB | [docs/deromanize.md](docs/deromanize.md) |

(Browser files are gzipped.)

`romanize` is also ahead of every tool tried that runs without a neural model. The
best of them, indic-trans (about 200 MB), gives 34.7% on running text against
51.2%, on the development data; it is ahead only in Urdu. See
[docs/romanize.md](docs/romanize.md).

## Limits

- **`deromanize` writes English words in the Indian script too.** About 8%
  of the words of romanized Hinglish are English; find each word's language
  first. On rare words out of context it is 10 points behind IndicXlit. See
  [docs/deromanize.md](docs/deromanize.md).
- **Only HarfBuzz was tested** for "looks the same" (`normalize`,
  `segment`). Windows and Apple draw text with their own engines.
- **The `phonetic` key expects clean names.** Remove titles (Shri, Smt.)
  and initials before you key a name, or use `phonetic-search`. On one-word
  place names the key alone returns many wrong matches. See
  [docs/phonetic.md](docs/phonetic.md).
- **Tamil is the weakest language** for `phonetic` (76%), and `stem` is
  behind Snowball's recall in Tamil.
- **`stem` does not help passage search in Hindi or Punjabi.** Short
  question words merge with other words (ਕਿਸ "which" with ਕਿਸਾਨ "farmer"),
  and names lose their ends (सीता → सी). In Hindi, Lucene's analyzer finds
  4.8 points more, from its spelling folds. See [docs/stem.md](docs/stem.md).
- **An n-gram field can find more than `stem`** in passage search: in
  Malayalam, Kannada, Tamil, Bengali, Marathi and Hindi, indexing each
  word's three-letter pieces found 3–10 points more, at 2–3 times the
  index size. See [docs/stem.md](docs/stem.md#in-a-search-engine).
- **Some languages have no table.** `stem` covers 13 languages; Bodo,
  Dogri, Kashmiri, Konkani, Maithili, Manipuri, Odia, Santali and Sindhi
  are not among them.
- **`romanize` is behind IndicXlit on places and on rare single words**
  (by 7–13 and 5.5 points). Santali has names only; Bodo and Dogri have
  text only. See [docs/romanize.md](docs/romanize.md).
- **Go reads invalid UTF-8 as U+FFFD**, so for such input the output does
  not join back into the original bytes.
- **"The same output" holds inside the blocks indickit reads.** Go reads
  Unicode 15.0; TypeScript reads the Unicode data of its host (node 24:
  17.0). A newer mark outside those blocks can give another output: "Ram"
  plus U+0897 has the key `rn` in TypeScript and none in Go. A test checks
  the blocks (`unicode_test.go`, `js/regression.test.ts`).
- **Two promises have a scope.** `normalize` twice gives what `normalize`
  once gives for text with at most 8 invisible characters; 9 BOMs before
  ૰ need a second call. `normalize` changes no `phonetic` key of a word
  with no invisible character; with one, it can (فاطمہ + ZWNJ).

Each utility's own weak spots are at the end of its file in `docs/`.

## How it is built

Every table and switch of a utility is in its rules file
(`normalize/rules.json`, `stem/rules.json`, `phonetic/rules.json`,
`segment/rules.json`; `romanize/rules.json` and its tables in
`romanize/lang/`); the Go and TypeScript code is a short loop over it.
Both are checked against a conformance file of inputs with the outputs that
a reference implementation gave them: 345,276 inputs for `normalize`,
418,665 for `stem`, 195,994 for `phonetic`, 858,654 for `segment`, 2,397
for `romanize`
(`*/testdata/conformance.jsonl.gz`). A change that makes any one disagree
on any input fails the build.

## Credits and licence

MIT. The test words are Wikidata labels (CC0). The rules were tuned on
Wikidata and PIB Parallel (Press Information Bureau releases), and checked
on AI4Bharat's Aksharantar and on Wikipedia text; none of them ships here.
`normalize` and `segment` were checked in fonts by Google (Noto), Ek Type
(Anek), SIL, SMC and others. `stem`'s endings were mined from PIB text;
Wiktionary's inflection tables (CC BY-SA), Universal Dependencies
treebanks and FLORES+ (CC BY-SA) were used only to measure them. It was
compared with Snowball, Lucene and the Indic NLP Library.
