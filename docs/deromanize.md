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
In words mode the rule cost Tamil 2 points on development text, so since
rules 2026-10-12 it is on there only for the four languages where it gains
in their own data, each with a paired 95% interval above zero: Manipuri
(+1.6 points on development words), Kashmiri (+0.9), Sanskrit (+0.6, and
+1.0 on running text) and Sindhi (+0.7 on running text).

Since rules 2026-10-12, a spelling that a renderer would draw broken (a
dotted circle: two vowel signs, a sign after a virama, `wellformed`'s
check) or that holds punctuation (a danda or an Arabic comma that the model
learned inside a piece: अभवत्।) goes after every whole spelling, in both
modes; each group keeps its order. On development data it moved no
language down (61 language-and-set cells) and Nepali, Sanskrit and
Manipuri running text up by 0.8 to 2 points. The same release gives
Sanskrit a words model trained on all of Aksharantar's Sanskrit pairs, not
60,000 (+2.8 points on development words, +1.4 on running text).

Since rules 2026-10-12.1 every answer is normalized text: a spelling
`normalize` would rewrite is returned in its normalized form, and a duplicate
that results is dropped.

The held-out rows below were read with the rules named in each row; a
held-out set is read once (`MAINTAINING.md`, "Changing rules"), so the rows
of earlier rules are not read again.

There are two modes:

- **words**, for running text: trained on 60,000 human romanizations a
  language from Aksharantar and on IndicXlit's romanizations of the 30,000
  most frequent Wikipedia words of each language. This is the default.
- **names**, for fields that hold person names: a names model (the English
  labels of Indian people in Wikidata) and the words model, merged, and the
  people's name tokens added to the word list.

The tables are rules as data: the Go and TypeScript code is a short loop
over them, and both give the reference implementation's lists on every row
of the conformance file (3,119 rows).

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

Two more sets, held out and read once with rules 2026-10-12 (0.13.0), both
from Google's Dakshina, typed by its annotators in 11 languages:

| Held out, rules 2026-10-12 | deromanize | IndicXlit |
|---|---|---|
| Running text, Dakshina's typed Wikipedia sentences (test, 11 languages, 33,000 words) | 81.1 / 88.0 | 77.1 / 87.9 |
| Isolated words, Dakshina's test lexicons (11 languages, 76,043 typings) | 69.4 / 81.1 | 72.6 / 83.5 |

Neither tool trained on any word of the lexicons. On the sentences the first
answer is right for 81.1% of the words, against IndicXlit's 77.1% (80.8% on
development sentences with the same rules); on isolated words for 69.4%,
against 72.6%: 3.1 points behind, most in Malayalam and Tamil (5.3 and 5.4).

**The names key changed in 0.13.0.** Until 0.12.0, a typed name had one right
answer: the spelling in the person's Wikidata label. One name often has
several accepted spellings, so from 0.13.0 a typed name token accepts every
spelling that development people with the same English name token carry,
when it sounds the same (shares a phonetic key). The new key counts more
answers right for both tools. On the development names (19 languages),
rules 2026-10-12, the first answer and any of four:

| Development names, rules 2026-10-12 | deromanize | IndicXlit |
|---|---|---|
| one accepted spelling (the old key) | 69.2 / 84.2 | 66.2 / 81.7 |
| every attested spelling (the new key) | 74.5 / 86.1 | 71.4 / 84.5 |
| names neither tool trained on, old key | 44.4 / 69.5 | 48.4 / 72.7 |
| names neither tool trained on, new key | 52.3 / 73.5 | 54.6 / 76.2 |

The jump from 69.2% to 74.5% is the key, not the writer: IndicXlit moves as
much, from 66.2% to 71.4%. The held-out names rows above use the old key and rules 2026-10-08.

**The input method you can install today.** On the Hindi development
words, hindi-ime's offline dictionary (an input method for Linux) found the
right word first 58.8% of the time and had no word at all for 26.1%;
`deromanize` found it first 87.1% of the time.

## What it does not do

- **English in the middle of Indian text**, except in Hindi with
  `textMixed` (below). About 8% of the words of romanized Hinglish are
  English. `word` and `text` write every word they are given in the Indian
  script.
- **Rare words out of context** are 10 points behind IndicXlit (Aksharantar);
  on Dakshina's more common isolated words, 3.1 points.
- **Santali** has names only; **Bodo** and **Dogri** have words only.

## English in Hindi text

`textMixed` (Go `TextMixed`) is `text` with one change: a word on the
language's English list stays as typed. `isEnglish` (Go `English`) asks the
list about one word. Only Hindi has a list; for another language nothing is
English and `textMixed` equals `text`. In the browser, load the list with
`load("hi", "words", { english: true })`: 22 KB gzipped, fetched only then.

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
| `textMixed`'s list | **87.4%** | **2.4%** | **62.0%** | 22 KB |
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
their files. The browser file is 34 KB gzipped: it holds `normalize`, which
the re-rank uses to look words up, and since rules 2026-10-12 `wellformed`
(6 KB), which puts a broken spelling last.
