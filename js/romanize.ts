/**
 * Indian-language text in Latin letters, the way people spell it:
 * लक्ष्मी → lakshmi, മലൈക → malaika, پرویز → parvez.
 *
 * A ranked list: one word has several accepted spellings (Choudhury,
 * Chowdhury), and the first is the most likely. Two modes: "words" for
 * running text (the default) and "names" for fields known to hold person
 * names, where a lookup of known names comes first.
 *
 * The tables are learned from data and loaded per language, on demand:
 *
 *     const r = await load("hi");        // fetches the Hindi and Brahmic files (beside this module, else jsDelivr)
 *     r.word("लक्ष्मी");                   // ["lakshmi", ...]
 *
 * The output is deterministic: the same input gives the same list in Go and
 * in TypeScript.
 *
 * @module
 */

import rulesJson from "../romanize/rules.json" with { type: "json" };
import { version as PACKAGE_VERSION } from "../package.json" with { type: "json" };
import { langCode } from "./lang";
import { isLetter, isMark, nfc } from "./unidata";

/** The tables: "words" for running text, "names" for person names. */
export type Mode = "words" | "names";

type FamilyEntry = { tag: string; group: string; file: string; pooled: string };
type Rules = {
  rules_version: string;
  beam: Record<Mode, number>;
  max_n: number;
  order: number;
  bos: string;
  eos: string;
  unknown_penalty: number;
  unify: { from: [number, number]; to_block: number; mask: number };
  groups: Record<string, [number, number][]>;
  families: Record<Mode, Record<string, FamilyEntry>>;
};
const RULES = rulesJson as unknown as Rules;

/** Changes whenever any output changes: store it beside romanized text. */
export const RULES_VERSION: string = RULES.rules_version;

/** The language codes that have tables, for one mode. */
export function languages(mode: Mode = "words"): string[] {
  return Object.keys(RULES.families[mode]).sort();
}

/** Fetches one data file's bytes. The default reads it beside this module. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;

/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export const CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${PACKAGE_VERSION}/romanize/lang/`;

async function fetchBytes(url: URL): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`romanize: ${url}: ${res.status}`);
  return res.arrayBuffer();
}

// The tables beside this module (jsDelivr, a GitHub-tag install); else jsDelivr at
// this version (the npm package carries no tables).
function defaultFetcher(local: URL): Fetcher {
  return async (url) => {
    try {
      return await fetchBytes(url);
    } catch {
      return fetchBytes(new URL(url.href.slice(local.href.length), CDN));
    }
  };
}

/** One language's loaded tables. */
export interface Romanizer {
  readonly lang: string;
  readonly mode: Mode;
  /** Up to n spellings of one word (default 4), most likely first. */
  word(word: string, n?: number): string[];
  /** Every run of the language's script romanized (its top spelling); everything else kept. */
  text(text: string): string;
}

function code(lang: string): string {
  const c = langCode(lang);
  return c === "kok" ? "gom" : c;
}

const pooledCache = new Map<string, Promise<ArrayBuffer>>();

/**
 * Loads a language's tables for one mode: its own file and its script
 * group's pooled file (shared by the group, fetched once). It reads them
 * beside this module, else from jsDelivr at this package's version (the npm
 * package carries no tables); `base` or `fetch` replaces both. Rejects when
 * the language has no tables for the mode.
 */
export async function load(
  lang: string,
  mode: Mode = "words",
  opts: { fetch?: Fetcher; base?: URL | string } = {},
): Promise<Romanizer> {
  const c = code(lang);
  const l = RULES.families[mode][c];
  if (!l) throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../romanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const poolKey = `${base}${l.group}/${l.pooled}`;
  if (!pooledCache.has(poolKey)) pooledCache.set(poolKey, get(new URL(`${l.group}/${l.pooled}`, base)));
  const [own, pool] = await Promise.all([get(new URL(`${c}/${l.file}`, base)), pooledCache.get(poolKey)!]);
  return fromBytes(c, mode, new Uint8Array(own), new Uint8Array(pool));
}

/** Builds a Romanizer from a language's two files (for tests and offline use). */
export function fromBytes(lang: string, mode: Mode, own: Uint8Array, pool: Uint8Array): Romanizer {
  const l = RULES.families[mode][lang];
  if (!l) throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const x = new Mix(own, pool, l.tag, RULES.beam[mode]);
  const ranges = RULES.groups[l.group];
  const inScript = (ch: string) => {
    const cp = ch.codePointAt(0)!;
    return cp === 0x200c || cp === 0x200d || ranges.some(([lo, hi]) => cp >= lo && cp <= hi);
  };
  const letter = (c: string) => {
    const cp = c.codePointAt(0)!;
    return cp === 0x200c || cp === 0x200d || isLetter(cp) || isMark(cp);
  };
  // joiners shape a letter and spell nothing: deleted before the lookup and the decode
  const word = (w: string, n = 4): string[] => {
    const s = stripJoiners(nfc(w));
    const known = x.lookup.get(s);
    if (known) return known.slice(0, n);
    return x.decode(unify(s), n).filter((o) => o !== "");
  };
  const r: Romanizer = {
    lang,
    mode,
    word,
    text(t: string): string {
      const cs = [...nfc(t)];
      let out = "";
      for (let i = 0; i < cs.length; ) {
        // a run starts at a letter or a mark; a joiner only goes on with one, as in Go
        const cp = cs[i].codePointAt(0)!;
        if (!(inScript(cs[i]) && (isLetter(cp) || isMark(cp)))) {
          out += cs[i++];
          continue;
        }
        let j = i;
        while (j < cs.length && inScript(cs[j]) && letter(cs[j])) j++;
        const run = cs.slice(i, j).join("");
        out += word(run, 1)[0] ?? run;
        i = j;
      }
      return out;
    },
  };
  Object.defineProperty(r, "_mix", { value: x }); // for _decode only
  return r;
}

// The tables hold a "\u200d" → "" chunk from the training text; left in place, a joiner puts
// the beam on the path that spells every chunk before it as "", and the letters before the
// joiner are lost. The reference (jsm.Model.decode) deletes joiners the same way.
const JOINERS = /[\u200c\u200d]/gu;
function stripJoiners(s: string): string {
  return s.replace(JOINERS, "");
}

/** Moves every Brahmic code point to the Devanagari block by its offset (rules.json "unify"). */
export function unify(w: string): string {
  const u = RULES.unify;
  let out = "";
  for (const ch of w) {
    const cp = ch.codePointAt(0)!;
    out += cp >= u.from[0] && cp <= u.from[1] ? String.fromCodePoint(u.to_block + (cp & u.mask)) : ch;
  }
  return out;
}

// ---- the file format (linguistic-utilities jobs/romanize/export.py) and the tables

class Reader {
  pos = 4;
  constructor(readonly b: Uint8Array) {
    if (b[0] !== 0x49 || b[1] !== 0x4b || b[2] !== 0x52 || b[3] !== 0x31) throw new Error("romanize: not an IKR1 file");
  }
  varint(): number {
    let v = 0;
    let shift = 1;
    for (;;) {
      const byte = this.b[this.pos++];
      v += (byte & 0x7f) * shift;
      if (byte < 0x80) return v;
      shift *= 128;
    }
  }
  str(): string {
    const n = this.varint();
    const s = DECODER.decode(this.b.subarray(this.pos, this.pos + n));
    this.pos += n;
    return s;
  }
  float64(): number {
    const v = new DataView(this.b.buffer, this.b.byteOffset + this.pos, 8).getFloat64(0, true);
    this.pos += 8;
    return v;
  }
}
const DECODER = new TextDecoder();

const ID = 2 ** 21; // up to 2M distinct tokens per language; a context of two tokens fits in 42 bits

// a context of the last one or two token ids, packed (most recent lowest); the empty context is 0
function ctxKey(ctx: number[], from: number): number {
  let k = 0;
  for (let i = from; i < ctx.length; i++) k = k * ID + (ctx[i] + 1);
  return k;
}

type Level = { stats: Map<number, [number, number]>; counts: Map<number, Map<number, number>> };

class Model {
  vocab: number;
  levels: Level[] = [];
  constructor(r: Reader, strs: string[], ids: Interner) {
    this.vocab = r.varint();
    for (let l = r.varint(); l > 0; l--) {
      const lv: Level = { stats: new Map(), counts: new Map() };
      for (let c = r.varint(); c > 0; c--) {
        const ctx: number[] = [];
        for (let i = r.varint(); i > 0; i--) ctx.push(ids.id(strs[r.varint()]));
        const key = ctxKey(ctx, 0);
        const counts = new Map<number, number>();
        let total = 0;
        let prev = 0;
        for (let t = r.varint(); t > 0; t--) {
          prev += r.varint();
          const k = r.varint();
          counts.set(ids.id(strs[prev]), k);
          total += k;
        }
        lv.stats.set(key, [total, counts.size]);
        lv.counts.set(key, counts);
      }
      this.levels.push(lv);
    }
  }

  // a context's statistics at each order, computed once per hypothesis
  stats(ctx: number[]): CtxStats {
    const s: CtxStats = { counts: [], total: [], wb: [] };
    for (let n = 0; n < this.levels.length; n++) {
      const key = ctxKey(ctx, ctx.length - n);
      const st = this.levels[n].stats.get(key);
      if (st && st[1] !== 0) {
        s.counts[n] = this.levels[n].counts.get(key)!;
        s.total[n] = st[0];
        s.wb[n] = st[0] / (st[0] + st[1]);
      }
    }
    return s;
  }

  // Witten-Bell interpolation, lowest order first (as the reference)
  prob(s: CtxStats, tok: number): number {
    let p = 1 / (this.vocab + 1);
    for (let n = 0; n < this.levels.length; n++) {
      const c = s.counts[n];
      if (!c) continue;
      const lam = s.wb[n];
      p = (lam * (c.get(tok) ?? 0)) / s.total[n] + (1 - lam) * p;
    }
    return p;
  }
}
type CtxStats = { counts: (Map<number, number> | undefined)[]; total: number[]; wb: number[] };

class Interner {
  ids = new Map<string, number>();
  strs: string[] = [];
  id(s: string): number {
    let v = this.ids.get(s);
    if (v === undefined) {
      v = this.strs.length;
      this.ids.set(s, v);
      this.strs.push(s);
    }
    return v;
  }
}

type Option = { tok: number; en: string };
// A spelling is a chain: each hypothesis holds its parent and the piece it
// adds, and a whole string is built only at the last position. A copy of the
// whole string in every candidate made a long word cost (length)^2 in time
// and memory (perf job, phase 1).
type Hyp = { score: number; parent: Hyp | null; piece: string; at: number; ctx: number[] };
type Cand = { score: number; parent: Hyp | null; piece: string; tok: number; idx: number };

function spelling(c: Cand): string {
  const pieces = [c.piece];
  for (let p = c.parent; p; p = p.parent) pieces.push(p.piece);
  return pieces.reverse().join("");
}

// Orders two spellings as < does. They share the spelling of their nearest
// common hypothesis, so only the pieces after it are read.
function compareSpellings(a: Cand, b: Cand): number {
  const ra = [a.piece], rb = [b.piece];
  let pa = a.parent, pb = b.parent;
  while (pa !== pb) {
    if (pb === null || (pa !== null && pa.at > pb.at)) { ra.push(pa!.piece); pa = pa!.parent; }
    else if (pa === null || pb.at > pa.at) { rb.push(pb.piece); pb = pb.parent; }
    else { ra.push(pa.piece); pa = pa.parent; rb.push(pb.piece); pb = pb.parent; }
  }
  const x = ra.reverse().join(""), y = rb.reverse().join("");
  return x < y ? -1 : x > y ? 1 : 0;
}

function before(a: Cand, b: Cand): boolean {
  if (a.score !== b.score) return a.score > b.score;
  const c = compareSpellings(a, b);
  if (c !== 0) return c < 0;
  return a.idx < b.idx;
}

// The first k candidates of one position in the stable sort's order (score
// down, spelling up, insertion), kept as they arrive: the same k that sorting
// them all gives. n counts every candidate, for the insertion order. With all
// set, it keeps every candidate (the last position, where the end-of-word
// score reorders them).
class Beam {
  n = 0;
  best: Cand[] = [];
  constructor(readonly k: number, readonly all: boolean) {}

  add(score: number, parent: Hyp | null, piece: string, tok: number): void {
    const idx = this.n++;
    const full = !this.all && this.best.length === this.k;
    if (full && score < this.best[this.k - 1].score) return; // nothing is built for a candidate that loses
    const c: Cand = { score, parent, piece, tok, idx };
    if (this.all) { this.best.push(c); return; }
    if (full && !before(c, this.best[this.k - 1])) return;
    let lo = 0, hi = this.best.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (before(c, this.best[mid])) hi = mid;
      else lo = mid + 1;
    }
    this.best.splice(lo, 0, c);
    if (this.best.length > this.k) this.best.pop();
  }
}

/** One language's two models, mixed: λ × own + (1 − λ) × pooled. */
class Mix {
  a: Model;
  b: Model;
  lam: number;
  start: number[] = [];
  eos: number;
  options = new Map<string, Option[]>();
  lookup = new Map<string, string[]>();

  constructor(
    own: Uint8Array,
    pool: Uint8Array,
    tag: string,
    readonly beam: number,
  ) {
    const ids = new Interner();
    let r = new Reader(pool);
    let strs = readStrings(r);
    this.b = new Model(r, strs, ids);
    r = new Reader(own);
    strs = readStrings(r);
    this.lam = r.float64();
    this.a = new Model(r, strs, ids);
    for (let k = r.varint(); k > 0; k--) {
      const native = r.str();
      const sp: string[] = [];
      for (let i = r.varint(); i > 0; i--) sp.push(strs[r.varint()]);
      this.lookup.set(native, sp);
    }
    for (let i = 0; i < RULES.order - 2; i++) this.start.push(ids.id(RULES.bos));
    this.start.push(ids.id(`<s:${tag}>`));
    this.eos = ids.id(RULES.eos);
    const seen = new Set<number>();
    for (const m of [this.a, this.b]) {
      for (const counts of m.levels[0].counts.values()) {
        for (const t of counts.keys()) {
          if (t === this.eos || seen.has(t)) continue;
          seen.add(t);
          const s = ids.strs[t];
          const i = s.indexOf("|");
          const chunk = s.slice(0, i);
          const list = this.options.get(chunk) ?? [];
          list.push({ tok: t, en: s.slice(i + 1) });
          this.options.set(chunk, list);
        }
      }
    }
    for (const list of this.options.values()) list.sort((p, q) => (p.en < q.en ? -1 : p.en > q.en ? 1 : 0));
    if (this.start.length > 2 || ids.strs.length >= ID) throw new Error("romanize: beyond the engine's limits");
  }

  logp(sa: CtxStats, sb: CtxStats, tok: number): number {
    const pa = Math.exp(Math.log(this.a.prob(sa, tok)));
    const pb = Math.exp(Math.log(this.b.prob(sb, tok)));
    return Math.log(this.lam * pa + (1 - this.lam) * pb);
  }

  /** Beam search over the ways to cut w into chunks; the n best spellings (an empty one included). */
  decode(word: string, n: number): string[] {
    const w = [...stripJoiners(word)];
    const h = RULES.order - 1;
    const root: Hyp = { score: 0, parent: null, piece: "", at: 0, ctx: this.start };
    const beams = Array.from({ length: w.length + 1 }, (_, i) => new Beam(this.beam, i === w.length));
    beams[0].add(0, null, "", -1);
    const context = (c: Cand): number[] => {
      if (c.tok < 0) return c.parent!.ctx;
      const ctx = [...c.parent!.ctx, c.tok];
      return ctx.slice(ctx.length - h);
    };
    for (let i = 0; i < w.length; i++) {
      for (const c of beams[i].best) {
        const hy: Hyp = i === 0 ? root : { score: c.score, parent: c.parent, piece: c.piece, at: i, ctx: context(c) };
        let moved = false;
        const sa = this.a.stats(hy.ctx);
        const sb = this.b.stats(hy.ctx);
        for (let k = 1; k <= RULES.max_n && i + k <= w.length; k++) {
          const opts = this.options.get(w.slice(i, i + k).join(""));
          if (!opts) continue;
          for (const o of opts) {
            beams[i + k].add(hy.score + this.logp(sa, sb, o.tok), hy, o.en, o.tok);
            moved = true;
          }
        }
        if (!moved) beams[i + 1].add(hy.score - RULES.unknown_penalty, hy, "", -1);
      }
    }
    const final = new Map<string, number>();
    for (const c of beams[w.length].best) {
      const ctx = c.parent === null ? this.start : context(c);
      const s = c.score + this.logp(this.a.stats(ctx), this.b.stats(ctx), this.eos);
      const o = spelling(c);
      const v = final.get(o);
      if (v === undefined || s > v) final.set(o, s);
    }
    return [...final]
      .sort((p, q) => (p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0))
      .slice(0, n)
      .map((e) => e[0]);
  }
}

function readStrings(r: Reader): string[] {
  const strs: string[] = [];
  for (let i = r.varint(); i > 0; i--) strs.push(r.str());
  return strs;
}

/** @internal The model's own list for a unified word (no lookup), for the conformance test. */
export function _decode(r: Romanizer, word: string, n: number): string[] {
  return (r as unknown as { _mix: Mix })._mix.decode(word, n);
}
