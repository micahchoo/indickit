/**
 * Script converters for romanize's script route (rules 2026-10-13.2; rules.json "converters"): Sindhi in
 * Devanagari to Perso-Arabic ("abjad"), Bengali-script Manipuri to Meetei Mayek ("bengali_meetei"). Every
 * letter and switch is data; these are only the loops of the reference (linguistic-utilities
 * jobs/romanize/converters.py) and of Go's romanize/convert.go.
 *
 * @module
 */
/** One converter's data, as rules.json holds it. */
export type Converter = {
    kind: "abjad" | "bengali_meetei";
    halant: string;
    skip?: string;
    consonants: Record<string, string>;
    signs: Record<string, string>;
    signs_after_vowel?: Record<string, string>;
    vowels_initial?: Record<string, string>;
    vowels_medial?: Record<string, string>;
    vowels?: Record<string, string>;
    nasals: Record<string, string>;
    prothetic: {
        letters: string;
        out: string;
    };
    lonsum?: Record<string, string>;
    other?: Record<string, string>;
    aa?: string;
    nung?: string;
    lonsum_ng?: string;
    nga?: string;
    khanda?: string;
    ya?: string;
    ya_i?: string;
    w_letter?: string;
    w_after?: string;
    w_out?: string;
    conjunct_next?: string;
    apun?: string;
    joiners?: string;
    ou?: string;
    ou_not_before?: string[];
    ou_out?: string;
};
/** The converter's output for one word (NFC, joiners deleted, as romanize reads it). */
export declare function convert(cv: Converter, w: string): string;
