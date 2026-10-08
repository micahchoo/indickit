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
end). These labels have no titles (Shri, Smt., Dr) and few initials, and
only names with the same number of words in both languages were compared.
Real lists give lower numbers: see "On lists as people write them". Each number is the share of searches that find the right person
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
consonant, such as Andrew) and remove none. Rules 2026-10-06.1 key a
number by its value (१२ = 12; before, every number matched every other
number); 10 test words change.

"Romanize + Soundex" is the best off-the-shelf alternative: the strongest
existing romanizer for each script, then English Soundex. Neither of the
two romanizers tried reads Urdu, Sindhi or Kashmiri.

Two different people who share a family name are matched by mistake
about once in 200 pairs; two random people, almost never. Searching one
name among 81,000 English names returns about one wrong person.

One word takes 0.6 µs in Go and 0.7 µs in Node, on one core. A million
names index in about 2 s (Go) or 3 s (Node); a search takes 2–3 µs. The
browser file is 5 KB gzipped.

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

## On lists as people write them

Two real lists: the Lok Sabha member list (sansad.in), with each name in
English and in Hindi as the list writes it, and the Local Government
Directory's villages, with each name in English and in one of 8 scripts.
Each number is the share of English names that find the right entry among
the native-script names. "Romanize + fuzzy match" is the best romanizer,
then a fuzzy word match, set to return no more wrong names than indickit.
The numbers are from data that no threshold was set on, with rules
2026-10-06.1.

| List | indickit | romanize + fuzzy match |
|---|---|---|
| Lok Sabha members, as written | 42% | 52% |
| the same, titles and initials removed | 70% | 69% |
| Village names, 8 scripts | 73% | 71% |

In the second row, only indickit's input changes. The fuzzy match reads
the names as written, with a looser threshold that gives the same number
of wrong names.

- **Remove titles and initials before you key a name.** indickit does not
  remove them. Shri against nothing, or "M" against एम, is a miss.
- **Fuzzy matching does as well on these lists.** ICU transliteration then
  the same fuzzy match finds 78% of villages. What indickit adds is an
  index: one lookup per name, from any script to any script. A fuzzy match
  compares the query with every name in the list.
- **Short names give many wrong matches.** Most village names are one
  short word. In Maharashtra's 35,988 villages, one search returns about 26
  wrong villages. Search within a district, not within a state.
- **Do not merge two records on a short name alone.** At the merge budget,
  merge mode finds at most 9% of villages. Use a second field, such as the
  district or a father's name.
- **A digit joined to letters is dropped** (ନଂ13 is read as ନଂ), because
  Hindi writes ० as an abbreviation dot (डॉ०).
