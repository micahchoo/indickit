// The built file is what users get: run the conformance file against it in
// plain Node, with no TypeScript and no bun. `node js/check-dist.mjs`
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { keys, match, RULES_VERSION } from "../dist/phonetic.js";

const text = gunzipSync(readFileSync(new URL("../phonetic/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
let n = 0, wrong = 0;
for (const line of text.split("\n")) {
  if (!line) continue;
  const [word, want] = JSON.parse(line);
  n++;
  if (keys(word).join(" ") !== [...want].sort().join(" ")) {
    if (wrong++ < 10) console.error(`${word}: ${keys(word)} ≠ ${want}`);
  }
}
if (wrong || n < 190_000 || !match("Ram", "राम")) {
  console.error(`dist/phonetic.js: ${wrong} of ${n} words differ`);
  process.exit(1);
}
console.log(`dist/phonetic.js: all ${n} words agree (rules ${RULES_VERSION})`);

// dist/normalize.js against normalize/testdata/conformance.jsonl.gz
const { normalize, fold, RULES_VERSION: NORMALIZE_VERSION } = await import("../dist/normalize.js");
const lines = gunzipSync(readFileSync(new URL("../normalize/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
let m = 0, off = 0;
for (const line of lines.split("\n")) {
  if (!line) continue;
  const [input, lang, wantN, wantF] = JSON.parse(line);
  m++;
  if (normalize(input, lang ?? undefined) !== wantN || fold(input, lang ?? undefined) !== wantF) {
    if (off++ < 10) console.error(JSON.stringify([input, lang, wantN, wantF]));
  }
}
if (off || m < 300_000) {
  console.error(`dist/normalize.js: ${off} of ${m} inputs differ`);
  process.exit(1);
}
console.log(`dist/normalize.js: all ${m} inputs agree (rules ${NORMALIZE_VERSION})`);

// dist/segment.js against segment/testdata/conformance.jsonl.gz
const { codePointBounds, RULES_VERSION: SEGMENT_VERSION } = await import("../dist/segment.js");
const cases = gunzipSync(readFileSync(new URL("../segment/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
let k = 0, bad = 0;
for (const line of cases.split("\n")) {
  if (!line) continue;
  const [input, want] = JSON.parse(line);
  k++;
  if (codePointBounds(input).join(",") !== want.join(",")) {
    if (bad++ < 10) console.error(JSON.stringify([input, want]));
  }
}
if (bad || k < 850_000) {
  console.error(`dist/segment.js: ${bad} of ${k} inputs differ`);
  process.exit(1);
}
console.log(`dist/segment.js: all ${k} inputs agree (rules ${SEGMENT_VERSION})`);

// dist/stem.js against stem/testdata/conformance.jsonl.gz
const { stem, RULES_VERSION: STEM_VERSION } = await import("../dist/stem.js");
const stems = gunzipSync(readFileSync(new URL("../stem/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
let j = 0, miss = 0;
for (const line of stems.split("\n")) {
  if (!line) continue;
  const [lang, word, want] = JSON.parse(line);
  j++;
  if (stem(word, lang) !== want) {
    if (miss++ < 10) console.error(JSON.stringify([lang, word, want]));
  }
}
if (miss || j < 400_000) {
  console.error(`dist/stem.js: ${miss} of ${j} inputs differ`);
  process.exit(1);
}
console.log(`dist/stem.js: all ${j} inputs agree (rules ${STEM_VERSION})`);

// dist/romanize.js against romanize/testdata/conformance.jsonl.gz, loading its data from the
// default place beside the bundle (../romanize/lang/), as jsDelivr serves it
const R = await import("../dist/romanize.js");
const disk = async (url) => { const b = readFileSync(url); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
const romRows = gunzipSync(readFileSync(new URL("../romanize/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
const loaded = new Map();
let rn = 0, rmiss = 0;
for (const line of romRows.split("\n")) {
  if (!line) continue;
  const [fam, lang, word, want] = JSON.parse(line);
  const mode = fam === "names-lookup" ? "names" : fam;
  const key = `${lang}.${mode}`;
  if (!loaded.has(key)) loaded.set(key, await R.load(lang, mode, { fetch: disk }));
  const r = loaded.get(key);
  const got = fam === "names-lookup" ? r.word(word, 4) : R._decode(r, word, 4);
  rn++;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    if (rmiss++ < 10) console.error(JSON.stringify([fam, lang, word, want, got]));
  }
}
if (rmiss || rn < 2000) {
  console.error(`dist/romanize.js: ${rmiss} of ${rn} rows differ`);
  process.exit(1);
}
console.log(`dist/romanize.js: all ${rn} rows agree (rules ${R.RULES_VERSION})`);

// dist/deromanize.js against deromanize/testdata/conformance.jsonl.gz, loading its data from
// the default place beside the bundle (../deromanize/lang/), as jsDelivr serves it
const D = await import("../dist/deromanize.js");
const derRows = gunzipSync(readFileSync(new URL("../deromanize/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
const dloaded = new Map();
let dn = 0, dmiss = 0;
for (const line of derRows.split("\n")) {
  if (!line) continue;
  const [mode, lang, latin, want] = JSON.parse(line);
  const key = `${lang}.${mode}`;
  if (!dloaded.has(key)) dloaded.set(key, await D.load(lang, mode, { fetch: disk }));
  const got = dloaded.get(key).word(latin, 4);
  dn++;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    if (dmiss++ < 10) console.error(JSON.stringify([mode, lang, latin, want, got]));
  }
}
if (dmiss || dn < 2000) {
  console.error(`dist/deromanize.js: ${dmiss} of ${dn} rows differ`);
  process.exit(1);
}
console.log(`dist/deromanize.js: all ${dn} rows agree (rules ${D.RULES_VERSION})`);

// dist/phonetic-search.js against phonetic/testdata/scorer-conformance.jsonl.gz, loading its
// tables from the default place beside the bundle (../phonetic/scorer/), as jsDelivr serves it
const PS = await import("../dist/phonetic-search.js");
const psRows = gunzipSync(readFileSync(new URL("../phonetic/testdata/scorer-conformance.jsonl.gz", import.meta.url))).toString("utf8");
const SCRIPTS = ["arab", "beng", "deva", "gujr", "guru", "knda", "mlym", "mtei", "olck", "orya", "taml", "telu"];
const searches = new Map();
let pn = 0, pmiss = 0;
for (const line of psRows.split("\n")) {
  if (!line) continue;
  const r = JSON.parse(line);
  if (r.t === "unit") continue;
  if (!searches.has(r.lang)) searches.set(r.lang, await PS.loadSearch(r.lang, { scripts: SCRIPTS, fetcher: disk }));
  const s = searches.get(r.lang);
  const got = r.t === "score" ? s.score(r.q, r.c, r.profile)
    : r.queries.map((q) => s.index(r.names, r.profile).search(q, 0).map((h) => [h.name, h.score]));
  const want = r.t === "score" ? r.s : r.hits;
  pn++;
  if (JSON.stringify(got) !== JSON.stringify(want) && pmiss++ < 10) console.error(JSON.stringify([r.t, r.lang, r.q ?? r.queries[0]]));
}
if (pmiss || pn < 1000) {
  console.error(`dist/phonetic-search.js: ${pmiss} of ${pn} rows differ`);
  process.exit(1);
}
console.log(`dist/phonetic-search.js: all ${pn} rows agree (search ${PS.SEARCH_VERSION})`);

// dist/wellformed.js against wellformed/testdata/conformance.jsonl.gz: [text, code-point index or null]
const { brokenAt, isWellFormed, RULES_VERSION: WELLFORMED_VERSION } = await import("../dist/wellformed.js");
const wfRows = gunzipSync(readFileSync(new URL("../wellformed/testdata/conformance.jsonl.gz", import.meta.url))).toString("utf8");
let wn = 0, wmiss = 0;
for (const line of wfRows.split("\n")) {
  if (!line) continue;
  const [input, want] = JSON.parse(line);
  wn++;
  const at = brokenAt(input);
  const got = at < 0 ? null : Array.from(input.slice(0, at)).length;
  if (got !== want || isWellFormed(input) !== (want === null)) {
    if (wmiss++ < 10) console.error(JSON.stringify([input, want, got]));
  }
}
if (wmiss || wn < 30_000) {
  console.error(`dist/wellformed.js: ${wmiss} of ${wn} inputs differ`);
  process.exit(1);
}
console.log(`dist/wellformed.js: all ${wn} inputs agree (rules ${WELLFORMED_VERSION})`);

// every package.json export points at files that exist (its JS and its types)
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const { existsSync } = await import("node:fs");
const missing = Object.entries(pkg.exports).flatMap(([name, e]) =>
  [e.types, e.default].filter((f) => !existsSync(new URL(`../${f}`, import.meta.url))).map((f) => `${name}: ${f}`));
if (missing.length) {
  console.error(`package.json exports point at missing files: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`package.json: all ${Object.keys(pkg.exports).length} exports have their JS and types`);
