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
- **Odia, Meetei Mayek and Ol Chiki**, which that Wikipedia sample did not
  reach: 1.2M words of news and typed sentences, no word changed its look.

Rules 2026-10-11 decide a Tamil joiner between two consonants by the pair:
Tamil draws only three conjuncts across a pulli (க்ஷ, ஶ்ர, ஸ்ர), so a ZWNJ or
ZWJ there stays, and elsewhere it goes. On Tamil web text never used to build
it (IndicCorp), look-alike groups that hold a joiner made equal: 89.6% →
98.8%, and no word changed its look in Noto, Anek or 5 other Tamil fonts.
The numbers above are for rules 2026-10-07.

Rules 2026-10-12 let every font we hold decide what looks the same, not
Noto and Anek alone: 2 to 15 families a script (Tiro, SMC's Rachana and
Manjari, Baloo, Hind and the others in `data/fonts`), each compared by glyph
outline. The joiner table and its tree were rebuilt with them. On the 12.9M
words of every measurement set, drawn in those fonts, the words whose look
changes fall from 54 to 17, all malformed input or a font's own quirk; the
held-out number above (88.1%) does not move, and the groups made equal move
by under two points in Malayalam and Bengali (down) and three in Perso-Arabic
(up). Three faults went with it: khanda ta is no longer written where the
ZWJ joins ত্ to a cluster with a left-side vowel sign or a reph, or under a
reph; an old Malayalam chillu before a vowel sign stays as typed; and a ZWJ
between a Malayalam consonant and its vowel sign is kept. The tree sees more
contexts, so the browser file grows from 16 KB to 22 KB. On web text no rule
was chosen on (IndicCorp v2, half of each file, read once), the joiner
groups made equal are 91.8% of 1.45M in Malayalam (the most possible: 97.1%)
and 80.5% of 28,155 in Odia (92.1%). That read found two more faults, now
fixed: the chillu k (ൿ), which Unicode's DoNotEmit list does not name and
Noto draws apart from ക് + ZWJ, is no longer written; and no chillu is
written before a second virama (ന് + ZWJ + ്, a web spelling of nta). After
them 47 of 83M Malayalam words change their look (a ZWNJ after the dot reph
ൎ); before them, 16,327.

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

The browser file is 22 KB gzipped.

Known weak spots:

- **Malayalam** is furthest from the most possible in Noto and Anek (69.9%
  against 82.8%). Asked of 15 Malayalam fonts, the most possible is 71.0%:
  fonts with traditional conjuncts draw what a ZWNJ blocks, so most of
  those joiners are not invisible.
- **A ZWJ between a Malayalam consonant and its vowel sign** (ന + ZWJ + ു):
  fonts with traditional ligatures (Rachana, Manjari, Meera and 7 more) draw
  the sign joined without it, so rules 2026-10-12 keep it (rules 2026-10-11
  deleted it: 4 words in 1.1M changed their look in those fonts).
- **Bengali khanda ta** (ত + virama + ZWJ → ৎ) also changes the look where
  the next consonant carries a vowel sign drawn on its left (ি ে ৈ ো ৌ), or
  where a reph is near (ত্‍কি, ভৰ্ত্‍সনা): 6 words in 12.9M. Fixed in rules
  2026-10-12.
- **An old Malayalam chillu before a vowel sign** (ന് + ZWJ + െ) becomes the
  atomic chillu, which draws the sign apart: rare, a typing order. Fixed in
  rules 2026-10-12.
- **Suruma**, a Malayalam font older than Unicode 5.1, has no atomic chillus
  (ൻ ർ ൽ ൾ ൺ): text after `normalize` shows boxes in it.
- **Odia acronyms and ଡ଼:** a ZWNJ between RA + virama and a vowel letter
  (ଆର୍ + ZWNJ + ଇ, as in the acronym MGNREGS typed with joiners), and a ZWJ after ଡ଼ + virama, are
  deleted where every Odia font shows them: 310 of 922,000 Odia words with a
  joiner in web text. Fixed in the next rules version.
- **Martel and Laila** (Devanagari) move the mark after a deleted joiner by
  1% and 0.2% of an em, a shift no reader sees; they did not decide the rules.
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

