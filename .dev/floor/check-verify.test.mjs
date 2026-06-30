// floor/check-verify.test.mjs — hermetic tests for the deterministic verify-verdict core.
//
// NO `claude -p`, NO git, NO network. The verdict reads ONE small { gate-id: exit-code } results map we
// compose in an os.tmpdir() scratch dir. We assert the public surface (exit code + stdout JSON) by
// subprocess, mirroring check-regress.test.mjs / check-variance.test.mjs / check-structural.test.mjs.
//
// The ★ tests are load-bearing — they are the whole reason /verify's verdict is FLOOR, not judgment:
//   • ALL gates green → PASS (exit 0); ANY gate non-zero → FAIL (exit 1), the offender named;
//   • a missing / empty / malformed results map → INCONCLUSIVE (exit 2), fail-closed, NEVER a silent
//     pass — and DISTINCT from FAIL, which a bare shell `&&` chain cannot express;
//   • the emitted spine is EXACTLY {feature, gates, verdict, failing_gates} with NO free-text key — the
//     verdict's INPUT cannot even carry a verifier finding, so it is provably independent of one (P2).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const CV = join(here, "check-verify.mjs");

function run(args) {
  return spawnSync(process.execPath, [CV, ...args], { encoding: "utf8" });
}
function json(r) {
  return JSON.parse(r.stdout);
}
// compose a results.json in a scratch dir, run the helper over it, clean up.
function withResults(results, fn) {
  const root = mkdtempSync(join(tmpdir(), "pharn-verify-"));
  try {
    const p = join(root, "results.json");
    writeFileSync(p, JSON.stringify(results));
    return fn(p, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("★ verdict: ALL gates green → PASS, exit 0, no failing gates", () => {
  withResults({ test: 0, validate: 0, lint: 0, "structural:a/expected.json": 0 }, (p) => {
    const r = run([p, "--feature", "verify"]);
    assert.equal(r.status, 0);
    const o = json(r);
    assert.equal(o.verdict, "PASS");
    assert.deepEqual(o.failing_gates, []);
    assert.equal(o.feature, "verify"); // provenance echoed verbatim
    assert.deepEqual(o.gates, { test: 0, validate: 0, lint: 0, "structural:a/expected.json": 0 });
  });
});

test("★ verdict: ANY gate non-zero → FAIL, exit 1, the offender named", () => {
  withResults({ test: 0, validate: 0, lint: 1 }, (p) => {
    const r = run([p, "--feature", "verify"]);
    assert.equal(r.status, 1);
    const o = json(r);
    assert.equal(o.verdict, "FAIL");
    assert.deepEqual(o.failing_gates, ["lint"]); // exactly the red gate
    assert.equal(o.gates.lint, 1);
  });
});

test("verdict: multiple red gates → FAIL, ALL named (sorted), exit 1", () => {
  withResults({ test: 1, validate: 0, lint: 2 }, (p) => {
    const r = run([p]);
    assert.equal(r.status, 1);
    assert.deepEqual(json(r).failing_gates, ["lint", "test"]); // sorted, both offenders
  });
});

test("★ verdict: the emitted spine has NO free-text key (verdict is exit-codes-only, P2)", () => {
  withResults({ test: 0 }, (p) => {
    const r = run([p, "--feature", "x"]);
    const o = json(r);
    assert.deepEqual(Object.keys(o).sort(), ["failing_gates", "feature", "gates", "verdict"]);
    // no channel exists for a verifier finding's free-text to enter the verdict object
    for (const k of ["problem", "evidence", "findings", "verifiers", "reason"]) {
      assert.equal(k in o, false, `the PASS/FAIL spine must not carry '${k}'`);
    }
  });
});

test("★ verdict: empty results map → INCONCLUSIVE, exit 2 (fail-closed), distinct from FAIL", () => {
  withResults({}, (p) => {
    const r = run([p]);
    assert.equal(r.status, 2);
    assert.equal(json(r).verdict, "INCONCLUSIVE");
  });
});

test("verdict: a missing results file → INCONCLUSIVE, exit 2", () => {
  withResults({ test: 0 }, (_p, root) => {
    const r = run([join(root, "nope.json")]);
    assert.equal(r.status, 2);
    assert.equal(json(r).verdict, "INCONCLUSIVE");
  });
});

test("verdict: a non-integer exit code → INCONCLUSIVE, exit 2 (fail-closed)", () => {
  withResults({ test: "0" }, (p) => {
    const r = run([p]);
    assert.equal(r.status, 2);
    assert.equal(json(r).verdict, "INCONCLUSIVE");
  });
});

test("verdict: a results map that is a JSON array (not an object) → INCONCLUSIVE, exit 2", () => {
  withResults([0, 0], (p) => {
    const r = run([p]);
    assert.equal(r.status, 2);
    assert.equal(json(r).verdict, "INCONCLUSIVE");
  });
});

test("verdict: no results path at all → INCONCLUSIVE, exit 2", () => {
  const r = run([]);
  assert.equal(r.status, 2);
  assert.equal(json(r).verdict, "INCONCLUSIVE");
});

test("verdict: feature defaults to null when --feature is omitted", () => {
  withResults({ test: 0 }, (p) => {
    const r = run([p]);
    assert.equal(r.status, 0);
    assert.equal(json(r).feature, null);
  });
});
