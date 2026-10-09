import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
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

// README "Search a list of names": the example must give what the README shows.
test("the README example", async () => {
  const s = await loadSearch("hi", { fetcher: local });
  const ix = s.index(["नरेश मोदी", "नरेंद्र मोदी", "मनमोहन सिंह"]);
  expect(ix.search("Narendra Modi", THRESHOLDS.names)).toEqual([{ name: 1, score: 100 }]);
  expect(ix.search("Manmohan Singh", THRESHOLDS.names)).toEqual([{ name: 2, score: 96 }]);
});

// docs/phonetic.md, "Search": the sizes and the small-list example.
test("the docs' claims about size and small lists hold", async () => {
  const docs = readFileSync(new URL("../docs/phonetic.md", import.meta.url), "utf8").replace(/\s+/g, " ");
  const gz = gzipSync(readFileSync(new URL("../dist/phonetic-search.js", import.meta.url))).length;
  expect(docs).toContain("The browser file is 21 KB gzipped, and a language's table 2–6 KB more");
  expect(gz).toBeLessThan(21.5 * 1024);
  const dir = new URL("../phonetic/scorer/latin/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const kb = gzipSync(readFileSync(new URL(f, dir))).length / 1024;
    expect([f, kb >= 1.5 && kb < 6.5]).toEqual([f, true]);
  }
  const s = await loadSearch("hi", { fetcher: local });
  const four = s.index(["श्री नरेंद्र मोदी", "नरेश मोदी", "सुरेंद्र मोदी", "डॉ. मनमोहन सिंह"]);
  expect(four.search("Narendra Modi", 0)[0]).toEqual({ name: 0, score: 73 });
  expect(docs).toContain(`"Narendra Modi" scores 73 against "श्री नरेंद्र मोदी" in a list of four names`);
});

// Perf job, phase 1. More candidates than a function call takes arguments:
// Math.min(...costs) threw RangeError from about 125,000 distinct words in
// Node, 1,000,000 in Bun.
test("score takes 1,000,000 candidates", async () => {
  const N = 1_000_000;
  const letters = "bcdfghjklmnprstv";
  const cands: string[] = [];
  for (let i = 0; cands.length < N; i++) {
    let w = "";
    for (let x = i; ; x = Math.floor(x / 16)) {
      w += letters[x % 16] + "a";
      if (x < 16) break;
    }
    cands.push(w);
  }
  expect((await searchFor("hi")).score("राम", cands).length).toBe(N);
}, 60_000);

// A query word whose cost x length passes 2^30 (Go divided by zero there).
// The scores are the Python reference's.
test("a 10,617-letter query word scores as the reference", async () => {
  const q = Array.from("कকਕકକகకಕകকبᱚꯀa".repeat(1200)).slice(0, 10617).join("");
  expect((await searchFor("hi")).score(q, ["five", "vi"])).toEqual([0, 0]);
});
