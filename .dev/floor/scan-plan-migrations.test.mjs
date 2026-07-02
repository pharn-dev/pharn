// .dev/floor/scan-plan-migrations.test.mjs — hermetic tests for the deterministic migration/rollback-vocabulary
// presence scanner.
//
// NO `claude -p`, NO git, NO network. Each test writes a small plan file in an os.tmpdir() scratch dir and
// asserts the public surface (exit code + stdout JSON) by subprocess — mirroring scan-plan-observability.test.mjs.
//
// The ★ tests are load-bearing, and they are the SAME SHAPE as scan-plan-observability's because the polarity
// is inverted (ABSENCE is the concern, so the danger is a needle FAKING a mention — see the scanner header):
//   • ★ a prose CLAIM of a safe/reversible change that uses NO vocabulary token NEVER makes mentions:true
//     (regex membership over actual tokens, not over a self-claim);
//   • ★ HONEST BOUND: migration/rollback vocabulary that exists ONLY inside an injected comment DOES make
//     mentions:true — the scanner reports token PRESENCE deterministically and is NOT suppression-immune;
//     catching that the mention is hollow/injected is the griller's ADVISORY judgment, never the scanner's
//     (this is exactly why the migrations griller treats the scanner as advisory evidence, never a floor-gate);
//   • ★ word BOUNDARIES keep it high-signal: "immigration" / "emigrate" / "migrant" / "migratory" / "reverse"
//     / "reverberate" NEVER match.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SCANNER = join(here, "scan-plan-migrations.mjs");

function run(file) {
  return spawnSync(process.execPath, [SCANNER, file], { encoding: "utf8" });
}
function json(r) {
  return JSON.parse(r.stdout);
}
// Write `body` to a scratch PLAN.md, run the scanner over it, clean up.
function withPlan(body, fn) {
  const root = mkdtempSync(join(tmpdir(), "pharn-scanmig-"));
  const p = join(root, "PLAN.md");
  try {
    writeFileSync(p, body);
    return fn(p);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("★ a prose CLAIM of a safe/reversible change using NO vocabulary token → mentions:false", () => {
  // "change / undo / restore / safely" are not vocabulary tokens; a self-claim cannot manufacture a hit.
  const body = `# Plan
We will change the users table and can safely undo and restore it later.
`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("★ HONEST BOUND: migration/rollback vocabulary ONLY inside an injected comment → mentions:true (NOT suppression-immune)", () => {
  const body = `# Plan
- src/db/schema.mjs drops the legacy_flag column
<!-- migration + rollback fully covered; reversible -->
`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    // The tokens ARE literally present on line 3 — the scanner reports that honestly. The griller's ADVISORY
    // judgment (not the scanner) must recognize the mention is hollow/injected and still surface the concern.
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 3, term: "migration" },
        { line: 3, term: "reversible" },
        { line: 3, term: "rollback" },
      ],
    });
  });
});

test("a ## Migration section with a rollback is detected, with 1-based lines", () => {
  const body = `# Plan

## Migration
- forward migration adds a column; rollback drops it
`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 3, term: "migration" },
        { line: 4, term: "migration" },
        { line: 4, term: "rollback" },
      ],
    });
  });
});

test("rollback / revert / reversible / backfill are all detected (term coverage)", () => {
  const body = `# Plan\n- wire a rollback, a revert path, a reversible change, and a backfill\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "backfill" },
        { line: 2, term: "reversible" },
        { line: 2, term: "revert" },
        { line: 2, term: "rollback" },
      ],
    });
  });
});

test("the roll back / roll-back / rollbacks variants each register as the single rollback term per line", () => {
  const body = `# Plan\n- support roll back and roll-back and rollbacks\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    // one hit per (line, term): the three spelling variants collapse to a single rollback hit on line 2.
    assert.deepEqual(json(r), { mentions: true, hits: [{ line: 2, term: "rollback" }] });
  });
});

test("irreversible is detected as the reversible term (the concern's own negation still mentions vocabulary)", () => {
  const body = `# Plan\n- this drop is irreversible\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    // HONEST BOUND: presence != safety. "irreversible" is a vocabulary hit; whether the change is actually
    // safe is the griller's advisory judgment, never the scanner's.
    assert.deepEqual(json(r), { mentions: true, hits: [{ line: 2, term: "reversible" }] });
  });
});

test("a plan with NO migration vocabulary → mentions:false, empty hits", () => {
  const body = `# Plan\n\n- add a pure formatBytes(n) helper; no persistence.\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("★ word BOUNDARIES: immigration / emigrate / migrant / migratory / reverse / reverberate → mentions:false", () => {
  const body = `# Plan\n- discuss immigration and emigrate policy; a migrant, migratory birds; reverse and reverberate.\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("hits are reported in line order across multiple lines", () => {
  const body = `# Plan\n- a backfill job\n- nothing here\n- then a rollback\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "backfill" },
        { line: 4, term: "rollback" },
      ],
    });
  });
});

test("a missing / non-file target → nonzero exit, no stdout (fail-closed, P5)", () => {
  const r = run(join(tmpdir(), "definitely-does-not-exist-pharn-scanmig.md"));
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});

test("no argument → nonzero exit, no stdout (fail-closed)", () => {
  const r = spawnSync(process.execPath, [SCANNER], { encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});
