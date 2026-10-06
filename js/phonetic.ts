/**
 * A name's key is the same in every script it is written in: राम, ರಾಮ, രാമ,
 * ராம, رام and "Ram" share a key.
 *
 * A word has a SET of keys (most have one); two names match when they have
 * the same number of words and each pair of words shares a key.
 *
 * The rules change between versions, and a change makes stored keys stale.
 * Store RULES_VERSION next to your keys, and recompute them when it changes.
 *
 * @module
 */

import rulesJson from "../phonetic/rules.json" with { type: "json" };

type Rules = typeof rulesJson;

// The engine: every table and switch is in rules.json; this is only the loop.
function compile(rules: Rules) {
  const b = rules.brahmic;
  // Lookups by code point in plain arrays: no Map, no regex, on the hot path.
  const byOffset: (string | undefined)[] = new Array(128);
  for (const [o, c] of Object.entries(b.class_by_offset)) byOffset[Number(o)] = c;
  const extra = new Map(Object.entries(rules.extra));
  const urdu = new Map(Object.entries(rules.urdu.letters));
  const meetei = new Map(Object.entries(rules.meetei.letters));
  const olChiki = new Map(Object.entries(rules.ol_chiki.letters));
  const latin: (string | undefined)[] = new Array(128);
  for (const [l, c] of Object.entries(rules.latin.letters)) latin[l.charCodeAt(0)] = c;
  const groups = rules.latin.groups as [string, string][];
  // a later w before none of these is "w": v, or a vowel in Bodo spelling
  const wUnlessNext: string = rules.latin.w_ambiguous_unless_before;
  const classMap = new Map(Object.entries(rules.class_map));
  const vowels = new Set(rules.vowels);
  const steps = rules.steps;
  const u = rules.urdu;

  function inMeetei(o: number): boolean {
    return rules.meetei.ranges.some(([lo, hi]) => o >= lo && o <= hi);
  }

  function readBrahmic(word: string): string {
    let out = "";
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const x = extra.get(ch);
      if (x !== undefined) { out += x; continue; }
      const o = word.charCodeAt(i);
      if (o < b.from || o > b.to) continue;
      const off = o & 0x7f;
      if (off === b.virama_offset) continue;
      if (off === b.candrabindu_offset) { out += b.candrabindu_class; continue; }
      const c = byOffset[off];
      if (c !== undefined) out += c;
    }
    return out;
  }

  function readLatin(word: string): string {
    let out = "";
    let i = 0;
    outer: while (i < word.length) {
      for (const [g, cls] of groups) {
        if (word.startsWith(g, i)) { out += cls; i += g.length; continue outer; }
      }
      const ch = word.charCodeAt(i);
      if (ch === 99 /* c */) {
        const next = word[i + 1];
        out += next === "e" || next === "i" || next === "y" ? "s" : "k";
      } else if (ch === 119 /* w */ && i > 0 && !wUnlessNext.includes(word[i + 1] ?? " ")) {
        out += "w";
      } else {
        out += latin[ch] ?? "";
      }
      i++;
    }
    return out;
  }

  function readUrdu(word: string): string {
    let out = word[0] === u.ain ? "a" : "";
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === u.waw && i > 0 && !(i + 1 < word.length && u.waw_v_before.includes(word[i + 1]))) out += "w";
      else out += urdu.get(ch) ?? "";
    }
    const n = word.length;
    if (n > 1 && u.final_he.includes(word[n - 1]) && !u.final_he_h_after.includes(word[n - 2])) {
      out = out.slice(0, -1) + "a";
    }
    return out;
  }

  function readOlChiki(word: string): string {
    let out = "";
    for (const ch of word) {
      if (ch === rules.ol_chiki.aspiration && out && !vowels.has(out[out.length - 1])) continue;
      out += olChiki.get(ch) ?? "";
    }
    return out;
  }

  function readMeetei(word: string): string {
    let out = "";
    for (const ch of word) out += meetei.get(ch) ?? "";
    return out;
  }

  function read(word: string): string {
    let ascii = true;
    for (let i = 0; i < word.length; i++) if (word.charCodeAt(i) > 0x7f) { ascii = false; break; }
    if (ascii) return readLatin(word);
    let ol = false, me = false;
    for (let i = 0; i < word.length; i++) {
      const o = word.charCodeAt(i);
      if (o >= u.from && o <= u.to) return readUrdu(word);
      if (o >= rules.ol_chiki.from && o <= rules.ol_chiki.to) ol = true;
      else if (inMeetei(o)) me = true;
    }
    if (ol) return readOlChiki(word);
    if (me) return readMeetei(word);
    return readBrahmic(word);
  }

  function fold(codes: string): string {
    if (steps["ng-k"]) {
      let s = "";
      for (let i = 0; i < codes.length; i++) {
        s += codes[i];
        if (codes[i] === "ṅ" && codes[i + 1] !== "k") s += "k";
      }
      codes = s;
    }
    let mapped = "";
    for (let i = 0; i < codes.length; i++) mapped += classMap.get(codes[i]) ?? codes[i];
    if (!mapped) return mapped;
    let head = mapped[0];
    if (steps["initial-vowels-alike"] && vowels.has(head)) head = "a";
    // drop-h, drop-y and drop-vowels all remove from the tail; drop-y-after-i
    // sits between them only when it is on, and the ports refuse it.
    let out = head;
    for (let i = 1; i < mapped.length; i++) {
      const c = mapped[i];
      if (steps["drop-h"] && c === "h") continue;
      if (steps["drop-y"] && c === "y") continue;
      if (steps["drop-vowels"] && vowels.has(c)) continue;
      out += c;
    }
    if (steps["drop-final-vowel"] && out.length > 1 && vowels.has(out[out.length - 1])) out = out.slice(0, -1);
    let runs = out[0];
    for (let i = 1; i < out.length; i++) if (out[i] !== out[i - 1]) runs += out[i];
    return runs;
  }

  function variants(word: string): string[] {
    const classes = read(word);
    let vs = [classes];
    for (const br of rules.branches) {
      if (!classes.includes(br.class)) continue;
      let inScript = false;
      for (let i = 0; i < word.length; i++) {
        const o = word.charCodeAt(i);
        if (o >= br.from && o <= br.to) { inScript = true; break; }
      }
      if (!inScript) continue;
      for (let i = 0; i < classes.length; i++) {
        if (classes[i] === br.class && vs.length * 2 <= rules.max_keys) {
          vs = vs.concat(vs.map((v) => v.slice(0, i) + br.also + v.slice(i + 1)));
        }
      }
    }
    return vs;
  }

  return function keys(word: string): string[] {
    const bases = [word];
    const first = word.charCodeAt(0);
    for (const sf of rules.suffixes) {
      if (first < sf.from || first > sf.to) continue;
      for (const e of sf.endings) {
        if (word.endsWith(e) && word.length - e.length >= 2) { bases.push(word.slice(0, -e.length)); break; }
      }
    }
    const out = new Set<string>();
    for (const base of bases) for (const v of variants(base)) out.add(fold(v));
    return [...out].sort();
  };
}

const engine = compile(rulesJson);

/** The rules every key from this module was made with. */
export const RULES_VERSION: string = rulesJson.version;

/** NameKeys stops here: a long Tamil name can have many key combinations. */
export const MAX_NAME_KEYS = 256;

// Latin is lower-cased with its accents removed (ā → a); anything else is NFC.
function normalize(word: string): string {
  const plain = word.normalize("NFD").replace(/\p{Mn}/gu, "");
  return /^[\x00-\x7f]*$/.test(plain) ? plain.toLowerCase() : word.normalize("NFC");
}

/** The sorted keys of one word; empty when it holds no letter the rules read. */
export function keys(word: string): string[] {
  const w = normalize(word);
  return w ? engine(w) : [];
}

/** A name split the way nameKeys and match split it: on spaces and
 * punctuation, with anything in brackets removed. */
export function words(name: string): string[] {
  return name.replace(/\([^)]*\)/g, " ").split(/[\s.\-,'’]+/u).filter(Boolean);
}

/** The keys of a whole name, one per combination of its words' keys, words
 * separated by a space. Two names match when these share an element, so
 * these are what to index. At most MAX_NAME_KEYS. */
export function nameKeys(name: string): string[] {
  let out = [""];
  for (const w of words(name)) {
    const ks = keys(w);
    if (!ks.length) continue;
    const next: string[] = [];
    for (const p of out) for (const k of ks) {
      if (next.length < MAX_NAME_KEYS) next.push(p ? p + " " + k : k);
    }
    out = next;
  }
  return out[0] === "" ? [] : out;
}

/** Whether two names have the same number of words and every pair of words,
 * in order, shares a key. */
export function match(a: string, b: string): boolean {
  const wa = words(a), wb = words(b);
  if (!wa.length || wa.length !== wb.length) return false;
  return wa.every((w, i) => {
    const kb = new Set(keys(wb[i]));
    return keys(w).some((k) => kb.has(k));
  });
}
