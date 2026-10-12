import { expect, test } from "bun:test";

// What one loaded language keeps on the heap, each in a fresh process (the
// modules cache pooled tables, so a load in this process could reuse one).
// A Map for each n-gram context made Hindi's deromanizer 130 MB and its
// romanizer 194 MB (perf job, phase 8); flat tables keep them near 35 and 30.
// The bounds leave room for the engine, not for that layout.
const probe = (which: string, lang: string, mode: string): number => {
  const src = `
    import { heapStats } from "bun:jsc";
    import { readFileSync } from "node:fs";
    const m = await import(${JSON.stringify(new URL(`./${which}.ts`, import.meta.url).href)});
    const disk = async (u) => { const b = readFileSync(u); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
    Bun.gc(true);
    const before = heapStats().heapSize;
    const x = await m.load(${JSON.stringify(lang)}, ${JSON.stringify(mode)}, { fetch: disk });
    Bun.gc(true);
    console.log(heapStats().heapSize - before, x.lang.length);
  `;
  const r = Bun.spawnSync([process.execPath, "-e", src]);
  if (r.exitCode !== 0) throw new Error(r.stderr.toString());
  return Number(r.stdout.toString().split(" ")[0]) / 2 ** 20;
};

test("a loaded Hindi deromanizer keeps under 60 MB of heap", () => {
  expect(probe("deromanize", "hi", "words")).toBeLessThan(60);
});

test("a loaded Hindi romanizer keeps under 50 MB of heap", () => {
  expect(probe("romanize", "hi", "words")).toBeLessThan(50);
});
