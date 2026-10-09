/**
 * wellformed: can a font draw this text whole? A text renderer (HarfBuzz)
 * draws a dotted circle (◌) where a character cannot join the syllable
 * before it: a vowel sign with no letter before it (ि at the start of a
 * word, as PDF text layers give it), a vowel sign after a virama, a third
 * anusvara. isWellFormed("िहन्दी") is false; brokenAt gives the index
 * of the first such character. Use it to reject or flag text before you
 * store or index it.
 *
 * The rules are HarfBuzz's own verdicts, swept over every character after
 * every character of each script, and kept in rules.json; this code only
 * walks them. A text is cut into runs of one script (with the invisible
 * characters and the placeholders NBSP and ◌ between them); a space, a
 * digit or a letter of another script ends a run. In a run, a character is
 * broken when it starts the run and its class is in the start set, or the
 * widest window that holds its class and up to three classes before it
 * says so (quads, then triples, then pairs), or it ends the run and its
 * class is pending (Malayalam dot reph ൎ, which waits for a consonant).
 *
 * Arabic and Ol Chiki runs are always whole: HarfBuzz draws no dotted
 * circle inside them. Only HarfBuzz was tested; DirectWrite and CoreText
 * have their own grammars.
 *
 * @module
 */

import rulesJson from "../wellformed/rules.json" with { type: "json" };

interface ScriptRules {
  names: string[];
  blocks: Record<string, string>;
  shared: string;
  start: string;
  pending: string;
  pairs: Record<string, string>;
  triples_broken: Record<string, string>;
  triples_whole: Record<string, string>;
  quads_broken: Record<string, string>;
  quads_whole: Record<string, string>;
}
interface Rules { version: string; invisible: string; placeholder: string; scripts: Record<string, ScriptRules> }

/** One script's tables. A class is one character; a window is the classes of its characters, joined. */
interface Script {
  cls: Map<number, string>;
  start: Set<string>;
  pending: Set<string>;
  pairs: Set<string>;
  tb: Set<string>;
  tw: Set<string>;
  qb: Set<string>;
  qw: Set<string>;
}

function compile(rules: Rules) {
  const own = new Map<number, Script>(); // a character of one of our scripts: its script
  const shared = Array.from(rules.invisible + rules.placeholder, (c) => c.codePointAt(0)!);
  const sharedSet = new Set(shared); // invisible characters and placeholders: they stay in the run around them
  const tuples = (byPrefix: Record<string, string>) =>
    new Set(Object.entries(byPrefix).flatMap(([prefix, ys]) => [...ys].map((y) => prefix + y)));
  for (const t of Object.values(rules.scripts)) {
    const s: Script = {
      cls: new Map(), start: new Set(t.start), pending: new Set(t.pending),
      pairs: tuples(t.pairs), tb: tuples(t.triples_broken), tw: tuples(t.triples_whole),
      qb: tuples(t.quads_broken), qw: tuples(t.quads_whole),
    };
    for (const [first, run] of Object.entries(t.blocks)) {
      const lo = parseInt(first, 16);
      for (let i = 0; i < run.length; i++) {
        if (run[i] !== ".") {
          s.cls.set(lo + i, run[i]);
          own.set(lo + i, s);
        }
      }
    }
    shared.forEach((c, i) => s.cls.set(c, t.shared[i]));
  }

  /** The index in run of its first broken character, or -1. */
  function check(s: Script, run: number[]): number {
    // h: the last three classes so far; n: how many classes so far. Every rule
    // reads at most three classes back, so a longer history (h += y on the
    // whole run) only made the check quadratic in the run.
    let h = "", n = 0;
    for (let i = 0; i < run.length; i++) {
      const y = s.cls.get(run[i])!;
      let bad: boolean;
      if (n === 0) bad = s.start.has(y);
      else if (n >= 3 && s.qb.has(h.slice(-3) + y)) bad = true;
      else if (n >= 3 && s.qw.has(h.slice(-3) + y)) bad = false;
      else if (n >= 2 && s.tb.has(h.slice(-2) + y)) bad = true;
      else if (n >= 2 && s.tw.has(h.slice(-2) + y)) bad = false;
      else bad = s.pairs.has(h.slice(-1) + y);
      if (bad) return i;
      h += y;
      n += y.length;
      if (h.length > 3) h = h.slice(-3);
    }
    if (n > 0 && s.pending.has(h[h.length - 1])) return run.length - 1;
    return -1;
  }

  return function brokenAt(text: string): number {
    let sc: Script | undefined; // the script of the run so far
    let run: number[] = [];
    let at = 0; // the UTF-16 index of the run's first character (every run character is one unit)
    let pos = 0;
    const flush = () => (sc && run.length ? check(sc, run) : -1);
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      const o = own.get(cp);
      if ((o === undefined && sharedSet.has(cp)) || (o !== undefined && (sc === undefined || o === sc))) {
        if (run.length === 0) at = pos;
        run.push(cp);
        if (o !== undefined) sc = o;
      } else {
        const i = flush();
        if (i >= 0) return at + i;
        run = o ? [cp] : [];
        sc = o;
        at = pos;
      }
      pos += ch.length;
    }
    const i = flush();
    return i >= 0 ? at + i : -1;
  };
}

const broken = compile(rulesJson as Rules);

/** True when a font draws text with no dotted circle. */
export function isWellFormed(text: string): boolean {
  return broken(text) < 0;
}

/** The UTF-16 index of the first character a font draws with a dotted circle, or -1. */
export function brokenAt(text: string): number {
  return broken(text);
}

/** The rules version; a stored verdict goes stale when it changes. */
export const RULES_VERSION: string = rulesJson.version;
