/**
 * The phonetic key's engine, shared by ./phonetic and ./phonetic-search: the
 * compiler of a rules file, the normalizer, the standard engine and the key
 * product. Not an entry of the package.
 *
 * @module
 */
import rulesJson from "../phonetic/rules.json";
type Rules = Omit<typeof rulesJson, "initials" | "titles" | "initial_branches" | "brahmic" | "extra"> & {
    extra: Record<string, string>;
    initials?: Record<string, string[]>;
    initial_branches?: {
        from: number;
        to: number;
        also: string;
    }[];
    brahmic: Omit<typeof rulesJson.brahmic, "rewrite"> & {
        rewrite?: string[][];
    };
};
export declare function compile(rules: Rules): (word: string) => string[];
export declare const engine: (word: string) => string[];
/** The words of a name written in comma-separated parts (normalized words),
 * each part without its leading titles (Shri, Smt., श्रीमती, திரு); if every
 * word is a title, the last word stays (reference.py#name_parts). */
export declare function dropTitles(parts: string[][]): string[];
/** nameKeys and the search index stop here: a long Tamil name can have many key combinations. */
export declare const MAX_NAME_KEYS = 256;
export declare function normalize(word: string): string;
/** The combinations of the words' keys, one key of each word joined by sep,
 * the last word changing fastest, the first MAX_NAME_KEYS only. Each step
 * keeps at most MAX_NAME_KEYS prefixes, so the time is linear in the words,
 * not in the product (the search index built the whole product first: 2^26
 * strings for a 26-word name of two-key words). */
export declare function keyProduct(all: string[][], sep: string): string[];
export {};
