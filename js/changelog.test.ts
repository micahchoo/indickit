import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { RULES_VERSION as phonetic } from "./phonetic";
import { RULES_VERSION as normalize } from "./normalize";
import { RULES_VERSION as segment } from "./segment";
import { RULES_VERSION as stem } from "./stem";
import { RULES_VERSION as romanize } from "./romanize";
import { RULES_VERSION as deromanize } from "./deromanize";
import { SEARCH_VERSION } from "./phonetic-search";

// CHANGELOG.md is what an npm user reads to learn whether an upgrade changes
// their stored output. Its first released entry must be this version, and the
// rules line of its first entry ("Unreleased" between releases) must name the
// rules version that each utility ships.
const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const changelog = read("../CHANGELOG.md");
const pkg = JSON.parse(read("../package.json"));
const entries = changelog.split(/^## /m).slice(1);
const first = entries[0];
const released = entries.find((e) => !e.startsWith("Unreleased"))!;

test("the first released CHANGELOG entry is package.json's version", () => {
  expect(released.split(" ")[0]).toBe(pkg.version);
});

test("the first CHANGELOG entry names the rules version each utility ships", () => {
  const line = first.split("\n").find((l) => l.startsWith("Rules: "))!;
  const got = Object.fromEntries(line.slice(7).split(", ").map((p) => p.split(" ") as [string, string]));
  expect(got).toEqual({
    phonetic, normalize, segment, stem, romanize, deromanize, "phonetic-search": SEARCH_VERSION,
  });
});
