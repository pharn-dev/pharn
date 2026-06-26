// floor/check-regress.test.mjs — hermetic tests for the deterministic regression core.
//
// NO `claude -p`, NO git, NO network. `scope` is pure set math over CLI args; `verdict` reads two small
// results maps we compose in an os.tmpdir() scratch dir. We assert the public surface (exit code +
// stdout JSON) by subprocess, mirroring check-variance.test.mjs / check-structural.test.mjs.
//
// The ★ tests are load-bearing — they are the whole reason /regress is floor, not judgment:
//   • a changed path outside the declared writes IS a blocking fix#7 escape (scope);
//   • a GREEN→RED flip outside the feature IS a regression (verdict);
//   • a gate already RED at baseline is EXCLUDED, never blamed on the feature (verdict);
//   • a gate that ran on only one side is INCONCLUSIVE, never a silent pass (verdict, fail-closed P5).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const CR = join(here, "check-regress.mjs");

function run(args) {
  return spawnSync(process.execPath, [CR, ...args], { encoding: "utf8" });
}
function json(r) {
  return JSON.parse(r.stdout);
}

// ----------------------------------------------------------------------------- scope (partition) ---

test("scope: clean partition — inside ⊆ declared, outside derived, exit 0", () => {
  const r = run([
    "scope",
    "--changed",
    "floor/check-regress.mjs, floor/check-regress.test.mjs",
    "--declared",
    "floor/check-regress.mjs, floor/check-regress.test.mjs, .claude/commands/regress.md",
    "--tests",
    "floor/check-regress.test.mjs, floor/validate.test.mjs",
    "--eval-pairs",
    "a/expected.json::b/findings.json",
  ]);
  assert.equal(r.status, 0);
  const o = json(r);
  assert.deepEqual(o.escaped, []);
  // the inside test file is excluded from the outside suite; the other remains
  assert.deepEqual(o.outside_tests, ["floor/validate.test.mjs"]);
  // both files of the pair are outside the feature → it is an outside gate
  assert.deepEqual(o.outside_eval_pairs, [{ expected: "a/expected.json", actual: "b/findings.json" }]);
});

test("scope: an eval pair touching an INSIDE file is NOT an outside gate", () => {
  const r = run([
    "scope",
    "--changed",
    "a/expected.json",
    "--declared",
    "a/expected.json",
    "--eval-pairs",
    "a/expected.json::b/findings.json",
  ]);
  assert.equal(r.status, 0);
  assert.deepEqual(json(r).outside_eval_pairs, []); // expected is inside → pair excluded
});

test("★ scope: a changed path outside declared writes → exit 1 + blocking P0 fix#7 finding", () => {
  const r = run(["scope", "--changed", "floor/evil.mjs, floor/check-regress.mjs", "--declared", "floor/check-regress.mjs"]);
  assert.equal(r.status, 1);
  const o = json(r);
  assert.deepEqual(o.escaped, ["floor/evil.mjs"]); // the declared file is NOT flagged
  assert.equal(o.findings.length, 1);
  assert.equal(o.findings[0].type, "FINDING");
  assert.equal(o.findings[0].rule_id, "P0");
  assert.equal(o.findings[0].severity, "blocking");
  assert.equal(o.findings[0].file, "floor/evil.mjs");
});

test("scope: a glob in declared (features/regress/**) covers nested changed files", () => {
  const r = run(["scope", "--changed", "features/regress/REGRESSION.md", "--declared", "features/regress/**"]);
  assert.equal(r.status, 0);
  assert.deepEqual(json(r).escaped, []);
});

test("scope: a glob in --tests → inconclusive exit 2 (expand it first, fail-closed)", () => {
  const r = run(["scope", "--changed", "floor/check-regress.mjs", "--declared", "floor/check-regress.mjs", "--tests", "floor/*.test.mjs"]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /inconclusive/);
});

test("scope: a malformed --eval-pairs token (no '::') → inconclusive exit 2 (fail-closed)", () => {
  const r = run([
    "scope",
    "--changed",
    "floor/check-regress.mjs",
    "--declared",
    "floor/check-regress.mjs",
    "--eval-pairs",
    "a/expected.json::b/findings.json, oops-no-separator",
  ]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /inconclusive/);
});

test("scope: missing required args → inconclusive exit 2", () => {
  const r = run(["scope", "--changed", "a"]); // no --declared
  assert.equal(r.status, 2);
  assert.match(r.stdout, /inconclusive/);
});

// ------------------------------------------------------------------------------- verdict (compare) ---

function withResults(base, head, fn) {
  const root = mkdtempSync(join(tmpdir(), "pharn-regress-"));
  try {
    const b = join(root, "base.json");
    const h = join(root, "head.json");
    writeFileSync(b, JSON.stringify(base));
    writeFileSync(h, JSON.stringify(head));
    return fn(b, h, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("verdict: no flips → no-regressions, exit 0", () => {
  withResults({ tests: 0, validate: 0 }, { tests: 0, validate: 0 }, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 0);
    assert.equal(json(r).verdict, "no-regressions");
  });
});

test("★ verdict: a 0→1 flip outside the feature → regression, exit 1, gate-id named", () => {
  withResults({ tests: 0, validate: 0 }, { tests: 1, validate: 0 }, (b, h) => {
    const r = run(["verdict", b, h, "--base", "abc123", "--inside", "floor/check-regress.mjs"]);
    assert.equal(r.status, 1);
    const o = json(r);
    assert.equal(o.verdict, "regressions");
    assert.deepEqual(o.regressions, ["tests"]);
    assert.deepEqual(o.pre_existing, []);
    assert.equal(o.base, "abc123"); // provenance echoed into the report verbatim
    assert.deepEqual(o.inside, ["floor/check-regress.mjs"]);
    assert.deepEqual(o.outside_gates.tests, { base: 0, head: 1 });
  });
});

test("★ verdict: a gate already RED at baseline stays red → EXCLUDED (pre-existing), exit 0", () => {
  withResults({ tests: 1, validate: 0 }, { tests: 1, validate: 0 }, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 0); // base != 0 → pre-existing, never blamed on the feature
    const o = json(r);
    assert.deepEqual(o.regressions, []);
    assert.deepEqual(o.pre_existing, ["tests"]);
    assert.equal(o.verdict, "no-regressions");
  });
});

test("verdict: a gate red at base but GREEN at head is a fix, not a regression → exit 0", () => {
  withResults({ tests: 1 }, { tests: 0 }, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r).pre_existing, ["tests"]);
    assert.deepEqual(json(r).regressions, []);
  });
});

test("verdict: missing a results file → inconclusive exit 2", () => {
  withResults({ tests: 0 }, { tests: 0 }, (b, _h, root) => {
    const r = run(["verdict", b, join(root, "nope.json")]);
    assert.equal(r.status, 2);
    assert.match(r.stdout, /inconclusive/);
  });
});

test("verdict: a non-integer exit code → inconclusive exit 2 (fail-closed)", () => {
  withResults({ tests: "0" }, { tests: 0 }, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 2);
    assert.match(r.stdout, /inconclusive/);
  });
});

test("verdict: an empty results map → inconclusive exit 2", () => {
  withResults({}, {}, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 2);
  });
});

test("★ verdict: gate-set mismatch (a gate ran on one side only) → inconclusive exit 2, never a silent pass", () => {
  withResults({ tests: 0, validate: 0 }, { tests: 0 }, (b, h) => {
    const r = run(["verdict", b, h]);
    assert.equal(r.status, 2);
    assert.match(r.stdout, /gate set mismatch/);
  });
});
