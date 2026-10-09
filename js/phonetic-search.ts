/**
 * Phonetic search: the key finds candidates, and a scorer learned from data
 * ranks them 0..100. A Latin query finds a name in any script; a name in one
 * Indian script finds it in another.
 *
 *     const s = await loadSearch("hi");                 // fetches the Hindi table (a few KB)
 *     const ix = s.index(["नरेंद्र मोदी", "नरेश मोदी"]);
 *     ix.search("Narendra Modi", THRESHOLDS.names);     // [{ name: 0, score: 100 }]
 *
 * Two profiles: "names" (a list of names: a roster, a directory) and "text"
 * (a name among the words of a running text). A score is relative to the
 * other candidates of its search, so it belongs to the search, not to a pair.
 * Every step is integer arithmetic: Go, TypeScript and the reference give the
 * same scores.
 *
 * @module
 */

import searchJson from "../phonetic/scorer/search.json" with { type: "json" };
import fineJson from "../phonetic/scorer/fine.json" with { type: "json" };
import fine2Json from "../phonetic/scorer/fine2.json" with { type: "json" };
import { version as PACKAGE_VERSION } from "../package.json" with { type: "json" };
import { _internal, JOINED_MIN_CLASSES, MAX_NAME_KEYS, words } from "./phonetic";
import { isLetter, nfc } from "./unidata";

/** "names": a list of names; "text": a name among a text's words. */
export type Profile = "names" | "text";

type ProfileRules = { key: number; cost: number; vowel: number; div: number; stop_permille: number | null; stop_min_names: number; round: boolean };
const R = searchJson as unknown as {
  version: string; profiles: Record<Profile, ProfileRules>; posterior_temperature: number;
  deletion_min_classes: number; loose_joined_min_classes: number; thresholds: Record<string, number>;
  pow: number[]; exp2: number[];
};

/** Changes whenever any score changes. */
export const SEARCH_VERSION: string = R.version;

/** The scores measured for each use: names in a list 74, villages 72, a name
 * in text 80 (at most 10% of hits wrong) or 70 (20%). */
export const THRESHOLDS: Readonly<Record<string, number>> = R.thresholds;

const { compile, normalize, engine } = _internal;
const fineEngine = compile(fineJson);
const fine2Engine = compile(fine2Json);
const JOINED_MIN = JOINED_MIN_CLASSES;
const INF = 2 ** 30;
const floor = Math.floor;

// ---- integer helpers --------------------------------------------------------
function pow2neg(k: number): number {
  return k >= 0 && k < R.pow.length ? R.pow[k] : 0;
}

function log2x10(num: number, den: number): number {
  let q = 0;
  while (q + 1 < R.exp2.length && den * R.exp2[q + 1] <= num * 65536) q++;
  return q;
}

function ratio(a: string[], b: string[]): number {
  const n = a.length + b.length;
  if (!n) return 10000;
  let prev = new Array(b.length + 1).fill(0), cur = new Array(b.length + 1).fill(0);
  for (const x of a) {
    cur[0] = 0;
    for (let j = 0; j < b.length; j++) cur[j + 1] = x === b[j] ? prev[j] + 1 : Math.max(prev[j + 1], cur[j]);
    [prev, cur] = [cur, prev];
  }
  return floor((40000 * prev[b.length] + n) / (2 * n));
}

const rounded = (num: number, den: number) => floor((2 * num + den) / (2 * den));

// ---- words ------------------------------------------------------------------
const isAscii = (s: string) => /^[\x00-\x7f]*$/.test(s);
const keysOf = (w: string): string[] => engine(w);

function searchWords(name: string): string[] {
  const out: string[] = [];
  for (let w of words(name)) {
    w = normalize(w);
    if (isAscii(w)) w = w.replace(/[^a-z0-9]/g, "");
    if (w && keysOf(w).length) out.push(w);
  }
  return out;
}

const latSyms = (w: string): string[] => [...w.toLowerCase()].filter((c) => c >= "a" && c <= "z");
// Python's str.isspace: JavaScript's \s without U+FEFF, with U+001C-001F and U+0085
const natSyms = (w: string): string[] => [...nfc(w)].filter((c) => c !== "‌" && c !== "‍" && !/^(?:[^\S﻿]|[\x1c-\x1f\x85])$/u.test(c));

function deletions(k: string): string[] {
  const rs = [...k];
  if (rs.length < R.deletion_min_classes) return [];
  return rs.map((_, i) => rs.slice(0, i).join("") + rs.slice(i + 1).join(""));
}

const fineKey = (w: string): string[] => [...(fineEngine(w)[0] ?? "")];

function fine2Keys(w: string): string[][] {
  const arabic = [...w].some((c) => c >= "؀" && c <= "ۿ");
  const seen = new Set<string>(), out: string[][] = [];
  for (const f of fine2Engine(w)) {
    const rs = [...f];
    const g = [rs[0], ...rs.slice(1).filter((c) => c !== "a").map((c) => (c === "y" ? "i" : c))];
    if (arabic && g.length > 1 && g[g.length - 1] === "h") g.pop();
    const key = g.join("");
    if (!seen.has(key)) { seen.add(key); out.push(g); }
  }
  return out;
}

function vowelRatio(a: string, b: string): number {
  let best = 0;
  for (const x of fine2Keys(a)) for (const y of fine2Keys(b)) best = Math.max(best, ratio(x, y));
  return best;
}

const BLOCKS: [number, number, string][] = [[0x0600, 0x06ff, "arab"], [0x0750, 0x077f, "arab"], [0x0900, 0x097f, "deva"],
  [0x0980, 0x09ff, "beng"], [0x0a00, 0x0a7f, "guru"], [0x0a80, 0x0aff, "gujr"], [0x0b00, 0x0b7f, "orya"],
  [0x0b80, 0x0bff, "taml"], [0x0c00, 0x0c7f, "telu"], [0x0c80, 0x0cff, "knda"], [0x0d00, 0x0d7f, "mlym"],
  [0x1c50, 0x1c7f, "olck"], [0xabc0, 0xabff, "mtei"]];

function scriptOf(w: string): string {
  for (const c of w) {
    const o = c.codePointAt(0)!;
    if (isLetter(o)) return BLOCKS.find(([lo, hi]) => o >= lo && o <= hi)?.[2] ?? "";
  }
  return "";
}

// ---- tables ---------------------------------------------------------------------
type Sparse = [number, [number, number][]];
type RawTable = { latin?: string[]; native?: string[]; x?: string[]; y?: string[]; c: Sparse[]; units?: [number, number, number, [number, number][]][] };

class CostTable {
  readonly idx = new Map<string, number>();
  readonly v: number;
  readonly c: Float64Array;
  readonly units = new Map<number, Float64Array>();

  constructor(raw: RawTable) {
    const src = raw.latin ?? raw.x!, dst = raw.native ?? raw.y!;
    const alpha = [...src, ...dst];
    alpha.forEach((s, i) => this.idx.set(s, i + 1));
    this.v = alpha.length + 1;
    this.c = new Float64Array(this.v * this.v).fill(INF);
    raw.c.forEach(([d, ex], r) => {
      this.c.fill(d, r * this.v, (r + 1) * this.v);
      for (const [j, x] of ex) this.c[r * this.v + j] = x;
    });
    this.c[0] = 0;
    for (const [i, j, d, ex] of raw.units ?? []) {
      const row = new Float64Array(this.v).fill(INF);
      if (d >= 0) row.fill(d, src.length + 1);
      for (const [k, x] of ex) row[k] = x < 0 ? INF : x;
      this.units.set(i * this.v + j, row);
    }
  }

  ids(rs: string[]): number[] {
    return rs.map((r) => this.idx.get(r) ?? 0);
  }

  align(a: number[], b: number[], withUnits: boolean): number {
    const n = a.length, m = b.length, w = m + 1, v = this.v, c = this.c;
    const D = new Float64Array((n + 1) * w);
    for (let i = 1; i <= n; i++) D[i * w] = D[(i - 1) * w] + c[a[i - 1] * v];
    for (let j = 1; j <= m; j++) D[j] = D[j - 1] + c[b[j - 1]];
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        let best = D[(i - 1) * w + j - 1] + c[a[i - 1] * v + b[j - 1]];
        best = Math.min(best, D[(i - 1) * w + j] + c[a[i - 1] * v]);
        best = Math.min(best, D[i * w + j - 1] + c[b[j - 1]]);
        if (withUnits && i >= 2) {
          const row = this.units.get(a[i - 2] * v + a[i - 1]);
          if (row) best = Math.min(best, D[(i - 2) * w + j - 1] + row[b[j - 1]]);
        }
        D[i * w + j] = best;
      }
    }
    return D[n * w + m];
  }
}

/** Fetches one data file's bytes. The default reads it beside this module, else from jsDelivr. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;

/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export const CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${PACKAGE_VERSION}/phonetic/scorer/`;
const LOCAL = new URL("../phonetic/scorer/", import.meta.url);

async function fetchBytes(url: URL): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`phonetic-search: ${url}: ${res.status}`);
  return res.arrayBuffer();
}

const defaultFetcher: Fetcher = async (url) => {
  try {
    return await fetchBytes(url);
  } catch {
    return fetchBytes(new URL(url.href.slice(LOCAL.href.length), CDN));
  }
};

async function loadTable(path: string, fetcher: Fetcher): Promise<CostTable | undefined> {
  try {
    const bytes = await fetcher(new URL(path + ".json", LOCAL));
    return new CostTable(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return undefined; // no table: the scorer falls back to the fine keys
  }
}

// ---- the scorer -----------------------------------------------------------------
class Scorer {
  constructor(readonly lang: string, private latin: CostTable | undefined, private pairs: Map<string, CostTable>) {}

  cost(a: string, b: string): number | undefined {
    const aa = isAscii(a), ba = isAscii(b);
    let t: CostTable | undefined, x: string[], y: string[], n: number, units = false;
    if (aa !== ba) {
      const [lat, nat] = aa ? [a, b] : [b, a];
      if (!(t = this.latin)) return undefined;
      x = latSyms(lat); y = natSyms(nat); units = true;
      n = Math.max(x.length, 1);
    } else if (!aa) {
      let sa = scriptOf(a), sb = scriptOf(b);
      if (!sa || !sb || sa === sb) return undefined;
      if (sa > sb) { [a, b] = [b, a]; [sa, sb] = [sb, sa]; }
      if (!(t = this.pairs.get(`${sa}-${sb}`))) return undefined;
      x = natSyms(a); y = natSyms(b);
      n = Math.max(x.length, y.length, 1);
    } else return undefined;
    const total = t.align(t.ids(x), t.ids(y), units);
    return floor((20 * total + n) / (2 * n));
  }

  calibrations(a: string, cands: string[]): Map<string, number> {
    const cs = new Map<string, number>();
    for (const b of cands) { const c = this.cost(a, b); if (c !== undefined) cs.set(b, c); }
    const out = new Map<string, number>();
    if (!cs.size) return out;
    // Loops, not Math.min(...costs): a spread passes one argument per
    // candidate, and an engine throws RangeError past its limit.
    const na = Math.max(isAscii(a) ? latSyms(a).length : natSyms(a).length, 1);
    let best = Infinity, lo = Infinity;
    for (const c of cs.values()) {
      best = Math.min(best, c);
      lo = Math.min(lo, c * na);
    }
    const w = new Map<string, number>();
    let z = 0;
    for (const [b, c] of cs) { const x = pow2neg(floor((c * na - lo) / R.posterior_temperature)); w.set(b, x); z += x; }
    for (const [b, c] of cs) {
      const rel = floor((100 * pow2neg(c - best) + 500_000) / 1_000_000);
      const post = floor((100 * w.get(b)! + floor(z / 2)) / z);
      out.set(b, rel + post);
    }
    return out;
  }

  wordSim(a: string, b: string, cal: Map<string, number> | undefined, p: ProfileRules): number {
    const kb = new Set(keysOf(b));
    const meet = keysOf(a).some((k) => kb.has(k)) ? 1 : 0;
    let c2: number, v: number;
    if (isAscii(a) && isAscii(b)) { v = ratio(latSyms(a), latSyms(b)); c2 = 2 * v; }
    else if (cal?.has(b)) { c2 = 100 * cal.get(b)!; v = vowelRatio(a, b); }
    else if (this.cost(a, b) !== undefined) { c2 = 20000; v = vowelRatio(a, b); }
    else { v = ratio(fineKey(a), fineKey(b)); c2 = 2 * v; }
    const num = 2 * p.key * 10000 * meet + p.cost * c2 + 2 * p.vowel * v;
    return p.round ? rounded(num, 200 * p.div) : floor(num / (200 * p.div));
  }
}

/** A name found by a search: its position among the indexed names, and its score. */
export interface Hit { name: number; score: number }

function joinedOf(ws: string[], min: number): string[] {
  const j = ws.join("");
  return j ? keysOf(j).filter((k) => [...k].length >= min) : [];
}

function strictKeys(ws: string[]): string[] {
  const all = ws.map(keysOf).filter((ks) => ks.length);
  if (!all.length) return [];
  let out = [""];
  all.forEach((ks, i) => { out = out.flatMap((p) => ks.map((k) => (i ? p + "\x1f" + k : k))); });
  return out.slice(0, MAX_NAME_KEYS);
}

/** Names of one language, keyed once for searching. */
export class Index {
  private readonly words: string[][];
  private readonly n: number;
  private readonly df = new Map<string, number>();
  private readonly maps = { strict: new Map<string, number[]>(), joined: new Map<string, number[]>(), loose: new Map<string, number[]>(), near: new Map<string, number[]>() };
  private readonly p: ProfileRules;

  /** @internal Use Search.index. */
  constructor(private readonly scorer: Scorer, names: string[], profile: Profile) {
    const p = R.profiles[profile];
    if (!p) throw new Error(`phonetic-search: unknown profile "${profile}" ("names" or "text")`);
    this.p = p;
    this.n = names.length;
    this.words = names.map(searchWords);
    for (const ws of this.words) for (const k of new Set(ws.flatMap(keysOf))) this.df.set(k, (this.df.get(k) ?? 0) + 1);
    const add = (m: Map<string, number[]>, k: string, i: number) => {
      const l = m.get(k);
      if (!l) m.set(k, [i]); else if (l[l.length - 1] !== i) l.push(i);
    };
    this.words.forEach((ws, i) => {
      for (const k of strictKeys(ws)) add(this.maps.strict, k, i);
      for (const k of joinedOf(ws, JOINED_MIN)) add(this.maps.joined, k, i);
      for (const k of joinedOf(ws, R.loose_joined_min_classes)) add(this.maps.loose, k, i);
      for (const w of ws) for (const k of keysOf(w)) {
        if (this.common(k)) continue;
        add(this.maps.near, k, i);
        for (const d of deletions(k)) add(this.maps.near, d, i);
      }
    });
  }

  private common(k: string): boolean {
    const s = this.p.stop_permille; // no stop share in an index smaller than the smallest measured pool
    return s !== null && this.n >= this.p.stop_min_names && (this.df.get(k) ?? 0) * 1000 > this.n * s;
  }

  private weight(w: string): number {
    let best = 0;
    for (const k of keysOf(w)) best = Math.max(best, log2x10(this.n, Math.max(this.df.get(k) ?? 0, 1)));
    return best;
  }

  private candidates(qws: string[]): Set<number> {
    const out = new Set<number>();
    for (const k of strictKeys(qws)) for (const i of this.maps.strict.get(k) ?? []) out.add(i);
    if (!out.size) for (const k of joinedOf(qws, JOINED_MIN)) for (const i of this.maps.joined.get(k) ?? []) out.add(i);
    for (const k of joinedOf(qws, R.loose_joined_min_classes)) for (const i of this.maps.loose.get(k) ?? []) out.add(i);
    for (const w of qws) for (const k of keysOf(w)) {
      if (this.common(k)) continue;
      for (const d of [k, ...deletions(k)]) for (const i of this.maps.near.get(d) ?? []) out.add(i);
    }
    return out;
  }

  private nameScore(qws: string[], dws: string[], cal: Map<string, Map<string, number>>): number {
    let num = 0, den = 0;
    for (const [a, b, q] of [[qws, dws, true], [dws, qws, false]] as [string[], string[], boolean][]) {
      for (const w of a) {
        const x = this.weight(w);
        den += x;
        let best = 0;
        for (const o of b) best = Math.max(best, q ? this.scorer.wordSim(w, o, cal.get(w), this.p) : this.scorer.wordSim(o, w, cal.get(o), this.p));
        num += x * best;
      }
    }
    let soft = den ? floor((num + floor(den / 2)) / den) : 0;
    if (qws.length !== dws.length && qws.length && dws.length) {
      const jq = qws.join(""), jd = dws.join("");
      const lq = new Set(joinedOf([jq], R.loose_joined_min_classes));
      const meet = joinedOf([jd], R.loose_joined_min_classes).some((k) => lq.has(k)) ? 1 : 0;
      let c: number, v: number;
      if (this.scorer.cost(jq, jd) !== undefined) { c = 10000; v = vowelRatio(jq, jd); }
      else { c = v = ratio(fineKey(jq), fineKey(jd)); }
      const p = this.p, n = p.key * 10000 * meet + p.cost * c + p.vowel * v;
      soft = Math.max(soft, p.round ? rounded(n, 100 * p.div) : floor(n / (100 * p.div)));
    }
    return soft;
  }

  /** @internal */
  scoreAll(query: string, which: number[]): Hit[] {
    const qws = searchWords(query);
    const cw = [...new Set(which.flatMap((i) => this.words[i]))];
    const cal = new Map(qws.map((a) => [a, this.scorer.calibrations(a, cw)]));
    return which.map((i) => ({ name: i, score: this.nameScore(qws, this.words[i], cal) }));
  }

  /** The names scoring at least threshold, best first (ties in index order). */
  search(query: string, threshold = 0): Hit[] {
    const which = [...this.candidates(searchWords(query))].sort((a, b) => a - b);
    return this.scoreAll(query, which).filter((h) => h.score >= threshold).sort((a, b) => b.score - a.score);
  }
}

/** A loaded language: index names, or score candidates. */
export interface Search {
  readonly lang: string;
  /** Key names (of this language, or Latin) once for searching. */
  index(names: string[], profile?: Profile): Index;
  /** One score per candidate name, calibrated among these candidates. */
  score(query: string, candidates: string[], profile?: Profile): number[];
}

/** Loads one language's table (Latin queries against its script) and, for
 * native-to-native search, the tables between the scripts named in `scripts`
 * (e.g. ["deva", "arab", "beng"]). A missing table falls back to the fine keys. */
export async function loadSearch(lang: string, options: { scripts?: string[]; fetcher?: Fetcher } = {}): Promise<Search> {
  const fetcher = options.fetcher ?? defaultFetcher;
  const scripts = [...new Set(options.scripts ?? [])].sort();
  const pairs = new Map<string, CostTable>();
  const [latin] = await Promise.all([
    loadTable(`latin/${lang}`, fetcher),
    ...scripts.flatMap((a, i) => scripts.slice(i + 1).map(async (b) => {
      const t = await loadTable(`pairs/${a}-${b}`, fetcher);
      if (t) pairs.set(`${a}-${b}`, t);
    })),
  ]);
  const scorer = new Scorer(lang, latin as CostTable | undefined, pairs);
  return {
    lang,
    index: (names, profile = "names") => new Index(scorer, names, profile),
    score: (query, candidates, profile = "names") =>
      new Index(scorer, candidates, profile).scoreAll(query, candidates.map((_, i) => i)).map((h) => h.score),
  };
}
