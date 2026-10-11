# stem: the evidence

`stem` gives the forms of one word one search key: किताब, किताबें and
किताबों all give किताब. This file says how well it does that, how it was
measured, and where it fails. How to use it: the [README](../README.md).

In Tamil press releases (PIB), 21% of the words are inflected forms that
Wiktionary lists (Assamese 14%, Bengali 10%, Kannada, Marathi, Punjabi and
Gujarati 7–9%, Hindi 2%). An exact search finds only the form typed.

## How it works

Each language has a list of 20–71 endings. `stem` cuts the longest one
that leaves at least two code points; in nine languages it then drops one
final vowel sign (the Tamil ு in ஆண்டு). So a stem is a key, not a word:
ஆண்ட is not Tamil, but ஆண்டு "year" and ஆண்டில் "in the year" both give it.
Kannada endings stack, so in Kannada `stem` does all of this twice:
ಪ್ರಧಾನಮಂತ್ರಿಯವರು "the Prime Minister" (honorific) and ಪ್ರಧಾನಮಂತ್ರಿ give one key.
`stem` may cut a stem again, as Snowball and Lucene do: apply it once.

Normalize first. On PIB search, `normalize` before `stem` is never worse
than `stem` alone and adds up to 1.6 points of recall (Punjabi, Bengali).

You need only one of `stem` and `fold`. If you use both, stem first, then
fold. `fold` rewrites Assamese ৰ and ৱ, which the endings hold, so `fold`
before `stem` costs Assamese 10 points on PIB and 3.3–3.7 on Wikipedia
passages; `stem`, then `fold`, costs nothing. In 13 passage suites, both
together found no more than the better of the two alone.

## How good it is

The task is search. In FLORES+, sentences come in many languages with the
same English. For an English word, the right sentences are those whose
English holds the word in any form; the query is the native word most
often found with it. Measured on FLORES+, which no rule was chosen on
(recall: share of the right sentences found; precision: share of the
sentences found that are right; mean of 300 queries per language):

| Language | exact search | `stem` | best other stemmer |
|---|---|---|---|
| Kannada | 28.0% / 55.9% | 38.8% / 47.9% | Indic NLP (Morfessor): 33.4% / 51.4% |
| Telugu | 33.6% / 61.7% | 42.6% / 54.8% | Indic NLP (Morfessor): 38.8% / 56.3% |
| Gujarati | 37.7% / 60.5% | 50.5% / 52.0% | Indic NLP (Morfessor): 46.7% / 53.6% |
| Marathi | 31.5% / 60.0% | 40.7% / 53.7% | Indic NLP (Morfessor): 37.6% / 54.9% |
| Urdu | 44.2% / 58.9% | 50.6% / 53.0% | Snowball persian: 45.0% / 58.0% |
| Bengali | 37.7% / 59.3% | 46.5% / 53.3% | Indic NLP (Morfessor): 48.0% / 50.5% |
| Hindi | 47.2% / 64.1% | 55.8% / 58.7% | Lucene: 57.0% / 57.8% |
| Malayalam | 25.9% / 58.3% | 34.0% / 51.1% | Indic NLP (Morfessor): 34.5% / 50.6% |
| Punjabi | 46.5% / 62.3% | 56.6% / 53.2% | Indic NLP (Morfessor): 57.8% / 42.6% |
| Tamil | 28.7% / 56.1% | 36.5% / 45.3% | Snowball tamil: 40.9% / 41.9% |
| Nepali | 38.3% / 64.7% | 49.9% / 57.9% | Snowball nepali: 51.4% / 59.1% |
| Sanskrit | 21.5% / 48.4% | 29.1% / 40.9% | Indic NLP (Morfessor): 37.6% / 26.0% |
| Assamese | 32.3% / 57.2% | 43.1% / 48.6% | none |
| Odia | 41.8% / 62.1% | 48.7% / 58.7% | none |

(recall / precision.) Every stemmer finds more, and finds more that is
wrong; `stem` finds 6–15 points more than exact search in every language.
Against the best other stemmer, scored on the same queries (95% intervals
in the research log):

- **Ahead:** Kannada, Telugu, Gujarati, Marathi, Urdu; and Bengali against
  Lucene.
- **Level:** Malayalam; Hindi against Snowball. Lucene finds 0.4–2.3
  points more in Hindi, and is less precise.
- **A trade:** in Bengali, Punjabi, Tamil and Sanskrit, Morfessor or
  Snowball finds as much or more, and `stem` is more precise.
- **Behind:** Nepali, by 0.1–3 points of recall.
- **No other stemmer:** Assamese and Odia, and the eight languages measured on BPCC.

Odia was added in rules 2026-10-11. Its endings were chosen with a
different cost: precision on the same search, at most 4.9 points below
exact search (the median the other tables lose); Odia's Wiktionary is too
thin to count wrong hits. On FLORES+, read once for it, `stem` finds 6.9
points more than exact search (95%: +5.7 to +8.3) and loses 3.4 of
precision.

The other stemmers are Python or Java. In JavaScript, only Snowball's Tamil
exists.

The rules were chosen on PIB Parallel search under a budget: at most 4% of
what a search finds in real text may be a different word, by Wiktionary's
inflection tables. A second set of PIB queries, never used to choose,
points the same way in every language it could measure (Nepali has too
few PIB sentences); FLORES+ puts Gujarati and Marathi ahead where PIB had
them level, and Tamil level where PIB had it behind.

Kannada cuts twice since rules 2026-10-09; the Kannada row above was
measured before that change. On PIB sentences of August 2023, which no rule
was chosen on and which were read once, the second cut finds 0.9 points
more of the right sentences (95%: +0.7 to +1.1), and precision falls by
0.75 points (95%: −1.2 to −0.4).

Sanskrit has 17 more endings since rules 2026-10-11; the Sanskrit row
above was measured before that change. The endings were chosen on lemmas
of the Digital Corpus of Sanskrit (DCS, CC BY 4.0), on words that also
occur in modern Sanskrit text. On DCS texts that no rule was chosen on,
read once, `stem` finds 40.5% of the forms of one word together (34.6%
before), and 2.7% of what a search finds is another word (2.3% before).

The browser file is 4 KB gzipped.

## Measured on BPCC

Eight languages had no FLORES+ table and no test set to climb on until
BPCC (AI4Bharat, CC BY 4.0): about 100,000 English sentences each, with
human translations. Their endings were chosen on most of it, and checked
once on a part no rule had seen (recall / precision; 300 queries each):

| Language | sentences | exact search | `stem` | recall gain (95%) | endings |
|---|---|---|---|---|---|
| Maithili | 9,813 | 40.9% / 63.8% | 51.2% / 61.5% | +10.2 (+8.7, +11.9) | 10 |
| Manipuri (Meetei Mayek) | 9,733 | 38.9% / 59.7% | 50.3% / 55.2% | +11.4 (+10.0, +12.7) | 11 |
| Bodo | 8,331 | 39.3% / 60.8% | 50.6% / 56.5% | +11.3 (+9.4, +13.3) | 14 |
| Konkani | 7,699 | 34.6% / 62.7% | 44.1% / 58.9% | +9.5 (+8.2, +10.9) | 27 |
| Kashmiri | 9,872 | 33.0% / 67.2% | 40.3% / 62.9% | +7.2 (+6.0, +8.6) | 12 |
| Sindhi (Devanagari) | 5,022 | 37.1% / 62.3% | 45.7% / 59.1% | +8.5 (+7.1, +9.9) | 14 |
| Dogri | 9,036 | 45.0% / 64.9% | 50.8% / 62.6% | +5.8 (+4.7, +7.0) | 9 |
| Santali | 6,438 | 40.9% / 50.6% | 44.7% / 49.1% | +3.7 (+2.9, +4.7) | 12 |

Each table covers the script BPCC writes: Sindhi in Devanagari, Manipuri
in Meetei Mayek, Kashmiri in Perso-Arabic. A Sindhi word in Perso-Arabic
or a Manipuri word in Bengali script comes back unchanged. Santali gains
little (+3.7), at almost no cost in precision; it is the only stemmer for
Santali there is. These numbers rest on one source; the others in the
table above rest on FLORES+.

Across all 22 languages, `stem` finds 3.7–15 points more of the right
sentences than exact search.

## In a search engine

FLORES+ scores single words. To check the gain in a real engine, questions
were run against Wikipedia passages in Lucene (BM25), with up to 50,000
other passages per suite as distractors: IndicQA in 10 languages, TyDi QA
in Bengali and Telugu, XQuAD in Hindi. Recall@10 is the share of questions
whose passage is in the top 10. Half of each set was read; the other half
was read once, later, to confirm the advice on `fold` above.

| suite | exact | stem | Lucene analyzer | best fuzzy | trigrams |
|---|---|---|---|---|---|
| indicqa-hi | 64.3 | 63.5 | 68.3 | 65.7 | 66.5 |
| indicqa-bn | 59.0 | 63.7 | 63.0 | 63.0 | 68.9 |
| indicqa-ta | 40.9 | 45.9 | 49.6 | 45.9 | 52.6 |
| indicqa-te | 77.5 | 79.5 | 79.4 | 79.7 | 81.4 |
| indicqa-ml | 53.7 | 61.9 | – | 59.5 | 71.5 |
| indicqa-kn | 40.8 | 46.9 | – | 43.6 | 55.2 |
| indicqa-mr | 53.9 | 59.4 | – | 57.5 | 63.6 |
| indicqa-gu | 49.2 | 57.8 | – | 52.3 | 61.0 |
| indicqa-pa | 65.3 | 65.2 | – | 66.8 | 64.7 |
| indicqa-as | 51.7 | 59.3 | – | 57.3 | 61.5 |
| tydiqa-bn | 62.5 | 69.3 | 67.2 | 65.9 | 70.2 |
| tydiqa-te | 57.0 | 68.4 | 62.0 | 62.1 | 66.3 |
| xquad-hi | 92.7 | 94.5 | 94.6 | 93.3 | 92.6 |

- **Against exact search:** `stem` finds 2.0–11.5 points more in 10
  suites. It does not help in Hindi or Punjabi IndicQA (−0.8, −0.1) or
  XQuAD Hindi (+1.7, interval reaches −0.2): short question words merge
  with other words (ਕਿਸ "which" with ਕਿਸਾਨ "farmer"), and names lose their
  ends (सीता → सी).
- **Against fuzzy matching** (Lucene FuzzyQuery; the best of five forms per
  suite): ahead in 9 suites, level in Tamil and Telugu IndicQA, behind in
  Hindi (2.2) and Punjabi (1.6). Fuzzy puts the right passage first less
  often than exact search in all 13 suites. Do not add fuzzy matching to
  stems: `stem` plus fuzzy finds less than `stem` alone in 12 of 13.
- **Against Lucene's own analyzers** (Hindi, Bengali, Tamil, Telugu):
  behind in Hindi IndicQA by 4.8 and Tamil by 3.7; level in Bengali and
  Telugu IndicQA and XQuAD Hindi; ahead in TyDi Bengali (2.1) and Telugu
  (6.4). Lucene's Hindi lead comes from its spelling folds, not its
  stemmer: without the stemmer it finds 69.0.
- **Against an n-gram field** ("trigrams": each word, split correctly,
  indexed as its three-letter pieces, as Lucene's NGramTokenFilter(3, 3)
  or Tantivy's NgramTokenizer do; added 2026-10-07 on the same half):
  trigrams find more than `stem` in Malayalam (+9.6), Kannada (+8.3),
  Tamil (+6.7), Bengali (+5.2), Marathi (+4.2) and Hindi (+3.0) IndicQA
  (95% intervals above 0); level in five suites; behind in TyDi Telugu
  (−2.1) and XQuAD Hindi (−1.9). They put the right passage first more
  often in Malayalam, Kannada, Tamil and Marathi, less often in Punjabi.
  The cost: an index 2–3 times the size of the stem index, and more
  wrong passages in the top 10. IndicQA questions were written by people
  reading the passage, so they share many words with it; in TyDi,
  written before the passage was found, `stem` holds. SQLite FTS5's `trigram` tokenizer is a substring index,
  not this.

### A setup for OpenSearch and Elasticsearch

The measurement above added the BM25 scores of two fields: the words'
search keys, and the words cut into three-letter pieces. The keys come from
your code (`searchKey` in TypeScript, `searchkey.Key` in Go), not from the
engine, so index them as a field of space-separated keys. This setup was
measured in Python BM25, not in these engines:

```json
PUT /docs
{
  "settings": { "analysis": {
    "filter": { "tri": { "type": "ngram", "min_gram": 3, "max_gram": 3, "preserve_original": true } },
    "analyzer": { "tri": { "tokenizer": "whitespace", "filter": ["tri"] } }
  } },
  "mappings": { "properties": {
    "keys": { "type": "text", "analyzer": "whitespace" },
    "text": { "type": "text", "analyzer": "tri" }
  } }
}
```

Index `keys` as the document's words through `searchKey`, joined with
spaces, and `text` as the normalized text. Query both, so the scores add:

```json
{ "query": { "bool": { "should": [
  { "match": { "keys": "<the query's words through searchKey>" } },
  { "match": { "text": "<the normalized query>" } }
] } } }
```

The whitespace tokenizer keeps a word whole (a standard tokenizer splits
Indian words at vowel signs, which it does not count as letters).
`preserve_original` keeps words shorter than three code points; the
measurement kept them as one piece.

## Names

`stem` treats a name as a word, and cuts what looks like an ending. Most
names survive: a cut that keeps a name apart from other words does no harm
(மோடியின் → மோடி). Some lose the name: करीना → कर, which then finds करने,
कर and करते. Measured on Naamapadam's news sentences (AI4Bharat, CC0), with
person spans projected from English by machine; the frequent-name rows
agree, so span errors do not drive the numbers.

- **Beside a trigram field** (MIRACL dev, Hindi, Bengali and Telugu, 802
  questions written without seeing the passage, over all of Wikipedia;
  read once, added 2026-10-11): an engine that indexes both fields finds
  more than trigrams alone, Recall@100 +3.0 (95%: +1.8 to +4.2), and ranks
  better, nDCG@10 +3.8 to +4.4 per language. Against a second field of
  plain words, the stem field still adds +2.3 (+1.1 to +3.6); in recall
  that gain is Telugu's (+4.7; Hindi and Bengali level), in ranking it is
  +1.8 to +1.9 in all three. Malayalam, Kannada, Tamil and Marathi are not
  in MIRACL: there, two fields are untested.
- **Swamped:** more than half of a stem search's hits are other words.
- **Meets a word:** the stem is shared with at least one other word.
- **Wrong hits:** of a stem search's hits, the share that are other words.
  Exact search has none.

| | name tokens | types | changed | meets a word | swamped | wrong hits |
|---|---|---|---|---|---|---|
| as | 1,562 | 917 | 57.2% | 8.9% | 4.0% | 4.75% |
| bn | 888,853 | 128,705 | 45.0% | 8.2% | 2.7% | 2.83% |
| gu | 437,544 | 53,488 | 46.4% | 9.0% | 2.2% | 2.39% |
| hi | 1,048,763 | 82,691 | 32.8% | 9.0% | 1.9% | 2.05% |
| kn | 417,460 | 56,905 | 83.9% | 18.4% | 2.7% | 3.24% |
| ml | 663,061 | 94,121 | 75.5% | 18.6% | 1.7% | 2.30% |
| mr | 467,053 | 54,792 | 42.5% | 7.8% | 1.3% | 1.50% |
| pa | 481,040 | 52,571 | 44.8% | 12.6% | 3.0% | 3.68% |
| ta | 344,418 | 66,141 | 66.6% | 21.6% | 2.8% | 3.68% |
| te | 467,279 | 58,818 | 88.1% | 17.4% | 2.2% | 2.64% |

Assamese has few sentences; its row is thin. Two causes: a final vowel read
as an ending (योगी → योग, ਰਾਜੂ → ਰਾਜ "state") and a final cluster cut
(ஸ்டாலின் → ஸ்ட, പിള്ള → പി). Place names are swamped less often (0.9–2.3%; Assamese 2.8%, thin),
except in Tamil (3.7%). For a field of names, keep stems longer (Options,
below); for name search, use `phonetic`.

## Options

Two choices change the trade between finding more and finding wrong words.

**`minStem`** keeps every stem at least that many code points long
(default 2, at most 9). For a field of names, 4 halves the person-name
tokens whose search is swamped by other words (Hindi 1.9% → 0.5%, Punjabi
3.0% → 0.8%), and finds 0.5–2 points less of the right sentences in
ordinary text.

```ts
stem("करीना", "hi");                  // "कर": meets करने
stem("करीना", "hi", { minStem: 4 });  // "करीन"
```

In Go: `stem.StemWith(w, "hi", stem.Options{MinStem: 4})`.

**Malayalam compounds** (`indickit/stem-compounds`, 1.6 KB gzipped, a
separate file): `compoundKey(w)` returns the first member that starts the
word (കേരളസർക്കാർ, "Kerala government", and കേരളത്തിലെ both give കേരള), or
null. Use it in place of the stem:

```ts
import { compoundKey } from "indickit/stem-compounds";
const key = compoundKey(w) ?? stem(w, "ml");
```

In Go: `stem.CompoundKey(w)`. On held-out news, this key found 5.5 points
more of the right sentences than `stem` alone and was 2.9 points less
precise; Morfessor, which runs only in Python, found 6.2 more. Its 226
members are first parts from SMC's mlmorph analyser (MIT), at least five
code points long, without Sanskrit prefixes (പ്രതി, പരി).

Known weak spots:

- **Irregular words do not meet**: है and होना, இந்த and இது. A list of
  endings cannot reach them.
- **Some forms change the stem**, and stay apart: மாநிலம் / மாநிலங்கள்,
  రాష్ట్రం / రాష్ట్రాల, and the Malayalam chillu (സർക്കാർ / സർക്കാരിന്റെ).
- **Out of context**: a word with two readings gets one stem. ஆண்டு is also
  "having ruled".
- **One script per language**: Sindhi in Devanagari and Manipuri in
  Meetei Mayek only; their other scripts come back unchanged.

