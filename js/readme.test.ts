import { expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { keys, match } from "./phonetic";

// The README makes claims about keys; this test reads the README itself, so
// an example that stops being true fails the build instead of misleading.
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

test("every word in the README's key table has the key it shows", () => {
  const table = readme.match(/```\n([\s\S]*?)```/)![1];
  const lines = table.split("\n").filter((l) => l.includes("→"));
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    const [words, key] = line.split("→").map((s) => s.trim());
    for (const w of words.split(/\s+/)) expect([w, keys(w)]).toEqual([w, [key]]);
  }
});

test("every match(...) example in the README returns what its comment says", () => {
  const claims = [...readme.matchAll(/[Mm]atch\("([^"]+)", "([^"]+)"\);?\s*\/\/ (true|false)/g)];
  expect(claims.length).toBeGreaterThan(2);
  for (const [, a, b, want] of claims) expect([a, b, match(a, b)]).toEqual([a, b, want === "true"]);
});

test("the README's two-key example has two keys", () => {
  expect(readme).toContain("மோகன், Mohan, has two");
  expect(keys("மோகன்")).toHaveLength(2);
});

test("the browser file is as small as the README says (4 KB gzipped)", () => {
  expect(readme).toContain("4 KB gzipped");
  const gz = gzipSync(readFileSync(new URL("../dist/phonetic.js", import.meta.url))).length;
  expect(gz).toBeLessThan(4.5 * 1024);
});
