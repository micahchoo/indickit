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
