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
/** Changes whenever any word's stem changes: store it beside stems. */
export declare const RULES_VERSION: string;
/** The language codes that have a table. */
export declare const LANGUAGES: readonly string[];
/**
 * The search key of `word` in language `lang` (as bn gu hi kn ml mr ne pa
 * sa ta te ur). Only the tag's language counts: "ta-IN", "TA" and "tam" are
 * "ta". For any other `lang`, `word` unchanged.
 */
export declare function stem(word: string, lang: string): string;
