/**
 * The phonetic key's engine, shared by ./phonetic and ./phonetic-search: the
 * compiler of a rules file, the normalizer, the standard engine and the key
 * product. Not an entry of the package.
 *
 * @module
 */

import rulesJson from "../phonetic/rules.json" with { type: "json" };
import { isMn, nfc, nfd } from "./unidata";

type Rules = typeof rulesJson;

// A branch gives a word a second key with one class read as another (also; ""
// deletes it). after/before name the classes that may stand next to it ("^"
// the word's start, "$" its end); absent means any.
type Branch = { from: number; to: number; class: string; also: string; after?: string; before?: string; not_before?: string };

const DELETED = "\u0000"; // a class a branch removes, until the fold drops it

// The engine: every table and switch is in rules.json; this is only the loop.
export function compile(rules: Rules) {
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
    let last = -1; // offset of the last letter read, for the nukta
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const x = extra.get(ch);
      if (x !== undefined) { out += x; last = -1; continue; }
      const o = word.charCodeAt(i);
      if (o < b.from || o > b.to) continue;
      const off = o & 0x7f;
      const c = byOffset[off];
      if (off === b.nukta_offset && b.flap_offsets.includes(last) && out) {
        out = out.slice(0, -1) + b.flap_class; // ड + nukta is the flap ड़
      } else if (off === b.virama_offset) {
        // no sound of its own
      } else if (off === b.candrabindu_offset) {
        out += b.candrabindu_class;
      } else if (c !== undefined) {
        out += c;
      }
      if (c !== undefined) last = off;
      else if (off !== b.nukta_offset && off !== b.virama_offset) last = -1;
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

  // Does position i of the reader's classes stand in the branch's context?
  function fits(classes: string, i: number, br: Branch): boolean {
    const prev = i > 0 ? classes[i - 1] : "^";
    const next = i + 1 < classes.length ? classes[i + 1] : "$";
    return (br.after === undefined || br.after.includes(prev)) &&
      (br.before === undefined || br.before.includes(next)) &&
      !(br.not_before ?? "").includes(next);
  }

  function variants(word: string): string[] {
    const classes = read(word);
    let vs = [classes];
    for (const br of rules.branches as Branch[]) {
      if (!classes.includes(br.class)) continue;
      let inScript = false;
      for (let i = 0; i < word.length; i++) {
        const o = word.charCodeAt(i);
        if (o >= br.from && o <= br.to) { inScript = true; break; }
      }
      if (!inScript) continue;
      for (let i = 0; i < classes.length; i++) {
        if (classes[i] === br.class && vs.length * 2 <= rules.max_keys && fits(classes, i, br)) {
          const also = br.also || DELETED; // every variant keeps the reader's length
          vs = vs.concat(vs.map((v) => v.slice(0, i) + also + v.slice(i + 1)));
        }
      }
    }
    return vs.map((v) => v.replaceAll(DELETED, ""));
  }

  // A word of these digits (zero, then 1-9) only is a number: १२ → "12".
  function number(word: string): string | undefined {
    let out = "";
    for (let i = 0; i < word.length; i++) {
      const o = word.charCodeAt(i);
      const z = rules.digit_zeros.find((z) => o >= z && o <= z + 9);
      if (z === undefined) return undefined;
      out += String.fromCharCode(0x30 + o - z);
    }
    return out || undefined;
  }

  // Never holds "": a word with no letter and no number has no key.
  return function keys(word: string): string[] {
    const n = number(word);
    if (n !== undefined) return [n];
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
    out.delete("");
    return [...out].sort();
  };
}

export const engine = compile(rulesJson);

/** nameKeys and the search index stop here: a long Tamil name can have many key combinations. */
export const MAX_NAME_KEYS = 256;

// Latin is lower-cased with its accents removed (ā → a); anything else is NFC.
// Each code point is decomposed alone: the ASCII letters that survive are
// starters, which canonical ordering never moves.
export function normalize(word: string): string {
  let plain = "";
  for (const c of word) {
    for (const cp of nfd(c.codePointAt(0)!)) {
      if (isMn(cp)) continue;
      if (cp >= 0x80) return nfc(word);
      plain += String.fromCodePoint(cp);
    }
  }
  return plain.toLowerCase();
}

/** The combinations of the words' keys, one key of each word joined by sep,
 * the last word changing fastest, the first MAX_NAME_KEYS only. Each step
 * keeps at most MAX_NAME_KEYS prefixes, so the time is linear in the words,
 * not in the product (the search index built the whole product first: 2^26
 * strings for a 26-word name of two-key words). */
export function keyProduct(all: string[][], sep: string): string[] {
  let out = [""];
  for (const ks of all) {
    const next: string[] = [];
    for (const p of out) for (const k of ks) {
      if (next.length < MAX_NAME_KEYS) next.push(p ? p + sep + k : k);
    }
    out = next;
  }
  return out[0] === "" ? [] : out;
}
