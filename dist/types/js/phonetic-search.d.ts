/**
 * Phonetic search: the key finds candidates, and a scorer learned from data
 * ranks them 0..100. A Latin query finds a name in any script; a name in one
 * Indian script finds it in another.
 *
 *     const s = await loadSearch("hi");                 // fetches the Hindi table (a few KB)
 *     const ix = s.index(["नरेंद्र मोदी", "नरेश मोदी"]);
 *     ix.search("Narendra Modi", THRESHOLDS.names);     // [{ name: 0, score: 100 }]
 *
 * Two profiles: "names" (a list of names: a roster, a directory) and "text"
 * (a name among the words of a running text). A score is relative to the
 * other candidates of its search, so it belongs to the search, not to a pair.
 * Every step is integer arithmetic: Go, TypeScript and the reference give the
 * same scores.
 *
 * @module
 */
/** "names": a list of names; "text": a name among a text's words. */
export type Profile = "names" | "text";
type ProfileRules = {
    key: number;
    cost: number;
    vowel: number;
    div: number;
    stop_permille: number | null;
    stop_min_names: number;
    round: boolean;
};
/** Changes whenever any score changes. */
export declare const SEARCH_VERSION: string;
/** The scores measured for each use: names in a list 74, villages 72, a name
 * in text 80 (at most 10% of hits wrong) or 70 (20%). */
export declare const THRESHOLDS: Readonly<Record<string, number>>;
type Sparse = [number, [number, number][]];
type RawTable = {
    latin?: string[];
    native?: string[];
    x?: string[];
    y?: string[];
    c: Sparse[];
    units?: [number, number, number, [number, number][]][];
};
declare class CostTable {
    readonly idx: Map<string, number>;
    readonly v: number;
    readonly c: Float64Array;
    readonly units: Map<number, Float64Array<ArrayBufferLike>>;
    constructor(raw: RawTable);
    ids(rs: string[]): number[];
    align(a: number[], b: number[], withUnits: boolean): number;
}
/** Fetches one data file's bytes. The default reads it beside this module, else from jsDelivr. */
export type Fetcher = (url: URL) => Promise<ArrayBuffer>;
/** Where the tables are when they are not beside this module: jsDelivr, at this package's version. */
export declare const CDN: string;
declare class Scorer {
    readonly lang: string;
    private latin;
    private pairs;
    constructor(lang: string, latin: CostTable | undefined, pairs: Map<string, CostTable>);
    cost(a: string, b: string): number | undefined;
    calibrations(a: string, cands: string[]): Map<string, number>;
    wordSim(a: string, b: string, cal: Map<string, number> | undefined, p: ProfileRules): number;
}
/** A name found by a search: its position among the indexed names, and its score. */
export interface Hit {
    name: number;
    score: number;
}
/** Names of one language, keyed once for searching. */
export declare class Index {
    private readonly scorer;
    private readonly words;
    private readonly n;
    private readonly df;
    private readonly maps;
    private readonly p;
    /** @internal Use Search.index. */
    constructor(scorer: Scorer, names: string[], profile: Profile);
    private common;
    private weight;
    private candidates;
    private nameScore;
    /** @internal */
    scoreAll(query: string, which: number[]): Hit[];
    /** The names scoring at least threshold, best first (ties in index order). */
    search(query: string, threshold?: number): Hit[];
}
/** A loaded language: index names, or score candidates. */
export interface Search {
    readonly lang: string;
    /** Key names (of this language, or Latin) once for searching. */
    index(names: string[], profile?: Profile): Index;
    /** One score per candidate name, calibrated among these candidates. */
    score(query: string, candidates: string[], profile?: Profile): number[];
}
/** Loads one language's table (Latin queries against its script) and, for
 * native-to-native search, the tables between the scripts named in `scripts`
 * (e.g. ["deva", "arab", "beng"]). A missing table falls back to the fine keys. */
export declare function loadSearch(lang: string, options?: {
    scripts?: string[];
    fetcher?: Fetcher;
}): Promise<Search>;
export {};
