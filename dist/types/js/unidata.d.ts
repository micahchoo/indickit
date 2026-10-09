/**
 * The Unicode data indickit reads inside the blocks it has rules for (Arabic,
 * Devanagari to Malayalam, Ol Chiki, Vedic, Devanagari Extended, Meetei
 * Mayek): one pinned table, internal/unidata/unicode15.json, which the Go
 * package internal/unidata also reads. So Go and TypeScript give one answer
 * whatever Unicode version the engine ships, and a move to a new Unicode
 * version is a change to the table: a rules change, with a conformance run
 * (MAINTAINING.md, "Upkeep").
 *
 * Outside the blocks the engine answers (`\p{..}`, `String.prototype.normalize`).
 * The Latin blocks indickit also reads are closed (every code point is
 * assigned), and Unicode's stability policy freezes the decomposition and
 * combining class of an assigned code point, so the engine cannot drift there.
 *
 * @module
 */
/** The Unicode version of the table. */
export declare const UNICODE_VERSION: string;
/** Whether the table answers for this code point. */
export declare const inBlocks: (cp: number) => boolean;
/** General_Category Mn. */
export declare function isMn(cp: number): boolean;
/** General_Category Mn, Mc or Me. */
export declare function isMark(cp: number): boolean;
/** General_Category L. */
export declare function isLetter(cp: number): boolean;
/** The full canonical decomposition of one code point. */
export declare function nfd(cp: number): number[];
/**
 * Unicode NFC. The string is cut before each stable code point of the
 * blocks. A piece made only of code points of the blocks is composed from
 * the table; a piece holding any other code point goes to the engine, whose
 * data for the blocks' assigned code points equals the table's (stability
 * policy), and which alone knows the combining classes outside the blocks.
 */
export declare function nfc(s: string): string;
