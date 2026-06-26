// floor/exit-label.test.mjs — hermetic proof for exit-label.mjs (the floor-helper convention: a colocated
// *.test.mjs in place of an evals/ dir, since this is infrastructure, not a Capability). Collected by
// `npm test`'s glob (package.json) and run by /verify's `test` floor-gate. No `claude -p`, no git, no
// network, no child_process — fully deterministic (P5).

import { test } from "node:test";
import assert from "node:assert/strict";
import { exitLabel } from "./exit-label.mjs";

test("maps the floor's canonical exit codes 0/1/2 to their labels", () => {
  assert.equal(exitLabel(0), "pass");
  assert.equal(exitLabel(1), "fail");
  assert.equal(exitLabel(2), "inconclusive");
});

test("any other integer falls to the defined terminal fallback 'unknown' (P5 — never a throw)", () => {
  assert.equal(exitLabel(3), "unknown");
  assert.equal(exitLabel(-1), "unknown");
});

test("non-integer inputs are non-members → 'unknown' (Map keys stay strictly numeric)", () => {
  assert.equal(exitLabel("0"), "unknown"); // the string "0", not the number 0
  assert.equal(exitLabel(1.5), "unknown"); // a float, not a canonical code
  assert.equal(exitLabel(null), "unknown");
  assert.equal(exitLabel(undefined), "unknown");
});
