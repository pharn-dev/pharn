// .claude/hooks/set-writes-scope.test.cjs — locks the dev/product ARTIFACT SPLIT (fix #7 setter).
//
// After the dev/product boundary move, the build-loop commands write their artifacts under
// `.dev/features/`, NOT root `features/` (root `features/` is reserved for the PRODUCT pipeline's
// SPEC.md etc.). That split is enforced DETERMINISTICALLY by each `pharn-dev-*` command's `writes:`
// placeholder being `.dev/features/<name>/…`: the setter resolves a `.dev/features/<name>` --target,
// and a ROOT `features/<name>` --target matches no entry → fail-closed (no scope written).
//
// This pins that for `/pharn-dev-plan` against the REAL command file (membership, not a synthetic
// fixture — mirrors enforce-writes-scope.test.cjs's real-review.md regression test). It also backfills
// dedicated set-writes-scope.cjs coverage (previously exercised only via enforce-writes-scope.test.cjs).
// Run as a subprocess so the setter keeps its dependency-free, top-level-exec contract; cwd = a fresh
// temp dir so the real repo .pharn/ is never touched.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const { join } = require("node:path");

const SETTER = join(__dirname, "set-writes-scope.cjs");
const PLAN_CMD = join(__dirname, "..", "commands", "pharn-dev-plan.md");
const PLAN_PRODUCT_CMD = join(__dirname, "..", "commands", "pharn-plan.md");

function tmp() {
  return fs.mkdtempSync(join(os.tmpdir(), "pharn-sws-"));
}
function setter(cwd, ...args) {
  return spawnSync(process.execPath, [SETTER, ...args], { cwd, encoding: "utf8" });
}

test("artifact-split lock: /pharn-dev-plan resolves a .dev/features/<name> --target to that one build-loop path", () => {
  const cwd = tmp();
  const r = setter(cwd, "--from-frontmatter", PLAN_CMD, "--target", ".dev/features/sample/PLAN.md");
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, [".dev/features/sample/PLAN.md"]);
});

test("artifact-split lock: a ROOT features/<name> --target is REJECTED (pharn-dev-* write .dev/features/, never root features/)", () => {
  const cwd = tmp();
  const r = setter(cwd, "--from-frontmatter", PLAN_CMD, "--target", "features/sample/PLAN.md");
  // pharn-dev-plan's `writes:` placeholder is `.dev/features/<name>/PLAN.md`; a root `features/…` target
  // matches no entry, so the setter emits no concrete scope, exits non-zero, and writes nothing (fail-closed).
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});

// --- fail-closed: --from-plan on a PLAN with no parseable `## Files` (the /pharn-build crux) ---
// /pharn-build sets its writes-scope via `set-writes-scope.cjs --from-plan PLAN.md`, which requires a
// `## Files` heading whose items lead with a back-tick path. The product /pharn-plan template currently
// emits a free-text `## Steps / Files` section instead — so the setter MUST fail-closed (exit 1, no scope
// written) rather than guess a scope from un-parseable prose. This pins that crux scenario (previously
// uncovered: every other --from-plan test feeds a present `## Files`).

test("--from-plan on a PLAN with no `## Files` heading (a free-text `## Steps / Files`) exits 1 and writes nothing (fail-closed)", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    ["# PLAN — x", "", "## Steps / Files", "", "- a concrete step or file to change", "- another step", ""].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});

// --- closing-the-loop: --from-plan SUCCEEDS on a PLAN in /pharn-plan's NEW emitted shape ---
// The inverse of the fail-closed test above (and of the /pharn-build crux). After the `plan-files-scope`
// increment, the product /pharn-plan template emits a parseable `## Files` (a `## Files` heading whose
// items lead with a back-tick path), splitting the old free-text `## Steps / Files`. This pins that a
// PLAN in that shape sets a scope = exactly its `## Files` back-tick paths — proving the product chain
// spec → plan → build can now derive a writes-scope. The fixture mirrors the template's section
// structure (## Approach / ## Steps / ## Files / ### Explicitly not touched / ## Acceptance mapping) so
// it pins the PRODUCER's shape, not an arbitrary parser-accepted one (cf. the producer-faithfulness test
// below, which runs the setter over the real pharn-plan.md template).

test("--from-plan on a /pharn-plan-shaped PLAN (## Files with back-tick paths) exits 0; scope = exactly the authorized paths", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "---",
      "spec_id: sample-feature",
      "spec_content_hash: 0000000000000000000000000000000000000000000000000000000000000000",
      "---",
      "",
      "## Approach",
      "",
      "Rework the widget pipeline; the public `src/should-not-leak.ts` API is not touched.",
      "",
      "## Steps", // advisory prose BEFORE ## Files — its back-tick paths must NOT enter scope
      "",
      "- `src/also-not-scope.ts` — a step that names a file in back-ticks above ## Files",
      "- wire the new module into the pipeline",
      "",
      "## Files",
      "",
      "- `src/widget.ts` — the new widget module",
      "- `src/widget.test.ts` — its unit tests",
      "",
      "### Explicitly not touched", // a heading → the setter stops here; these paths never enter scope
      "",
      "- `src/legacy.ts` — reused, never edited",
      "",
      "## Acceptance mapping",
      "",
      "- AC-1 → the widget renders",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0); // SUCCESS — the inverse of the fail-closed cases above
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  // scope is EXACTLY the ## Files back-tick paths, in order …
  assert.deepEqual(rec.scope, ["src/widget.ts", "src/widget.test.ts"]);
  // … and excludes the `### Explicitly not touched` path (the #15 hardening, here for a product plan) …
  assert.equal(rec.scope.includes("src/legacy.ts"), false);
  // … and excludes a back-tick path that appeared in ## Steps / ## Approach BEFORE ## Files.
  assert.equal(rec.scope.includes("src/also-not-scope.ts"), false);
  assert.equal(rec.scope.includes("src/should-not-leak.ts"), false);
});

// --- CF-E regression: an explanatory BLOCKQUOTE under `## Files` must NOT truncate the authorized list.
// A `> …` note that mentions an exclusion cue ("not touched", e.g. a reference to the
// `### Explicitly not touched` subsection) is explanatory commentary, never an exclusion-section intro.
// Before the fix it tripped the head-less-exclusion Boundary-2 break and zeroed the scope → fail-closed
// exit 1, blocking a valid plan (CF-E, .dev/features/product-pipeline-probe/PROBE.md). Only blockquotes are
// exempted — the next test pins that a NON-blockquote head-less intro still fails closed.

test("--from-plan: a blockquote note with an exclusion cue ABOVE the paths does NOT truncate scope (CF-E)", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "## Files",
      "",
      "> Explanatory note: the files below are written; others are not touched (see the",
      "> `### Explicitly not touched` subsection).",
      "",
      "- `src/widget.ts` — the new widget module",
      "",
      "### Explicitly not touched",
      "",
      "- `src/legacy.ts` — reused, never edited",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0); // the blockquote no longer fails it closed
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["src/widget.ts"]); // the path AFTER the blockquote is collected …
  assert.equal(rec.scope.includes("src/legacy.ts"), false); // … and the `### Explicitly not touched` path stays excluded
});

test("--from-plan: a NON-blockquote head-less exclusion intro (`Files NOT written:`) still fails closed", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  // No authorized path precedes the head-less intro, so Boundary 2 (preserved for non-blockquotes) breaks
  // before any path is collected → empty scope → fail-closed. Proves the CF-E fix did NOT weaken exclusions.
  fs.writeFileSync(plan, ["## Files", "", "Files NOT written:", "", "- `src/legacy.ts` — excluded", ""].join("\n"));
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});

// --- producer-faithfulness: the REAL product /pharn-plan template fails closed (locks the placeholder
// style). The template's `## Files` example items are angle-bracket placeholders (`- `<path>``), which
// `isConcrete` rejects → the setter emits no scope and exits 1. This ties a test to the actual producer
// file: if the template ever regressed to a BARE-WORD example (`- `path``), that bare word would parse
// as a real scope path, the setter would exit 0, and THIS test would fail — catching the regression
// (the fail-closed-on-unfilled discipline the dev /pharn-dev-plan `<path>` placeholder also preserves).

test("--from-plan over the real pharn-plan.md template exits 1 (its `## Files` `<path>` placeholders fail closed)", () => {
  const cwd = tmp();
  const r = setter(cwd, "--from-plan", PLAN_PRODUCT_CMD);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});
