// Properties that strings alone can check (MAINTAINING.md, step 14), on
// seeded random strings from the Indic blocks, invisible characters, Latin
// and combining marks; from the release job's code floor. PROPERTY_N sets
// the number of strings (default 20,000); PROPERTY_SEED the seed. Two
// promises hold only in a scope; regression.test.ts pins the edge of each.
import { expect, test } from "bun:test";
import { fold, normalize } from "./normalize";
import { keys, match, MAX_NAME_KEYS, nameKeys } from "./phonetic";
import { codePointBounds, count, segment } from "./segment";
import { stem } from "./stem";

const N = Number(process.env.PROPERTY_N ?? 20_000);
const SEED = Number(process.env.PROPERTY_SEED ?? 1);

// The same pool as the Go fuzz targets (property_test.go).
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
const LANGS = [undefined, "hi", "as", "bn", "ta", "ml", "kn", "pa", "ur", "mr", "te", "gu", "ne", "sa"];

function rng(seed: number) { // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function* strings(seed: number): Generator<[string, string | undefined]> {
  const r = rng(seed);
  for (let i = 0; i < N; i++) {
    const n = 1 + Math.floor(r() * 12);
    let s = "";
    for (let j = 0; j < n; j++) s += String.fromCodePoint(POOL[Math.floor(r() * POOL.length)]);
    yield [s, LANGS[Math.floor(r() * LANGS.length)]];
  }
}
// every class after the search key's class map, or a number (rules 2026-10-06.1)
const ALPHABET = /^([acehiklnoprtuy]+|[0-9]+)$/;
const INVISIBLE = /[\u200c\u200d\u200b\u2060\ufeff\u00ad]/gu;
const invisibles = (s: string) => (s.match(INVISIBLE) ?? []).length;

function failures(check: (s: string, lang?: string) => string | undefined, seed: number): string[] {
  const bad: string[] = [];
  for (const [s, lang] of strings(seed)) {
    const why = check(s, lang);
    if (why && bad.length < 5) bad.push(`${JSON.stringify(s)} (${lang}): ${why}`);
  }
  return bad;
}

test("normalize and fold: twice gives what once gives", () => {
  expect(failures((s, lang) => {
    const n = normalize(s, lang), f = fold(s, lang);
    if (n !== n.normalize("NFC")) return "normalize output is not NFC";
    if (invisibles(s) > 8) return; // the promise: at most 8 invisible characters
    if (normalize(n, lang) !== n) return `normalize ${JSON.stringify(n)} -> ${JSON.stringify(normalize(n, lang))}`;
    if (fold(f, lang) !== f) return `fold ${JSON.stringify(f)} -> ${JSON.stringify(fold(f, lang))}`;
  }, SEED)).toEqual([]);
}, 120_000);

test("segment: the pieces join to the text; bounds strictly inside", () => {
  expect(failures((s) => {
    const segs = segment(s), b = codePointBounds(s), n = Array.from(s).length;
    if (segs.join("") !== s) return "pieces do not join";
    if (count(s) !== segs.length) return "count != pieces";
    if (s && b.length + 1 !== segs.length) return "bounds + 1 != pieces";
    if (b.some((x, i) => x <= 0 || x >= n || (i > 0 && x <= b[i - 1]))) return `bounds ${b}`;
  }, SEED + 1)).toEqual([]);
}, 120_000);

test("phonetic: classes only; match symmetric; NFD = NFC; normalize first changes no key", () => {
  let prev = "";
  expect(failures((s, lang) => {
    const ks = keys(s);
    if (!ks.every((k) => ALPHABET.test(k))) return `keys ${ks}`;
    if (match(s, prev) !== match(prev, s)) return `match not symmetric with ${JSON.stringify(prev)}`;
    prev = s;
    if (keys(s.normalize("NFD")).join(" ") !== keys(s.normalize("NFC")).join(" ")) return "keys(NFD) != keys(NFC)";
    const kn = keys(normalize(s, lang)).join(" ");
    if (invisibles(s) === 0 && kn !== ks.join(" ")) // the promise: no invisible character return `keys(normalize) [${kn}] != keys [${ks.join(" ")}]`;
    if (nameKeys(s).length > MAX_NAME_KEYS) return "nameKeys over the cap";
  }, SEED + 2)).toEqual([]);
}, 120_000);

test("stem: a prefix of the word (twice is not promised: README, 'Do not stem a stem')", () => {
  expect(failures((s, lang) => {
    const st = stem(s, lang ?? "");
    if (!s.startsWith(st)) return `stem ${JSON.stringify(st)}`;
  }, SEED + 3)).toEqual([]);
});
