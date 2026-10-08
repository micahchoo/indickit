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

// A branch gives a word a second key with one class read as another (also; ""
// deletes it). after/before name the classes that may stand next to it ("^"
// the word's start, "$" its end); absent means any.
type Branch = { from: number; to: number; class: string; also: string; after?: string; before?: string; not_before?: string };

const DELETED = "\u0000"; // a class a branch removes, until the fold drops it

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

const engine = compile(rulesJson);

/** @internal For ./phonetic-search: the engine compiler, the normalizer and the
 * search key's engine (keys of a normalized word). Not part of the API. */
export const _internal = { compile: (r: unknown) => compile(r as Rules), normalize: (w: string) => normalize(w), engine };

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

// It splits on one character at a time (filter drops the empty words). The
// spaces are Python's \s (str.isspace), the reference's splitter
// (linguistic-utilities lu/names.py#words): JavaScript's \s without U+FEFF,
// with U+001C-001F and U+0085. Go's \s is ASCII only.
/** A name split the way nameKeys and match split it: on spaces and
 * punctuation, with anything in brackets removed. */
export function words(name: string): string[] {
  return name.replace(/\([^)]*\)/g, " ").split(/[^\S\ufeff]|[\x1c-\x1f\x85.\-,'’]/u).filter(Boolean);
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

/** Joined keys shorter than this (in classes) are not returned: they find too many names. */
export const JOINED_MIN_CLASSES: number = rulesJson.joined.min_classes;

/** The keys of a name written as one word, its words joined: "Ram Nath" and
 * இராம்நாத் share no nameKeys, but can share a joined key. Only keys of at
 * least JOINED_MIN_CLASSES classes. A search looks them up only when
 * nameKeys find nobody; match does not use them. */
export function joinedKeys(name: string): string[] {
  const joined = words(name).map(normalize).join("");
  if (!joined) return [];
  return engine(joined).filter((k) => [...k].length >= JOINED_MIN_CLASSES);
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
