/**
 * A name's key is the same in every script it is written in: राम, ರಾಮ, രാമ,
 * ராம, رام and "Ram" share a key.
 *
 * A word has a SET of keys (most have one); two names match when they have
 * the same number of words and each pair of words shares a key.
 *
 * The rules change between versions, and a change makes stored keys stale.
 * Store RULES_VERSION next to your keys, and recompute them when it changes.
 *
 * @module
 */
/** The rules every key from this module was made with. */
export declare const RULES_VERSION: string;
/** NameKeys stops here: a long Tamil name can have many key combinations. */
export declare const MAX_NAME_KEYS = 256;
/** The sorted keys of one word; empty when it holds no letter the rules read. */
export declare function keys(word: string): string[];
/** A name split the way nameKeys and match split it: on spaces and
 * punctuation, with anything in brackets removed. */
export declare function words(name: string): string[];
/** The keys of a whole name, one per combination of its words' keys, words
 * separated by a space. Two names match when these share an element, so
 * these are what to index. At most MAX_NAME_KEYS. */
export declare function nameKeys(name: string): string[];
/** Joined keys shorter than this (in classes) are not returned: they find too many names. */
export declare const JOINED_MIN_CLASSES: number;
/** The keys of a name written as one word, its words joined: "Ram Nath" and
 * இராம்நாத் share no nameKeys, but can share a joined key. Only keys of at
 * least JOINED_MIN_CLASSES classes. A search looks them up only when
 * nameKeys find nobody; match does not use them. */
export declare function joinedKeys(name: string): string[];
/** Whether two names have the same number of words and every pair of words,
 * in order, shares a key. */
export declare function match(a: string, b: string): boolean;
