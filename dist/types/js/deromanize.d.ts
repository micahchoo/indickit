/**
 * Indian-language text from Latin typing, the reverse of romanize:
 * namaste → नमस्ते, ahmad → احمد, vanakkam → வணக்கம்.
 *
 * A ranked list: one typed word can stand for several native words (kamal:
 * कमल, कमाल), and the first is the most likely. Two modes: "words" for
 * running text (the default) and "names" for fields known to hold person
 * names.
 *
 * It writes the word it is given in the language's script, so English words
 * in mixed text ("kal meeting hai") are written in it too: identify each
 * word's language first.
 *
 * The tables are learned from data and loaded per language, on demand:
 *
 *     const d = await load("hi");   // fetches the Hindi and Brahmic files (beside this module, else jsDelivr)
 *     d.word("namaste");            // ["नमस्ते", ...]
 *
 * The output is deterministic: the same input gives the same list in Go and
 * in TypeScript.
 *
 * @module
 */
/** The tables: "words" for running text, "names" for person names. */
export type Mode = "words" | "names";
/** Changes whenever any output changes. */
export declare const RULES_VERSION: string;
/** The language codes that have tables, for one mode. */
export declare function languages(mode?: Mode): string[];
/** Fetches one data file's bytes. The default reads it beside this module. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;
/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export declare const CDN: string;
/** One language's loaded tables. */
export interface Deromanizer {
    readonly lang: string;
    readonly mode: Mode;
    /** Up to n native spellings of one Latin-typed word (default 4), most likely first. */
    word(latin: string, n?: number): string[];
    /** Every run of Latin letters written as its first native spelling; everything else kept. */
    text(text: string): string;
}
/** The input as the training pairs were read: accents removed, lower case, a-z only. */
export declare function clean(s: string): string;
/**
 * Loads a language's tables for one mode: its own files, its word list and its
 * script group's pooled files (shared by the group, fetched once). It reads them
 * beside this module, else from jsDelivr at this package's version (the npm
 * package carries no tables); `base` or `fetch` replaces both. Rejects when the
 * language has no tables for the mode.
 */
export declare function load(lang: string, mode?: Mode, opts?: {
    fetch?: Fetcher;
    base?: URL | string;
}): Promise<Deromanizer>;
/** Builds a Deromanizer from its files, by file name (for tests and offline use). */
export declare function fromBytes(lang: string, mode: Mode, files: Record<string, Uint8Array>): Deromanizer;
