# normalize: the evidence

`normalize` gives one encoding to text that looks the same, and never
changes what a reader sees; `fold` also merges accepted spellings of one
word, for search. This file says how well they do it, how it was measured,
and where they fail. How to use them: the [README](../README.md).

It reads the same 21 languages as `phonetic`; text in any other script
changes only by Unicode NFC.

## How good it is

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

