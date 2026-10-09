/**
 * Indian-language text from Latin typing, the reverse of romanize:
 * namaste → नमस्ते, ahmad → احمد, vanakkam → வணக்கம்.
 *
 * A ranked list: one typed word can stand for several native words (kamal:
 * कमल, कमाल), and the first is the most likely. Two modes: "words" for
 * running text (the default) and "names" for fields known to hold person
 * names.
 *
 * It writes the word it is given in the language's script, so English words
 * in mixed text ("kal meeting hai") are written in it too: identify each
 * word's language first.
 *
 * The tables are learned from data and loaded per language, on demand:
 *
 *     const d = await load("hi");   // fetches the Hindi and Brahmic files (beside this module, else jsDelivr)
 *     d.word("namaste");            // ["नमस्ते", ...]
 *
 * The output is deterministic: the same input gives the same list in Go and
 * in TypeScript.
 *
 * @module
 */

import rulesJson from "../deromanize/rules.json" with { type: "json" };
import { version as PACKAGE_VERSION } from "../package.json" with { type: "json" };
import { langCode } from "./lang";
import { fold, normalize } from "./normalize";

/** The tables: "words" for running text, "names" for person names. */
export type Mode = "words" | "names";

type FamilyEntry = { tag: string; group: string; file: string; pooled: string };
type Rules = {
  rules_version: string;
  beam: number;
  nbest: number;
  max_n: number;
  order: number;
  bos: string;
  eos: string;
  unknown_penalty: number;
  alpha: Record<Mode, number>;
  silent: string;
  cut_modes: Mode[];
  blocks: Record<string, number>;
  groups: Record<string, [number, number][]>;
  families: Record<Mode, Record<string, FamilyEntry>>;
  lists: Record<string, { words?: string; names?: string }>;
};
const RULES = rulesJson as unknown as Rules;

/** Changes whenever any output changes. */
export const RULES_VERSION: string = RULES.rules_version;

const familiesOf = (mode: Mode): Mode[] => (mode === "names" ? ["names", "words"] : ["words"]);

/** The language codes that have tables, for one mode. */
export function languages(mode: Mode = "words"): string[] {
  const out = new Set<string>();
  for (const f of familiesOf(mode)) for (const l of Object.keys(RULES.families[f])) out.add(l);
  return [...out].sort();
}

/** Fetches one data file's bytes. The default reads it beside this module. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;

/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export const CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${PACKAGE_VERSION}/deromanize/lang/`;

async function fetchBytes(url: URL): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`deromanize: ${url}: ${res.status}`);
  return res.arrayBuffer();
}

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
export interface Deromanizer {
  readonly lang: string;
  readonly mode: Mode;
  /** Up to n native spellings of one Latin-typed word (default 4), most likely first. */
  word(latin: string, n?: number): string[];
  /** Every run of Latin letters written as its first native spelling; everything else kept. */
  text(text: string): string;
}

function code(lang: string): string {
  const c = langCode(lang);
  return c === "kok" ? "gom" : c;
}

/** The input as the training pairs were read: accents removed, lower case, a-z only. */
export function clean(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
}

const isLatin = (ch: string): boolean => {
  const cp = ch.codePointAt(0)!;
  return clean(ch) !== "" || (cp >= 0x0300 && cp <= 0x036f);
};

const fileCache = new Map<string, Promise<ArrayBuffer>>();
const pooledCache = new Map<string, Model>();

/**
 * Loads a language's tables for one mode: its own files, its word list and its
 * script group's pooled files (shared by the group, fetched once). It reads them
 * beside this module, else from jsDelivr at this package's version (the npm
 * package carries no tables); `base` or `fetch` replaces both. Rejects when the
 * language has no tables for the mode.
 */
export async function load(
  lang: string,
  mode: Mode = "words",
  opts: { fetch?: Fetcher; base?: URL | string } = {},
): Promise<Deromanizer> {
  const c = code(lang);
  const fams = familiesOf(mode).filter((f) => RULES.families[f][c]);
  if (fams.length === 0) throw new Error(`deromanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../deromanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const once = (path: string) => {
    const k = `${base}${path}`;
    if (!fileCache.has(k)) fileCache.set(k, get(new URL(path, base)));
    return fileCache.get(k)!;
  };
  const files: Record<string, Uint8Array> = {};
  const want: string[] = [];
  for (const f of fams) {
    const l = RULES.families[f][c];
    want.push(`${l.group}/${l.pooled}`, `${c}/${l.file}`);
  }
  const lists = RULES.lists[c] ?? {};
  for (const k of mode === "names" ? (["words", "names"] as const) : (["words"] as const)) {
    if (lists[k]) want.push(`${c}/${lists[k]}`);
  }
  const got = await Promise.all(want.map(once));
  want.forEach((p, i) => (files[p.slice(p.indexOf("/") + 1)] = new Uint8Array(got[i])));
  return fromBytes(c, mode, files);
}

/** Builds a Deromanizer from its files, by file name (for tests and offline use). */
export function fromBytes(lang: string, mode: Mode, files: Record<string, Uint8Array>): Deromanizer {
  const mixes: Mix[] = [];
  for (const f of familiesOf(mode)) {
    const l = RULES.families[f][lang];
    if (!l) continue;
    let pool = pooledCache.get(l.pooled);
    if (!pool) {
      const r = new Reader(files[l.pooled], "IKD1");
      pool = new Model(r, readStrings(r), new Interner());
      pooledCache.set(l.pooled, pool);
    }
    mixes.push(new Mix(files[l.file], pool, l.tag, l.group));
  }
  if (mixes.length === 0) throw new Error(`deromanize: no ${mode} tables for "${lang}"`);
  const counts = new Map<string, number>();
  const lists = RULES.lists[lang] ?? {};
  for (const k of mode === "names" ? (["words", "names"] as const) : (["words"] as const)) {
    const name = lists[k];
    if (name && files[name]) readList(files[name], counts);
  }
  const alpha = RULES.alpha[mode];
  const guard = RULES.cut_modes.includes(mode); // the re-rank skips cut-short spellings
  const word = (latin: string, n = 4): string[] => {
    const w = clean(latin);
    if (w === "") return [];
    // names mode merges both models: each string at its better score, full if either writes it in full
    const merged = new Map<string, [number, boolean]>();
    for (const x of mixes) {
      for (const [o, s, cut] of x.decode(w)) {
        const d = deunify(o, lang);
        const v = merged.get(d);
        merged.set(d, v === undefined ? [s, cut] : [Math.max(v[0], s), v[1] && cut]);
      }
    }
    const best = [...merged].map(([o, [s, cut]]): Scored => [o, s, cut]).sort(byScore);
    // known strings by log score + α · log(count), then the rest in model order. With guard,
    // a cut-short string is not known, whatever the list says: a short, common string
    // (murmu → മു) would otherwise take the bonus and come first.
    const known: [string, number][] = [];
    const rest: string[] = [];
    for (const [o, s, cut] of best) {
      const c = counts.get(fold(normalize(o, lang), lang));
      if (c === undefined || (guard && cut)) rest.push(o);
      else known.push([o, s + alpha * Math.log(c)]);
    }
    return [...known.sort(byScore).map((e) => e[0]), ...rest].slice(0, n);
  };
  return {
    lang,
    mode,
    word,
    text(t: string): string {
      const cs = [...t];
      let out = "";
      for (let i = 0; i < cs.length; ) {
        if (!isLatin(cs[i])) {
          out += cs[i++];
          continue;
        }
        let j = i;
        while (j < cs.length && isLatin(cs[j])) j++;
        const run = cs.slice(i, j).join("");
        out += word(run, 1)[0] ?? run;
        i = j;
      }
      return out;
    },
  };
}

/** A spelling, its log score, and whether every path to it wrote nothing for a consonant (cuts). */
type Scored = [string, number, boolean];

const byScore = (p: readonly [string, number, ...unknown[]], q: readonly [string, number, ...unknown[]]): number =>
  p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0;

// Does writing nothing for w[i..i+k) cut the word short? Yes if one of its letters is a
// consonant that does not repeat the letter before it (tt, mm: one sound). The letters that
// may write nothing are RULES.silent: the vowels, h (aspiration is written with the consonant
// before it), y and w (a glide fuses into a vowel sign).
function cuts(w: string[], i: number, k: number): boolean {
  for (let j = i; j < i + k; j++) {
    if (!RULES.silent.includes(w[j]) && !(j > 0 && w[j] === w[j - 1])) return true;
  }
  return false;
}

function deunify(w: string, lang: string): string {
  const base = RULES.blocks[lang];
  if (base === undefined) return w;
  let out = "";
  for (const ch of w) {
    const cp = ch.codePointAt(0)!;
    out += cp >= 0x0900 && cp <= 0x097f ? String.fromCodePoint(base + (cp & 0x7f)) : ch;
  }
  return out;
}

function groupOf(cp: number): string {
  for (const [g, ranges] of Object.entries(RULES.groups)) {
    for (const [lo, hi] of ranges) if (cp >= lo && cp <= hi) return g;
  }
  return "";
}

// ---- the file format (linguistic-utilities jobs/deromanize/export.py) and the tables

class Reader {
  pos = 4;
  constructor(
    readonly b: Uint8Array,
    magic: string,
  ) {
    for (let i = 0; i < 4; i++) if (b[i] !== magic.charCodeAt(i)) throw new Error(`deromanize: not an ${magic} file`);
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

function readStrings(r: Reader): string[] {
  const strs: string[] = [];
  for (let i = r.varint(); i > 0; i--) strs.push(r.str());
  return strs;
}

// IKL2: keys in byte order, front-coded (bytes shared with the previous key)
function readList(b: Uint8Array, counts: Map<string, number>): void {
  const r = new Reader(b, "IKL2");
  let prev = new Uint8Array(0);
  for (let n = r.varint(); n > 0; n--) {
    const shared = r.varint();
    const len = r.varint();
    const key = new Uint8Array(shared + len);
    key.set(prev.subarray(0, shared));
    key.set(b.subarray(r.pos, r.pos + len), shared);
    r.pos += len;
    prev = key;
    const k = DECODER.decode(key);
    counts.set(k, (counts.get(k) ?? 0) + r.varint());
  }
}

const ID = 2 ** 21; // up to 2M distinct tokens per script group; a context of two tokens fits in 42 bits

function ctxKey(ctx: number[], from: number): number {
  let k = 0;
  for (let i = from; i < ctx.length; i++) k = k * ID + (ctx[i] + 1);
  return k;
}

type Level = { stats: Map<number, [number, number]>; counts: Map<number, Map<number, number>> };
type CtxStats = { has: boolean[]; counts: (Map<number, number> | undefined)[]; total: number[]; wb: number[] };

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

// A context's totals are the whole pooled model's (IKD1), so a group's file gives the
// whole model's probabilities; a context present with no continuation still applies its discount.
class Model {
  vocab: number;
  levels: Level[] = [];
  toks: number[] = [];
  constructor(
    r: Reader,
    strs: string[],
    readonly ids: Interner,
  ) {
    this.vocab = r.varint();
    for (let l = r.varint(); l > 0; l--) {
      const lv: Level = { stats: new Map(), counts: new Map() };
      for (let c = r.varint(); c > 0; c--) {
        const ctx: number[] = [];
        for (let i = r.varint(); i > 0; i--) ctx.push(ids.id(strs[r.varint()]));
        const key = ctxKey(ctx, 0);
        const total = r.varint();
        const types = r.varint();
        const counts = new Map<number, number>();
        let prev = 0;
        for (let t = r.varint(); t > 0; t--) {
          prev += r.varint();
          const tok = ids.id(strs[prev]);
          counts.set(tok, r.varint());
          if (this.levels.length === 0) this.toks.push(tok);
        }
        lv.stats.set(key, [total, types]);
        lv.counts.set(key, counts);
      }
      this.levels.push(lv);
    }
    if (ids.strs.length >= ID) throw new Error("deromanize: beyond the engine's limits");
  }

  stats(ctx: number[]): CtxStats {
    const s: CtxStats = { has: [], counts: [], total: [], wb: [] };
    for (let n = 0; n < this.levels.length; n++) {
      const key = ctxKey(ctx, ctx.length - n);
      const st = this.levels[n].stats.get(key);
      if (st) {
        s.has[n] = true;
        s.counts[n] = this.levels[n].counts.get(key);
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
      if (!s.has[n]) continue;
      const lam = s.wb[n];
      p = (lam * (s.counts[n]?.get(tok) ?? 0)) / s.total[n] + (1 - lam) * p;
    }
    return p;
  }
}

type Option = { tok: number; native: string };
type Hyp = { score: number; out: string; ctx: number[]; cut: boolean };
type Cand = { score: number; out: string; parent: Hyp | null; tok: number; idx: number; cut: boolean };

function before(a: Cand, b: Cand): boolean {
  if (a.score !== b.score) return a.score > b.score;
  if (a.out !== b.out) return a.out < b.out;
  return a.idx < b.idx;
}

// the first k candidates in the reference's stable sort order (score down, spelling up, insertion)
function top(cs: Cand[], k: number): Cand[] {
  const best: Cand[] = [];
  for (const c of cs) {
    if (best.length === k && !before(c, best[k - 1])) continue;
    let lo = 0;
    let hi = best.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (before(c, best[mid])) hi = mid;
      else lo = mid + 1;
    }
    best.splice(lo, 0, c);
    if (best.length > k) best.pop();
  }
  return best;
}

/** One language's two models, mixed: λ × own + (1 − λ) × pooled. */
class Mix {
  a: Model;
  lam: number;
  start: number[] = [];
  eos: number;
  options = new Map<string, Option[]>();

  constructor(
    own: Uint8Array,
    readonly b: Model,
    tag: string,
    group: string,
  ) {
    const ids = b.ids;
    const r = new Reader(own, "IKD1");
    const strs = readStrings(r);
    this.lam = r.float64();
    this.a = new Model(r, strs, ids);
    for (let i = 0; i < RULES.order - 2; i++) this.start.push(ids.id(RULES.bos));
    this.start.push(ids.id(`<s:${tag}>`));
    this.eos = ids.id(RULES.eos);
    for (const t of b.toks) {
      const s = ids.strs[t];
      const i = s.indexOf("|");
      if (i < 0) continue;
      const native = s.slice(i + 1);
      let ok = true;
      for (const ch of native) {
        const g = groupOf(ch.codePointAt(0)!);
        if (g !== "" && g !== group) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const chunk = s.slice(0, i);
      const list = this.options.get(chunk) ?? [];
      list.push({ tok: t, native });
      this.options.set(chunk, list);
    }
    for (const list of this.options.values()) list.sort((p, q) => (p.native < q.native ? -1 : p.native > q.native ? 1 : 0));
  }

  logp(sa: CtxStats, sb: CtxStats, tok: number): number {
    return Math.log(this.lam * this.a.prob(sa, tok) + (1 - this.lam) * this.b.prob(sb, tok));
  }

  /** Beam search over the ways to cut w into Latin chunks; the nbest spellings with scores.
   *  A spelling is cut when every path that reaches it wrote nothing for a consonant. */
  decode(word: string): Scored[] {
    const w = [...word];
    const h = RULES.order - 1;
    const root: Hyp = { score: 0, out: "", ctx: this.start, cut: false };
    const beams: Cand[][] = Array.from({ length: w.length + 1 }, () => []);
    beams[0].push({ score: 0, out: "", parent: null, tok: -1, idx: 0, cut: false });
    const context = (c: Cand): number[] => {
      if (c.tok < 0) return c.parent!.ctx;
      const ctx = [...c.parent!.ctx, c.tok];
      return ctx.slice(ctx.length - h);
    };
    for (let i = 0; i < w.length; i++) {
      if (beams[i].length === 0) continue;
      for (const c of top(beams[i], RULES.beam)) {
        const hy: Hyp = i === 0 ? root : { score: c.score, out: c.out, ctx: context(c), cut: c.cut };
        let moved = false;
        const sa = this.a.stats(hy.ctx);
        const sb = this.b.stats(hy.ctx);
        for (let k = 1; k <= RULES.max_n && i + k <= w.length; k++) {
          const opts = this.options.get(w.slice(i, i + k).join(""));
          if (!opts) continue;
          for (const o of opts) {
            const next = beams[i + k];
            next.push({ score: hy.score + this.logp(sa, sb, o.tok), out: hy.out + o.native, parent: hy, tok: o.tok, idx: next.length,
              cut: hy.cut || (o.native === "" && cuts(w, i, k)) });
            moved = true;
          }
        }
        if (!moved) {
          const next = beams[i + 1];
          next.push({ score: hy.score - RULES.unknown_penalty, out: hy.out, parent: hy, tok: -1, idx: next.length, cut: hy.cut || cuts(w, i, 1) });
        }
      }
    }
    const final = new Map<string, [number, boolean]>();
    for (const c of beams[w.length]) {
      const ctx = c.parent === null ? this.start : context(c);
      const s = c.score + this.logp(this.a.stats(ctx), this.b.stats(ctx), this.eos);
      const v = final.get(c.out);
      final.set(c.out, v === undefined ? [s, c.cut] : [Math.max(v[0], s), v[1] && c.cut]);
    }
    const out = [...final].map(([o, [s, cut]]): Scored => [o, s, cut]);
    return out.sort(byScore).slice(0, RULES.nbest);
  }
}
