import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { LANGUAGES, RULES_VERSION, stem } from "./stem";

// stem/testdata/conformance.jsonl.gz: [lang, word, stem] from the Python
// reference (linguistic-utilities eval/stem.py): every distinct word of PIB
// and FLORES+ in each language, every ending alone and after a few letters,
// words of another language, and an unknown language. The Go package reads
// the same file.
test("every input gives the reference stem", () => {
  const file = new URL("../stem/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [lang, word, want] = JSON.parse(line) as [string, string, string];
    n++;
    const got = stem(word, lang);
    if (got !== want) wrong.push(`${lang} ${JSON.stringify(word)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(400_000);
  expect(wrong.slice(0, 10)).toEqual([]);
}, 120_000);

test("forms of one word meet", () => {
  expect(stem("ஆண்டில்", "ta")).toBe(stem("ஆண்டு", "ta"));
  expect(stem("ಪ್ರಧಾನಮಂತ್ರಿಯವರು", "kn")).toBe(stem("ಪ್ರಧಾನಮಂತ್ರಿ", "kn"));
});

test("outside the tables, the word comes back", () => {
  expect(stem("ஆண்டில்", "xx")).toBe("ஆண்டில்");
  expect(stem("क", "hi")).toBe("क");
  expect(stem("", "hi")).toBe("");
});

test("versions", () => {
  expect(LANGUAGES.length).toBe(22);
  expect(RULES_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

// stem/testdata/conformance-min4.jsonl.gz: [lang, word, stem at minStem 4],
// every tenth input of the main file, from the Python reference.
test("minStem 4 gives the reference stems", () => {
  const file = new URL("../stem/testdata/conformance-min4.jsonl.gz", import.meta.url);
  const wrong: string[] = [];
  let n = 0;
  for (const line of gunzipSync(readFileSync(file)).toString("utf8").split("\n")) {
    if (!line) continue;
    const [lang, word, want] = JSON.parse(line) as [string, string, string];
    n++;
    const got = stem(word, lang, { minStem: 4 });
    if (got !== want) wrong.push(`${lang} ${JSON.stringify(word)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(50_000);
  expect(wrong.slice(0, 10)).toEqual([]);
  expect(stem("करीना", "hi", {})).toBe(stem("करीना", "hi"));
  expect(() => stem("करीना", "hi", { minStem: 10 })).toThrow();
}, 120_000);
