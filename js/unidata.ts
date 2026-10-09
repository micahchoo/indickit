/**
 * The Unicode data indickit reads inside the blocks it has rules for (Arabic,
 * Devanagari to Malayalam, Ol Chiki, Vedic, Devanagari Extended, Meetei
 * Mayek): one pinned table, internal/unidata/unicode15.json, which the Go
 * package internal/unidata also reads. So Go and TypeScript give one answer
 * whatever Unicode version the engine ships, and a move to a new Unicode
 * version is a change to the table: a rules change, with a conformance run
 * (MAINTAINING.md, "Upkeep").
 *
 * Outside the blocks the engine answers (`\p{..}`, `String.prototype.normalize`).
 * The Latin blocks indickit also reads are closed (every code point is
 * assigned), and Unicode's stability policy freezes the decomposition and
 * combining class of an assigned code point, so the engine cannot drift there.
 *
 * @module
 */

import table from "../internal/unidata/unicode15.json" with { type: "json" };

/** The Unicode version of the table. */
export const UNICODE_VERSION: string = table.unicode;

const MN = 1, M = 2, L = 4, SECOND = 8; // flags; the combining class sits above them

// Every code point of the blocks: flags | ccc << 4. Absent = outside the blocks.
const prop = new Map<number, number>();
const decomp = new Map<number, number[]>();
const pairs = new Map<number, number>(); // a * 0x110000 + b -> composite

for (let i = 0; i < table.ranges.length; i += 2) for (let c = table.ranges[i]; c <= table.ranges[i + 1]; c++) prop.set(c, 0);
const set = (flat: number[], f: number) => {
  for (let i = 0; i < flat.length; i += 2) for (let c = flat[i]; c <= flat[i + 1]; c++) prop.set(c, prop.get(c)! | f);
};
set(table.mn, MN);
set(table.m, M);
set(table.l, L);
for (let i = 0; i < table.ccc.length; i += 3) {
  for (let c = table.ccc[i]; c <= table.ccc[i + 1]; c++) prop.set(c, prop.get(c)! | (table.ccc[i + 2] << 4));
}
const excl = new Set(table.excl);
for (const [k, d] of Object.entries(table.decomp)) {
  const c = Number(k);
  decomp.set(c, d);
  if (d.length === 2 && !excl.has(c)) {
    pairs.set(d[0] * 0x110000 + d[1], c);
    prop.set(d[1], prop.get(d[1])! | SECOND);
  }
}

/** Whether the table answers for this code point. */
export const inBlocks = (cp: number): boolean => prop.has(cp);

const ch = (cp: number) => String.fromCodePoint(cp);

// cps[i..j) as a string, in pieces: a spread over 1 MB of text throws RangeError.
function str(cps: number[], i: number, j: number): string {
  let out = "";
  for (let k = i; k < j; k += 8192) out += String.fromCodePoint(...cps.slice(k, Math.min(j, k + 8192)));
  return out;
}

/** General_Category Mn. */
export function isMn(cp: number): boolean {
  const p = prop.get(cp);
  return p === undefined ? /\p{Mn}/u.test(ch(cp)) : (p & MN) !== 0;
}

/** General_Category Mn, Mc or Me. */
export function isMark(cp: number): boolean {
  const p = prop.get(cp);
  return p === undefined ? /\p{M}/u.test(ch(cp)) : (p & M) !== 0;
}

/** General_Category L. */
export function isLetter(cp: number): boolean {
  const p = prop.get(cp);
  return p === undefined ? /\p{L}/u.test(ch(cp)) : (p & L) !== 0;
}

/** The full canonical decomposition of one code point. */
export function nfd(cp: number): number[] {
  if (!prop.has(cp)) return Array.from(ch(cp).normalize("NFD"), (x) => x.codePointAt(0)!);
  const d = decomp.get(cp);
  return d ? d.flatMap(nfd) : [cp];
}

// A starter of the blocks that does not decompose and is the second of no
// composite: NFC can split a string before it (UAX #15, "stable code points").
const stable = (p: number, cp: number) => p >> 4 === 0 && (p & SECOND) === 0 && !decomp.has(cp);

/**
 * Unicode NFC. The string is cut before each stable code point of the
 * blocks. A piece made only of code points of the blocks is composed from
 * the table; a piece holding any other code point goes to the engine, whose
 * data for the blocks' assigned code points equals the table's (stability
 * policy), and which alone knows the combining classes outside the blocks.
 */
export function nfc(s: string): string {
  const cps = Array.from(s, (x) => x.codePointAt(0)!);
  let out = "";
  for (let i = 0; i < cps.length; ) {
    let j = i + 1;
    let pure = prop.has(cps[i]);
    for (; j < cps.length; j++) {
      const p = prop.get(cps[j]);
      if (p === undefined) pure = false;
      else if (stable(p, cps[j])) break;
    }
    out += pure ? compose(cps, i, j) : str(cps, i, j).normalize("NFC");
    i = j;
  }
  return out;
}

// The canonical algorithm on cps[i..j), every code point in the blocks:
// decompose, order the marks by class, compose (UAX #15).
function compose(cps: number[], i: number, j: number): string {
  // Quick check: nothing decomposes, nothing is a second, marks in order.
  let last = 0, normal = true;
  for (let k = i; k < j && normal; k++) {
    const p = prop.get(cps[k])!, c = p >> 4;
    if (decomp.has(cps[k]) || (p & SECOND) !== 0 || (c !== 0 && c < last)) normal = false;
    last = c;
  }
  if (normal) return str(cps, i, j);
  const d: number[] = [];
  for (let k = i; k < j; k++) d.push(...nfd(cps[k]));
  const ccc = (cp: number) => prop.get(cp)! >> 4;
  for (let a = 0; a < d.length; ) {
    if (ccc(d[a]) === 0) { a++; continue; }
    let b = a;
    while (b < d.length && ccc(d[b]) !== 0) b++;
    const run = d.slice(a, b).sort((x, y) => ccc(x) - ccc(y)); // Array.prototype.sort is stable (ES2019)
    for (let n = 0; n < run.length; n++) d[a + n] = run[n];
    a = b;
  }
  const out: number[] = [];
  let starter = -1;
  for (const c of d) {
    const cc = ccc(c);
    if (starter >= 0 && (out.length - 1 === starter || ccc(out[out.length - 1]) < cc)) {
      const p = pairs.get(out[starter] * 0x110000 + c);
      if (p !== undefined) { out[starter] = p; continue; }
    }
    if (cc === 0) starter = out.length;
    out.push(c);
  }
  return str(out, 0, out.length);
}
