import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import api from "./api.json" with { type: "json" };

// The names a user imports are the contract that npm users hold. api.json
// lists them, and these tests hold the code to it: a rename or a removal
// fails here until api.json is changed on purpose, in a minor release whose
// CHANGELOG entry says so. A new name is added to api.json freely.
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("package.json exports exactly the modules api.json lists", () => {
  expect(Object.keys(pkg.exports).sort()).toEqual(Object.keys(api).map((m) => `./${m}`).sort());
});

for (const [name, want] of Object.entries(api)) {
  test(`indickit/${name} exports exactly the names api.json lists`, async () => {
    const mod = await import(`./${name}.ts`);
    expect(Object.keys(mod).sort()).toEqual([...want].sort());
  });
}
