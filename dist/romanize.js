// romanize/rules.json
var rules_default = {
  beam: {
    names: 12,
    words: 8
  },
  bos: "<s>",
  eos: "</s>",
  families: {
    names: {
      as: {
        file: "as.names.bin",
        group: "brahmic",
        lookup: 669,
        pooled: "names-brahmic.bin",
        tag: "as"
      },
      bn: {
        file: "bn.names.bin",
        group: "brahmic",
        lookup: 1785,
        pooled: "names-brahmic.bin",
        tag: "bn"
      },
      gom: {
        file: "gom.names.bin",
        group: "brahmic",
        lookup: 17,
        pooled: "names-brahmic.bin",
        tag: "gom"
      },
      gu: {
        file: "gu.names.bin",
        group: "brahmic",
        lookup: 131,
        pooled: "names-brahmic.bin",
        tag: "gu"
      },
      hi: {
        file: "hi.names.bin",
        group: "brahmic",
        lookup: 1152,
        pooled: "names-brahmic.bin",
        tag: "hi"
      },
      kn: {
        file: "kn.names.bin",
        group: "brahmic",
        lookup: 448,
        pooled: "names-brahmic.bin",
        tag: "kn"
      },
      ks: {
        file: "ks.names.bin",
        group: "arabic",
        lookup: 130,
        pooled: "names-arabic.bin",
        tag: "ks"
      },
      mai: {
        file: "mai.names.bin",
        group: "brahmic",
        lookup: 150,
        pooled: "names-brahmic.bin",
        tag: "mai"
      },
      ml: {
        file: "ml.names.bin",
        group: "brahmic",
        lookup: 908,
        pooled: "names-brahmic.bin",
        tag: "ml"
      },
      mni: {
        file: "mni.names.bin",
        group: "meetei",
        lookup: 253,
        pooled: "names-meetei.bin",
        tag: "mni"
      },
      mr: {
        file: "mr.names.bin",
        group: "brahmic",
        lookup: 716,
        pooled: "names-brahmic.bin",
        tag: "mr"
      },
      ne: {
        file: "ne.names.bin",
        group: "brahmic",
        lookup: 146,
        pooled: "names-brahmic.bin",
        tag: "ne"
      },
      or: {
        file: "or.names.bin",
        group: "brahmic",
        lookup: 610,
        pooled: "names-brahmic.bin",
        tag: "or"
      },
      pa: {
        file: "pa.names.bin",
        group: "brahmic",
        lookup: 996,
        pooled: "names-brahmic.bin",
        tag: "pa"
      },
      sa: {
        file: "sa.names.bin",
        group: "brahmic",
        lookup: 66,
        pooled: "names-brahmic.bin",
        tag: "sa"
      },
      sat: {
        file: "sat.names.bin",
        group: "olchiki",
        lookup: 407,
        pooled: "names-olchiki.bin",
        tag: "sat"
      },
      sd: {
        file: "sd.names.bin",
        group: "arabic",
        lookup: 72,
        pooled: "names-arabic.bin",
        tag: "sd"
      },
      ta: {
        file: "ta.names.bin",
        group: "brahmic",
        lookup: 3961,
        pooled: "names-brahmic.bin",
        tag: "ta"
      },
      te: {
        file: "te.names.bin",
        group: "brahmic",
        lookup: 2126,
        pooled: "names-brahmic.bin",
        tag: "te"
      },
      ur: {
        file: "ur.names.bin",
        group: "arabic",
        lookup: 1961,
        pooled: "names-arabic.bin",
        tag: "ur"
      }
    },
    words: {
      as: {
        file: "as.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "as:w"
      },
      bn: {
        file: "bn.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "bn:w"
      },
      brx: {
        file: "brx.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "brx:w"
      },
      doi: {
        file: "doi.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "doi:w"
      },
      gom: {
        file: "gom.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "gom:w"
      },
      gu: {
        file: "gu.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "gu:w"
      },
      hi: {
        file: "hi.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "hi:w"
      },
      kn: {
        file: "kn.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "kn:w"
      },
      ks: {
        file: "ks.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "ks:w"
      },
      mai: {
        file: "mai.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "mai:w"
      },
      ml: {
        file: "ml.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ml:w"
      },
      mni: {
        file: "mni.words.bin",
        group: "meetei",
        lookup: 0,
        pooled: "words-meetei.bin",
        tag: "mni:w"
      },
      mr: {
        file: "mr.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "mr:w"
      },
      ne: {
        file: "ne.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ne:w"
      },
      or: {
        file: "or.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "or:w"
      },
      pa: {
        file: "pa.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "pa:w"
      },
      sa: {
        file: "sa.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "sa:w"
      },
      sd: {
        file: "sd.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "sd:w"
      },
      ta: {
        file: "ta.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ta:w"
      },
      te: {
        file: "te.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "te:w"
      },
      ur: {
        file: "ur.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "ur:w"
      }
    }
  },
  files: {
    "as.names.bin": 89974,
    "as.words.bin": 235757,
    "bn.names.bin": 182011,
    "bn.words.bin": 377491,
    "brx.words.bin": 208654,
    "doi.words.bin": 48681,
    "gom.names.bin": 9361,
    "gom.words.bin": 324293,
    "gu.names.bin": 38634,
    "gu.words.bin": 370117,
    "hi.names.bin": 162471,
    "hi.words.bin": 468425,
    "kn.names.bin": 73095,
    "kn.words.bin": 273776,
    "ks.names.bin": 36223,
    "ks.words.bin": 445883,
    "mai.names.bin": 40421,
    "mai.words.bin": 381362,
    "ml.names.bin": 133130,
    "ml.words.bin": 342656,
    "mni.names.bin": 12382,
    "mni.words.bin": 133350,
    "mr.names.bin": 119082,
    "mr.words.bin": 327753,
    "names-arabic.bin": 188775,
    "names-brahmic.bin": 594055,
    "names-meetei.bin": 43805,
    "names-olchiki.bin": 97591,
    "ne.names.bin": 37468,
    "ne.words.bin": 297072,
    "or.names.bin": 83867,
    "or.words.bin": 285972,
    "pa.names.bin": 140045,
    "pa.words.bin": 419426,
    "sa.names.bin": 24600,
    "sa.words.bin": 243993,
    "sat.names.bin": 73397,
    "sd.names.bin": 11896,
    "sd.words.bin": 463475,
    "ta.names.bin": 295030,
    "ta.words.bin": 244532,
    "te.names.bin": 229077,
    "te.words.bin": 295013,
    "ur.names.bin": 192400,
    "ur.words.bin": 540255,
    "words-arabic.bin": 1182486,
    "words-brahmic.bin": 2542643,
    "words-meetei.bin": 198229,
    "words-olchiki.bin": 61705
  },
  groups: {
    arabic: [
      1536,
      1791
    ],
    brahmic: [
      2304,
      3455
    ],
    meetei: [
      43744,
      44031
    ],
    olchiki: [
      7248,
      7295
    ]
  },
  max_n: 3,
  order: 3,
  rules_version: "2026-10-07",
  unify: {
    from: [
      2432,
      3455
    ],
    mask: 127,
    to_block: 2304
  },
  unknown_penalty: 20,
  version: 1
};
// package.json
var version = "0.8.0";

// js/lang.ts
var ISO_639_2 = "asm as ben bn guj gu hin hi kan kn kas ks mal ml mar mr nep ne ori or pan pa san sa snd sd tam ta tel te urd ur ";
function langCode(tag) {
  const t = (tag ?? "").toLowerCase().split(/[-_]/)[0];
  const i = t.length === 3 ? ISO_639_2.indexOf(t + " ") : -1;
  return i >= 0 && i % 7 === 0 ? ISO_639_2.slice(i + 4, i + 6) : t;
}

// js/romanize.ts
var RULES = rules_default;
var RULES_VERSION = RULES.rules_version;
function languages(mode = "words") {
  return Object.keys(RULES.families[mode]).sort();
}
var CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${version}/romanize/lang/`;
async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`romanize: ${url}: ${res.status}`);
  return res.arrayBuffer();
}
function defaultFetcher(local) {
  return async (url) => {
    try {
      return await fetchBytes(url);
    } catch {
      return fetchBytes(new URL(url.href.slice(local.href.length), CDN));
    }
  };
}
function code(lang) {
  const c = langCode(lang);
  return c === "kok" ? "gom" : c;
}
var pooledCache = new Map;
async function load(lang, mode = "words", opts = {}) {
  const c = code(lang);
  const l = RULES.families[mode][c];
  if (!l)
    throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../romanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const poolKey = `${base}${l.group}/${l.pooled}`;
  if (!pooledCache.has(poolKey))
    pooledCache.set(poolKey, get(new URL(`${l.group}/${l.pooled}`, base)));
  const [own, pool] = await Promise.all([get(new URL(`${c}/${l.file}`, base)), pooledCache.get(poolKey)]);
  return fromBytes(c, mode, new Uint8Array(own), new Uint8Array(pool));
}
function fromBytes(lang, mode, own, pool) {
  const l = RULES.families[mode][lang];
  if (!l)
    throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const x = new Mix(own, pool, l.tag, RULES.beam[mode]);
  const [lo, hi] = RULES.groups[l.group];
  const inScript = (ch) => {
    const cp = ch.codePointAt(0);
    return cp >= lo && cp <= hi || cp === 8204 || cp === 8205;
  };
  const letter = /[\p{L}\p{M}‌‍]/u;
  const word = (w, n = 4) => {
    const s = w.normalize("NFC");
    const known = x.lookup.get(s);
    if (known)
      return known.slice(0, n);
    return x.decode(unify(s), n).filter((o) => o !== "");
  };
  const r = {
    lang,
    mode,
    word,
    text(t) {
      const cs = [...t.normalize("NFC")];
      let out = "";
      for (let i = 0;i < cs.length; ) {
        if (!(inScript(cs[i]) && letter.test(cs[i]))) {
          out += cs[i++];
          continue;
        }
        let j = i;
        while (j < cs.length && inScript(cs[j]) && letter.test(cs[j]))
          j++;
        const run = cs.slice(i, j).join("");
        out += word(run, 1)[0] ?? run;
        i = j;
      }
      return out;
    }
  };
  Object.defineProperty(r, "_mix", { value: x });
  return r;
}
function unify(w) {
  const u = RULES.unify;
  let out = "";
  for (const ch of w) {
    const cp = ch.codePointAt(0);
    out += cp >= u.from[0] && cp <= u.from[1] ? String.fromCodePoint(u.to_block + (cp & u.mask)) : ch;
  }
  return out;
}

class Reader {
  b;
  pos = 4;
  constructor(b) {
    this.b = b;
    if (b[0] !== 73 || b[1] !== 75 || b[2] !== 82 || b[3] !== 49)
      throw new Error("romanize: not an IKR1 file");
  }
  varint() {
    let v = 0;
    let shift = 1;
    for (;; ) {
      const byte = this.b[this.pos++];
      v += (byte & 127) * shift;
      if (byte < 128)
        return v;
      shift *= 128;
    }
  }
  str() {
    const n = this.varint();
    const s = DECODER.decode(this.b.subarray(this.pos, this.pos + n));
    this.pos += n;
    return s;
  }
  float64() {
    const v = new DataView(this.b.buffer, this.b.byteOffset + this.pos, 8).getFloat64(0, true);
    this.pos += 8;
    return v;
  }
}
var DECODER = new TextDecoder;
var ID = 2 ** 21;
function ctxKey(ctx, from) {
  let k = 0;
  for (let i = from;i < ctx.length; i++)
    k = k * ID + (ctx[i] + 1);
  return k;
}

class Model {
  vocab;
  levels = [];
  constructor(r, strs, ids) {
    this.vocab = r.varint();
    for (let l = r.varint();l > 0; l--) {
      const lv = { stats: new Map, counts: new Map };
      for (let c = r.varint();c > 0; c--) {
        const ctx = [];
        for (let i = r.varint();i > 0; i--)
          ctx.push(ids.id(strs[r.varint()]));
        const key = ctxKey(ctx, 0);
        const counts = new Map;
        let total = 0;
        let prev = 0;
        for (let t = r.varint();t > 0; t--) {
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
  stats(ctx) {
    const s = { counts: [], total: [], wb: [] };
    for (let n = 0;n < this.levels.length; n++) {
      const key = ctxKey(ctx, ctx.length - n);
      const st = this.levels[n].stats.get(key);
      if (st && st[1] !== 0) {
        s.counts[n] = this.levels[n].counts.get(key);
        s.total[n] = st[0];
        s.wb[n] = st[0] / (st[0] + st[1]);
      }
    }
    return s;
  }
  prob(s, tok) {
    let p = 1 / (this.vocab + 1);
    for (let n = 0;n < this.levels.length; n++) {
      const c = s.counts[n];
      if (!c)
        continue;
      const lam = s.wb[n];
      p = lam * (c.get(tok) ?? 0) / s.total[n] + (1 - lam) * p;
    }
    return p;
  }
}

class Interner {
  ids = new Map;
  strs = [];
  id(s) {
    let v = this.ids.get(s);
    if (v === undefined) {
      v = this.strs.length;
      this.ids.set(s, v);
      this.strs.push(s);
    }
    return v;
  }
}
function before(a, b) {
  if (a.score !== b.score)
    return a.score > b.score;
  if (a.out !== b.out)
    return a.out < b.out;
  return a.idx < b.idx;
}
function top(cs, k) {
  const best = [];
  for (const c of cs) {
    if (best.length === k && !before(c, best[k - 1]))
      continue;
    let lo = 0;
    let hi = best.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (before(c, best[mid]))
        hi = mid;
      else
        lo = mid + 1;
    }
    best.splice(lo, 0, c);
    if (best.length > k)
      best.pop();
  }
  return best;
}

class Mix {
  beam;
  a;
  b;
  lam;
  start = [];
  eos;
  options = new Map;
  lookup = new Map;
  constructor(own, pool, tag, beam) {
    this.beam = beam;
    const ids = new Interner;
    let r = new Reader(pool);
    let strs = readStrings(r);
    this.b = new Model(r, strs, ids);
    r = new Reader(own);
    strs = readStrings(r);
    this.lam = r.float64();
    this.a = new Model(r, strs, ids);
    for (let k = r.varint();k > 0; k--) {
      const native = r.str();
      const sp = [];
      for (let i = r.varint();i > 0; i--)
        sp.push(strs[r.varint()]);
      this.lookup.set(native, sp);
    }
    for (let i = 0;i < RULES.order - 2; i++)
      this.start.push(ids.id(RULES.bos));
    this.start.push(ids.id(`<s:${tag}>`));
    this.eos = ids.id(RULES.eos);
    const seen = new Set;
    for (const m of [this.a, this.b]) {
      for (const counts of m.levels[0].counts.values()) {
        for (const t of counts.keys()) {
          if (t === this.eos || seen.has(t))
            continue;
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
    for (const list of this.options.values())
      list.sort((p, q) => p.en < q.en ? -1 : p.en > q.en ? 1 : 0);
    if (this.start.length > 2 || ids.strs.length >= ID)
      throw new Error("romanize: beyond the engine's limits");
  }
  logp(sa, sb, tok) {
    const pa = Math.exp(Math.log(this.a.prob(sa, tok)));
    const pb = Math.exp(Math.log(this.b.prob(sb, tok)));
    return Math.log(this.lam * pa + (1 - this.lam) * pb);
  }
  decode(word, n) {
    const w = [...word];
    const h = RULES.order - 1;
    const root = { score: 0, out: "", ctx: this.start };
    const beams = Array.from({ length: w.length + 1 }, () => []);
    beams[0].push({ score: 0, out: "", parent: null, tok: -1, idx: 0 });
    const context = (c) => {
      if (c.tok < 0)
        return c.parent.ctx;
      const ctx = [...c.parent.ctx, c.tok];
      return ctx.slice(ctx.length - h);
    };
    for (let i = 0;i < w.length; i++) {
      if (beams[i].length === 0)
        continue;
      for (const c of top(beams[i], this.beam)) {
        const hy = i === 0 ? root : { score: c.score, out: c.out, ctx: context(c) };
        let moved = false;
        const sa = this.a.stats(hy.ctx);
        const sb = this.b.stats(hy.ctx);
        for (let k = 1;k <= RULES.max_n && i + k <= w.length; k++) {
          const opts = this.options.get(w.slice(i, i + k).join(""));
          if (!opts)
            continue;
          for (const o of opts) {
            const next = beams[i + k];
            next.push({ score: hy.score + this.logp(sa, sb, o.tok), out: hy.out + o.en, parent: hy, tok: o.tok, idx: next.length });
            moved = true;
          }
        }
        if (!moved) {
          const next = beams[i + 1];
          next.push({ score: hy.score - RULES.unknown_penalty, out: hy.out, parent: hy, tok: -1, idx: next.length });
        }
      }
    }
    const final = new Map;
    for (const c of beams[w.length]) {
      const ctx = c.parent === null ? this.start : context(c);
      const s = c.score + this.logp(this.a.stats(ctx), this.b.stats(ctx), this.eos);
      const v = final.get(c.out);
      if (v === undefined || s > v)
        final.set(c.out, s);
    }
    return [...final].sort((p, q) => p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0).slice(0, n).map((e) => e[0]);
  }
}
function readStrings(r) {
  const strs = [];
  for (let i = r.varint();i > 0; i--)
    strs.push(r.str());
  return strs;
}
function _decode(r, word, n) {
  return r._mix.decode(word, n);
}
export {
  unify,
  load,
  languages,
  fromBytes,
  _decode,
  RULES_VERSION,
  CDN
};
