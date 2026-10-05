# indickit

Small, exact utilities for text in Indian languages, for Go and
TypeScript. The first is `phonetic`: a name key that is the same in every
script the name is written in.

```
राम   ರಾಮ   രാമ   ராம   رام   Ram      →  rn
मोहनलाल   മോഹൻലാൽ   Mohanlal          →  nhnl
```

## Why

One person's name is typed in Devanagari on one form, in Malayalam on a
second and in English on a third. A plain text search finds only one of
them. `phonetic` gives each spelling a key; equal keys mean "this sounds
like the same name", so a search, a duplicate check or a join can find
all three.

It reads 21 Indian languages and English: Assamese, Bengali, Gujarati,
Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri (Meetei
Mayek), Marathi, Nepali, Odia, Punjabi (Gurmukhi), Sanskrit, Santali (Ol
Chiki), Sindhi, Tamil, Telugu, Urdu, and Latin spellings of all of them.

## Install

Go:

```sh
go get github.com/micahchoo/indickit
```

JavaScript or TypeScript, straight from GitHub (no npm account needed):

```sh
npm install github:micahchoo/indickit#v0.1.0
bun add github:micahchoo/indickit#v0.1.0
```

In a browser, without a build step:

```js
import { match } from "https://cdn.jsdelivr.net/gh/micahchoo/indickit@v0.1.0/dist/phonetic.js";
```

## Use

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

## How good it is

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

"Romanize + Soundex" is the best off-the-shelf alternative: the strongest
existing romanizer for each script, then English Soundex. Neither of the
two romanizers tried reads Urdu, Sindhi or Kashmiri.

Two different people who share a family name are matched by mistake
about once in 200 pairs; two random people, almost never. Searching one
name among 81,000 English names returns about one wrong person.

Known weak spots:

- **Tamil** is the weakest Indian language (76%). Tamil writes several
  sounds with one letter.
- **Bodo** romanization writes a vowel as w (खौ is "kwo"); its typed
  spellings match 63% of the time, below Soundex's 70%.
- **A first vowel can differ.** "Imran" and عمران do not match: ع is read
  as a.
- **Dogri and Bodo** were measured on ordinary words only; there was no
  set of names.

## What it does not do

`phonetic` says only "these sound alike". It does not rank results, and
it does not decide that two records are one person. A shared rare name is
better evidence than a shared common one; weigh that yourself before you
merge records automatically.

## When the rules change, stored keys go stale

An improvement to the rules gives some words a different key, and a key
stored before then no longer equals one computed after. Store
`RULES_VERSION` beside your keys and recompute them when it changes.
Until 1.0, a minor version may change the rules.

## Speed

One word, one core: 0.6 µs in Go, 0.7 µs in Node. A million names index in
about 2 s (Go) or 3 s (Node); a search takes 2–3 µs. The browser file is
4 KB gzipped.

## How it is built

Every table and switch is in `phonetic/rules.json`; the Go and TypeScript
code is a short loop over it. Both are checked against
`phonetic/testdata/conformance.jsonl.gz`: 195,994 words with the keys a
reference implementation gave them. A change that makes either one
disagree on any word fails the build.

## Credits and licence

MIT. The test words are Wikidata labels (CC0). The rules were tuned on
Wikidata and checked on PIB Parallel (Press Information Bureau releases)
and AI4Bharat's Aksharantar; neither ships here.
