# deromanize: the evidence

`deromanize` writes a Latin-typed word in an Indian script: namaste →
नमस्ते. It is the reverse of `romanize`, and it returns a ranked list: one
typed word can stand for several native words (kamal: कमल, कमाल), and the
first is the most likely. It reads 22 languages. The research is in
`linguistic-utilities/jobs/deromanize/` (`JOB.md`).

## How it works

The typed word is cut into pieces of Latin letters ("n", "ma", "ste"), each
piece gets a native spelling, and a statistical model of how those pieces
follow one another scores every way of writing the word. It is `romanize`'s
model with its two sides swapped. A beam search keeps the 16 best ways.
Each language writes only letters of its own script.

Then a word list re-ranks them. Latin typing loses what Indian scripts
write: long and short vowels, and ट against त. So the model alone often puts
a word that does not exist (कामल) above one that does (कमल). Each of the 16
gets its score plus the log of how often the word occurs in the language's
Wikipedia, and words found in the list come first.

A piece may write nothing: the "a" of "kamal" is the inherent vowel. A
spelling that writes nothing for a consonant is cut short ("murmu" → മു,
with nothing for "mur"), and a short, common string would take the list's
bonus and come first; names mode did this in v0.8.0. Since rules 2026-10-09
the **names mode** ranks a cut-short spelling as if it were not in the list.
The letters that may write nothing are the vowels, h (aspiration is written
with the consonant before it), y and w (a glide fuses into a vowel sign),
and the second letter of a double ("dutt": one sound). On the development
names this moved the first answer from 68.1% to 69.2% right (19 languages).
The rule is for names only: in words mode it cost Tamil 2 points on
development text, so words mode is unchanged and its output is that of
rules 2026-10-08 (every words-mode row of the earlier conformance file is
reproduced). In the table below, the words-mode rows still hold; the
names-mode rows (69.7% on Wikidata FINAL) are of rules 2026-10-08 and are
not re-read: a held-out set is read once (`MAINTAINING.md`, "Changing
rules").

There are two modes:

- **words**, for running text: trained on 60,000 human romanizations a
  language from Aksharantar and on IndicXlit's romanizations of the 30,000
  most frequent Wikipedia words of each language. This is the default.
- **names**, for fields that hold person names: a names model (the English
  labels of Indian people in Wikidata) and the words model, merged, and the
  people's name tokens added to the word list.

The tables are rules as data: the Go and TypeScript code is a short loop
over them, and both give the reference implementation's lists on every row
of the conformance file (2,990 rows).

## How good it is

Each set below was read once, after every choice was made. The first
answer, then any of four, is the native word:

| Held out | deromanize | IndicXlit |
|---|---|---|
| Running text, Hindi news (COMI-LINGUA, FINAL half, 12,416 words) | 87.1 / 97.4 | 86.1 / 89.7 |
| Running text, Hindi news (COMI-LINGUA, TEST half, 13,281 words) | 87.3 / 97.4 | 86.1 / 89.8 |
| Names (Wikidata FINAL, 19 languages, 12,654 tokens) | 69.7 / 86.4 | 66.4 / 82.9 |
| Names neither tool trained on (Wikidata FINAL) | 46.0 / 71.4 | 48.8 / 74.5 |
| Rare isolated words (Aksharantar test, 20 languages, 31,500 words) | 53.6 / 70.9 | 63.7 / 78.2 |
| Santali names (Wikidata FINAL; IndicXlit has no Santali) | 52.2 / 76.3 | – |
| Dogri words (Aksharantar test; IndicXlit has no Dogri) | 58.7 / 68.4 | – |

On Hindi news typed in Latin, the first answer is the right word for 87.1%
of the words, and one of four for 97.4% (IndicXlit: 86.1% and 89.7%). For
names, the first answer is right for 69.7% (IndicXlit: 66.4%).

IndicXlit is the best other tool: a neural model (Python, a 119 MB model).
On running text the two are level at the first answer, and `deromanize` is
ahead in four (97.4% against 89.7%). On names it is ahead. On rare words out
of context and on names that neither tool has seen, IndicXlit is ahead.

Running text in the 11 languages of Google's Dakshina sentences was measured
on development data only: 80.6% / 88.0% against 77.1% / 87.9%.

**The input method you can install today.** On the Hindi development
words, hindi-ime's offline dictionary (an input method for Linux) found the
right word first 58.8% of the time and had no word at all for 26.1%;
`deromanize` found it first 87.1% of the time.

## What it does not do

- **English in the middle of Indian text**, except in Hindi with
  `textMixed` (below). About 8% of the words of romanized Hinglish are
  English. `word` and `text` write every word they are given in the Indian
  script.
- **Rare words out of context** are 10 points behind IndicXlit.
- **Santali** has names only; **Bodo** and **Dogri** have words only.

## English in Hindi text

`textMixed` (Go `TextMixed`) is `text` with one change: a word on the
language's English list stays as typed. `isEnglish` (Go `English`) asks the
list about one word. Only Hindi has a list; for another language nothing is
English and `textMixed` equals `text`. In the browser, load the list with
`load("hi", "words", { english: true })`: 27 KB gzipped, fetched only then.

```ts
const hi = await load("hi", "words", { english: true });
hi.text("mera office band hai");       // "मेरा ऑफिस बंद है"
hi.textMixed("mera office band hai");  // "मेरा office बंद है"
```

**How the list is made.** The 10,000 most frequent words of English
Wikipedia, less every word that a typist of Hindi writes often: the 50,000
most frequent Hindi words, each romanized by `romanize`, give how often a
Latin spelling stands for a Hindi word ("main" for मैं, "the" for थे), and a
word stays on the list only if it is at least twice as frequent in English.
Without that filter a list this size calls a third of the Hindi words
English.

**How good it is.** On L3Cube-HingLID (Hinglish tweets with each word tagged
Hindi or English; its test split, read once, 191,535 words), word by word:

| | Right | Hindi called English | English found | Size |
|---|---|---|---|---|
| none (every word Hindi) | 71.4% | 0 | 0 | — |
| `textMixed`'s list | **87.4%** | **2.4%** | **62.0%** | 27 KB |
| IndicLID, roman model | 72.1% | 4.6% | 14.0% | 282 MB |

IndicLID judges sentences; one word at a time it does little better than
calling every word Hindi. The list size and the filter's factor were chosen
on HingLID's validation split; no HingLID word is in the list (its licence
allows measurement only).

**What it gets wrong.** Chat spellings of frequent Hindi words that are also
English words stay in Latin: "to" (तो), "he" (है), "ap" (आप), "maine" (मैंने),
"per" (पर). English words that Hindi writes in its own script are not on the
list, so they are written in Devanagari: "video" → वीडियो, as a Hindi writer
would. HingLID itself tags some Hindi shorthand as English ("h" for है, "kr"
for कर), so part of the 38% of English words not found is the key's error.

## Size

A page loads three files for one language: its script group's model, its
own model, and its word list. Brotli-compressed: Hindi 1.97 MB, Urdu 1.35 MB,
Tamil 2.57 MB, Malayalam 3.13 MB. The npm package carries no tables:
`load()` reads them beside the module, else from jsDelivr at the package's
version. In Go, import the languages you need; a program carries only
their files. The browser file is 21 KB gzipped: it holds `normalize`, which
the re-rank uses to look words up.
