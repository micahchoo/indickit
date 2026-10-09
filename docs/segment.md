# segment: the evidence

`segment` splits text into the letters a reader sees. Unicode's grapheme
clusters keep a conjunct whole in most Indian scripts, but not in Kannada
or Gurmukhi: `Intl.Segmenter` splits ಲಕ್ಷ್ಮಿ into four pieces. This file
says how well `segment` does, how it was measured, and where it fails. How
to use it: the [README](../README.md).

Text in any other script gets Unicode 17.0's grapheme clusters, which
indickit computes itself: every browser and every Go version gives the same
letters.

## How good it is

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
Python's `regex` and Java's `BreakIterator` all split them. Go's `uniseg`
and Java 21 also split conjuncts in every other Brahmic script (17% of
Hindi words, 66% of Malayalam words), because they use rules older than
Unicode 15.1. `indicparser` (Python) has no Kannada,
and splits 5% of Punjabi words for other reasons (it cuts the nukta off its
letter: ਦੇਸ਼ → ਦੇ ਸ ਼).

The browser file is 8 KB gzipped. A word takes 0.4 µs in Node (`Intl.Segmenter`:
1.9 µs) and 0.3 µs in Go.

Known weak spots:

- **Malayalam ൻ്റ** is one shape in Noto, but two in the Rachana and
  Gayathri fonts. `segment` follows Unicode and keeps it two letters.
- **Tamil க்ஷ** stays two letters: it occurs in 0.04% of Tamil words.
- **Only HarfBuzz was tested.** Windows and Apple draw text with their own
  engines.
- **Go reads invalid UTF-8 as U+FFFD**, so for such input the letters do not
  join back into the original bytes.

