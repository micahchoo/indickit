# phonetic: the evidence

`phonetic` gives a name a key that is the same in every script the name is
written in. This file says how well it does that, how it was measured, and
where it fails. How to use it: the [README](../README.md).

It reads 21 Indian languages and English: Assamese, Bengali, Gujarati,
Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri (Meetei
Mayek), Marathi, Nepali, Odia, Punjabi (Gurmukhi), Sanskrit, Santali (Ol
Chiki), Sindhi, Tamil, Telugu, Urdu, and Latin spellings of all of them.

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

The table was read with rules 2026-10-05. Rules 2026-10-06 add one key to
255 of the 195,994 test words (English spellings with a w before a
consonant, such as Andrew) and remove none.

"Romanize + Soundex" is the best off-the-shelf alternative: the strongest
existing romanizer for each script, then English Soundex. Neither of the
two romanizers tried reads Urdu, Sindhi or Kashmiri.

Two different people who share a family name are matched by mistake
about once in 200 pairs; two random people, almost never. Searching one
name among 81,000 English names returns about one wrong person.

One word takes 0.6 µs in Go and 0.7 µs in Node, on one core. A million
names index in about 2 s (Go) or 3 s (Node); a search takes 2–3 µs. The
browser file is 4 KB gzipped.

Known weak spots:

- **Tamil** is the weakest Indian language (76%). Tamil writes several
  sounds with one letter.
- **Bodo** romanization writes a vowel as w (खौ is "khwo"). Since rules
  2026-10-06 a w before a consonant is also read as a vowel: Bodo's typed
  spellings match 69.5% of the time (63% before), level with Soundex's 70%.
- **A first vowel can differ.** "Imran" and عمران do not match: ع is read
  as a.
- **Dogri and Bodo** were measured on ordinary words only; there was no
  set of names.

