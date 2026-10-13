/**
 * Indian-language text in Latin letters, the way people spell it:
 * लक्ष्मी → lakshmi, മലൈക → malaika, پرویز → parvez.
 *
 * A ranked list: one word has several accepted spellings (Choudhury,
 * Chowdhury), and the first is the most likely. Three modes: "words" for
 * running text (the default); "names" for fields known to hold person
 * names, where a lookup of known names comes first; and "places" for place
 * names (its own tables in nine languages, the "words" tables in the others).
 * In Hindi, `load("hi", "names", { route: true })` spells only the names the
 * names tables were trained on with them, and every other word with the
 * "words" tables.
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

/**
 * The tables: "words" for running text, "names" for person names, "places" for
 * place names (own tables for bn hi ml mr or sat ta te ur; the "words" tables elsewhere).
 */
export type Mode = "words" | "names" | "places";

type FamilyEntry = { tag: string; group: string; file: string; pooled: string };
// The letter n-gram that reorders a mode's list (names, rules 2026-10-12): its file in
// lang/shared, and the knobs: the depth spellings by alignment score, each plus beta × the
// log probability of its letters.
type Rescore = { file: string; beta: number; depth: number; order: number; bos: string; eos: string };
// The route of a mode in a language (names, Hindi; rules 2026-10-13), on with load's `route`:
// a word in the known list (its file in the language's folder: the names tables' training
// tokens) is spelled by the mode's tables; any other word by the "else" mode's.
type Route = { file: string; else: Mode };
type Rules = {
  rules_version: string;
  beam: Record<Mode, number>;
  max_n: number;
  max_letters: number;
  order: number;
  bos: string;
  eos: string;
  unknown_penalty: number;
  unify: { from: [number, number]; to_block: number; mask: number };
  groups: Record<string, [number, number][]>;
  families: Record<Mode, Record<string, FamilyEntry>>;
  rescore?: Partial<Record<Mode, Rescore>>;
  route?: Partial<Record<Mode, Record<string, Route>>>;
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

const pooledCache = new Map<string, Promise<ArrayBuffer>>(); // pooled and shared files, fetched once a page

/**
 * Loads a language's tables for one mode: its own file, its script group's
 * pooled file (shared by the group, fetched once) and, for the names mode,
 * the letter n-gram every names page shares. With `route: true`, Hindi's
 * names mode also loads its list of known names and its words tables
 * (rules 2026-10-13): a name the names tables were trained on keeps its
 * names list, and any other word gets the words list. On names in news held
 * out (PIB, August 2023) Hindi's first spelling goes from 55.0% to 62.2%;
 * the page grows from 0.56 MB to 2.5 MB (26 KB on a page that has Hindi's
 * words tables). In a language or mode with no route, `route` changes nothing. It reads them beside this
 * module, else from jsDelivr at this package's version (the npm package
 * carries no tables); `base` or `fetch` replaces both. Rejects when the
 * language has no tables for the mode.
 */
export async function load(
  lang: string,
  mode: Mode = "words",
  opts: { fetch?: Fetcher; base?: URL | string; route?: boolean } = {},
): Promise<Romanizer> {
  const c = langCode(lang);
  const l = RULES.families[mode][c];
  if (!l) throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../romanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const shared = (path: string) => {
    const key = `${base}${path}`;
    if (!pooledCache.has(key)) pooledCache.set(key, get(new URL(path, base)));
    return pooledCache.get(key)!;
  };
  const rc = RULES.rescore?.[mode];
  const rt = opts.route ? RULES.route?.[mode]?.[c] : undefined;
  const [own, pool, lm, known, other] = await Promise.all([
    get(new URL(`${c}/${l.file}`, base)),
    shared(`${l.group}/${l.pooled}`),
    rc ? shared(`shared/${rc.file}`) : undefined,
    rt ? get(new URL(`${c}/${rt.file}`, base)) : undefined,
    rt ? load(c, rt.else, { ...opts, route: false }) : undefined,
  ]);
  return fromBytes(c, mode, new Uint8Array(own), new Uint8Array(pool), lm && new Uint8Array(lm),
    known && other ? { known: new Uint8Array(known), other } : undefined);
}

/**
 * Builds a Romanizer from a language's files (for tests and offline use): its own, its
 * group's pooled one and, for a mode with a letter n-gram (names), that file too. `route`
 * turns the route on where the mode has one (Hindi names): the known list's file and the
 * Romanizer of the other mode (Hindi words), as `load(..., { route: true })` passes them.
 */
export function fromBytes(
  lang: string,
  mode: Mode,
  own: Uint8Array,
  pool: Uint8Array,
  lm?: Uint8Array,
  route?: { known: Uint8Array; other: Romanizer },
): Romanizer {
  const l = RULES.families[mode][lang];
  if (!l) throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const rc = RULES.rescore?.[mode];
  if (rc && !lm) throw new Error(`romanize: the ${mode} mode needs its letter n-gram (shared/${rc.file})`);
  const rt = route ? RULES.route?.[mode]?.[lang] : undefined;
  if (route && rt && (route.other.mode !== rt.else || route.other.lang !== lang)) {
    throw new Error(`romanize: the ${mode} route of "${lang}" needs the ${lang} ${rt.else} Romanizer`);
  }
  // the route: a word outside the known list is spelled by the other mode
  const known = rt ? readKnown(route!.known) : null;
  const x = new Mix(own, pool, l.tag, RULES.beam[mode], rc && lm ? new LetterLM(lm, rc) : null, rc);
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
    const cps = [...s];
    if (cps.length > RULES.max_letters) {
      // One spelling: each piece's first, joined. The beam's ties made a long run
      // quadratic (32K code points: 49 s); real words are far shorter.
      let out = "";
      for (let i = 0; i < cps.length; i += RULES.max_letters) out += word(cps.slice(i, i + RULES.max_letters).join(""), 1)[0] ?? "";
      return out === "" ? [] : [out];
    }
    const spellings = x.lookup.get(s);
    if (spellings) return spellings.slice(0, n);
    if (known && !known.has(s)) return route!.other.word(s, n);
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
function unify(w: string): string {
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

// One order of the model, flat: a context's index by its key, and its continuations as
// one run of (token, count) pairs, sorted by token, in shared typed arrays. A Map for
// each context cost Hindi's words and names 185,000 Maps and 240 MB of heap.
type Level = {
  index: Map<number, number>;
  total: Float64Array;
  wb: Float64Array;
  start: Uint32Array; // context i's pairs are start[i] .. start[i + 1]
  tok: Uint32Array;
  count: Float64Array;
  // a level of one context (the unigrams: every token): counts by token, for the lookup
  // the decoder makes most
  dense: Float64Array | null;
};

class Model {
  vocab: number;
  levels: Level[] = [];
  toks: number[] = []; // the unigram tokens, in file order
  constructor(r: Reader, strs: string[], ids: Interner) {
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
        run.length = 0;
        let t = 0;
        let prev = 0;
        for (let k = r.varint(); k > 0; k--) {
          prev += r.varint();
          const tok = ids.id(strs[prev]);
          const v = r.varint();
          run.push([tok, v]);
          t += v;
          if (this.levels.length === 0) this.toks.push(tok);
        }
        run.sort((p, q) => p[0] - q[0]);
        for (const [tok, v] of run) {
          toks.push(tok);
          counts.push(v);
        }
        index.set(ctxKey(ctx, 0), c);
        total[c] = t;
        wb[c] = t / (t + run.length);
        start[c + 1] = toks.length;
      }
      let dense: Float64Array | null = null;
      if (n === 1) {
        dense = new Float64Array(toks.length === 0 ? 0 : toks[toks.length - 1] + 1);
        for (let j = 0; j < toks.length; j++) dense[toks[j]] = counts[j];
      }
      this.levels.push({ index, total, wb, start, tok: Uint32Array.from(toks), count: Float64Array.from(counts), dense });
    }
  }

  // a context's statistics at each order, computed once per hypothesis; a context
  // with no continuations is skipped
  stats(ctx: number[]): CtxStats {
    const s: CtxStats = { at: [], total: [], wb: [] };
    for (let n = 0; n < this.levels.length; n++) {
      const lv = this.levels[n];
      const i = lv.index.get(ctxKey(ctx, ctx.length - n));
      if (i !== undefined && lv.start[i + 1] !== lv.start[i]) {
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

// The names mode's letter n-gram (rules 2026-10-12; jsm.LetterLM): a Witten-Bell model over
// the training English spellings, letters as tokens, read from the same file format. Few
// tokens and short contexts: plain Maps keyed by the context's letters.
type LmCtx = { total: number; wb: number; count: Map<string, number> };
class LetterLM {
  vocab: number;
  levels: Map<string, LmCtx>[] = [];
  constructor(
    b: Uint8Array,
    readonly rc: Rescore,
  ) {
    const r = new Reader(b);
    const strs = readStrings(r);
    this.vocab = r.varint();
    for (let l = r.varint(); l > 0; l--) {
      const lv = new Map<string, LmCtx>();
      for (let c = r.varint(); c > 0; c--) {
        let key = "";
        for (let i = r.varint(); i > 0; i--) key += strs[r.varint()];
        const e: LmCtx = { total: 0, wb: 0, count: new Map() };
        let prev = 0;
        for (let t = r.varint(); t > 0; t--) {
          prev += r.varint();
          const k = r.varint();
          e.count.set(strs[prev], k);
          e.total += k;
        }
        e.wb = e.total / (e.total + e.count.size);
        lv.set(key, e);
      }
      this.levels.push(lv);
    }
  }

  // log p of a spelling: the sum over its letters and the end token of the Witten-Bell
  // probability, lowest order first, as Model.prob (the reference: jsm.LetterLM.logp)
  logp(s: string): number {
    const { order, bos, eos } = this.rc;
    const toks: string[] = [];
    for (let i = 0; i < order - 1; i++) toks.push(bos);
    for (const c of s) toks.push(c);
    toks.push(eos);
    let sum = 0;
    for (let i = order - 1; i < toks.length; i++) {
      let p = 1 / (this.vocab + 1);
      for (let n = 0; n < order && n < this.levels.length; n++) {
        const e = this.levels[n].get(toks.slice(i - n, i).join(""));
        if (!e) continue;
        p = (e.wb * (e.count.get(toks[i]) ?? 0)) / e.total + (1 - e.wb) * p;
      }
      sum += Math.log(p);
    }
    return sum;
  }
}

type Option = { tok: number; en: string };
// A spelling is a chain: each hypothesis holds its parent and the piece it
// adds, and a whole string is built only at the last position. A copy of the
// whole string in every candidate made a long word cost (length)^2 in time
// and memory (perf job, phase 1).
type Hyp = { score: number; parent: Hyp | null; piece: string; at: number; ctx: number[] };
type Cand = { score: number; parent: Hyp | null; piece: string; tok: number; idx: number };

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
// pooled bytes (their buffer) → the parsed pooled model and the interner its ids belong to
const pooledModels = new WeakMap<ArrayBufferLike, { byteOffset: number; ids: Interner; model: Model }>();

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
    // the names mode's rescoring (rules 2026-10-12): the depth best spellings by
    // alignment score are reordered by score + beta × lm.logp(spelling)
    readonly lm: LetterLM | null = null,
    readonly rescore: Rescore | undefined = undefined,
  ) {
    // The pooled model is parsed once per pooled file and shared by every language and mode
    // that reads it (a Brahmic page with several languages held one copy each before); its
    // interner is shared too: a language's own strings are added to it, and no id that a
    // model holds changes. Output does not depend on the ids, only on the strings.
    let shared = pooledModels.get(pool.buffer);
    if (!shared || shared.byteOffset !== pool.byteOffset) {
      const ids = new Interner();
      const pr = new Reader(pool);
      shared = { byteOffset: pool.byteOffset, ids, model: new Model(pr, readStrings(pr), ids) };
      pooledModels.set(pool.buffer, shared);
    }
    const ids = shared.ids;
    this.b = shared.model;
    const r = new Reader(own);
    const strs = readStrings(r);
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
      for (const t of m.toks) {
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
    for (const list of this.options.values()) list.sort((p, q) => (p.en < q.en ? -1 : p.en > q.en ? 1 : 0));
    if (this.start.length > 2 || ids.strs.length >= ID) throw new Error("romanize: beyond the engine's limits");
  }

  logp(sa: CtxStats, sb: CtxStats, tok: number): number {
    const pa = Math.exp(Math.log(this.a.prob(sa, tok)));
    const pb = Math.exp(Math.log(this.b.prob(sb, tok)));
    return Math.log(this.lam * pa + (1 - this.lam) * pb);
  }

  /**
   * Beam search over the ways to cut w into chunks; the n best spellings (an empty one
   * included). With a letter n-gram (names, rules 2026-10-12), the max(n, depth) best by
   * alignment score are built, each scores alignment + beta × the n-gram's log probability
   * of its letters, and the n best of that order are returned (ties by the string):
   * jsm.decode_rescored.
   */
  decode(word: string, n: number): string[] {
    if (n <= 0) return [];
    const rs = this.beamSearch(word, this.lm && this.rescore ? Math.max(n, this.rescore.depth) : n);
    if (this.lm && this.rescore) {
      const beta = this.rescore.beta;
      for (const e of rs) e[1] += beta * this.lm.logp(e[0]);
      sortScored(rs);
    }
    return rs.slice(0, n).map((e) => e[0]);
  }

  /** The n best spellings of word by alignment score, with their scores. */
  beamSearch(word: string, n: number): [string, number][] {
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
        const hy: Hyp = i === 0 ? root : { score: c.score, parent: c.parent, piece: c.piece, at: i, ctx: context(c) };
        if (!moved) {
          beams[i + 1].add(hy.score - RULES.unknown_penalty, hy, "", -1);
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
          for (let j = 0; j < os.length; j++) beams[i + k].add(hy.score + lp[j], hy, os[j].en, os[j].tok);
        }
      }
    }
    // The last position keeps every candidate, but only the n best spellings are
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
    const out: [string, number][] = [];
    const seen = new Set<string>();
    for (const i of order) {
      const s = fin[i];
      if (out.length >= n && s < out[n - 1][1]) break;
      const o = spell(every[i]);
      if (!seen.has(o)) { seen.add(o); out.push([o, s]); }
    }
    sortScored(out);
    return out.slice(0, n);
  }
}

// score down, then the string up: the reference's order
function sortScored(rs: [string, number][]): void {
  rs.sort((p, q) => (p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0));
}

// A known-token file: an empty string table, then one token a line (export.py, "known file").
function readKnown(b: Uint8Array): Set<string> {
  const r = new Reader(b);
  readStrings(r);
  return new Set(DECODER.decode(b.subarray(r.pos)).split("\n"));
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
