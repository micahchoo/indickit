# romanize: the evidence

`romanize` writes a word of an Indian language in Latin letters, the way
people spell it, and returns a ranked list: the first spelling is the most
likely. It reads the 22 languages of the Eighth Schedule. The research is in
`linguistic-utilities/jobs/romanize/` (`JOB.md`).

## How it works

Each word is cut into pieces (क्ष, ि, …), each piece gets an English
spelling ("ksh", "i", …), and a statistical model of how those pieces follow
one another scores every way of spelling the word. A beam search keeps the
best ways and returns the four best spellings. The model is two tables mixed
together: one for the language alone, and one shared by all the languages of
its script. All the Brahmic scripts share one table: each letter is read at
its place in its Unicode block, which is the same in every Brahmic script.
Meetei Mayek is in that table too: Manipuri is written in Meetei Mayek and in
Bengali script. Joiners (U+200C, U+200D) are deleted before a word is cut:
they shape a letter and spell nothing.

There are two modes, each with its own tables:

- **words**, for running text: trained on IndicXlit's romanizations of the
  30,000 most frequent Wikipedia words of each language, and on 60,000
  human romanizations a language from Aksharantar. This is the default.
- **names**, for fields that hold person names: trained on the English
  labels of Indian people in Wikidata. A word that the training names hold
  and that the model would spell otherwise comes from a lookup first. Since
  rules 2026-10-12 the list is reranked: the ten best spellings by the
  alignment score are scored again with a letter 5-gram over the training
  English spellings (score + 0.25 × its log probability), and the best four
  of that order are returned. The alignment model scores how each piece is
  spelled; the letter model sees what an English spelling of a name looks
  like as a whole (the schwa, ee against i, a lost h), which is where the
  rank went wrong. One table, 148 KB (brotli), shared by every names page.

  Since rules 2026-10-13, Hindi's names mode has an option, the route:
  `load("hi", "names", { route: true })` in TypeScript,
  `WordWith(w, "hi", Names, n, Options{Route: true})` (and `TextWith`) in
  Go. With it, a word in the list of Hindi words the names tables were
  trained on (7,604 words, 26 KB brotli) gets the names list, and any other
  word gets the words list. News writers spell an unknown Hindi name as
  typists spell a word, and the words tables learned typists' spellings.
  Without the option the names mode gives what it gave before. In the other
  languages the words tables spell unknown names worse than the names tables
  (see [Names in news](#how-good-it-is)), so only Hindi has the route.

The tables are rules as data: the Go and TypeScript code is a short loop
over them, and both give the reference implementation's lists on every row of
the conformance file (3,347 rows).

## How good it is

**Running text.** Dakshina's test sentences: Wikipedia sentences in 11
languages, romanized word by word by native speakers. Each word counts where
it occurs, so frequent words count as often as on a real page. The first
spelling, then any of the four, is the spelling the person typed:

| Language | Words | romanize | IndicXlit |
|---|---|---|---|
| sd | 27973 | 28.8 / 49.3 | 19.2 / 37.0 |
| pa | 26540 | 53.2 / 76.7 | 28.1 / 52.8 |
| hi | 24913 | 61.1 / 88.7 | 41.0 / 65.8 |
| gu | 22310 | 36.2 / 71.7 | 32.8 / 59.1 |
| ur | 22192 | 39.7 / 70.5 | 24.2 / 48.3 |
| bn | 17756 | 53.4 / 75.8 | 43.4 / 74.0 |
| kn | 16462 | 63.9 / 85.5 | 63.0 / 81.3 |
| te | 13964 | 58.1 / 81.6 | 55.9 / 77.9 |
| mr | 13813 | 65.3 / 88.3 | 54.6 / 78.1 |
| ta | 13763 | 46.7 / 70.7 | 43.4 / 70.2 |
| ml | 12773 | 47.2 / 71.2 | 42.2 / 70.6 |
| All 11 | 212459 | 48.9 / 74.3 | 37.9 / 61.9 |

In all, the first spelling is the typed one for 48.9% of the words
(IndicXlit: 37.9%).

IndicXlit is the best other tool: a neural model (Python, a 119 MB model).
It writes many of the most frequent words as English words: के as "key", को
as "coo", ਵਿੱਚ as "witch". `romanize` writes "ke", "ko", "vich".

**Names.** The Wikidata names of Indian people that no rule was chosen on
(one person in ten, read once at release). The first spelling is the
person's own, then any accepted spelling (the label or an alias), then any
of four. Santali is left out of the comparison: IndicXlit has no Santali.

| Names | Words | romanize | IndicXlit |
|---|---|---|---|
| All | 24831 | 70.6 / 71.3 / 86.5 | 48.5 / 49.0 / 74.1 |
| Not in either tool's training | 3812 | 46.5 / 47.0 / 69.4 | 41.4 / 42.0 / 67.2 |
| People with a Wikipedia page created after November 2023 | 8116 | 71.4 / 71.8 / 87.0 | 43.1 / 43.4 / 69.1 |

In all, the first spelling is an accepted one for 71.3% of the names
(IndicXlit: 49.0%). These are the numbers of rules 2026-10-11.2. Rules
2026-10-12 rerank the list (above); on the development names that neither
tool's training holds, the first spelling goes from 47.0% to 51.7% at the
shipped beam (any of four: 70.4% to 72.8%), every language gaining but
Kannada. Read once on names held out to the end (Wikidata people of
Bangladesh, Pakistan, Nepal and Sri Lanka; 10,773 unseen tokens): the first
spelling goes from 37.9% to 41.0% (+3.1, 95% interval +2.5 to +3.7; any of
four 60.1% to 62.3%), and no language falls. The table above is the number
of rules 2026-10-11.2, a lower bound for rules 2026-10-12 and 2026-10-13,
whose names mode gives the same lists. Hindi's route (an option) changes
only Hindi names that the names tables were not trained on: on the
development names that neither tool's training holds, Hindi's first spelling
goes from 57.6% to 54.4% with it (3.2 points, inside the noise of 340 words).

**Names in news.** Name pairs from the English and the
Indian-language press releases of the Press Information Bureau (PIB) of
August 2023, held out: 2,950 pairs in 11 languages. A word counts as a name
when Naamapadam's tagged news marks it as a person or a place in at least
half of its uses; no romanizer chose the pairs. The first spelling, then any
of four, is the spelling the English release prints:

| PIB, August 2023 | Words | names mode | with Hindi's route | IndicXlit |
|---|---|---|---|---|
| All | 2950 | 48.1 / 59.0 | 49.6 / 60.4 | 49.6 / 63.9 |
| Not in romanize's training | 651 | 39.8 / 55.5 | 43.5 / 60.1 | 58.7 / 70.2 |
| Hindi | 609 | 55.0 / 66.0 | 62.2 / 73.1 | 59.1 / 76.0 |

The names mode's first spelling is the printed one for
48.1% of the names (IndicXlit: 49.6%), level within the noise (95% interval of
the difference −3.3 to +0.4). On names it was not trained on it is far
behind: 39.8% against 58.7%. Hindi's route was chosen on PIB's releases of
November 2025 (development data: +6.2 points in Hindi) and confirmed once on
August 2023: Hindi goes from 55.0% to 62.2% (+7.2 points, 95% interval +4.1
to +10.0), ahead of IndicXlit's 59.1%; names it was trained on keep their
spellings. The route stops at Hindi because the other languages pay for it
on Wikidata's names: on the development names that neither tool's training
holds, routing every language to the words tables takes the first spelling
from 51.7% to 33.7% (Tamil −24.0 points, Assamese −30.0; Santali has no
words tables). The route is an option because of what it costs in a
browser: a Hindi names page grows from 0.56 MB to 2.5 MB, since it also
loads the words tables; on a page that has Hindi's words tables already,
it costs 26 KB. In Go, `lang/hi` carries the words tables either way.

**Single words out of context.** On Aksharantar's test words that neither
tool was trained on, IndicXlit is ahead: 55.6% against 50.1% for the first
spelling. On the Lok Sabha's list of members (Hindi), `romanize` is ahead:
55.6% against 44.2%. (These two were read with a beam of 40; the shipped
beams, 8 for words and 12 for names, change the scores by less than half a
point on the development data.)

**Tools that run in a browser or in Go** (Aksharamukha, uroman, any-ascii,
IAST, govarnam, ICU's `Any-Latin`) give the right first spelling 5–36% of the
time on the same words.

**The best tool without a neural model** is indic-trans (LTRC, IIIT
Hyderabad): a statistical model, about 200 MB for its 10 languages. On the
development data, in those 10 languages, its first spelling is right for
34.7% of the words of running text (`romanize`: 51.2%) and 38.5% of the
names that neither the lookup nor training held (`romanize`: 46.9%;
IndicXlit: 47.5%). It is ahead in one language: Urdu running text, 46.1%
against 39.9%. No held-out set was read for this comparison, because no
tool came within reach.

The browser file is 11 KB gzipped (8.5 KB; it crossed 8 KB with the Hindi route option in 0.13.0). The tables load on demand, one language
and mode at a time: about 0.5 MB for names and 1.9 MB for text in a Brahmic
language, 0.3 MB and 1.0 MB in Urdu (brotli, as jsDelivr serves them; the
names figure includes the 148 KB letter model every names page shares).
With the route option, Hindi's names page also loads its words tables and
its list of known names: 2.5 MB, or 26 KB more on a page that has Hindi's
words tables. They
are read beside the module, else from jsDelivr at the package's version; the
npm package carries none of them. In Go, `go get` downloads every language's
tables once (14 MB) and a program carries only the languages it imports. One
word takes 1–2 ms in Go, in Node and in Bun. Hindi's text tables take
about 145 MB of memory once loaded in Node.

## A Latin query on a romanized index

A search box gets "modi"; the store holds मोदी. The README recipe "Find
native text with a Latin query" romanizes each stored word in the words mode
when the index is built, stores its four spellings in a Latin field, and
fuzzy-matches the lower-cased query against that field (Elasticsearch
`fuzziness: AUTO`: 0 edits for a query of 1–2 letters, 1 for 3–5, 2 for
longer). The research is in `linguistic-utilities/jobs/latin_search/`
(`reports/02-test.md`).

Measured on Dakshina's test sentences (held out; 3,000 queries a language;
a pool of the 20,000 most frequent Wikipedia words plus every answer), the
right word is the first hit 81.4% of the time and one of the first four
91.3%, the mean of 11 languages. IndicXlit's Latin-to-native model, which
writes the query's four most likely native spellings for an exact match,
gives 81.8% and 87.6%. The `phonetic` key on both sides gives 38.0% and
60.4%: it is for names, not words. By language, the share of queries with
the right word in the first four hits:

| found@4 | bn | gu | hi | kn | ml | mr | pa | sd | ta | te | ur |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Index, fuzzy | 93.3 | 91.5 | 96.7 | 97.2 | 94.1 | 97.6 | 90.4 | 68.2 | 92.6 | 96.3 | 86.1 |
| IndicXlit | 86.0 | 91.2 | 91.0 | 92.5 | 81.7 | 91.3 | 88.9 | 74.6 | 84.8 | 91.7 | 89.7 |
| Key | 54.8 | 60.6 | 69.8 | 71.4 | 55.1 | 64.3 | 66.8 | 53.6 | 52.5 | 62.9 | 53.0 |

The fuzzy index leads by more than the noise (±1.5) in bn hi kn ml mr ta te,
is level in gu and pa, and trails in sd (−6.4) and ur (−3.6). Its cost is
the list: 24 hits a search, and 57.1% of the first ten are other words;
IndicXlit returns 1–2 hits, 13.1% of them wrong. For a strict filter, where
every hit must be the word itself, exact match on the romanized index finds
68.8% at the first hit, 13 points fewer than the native candidates: write
the query in the native script instead (`deromanize`). Both arms rest on
IndicXlit: the index side is its native-to-Latin model distilled into
`romanize`'s tables, the query side its Latin-to-native model. The result
says which direction to romanize in.

## Place names

The `"places"` mode (Go `romanize.Places`) is for a field that holds a place
name. Nine languages have their own places tables: Bengali, Hindi,
Malayalam, Marathi, Odia, Santali, Tamil, Telugu and Urdu. The others use their words
tables, which did better on their place names. Use it for addresses, maps and
gazetteers; use `"words"` for running text.

```ts
const ta = await load("ta", "places");
ta.word("காஞ்சிபுரம்", 1);  // ["kanchipuram"]; the words mode gives ["kanjipuram"]
```

**How it is made.** 114,380 place-name pairs from Wikidata (a native label and
the English label of the same place) are trained beside the words data, under
their own tag; each language uses the places tables only where they were
better on the development half of OpenStreetMap's place names. Hindi, Marathi
and Odia also learn from village names of the Local Government Directory
(Government Open Data License, India).

**How good it is.** On two held-out sets, each read once, leaving out the
names that are also in the training pairs, the first spelling is right:

| Held out | `"places"` | `"words"` | IndicXlit |
|---|---|---|---|
| Village names, Local Government Directory (8,207 words) | **57.6%** | 48.0% | 52.8% |
| OpenStreetMap place names, a 2% slice (1,588 words) | **44.4%** | 40.6% | 49.1% |

On villages, Hindi is right 57.5% of the time (IndicXlit 52.3%) and Marathi
68.0% (62.6%). On OpenStreetMap IndicXlit leads, most in Kannada, which has no
places tables: no Kannada place-name list large enough to learn from was found.

A places page is a little larger than a words page in a Brahmic language:
2.2 MB for Hindi against 1.9 MB (brotli); in Urdu both are 1.0 MB. A language
without its own places tables downloads its words page. OpenStreetMap data is © OpenStreetMap
contributors (ODbL); it was used only to measure, and no OpenStreetMap name is
in the tables.

## Weak spots

- **Places.** On OpenStreetMap place names IndicXlit is 5.5 points ahead of the places mode
  ([Place names](#place-names)), most in Kannada (10.7), whose places mode uses its words tables.
- **Rare words out of context**, as above: IndicXlit is 5.5 points ahead.
- **Names it was not trained on**, in news: IndicXlit is ahead, 58.7% against
  39.8% for the first spelling (43.5% with Hindi's route option;
  [Names in news](#how-good-it-is)). The names tables learned Wikidata's
  English labels, and news writers spell many names otherwise.
- **Santali** has names only; **Bodo** and **Dogri** have words only.
  Dogri was measured on Aksharantar's words (32.2% for the first spelling;
  IndicXlit has no Dogri).
- **Bodo follows the typists' spelling.** Since rules 2026-10-11, ख थ फ
  are written kh th ph (थाखाय → thakhai), as Bodo speakers type them, not
  k t f as Aksharantar writes them. On typed Bodo sentences
  (Bhasha-Abhijnaanam, held out) the first spelling is right 71.9% of the
  time, up from 50.3% (IndicXlit: 49.3%); on Aksharantar's word list, which
  keeps k t f, it falls from 75.6% to 45.6%.
- **Exact match is harsh.** One word has several accepted spellings
  (sushil, susheel), and the score counts only the one the person typed or
  Wikidata holds.
- **Manipuri in Bengali script.** The Manipuri tables were trained on
  Meetei Mayek only. Since rules 2026-10-13.2 a Bengali-script Manipuri word
  is converted to Meetei Mayek first, by the rules of Singh (2012) and the
  Unicode charts (মণিপুর → ꯃꯅꯤꯄꯨꯔ → manipur). Before, the words mode dropped
  syllables (ওরাম → o). No answer key holds typed Bengali-script Manipuri:
  on FLORES word pairs the spelling agrees with its Meetei Mayek twin's 76.1%
  of the time (20.7% before), a measure of sameness, not of correctness.
- **A second script** (rules 2026-10-13.1 and .2). Sindhi and Kashmiri
  are also written in Devanagari, Urdu sometimes is, and Punjabi in
  Shahmukhi; their tables read one script only. A Sindhi word in Devanagari
  is converted to Perso-Arabic first (Rathore et al. 2023), then spelled by
  the Sindhi tables. A Kashmiri or Urdu word in Devanagari, or a Punjabi word
  in Shahmukhi, is spelled by Hindi's or Urdu's tables (Go: import `lang/hi`
  or `lang/ur` too; TypeScript: `load(lang, mode, { secondScript: true })`;
  without them such a word gives nothing, where before it gave a broken
  spelling such as सरकार → "sr" in Kashmiri). On development data only (FLORES
  word pairs whose Perso-Arabic twin has a human romanization in Aksharantar,
  words the tables never saw), the first spelling is right for 50.1% of
  Sindhi words in Devanagari (7.9% before; 32.5% through Hindi's tables) and
  43.1% of Kashmiri (15.0% before); typed in Perso-Arabic the same words
  reach 67% and 73%. Urdu in Devanagari and Punjabi in Shahmukhi are not
  measured. No held-out set exists for this yet.
