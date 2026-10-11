/**
 * The one key to index and to query by:
 * searchKey("किताबों", "hi") === searchKey("किताब", "hi"), and
 * searchKey("हिन्दी", "hi") === searchKey("हिंदी", "hi").
 *
 * It normalizes, stems, then folds. The order was measured on search: fold
 * after stem finds 2.4 points more of the right passages in Hindi and
 * changes nothing in Bengali, Telugu or Assamese; fold before stem costs
 * Assamese 3.7 points. A key is for matching only: never store it as text.
 *
 * @module
 */
/** The search key of `word` in language `lang` (a tag such as "hi", "hi-IN" or "hin"). */
export declare function searchKey(word: string, lang: string): string;
