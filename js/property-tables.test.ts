// The TypeScript side of property_tables_test.go: romanize, deromanize,
// wellformed and phonetic search on seeded random strings, the same checks
// as the Go fuzz targets, and no throw on any input. PROPERTY_N sets the
// number of strings (default 2,000: the decoders take about a millisecond a
// word); PROPERTY_SEED the seed. From the perf job (linguistic-utilities
// jobs/perf, phase 2).
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { load as loadDeromanizer } from "./deromanize";
import { loadSearch } from "./phonetic-search";
import { load as loadRomanizer } from "./romanize";
import { brokenAt, isWellFormed } from "./wellformed";

const N = Number(process.env.PROPERTY_N ?? 2_000);
const SEED = Number(process.env.PROPERTY_SEED ?? 1);

// The pool of property.test.ts (a copy: shared fixtures are not edited for one test).
const POOL: number[] = (() => {
  const p: number[] = [];
  const range = (lo: number, hi: number) => { for (let c = lo; c <= hi; c++) p.push(c); };
  range(0x0900, 0x0d7f); range(0x0600, 0x06ff); range(0xabc0, 0xabff); range(0x1c50, 0x1c7f); range(0x0300, 0x036f);
  for (const ch of "abcdefghijklmnopqrstuvwxyzAEIOUKRS -.'()") p.push(ch.codePointAt(0)!);
  for (let i = 0; i < 40; i++) {
    p.push(0x200c, 0x200d, 0x200b, 0x2060, 0xfeff, 0x00ad);
    p.push(0x094d, 0x09cd, 0x0a4d, 0x0acd, 0x0b4d, 0x0bcd, 0x0c4d, 0x0ccd, 0x0d4d);
  }
  return p;
})();
const LANGS = ["hi", "bn", "ta", "ur"];

function rng(seed: number) { // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function* strings(seed: number): Generator<[string, string]> {
  const r = rng(seed);
  for (let i = 0; i < N; i++) {
    const n = 1 + Math.floor(r() * 32);
    let s = "";
    for (let j = 0; j < n; j++) s += String.fromCodePoint(POOL[Math.floor(r() * POOL.length)]);
    yield [s, LANGS[Math.floor(r() * LANGS.length)]];
  }
}

const disk = async (url: URL) => {
  const b = readFileSync(url);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
// at most n, no two equal, each well-formed UTF-16; an empty spelling is allowed (the reference keeps one)
const spellingsFault = (got: string[], n: number) =>
  got.length > n ? `${got.length} spellings` :
  new Set(got).size !== got.length ? "a repeated spelling" :
  got.some((s) => !s.isWellFormed()) ? "a lone surrogate" : undefined;

test("romanize: at most 4 spellings, a-z only; text never throws", async () => {
  const rs = new Map<string, Awaited<ReturnType<typeof loadRomanizer>>>();
  for (const l of LANGS) for (const m of ["words", "names"] as const) rs.set(l + m, await loadRomanizer(l, m, { fetch: disk }));
  const bad: string[] = [];
  for (const [s, lang] of strings(SEED)) {
    for (const m of ["words", "names"]) {
      const r = rs.get(lang + m)!;
      const got = r.word(s);
      const why = spellingsFault(got, 4) ?? (got.some((w) => !/^[a-z]+$/.test(w)) ? `not a-z: ${got}` : undefined)
        ?? (r.text(s).isWellFormed() ? undefined : "text has a lone surrogate");
      if (why && bad.length < 5) bad.push(`${JSON.stringify(s)} ${lang} ${m}: ${why}`);
    }
  }
  expect(bad).toEqual([]);
}, 120_000);

test("deromanize: at most 4 spellings, no Latin letter kept; text never throws", async () => {
  const ds = new Map<string, Awaited<ReturnType<typeof loadDeromanizer>>>();
  for (const l of LANGS) for (const m of ["words", "names"] as const) ds.set(l + m, await loadDeromanizer(l, m, { fetch: disk }));
  const bad: string[] = [];
  for (const [s, lang] of strings(SEED + 1)) {
    for (const m of ["words", "names"]) {
      const d = ds.get(lang + m)!;
      const got = d.word(s);
      const why = spellingsFault(got, 4) ?? (got.some((w) => /[a-z]/.test(w)) ? `kept Latin: ${got}` : undefined)
        ?? (d.text(s).isWellFormed() ? undefined : "text has a lone surrogate");
      if (why && bad.length < 5) bad.push(`${JSON.stringify(s)} ${lang} ${m}: ${why}`);
    }
  }
  expect(bad).toEqual([]);
}, 120_000);

test("wellformed: isWellFormed is brokenAt < 0; brokenAt is -1 or a character's start", () => {
  const bad: string[] = [];
  for (const [s] of strings(SEED + 2)) {
    const i = brokenAt(s);
    const startsChar = i >= 0 && i < s.length && !(s.charCodeAt(i) >= 0xdc00 && s.charCodeAt(i) <= 0xdfff);
    if ((isWellFormed(s) !== i < 0 || (i !== -1 && !startsChar)) && bad.length < 5) bad.push(`${JSON.stringify(s)}: ${i}`);
  }
  expect(bad).toEqual([]);
});

test("phonetic search: one score per candidate, none below 0; hits in range, best first", async () => {
  const searches = new Map<string, Awaited<ReturnType<typeof loadSearch>>>();
  for (const l of LANGS) searches.set(l, await loadSearch(l, { fetcher: disk }));
  const bad: string[] = [];
  const all = [...strings(SEED + 3)];
  for (let k = 0; k + 2 < all.length; k += 3) {
    const [[q, lang], [a], [b]] = [all[k], all[k + 1], all[k + 2]];
    const cands = [a, b, q];
    const s = searches.get(lang)!;
    const scores = s.score(q, cands);
    const hits = s.index(cands, "text").search(q, 0);
    const why = scores.length !== 3 ? `${scores.length} scores` :
      scores.some((x) => !(x >= 0)) ? `scores ${scores}` :
      hits.some((h, j) => h.name < 0 || h.name > 2 || (j > 0 && hits[j - 1].score < h.score)) ? `hits ${JSON.stringify(hits)}` : undefined;
    if (why && bad.length < 5) bad.push(`${JSON.stringify(q)} in ${JSON.stringify(cands)} ${lang}: ${why}`);
  }
  expect(bad).toEqual([]);
}, 120_000);
