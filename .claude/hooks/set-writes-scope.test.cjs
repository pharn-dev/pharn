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
