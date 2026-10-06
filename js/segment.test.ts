import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { codePointBounds, count, RULES_VERSION, segment, UNICODE_VERSION } from "./segment";

// segment/testdata/conformance.jsonl.gz: every case of Unicode's
// GraphemeBreakTest-17.0.0, every context the joins decide, and every
// distinct word of the evaluation text, with the boundaries the Python
// reference gave. The Go package reads the same file.
test("every input gives the reference boundaries", () => {
  const file = new URL("../segment/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [input, want] = JSON.parse(line) as [string, number[]];
    n++;
    const got = codePointBounds(input);
    if (got.join(",") !== want.join(",")) wrong.push(`${JSON.stringify(input)}: ${got} ≠ ${want}`);
  }
  expect(n).toBeGreaterThan(850_000);
  expect(wrong.slice(0, 10)).toEqual([]);
}, 120_000);

test("conjuncts stay whole", () => {
  expect(segment("ಲಕ್ಷ್ಮಿ")).toEqual(["ಲ", "ಕ್ಷ್ಮಿ"]);
  expect(segment("ਪ੍ਰੀਤ")).toEqual(["ਪ੍ਰੀ", "ਤ"]);
  expect(segment("অ্যাপ")).toEqual(["অ্যা", "প"]);
  expect(segment("ஸ்ரீ")).toEqual(["ஸ்ரீ"]);
  expect(segment("लक्ष्मी")).toEqual(["ल", "क्ष्मी"]);
  expect(count("ಕನ್ನಡ")).toBe(3);
});

test("what a font draws apart stays apart", () => {
  expect(segment("ਕ੍ਕ")).toEqual(["ਕ੍", "ਕ"]); // Gurmukhi shows the halant
  expect(segment("க்ரீ")).toEqual(["க்", "ரீ"]); // only ஸ்ரீ is one shape
  expect(segment("ಕ್\u200cಷ")).toEqual(["ಕ್\u200c", "ಷ"]); // ZWNJ asks for two
});

test("other text is Unicode's grapheme clusters", () => {
  expect(segment("👨\u200d👩\u200d👧🇮🇳e\u0301")).toEqual(["👨\u200d👩\u200d👧", "🇮🇳", "e\u0301"]);
  expect(segment("")).toEqual([]);
});

test("the letters give the text back", () => {
  for (const t of ["ಲಕ್ಷ್ಮಿ ನಾರಾಯಣ", "ਪੰਜਾਬ", "a\r\nb", "🏳\ufe0f\u200d🌈x"]) expect(segment(t).join("")).toBe(t);
});

test("versions", () => {
  expect(RULES_VERSION).toBe("2026-10-06");
  expect(UNICODE_VERSION).toBe("17.0.0");
});
