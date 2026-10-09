// Inside the blocks indickit has rules for, both ports read one pinned table
// of Unicode 15.0 data, internal/unidata/unicode15.json (js/unidata.ts;
// the Go side is internal/unidata, and ../unicode_test.go is the twin of
// this file). These tests pin the table to Python's unicodedata
// (testdata/unicode15.json, from linguistic-utilities
// jobs/release/measure/code_floor/unicode15.py), check the NFC algorithm
// against the engine where the two must agree, and show that the utilities
// read the table and not the engine.
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { inBlocks, isLetter, isMark, isMn, nfc, nfd, UNICODE_VERSION } from "./unidata";
import { keys } from "./phonetic";
import { load } from "./romanize";
import rules from "../romanize/rules.json" with { type: "json" };

const oracle = JSON.parse(readFileSync(new URL("../testdata/unicode15.json", import.meta.url), "utf8")) as
  { unicode: string; ranges: number[][]; mn: number[]; nfd: Record<string, number[]> };
const cps = (s: string) => Array.from(s, (x) => x.codePointAt(0)!);

test("the table is Python's Unicode 15.0 inside the blocks", () => {
  expect(oracle.unicode).toBe(UNICODE_VERSION);
  const mn = new Set(oracle.mn);
  const bad: string[] = [];
  let n = 0;
  for (const [lo, hi] of oracle.ranges) {
    for (let c = lo; c <= hi; c++) {
      if (!inBlocks(c)) continue;
      n++;
      if (isMn(c) !== mn.has(c)) bad.push(`Mn ${c.toString(16)}`);
      if (nfd(c).join() !== (oracle.nfd[c] ?? [c]).join()) bad.push(`NFD ${c.toString(16)}`);
    }
  }
  expect(bad).toEqual([]);
  expect(n).toBeGreaterThan(2000);
});

// Outside the table the engine answers, and the Latin blocks indickit reads
// are closed: every code point of U+0000–024F, U+0300–036F, U+1E00–1EFF and
// U+2000–206F is assigned, and Unicode's stability policy freezes the
// decomposition and the combining class of an assigned code point. So on
// these questions the engine is Unicode 15.0 whatever version it ships
// (node 24, bun 1.3: 17.0); this test says so against the Python oracle.
test("the engine agrees with 15.0 in the closed blocks outside the table", () => {
  const mn = new Set(oracle.mn);
  const bad: string[] = [];
  for (const [lo, hi] of oracle.ranges) {
    for (let c = lo; c <= hi; c++) {
      if (inBlocks(c)) continue;
      const s = String.fromCodePoint(c);
      if (/\p{Mn}/u.test(s) !== mn.has(c)) bad.push(`Mn ${c.toString(16)}`);
      if (cps(s.normalize("NFD")).join() !== (oracle.nfd[c] ?? [c]).join()) bad.push(`NFD ${c.toString(16)}`);
    }
  }
  expect(bad).toEqual([]);
});

// The questions romanize.text and phonetic-search ask about a letter fall
// inside the table: their script blocks lie in its ranges.
test("every script block of the utilities is in the table", () => {
  const blocks = [...Object.values(rules.groups).flat(), [0x0600, 0x06ff], [0x0750, 0x077f], [0x1c50, 0x1c7f], [0xabc0, 0xabff]];
  for (const [lo, hi] of blocks) for (let c = lo; c <= hi; c++) if (!inBlocks(c)) throw new Error(`U+${c.toString(16)} is outside the table`);
});

// Where the engine's data equals the table's (no NFC-relevant code point of
// the blocks changed between 15.0 and 17.0), nfc must give what the engine
// gives: in and out of the blocks, across their edges, and on long runs of
// marks. The fixed cases are those of ../internal/unorm/unorm_test.go.
test("nfc equals the engine's NFC", () => {
  const r = (s: string, n: number) => s.repeat(n);
  for (const s of [
    "क" + r("्", 31), "e" + r("́", 31), "a" + r("̖́", 20),
    "क़" + r("॒॑", 16) + "्", "tா᷆াཱུ̦֣̦ྂ",
    "ெ" + r("́", 35) + "ா", "ো", "", "राम", "क़", "ো", "Ráma",
    "ஸ்ரீ", "ന്‍", "क़́", "á़", "क्‍ष",
  ]) expect([s, nfc(s)]).toEqual([s, s.normalize("NFC")]);
  // Random strings: code points of the blocks, Latin, marks, a symbol, an emoji.
  const pool: number[] = [];
  for (let i = 0; i < oracle.ranges.length; i++) for (let c = oracle.ranges[i][0]; c <= oracle.ranges[i][1]; c++) pool.push(c);
  pool.push(0x20b9, 0x1f600, 0x3000, 0xac00, 0x1100, 0x1161);
  let seed = 7;
  const rnd = (n: number) => (seed = (seed * 48271) % 2147483647) % n;
  for (let i = 0; i < 20000; i++) {
    const len = 1 + rnd(8);
    const a: number[] = [];
    for (let k = 0; k < len; k++) a.push(pool[rnd(pool.length)]);
    const s = String.fromCodePoint(...a);
    if (nfc(s) !== s.normalize("NFC")) throw new Error(`nfc(${JSON.stringify(s)}) = ${JSON.stringify(nfc(s))}, engine ${JSON.stringify(s.normalize("NFC"))}`);
  }
  // 1 MB does not throw (a spread over it would).
  expect(nfc(r("राम ", 250_000)).length).toBe(1_000_000);
});

// The utilities read the table, not the engine. U+0C5C and U+0CDC are
// letters since Unicode 16.0 and unassigned in 15.0: on node 24 and bun 1.3
// (Unicode 17.0) the engine calls them letters, the table does not, so
// romanize.text ends a word at them where the engine would read one word.
test("the utilities read the table, not the engine", async () => {
  for (const c of [0x0c5c, 0x0cdc]) expect([c, isLetter(c), isMark(c)]).toEqual([c, false, false]);
  const disk = async (url: URL) => { const b = readFileSync(url); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
  const te = await load("te", "words", { fetch: disk });
  const w = te.text("రామ");
  expect(te.text("రామ౜రామ")).toBe(w + "౜" + w);
  // The phonetic key strips a Devanagari Mn from a Latin word through the table.
  expect(keys("Ram्")).toEqual(keys("Ram"));
});
