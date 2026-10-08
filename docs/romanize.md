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

There are two modes, each with its own tables:

- **words**, for running text: trained on IndicXlit's romanizations of the
  30,000 most frequent Wikipedia words of each language, and on 60,000
  human romanizations a language from Aksharantar. This is the default.
- **names**, for fields that hold person names: trained on the English
  labels of Indian people in Wikidata. A word that the training names hold
  and that the model would spell otherwise comes from a lookup first.

The tables are rules as data: the Go and TypeScript code is a short loop
over them, and both give the reference implementation's lists on every row of
the conformance file (2,397 rows).

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
(IndicXlit: 49.0%).

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

The browser file is 5 KB gzipped. The tables load on demand, one language
and mode at a time: about 0.4 MB for names and 1.8 MB for text in a Brahmic
language, 0.2 MB and 1.0 MB in Urdu (brotli, as jsDelivr serves them). They
are read beside the module, else from jsDelivr at the package's version; the
npm package carries none of them. In Go, `go get` downloads every language's
tables once (14 MB) and a program carries only the languages it imports. One
word takes 1–2 ms in Go, in Node and in Bun. Hindi's text tables take
about 145 MB of memory once loaded in Node.

## Weak spots

- **Places.** On village and town names, IndicXlit is 7–13 points ahead.
- **Rare words out of context**, as above: IndicXlit is 5.5 points ahead.
- **Santali** has names only; **Bodo** and **Dogri** have words only, and
  were measured on Aksharantar's words (Bodo 48.6%, Dogri 32.2% for the first
  spelling; IndicXlit has no Dogri).
- **Exact match is harsh.** One word has several accepted spellings
  (sushil, susheel), and the score counts only the one the person typed or
  Wikidata holds.
