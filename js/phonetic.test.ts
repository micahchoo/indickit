import { expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { joinedKeys, keys, match, nameKeys, RULES_VERSION } from "./phonetic";

// phonetic/testdata/conformance.jsonl.gz holds every word of the evaluation
// data with the keys the Python reference gave it. The Go package reads the
// same file; both must agree with it on every word.
test("every word gives the reference keys", () => {
  const file = new URL("../phonetic/testdata/conformance.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [word, want] = JSON.parse(line) as [string, string[]];
    n++;
    const got = keys(word).join(" ");
    if (got !== [...want].sort().join(" ")) wrong.push(`${word}: ${got} ≠ ${want.join(" ")}`);
  }
  expect(n).toBeGreaterThan(190_000);
  expect(wrong.slice(0, 10)).toEqual([]);
});

// phonetic/testdata/conformance-names.jsonl.gz: names as typed (brackets,
// commas, titles) with the reference's nameKeys and joinedKeys; Go reads it too.
test("every name as typed gives the reference nameKeys and joinedKeys", () => {
  const file = new URL("../phonetic/testdata/conformance-names.jsonl.gz", import.meta.url);
  const wrong: string[] = [];
  let n = 0;
  for (const line of gunzipSync(readFileSync(file)).toString("utf8").split("\n")) {
    if (!line) continue;
    const [name, keysWant, joinedWant] = JSON.parse(line) as [string, string[], string[]];
    n++;
    const got = [nameKeys(name).join("|"), joinedKeys(name).join(" ")];
    if (got[0] !== keysWant.join("|") || got[1] !== joinedWant.join(" ")) wrong.push(`${name}: ${got} ≠ ${keysWant}, ${joinedWant}`);
  }
  expect(n).toBeGreaterThan(15_000);
  expect(wrong.slice(0, 10)).toEqual([]);
});

// phonetic/testdata/conformance-joined.jsonl.gz: a sample of names with the
// joined keys the reference gave them; the Go package reads the same file.
test("every sampled name gives the reference joined keys", () => {
  const file = new URL("../phonetic/testdata/conformance-joined.jsonl.gz", import.meta.url);
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  const wrong: string[] = [];
  let n = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [ws, want] = JSON.parse(line) as [string[], string[]];
    n++;
    const got = joinedKeys(ws.join(" ")).join(" ");
    if (got !== want.join(" ")) wrong.push(`${ws.join(" ")}: ${got} ≠ ${want.join(" ")}`);
  }
  expect(n).toBeGreaterThan(25_000);
  expect(wrong.slice(0, 10)).toEqual([]);
});

test("match", () => {
  const cases: [string, string, boolean][] = [
    ["राम", "ರಾಮ", true],
    ["Ram", "राम", true],
    ["मोहनलाल", "മോഹൻലാൽ", true],
    ["सुरेश", "சுரேஷ்", true],
    ["Parvez Khan", "پرویز خان", true],
    ["Imran", "عمران", true], // rules 2026-10-11.3: an initial alif or ع is also i (a known miss before)
    ["Aligarh", "अलीगढ", true], // rules 2026-10-12: Latin rh is also r (a known miss before)
    ["Sardar Vallabhbhai Patel", "સરદાર વલ્લભભાઈ પટેલ", true], // rules 2026-10-12: a title is dropped in every script
    ["Sardar Vallabhbhai Patel", "সর্দার বল্লভভাই প্যাটেল", true],
    ["Rāma", "राम", true], // accents are removed
    ["राम", "काम", false], // Rām is not kām
    ["Ram Singh", "राम", false], // word counts differ
    ["Block 1", "Block 2", false], // a number is keyed by its value
    ["Block 12", "ब्लॉक १२", true], // in any script
    ["1", "2", false],
    ["Singh", "सिंह", true], // rules 2026-10-07: Latin "ngh" is anusvara + h
    ["Bidhuri", "बिधू\u0921\u093cी", true], // the flap as NFC writes it: ड + nukta
    ["Rao", "राव", true], // व after a is also a vowel
  ];
  for (const [a, b, want] of cases) expect([a, b, match(a, b)]).toEqual([a, b, want]);
});

test("nameKeys meet across scripts; the rules are versioned", () => {
  const a = new Set(nameKeys("Shri Narendra Modi (politician)"));
  expect(nameKeys("श्री नरेंद्र मोदी").some((k) => a.has(k))).toBe(true);
  expect(nameKeys("Block 1")).toEqual(["plk 1"]);
  expect(keys("॰")).toEqual([]); // no letter, no digit: no key, not ""
  expect(joinedKeys("Ram Nath")).toEqual([]); // rnnt: 4 classes, below the floor
  const j = new Set(joinedKeys("Subramanian Swaminathan"));
  expect(j.size > 0 && joinedKeys("சுப்ரமணியன்சுவாமிநாதன்").some((k) => j.has(k))).toBe(true);
  const j6 = new Set(joinedKeys("Amartya Sen")); // 6 classes: the floor from 2026-10-11.6
  expect(j6.size > 0 && joinedKeys("अमर्त्यसेन").some((k) => j6.has(k))).toBe(true);
  expect(RULES_VERSION).toBe("2026-10-13");
  // rules 2026-10-13: Meetei Mayek read as Bengali-script Manipuri is
  for (const [a, b] of [["ꯑꯣꯏꯕ", "ওইবা"], ["ꯈꯪꯕ", "খঙবা"]]) expect([a, keys(a).some((k) => keys(b).includes(k))]).toEqual([a, true]);
  // rules 2026-10-11: titles dropped, initials read, the demo's misses
  for (const [a, b] of [["Smt. J. Shantha", "श्रीमती जे. शान्ता"], ["Dr. C. P. Joshi", "डॉ. सी.पी. जोशी"],
    ["Singh", "সিং"], ["Lakshmi", "லட்சுமி"], ["Shri", "श्री"],
    // rules 2026-10-11.1: a title after a comma; the Tamil bundle
    ["Bajwa, Sardar Partap Singh", "बाजवा, सरदार प्रताप सिंह"], ["Kanimozhi", "கனிமொழி"], ["Antony", "ആന്റണി"],
    // rules 2026-10-11.2: व्ह is v; Sindhi Devanagari implosives
    ["Chavan", "चव्हाण"], ["Tarabai", "ताराॿाई"], ["Advani", "आॾवाणी"],
    ["Arjun", "ᱚᱨᱡᱩᱱ"], ["Gautami", "ᱜᱚᱣᱛᱚᱢᱤ"], // Santali: initial ᱚ, the ᱣ glide
    ["Indra", "اندر"], ["Mazhar", "مظہر"], ["Jhangiani", "جہانگیانی"], // 2026-10-11.3
    ["Rajpal", "இராஜ்பால்"], ["Kaur", "கவுர்"], ["Rabri", "राबडी"]]) expect(match(a, b)).toBe(true); // 2026-10-11.4
});
