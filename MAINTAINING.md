# Maintaining indickit

This file says how indickit grows and how it stays correct. Read it before
you add a utility, change a rule, or cut a release. The rules here come
from building `phonetic`; each one is here because ignoring it caused a
real mistake. `DESIGN.md` gives the principles behind these rules, so
that you can apply them to a case that this file does not name.

## What indickit is

indickit is a set of **utilities**: small, exact functions for text in
Indian languages, each one shipped in Go and in TypeScript with the same
behavior. `phonetic` is the first. A utility belongs here only when all of
these are true:

- **It is exact.** The same input always gives the same output, on every
  platform, in both languages. A function that guesses (a language
  detector, a model) can come in only as a fixed data file with the same
  guarantees.
- **It is small.** No runtime dependencies in JavaScript. In Go, only the
  standard library and `golang.org/x/text`. Each browser file has a size
  budget, and a test enforces it.
- **It is measured.** Its README section gives numbers from data that the
  rules were never tuned on, beside the best existing alternative (the
  **rival**).
- **It fills a gap.** Something that already works well for all 22
  languages (digit conversion, transliteration) does not belong here.

## The shape of every utility

Every utility has the same five parts, all of them in this repo:

| Part | `phonetic` has | Job |
|---|---|---|
| Rules file | `phonetic/rules.json` | every table and switch; the code only loops over it |
| Go package | `phonetic/*.go` | reads the rules file through `go:embed` |
| TypeScript module | `js/phonetic.ts` → `dist/phonetic.js` | reads the same rules file at build time |
| Conformance file | `phonetic/testdata/conformance.jsonl.gz` | inputs with the outputs a reference implementation gave |
| README section | `## Use`, `## How good it is` | what it does, how well, where it fails |

The **conformance file** is the contract. Go and TypeScript must give its
output for every input in it, so they cannot drift apart. The reference
implementation that writes it is in the research repo
(`linguistic-utilities`), together with the data and the measurements.
That repo is not public. So the conformance file is the only copy of "the
right answer" that other people can see. Change it only through the
research repo, and say why in the commit.

## Adding a utility

Do these steps in order. Each step ends at a point you can check.

1. **Choose it, and prove the gap.** Each check below can stop the work,
   so do them in this order, cheapest first. Write each result in the
   candidate's **gap note** in `linguistic-utilities/opportunities.md`
   (the template is at the top of that file). `DESIGN.md` §0 gives the
   reasons.
   - **Demand.** Write the demand note first (`DESIGN.md`, "Name who needs
     it first"): who (a link), their default rival, what it costs them
     (measured), and the delivery path. With no named user, you can spike,
     but you cannot climb or read a held-out set.
   - **Fit.** It is an exact function (see "What indickit is"), and you
     can name its layer (`DESIGN.md` §1). If it must guess, stop.
   - **Rivals, run.** Install every tool that could do the job, and run it
     on a sample of each class of input that you hold: names, ordinary
     words, running text, each source. Reading a tool's README is not a
     run: a Kruti Dev converter already read Chanakya
     (`DESIGN.md`, "Run each rival on every class of input that you hold").
     A tool that does not install or build counts as absent; write why.
     Run the default rival too, on the named user's task: it decides.
   - **Frequency.** Count the problem in running text that people wrote
     (PIB, Wikipedia), for each language. A mean hides the language where
     the problem lives.
   - **Our coverage.** Run the shipped utilities on the same samples. If
     they solve most of it, ship the work inside one of them, or stop.

   Done when the note names its user, has a score for each rival and for
   the default rival, a frequency for each language, and its verdict is
   "build".
2. **Find the oracle, test it, and build the ceiling.** The **oracle** is
   the program whose output stands in for the right answer, with no hand
   labels (HarfBuzz for "looks the same"). An oracle can be wrong
   (libindic was):
   - Give it text whose answer you know before it measures text that you
     do not know, and keep that check as a test
     (`linguistic-utilities/tests/test_instrument.py`).
   - Write down the information it loses. A rule that erases the same
     information gets a reward it did not earn (`DESIGN.md`, "Check the
     answer key for the bias of the rule you climb").
   - Build the **ceiling**: the best result that any tool in the layer can
     reach, even one too slow to ship (`DESIGN.md`, "Aim at the ceiling,
     not only at the rival").
     If the rival is already near the ceiling, stop.

   Done when the note names the oracle, what it loses, and the rival and
   the ceiling for each language.
3. **Split the data before you look at it, and set reserves aside.** Use
   DEV to choose rules, TEST to check them, and FINAL to read **once**, at
   the end. Split by a hash of a stable id, as `lu/split.py#bucket` does. Set
   aside reserves too: a second source, disjoint samples of each source,
   and fonts that no step uses. One held-out read finds faults, and its
   correction needs a fresh set (`DESIGN.md`, "Keep held-out reserves").
   Done when the split is in code, the note lists the held-out sets, and
   `reads/` has a log for each.
4. **Build the reference in Python** in the research repo. Improve it on
   DEV only. Done when it beats the rival on TEST and the gain holds on
   real text (`DESIGN.md`, "Measure the gain on real text before you
   port"), or you write down why it does not.
5. **Export the rules file and the conformance file.** Done when both are
   in `<name>/` here.
6. **Port to Go and TypeScript.** Copy the shape of `phonetic`: one
   package directory, one `js/<name>.ts`, one `exports "./<name>"` entry in
   `package.json`, one more `bun build` in the `build` script, and one more
   file checked in `js/check-dist.mjs`. Done when both pass the
   conformance file on every input.
7. **Read FINAL and write the README section.** Every claim in it gets a
   test: a number must equal the research repo's `jobs/<name>/reports/final.md`, and every
   code example must run and give the result the README shows (see
   `js/readme.test.ts` and `phonetic/example_test.go`). Done when a false
   claim that you plant in the README makes a test fail.

A utility can use another one when its size budget allows. `phonetic`
keeps its own NFC and accent removal: calling `normalize` would put the
13 KB joiner tree into its 4 KB browser file.

## Changing rules

A **rules change** is any change that gives some input a different
output. Stored output then goes stale: a key that a user saved before the
change no longer equals one computed after it. So every rules change must:

- **bump the utility's rules version** (`RulesVersion` / `RULES_VERSION`),
  which users store beside their output so they know when to recompute;
- **write a new conformance file** from the research repo;
- **be measured on DEV and TEST only.** `phonetic`'s FINAL slice has
  already been read. A number from a second read is not a held-out number.
  To report a new held-out number, get new held-out data. For names, that
  means Wikidata people added after the last fetch, or a new dataset;
- **go in a minor release** before 1.0, and say in the release notes which
  inputs changed.

A change that keeps every output the same (a refactor, a speedup) needs
none of this. The conformance tests prove it is the same.

A bug report ("these two names should match") is DEV data. Add it to a
test as a fix or as a known miss, as the README does with Imran / عمران.
Do not change a rule for one report until the climb shows that the change
helps on DEV and keeps the wrong-match rate within budget.

## Testing

| Test | Catches | Where |
|---|---|---|
| Conformance | Go or TypeScript drifting from the reference | `phonetic_test.go`, `js/phonetic.test.ts` |
| Built file | a `dist/` file that is stale or broken in Node | CI: `git diff --exit-code dist/`, `js/check-dist.mjs` |
| README claims | a number, example, or size the code no longer backs | `js/readme.test.ts`, `phonetic/example_test.go` |
| Research | a refactor that changes outputs by accident | `linguistic-utilities`: `uv run pytest` |

Run all of CI locally before you push:

```sh
go vet ./... && go test ./... && bun test && bun run build \
  && git diff --exit-code dist/ && node js/check-dist.mjs
```

A test that fails is fixed in the code, or in the README claim that is
wrong. Never change a test only to make it pass.

## Releases

- **Users install from Git tags**, not from npm:
  `npm install github:micahchoo/indickit#v0.1.0`, and jsDelivr serves
  `dist/` at the same tag. So `dist/` is committed, and a tag is the
  release.
- **Tag only a commit that GitHub CI passed.** A tag that you checked only
  on your own machine is weaker. If GitHub Actions has an outage, wait.
- **Never move or delete a tag** after you push it. Someone's lockfile
  points at it. Fix forward with a new version.
- **Versions:** before 1.0, a rules change or a new utility is a minor
  version (0.2.0), and a fix that changes no output is a patch (0.1.1).
  One tag covers the whole repo. The Go module and `package.json` share
  the version.

## Upkeep

These change under the code without any commit here:

- **Unicode.** A new Unicode version can add letters to an Indian script.
  The rules map letters by their place in the script's block, so a new
  letter gets the class of its neighbor's place, which may be wrong. When
  Go's `x/text` or Node moves to a new Unicode version, check the new
  letters in the 0900–0D7F blocks and in Ol Chiki and Meetei Mayek.
- **Dependencies.** Keep `golang.org/x/text`, `typescript`, and Bun
  current. CI pins Node 22; move it when Node 22 leaves long-term support.
- **Bun is pinned** by `packageManager` in `package.json`, and CI reads it
  from there. A different Bun can write a different `dist/` from the same
  source (1.4 sorts the export list; 1.3 does not), and CI then fails at
  "dist/ is current". To upgrade Bun, change the pin, run `bun run build`,
  and commit the new `dist/` in the same commit.
- **Size.** Each utility has a gzip budget in its README test. Adding a
  utility must not grow the others' files, because each one is a separate
  `exports` entry.

## Known open problems

These are in `linguistic-utilities/STATUS.md` under "Open", with their
numbers: Bodo's typed spellings (63%, below the rival), Tamil (the weakest
language at 76%), and Dogri and Bodo, which have no test set of names.
Fix them through the research repo, as rules changes.
