/**
 * A search key for the forms of one word:
 * stem("ஆண்டில்", "ta") === stem("ஆண்டு", "ta").
 *
 * `stem` strips the longest ending listed for the language that leaves at
 * least two code points; in languages with the vowel step it then drops one
 * final vowel sign (the Dravidian enunciative u). A word with no listed
 * ending is its own stem, and so is every word of a language with no table.
 *
 * A stem is a key, not text. Apply `stem` once to the words you index and
 * once to the query, and compare. stem(stem(w)) may cut again, as Snowball
 * and Lucene stems do. Normalize text first: `stem` compares code points.
 *
 * @module
 */

import rulesJson from "../stem/rules.json" with { type: "json" };

type Table = { endings: Set<string>; vowel: boolean };

const MIN_STEM: number = rulesJson.min_stem;
const MAX_END: number = rulesJson.max_end;
const VOWEL_SIGNS = new Set<string>(rulesJson.vowel_signs.map((c) => String.fromCodePoint(c)));
const TABLES = new Map<string, Table>(
  Object.entries(rulesJson.languages).map(([lang, l]) => [
    lang,
    { endings: new Set(l.endings), vowel: l.vowel_step },
  ]),
);

/** Changes whenever any word's stem changes: store it beside stems. */
export const RULES_VERSION: string = rulesJson.version;

/** The language codes that have a table. */
export const LANGUAGES: readonly string[] = [...TABLES.keys()].sort();

/**
 * The search key of `word` in language `lang` (as bn gu hi kn ml mr ne pa
 * sa ta te ur). For any other `lang`, `word` unchanged.
 */
export function stem(word: string, lang: string): string {
  const t = TABLES.get(lang);
  if (!t) return word;
  const r = Array.from(word);
  let end = r.length;
  for (let k = Math.min(MAX_END, r.length - MIN_STEM); k > 0; k--) {
    if (t.endings.has(r.slice(r.length - k).join(""))) {
      end = r.length - k;
      break;
    }
  }
  if (t.vowel && end > MIN_STEM && VOWEL_SIGNS.has(r[end - 1])) end--;
  return end === r.length ? word : r.slice(0, end).join("");
}
