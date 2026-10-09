/**
 * wellformed: can a font draw this text whole? A text renderer (HarfBuzz)
 * draws a dotted circle (◌) where a character cannot join the syllable
 * before it: a vowel sign with no letter before it (ि at the start of a
 * word, as PDF text layers give it), a vowel sign after a virama, a third
 * anusvara. isWellFormed("िहन्दी") is false; brokenAt gives the index
 * of the first such character. Use it to reject or flag text before you
 * store or index it.
 *
 * The rules are HarfBuzz's own verdicts, swept over every character after
 * every character of each script, and kept in rules.json; this code only
 * walks them. A text is cut into runs of one script (with the invisible
 * characters and the placeholders NBSP and ◌ between them); a space, a
 * digit or a letter of another script ends a run. In a run, a character is
 * broken when it starts the run and its class is in the start set, or the
 * widest window that holds its class and up to three classes before it
 * says so (quads, then triples, then pairs), or it ends the run and its
 * class is pending (Malayalam dot reph ൎ, which waits for a consonant).
 *
 * Arabic and Ol Chiki runs are always whole: HarfBuzz draws no dotted
 * circle inside them. Only HarfBuzz was tested; DirectWrite and CoreText
 * have their own grammars.
 *
 * @module
 */
/** True when a font draws text with no dotted circle. */
export declare function isWellFormed(text: string): boolean;
/** The UTF-16 index of the first character a font draws with a dotted circle, or -1. */
export declare function brokenAt(text: string): number;
/** The rules version; a stored verdict goes stale when it changes. */
export declare const RULES_VERSION: string;
