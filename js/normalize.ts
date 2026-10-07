/**
 * normalize: one encoding for text that looks the same. Two strings that a
 * reader cannot tell apart (an invisible joiner, an old Malayalam chillu, a
 * ज़ typed as one code point or two) get the same bytes; what a reader sees
 * never changes. Use it before you store, index or compare text.
 *
 * fold: normalize, then merge accepted spellings of one word (हिन्दी and
 * हिंदी, गाँव and गांव). Its output is still readable, but it loses
 * information on purpose: apply it to a query and to an index, never to
 * stored text.
 *
 * `lang` is a language tag ("as", "hi", "as-IN", "asm"); only its language
 * counts, not case, region or script. Assamese text needs it: after
 * a virama, Assamese ৰ and Bengali র look alike, and each language keeps its
 * own.
 *
 * The rules change between versions. Store RULES_VERSION next to output that
 * you keep, and recompute it when the version changes.
 *
 * @module
 */

import rulesJson from "../normalize/rules.json" with { type: "json" };
import { langCode } from "./lang";

type Rules = typeof rulesJson;
type Tree = number | [number, { [values: string]: Tree }];
type Node = number | { f: number; kids: Map<string, Node> };
// langs: the step runs only for these languages. before / after: a map step
// maps a character only where the next / previous character (of the step's
// input) is in one of the ranges.
type Context = { langs?: string[]; before?: number[][]; after?: number[][] };
type MapStep = Context & { step: "map"; map: { [from: string]: string } };
type AnusvaraStep = Context & { step: "anusvara"; blocks: number[]; virama: number; anusvara: number; rows: number[][] };

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const cp = (s: string) => s.codePointAt(0)!;
// String.fromCodePoint(...cps) passes one argument per code point, and a
// runtime throws RangeError above its argument limit (node: about 125,000).
function fromCodePoints(cps: number[]): string {
  let s = "";
  for (let i = 0; i < cps.length; i += 8192) s += String.fromCodePoint(...cps.slice(i, i + 8192));
  return s;
}

// The engine: every table and switch is in rules.json; this is only the loop.
function compile(r: Rules) {
  const invisible = new Map<number, string>();
  for (const [c, sym] of Object.entries(r.invisible)) invisible.set(cp(c), sym);
  const [LEFT, RIGHT] = r.width;
  const scripts = r.scripts.map(([, ranges], i) => [DIGITS[i], ranges] as [string, number[][]]);
  const classes = new Map<number, string>();
  for (const [lo, hi, k] of r.classes as [number, number, string][]) for (let o = lo; o <= hi; o++) classes.set(o, k);

  function scriptOf(c: number): string | undefined {
    for (const [d, ranges] of scripts) for (const [lo, hi] of ranges) if (c >= lo && c <= hi) return d;
    return undefined;
  }
  // a context symbol: an invisible character's letter, a class, "?" for one
  // of our characters with no class, undefined for any other character
  function sym(c: number): string | undefined {
    return invisible.get(c) ?? classes.get(c) ?? (scriptOf(c) !== undefined ? "?" : undefined);
  }

  // One key holds every value that leads to the same child.
  function node(t: Tree): Node {
    if (typeof t === "number") return t;
    const kids = new Map<string, Node>();
    for (const [values, child] of Object.entries(t[1])) {
      const n = node(child);
      for (const v of values) kids.set(v, n);
    }
    return { f: t[0], kids };
  }
  const tree = node(r.tree as Tree);

  // Rule 4: is invisible character c, between before and after, invisible
  // in its context? A context the tree does not hold keeps the character.
  function deletes(before: number[], c: number, after: number[]): boolean {
    const nearLeft = [...before].reverse().find((x) => !invisible.has(x));
    const nearRight = after.find((x) => !invisible.has(x));
    let script: string | undefined;
    for (const x of [nearLeft, nearRight]) if (x !== undefined && (script = scriptOf(x)) !== undefined) break;
    if (script === undefined) return false;
    const x: string[] = [script, invisible.get(c)!];
    const left: string[] = [];
    for (let i = before.length - 1; i >= 0; i--) {
      const s = sym(before[i]);
      if (s === undefined) break;
      left.push(s);
    }
    const right: string[] = [];
    for (const a of after) {
      const s = sym(a);
      if (s === undefined) break;
      right.push(s);
    }
    for (let i = 0; i < LEFT; i++) x.push(left[i] ?? "^");
    for (let i = 0; i < RIGHT; i++) x.push(right[i] ?? "$");
    let n = tree;
    while (typeof n !== "number") n = n.kids.get(x[n.f]) ?? 0;
    return n === 1;
  }

  const chillu = new Map<number, number>();
  for (const [from, to] of Object.entries(r.chillu.map)) chillu.set(cp(from), cp(to));
  const ch = { virama: cp(r.chillu.virama), joiner: cp(r.chillu.joiner), notBefore: cp(r.chillu.not_before) };
  const ra = { virama: cp(r.ra.virama), assamese: cp(r.ra.assamese), bengali: cp(r.ra.bengali) };
  const khanda = { from: Array.from(r.khanda_ta.from, cp), to: cp(r.khanda_ta.to), notBefore: r.khanda_ta.not_before };

  function onePass(text: string, lang: string | undefined): string {
    let s = Array.from(text.normalize("NFC"), cp);
    // rule 2: consonant + virama + ZWJ -> chillu, not after a virama, not before not_before
    let out: number[] = [];
    for (let i = 0; i < s.length; i++) {
      const to = chillu.get(s[i]);
      if (to !== undefined && (i === 0 || s[i - 1] !== ch.virama) && s[i + 1] === ch.virama
          && s[i + 2] === ch.joiner && s[i + 3] !== ch.notBefore) {
        out.push(to);
        i += 2;
      } else out.push(s[i]);
    }
    // rule 3: after a virama, the language's own ra; then khanda ta
    const [own, other] = r.ra.assamese_langs.includes(lang ?? "")
      ? [ra.assamese, ra.bengali] : [ra.bengali, ra.assamese];
    s = out;
    out = [];
    for (let i = 0; i < s.length; i++) {
      if (s[i] === ra.virama && s[i + 1] === other) {
        out.push(ra.virama, own);
        i++;
      } else out.push(s[i]);
    }
    s = out;
    out = [];
    const k = khanda.from.length;
    for (let i = 0; i < s.length; i++) {
      const next = s[i + k];
      if (khanda.from.every((c, j) => s[i + j] === c)
          && !(next !== undefined && khanda.notBefore.some(([lo, hi]) => next >= lo && next <= hi))) {
        out.push(khanda.to);
        i += k - 1;
      } else out.push(s[i]);
    }
    // rule 4: invisible characters, in the context of the output so far
    s = out;
    out = [];
    for (let i = 0; i < s.length; i++) {
      if (invisible.has(s[i]) && deletes(out.slice(-LEFT), s[i], s.slice(i + 1, i + 1 + RIGHT))) continue;
      out.push(s[i]);
    }
    return fromCodePoints(out).normalize("NFC");
  }

  // Again until nothing changes: deleting one invisible character can change
  // the context of the next.
  function fixed(pass: (s: string, lang?: string) => string, text: string, lang?: string): string {
    let s = text;
    for (let i = 0; i < r.max_passes; i++) {
      const t = pass(s, lang);
      if (t === s) break;
      s = t;
    }
    return s;
  }

  const inRanges = (c: number | undefined, rs: number[][]) =>
    c !== undefined && rs.some(([lo, hi]) => c >= lo && c <= hi);
  const steps = (r.fold as (MapStep | AnusvaraStep)[]).map((st) => {
    const run = (step: (s: number[]) => number[]) =>
      (s: number[], lang?: string) => (st.langs && !st.langs.includes(lang ?? "") ? s : step(s));
    if (st.step === "map") {
      const m = new Map<number, string>();
      for (const [from, to] of Object.entries(st.map)) m.set(cp(from), to);
      const { before, after } = st;
      const ok = (s: number[], i: number) =>
        (!before || inRanges(s[i + 1], before)) && (!after || inRanges(i > 0 ? s[i - 1] : undefined, after));
      return run((s) => Array.from(s.map((c, i) => {
        const to = m.get(c);
        return to !== undefined && ok(s, i) ? to : String.fromCodePoint(c);
      }).join(""), cp));
    }
    // nasal + virama -> anusvara, before a consonant of the nasal's own row
    return run((s: number[]) => {
      const out: number[] = [];
      for (let i = 0; i < s.length; i++) {
        const b = st.blocks.find((b) => s[i] >= b && s[i] < b + 0x80);
        if (b !== undefined && i + 2 < s.length && s[i + 1] === b + st.virama
            && st.rows.some(([n, lo, hi]) => s[i] === b + n && s[i + 2] >= b + lo && s[i + 2] <= b + hi)) {
          out.push(b + st.anusvara);
          i++;
        } else out.push(s[i]);
      }
      return out;
    });
  });

  const normalize = (text: string, lang?: string) => fixed(onePass, text, lang);
  const foldPass = (text: string, lang?: string) => {
    let s = Array.from(normalize(text, lang), cp);
    for (const step of steps) s = step(s, lang);
    return fromCodePoints(s);
  };
  return { normalize, fold: (text: string, lang?: string) => fixed(foldPass, text, lang) };
}

const engine = compile(rulesJson);

/** Changes when any output changes: store it beside normalized text that you keep. */
export const RULES_VERSION: string = rulesJson.version;

/** One encoding for text that looks the same; never changes what a reader sees. */
export function normalize(text: string, lang?: string): string {
  return engine.normalize(text, langCode(lang));
}

/** normalize, then merge accepted spellings of one word. For search only. */
export function fold(text: string, lang?: string): string {
  return engine.fold(text, langCode(lang));
}
