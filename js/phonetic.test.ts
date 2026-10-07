import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { keys, match, nameKeys, RULES_VERSION } from "./phonetic";

// phonetic/testdata/conformance.jsonl.gz holds every word of the evaluation
// data with the keys the Python reference gave it. The Go package reads the
// same file; both must agree with it on every word.
test("every word gives the reference keys", () => {
  const file = new URL("../phonetic/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [word, want] = JSON.parse(line) as [string, string[]];
    n++;
    const got = keys(word).join(" ");
    if (got !== [...want].sort().join(" ")) wrong.push(`${word}: ${got} ≠ ${want.join(" ")}`);
  }
  expect(n).toBeGreaterThan(190_000);
  expect(wrong.slice(0, 10)).toEqual([]);
});

test("match", () => {
  const cases: [string, string, boolean][] = [
    ["राम", "ರಾಮ", true],
    ["Ram", "राम", true],
    ["मोहनलाल", "മോഹൻലാൽ", true],
    ["सुरेश", "சுரேஷ்", true],
    ["Parvez Khan", "پرویز خان", true],
    ["Imran", "عمران", false], // known miss: ع is read as a, "Imran" starts with i
    ["Rāma", "राम", true], // accents are removed
    ["राम", "काम", false], // Rām is not kām
    ["Ram Singh", "राम", false], // word counts differ
    ["Block 1", "Block 2", false], // a number is keyed by its value
    ["Block 12", "ब्लॉक १२", true], // in any script
    ["1", "2", false],
  ];
  for (const [a, b, want] of cases) expect([a, b, match(a, b)]).toEqual([a, b, want]);
});

test("nameKeys meet across scripts; the rules are versioned", () => {
  const a = new Set(nameKeys("Shri Narendra Modi (politician)"));
  expect(nameKeys("श्री नरेंद्र मोदी").some((k) => a.has(k))).toBe(true);
  expect(nameKeys("Block 1")).toEqual(["plk 1"]);
  expect(keys("॰")).toEqual([]); // no letter, no digit: no key, not ""
  expect(RULES_VERSION).toBe("2026-10-06.1");
});
