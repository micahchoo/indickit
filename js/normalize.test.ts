import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { fold, normalize, RULES_VERSION } from "./normalize";

// normalize/testdata/conformance.jsonl.gz holds [text, lang, normalize, fold]
// from the Python reference: corpus words that either function changes,
// planted invisible characters, fuzz strings. The Go package reads the same
// file; both must agree with it on every line.
test("every input gives the reference outputs", () => {
  const file = new URL("../normalize/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [input, lang, wantN, wantF] = JSON.parse(line) as [string, string | null, string, string];
    n++;
    const gotN = normalize(input, lang ?? undefined);
    const gotF = fold(input, lang ?? undefined);
    if (gotN !== wantN || gotF !== wantF) wrong.push(JSON.stringify([input, lang, gotN, gotF, wantN, wantF]));
  }
  expect(n).toBeGreaterThan(300_000);
  expect(wrong.slice(0, 10)).toEqual([]);
  // 690,000 calls: about 4 s here, 7 s on a CI runner; bun's default limit is 5 s
}, 60_000);

test("cases", () => {
  const ZWNJ = "\u200c", ZWJ = "\u200d";
  const cases: [string, string | undefined, string][] = [
    ["र्" + ZWJ + "य", "mr", "र्" + ZWJ + "य"], // eyelash ra: the ZWJ is visible
    ["ಸಿಕಾರ್" + ZWNJ, "kn", "ಸಿಕಾರ್"], // a final ZWNJ draws nothing
    ["അവന്" + ZWJ, "ml", "അവൻ"], // old chillu -> atomic chillu
    ["অংশগ্রহণ", "as", "অংশগ্ৰহণ"], // Assamese ra
    ["\u{1F468}" + ZWJ + "\u{1F469}", undefined, "\u{1F468}" + ZWJ + "\u{1F469}"], // emoji: not ours
  ];
  for (const [text, lang, want] of cases) expect([text, normalize(text, lang)]).toEqual([text, want]);
  expect(fold("हिन्दी", "hi")).toBe("हिंदी"); // हिन्दी -> हिंदी
  expect(RULES_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
