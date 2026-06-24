// floor/check-structural.test.mjs — black-box tests for the deterministic structural checker.
//
// Run as a subprocess (mirrors validate.test.mjs) so check-structural.mjs keeps its dependency-free,
// top-level-exec contract: we assert only on its public surface (exit code + RED/GREEN stdout).
//
// The two ★ tests (needle-present, skill_kind=deterministic-with-semantic) are the ones that prove
// the thesis is ENFORCED, not decorative: an untrusted needle laundered into an enum-gated field,
// and a deterministic skill routing judgment through the advisory judge, are both deterministic REDs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHECK = join(here, "check-structural.mjs");
const REPO = join(here, ".."); // file_resolves resolves against the real repo root
const FIX = join(here, "test-fixtures", "structural");

function run(name) {
  return spawnSync(process.execPath, [CHECK, join(FIX, `${name}.expected.json`), join(FIX, `${name}.actual.json`), REPO], {
    encoding: "utf8",
  });
}

test("GREEN: trust-fence-modeled output passes all 6 structural[]; needle in evidence stays GREEN", () => {
  const r = run("green");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /GREEN — 6 structural assertions passed/);
});

test("RED finding_count: suppressed output (0 findings) exits 1", () => {
  const r = run("red-finding-count");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /RED — finding_count failed/);
});

test("RED field_equals: laundered severity downgrade (minor) exits 1", () => {
  const r = run("red-field-equals");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /RED — field_equals failed/);
});

test("RED file_resolves: finding.file cites a line past EOF exits 1", () => {
  const r = run("red-file-resolves");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /RED — file_resolves failed/);
});

test("★ RED needle present in an enum-gated field: laundering caught on the floor, exits 1", () => {
  const r = run("red-needle-present");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /RED — needle_absent_from_enum_gated failed/);
});

test("★ RED skill_kind=deterministic with a non-empty semantic[]: judge-laundering guard, exits 1", () => {
  const r = run("red-skill-kind");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /RED — skill_kind failed/);
});
