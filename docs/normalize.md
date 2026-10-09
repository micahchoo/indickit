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

`fold` was measured against the two tools a user can pick today, each with
its best options: Indic NLP Library, and Lucene, which Elasticsearch,
OpenSearch and Solr run. On data no rule was chosen on (rules 2026-10-07):

| | Spelling variants merged (names and words) | Spellings people typed merged (Wikipedia redirects) | Of what one search finds, a different word |
|---|---|---|---|
| Lucene, stock analyzer per language | 6.1% | 9.9% | 0.14% |
| Indic NLP Library, every fold | 5.3% | 9.0% | 0.04% |
| **fold** | **5.5%** | **10.0%** | **0.02%** |

It merges only spellings of the same sounds: nasal + virama and anusvara
(हिन्दी, हिंदी), chandrabindu, nukta, Arabic and Urdu letter forms (ي ی,
ك ک, ه ہ), joiners that show (പുരസ്‌കാരം, പുരസ്കാരം), Assamese ৰ ৱ, Odia ଵ ୱ,
the old and new Malayalam chillu spellings, and Urdu vowel marks. The
rivals find more where they merge different sounds: Lucene's Hindi and
Bengali filters make long vowels short, so की "of" and कि "that" become one
word; Indic NLP drops a final long ā in Telugu and Kannada.

The browser file is 16 KB gzipped.

Known weak spots:

- **Malayalam** is furthest from the most possible (69.9% against 82.8%).
- **The nukta merge can join two words:** राज "rule" and राज़ "secret". Many
  writers leave the nukta out, so text often writes them alike already.
- **Only HarfBuzz was tested.** Windows and Apple draw text with their own
  engines.
- **Kashmiri, Sindhi, Bodo and Maithili** had no look-alike groups in the
  held-out data. They were checked for damage only, and none was found.
- **`fold` keeps Kashmiri and Sindhi vowel marks:** they tell words apart
  (Sindhi هيءَ / هيءُ, "this", feminine and masculine). The rivals delete
  them and find more there. Sindhi's held-out numbers were read before this
  choice.
- **`fold` merges nothing in Santali and Meetei Mayek** beyond `normalize`:
  no rule acts on their scripts. Dogri and Bodo have no spelling data:
  their merges in text were read (बंद / बन्द, नेईँ / नेईं), not measured.

