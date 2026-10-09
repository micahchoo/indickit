import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { brokenAt, isWellFormed, RULES_VERSION } from "./wellformed";

// wellformed/testdata/conformance.jsonl.gz: [text, i] from the Python
// reference, i the code-point index of the first broken character or null.
// Clean and broken words of every script (corpus and PDF text layers),
// planted invisible characters and damage, whole sentences, Arabic and Ol
// Chiki runs. The Go package reads the same file.
test("every input gives the reference verdict", () => {
  const file = new URL("../wellformed/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0, broken = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [input, want] = JSON.parse(line) as [string, number | null];
    n++;
    if (want !== null) broken++;
    const at = brokenAt(input);
    const got = at < 0 ? null : Array.from(input.slice(0, at)).length; // UTF-16 index to code points
    if (got !== want || isWellFormed(input) !== (want === null)) wrong.push(`${JSON.stringify(input)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(30_000);
  expect(broken).toBeGreaterThan(6_000);
  expect(wrong.slice(0, 10)).toEqual([]);
}, 60_000);

test("a sign with no letter is broken", () => {
  expect(brokenAt("िहन्दी")).toBe(0); // a vowel sign at the start of a word
  expect(isWellFormed("िहन्दी")).toBe(false);
  expect(brokenAt("क्ि")).toBe(2); // a vowel sign after a virama
  expect(brokenAt("कंंं")).toBe(3); // a third anusvara
  expect(brokenAt("कि ि")).toBe(3); // the second word
});

test("whole words are whole", () => {
  expect(isWellFormed("हिन्दी")).toBe(true);
  expect(isWellFormed("प्राप्त")).toBe(true);
  expect(brokenAt("प्राप्त")).toBe(-1);
  expect(isWellFormed("क\u200dि")).toBe(true); // a ZWJ between a consonant and its vowel sign
  expect(isWellFormed("कि தமிழ்")).toBe(true);
  expect(isWellFormed("")).toBe(true);
  expect(isWellFormed("abc 123")).toBe(true); // not our scripts
});

test("the index is in UTF-16 units", () => {
  expect(brokenAt("\u{1f600}िह")).toBe(2); // an emoji is two units
});

test("Malayalam dot reph waits for a consonant", () => {
  expect(brokenAt("കൎ")).toBe(1);
  expect(isWellFormed("കൎക")).toBe(true);
});

test("Arabic and Ol Chiki runs are always whole", () => {
  expect(isWellFormed("ِا")).toBe(true);
  expect(isWellFormed("ᱥᱟᱱᱛᱟᱲᱤ")).toBe(true);
});

test("version", () => {
  expect(RULES_VERSION).toBe("2026-10-07");
});
