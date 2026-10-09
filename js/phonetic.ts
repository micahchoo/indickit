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

import rulesJson from "../phonetic/rules.json" with { type: "json" };
import { engine, keyProduct, MAX_NAME_KEYS, normalize } from "./phonetic-engine";

export { MAX_NAME_KEYS };


/** The rules every key from this module was made with. */
export const RULES_VERSION: string = rulesJson.version;


/** The sorted keys of one word; empty when it holds no letter the rules read. */
export function keys(word: string): string[] {
  const w = normalize(word);
  return w ? engine(w) : [];
}

// It splits on one character at a time (filter drops the empty words). The
// spaces are Python's \s (str.isspace), the reference's splitter
// (linguistic-utilities lu/names.py#words): JavaScript's \s without U+FEFF,
// with U+001C-001F and U+0085. Go's \s is ASCII only.
/** A name split the way nameKeys and match split it: on spaces and
 * punctuation, with anything in brackets removed. */
export function words(name: string): string[] {
  return name.replace(/\([^)]*\)/g, " ").split(/[^\S\ufeff]|[\x1c-\x1f\x85.\-,'’]/u).filter(Boolean);
}

/** The keys of a whole name, one per combination of its words' keys, words
 * separated by a space. Two names match when these share an element, so
 * these are what to index. At most MAX_NAME_KEYS. */
export function nameKeys(name: string): string[] {
  return keyProduct(words(name).map(keys).filter((ks) => ks.length), " ");
}

/** Joined keys shorter than this (in classes) are not returned: they find too many names. */
export const JOINED_MIN_CLASSES: number = rulesJson.joined.min_classes;

/** The keys of a name written as one word, its words joined: "Ram Nath" and
 * இராம்நாத் share no nameKeys, but can share a joined key. Only keys of at
 * least JOINED_MIN_CLASSES classes. A search looks them up only when
 * nameKeys find nobody; match does not use them. */
export function joinedKeys(name: string): string[] {
  const joined = words(name).map(normalize).join("");
  if (!joined) return [];
  return engine(joined).filter((k) => [...k].length >= JOINED_MIN_CLASSES);
}

/** Whether two names have the same number of words and every pair of words,
 * in order, shares a key. */
export function match(a: string, b: string): boolean {
  const wa = words(a), wb = words(b);
  if (!wa.length || wa.length !== wb.length) return false;
  return wa.every((w, i) => {
    const kb = new Set(keys(wb[i]));
    return keys(w).some((k) => kb.has(k));
  });
}
