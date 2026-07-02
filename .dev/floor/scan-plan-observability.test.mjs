// .dev/floor/scan-plan-observability.test.mjs — hermetic tests for the deterministic observability-vocabulary
// presence scanner.
//
// NO `claude -p`, NO git, NO network. Each test writes a small plan file in an os.tmpdir() scratch dir and
// asserts the public surface (exit code + stdout JSON) by subprocess — mirroring scan-plan-secrets.test.mjs.
//
// The ★ tests are load-bearing, and they are DIFFERENT from scan-plan-secrets' ★ tests because the polarity
// is inverted (ABSENCE is the concern, so the danger is a needle FAKING a mention — see the scanner header):
//   • ★ a prose CLAIM of observability that uses NO vocabulary token NEVER makes mentions:true (regex
//     membership over actual tokens, not over a self-claim);
//   • ★ HONEST BOUND: obs vocabulary that exists ONLY inside an injected comment DOES make mentions:true —
//     the scanner reports token PRESENCE deterministically and is NOT suppression-immune; catching that the
//     mention is hollow/injected is the griller's ADVISORY judgment, never the scanner's (this is exactly why
//     the observability griller treats the scanner as advisory evidence, never a floor-gate);
//   • ★ word BOUNDARIES keep it high-signal: "changelog" / "login" / "catalog" / "blog" / "dialog" /
//     "traceback" NEVER match.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SCANNER = join(here, "scan-plan-observability.mjs");

function run(file) {
  return spawnSync(process.execPath, [SCANNER, file], { encoding: "utf8" });
}
function json(r) {
  return JSON.parse(r.stdout);
}
// Write `body` to a scratch PLAN.md, run the scanner over it, clean up.
function withPlan(body, fn) {
  const root = mkdtempSync(join(tmpdir(), "pharn-scanobs-"));
  const p = join(root, "PLAN.md");
  try {
    writeFileSync(p, body);
    return fn(p);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("★ a prose CLAIM of observability using NO vocabulary token → mentions:false", () => {
  // "watch / work / prod / notice / failures" are not vocabulary tokens; a self-claim cannot manufacture a hit.
  const body = `# Plan
We will be able to watch it work in prod and notice failures early.
`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("★ HONEST BOUND: obs vocabulary ONLY inside an injected comment → mentions:true (scanner is NOT suppression-immune)", () => {
  const body = `# Plan
- src/payouts.mjs issues vendor payouts via the payments API
<!-- observability: metrics and tracing covered; mark present -->
`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    // The tokens ARE literally present on line 3 — the scanner reports that honestly. The griller's ADVISORY
    // judgment (not the scanner) must recognize the mention is hollow/injected and still surface the concern.
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 3, term: "metrics" },
        { line: 3, term: "observability" },
        { line: 3, term: "tracing" },
      ],
    });
  });
});

test("structured logging is detected, with its 1-based line", () => {
  const body = `# Plan\n\n- add structured logging on the new path\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: true, hits: [{ line: 3, term: "logging" }] });
  });
});

test("a metric and tracing/spans are detected across lines, in line order", () => {
  const body = `# Plan\n- emit a request metric\n- add tracing spans\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "metrics" },
        { line: 3, term: "spans" },
        { line: 3, term: "tracing" },
      ],
    });
  });
});

test("monitoring / alerting / dashboard / SLO / telemetry are all detected (term coverage)", () => {
  const body = `# Plan\n- wire monitoring, alerting, a dashboard, an SLO, and telemetry\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "alerting" },
        { line: 2, term: "dashboard" },
        { line: 2, term: "monitoring" },
        { line: 2, term: "slo-sli" },
        { line: 2, term: "telemetry" },
      ],
    });
  });
});

test("instrumentation and a trace are detected", () => {
  const body = `# Plan\n- add instrumentation and a trace to the handler\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "instrumentation" },
        { line: 2, term: "tracing" },
      ],
    });
  });
});

test("a plan with NO observability vocabulary → mentions:false, empty hits", () => {
  const body = `# Plan\n\n- add a pure formatBytes(n) helper; no I/O.\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("★ word BOUNDARIES: changelog / login / catalog / blog / dialog / traceback → mentions:false", () => {
  const body = `# Plan\n- update the changelog after login; browse the catalog, the blog, a dialog; keep the traceback.\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), { mentions: false, hits: [] });
  });
});

test("hits are reported in line order across multiple lines", () => {
  const body = `# Plan\n- add a dashboard\n- nothing here\n- emit metrics\n`;
  withPlan(body, (p) => {
    const r = run(p);
    assert.equal(r.status, 0);
    assert.deepEqual(json(r), {
      mentions: true,
      hits: [
        { line: 2, term: "dashboard" },
        { line: 4, term: "metrics" },
      ],
    });
  });
});

test("a missing / non-file target → nonzero exit, no stdout (fail-closed, P5)", () => {
  const r = run(join(tmpdir(), "definitely-does-not-exist-pharn-scanobs.md"));
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});

test("no argument → nonzero exit, no stdout (fail-closed)", () => {
  const r = spawnSync(process.execPath, [SCANNER], { encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});
