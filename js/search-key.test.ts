import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { searchKey } from "./search-key";

// stem/testdata/conformance-search-key.jsonl.gz: [lang, word, key], every
// tenth input of stem's file, from the Python reference. The Go package
// searchkey reads the same file.
test("every input gives the reference key", () => {
  const file = new URL("../stem/testdata/conformance-search-key.jsonl.gz", import.meta.url);
  const wrong: string[] = [];
  let n = 0;
  for (const line of gunzipSync(readFileSync(file)).toString("utf8").split("\n")) {
    if (!line) continue;
    const [lang, word, want] = JSON.parse(line) as [string, string, string];
    n++;
    const got = searchKey(word, lang);
    if (got !== want) wrong.push(`${lang} ${JSON.stringify(word)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(50_000);
  expect(wrong.slice(0, 10)).toEqual([]);
}, 120_000);

test("two spellings and two forms of one word meet", () => {
  expect(searchKey("हिन्दी", "hi")).toBe(searchKey("हिंदी", "hi"));
  expect(searchKey("किताबों", "hi")).toBe(searchKey("किताब", "hi"));
});
