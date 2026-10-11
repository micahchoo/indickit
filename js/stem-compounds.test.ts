import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { compoundKey } from "./stem-compounds";

// stem/testdata/conformance-compounds-ml.jsonl.gz: [word, first member or
// null] for every Malayalam input of the main file, from the Python
// reference. The Go package reads the same file.
test("every Malayalam input gives the reference key", () => {
  const file = new URL("../stem/testdata/conformance-compounds-ml.jsonl.gz", import.meta.url);
  const wrong: string[] = [];
  let n = 0, keyed = 0;
  for (const line of gunzipSync(readFileSync(file)).toString("utf8").split("\n")) {
    if (!line) continue;
    const [word, want] = JSON.parse(line) as [string, string | null];
    n++;
    if (want !== null) keyed++;
    const got = compoundKey(word);
    if (got !== want) wrong.push(`${JSON.stringify(word)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(50_000);
  expect(keyed).toBeGreaterThan(5_000);
  expect(wrong.slice(0, 10)).toEqual([]);
});
