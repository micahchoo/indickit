# wellformed: the evidence

`wellformed` says whether a font can draw a text whole. A text renderer
draws a dotted circle (◌) where a character cannot join the syllable before
it: a vowel sign with no letter before it, a vowel sign after a virama, a
third anusvara. Such text comes from PDF text layers (the sign typed in
visual order, a conjunct member dropped) and from OCR. This file says how
well `wellformed` agrees with the renderer, how it was measured, and where
it fails. How to use it: the [README](../README.md).

## Why

Clean text is almost never broken: 0.012% of 4,383,002 words (Wikidata
names, Aksharantar words, PIB press releases). PDF text is: 10.8% of the
227,476 words in the text layers of 186 born-digital PDFs from the
Internet Archive, in 11 languages; 49 of the 63 PDFs with a text layer in
an Indian script had more than 1% broken words. Every producer had them:
Microsoft Word 8.7%, Bullzip 11.5%, iLovePDF 15.5%. OCR (Tesseract, Hindi
gazettes): 0.56%.

`normalize` cannot repair these words: it never moves a sign. `wellformed`
is the gate before `normalize`, to reject or flag the text.

## How good it is

The verdict is HarfBuzz's: a string is broken when HarfBuzz draws it with
a dotted circle, in the Noto font of its script. `wellformed` carries no
font: its rules are HarfBuzz's own verdicts, swept over every character
after every character of each script, and over every character after a
letter and two invisible characters. Measured on text that no rule was
derived from:

| Held-out text | Words | Broken (HarfBuzz) | Missed | False alarms |
|---|---|---|---|---|
| PDF text layers, 168 PDFs from other collections | 135,944 | 9,594 (7.1%) | 0 | 0 |
| Wikipedia articles created after the 2023-11 dump, 17 wikis | 2,146,974 | 851 | 0 | 0 |

**100% agreement with HarfBuzz** on both. The rival, a check that a word
starts with a combining sign (what a PDF pipeline does today), finds 84% of
the broken PDF words and raises 4,667 false alarms; it misses every break
inside a word. On the development data (8.3 million strings: clean words,
PDF text, planted damage, planted invisible characters, whole sentences)
`wellformed` missed 0 broken strings and raised 4 false alarms, all four in
strings that need a window wider than the rules hold (below).

No other tool does this without a shaper. HarfBuzz itself is the ceiling,
and needs a shaper and a font for each script (uharfbuzz, go-text,
harfbuzzjs). Google's Nisaba well-formedness grammars did not build. Indic
NLP Library has no such check.

The browser file is 6 KB gzipped.

## How it was built

`measure/wellformed_table.py` in the research repo asks HarfBuzz about
every character of each script's block, with the six invisible characters
(ZWNJ, ZWJ, ZWSP, WJ, BOM, soft hyphen) and the placeholders NBSP and ◌:

- **start**: is the character broken at the start of a run;
- **pair**: is it broken after the shortest whole string that ends in x;
- **triple**: the same after two characters, kept where the first changes
  the pair's verdict (a third anusvara; a sign after consonant + ZWJ);
- **quad**: a letter, two invisible characters, then the character, kept
  where it changes the narrower verdict;
- **pending**: a character broken at the end of a run but whole before
  some next character. Only Malayalam dot reph ൎ.

Unicode's Indic_Syllabic_Category names the first classes; two characters
share a class only when every verdict treats them alike, so every member
of a class was shaped, not a sample. No rule was written by hand.

Known weak spots:

- **A window of at most three characters before the character.** Three or
  more invisible characters in a row are not swept; a sign that another
  sign four places back makes whole (Gurmukhi vowel sign, nukta, virama,
  vowel sign) and a nukta five places back (Bengali) give a false alarm.
  Seen only in PDF garbage and planted strings.
- **Only HarfBuzz was tested** (the HarfBuzz of 2026, uharfbuzz 0.56.2,
  with Noto fonts and Unicode 17 data). DirectWrite (Windows) and CoreText
  (Apple) insert dotted circles by their own grammars. A new HarfBuzz can
  change a verdict; the table is derived again with each upgrade.
- **Arabic and Ol Chiki text is always whole.** HarfBuzz draws no dotted
  circle inside an Arabic or Ol Chiki run, only for a mark at the start of
  a paragraph, which is not checked. Urdu PDF text had 0 broken words of
  21,509.
- **Text in other scripts is not read.** A Latin letter, a digit or a
  space ends a run, as a renderer splits text by script; the check says
  nothing about them.
