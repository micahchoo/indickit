import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fromBytes, load, languages, _decode, type Mode, type Romanizer } from "./romanize";

// Files from disk, as load() would fetch them beside the module.
const disk = async (url: URL) => {
  const b = readFileSync(url);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const cache = new Map<string, Romanizer>();
async function get(lang: string, mode: Mode): Promise<Romanizer> {
  const k = `${lang}.${mode}`;
  if (!cache.has(k)) cache.set(k, await load(lang, mode, { fetch: disk }));
  return cache.get(k)!;
}

// romanize/testdata/conformance.jsonl.gz: from the Python reference (linguistic-utilities
// jobs/romanize/export.py); the same file the Go test reads.
test("every conformance row: the Python reference's lists", async () => {
  const rows = gunzipSync(readFileSync(new URL("../romanize/testdata/conformance.jsonl.gz", import.meta.url)))
    .toString("utf8").trim().split("\n").map((l) => JSON.parse(l) as [string, string, string, string[]]);
  expect(rows.length).toBeGreaterThanOrEqual(2000);
  const bad: string[] = [];
  for (const [fam, lang, word, want] of rows) {
    const got = fam === "names-lookup"
      ? (await get(lang, "names")).word(word, 4)
      : _decode(await get(lang, fam as Mode), word, 4);
    if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${fam} ${lang} ${word}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
  }
  expect(bad.slice(0, 10)).toEqual([]);
}, 120_000);

test("word and text", async () => {
  const hi = await get("hi", "words");
  expect(hi.word("लक्ष्मी", 1)[0]?.length).toBeGreaterThan(0);
  expect(hi.text("नमस्ते, दुनिया! 2026").endsWith("! 2026")).toBe(true);
  expect(hi.text("नमस्ते, दुनिया! 2026")).not.toContain("न");
  expect((await load("hin", "words", { fetch: disk })).word("लक्ष्मी")).toEqual(hi.word("लक्ष्मी"));
  await expect(load("xx", "words", { fetch: disk })).rejects.toThrow();
  expect(languages("names")).toContain("sat");
  expect(languages("words")).not.toContain("sat");
});

// A joiner after the virama shapes the letter and spells nothing. Left in place, it put the
// beam on the path that spells everything before it as "" (प्राप्\u200dत gave "the"; the demo
// job, 2026-10-08). word() deletes U+200C and U+200D before the lookup and the decode.
test("joiners are deleted before the lookup and the decode", async () => {
  for (const mode of ["words", "names"] as Mode[]) {
    const hi = await get("hi", mode);
    for (const [joined, plain] of [["प्राप्\u200dत", "प्राप्त"], ["उन्\u200dहोंने", "उन्होंने"], ["विश्\u200dव", "विश्व"], ["प्राप्\u200cत", "प्राप्त"]]) {
      expect([mode, joined, hi.word(joined)]).toEqual([mode, joined, hi.word(plain)]);
    }
  }
  const hi = await get("hi", "words");
  expect(hi.text("प्राप्\u200dत")).toBe("praapt");
  expect(hi.word("\u200d")).toEqual([]);
});

// Manipuri is written in Meetei Mayek and in Bengali script. Its own tables hold Meetei Mayek
// only; a Bengali-script word is spelled by the shared Brahmic table, so the pooled file must be
// the Brahmic one (v0.6.0 loaded a Meetei-only file: রামেন gave "en").
test("Manipuri in Bengali script", async () => {
  const mni = await get("mni", "names");
  for (const [w, want] of [["রামেন", "ramen"], ["ওরাম", "oram"], ["রামদারশ", "ramdarsh"], ["ꯔꯥꯝ", "ram"]]) {
    expect([w, mni.word(w, 1)]).toEqual([w, [want]]);
  }
  expect(mni.text("ꯔꯥꯝ, রামেন")).toBe("ram, ramen");
});

test("fromBytes gives the same tables as load", async () => {
  const own = readFileSync(new URL("../romanize/lang/ta/ta.words.bin", import.meta.url));
  const pool = readFileSync(new URL("../romanize/lang/brahmic/words-brahmic.bin", import.meta.url));
  expect(fromBytes("ta", "words", own, pool).word("சுரேஷ்")).toEqual((await get("ta", "words")).word("சுரேஷ்"));
});

test("without the tables beside it, load() asks jsDelivr at this package's version", async () => {
  const { CDN } = await import("./romanize");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  expect(CDN).toBe(`https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${pkg.version}/romanize/lang/`);
  const real = globalThis.fetch;
  const asked: string[] = [];
  globalThis.fetch = (async (u: string | URL) => {
    const url = String(u);
    asked.push(url);
    if (!url.startsWith(CDN)) return new Response(null, { status: 404 }); // not beside the module
    const local = new URL(`../romanize/lang/${url.slice(CDN.length)}`, import.meta.url);
    return new Response(readFileSync(local));
  }) as typeof fetch;
  try {
    const r = await load("mni", "names");
    expect(r.word("ꯔꯥꯝ").length).toBeGreaterThan(0);
    // the language file was asked beside the module first, then from jsDelivr; the group's
    // pooled file may already be cached from an earlier load (it is fetched once a page)
    const own = asked.filter((u) => u.endsWith("/mni/mni.names.bin"));
    expect(own).toHaveLength(2);
    expect(own[0].startsWith(CDN)).toBe(false);
    expect(own[1]).toBe(`${CDN}mni/mni.names.bin`);
  } finally {
    globalThis.fetch = real;
  }
});
