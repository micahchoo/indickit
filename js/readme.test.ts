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

// normalize: each example line `normalize("in", "lang"); // "out"` (or fold)
// must return what its comment says. The strings are JS string literals, with
// invisible characters written as escapes.
test("every normalize(...) and fold(...) example in the README returns what its comment says", async () => {
  const { normalize, fold } = await import("./normalize");
  const claims = [...readme.matchAll(/^(normalize|fold)\(("[^"]*"), "([a-z]+)"\); \/\/ ("[^"]*")/gm)];
  expect(claims.length).toBeGreaterThan(4);
  for (const [, fn, input, lang, want] of claims) {
    const got = (fn === "fold" ? fold : normalize)(JSON.parse(input), lang);
    expect([fn, input, got]).toEqual([fn, input, JSON.parse(want)]);
  }
});

test("dist/normalize.js is as small as the README says (13 KB gzipped)", () => {
  expect(readme).toContain("The browser file is 13 KB gzipped.");
  const gz = gzipSync(readFileSync(new URL("../dist/normalize.js", import.meta.url))).length;
  expect(gz).toBeLessThan(13.5 * 1024);
});

// segment: each example line `segment("in"); // [...]` and `count("in"); // n`
// must return what its comment says.
test("every segment(...) and count(...) example in the README returns what its comment says", async () => {
  const { segment, count } = await import("./segment");
  const claims = [...readme.matchAll(/^segment\(("[^"]*")\); \/\/ (\[[^\]]*\])/gm)];
  expect(claims.length).toBeGreaterThan(2);
  for (const [, input, want] of claims) {
    expect([input, segment(JSON.parse(input))]).toEqual([input, JSON.parse(want)]);
  }
  const counts = [...readme.matchAll(/^count\(("[^"]*")\); \/\/ (\d+)/gm)];
  expect(counts.length).toBeGreaterThan(0);
  for (const [, input, want] of counts) expect(count(JSON.parse(input))).toBe(Number(want));
});

test("dist/segment.js is as small as the README says (9 KB gzipped)", () => {
  expect(readme).toContain("The browser file is 9 KB gzipped.");
  const gz = gzipSync(readFileSync(new URL("../dist/segment.js", import.meta.url))).length;
  expect(gz).toBeLessThan(9.5 * 1024);
});

// A tag in the README that is not this version sends users to old files.
test("every version tag in the README is package.json's version", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const tags = [...readme.matchAll(/indickit[#@](v\d+\.\d+\.\d+)/g)].map((m) => m[1]);
  expect(tags.length).toBeGreaterThan(3);
  expect(new Set(tags)).toEqual(new Set([`v${pkg.version}`]));
});
