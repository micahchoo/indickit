/**
 * The letters a reader sees: segment("ಲಕ್ಷ್ಮಿ") is ["ಲ", "ಕ್ಷ್ಮಿ"].
 *
 * Unicode's grapheme clusters (UAX #29) keep a conjunct whole only where the
 * script's virama is a conjunct linker: not in Kannada or Gurmukhi, so
 * Intl.Segmenter gives ಲ|ಕ್|ಷ್|ಮಿ. `segment` is the grapheme clusters of
 * Unicode 17.0, computed here (no platform Unicode version), then a few
 * joins after a virama, each measured: every consonant in Kannada, ਰ and ਹ in
 * Gurmukhi, য before া in Bengali (অ্যা), and Tamil ஸ்ரீ.
 *
 * @module
 */
/** The letters of text, in order; joined, they give text back. */
export declare function segment(text: string): string[];
/** How many letters a reader sees in text. */
export declare function count(text: string): number;
/** Inner letter boundaries of text, as code-point offsets (for tests and tools). */
export declare function codePointBounds(text: string): number[];
/** The rules version; stored letter counts go stale when it changes. */
export declare const RULES_VERSION: string;
/** The Unicode version of the grapheme-cluster data. */
export declare const UNICODE_VERSION: string;
