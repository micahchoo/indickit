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
`stem` may cut a stem again, as Snowball and Lucene do: apply it once.

Normalize first, and do not fold. On PIB search, `normalize` before `stem`
is never worse than `stem` alone and adds up to 1.6 points of recall
(Punjabi, Bengali); `fold` before `stem` costs Assamese 10 points, because
`fold` rewrites Assamese ৰ, which the endings hold.

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

The browser file is 3 KB gzipped.

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

