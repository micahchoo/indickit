/**
 * normalize: one encoding for text that looks the same. Two strings that a
 * reader cannot tell apart (an invisible joiner, an old Malayalam chillu, a
 * ज़ typed as one code point or two) get the same bytes; what a reader sees
 * never changes. Use it before you store, index or compare text.
 *
 * fold: normalize, then merge accepted spellings of one word (हिन्दी and
 * हिंदी, गाँव and गांव). Its output is still readable, but it loses
 * information on purpose: apply it to a query and to an index, never to
 * stored text.
 *
 * `lang` is a language tag ("as", "hi", "as-IN", "asm"); only its language
 * counts, not case, region or script. Assamese text needs it: after
 * a virama, Assamese ৰ and Bengali র look alike, and each language keeps its
 * own.
 *
 * The rules change between versions. Store RULES_VERSION next to output that
 * you keep, and recompute it when the version changes.
 *
 * @module
 */
/** Changes when any output changes: store it beside normalized text that you keep. */
export declare const RULES_VERSION: string;
/** One encoding for text that looks the same; never changes what a reader sees. */
export declare function normalize(text: string, lang?: string): string;
/** normalize, then merge accepted spellings of one word. For search only. */
export declare function fold(text: string, lang?: string): string;
