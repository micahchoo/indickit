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
import { isWellFormed } from "./wellformed";

/** The tables: "words" for running text, "names" for person names. */
export type Mode = "words" | "names";

type FamilyEntry = { tag: string; group: string; file: string; pooled: string };
type Rules = {
  rules_version: string;
  beam: number;
  nbest: number;
  max_n: number;
  max_letters: number;
  order: number;
  bos: string;
  eos: string;
  unknown_penalty: number;
  alpha: Record<Mode, number>;
  silent: string;
  cut_modes: Mode[];
  cut_langs: Partial<Record<Mode, string[]>>;
  wf_modes: Mode[];
  blocks: Record<string, number>;
  groups: Record<string, [number, number][]>;
  families: Record<Mode, Record<string, FamilyEntry>>;
  lists: Record<string, { words?: string; names?: string; english?: string }>;
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
  /**
   * Is the Latin-typed word, read as `word` reads it, in the language's English list
   * (an English word a typist of the language writes in English)? Hindi, Marathi, Kannada,
   * Malayalam and Tamil have a list: load it with `{ english: true }`. False for a
   * language with no list.
   */
  isEnglish(word: string): boolean;
  /**
   * `text` for mixed text such as Hinglish: a word in the English list stays as typed
   * ("kal meeting hai" → "कल meeting है"). Equals `text` for a language with no list.
   */
  textMixed(text: string): string;
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
  opts: { fetch?: Fetcher; base?: URL | string; english?: boolean } = {},
): Promise<Deromanizer> {
  const c = langCode(lang);
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
  if (opts.english && lists.english) want.push(`${c}/${lists.english}`);
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
  const known: WordList[] = [];
  const lists = RULES.lists[lang] ?? {};
  for (const k of mode === "names" ? (["words", "names"] as const) : (["words"] as const)) {
    const name = lists[k];
    if (name && files[name]) known.push(new WordList(files[name]));
  }
  // a string's count: the sum over the lists that hold it
  const countOf = (s: string): number | undefined => {
    let sum: number | undefined;
    for (const l of known) {
      const c = l.get(s);
      if (c !== undefined) sum = (sum ?? 0) + c;
    }
    return sum;
  };
  // the English list: absent for most languages; for Hindi, Marathi, Kannada, Malayalam
  // and Tamil, present only when loaded with { english: true }
  let english: WordList | "none" | null = "none";
  if (lists.english) english = files[lists.english] ? new WordList(files[lists.english]) : null;
  const isEnglish = (latin: string): boolean => {
    if (english === null) throw new Error(`deromanize: load("${lang}", …, { english: true }) to read its English list`);
    return english !== "none" && english.get(clean(latin)) !== undefined;
  };
  const alpha = RULES.alpha[mode];
  // the re-rank skips cut-short spellings: in the modes of cut_modes (names), and in a mode
  // for the languages cut_langs lists under it (words: ks mni sa sd, each judged in its own language)
  const guard = RULES.cut_modes.includes(mode) || (RULES.cut_langs[mode] ?? []).includes(lang);
  const wf = RULES.wf_modes.includes(mode);
  const word = (latin: string, n = 4): string[] => {
    const w = clean(latin);
    if (w === "") return [];
    if (w.length > RULES.max_letters) {
      // One spelling: each piece's first, joined. The beam's ties made a long run
      // quadratic (32K letters: 49 s); real words are far shorter.
      let out = "";
      for (let i = 0; i < w.length; i += RULES.max_letters) out += word(w.slice(i, i + RULES.max_letters), 1)[0] ?? "";
      return out === "" ? [] : [out];
    }
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
      const c = countOf(fold(normalize(o, lang), lang));
      if (c === undefined || (guard && cut)) rest.push(o);
      else known.push([o, s + alpha * Math.log(c)]);
    }
    let ranked = [...known.sort(byScore).map((e) => e[0]), ...rest];
    // each spelling as normalize writes it, in its place; a duplicate that results is dropped,
    // the first kept (rules 2026-10-12.1): the output is normalized text. A spelling with a
    // two-part vowel sign typed in the other order (জােট) is keyed as the frequent word (জোট)
    // and took its count, and the user received a string normalize would rewrite.
    ranked = ranked.map((o) => normalize(o, lang)).filter((o, i, a) => a.indexOf(o) === i);
    // wf_modes: the spellings a renderer draws whole first, then the broken ones (a dotted
    // circle, or punctuation inside: अभवत्।), each in its order
    if (wf) ranked = [...ranked.filter(whole), ...ranked.filter((o) => !whole(o))];
    // a spelling that writes nothing is no suggestion: dropped, as in romanize
    return ranked.filter((o) => o !== "").slice(0, n);
  };
  const write = (t: string, keepEnglish: boolean): string => {
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
      out += keepEnglish && isEnglish(run) ? run : (word(run, 1)[0] ?? run);
      i = j;
    }
    return out;
  };
  return {
    lang,
    mode,
    word,
    text: (t: string): string => write(t, false),
    isEnglish,
    textMixed: (t: string): string => {
      if (english === null) isEnglish(""); // throws: the list was not loaded
      return write(t, true);
    },
  };
}

const whole = (o: string): boolean => isWellFormed(o) && !/\p{P}/u.test(o);

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

// IKL2: keys in byte order, front-coded (bytes shared with the previous key). Kept as
// bytes: the keys end to end, in order, and their counts; a lookup encodes the string
// and searches. A Map of decoded strings cost Hindi's list 25 MB of heap and 120 MB of RSS.
class WordList {
  keys: Uint8Array;
  ends: Uint32Array; // key i is keys[ends[i - 1] .. ends[i]) (from 0 for the first)
  counts: Float64Array;

  constructor(b: Uint8Array) {
    const r = new Reader(b, "IKL2");
    const n = r.varint();
    this.ends = new Uint32Array(n);
    this.counts = new Float64Array(n);
    let keys = new Uint8Array(b.length * 2);
    let size = 0, from = 0, m = 0; // from: where the last key starts
    for (let j = 0; j < n; j++) {
      const shared = r.varint();
      const len = r.varint();
      if (size + shared + len > keys.length) {
        const k = new Uint8Array(Math.max(keys.length * 2, size + shared + len));
        k.set(keys.subarray(0, size));
        keys = k;
      }
      keys.copyWithin(size, from, from + shared);
      keys.set(b.subarray(r.pos, r.pos + len), size + shared);
      r.pos += len;
      const count = r.varint();
      const end = size + shared + len;
      const c = m === 0 ? 1 : compare(keys, size, end, keys, from, size);
      if (c < 0) throw new Error("deromanize: a word list out of byte order");
      if (c === 0) this.counts[m - 1] += count; // the same key twice: one key, the counts summed
      else {
        this.ends[m] = end;
        this.counts[m++] = count;
        from = size;
        size = end;
      }
    }
    this.keys = keys.slice(0, size);
    this.ends = this.ends.slice(0, m);
    this.counts = this.counts.slice(0, m);
  }

  get(s: string): number | undefined {
    const q = ENCODER.encode(s);
    let lo = 0, hi = this.ends.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const c = compare(q, 0, q.length, this.keys, mid === 0 ? 0 : this.ends[mid - 1], this.ends[mid]);
      if (c === 0) return this.counts[mid];
      if (c > 0) lo = mid + 1;
      else hi = mid;
    }
    return undefined;
  }
}
const ENCODER = new TextEncoder();

// a[i..j) against b[k..l), in byte order
function compare(a: Uint8Array, i: number, j: number, b: Uint8Array, k: number, l: number): number {
  for (; i < j && k < l; i++, k++) if (a[i] !== b[k]) return a[i] - b[k];
  return (j - i) - (l - k);
}

const ID = 2 ** 21; // up to 2M distinct tokens per script group; a context of two tokens fits in 42 bits

function ctxKey(ctx: number[], from: number): number {
  let k = 0;
  for (let i = from; i < ctx.length; i++) k = k * ID + (ctx[i] + 1);
  return k;
}

// One order of the model, flat: a context's index by its key, and its continuations as
// one run of (token, count) pairs, sorted by token, in shared typed arrays. A Map for
// each context cost about 220 bytes a pair (Hindi: 602,000 pairs, 131 MB); this, 12.
type Level = {
  index: Map<number, number>;
  total: Float64Array;
  wb: Float64Array;
  start: Uint32Array; // context i's pairs are start[i] .. start[i + 1]
  tok: Uint32Array;
  count: Float64Array;
  // the unigram level (one context, every token): counts by token, for the lookup
  // the decoder makes most (binary search there took a quarter of its time)
  dense: Float64Array | null;
};
// at[n]: the context's index in level n; absent when the model has no such context
type CtxStats = { at: (number | undefined)[]; total: number[]; wb: number[] };

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
      const n = r.varint();
      const index = new Map<number, number>();
      const total = new Float64Array(n);
      const wb = new Float64Array(n);
      const start = new Uint32Array(n + 1);
      const toks: number[] = [];
      const counts: number[] = [];
      const run: [number, number][] = [];
      for (let c = 0; c < n; c++) {
        const ctx: number[] = [];
        for (let i = r.varint(); i > 0; i--) ctx.push(ids.id(strs[r.varint()]));
        const t = r.varint();
        const types = r.varint();
        run.length = 0;
        let prev = 0;
        for (let k = r.varint(); k > 0; k--) {
          prev += r.varint();
          const tok = ids.id(strs[prev]);
          run.push([tok, r.varint()]);
          if (this.levels.length === 0) this.toks.push(tok);
        }
        run.sort((p, q) => p[0] - q[0]);
        for (const [tok, k] of run) {
          toks.push(tok);
          counts.push(k);
        }
        index.set(ctxKey(ctx, 0), c);
        total[c] = t;
        wb[c] = t / (t + types);
        start[c + 1] = toks.length;
      }
      let dense: Float64Array | null = null;
      if (n === 1) {
        dense = new Float64Array(toks.length === 0 ? 0 : toks[toks.length - 1] + 1);
        for (let j = 0; j < toks.length; j++) dense[toks[j]] = counts[j];
      }
      this.levels.push({ index, total, wb, start, tok: Uint32Array.from(toks), count: Float64Array.from(counts), dense });
    }
    if (ids.strs.length >= ID) throw new Error("deromanize: beyond the engine's limits");
  }

  stats(ctx: number[]): CtxStats {
    const s: CtxStats = { at: [], total: [], wb: [] };
    for (let n = 0; n < this.levels.length; n++) {
      const lv = this.levels[n];
      const i = lv.index.get(ctxKey(ctx, ctx.length - n));
      if (i !== undefined) {
        s.at[n] = i;
        s.total[n] = lv.total[i];
        s.wb[n] = lv.wb[i];
      }
    }
    return s;
  }

  // tok's count after context i of level n: a binary search of the context's run
  count(n: number, i: number, tok: number): number {
    const lv = this.levels[n];
    if (lv.dense !== null) return tok < lv.dense.length ? lv.dense[tok] : 0;
    let lo = lv.start[i], hi = lv.start[i + 1];
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const t = lv.tok[mid];
      if (t === tok) return lv.count[mid];
      if (t < tok) lo = mid + 1;
      else hi = mid;
    }
    return 0;
  }

  // Witten-Bell interpolation, lowest order first (as the reference)
  prob(s: CtxStats, tok: number): number {
    let p = 1 / (this.vocab + 1);
    for (let n = 0; n < this.levels.length; n++) {
      const i = s.at[n];
      if (i === undefined) continue;
      const lam = s.wb[n];
      p = (lam * this.count(n, i, tok)) / s.total[n] + (1 - lam) * p;
    }
    return p;
  }
}

type Option = { tok: number; native: string };
// A spelling is a chain: each hypothesis holds its parent and the piece it
// adds, and a whole string is built only at the last position. A copy of the
// whole string in every candidate made a long word cost (length)^2 in time
// and memory (perf job, phase 1).
type Hyp = { score: number; parent: Hyp | null; piece: string; at: number; ctx: number[]; cut: boolean };
type Cand = { score: number; parent: Hyp | null; piece: string; tok: number; idx: number; cut: boolean };

// The pieces from the root to h, joined.
function spelling(h: Hyp): string {
  const pieces: string[] = [];
  for (let p: Hyp | null = h; p; p = p.parent) pieces.push(p.piece);
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

  // No candidate scoring at most s can enter (with a margin for rounding: a mixed
  // probability can pass 1 by an ulp). The last position keeps all.
  closed(s: number): boolean {
    return !this.all && this.best.length === this.k && s + 1e-9 < this.best[this.k - 1].score;
  }

  add(score: number, parent: Hyp | null, piece: string, tok: number, cut: boolean): void {
    const idx = this.n++;
    const full = !this.all && this.best.length === this.k;
    if (full && score < this.best[this.k - 1].score) return; // nothing is built for a candidate that loses
    const c: Cand = { score, parent, piece, tok, idx, cut };
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
    const root: Hyp = { score: 0, parent: null, piece: "", at: 0, ctx: this.start, cut: false };
    const beams = Array.from({ length: w.length + 1 }, (_, i) => new Beam(RULES.beam, i === w.length));
    beams[0].add(0, null, "", -1, false);
    const context = (c: Cand): number[] => {
      if (c.tok < 0) return c.parent!.ctx;
      const ctx = [...c.parent!.ctx, c.tok];
      return ctx.slice(ctx.length - h);
    };
    const opts: (Option[] | undefined)[] = new Array(RULES.max_n + 1); // the options of w[i:i+k], by k
    for (let i = 0; i < w.length; i++) {
      // Hypotheses here that share a context share every option's log probability:
      // computed once per context (the same function on the same inputs: the same numbers).
      const seen = new Map<number, { sa: CtxStats; sb: CtxStats; lp: (number[] | undefined)[] }>();
      for (const c of beams[i].best) {
        // A log probability is at most 0, so no candidate of c scores above c. Where the next
        // beam's last place already scores above c, nothing of c can enter: its options are
        // counted (insertion order) and not scored (perf job, phase 6).
        let moved = false, open = false;
        for (let k = 1; k <= RULES.max_n && i + k <= w.length; k++) {
          opts[k] = this.options.get(w.slice(i, i + k).join(""));
          if (opts[k]?.length) { moved = true; open ||= !beams[i + k].closed(c.score); }
        }
        if (moved && !open) {
          for (let k = 1; k <= RULES.max_n && i + k <= w.length; k++) beams[i + k].n += opts[k]?.length ?? 0;
          continue;
        }
        const hy: Hyp = i === 0 ? root : { score: c.score, parent: c.parent, piece: c.piece, at: i, ctx: context(c), cut: c.cut };
        if (!moved) {
          beams[i + 1].add(hy.score - RULES.unknown_penalty, hy, "", -1, hy.cut || cuts(w, i, 1));
          continue;
        }
        const key = ctxKey(hy.ctx, 0);
        let e = seen.get(key);
        if (!e) {
          e = { sa: this.a.stats(hy.ctx), sb: this.b.stats(hy.ctx), lp: [] };
          seen.set(key, e);
        }
        for (let k = 1; k <= RULES.max_n && i + k <= w.length; k++) {
          const os = opts[k];
          if (!os) continue;
          if (beams[i + k].closed(hy.score)) { beams[i + k].n += os.length; continue; }
          let lp = e.lp[k];
          if (!lp) {
            lp = os.map((o) => this.logp(e!.sa, e!.sb, o.tok));
            e.lp[k] = lp;
          }
          for (let j = 0; j < os.length; j++) {
            const o = os[j];
            beams[i + k].add(hy.score + lp[j], hy, o.native, o.tok, hy.cut || (o.native === "" && cuts(w, i, k)));
          }
        }
      }
    }
    // The last position keeps every candidate, but only the best few spellings are
    // returned. Each candidate's final score needs no string: the end-of-word log
    // probability, once per context. The spellings are then built best first, and the walk
    // stops at the first score below the last place's: no candidate after it can enter, and
    // a spelling's first candidate holds its best score (perf phase 8: building every
    // spelling was most of a call's memory). Equal scores go on: a tie is ordered by its string.
    const every = beams[w.length].best;
    const eos = new Map<number, number>();
    const fin = new Float64Array(every.length);
    for (let i = 0; i < every.length; i++) {
      const c = every[i];
      const ctx = c.parent === null ? this.start : context(c);
      const key = ctxKey(ctx, 0);
      let lp = eos.get(key);
      if (lp === undefined) {
        lp = this.logp(this.a.stats(ctx), this.b.stats(ctx), this.eos);
        eos.set(key, lp);
      }
      fin[i] = c.score + lp;
    }
    const order = Int32Array.from(every.keys()).sort((p, q) => (fin[q] > fin[p] ? 1 : fin[q] < fin[p] ? -1 : 0));
    const spelled = new Map<Hyp, string>();
    const spell = (c: Cand): string => {
      if (c.parent === null) return c.piece;
      let ps = spelled.get(c.parent);
      if (ps === undefined) { ps = spelling(c.parent); spelled.set(c.parent, ps); }
      return ps + c.piece;
    };
    const at = new Map<string, number>(); // a spelling's place in out
    const out: Scored[] = [];
    const last = RULES.nbest - 1;
    let j = 0;
    for (; j < order.length; j++) {
      const s = fin[order[j]];
      if (out.length > last && s < out[last][1]) break;
      const c = every[order[j]];
      const o = spell(c);
      const k = at.get(o);
      if (k !== undefined) { out[k][2] &&= c.cut; continue; }
      at.set(o, out.length);
      out.push([o, s, c.cut]);
    }
    // A spelling is cut only if every path to it is: a candidate left may still clear one.
    if (out.some((v) => v[2])) {
      for (; j < order.length; j++) {
        const c = every[order[j]];
        if (c.cut) continue;
        const k = at.get(spell(c));
        if (k !== undefined) out[k][2] = false;
      }
    }
    return out.sort(byScore).slice(0, RULES.nbest);
  }
}
