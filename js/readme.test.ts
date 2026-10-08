import { expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { keys, match } from "./phonetic";
import { fold, normalize } from "./normalize";
import { count, segment } from "./segment";
import { stem } from "./stem";
import { load, type Mode } from "./romanize";

// romanize's tables, from disk, as load() fetches them beside the module
const disk = async (url: URL) => {
  const b = readFileSync(url);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const romanizer = (lang: string, mode: Mode = "words") => load(lang, mode, { fetch: disk });
const scriptLang = (w: string) => {
  const cp = w.codePointAt(0)!;
  return cp >= 0x0d00 ? "ml" : cp >= 0x0b80 ? "ta" : "hi"; // the picture's three scripts
};

// The README makes claims; these tests read the README itself, so an example
// that stops being true fails the build instead of misleading. Example
// strings are JS string literals, with invisible characters as escapes.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const readme = read("../README.md");

test("each line of the README's first picture is what its utility gives", async () => {
  const picture = readme.match(/```\n([\s\S]*?)```/)![1];
  const lines = picture.split("\n").filter((l) => l.includes("→"));
  expect(lines.map((l) => l.split(/\s+/)[0])).toEqual(["stem", "phonetic", "segment", "romanize"]);
  for (const line of lines) {
    const [left, right] = line.split("→").map((s) => s.trim());
    const [name, ...inputs] = left.split(/\s+/);
    for (const w of inputs) {
      if (name === "stem") expect([w, stem(w, "hi")]).toEqual([w, right]);
      if (name === "phonetic") expect([w, keys(w)]).toEqual([w, [right]]);
      if (name === "segment") expect([w, segment(w)]).toEqual([w, right.split(/\s+/)]);
      if (name === "romanize") expect([w, (await romanizer(scriptLang(w))).word(w, 1)]).toEqual([w, [right]]);
    }
  }
});

test("every match(...) example returns what its comment says", () => {
  const claims = [...readme.matchAll(/[Mm]atch\("([^"]+)", "([^"]+)"\);?\s*\/\/ (true|false)/g)];
  expect(claims.length).toBeGreaterThan(3);
  for (const [, a, b, want] of claims) expect([a, b, match(a, b)]).toEqual([a, b, want === "true"]);
});

test("the two-key example has two keys", () => {
  expect(readme).toContain("மோகன், Mohan, has two");
  expect(keys("மோகன்")).toHaveLength(2);
});

test("every normalize(...) and fold(...) example returns what its comment says", () => {
  const claims = [...readme.matchAll(/^(normalize|fold)\(("[^"]*"), "([a-z]+)"\); \/\/ ("[^"]*")/gm)];
  expect(claims.length).toBeGreaterThan(4);
  for (const [, fn, input, lang, want] of claims) {
    const got = (fn === "fold" ? fold : normalize)(JSON.parse(input), lang);
    expect([fn, input, got]).toEqual([fn, input, JSON.parse(want)]);
  }
});

test("every stem(normalize(...)) example returns what its comment says", () => {
  const claims = [...readme.matchAll(/^stem\(normalize\(("[^"]*"), "([a-z]+)"\), "\2"\); \/\/ ("[^"]*")/gm)];
  expect(claims.length).toBeGreaterThan(4);
  for (const [, input, lang, want] of claims) {
    expect([input, lang, stem(normalize(JSON.parse(input), lang), lang)]).toEqual([input, lang, JSON.parse(want)]);
  }
});

test("every segment(...) and count(...) example returns what its comment says", () => {
  const claims = [...readme.matchAll(/^segment\(("[^"]*")\); \/\/ (\[[^\]]*\])/gm)];
  expect(claims.length).toBeGreaterThan(2);
  for (const [, input, want] of claims) {
    expect([input, segment(JSON.parse(input))]).toEqual([input, JSON.parse(want)]);
  }
  const counts = [...readme.matchAll(/^count\(("[^"]*")\); \/\/ (\d+)/gm)];
  expect(counts.length).toBeGreaterThan(0);
  for (const [, input, want] of counts) expect(count(JSON.parse(input))).toBe(Number(want));
});

// "How good it is": one row per utility, with its browser file size and a
// link to its evidence. The size must hold for dist/, and docs/ must say the
// same size.
test("each browser file is as small as the README says, and docs/ agrees", () => {
  const rows = [...readme.matchAll(/^\| `(\w+)` \|.*\| (\d+) KB \| \[(docs\/\w+\.md)\]/gm)];
  expect(rows.map((r) => r[1]).sort()).toEqual(["normalize", "phonetic", "romanize", "segment", "stem"]);
  for (const [, name, kb, doc] of rows) {
    const gz = gzipSync(readFileSync(new URL(`../dist/${name}.js`, import.meta.url))).length;
    expect(gz).toBeLessThan((Number(kb) + 0.5) * 1024);
    expect(existsSync(new URL(`../${doc}`, import.meta.url))).toBe(true);
    expect(read(`../${doc}`).replace(/\s+/g, " ")).toContain(`The browser file is ${kb} KB gzipped`);
  }
});

// The README's summary quotes docs/; docs/ is checked against the research
// repo's results (linguistic-utilities tests/test_*_readme.py).
test("every number in the README's summary rows is in its docs file", () => {
  const rows = [...readme.matchAll(/^\| `(\w+)` \|(.*)\| \d+ KB \| \[(docs\/\w+\.md)\]/gm)];
  expect(rows).toHaveLength(5);
  for (const [, name, cells, doc] of rows) {
    const text = read(`../${doc}`).replace(/\s+/g, " ");
    const numbers = [...cells.matchAll(/\d+(?:\.\d+)?(?:–\d+)?(?:%| points)/g)].map((m) => m[0]);
    expect([name, numbers.length > 0]).toEqual([name, true]);
    for (const n of numbers) expect([name, n, text.includes(n)]).toEqual([name, n, true]);
  }
});

// A tag in the README that is not this version sends users to old files.
test("every version tag in the README is package.json's version", () => {
  const pkg = JSON.parse(read("../package.json"));
  const tags = [...readme.matchAll(/indickit[#@](v\d+\.\d+\.\d+)/g)].map((m) => m[1]);
  expect(tags.length).toBeGreaterThan(3);
  expect(new Set(tags)).toEqual(new Set([`v${pkg.version}`]));
});

test("every romanize example in the recipe returns what its comment says", async () => {
  const recipe = readme.slice(readme.indexOf("### Write it in Latin letters"), readme.indexOf("### The same in Go"));
  const tables: Record<string, Promise<Awaited<ReturnType<typeof romanizer>>>> = {
    hi: romanizer("hi"),
    ur: romanizer("ur", "names"),
  };
  const words = [...recipe.matchAll(/^(\w+)\.word\(("[^"]*"), (\d+)\);\s*\/\/ (\[[^\]]*\])/gm)];
  const texts = [...recipe.matchAll(/^(\w+)\.text\(("[^"]*")\);\s*\/\/ ("[^"]*")/gm)];
  expect(words.length + texts.length).toBeGreaterThan(2);
  for (const [, v, input, n, want] of words) {
    expect([v, input, (await tables[v]).word(JSON.parse(input), Number(n))]).toEqual([v, input, JSON.parse(want)]);
  }
  for (const [, v, input, want] of texts) {
    expect([v, input, (await tables[v]).text(JSON.parse(input))]).toEqual([v, input, JSON.parse(want)]);
  }
});
