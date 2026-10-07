// Regression tests for the code-floor findings of the release job
// (linguistic-utilities jobs/release/reports/02-battletest-code-floor.md; the
// fixes: 03-code-floor-fixes.md). The same cases as ../regression_test.go.
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fold, normalize } from "./normalize";
import { keys, match, MAX_NAME_KEYS, nameKeys, words } from "./phonetic";
import { stem } from "./stem";

// Finding 1: words split on the reference's spaces (Python \s), and on
// nothing else: JavaScript's \s also holds U+FEFF.
test("words split like the reference, for every code point", () => {
  const seps = new Set<number>(JSON.parse(readFileSync(new URL("../phonetic/testdata/separators.json", import.meta.url), "utf8")));
  const bad: string[] = [];
  for (let c = 0; c <= 0x10ffff; c++) {
    if ((c >= 0xd800 && c <= 0xdfff) || c === 0x28 || c === 0x29) continue;
    const n = words("क" + String.fromCodePoint(c) + "ख").length;
    if (n !== (seps.has(c) ? 2 : 1) && bad.length < 5) bad.push(c.toString(16));
  }
  expect(bad).toEqual([]);
  expect(words("\ufeffर\u093eम")).toEqual(["\ufeffर\u093eम"]);
  expect(match("र\u093eम\u00a0स\u093f\u0902ह", "र\u093eम स\u093f\u0902ह")).toBe(true);
}, 60_000);

// Finding 2: normalize and fold took one argument per code point, and threw
// RangeError above about 125,000 code points in node.
test("normalize and fold take 1 MB of text", () => {
  const s = "अ\u0902शग\u094dरहण ".repeat(120_000);
  expect(normalize(s)).toBe(s);
  expect(fold(s).length).toBeGreaterThan(900_000);
});

// Finding 3: nameKeys builds each result once.
test("nameKeys of 60 KB is fast and capped", () => {
  const t = performance.now();
  expect(nameKeys("க\u0bbe ".repeat(20_000))).toHaveLength(MAX_NAME_KEYS);
  expect(performance.now() - t).toBeLessThan(2000);
});

// Finding 4: NFC inserts nothing after 30 marks (Go now agrees).
test("no grapheme joiner after 31 viramas", () => {
  const s = "क" + "\u094d".repeat(31);
  expect(normalize(s, "hi")).toBe(s);
});

// Finding 6, first promise, in its scope: twice = once for text with at most
// 8 invisible characters; 9 BOMs before ૰ is the edge (normalize/rules.json
// max_passes 8).
test("normalize twice = once, up to 8 invisible characters", () => {
  for (const inv of ["\ufeff", "\u2060", "\u200b", "\u200c", "\u200d", "\u00ad"]) {
    for (let n = 1; n <= 8; n++) {
      const once = normalize(inv.repeat(n) + "૰");
      expect([inv, n, normalize(once)]).toEqual([inv, n, once]);
    }
  }
  const once = normalize("\ufeff".repeat(9) + "૰");
  expect(normalize(once)).not.toBe(once); // when this fails, widen the promise in the README
});

// Finding 6, second promise, in its scope: normalize changes no key of a word
// with no invisible character. The known cases outside it are pinned.
test("keys(normalize(x)) = keys(x) for a word with no invisible character", () => {
  for (const s of ["फ\u093c\u093eत\u093fम\u093e", "فاطمہ", "عمران", "Rāma", "১২"]) {
    expect([s, keys(normalize(s))]).toEqual([s, keys(s)]);
  }
  for (const s of ["فاطمہ\u200c", "\ufeffعمران", "\u0b01\u200c", "\u0ce2\u200cR"]) {
    expect([s, keys(normalize(s))]).not.toEqual([s, keys(s)]);
  }
});

// Finding 7: no letter and no number, no key.
test("no letter, no key", () => {
  expect(keys("!!!")).toEqual([]);
  expect(match("!", "?")).toBe(false);
  expect(match("Søren", "Bjørn")).toBe(false);
  expect(match("\ufeffRam", "\u200bSita")).toBe(false);
});

// Finding 8: a language tag counts only by its language.
test("language tags", () => {
  const w = "অ\u0982শগ\u09cdরহণ";
  const as = normalize(w, "as");
  expect(as).not.toBe(normalize(w));
  for (const tag of ["AS", "as-IN", "as_IN", "asm", "As-Beng-IN"]) expect([tag, normalize(w, tag)]).toEqual([tag, as]);
  const t = "ஆண\u0bcdட\u0bbfல\u0bcd";
  for (const tag of ["TA", "ta-IN", "tam", "ta_LK"]) expect([tag, stem(t, tag)]).toEqual([tag, stem(t, "ta")]);
  for (const tag of ["en", "xx", ""]) expect(stem(t, tag)).toBe(t);
});

// Finding 5 is a scope, not a fix: TypeScript reads the host's Unicode
// data (node 24: 17.0), Go reads 15.0. Inside the blocks indickit reads, the
// two agree: every code point's NFD and its Mn category, as of Unicode 15.0.
test("Unicode data agrees with 15.0 inside the blocks indickit reads", () => {
  const blocks = JSON.parse(readFileSync(new URL("../testdata/unicode15.json", import.meta.url), "utf8")) as
    { ranges: number[][]; mn: number[]; nfd: Record<string, number[]> };
  const mn = new Set(blocks.mn);
  const bad: string[] = [];
  for (const [lo, hi] of blocks.ranges) {
    for (let c = lo; c <= hi; c++) {
      const s = String.fromCodePoint(c);
      if (/\p{Mn}/u.test(s) !== mn.has(c)) bad.push(`Mn ${c.toString(16)}`);
      const want = blocks.nfd[c] ?? [c];
      if (Array.from(s.normalize("NFD"), (x) => x.codePointAt(0)).join() !== want.join()) bad.push(`NFD ${c.toString(16)}`);
    }
  }
  expect(bad).toEqual([]);
});
