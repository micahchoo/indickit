/**
 * The letters a reader sees: segment("ಲಕ್ಷ್ಮಿ") is ["ಲ", "ಕ್ಷ್ಮಿ"].
 *
 * Unicode's grapheme clusters (UAX #29) keep a conjunct whole only where the
 * script's virama is a conjunct linker: not in Kannada or Gurmukhi, so
 * Intl.Segmenter gives ಲ|ಕ್|ಷ್|ಮಿ. `segment` is the grapheme clusters of
 * Unicode 17.0, computed here (no platform Unicode version), then a few
 * joins after a virama, each measured: every consonant in Kannada, ਰ and ਹ in
 * Gurmukhi, য before া in Bengali (অ্যা), and Tamil ஸ்ரீ.
 *
 * @module
 */

import rulesJson from "../segment/rules.json" with { type: "json" };

type Rules = typeof rulesJson;

// Grapheme_Cluster_Break values, as small numbers.
const enum B {
  Other, CR, LF, Control, Extend, ZWJ, RI, Prepend, SpacingMark, L, V, T, LV, LVT, LV_LVT,
}
const BREAK: Record<string, B> = {
  CR: B.CR, LF: B.LF, Control: B.Control, Extend: B.Extend, ZWJ: B.ZWJ,
  Regional_Indicator: B.RI, Prepend: B.Prepend, SpacingMark: B.SpacingMark,
  L: B.L, V: B.V, T: B.T, LV: B.LV, LVT: B.LVT, LV_LVT: B.LV_LVT,
};
// Indic_Conjunct_Break values.
const enum C { None, Linker, Consonant, Extend }
const INCB: Record<string, C> = { Linker: C.Linker, Consonant: C.Consonant, Extend: C.Extend };

/** Sorted, non-overlapping [first, last] ranges, searched by halving. */
class Ranges {
  private first: Uint32Array;
  private last: Uint32Array;
  readonly value: Uint8Array;
  constructor(rows: (number | string)[][], val: (r: (number | string)[]) => number) {
    this.first = new Uint32Array(rows.map((r) => r[0] as number));
    this.last = new Uint32Array(rows.map((r) => r[1] as number));
    this.value = new Uint8Array(rows.map(val));
  }
  /** The value of the range holding cp, or 0. */
  get(cp: number): number {
    let lo = 0, hi = this.first.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cp < this.first[mid]) hi = mid - 1;
      else if (cp > this.last[mid]) lo = mid + 1;
      else return this.value[mid];
    }
    return 0;
  }
}

interface Join { consonants: string; sign: string; after: string }
interface Classes { letters: string; nuktas: string; signs: string }

function compile(rules: Rules) {
  const breaks = new Ranges(rules.grapheme_break, (r) => BREAK[r[2] as string]);
  const pict = new Ranges(rules.extended_pictographic, () => 1);
  const incb = new Ranges(rules.incb, (r) => INCB[r[2] as string]);
  const joins = new Map<number, Join[]>();
  for (const j of rules.joins) {
    const v = j.virama.codePointAt(0)!;
    joins.set(v, [...(joins.get(v) ?? []), j]);
  }
  const classes = new Map<number, Classes>(
    Object.entries(rules.classes).map(([v, k]) => [v.codePointAt(0)!, k as Classes]));
  const ZWJ = 0x200d;

  function breakOf(cp: number): B {
    const b = breaks.get(cp) as B;
    return b === B.LV_LVT ? ((cp - 0xac00) % 28 === 0 ? B.LV : B.LVT) : b;
  }

  /** UAX #29 boundaries between the code points (index i: before cps[i]). */
  function graphemeBounds(cps: number[]): number[] {
    const out: number[] = [];
    if (cps.length === 0) return out;
    let prev = breakOf(cps[0]);
    let ri = prev === B.RI ? 1 : 0;                  // regional indicators in a row
    let pictExt = pict.get(cps[0]) === 1;            // GB11: the text ends in ExtPict Extend*
    let zwjAfterPict = false;                        // GB11: ... then a ZWJ
    let conj = incb.get(cps[0]) === C.Consonant ? 1 : 0; // GB9c: 1 consonant, 2 + linker
    for (let i = 1; i < cps.length; i++) {
      const cp = cps[i];
      const cur = breakOf(cp);
      const isPict = pict.get(cp) === 1;
      const inc = incb.get(cp) as C;
      let brk: boolean;
      if (prev === B.CR && cur === B.LF) brk = false;                        // GB3
      else if (prev === B.Control || prev === B.CR || prev === B.LF) brk = true; // GB4
      else if (cur === B.Control || cur === B.CR || cur === B.LF) brk = true;    // GB5
      else if (prev === B.L && (cur === B.L || cur === B.V || cur === B.LV || cur === B.LVT)) brk = false; // GB6
      else if ((prev === B.LV || prev === B.V) && (cur === B.V || cur === B.T)) brk = false; // GB7
      else if ((prev === B.LVT || prev === B.T) && cur === B.T) brk = false;      // GB8
      else if (cur === B.Extend || cur === B.ZWJ) brk = false;                    // GB9
      else if (cur === B.SpacingMark) brk = false;                                // GB9a
      else if (prev === B.Prepend) brk = false;                                   // GB9b
      else if (conj === 2 && inc === C.Consonant) brk = false;                    // GB9c
      else if (zwjAfterPict && isPict) brk = false;                               // GB11
      else if (prev === B.RI && cur === B.RI) brk = ri % 2 === 0;                 // GB12, GB13
      else brk = true;                                                            // GB999
      if (brk) out.push(i);
      // the states after cps[i]
      ri = cur === B.RI ? (brk ? 1 : ri + 1) : 0;
      zwjAfterPict = cur === B.ZWJ && pictExt;
      pictExt = isPict || (cur === B.Extend && pictExt);
      if (inc === C.Consonant) conj = 1;
      else if (inc === C.Linker && conj > 0) conj = 2;
      else if (inc !== C.Extend) conj = 0;
      prev = cur;
    }
    return out;
  }

  /** Does a join remove the boundary before cps[i]? (segment.py#joined) */
  function joined(cps: number[], i: number): boolean {
    const v = cps[i - 1];
    const rs = joins.get(v);
    if (!rs || i < 2) return false;
    const k = classes.get(v)!;
    const has = (s: string, cp: number) => s.includes(String.fromCodePoint(cp));
    let x = i - 2;
    while (x > 0 && has(k.nuktas, cps[x])) x--;
    if (!has(k.letters, cps[x])) return false;
    let n = i + 1;
    while (n < cps.length && has(k.nuktas, cps[n])) n++;
    if (cps[n] === v && cps[n + 1] === ZWJ) return false;
    const sign = n < cps.length && has(k.signs, cps[n]) ? cps[n] : -1;
    return rs.some((r) => has(r.consonants, cps[i])
      && (!r.sign || r.sign.codePointAt(0) === sign)
      && (!r.after || has(r.after, cps[x])));
  }

  return function bounds(cps: number[]): number[] {
    return graphemeBounds(cps).filter((i) => !joined(cps, i));
  };
}

const bounds = compile(rulesJson);

/** The letters of text, in order; joined, they give text back. */
export function segment(text: string): string[] {
  const chars = Array.from(text);
  const cps = chars.map((c) => c.codePointAt(0)!);
  const cuts = [0, ...bounds(cps), chars.length];
  const out: string[] = [];
  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i] > cuts[i - 1]) out.push(chars.slice(cuts[i - 1], cuts[i]).join(""));
  }
  return out;
}

/** How many letters a reader sees in text. */
export function count(text: string): number {
  return segment(text).length;
}

/** Inner letter boundaries of text, as code-point offsets (for tests and tools). */
export function codePointBounds(text: string): number[] {
  return bounds(Array.from(text, (c) => c.codePointAt(0)!));
}

/** The rules version; stored letter counts go stale when it changes. */
export const RULES_VERSION: string = rulesJson.version;

/** The Unicode version of the grapheme-cluster data. */
export const UNICODE_VERSION: string = rulesJson.unicode;
