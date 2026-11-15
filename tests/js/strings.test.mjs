import test from "node:test";
import assert from "node:assert/strict";
import { STRINGS } from "../../mydiet/app/static/training/hafs-common.js";

test("German and English texts have the same keys and the same placeholders", () => {
  const de = Object.keys(STRINGS.de), en = Object.keys(STRINGS.en);
  assert.deepEqual(de.filter((k) => !en.includes(k)), []);
  assert.deepEqual(en.filter((k) => !de.includes(k)), []);
  const holes = (s) => [...s.matchAll(/\{(\d+)\}/g)].map((m) => m[1]).sort().join();
  for (const k of de) assert.equal(holes(STRINGS.de[k]), holes(STRINGS.en[k]), k);
});
