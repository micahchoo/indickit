import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadSearch, THRESHOLDS, type Search } from "./phonetic-search";

// phonetic/testdata/scorer-conformance.jsonl.gz: scores and searches from the
// Python reference; the Go package reads the same file. Every row must agree.
const local = async (url: URL) => readFileSync(fileURLToPath(url)).buffer as ArrayBuffer;
const SCRIPTS = ["arab", "beng", "deva", "gujr", "guru", "knda", "mlym", "mtei", "olck", "orya", "taml", "telu"];
const loaded = new Map<string, Promise<Search>>();
const searchFor = (lang: string) => {
  if (!loaded.has(lang)) loaded.set(lang, loadSearch(lang, { scripts: SCRIPTS, fetcher: local }));
  return loaded.get(lang)!;
};

test("every row gives the reference scores", async () => {
  const file = new URL("../phonetic/testdata/scorer-conformance.jsonl.gz", import.meta.url);
  const rows = gunzipSync(readFileSync(file)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const wrong: string[] = [];
  const kinds: Record<string, number> = {};
  for (const r of rows) {
    kinds[r.t] = (kinds[r.t] ?? 0) + 1;
    if (r.t === "score") {
      const got = (await searchFor(r.lang)).score(r.q, r.c, r.profile);
      if (got.join() !== r.s.join()) wrong.push(`score ${r.lang} ${r.q}: ${got} ≠ ${r.s}`);
    } else if (r.t === "search") {
      const ix = (await searchFor(r.lang)).index(r.names, r.profile);
      r.queries.forEach((q: string, i: number) => {
        const got = ix.search(q, 0).map((h) => [h.name, h.score]);
        if (JSON.stringify(got) !== JSON.stringify(r.hits[i])) wrong.push(`search ${r.lang} ${q}`);
      });
    }
  }
  expect(kinds.score).toBeGreaterThan(800);
  expect(kinds.search).toBeGreaterThan(140);
  expect(wrong.slice(0, 10)).toEqual([]);
}, 120_000);

test("a Latin name finds its native spelling first", async () => {
  const s = await loadSearch("hi", { fetcher: local });
  const hits = s.index(["नरेश मोदी", "नरेंद्र मोदी", "सुरेंद्र मोदी"]).search("Narendra Modi", THRESHOLDS.names);
  expect(hits[0]).toEqual({ name: 1, score: 100 });
});
