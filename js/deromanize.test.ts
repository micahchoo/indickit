import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { clean, load, languages, type Deromanizer, type Mode } from "./deromanize";

// Files from disk, as load() would fetch them beside the module.
const disk = async (url: URL) => {
  const b = readFileSync(url);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const cache = new Map<string, Deromanizer>();
async function get(lang: string, mode: Mode): Promise<Deromanizer> {
  const k = `${lang}.${mode}`;
  if (!cache.has(k)) cache.set(k, await load(lang, mode, { fetch: disk }));
  return cache.get(k)!;
}

// First in the file: load() caches files for the module's life, and Sindhi is loaded nowhere else.
test("without the tables beside it, load() asks jsDelivr at this package's version", async () => {
  const { CDN } = await import("./deromanize");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  expect(CDN).toBe(`https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${pkg.version}/deromanize/lang/`);
  const real = globalThis.fetch;
  const asked: string[] = [];
  globalThis.fetch = (async (u: string | URL) => {
    const url = String(u);
    asked.push(url);
    if (!url.startsWith(CDN)) return new Response(null, { status: 404 }); // not beside the module
    return new Response(readFileSync(new URL(`../deromanize/lang/${url.slice(CDN.length)}`, import.meta.url)));
  }) as typeof fetch;
  try {
    const d = await load("sd"); // no other test loads Sindhi, so its own files are fetched here
    expect(d.word("sindh").length).toBeGreaterThan(0);
    // the script group's pooled file may already be cached by another test file in this
    // process (the README test loads Urdu); it is fetched once a page
    for (const f of ["sd/sd.words.bin", "sd/sd.list.bin"]) {
      const tries = asked.filter((u) => u.endsWith(`/${f}`));
      expect([f, tries.length]).toEqual([f, 2]);
      expect(tries[0].startsWith(CDN)).toBe(false);
      expect(tries[1]).toBe(`${CDN}${f}`);
    }
  } finally {
    globalThis.fetch = real;
  }
});

// deromanize/testdata/conformance.jsonl.gz: from the Python reference (linguistic-utilities
// jobs/deromanize/export.py --conformance); the same file the Go test reads.
test("every conformance row: the Python reference's lists", async () => {
  const rows = gunzipSync(readFileSync(new URL("../deromanize/testdata/conformance.jsonl.gz", import.meta.url)))
    .toString("utf8").trim().split("\n").map((l) => JSON.parse(l) as [Mode, string, string, string[]]);
  expect(rows.length).toBeGreaterThanOrEqual(2000);
  const bad: string[] = [];
  for (const [mode, lang, latin, want] of rows) {
    const got = (await get(lang, mode)).word(latin, 4);
    if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${mode} ${lang} ${latin}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
  }
  expect(bad.slice(0, 10)).toEqual([]);
}, 600_000);

test("word, text and the input rule", async () => {
  const hi = await get("hi", "words");
  expect(hi.word("namaste", 1)).toEqual(["नमस्ते"]);
  expect(hi.word("NAMASTE")).toEqual(hi.word("namaste"));
  expect(hi.word("1234")).toEqual([]);
  expect(clean("Rāma-2")).toBe("rama");
  expect(hi.text("namaste, duniya! 2026").endsWith("! 2026")).toBe(true);
  expect(hi.text("namaste, duniya! 2026")).not.toMatch(/[a-z]/);
  await expect(load("xx", "words", { fetch: disk })).rejects.toThrow();
  expect(languages("names")).toContain("sat");
  expect(languages("words")).not.toContain("sat");
  expect(languages("names").length).toBe(22);
});
