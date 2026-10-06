# Designing an indickit utility

This file gives the principles that every utility in indickit obeys, and the
mistake that taught each one. `MAINTAINING.md` gives the steps. This file
gives the reasons for the steps, so that you can apply them to a case that
the steps do not name.

The principles come from two utilities: `phonetic` (a key that matches one
name across scripts) and `normalize` (one encoding for text that looks the
same). The research behind both is in `linguistic-utilities`, with every
number quoted here.

## Words this file uses

- **Answer key:** the list of "these two must match" (or "must not match")
  that a utility is scored against.
- **Oracle:** a program whose output stands in for the right answer. HarfBuzz
  is an oracle for "looks the same". libindic was an oracle for the key.
- **Rival:** the best tool a user can pick today.
- **DEV / TEST / FINAL:** three slices of the data. DEV chooses rules, TEST
  checks them, FINAL is read once, at release.
- **Held out:** anything that no rule was chosen on. Data slices, fonts and
  whole text sources can be held out.
- **Glyph run:** what HarfBuzz draws for a string in one font: which shapes,
  and where. Equal glyph runs mean that a reader cannot tell two strings apart.
- **Damage:** a change that a reader can see, made by a utility that promised
  none.

## 0. Prove the gap before you build

A utility earns its place with four measurements, made before any rule is
written. Each one can stop the work.

- **The problem occurs in real text.** Measure it in running text, by
  language. Before `normalize`: 0.24% of words held a hidden variant after
  NFC, and 16% of Malayalam sentences held one.
- **Our own utilities do not already solve it.** The phonetic key already
  gave one key to 90% of the look-alike groups. So `normalize` serves exact
  match (search indexes, duplicate removal), not name search.
- **The rival fails in a way that we can measure.** Indic NLP Library
  collapsed many look-alikes but damaged 0.69% of words.
- **Prior art is known, and we know if people can use it.** Google Nisaba
  had the same idea first. Its open-source build fails, so it is not usable.
  Our claim is then "usable and proven", not "new".

If a measurement shows that the gain is small, ship the work inside an
existing utility, or do not ship it.

## 1. Decide the layer first

Every change that a utility makes to text is one of three kinds. Decide the
kind before you write a rule, because each kind has a different promise and a
different answer key.

| Layer | Merges | Promise | Answer key | Utility |
|---|---|---|---|---|
| Canonical | strings that look the same | never changes what a reader sees | the glyph run | `normalize` |
| Text fold | accepted spellings of one word (हिन्दी / हिंदी) | output stays readable, with few wrong matches | spelling variants, and a budget of wrong hits | `fold()` in `normalize` |
| Phonetic | names that sound alike (राम / রাম) | finds the person | people in Wikidata | `phonetic` |

Store text only after the canonical layer. The text fold and the key lose
information on purpose, so they are for search and matching only. Apply them
to a query and to an index, never to stored text.

A rule that breaks its layer's promise belongs in a looser layer, or
nowhere. The Malayalam nta rule (ന്റ → ൻ്റ) passed in Noto, then changed 947
words in the three SMC fonts. It left the canonical layer and became a
candidate for the text fold.

Rules that merge *sounds* (short and long vowels, ट and त) belong only in the
phonetic layer. Vowel length changes meaning: दिन is "day", दीन is "poor". A
text fold that merges them sends a search for one to the other.

## 2. Answer keys

### No hand labels

Every answer key comes from data or from an oracle, never from a person who
labels pairs by hand. Hand labels do not scale to 22 languages, and they
carry the labeller's own spelling habits.

### An oracle can be wrong

Matching an oracle proves that you are the same as the oracle, not that you
are right. libindic's `compare` ignored the first letter, so राम matched काम.
Indic NLP Library deletes every joiner, so its output changes how 0.69% of
words look. Find where the oracle is wrong before you copy it, and exclude
those cases from the answer key.

### Choose an answer key that the rules cannot game

The glyph run is the strongest answer key we have, because no rule can
influence what HarfBuzz draws. Prefer an answer key that is independent of
the rules. A key that is derived from the same information as the rules
rewards the rules for repeating it.

### Check the answer key for the bias of the rule you climb

The text fold's first answer key paired spellings that share an English
romanization ("din", "kul"). English romanization loses vowel length,
retroflex consonants and sibilants. So the key rewarded text folds that erase
exactly those sounds, and it rarely counted their wrong merges. The climb
chose them. A held-out slice did not catch this, because the slice had the
same bias.

Before you climb, ask: which information does the answer key lose? Any rule
that erases the same information gets a reward it did not earn.

### Know how each source was processed

A source can hide a class of variants before we read it. MediaWiki applies
NFC when it saves a page, so NFC collapsed 0% of Wikipedia's look-alikes. Our
own name loader applied NFC too. Record each source's processing, and do not
measure a class of variants on a source that removed it.

### Read the actual words

Numbers hide what a rule merges. For each chosen rule, print the most
frequent pairs that it merges and that the answer key calls different. Then
read them.

This check found two wrong rules that every number had passed:

- ھ = ہ in Urdu merged بھاری "heavy" with بہاری "Bihari". ھ marks aspiration.
- A final virama outside Devanagari merged ராம (rāma) with ராம் (rām).

It also showed that the answer key itself was noisy in the other direction:
जरिए / ज़रिए is one word, but the key called it two.

A false-merge list shows only the pairs that the answer key holds. Also
apply each rule to the most frequent words of real text, and read what it
merges there. The Urdu rule "final ہ = ا" turns کہ "that" into کا "of", two
of the most frequent words of Urdu.

## 3. Measuring

### DEV chooses, TEST checks, FINAL is read once

Choose rules on DEV only. Read TEST once to check them. Read FINAL once, at
release. `linguistic-utilities/eval/once.py` records every read of a
held-out slice in `eval/reads/` there.
A second read must be asked for, and its log line says why.

When a held-out read finds a fault and you correct it, the corrected number
is no longer held out. Write that in the log. The normalizer's held-out fonts
were read twice: once to find the nta damage, once to confirm the correction.

### Keep held-out reserves

One held-out read finds faults. After you correct them, the same set is no
longer held out, so the correction needs a fresh one. Plan several reserves
before the work starts: more than one source, disjoint samples of each
source, and fonts that no step has used.

### Hold out more than data

A rule can fit the data, the fonts or the source that it was chosen on. Hold
out each of them:

- **Data:** DEV, TEST and FINAL, split by a hash of a stable id.
- **Fonts:** rules were chosen with Noto and Anek. 23 other fonts, among them
  Tiro and SMC's Rachana with many conjuncts, were held out. They found the
  nta damage.
- **Sources:** rules were chosen on PIB, Wikidata and Aksharantar.
  Wikipedia, typed by different people on different keyboards, was held out.
- **Planted variants:** for the canonical layer, put invisible changes into
  real words (a joiner at every position, an old chillu) and keep the ones
  that look the same. They found 368 damages that the corpus never showed.

### Measure the cost in the user's terms

Count wrong matches the way a user meets them. The first cost counted word
types, so दिन / दीन cost the same as two rare names. The current cost is
"wrong hits": of what one search finds in real text, the share that is a
different word, weighted by how often words occur.

Give the budget in the same terms: "at most 1% of a search's hits", not
"0.02 wrong neighbours per word".

The budget is a product choice: how many wrong results a user accepts. The
owner of the utility makes it, and the log records it. The text fold's budget is
the strict one, chosen by the owner.

### Give the rival its best chance

Score the rival on the same pairs, with its best options. Indic NLP has no
normalizer for Kashmiri or Sindhi. It got its Urdu normalizer for them, and
the log says that this routing causes most of its Arabic-script damage.
Compare at the same budget, not only at the same data.

### A claim carries its scope

Write every claim with the evidence that backs it. "Zero damage" was true on
DEV, on 894,417 planted variants and in 23 held-out fonts. On held-out
Wikipedia, 267 words (0.004%) changed. The claim is "0 damage on DEV, planted
variants and 23 fonts. 0.004% on held-out Wikipedia", never "zero damage".

### Report the number that hurts

When a correction costs points, report the cost. Removing the nta rule moved
the normalizer's robust collapse from 93.6% to 89.5% on DEV. The TEST number
that was read before the correction no longer describes the rules, and the
log says so.

## 4. Generalizing

A utility runs on text that we never saw. A rule that fits our data can
fail on that text. This section names the ways in which text differs from
ours, and the check that covers each way.

### Name the shifts

Text varies along five axes. For each axis, a utility needs a check, or a
written gap.

| Axis | How text differs | Check |
|---|---|---|
| Production | keyboard and input method, converters from legacy fonts, OCR, copy from PDF | a held-out source made another way (Wikipedia against PIB), and planted variants |
| Domain | names, ordinary words, running text | an answer key for each domain (Wikidata names, Aksharantar words, PIB and Wikipedia text) |
| Script and language | 12 scripts and 22 languages, and one script serves many languages | a score for each language, never only a mean |
| Rendering | fonts, and the text engine (HarfBuzz, DirectWrite, CoreText) | held-out fonts, and every context shaped |
| Time | new Unicode versions add letters | pinned Unicode data, and tables derived again for each version |

### Rules by class, not by example

A rule that names classes covers letters that our data does not contain.
The folds, of the key and of the text, name a letter by its place in the Unicode block, which is the same
in all nine Brahmic scripts. The joiner table names the classes of
`IndicSyllabicCategory.txt`, not single letters.

A class can hide a letter that acts differently. So the joiner table shapes
every consonant pair inside a class. If any pair acts differently, the
context is "mixed", and the rule keeps the conservative choice.

### Nothing is invisible by assumption

The joiner table was derived from the oracle, but two older rules were not:
"delete a zero-width space" and "one joiner where several stand together".
Both looked safe. On Wikipedia, both changed words: a zero-width space after
a Kannada virama blocks a conjunct, and two ZWJs draw differently from one.
Send every invisible character, and every repeated one, through the oracle.

### Test contexts wide enough

The effect of a character can reach past its neighbors. A ZWNJ before a
virama can block a conjunct with the next consonant (റഹ + ZWNJ + ്മാൻ). A context of
one character on each side missed this. Test at least one cluster on each
side, and check the width with planted variants in long words.

### Guard against overfitting

- **Few rules.** A climb stops when no rule adds 0.2 points. A rule that
  helps one rare case is not worth the risk that it carries.
- **No language pays for another.** The budget caps the mean and also each
  language (no language above 2 x the cap).
- **Too small to measure is not measured.** A cell with fewer than 100
  variant pairs is left out of the objective. Its number is reported, not
  climbed on.
- **Noise is named.** If a change moves a score by less than its noise
  (Tamil: ±2 points), the change is not a gain.

### Report the coverage, including the gaps

For each language, write which checks back its numbers. Write the gaps in
the README, beside the numbers. The gaps of the current utilities:

- Ol Chiki and Meetei Mayek have no open font beyond Noto. Their
  zero-damage claim rests on one font family.
- Only HarfBuzz was tested. Windows and Apple use their own text engines.
- Dogri and Bodo have no Wikidata names. The key is measured on their
  ordinary words only.
- For the seven largest Aksharantar languages (kn, ml, mr, ne, sa, ta,
  te), the text fold's answer key is a sample, so that the climb fits in memory.

A gap that is written down is a limit. A gap that is not written down is a
false claim.

### When Unicode changes

A new Unicode version can add letters, or move a letter to a new syllabic
class. Pin the version of every Unicode data file in the repo. When Go's
`x/text` or Node moves to a new version, derive the joiner table again, run
the conformance tests, and treat any changed output as a rules change.

## 5. Rules

### Damage first

A canonical rule never changes what a reader sees. One damaged word costs
more than one more collapsed group. When a rule cannot be made safe in every
font that we test, remove it. Do not narrow it until it passes one more test.

### Derive rules from the oracle, not from examples

The normalizer's first joiner rule was written by hand, from the standards
and from examples. It kept 253 joiner contexts that are invisible, and it
deleted joiners in 13 contexts where they are visible.

The current rule is a table. `linguistic-utilities/eval/joiner_table.py`
lists every context in
every script (the classes of the characters before and after the joiner,
from Unicode's `IndicSyllabicCategory.txt`). It shapes each context with and
without the joiner, for every consonant pair, and records the verdict:
invisible, visible, or mixed. The normalizer deletes a joiner only where the
table says "invisible".

When a rule is local, list every context and let the oracle decide each one.
A context that depends on the letters ("mixed") keeps the conservative
choice.

### No rule depends on one font, source or language

- **Font:** a rule passes only if it holds in every font family that we test.
- **Source:** a rule chosen on one source must hold on a held-out source.
- **Language:** when the same letters mean different things in two
  languages, the rule takes a language tag. Bengali র and Assamese ৰ look the
  same only as ra-phala. With `lang`, each language keeps its own ra.

### Standards are inputs, not verdicts

Unicode chapter 12 says to treat ന്റ and ൻ്റ as the same. The SMC fonts draw
them differently, so the normalizer does not merge them. Unicode's
`DoNotEmit.txt` lists 163 sequences in our scripts. 145 of them draw
differently, so they are text-fold candidates, not canonical rules. Its Tamil Shrii row
rewrites 4,735 words into a form that only 6 words use.

Take a rule from a standard only after the oracle and the data agree with it.

### Touch only what is ours

A joiner in an emoji (👨‍👩‍👧) and a zero-width space between Thai words are
not ours. Every rule acts only next to letters of our scripts. A fuzz test
makes sure that other text changes only by NFC.

### Rules are data

Every table and switch goes in a rules file that Go and TypeScript read. The
code only loops over it. Then the ports cannot drift, and a rules change is a
diff of one file.

### Applying the rules twice gives what applying them once gives

One rule's output can feed an earlier rule. Deleting a joiner can put two
other joiners side by side, and NFC can reorder marks around a joiner. The
normalizer applies its rules again until nothing changes. Most text settles
in one pass.

## 6. Engineering

### Promises become permanent tests

Write each promise that strings alone can check as a test that runs on every
change:

- Normalizing twice gives what normalizing once gives.
- Text with none of our letters changes only by NFC.
- Each case that the oracle decided gives its result (eyelash ra keeps its ZWJ).

The first run of these tests found two faults in rules that had passed every
measurement on real text.

Promises that need fonts (no damage, no broken text) run in the research
repo, where HarfBuzz is available.

### The conformance file is the contract

The research repo writes every input with its output from the Python
reference. Go and TypeScript must give that output for every input. This is
the only copy of "the right answer" that other people can see.

### Small, and only where it helps

Each utility is its own entry point, with its own size budget. A user who
needs `normalize` does not download the `phonetic` rules. When a measured
gain is modest, ship it inside an existing utility. The text fold beat the rival
by a few points, so it is a second function in `normalize`, not a third
utility.

### Cap the compute below what is free

A measurement that copies a large table into 32 workers ran this machine out
of memory and stopped the session. Size the number of workers to the free
memory, with a margin for other programs that can take memory back.

### Source code shows invisible characters as escapes

Write a ZWJ as `"\u200d"`, never as the character itself. A reviewer cannot
see an invisible character, and one editing tool wrote them into the
source three times.

## 7. Before a utility ships

Use this list with the steps in `MAINTAINING.md`.

1. Prove the gap: frequency, our own coverage, the rival, the prior art.
2. Name the layer: canonical, text fold or phonetic.
3. Name the answer key. Write which information it loses.
4. Find where the oracle is wrong. Remove those cases from the answer key.
5. Record how each source was processed.
6. Split the data, and set aside held-out reserves. Log each held-out slice in `linguistic-utilities/eval/reads/`.
7. Choose rules on DEV only.
8. For each chosen rule, read its most frequent wrong merges.
9. If a rule is local, derive it from every context with the oracle.
   Include every invisible character. Make each context one cluster wide.
10. Measure the cost in the user's terms, beside the rival at its best.
11. Name the five shifts. Give each one a check, or write it as a gap.
12. Read TEST once. Then read the held-out fonts and sources once.
13. If a held-out read finds a fault, correct it. Confirm it on a reserve.
14. Write the promises that strings can check as tests.
15. Export the rules file and the conformance file. Port to Go and TypeScript.
16. Read FINAL once. Put its numbers in the README, each with a test.
