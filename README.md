# indickit

Small, exact utilities for text in Indian languages, for Go and
TypeScript. Each one gives the same output in both languages, and each is
measured on data that its rules were never built on.

- **`phonetic`** gives a name a key that is the same in every script the
  name is written in.
- **`normalize`** gives one encoding to text that looks the same, and
  never changes what a reader sees.
- **`segment`** splits text into the letters a reader sees, Kannada and
  Gurmukhi conjuncts included.

```
राम   ರಾಮ   രാമ   ராம   رام   Ram      →  rn
मोहनलाल   മോഹൻലാൽ   Mohanlal          →  nhnl
```

## Install

Go:

```sh
go get github.com/micahchoo/indickit
```

JavaScript or TypeScript, straight from GitHub (no npm account needed):

```sh
npm install github:micahchoo/indickit#v0.3.0
bun add github:micahchoo/indickit#v0.3.0
```

In a browser, without a build step:

```js
import { match } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.3.0/dist/phonetic.js";
import { normalize } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.3.0/dist/normalize.js";
import { segment } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.3.0/dist/segment.js";
```

Each utility is its own file: a page that needs `normalize` does not load
the `phonetic` rules.

## phonetic: one key for a name in every script

One person's name is typed in Devanagari on one form, in Malayalam on a
second and in English on a third. A plain text search finds only one of
them. `phonetic` gives each spelling a key; equal keys mean "this sounds
like the same name", so a search, a duplicate check or a join can find
all three.

It reads 21 Indian languages and English: Assamese, Bengali, Gujarati,
Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri (Meetei
Mayek), Marathi, Nepali, Odia, Punjabi (Gurmukhi), Sanskrit, Santali (Ol
Chiki), Sindhi, Tamil, Telugu, Urdu, and Latin spellings of all of them.

### Use

Compare two names:

```go
import "github.com/micahchoo/indickit/phonetic"

phonetic.Match("Mohanlal", "മോഹൻലാൽ") // true
phonetic.Match("राम", "काम")           // false: Rām is not kām
```

```ts
import { match } from "indickit/phonetic";

match("Mohan", "மோகன்"); // true
```

Index names for search. A name can have more than one key (Tamil writes
both k and h with க, so மோகன், Mohan, has two); store every one, and look
up every key of the query:

```ts
import { nameKeys, RULES_VERSION } from "indickit/phonetic";

for (const key of nameKeys("सचिन तेंदुलकर")) db.insert({ key, personId, rules: RULES_VERSION });
// later
const hits = nameKeys(query).flatMap((key) => db.find({ key }));
```

The functions, the same in both languages:

| Go | TypeScript | Returns |
|---|---|---|
| `Keys(word)` | `keys(word)` | the keys of one word |
| `NameKeys(name)` | `nameKeys(name)` | the keys of a whole name; index these |
| `Match(a, b)` | `match(a, b)` | same word count, and each pair of words shares a key |
| `Words(name)` | `words(name)` | the words, split as the others split them |
| `RulesVersion` | `RULES_VERSION` | the version of the rules |

`phonetic` says only "these sound alike". It does not rank results, and
it does not decide that two records are one person. A shared rare name is
better evidence than a shared common one; weigh that yourself before you
merge records automatically.

### How good it is

Measured on the names of 9,430 people never used to build the rules
(Wikidata labels of Indian citizens; one person in ten, held out to the
end). Each number is the share of searches that find the right person
when the name is looked up among the held-out names of another language;
both columns use the same searches.

| Language | indickit | romanize + Soundex |
|---|---|---|
| Hindi | 82% | 70% |
| Tamil | 76% | 23% |
| Malayalam | 82% | 40% |
| Bengali | 76% | 61% |
| English spellings | 79% | 62% |
| Urdu | 81% | cannot read Urdu |
| Mean of 21 languages | **84%** | — |

The table was read with rules 2026-10-05. Rules 2026-10-06 add one key to
255 of the 195,994 test words (English spellings with a w before a
consonant, such as Andrew) and remove none.

"Romanize + Soundex" is the best off-the-shelf alternative: the strongest
existing romanizer for each script, then English Soundex. Neither of the
two romanizers tried reads Urdu, Sindhi or Kashmiri.

Two different people who share a family name are matched by mistake
about once in 200 pairs; two random people, almost never. Searching one
name among 81,000 English names returns about one wrong person.

One word takes 0.6 µs in Go and 0.7 µs in Node, on one core. A million
names index in about 2 s (Go) or 3 s (Node); a search takes 2–3 µs. The
browser file is 4 KB gzipped.

Known weak spots:

- **Tamil** is the weakest Indian language (76%). Tamil writes several
  sounds with one letter.
- **Bodo** romanization writes a vowel as w (खौ is "khwo"). Since rules
  2026-10-06 a w before a consonant is also read as a vowel: Bodo's typed
  spellings match 69.5% of the time (63% before), level with Soundex's 70%.
- **A first vowel can differ.** "Imran" and عمران do not match: ع is read
  as a.
- **Dogri and Bodo** were measured on ordinary words only; there was no
  set of names.

## normalize: one encoding for text that looks the same

Two strings can look the same and still differ in their bytes: an invisible
joiner, an old Malayalam chillu, a ज़ typed as one code point or two. An
exact search, a duplicate check or a join then misses one of them.
`normalize` gives such strings one encoding, and it never changes what a
reader sees. `fold` goes one step further, for search only: it also merges
accepted spellings of one word.

It reads the same 21 languages as `phonetic`; text in any other script
changes only by Unicode NFC.

### Use

```ts
import { normalize, fold } from "indickit/normalize";

normalize("ಸಿಕಾರ್\u200c", "kn"); // "ಸಿಕಾರ್": a ZWNJ at the end draws nothing
normalize("അവന്\u200d", "ml"); // "അവൻ": the old chillu becomes the atomic one
normalize("र्\u200dय", "mr"); // "र्\u200dय": eyelash ra; this ZWJ is visible, so it stays
fold("हिन्दी", "hi"); // "हिंदी"
fold("गाँव", "hi"); // "गांव"
```

```go
import "github.com/micahchoo/indickit/normalize"

normalize.Text("അവന്\u200d", "ml") // "അവൻ"
normalize.Fold("हिन्दी", "hi")     // "हिंदी"
```

Store text after `normalize`. Apply `fold` to a query and to an index, never
to stored text: it loses information on purpose. The language code matters
for Assamese: after a virama, Assamese ৰ and Bengali র look the same, and
each language keeps its own.

| Go | TypeScript | Returns |
|---|---|---|
| `normalize.Text(s, lang)` | `normalize(text, lang?)` | one encoding; the look never changes |
| `normalize.Fold(s, lang)` | `fold(text, lang?)` | `normalize`, then one spelling of each word |
| `normalize.RulesVersion` | `RULES_VERSION` | the version of the rules |

### How good it is

"Looks the same" is decided by HarfBuzz: two strings look the same when it
draws the same glyphs in the same places, in Noto and in a second font
family. Measured on 556,036 words never used to build the rules (Wikidata
names, Aksharantar words, PIB press releases; one look-alike group in ten,
held out to the end):

| | Look-alike groups made equal | Words whose look changed |
|---|---|---|
| NFC | 42.3% | 0 |
| Indic NLP Library, every option | 82.4% | 0.68% |
| **normalize** | **88.1%** | **0** |
| the most any such tool can reach | 93.1% | 0 |

The last row asks HarfBuzz about each character of each word: too slow to
ship, but it shows what is left. Other checks, each on data that no rule was
chosen on:

- **26 more fonts** (among them Tiro and SMC's Rachana): no word changed
  its look.
- **Wikipedia**, 3.9M words in 11 languages typed by other people: 8 words
  changed their look (Indic NLP: 96,629), and 77.8% of groups were made
  equal (the most possible: 91.5%).
- **Invisible characters planted** at every position of 58,914 real words:
  72 of 3.6M variants changed their look, nearly all in Odia.

`fold` merged 5.1% of the spelling variants in a held-out set, and 0.03% of
what one search finds is a different word (Indic NLP: 5.5%, 0.07%). It
merges only spellings of the same sounds: nasal + virama and anusvara
(हिन्दी, हिंदी), chandrabindu, nukta, Assamese ৰ ৱ. Indic NLP's extra
merges join different sounds, such as a final long ā in Telugu.

The browser file is 13 KB gzipped.

Known weak spots:

- **Malayalam** is furthest from the most possible (69.9% against 82.8%).
- **The nukta merge can join two words:** राज "rule" and राज़ "secret". Many
  writers leave the nukta out, so text often writes them alike already.
- **Only HarfBuzz was tested.** Windows and Apple draw text with their own
  engines.
- **Kashmiri, Sindhi, Bodo and Maithili** had no look-alike groups in the
  held-out data. They were checked for damage only, and none was found.

## segment: the letters a reader sees

A cursor, a backspace, a character count and a cut at a length limit must
treat ಕ್ಷ್ಮಿ as one letter. Unicode's grapheme clusters do this for most
Indian scripts, but not for Kannada or Gurmukhi: `Intl.Segmenter`, and
every other segmenter we tried, splits ಲಕ್ಷ್ಮಿ into four pieces. `segment`
keeps the letters whole.

### Use

```ts
import { segment, count } from "indickit/segment";

segment("ಲಕ್ಷ್ಮಿ"); // ["ಲ","ಕ್ಷ್ಮಿ"]
segment("ਪ੍ਰੀਤ"); // ["ਪ੍ਰੀ","ਤ"]
segment("ਕ੍ਕ"); // ["ਕ੍","ਕ"]: Gurmukhi shows this virama, so these are two letters
count("ಕನ್ನಡ"); // 3
```

```go
import "github.com/micahchoo/indickit/segment"

segment.Segment("ಲಕ್ಷ್ಮಿ") // [ಲ ಕ್ಷ್ಮಿ]
segment.Count("ಕನ್ನಡ")    // 3
```

Text in any other script gets Unicode 17.0's grapheme clusters, which
indickit computes itself: every browser and every Go version gives the same
letters.

| Go | TypeScript | Returns |
|---|---|---|
| `segment.Segment(s)` | `segment(text)` | the letters, in order; joined, they give the text back |
| `segment.Count(s)` | `count(text)` | how many letters a reader sees |
| `segment.RulesVersion` | `RULES_VERSION` | the version of the rules |

### How good it is

A letter is split wrongly when a boundary falls inside a shape that
HarfBuzz draws as one, in Noto Sans, Noto Serif and Anek. Measured on
Wikipedia articles never used to build the rules (share of words):

| Language | `Intl.Segmenter` | `segment` | two shapes joined by mistake |
|---|---|---|---|
| Kannada | 50.3% | 0.05% | 0 |
| Punjabi | 3.2% | 0.01% | 0 |
| Bengali | 0.31% | 0.02% | 0 |
| Tamil | 0.06% | 0.01% | 0 |
| Hindi, Marathi, Gujarati, Telugu, Nepali, Malayalam, Urdu | the same | the same | 0 |

In Kannada text, `Intl.Segmenter` counts 17% more letters than a reader
sees. The same holds for the other languages written in Kannada script:
Tulu (44% of words split; 0.02% with `segment`) and Konkani as written in
Karnataka.

No other tool keeps Kannada conjuncts: `Intl.Segmenter`, `graphemer`,
`graphemesplit`, `@marijn/find-cluster-break`, Go's `uniseg` and `uax29`,
and Python's `regex` all split them. `indicparser` (Python) has no Kannada,
and splits 5% of Punjabi words for other reasons (it cuts the nukta off its
letter: ਦੇਸ਼ → ਦੇ ਸ ਼).

The browser file is 9 KB gzipped. A word takes 0.4 µs in Node (`Intl.Segmenter`:
1.9 µs) and 0.3 µs in Go.

Known weak spots:

- **Malayalam ൻ്റ** is one shape in Noto, but two in the Rachana and
  Gayathri fonts. `segment` follows Unicode and keeps it two letters.
- **Tamil க்ஷ** stays two letters: it occurs in 0.04% of Tamil words.
- **Only HarfBuzz was tested.** Windows and Apple draw text with their own
  engines.
- **Go reads invalid UTF-8 as U+FFFD**, so for such input the letters do not
  join back into the original bytes.

## When the rules change, stored output goes stale

An improvement to the rules changes some outputs: a key or a normalized
string stored before then no longer equals one computed after. Each
utility has its own `RULES_VERSION`; store it beside your output and
recompute when it changes. Until 1.0, a minor version may change the rules.

## How it is built

Every table and switch of a utility is in its rules file
(`phonetic/rules.json`, `normalize/rules.json`, `segment/rules.json`); the
Go and TypeScript code is a short loop over it. Both are checked against a conformance file of
inputs with the outputs a reference implementation gave them: 195,994 words
for `phonetic`, 345,276 inputs for `normalize`, 858,654 inputs for
`segment` (`*/testdata/conformance.jsonl.gz`). A change that makes any one
disagree on any input fails the build.

## Credits and licence

MIT. The test words are Wikidata labels (CC0). The rules were tuned on
Wikidata and checked on PIB Parallel (Press Information Bureau releases)
and AI4Bharat's Aksharantar; neither ships here. `normalize` was also
checked on Wikipedia text and in fonts by Google (Noto), Ek Type (Anek),
SIL, SMC and others; none ships here.
