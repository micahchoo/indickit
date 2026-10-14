# phonetic: the evidence

`phonetic` gives a name a key that is the same in every script the name is
written in. This file says how well it does that, how it was measured, and
where it fails. How to use it: the [README](../README.md).

It reads 21 Indian languages and English: Assamese, Bengali, Gujarati,
Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri (Meetei
Mayek), Marathi, Nepali, Odia, Punjabi (Gurmukhi), Sanskrit, Santali (Ol
Chiki), Sindhi, Tamil, Telugu, Urdu, and Latin spellings of all of them.
Manipuri is written in Meetei Mayek and in Bengali script; since rules
2026-10-13 a word keys the same in both more often: ꯑ before a vowel sign
only carries it (ꯑꯣꯏꯕ = ওইবা), and ꯪ before a consonant is ŋ (ꯈꯪꯕ = খঙবা).
On FLORES word pairs, a Bengali-script word and its Meetei Mayek twin share a
key 87.7% of the time, up from 83.4% (development data).

## How good it is

### The rules that ship (2026-10-12)

Rules 2026-10-12 add six folds, built from the key's misses on village names
(the Local Government Directory, development half; not held out): a Latin
final -on is also -o (Pimpalgaon = पिंपळगाव), Bk and Kh are also budruk and
khurd (बुद्रुक, खुर्द), a Latin rh is also r (Aligarh = अलीगढ), Bengali-script
ওয় is also ov (Dewan = দেওয়ান), a Latin initial ye is also e (Yekodi = एकोडी),
and Tamil ா் is also ர் (நாவலூா் = Navallur). On the development half of the
villages, the key finds 83.2% (79.4% before; ICU + fuzzy match 81.6%): a
development number. Read once on a third OpenStreetMap slice that no rule
was chosen on (1,506 places whose names no rule saw): mean recall over
languages rises 0.34 points (95% interval +0.14 to +0.72), Marathi 2.4,
Hindi 2.0; no language falls; wrong merges rise 1.2%. They also drop the
native forms of the titles Sardar, Maulana, Janab and Begum, as the Latin
forms already were: "Sardar Vallabhbhai Patel" now matches સરદાર વલ્લભભાઈ
પટેલ. Every key of rules 2026-10-11.8 is kept; 1,334 of the 199,992 test
words gain one.

Measured once, with rules 2026-10-11.7, on OpenStreetMap place names that no
rule was chosen on (one fiftieth of the places, held out to the end): 1,704
villages, towns and neighbourhoods, each named in English and in one or more
Indian scripts. Rules 2026-10-11.8 were read once on a second slice of the
same size: the same numbers as 2026-10-11.7 in every language (91% of
pairs found, 90.7 exactly; the wrong-merge rate unchanged), because the h-less key already
found every pair that holds ھ; that slice has no Sindhi place. Rules 2026-10-11.8 change one thing: the Perso-Arabic letter
ھ (U+06BE) is read as h, the h Sindhi writes (سنھا = Sinha). On Wikidata
people (DEV, not held out) Sindhi rises from 78% to 83%; 2,251 of the
199,992 test words gain a key, and 20 of them, with ھ at the start or after
a vowel, lose the h-less one.
Each number is the share of a place's name pairs whose keys meet.

| | phonetic | romanize + Soundex |
|---|---|---|
| All pairs | **89%** | 71% |
| Hindi | 85% | 65% |
| Kannada | 95% | 90% |
| Malayalam | 91% | 57% |
| Telugu | 92% | 87% |
| Tamil | 94% | 39% |
| Marathi | 88% | 74% |

Languages with fewer than 100 pairs in this sample are not listed.

These are places, not people. Every people list held out for this key has
been read, so the people numbers below were read with older rules. They
still hold as lower bounds: every word keeps every key it had in indickit
v0.10.0 (rules 2026-10-07), checked on all 198,782 test words but two long
Urdu words and the 20 ھ words above, so every pair those rules matched is
still matched.

### People, rules 2026-10-05

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
browser file is 9 KB gzipped.

Known weak spots:

- **Tamil** is the weakest Indian language (76%). Tamil writes several
  sounds with one letter.
- **Bodo** romanization writes a vowel as w (खौ is "khwo"). Since rules
  2026-10-06 a w before a consonant is also read as a vowel: Bodo's typed
  spellings match 69.5% of the time (63% before), level with Soundex's 70%.
- **A first vowel can differ.** In Latin and Indian scripts the first vowel
  counts: "Ebrahim" and इब्रहिम् do not match. In Urdu, Kashmiri and Sindhi
  script an initial alif or ع is also read as i, e or u (rules 2026-10-11.3),
  so "Imran" and عمران match.
- **-garh written ढ.** Since rules 2026-10-12, "Aligarh" and अलीगढ match: a
  Latin rh is also read as r.
- **Dogri and Bodo** were measured on ordinary words only; there was no
  set of names.

## Search (`phonetic-search`)

`phonetic-search` finds a name among many. The key finds the candidates,
and a scorer learned from data gives each one a score from 0 to 100. Use it
for a long list, for names written with titles, initials or joined words,
and for a name in running text.

Search 2026-10-11.7, on the same held-out OpenStreetMap places (search
2026-10-11.8 on the second slice: 92% found, 91.5 exactly, at 3.0 wrong per
10,000; the rival 72.7% at 3.0): each English
place name looked up among the native names of its language, at the
villages threshold.

| Language | phonetic-search | ICU + fuzzy match |
|---|---|---|
| Hindi (602 places) | 88% | 65% |
| Kannada (550) | 97% | 96% |
| Malayalam (203) | 91% | 56% |
| Tamil (123) | 94% | 63% |
| Telugu (294) | 93% | 91% |
| Mean | **93%** | 74% |

Both return about 3 wrong places per search per 10,000 names.

The lists and text below were measured with search 2026-10-09 and rules
2026-10-07, on data that no rule, table or threshold was set on. Each list number is the share of English
names that find the right entry among the native-script names, at the
threshold for that use.

| Task | phonetic-search | the key alone | best alternative |
|---|---|---|---|
| Lok Sabha members, as written (161 names) | 86% | 70% | 78% (ICU + fuzzy match) |
| Village names, 10 languages (7,985) | 85% | 79% | 65% (ICU + fuzzy match) |
| A name in running text, at most 10% of hits wrong (1,083) | 66% | — | 31% (romanize + fuzzy match) |
| the same, at most 20% of hits wrong | 78% | — | 46% (ICU + fuzzy match) |

The lists are the held-out FINAL slices of the two lists above; the text is
PIB press releases of July 2019 (names in English and in 10 Indian
languages). On names that the scorer never saw, the text numbers hold: 67%
and 78%.

- **Thresholds.** 76 for names in a list, 73 for village names, 81 for a
  name in text when at most 10% of hits may be wrong, 71 for 20% (search
  2026-10-11.6; 74, 72, 80 and 70 before 2026-10-11.1). At 76, a search of
  the Lok Sabha list returns about one wrong name in 20 searches.
- **A score belongs to its search.** It is relative to the other
  candidates the key found, so compare scores within one search, not across
  searches.
- **One language per index.** The tables that compare English letters with
  a script are per language. For names in two Indian scripts, load the
  tables between them: `loadSearch("hi", { scripts: ["deva", "arab"] })`.
- **Small lists.** In a list of fewer than 100 names every key counts.
  From search version 2026-10-11, a name's leading titles (Shri, Smt.,
  श्रीमती, திரு) are dropped in the query and in the list: "Narendra Modi"
  scores 100 against "श्री नरेंद्र मोदी" in a list of four names (73
  before). A title in the middle of a name still weighs as much as a name.
- **Size.** The browser file is 16 KB gzipped, and a language's table 2–6
  KB more, loaded when you call `loadSearch`.
- **Cap what users type.** The scorer compares each query word with each
  candidate word, so its cost grows with their product, and a name's
  near-match keys grow with the square of its length. Measured in Go: a
  query of 1,024 characters (about 110 words) scored against itself takes
  77 ms; 4,096 characters take 1.2 s (3.8 s as one-letter words), and
  16,384 run out of 6 GB. A query of 4,096 Latin characters against an
  index of 579 names takes 1.5 s (TypeScript 3.5 s); indexing one name of
  4,096 letters takes 118 ms. Cut a query to a few dozen words and a name
  to a few hundred characters before the call.

Weak spots: Urdu (41%) and Malayalam (53%) names in text at the strict
threshold; Tamil village names (66%). At the very strictest thresholds (one
wrong village in 10,000 names) the search keeps fewer than the key alone.
Not measured on held-out data: names between two Indian scripts (on the
development data, every one of 17 languages is ahead of the key alone) and
ordinary words typed in English letters.

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

Rules 2026-10-11 drop leading titles and read initials. On a second roster,
the Rajya Sabha (2,546 members, as written, read once), the key alone
finds 54.8% with rules 2026-10-07 and 87.7% with rules 2026-10-11.

In the second row, only indickit's input changes. The fuzzy match reads
the names as written, with a looser threshold that gives the same number
of wrong names.

- **Titles and initials.** The table was measured before rules 2026-10-11.
  The key now drops a name's leading titles, also after a comma ("Bajwa,
  Sardar Partap Singh"), and reads one-letter initials (M = एम). Other
  honorifics and a title inside a part still count as words.
- **Fuzzy matching does as well on these lists.** ICU transliteration then
  the same fuzzy match finds 78% of villages. What indickit adds is an
  index: one lookup per name, from any script to any script. A fuzzy match
  compares the query with every name in the list.
- **Telugu villages: use the search.** Many Telugu village names are one word in Telugu and two in English (Kunta Palle = కుంటపల్లి).
  Key matching finds 81.5% of Telugu villages; `phonetic-search` proposes the joined forms as candidates and finds 93.5% at the villages threshold, at 5.9 wrong per 10,000.
  Both are development numbers, on the same half of the Telangana and Andhra Pradesh villages.
- **Short names give many wrong matches.** Most village names are one
  short word. In Maharashtra's 35,988 villages, one search returns about 26
  wrong villages. Search within a district, not within a state.
- **Do not merge two records on a short name alone.** At the merge budget,
  merge mode finds at most 9% of villages. Use a second field, such as the
  district or a father's name.
- **A digit joined to letters is dropped** (ନଂ13 is read as ନଂ), because
  Hindi writes ० as an abbreviation dot (डॉ०).
