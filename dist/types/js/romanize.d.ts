/**
 * Indian-language text in Latin letters, the way people spell it:
 * लक्ष्मी → lakshmi, മലൈക → malaika, پرویز → parvez.
 *
 * A ranked list: one word has several accepted spellings (Choudhury,
 * Chowdhury), and the first is the most likely. Two modes: "words" for
 * running text (the default) and "names" for fields known to hold person
 * names, where a lookup of known names comes first.
 *
 * The tables are learned from data and loaded per language, on demand:
 *
 *     const r = await load("hi");        // fetches the Hindi and Brahmic files (beside this module, else jsDelivr)
 *     r.word("लक्ष्मी");                   // ["lakshmi", ...]
 *
 * The output is deterministic: the same input gives the same list in Go and
 * in TypeScript.
 *
 * @module
 */
/** The tables: "words" for running text, "names" for person names. */
export type Mode = "words" | "names";
/** Changes whenever any output changes: store it beside romanized text. */
export declare const RULES_VERSION: string;
/** The language codes that have tables, for one mode. */
export declare function languages(mode?: Mode): string[];
/** Fetches one data file's bytes. The default reads it beside this module. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;
/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export declare const CDN: string;
/** One language's loaded tables. */
export interface Romanizer {
    readonly lang: string;
    readonly mode: Mode;
    /** Up to n spellings of one word (default 4), most likely first. */
    word(word: string, n?: number): string[];
    /** Every run of the language's script romanized (its top spelling); everything else kept. */
    text(text: string): string;
}
/**
 * Loads a language's tables for one mode: its own file and its script
 * group's pooled file (shared by the group, fetched once). It reads them
 * beside this module, else from jsDelivr at this package's version (the npm
 * package carries no tables); `base` or `fetch` replaces both. Rejects when
 * the language has no tables for the mode.
 */
export declare function load(lang: string, mode?: Mode, opts?: {
    fetch?: Fetcher;
    base?: URL | string;
}): Promise<Romanizer>;
/** Builds a Romanizer from a language's two files (for tests and offline use). */
export declare function fromBytes(lang: string, mode: Mode, own: Uint8Array, pool: Uint8Array): Romanizer;
/** Moves every Brahmic code point to the Devanagari block by its offset (rules.json "unify"). */
export declare function unify(w: string): string;
/** @internal The model's own list for a unified word (no lookup), for the conformance test. */
export declare function _decode(r: Romanizer, word: string, n: number): string[];
