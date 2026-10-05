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
