/**
 * A search key for the forms of one word:
 * stem("ஆண்டில்", "ta") === stem("ஆண்டு", "ta").
 *
 * `stem` strips the longest ending listed for the language that leaves at
 * least two code points; in languages with the vowel step it then drops one
 * final vowel sign (the Dravidian enunciative u). A word with no listed
 * ending is its own stem, and so is every word of a language with no table.
 * Kannada, whose endings stack, runs all of this twice.
 *
 * A stem is a key, not text. Apply `stem` once to the words you index and
 * once to the query, and compare. stem(stem(w)) may cut again, as Snowball
 * and Lucene stems do. Normalize text first: `stem` compares code points.
 *
 * @module
 */

import rulesJson from "../stem/rules.json" with { type: "json" };
import { langCode } from "./lang";

type Table = { endings: Set<string>; vowel: boolean; passes: number };

const MIN_STEM: number = rulesJson.min_stem;
const MAX_END: number = rulesJson.max_end;
const VOWEL_SIGNS = new Set<string>(rulesJson.vowel_signs.map((c) => String.fromCodePoint(c)));
const TABLES = new Map<string, Table>(
  Object.entries(rulesJson.languages).map(([lang, l]) => [
    lang,
    { endings: new Set(l.endings), vowel: l.vowel_step, passes: l.passes },
  ]),
);

/** Changes whenever any word's stem changes: store it beside stems. */
export const RULES_VERSION: string = rulesJson.version;

/** The language codes that have a table. */
export const LANGUAGES: readonly string[] = [...TABLES.keys()].sort();

/**
 * The search key of `word` in language `lang` (any of the 22
 * languages of the Eighth Schedule). Only the tag's language counts: "ta-IN", "TA" and "tam" are
 * "ta". For any other `lang`, `word` unchanged.
 */
export function stem(word: string, lang: string, options?: StemOptions): string {
  let min = MIN_STEM;
  if (options?.minStem !== undefined) {
    min = options.minStem;
    if (!Number.isInteger(min) || min < MIN_STEM || MAX_END + min >= 16) {
      throw new RangeError(`stem: minStem must be ${MIN_STEM}..${15 - MAX_END}`);
    }
  }
  const t = TABLES.get(langCode(lang));
  if (!t) return word;
  for (let p = 0; p < t.passes; p++) word = cut(word, t, min);
  return word;
}

/** Options for {@link stem}. */
export type StemOptions = {
  /**
   * The fewest code points a stem keeps (default 2, at most 9). A field of
   * names wants 4: it halves the names that lose their end (करीना → कर) and
   * costs 0.5–2 points of search recall.
   */
  minStem?: number;
};

/** One pass: the longest listed ending, then the vowel step. */
function cut(word: string, t: Table, minStem: number): string {
  // Walk back over code points; starts[k] is the index where the last k
  // begin, so every candidate ending is one slice of word.
  const starts = [word.length];
  let i = word.length;
  while (starts.length <= MAX_END + minStem && i > 0) {
    const c = word.charCodeAt(--i);
    if (c >= 0xdc00 && c <= 0xdfff && i > 0) i--; // a low surrogate: its pair
    starts.push(i);
  }
  let n = i > 0 ? Infinity : starts.length - 1; // code points in word
  let end = word.length;
  for (let k = Math.min(MAX_END, n - minStem); k > 0; k--) {
    if (t.endings.has(word.slice(starts[k]))) {
      end = starts[k];
      n -= k;
      break;
    }
  }
  // every vowel sign is in U+0900-0D7F: one UTF-16 unit
  if (t.vowel && n > minStem && VOWEL_SIGNS.has(word[end - 1])) end--;
  return end === word.length ? word : word.slice(0, end);
}
