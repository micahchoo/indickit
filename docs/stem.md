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

The browser file is 3 KB gzipped.

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

Known weak spots:

- **Irregular words do not meet**: है and होना, இந்த and இது. A list of
  endings cannot reach them.
- **Some forms change the stem**, and stay apart: மாநிலம் / மாநிலங்கள்,
  రాష్ట్రం / రాష్ట్రాల, and the Malayalam chillu (സർക്കാർ / സർക്കാരിന്റെ).
- **Out of context**: a word with two readings gets one stem. ஆண்டு is also
  "having ruled".
- **No table**: Kashmiri, Konkani, Manipuri, Odia, Santali and Sindhi
  have too few test words to measure one; Bodo, Dogri and Maithili have
  none.

