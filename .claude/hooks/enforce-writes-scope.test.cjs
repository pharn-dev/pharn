// .claude/hooks/enforce-writes-scope.test.cjs — black-box tests for the fix #7 writes-scope floor.
//
// Two scripts under test, driven as subprocesses (mirrors protect-trusted-paths.test.cjs):
//   set-writes-scope.cjs     — the deterministic SETTER (writes .pharn/writes-scope.json)
//   enforce-writes-scope.cjs — the pre-write HOOK (exit 2 = deny, 0 = allow)
// Every spawn uses cwd = a fresh temp dir so the real repo .pharn/ is never touched, and asserts on
// r.status (not stdout-grep alone). The composition test also spawns the fix #2 hook to prove fix #7
// is ADDITIVE: a scope that "allows" a trusted doc is still denied by fix #2.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const { join } = require("node:path");

const HOOK = join(__dirname, "enforce-writes-scope.cjs");
const SETTER = join(__dirname, "set-writes-scope.cjs");
const FIX2 = join(__dirname, "protect-trusted-paths.cjs");

function tmp() {
  return fs.mkdtempSync(join(os.tmpdir(), "pharn-ws-"));
}

function setScope(cwd, scope) {
  fs.mkdirSync(join(cwd, ".pharn"), { recursive: true });
  fs.writeFileSync(join(cwd, ".pharn", "writes-scope.json"), JSON.stringify({ scope, set_by: "test", set_at: "now" }));
}

function hook(cwd, filePath, script = HOOK) {
  return spawnSync(process.execPath, [script], {
    input: JSON.stringify({ tool_name: "Write", tool_input: { file_path: filePath } }),
    cwd,
    encoding: "utf8",
  });
}

function setter(cwd, ...args) {
  return spawnSync(process.execPath, [SETTER, ...args], { cwd, encoding: "utf8" });
}

// --- Hook, no scope file: fail-closed default-safe-set ---

test("no scope: a module path (pharn-review/) is ALLOWED", () => {
  assert.equal(hook(tmp(), "pharn-review/foo.md").status, 0);
});

test("no scope: features/ scratch is ALLOWED", () => {
  assert.equal(hook(tmp(), "features/foo/bar.md").status, 0);
});

test("no scope: memory-bank/ is DENIED (P2-gated zone)", () => {
  assert.equal(hook(tmp(), "memory-bank/x.md").status, 2);
});

test("no scope: floor/ is DENIED (the floor itself)", () => {
  assert.equal(hook(tmp(), "floor/x.mjs").status, 2);
});

test("no scope: .claude/ is DENIED (commands + hooks — a write here could disable fix #7)", () => {
  assert.equal(hook(tmp(), ".claude/x").status, 2);
});

test("no scope: .pharn/writes-scope.json is DENIED (setter-only — no Write-tool self-escalation)", () => {
  const r = hook(tmp(), ".pharn/writes-scope.json");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /writes-scope guard/);
});

test("no scope: other .pharn/ runtime files remain ALLOWED (bootstrap)", () => {
  assert.equal(hook(tmp(), ".pharn/other").status, 0);
});

test("no scope: parent traversal (../outside.md) is DENIED (root-normalization)", () => {
  const r = hook(tmp(), "../outside.md");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /writes-scope guard/);
  assert.match(r.stderr, /Blocked path : \.\.\/outside\.md/);
});

test("no scope: multi-segment traversal (../../outside.md) is DENIED (root-normalization)", () => {
  const r = hook(tmp(), "../../outside.md");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /writes-scope guard/);
  assert.match(r.stderr, /Blocked path : \.\.\/\.\.\/outside\.md/);
});

test("no scope: an absolute path outside the repo root is DENIED (root-normalization)", () => {
  const outside = join(os.tmpdir(), "pharn-writes-scope-outside.md");
  const r = hook(tmp(), outside);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /writes-scope guard/);
  assert.match(r.stderr, new RegExp(`Blocked path : ${outside.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
});

// --- Hook, scope present: authoritative (replaces the safe-set, not additive) ---

test("scope [features/foo/**]: inside is ALLOWED", () => {
  const cwd = tmp();
  setScope(cwd, ["features/foo/**"]);
  assert.equal(hook(cwd, "features/foo/x.md").status, 0);
});

test("scope [features/foo/**]: a module path OUTSIDE is DENIED (authoritative, not additive)", () => {
  const cwd = tmp();
  setScope(cwd, ["features/foo/**"]);
  assert.equal(hook(cwd, "pharn-core/x.md").status, 2);
});

// --- Hook, explicit unlock of a sensitive zone ---

test("scope [memory-bank/lessons-learned.md]: that exact file is ALLOWED", () => {
  const cwd = tmp();
  setScope(cwd, ["memory-bank/lessons-learned.md"]);
  assert.equal(hook(cwd, "memory-bank/lessons-learned.md").status, 0);
});

test("scope [memory-bank/lessons-learned.md]: a sibling in the zone is DENIED (declaration is tight)", () => {
  const cwd = tmp();
  setScope(cwd, ["memory-bank/lessons-learned.md"]);
  assert.equal(hook(cwd, "memory-bank/other.md").status, 2);
});

test("scope set: .pharn/writes-scope.json is DENIED even when scope names it (setter-only)", () => {
  const cwd = tmp();
  setScope(cwd, [".pharn/writes-scope.json", "features/foo/**"]);
  assert.equal(hook(cwd, ".pharn/writes-scope.json").status, 2);
});

test("scope set: other .pharn/ runtime files remain ALLOWED (bootstrap)", () => {
  const cwd = tmp();
  setScope(cwd, ["features/foo/**"]);
  assert.equal(hook(cwd, ".pharn/other").status, 0);
});

// --- Composition with fix #2 (additive, never replacing) ---

test("fix #2 still denies a trusted doc regardless of scope (scope-independent backstop)", () => {
  // The fix #2 hook denies the trusted doc on its own — no scope file involved.
  assert.equal(hook(tmp(), "ARCHITECTURE.md", FIX2).status, 2);
});

test("fix #7 is scope-only: a scope naming a trusted doc is ALLOWED by fix #7 (fix #2 is the backstop)", () => {
  const cwd = tmp();
  setScope(cwd, ["ARCHITECTURE.md"]);
  // fix #7 allows it (scope says so); fix #2, run in parallel by the same matcher, is what denies it.
  assert.equal(hook(cwd, "ARCHITECTURE.md").status, 0);
});

// --- Deny message is instruction-shaped ---

test("deny carries the instruction-shaped message (writes-scope guard + FIX + path + scope line)", () => {
  const r = hook(tmp(), "floor/x.mjs");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /writes-scope guard/);
  assert.match(r.stderr, /FIX/);
  assert.match(r.stderr, /Blocked path : floor\/x\.mjs/);
  assert.match(r.stderr, /none set/);
});

// --- Setter Mode A (frontmatter) ---

test("setter --from-frontmatter strips a ` (gated)` annotation and records set_by/set_at", () => {
  const cwd = tmp();
  const md = join(cwd, "cap.md");
  fs.writeFileSync(md, '---\nrole: lens\nwrites: ["REVIEW.md", "memory-bank/lessons-learned.md (gated)"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["REVIEW.md", "memory-bank/lessons-learned.md"]);
  assert.equal(typeof rec.set_by, "string");
  assert.equal(typeof rec.set_at, "string");
});

test("setter --from-frontmatter on a placeholder-only writes: exits non-zero and writes nothing", () => {
  const cwd = tmp();
  const md = join(cwd, "build.md");
  fs.writeFileSync(md, '---\nwrites: ["<files named in PLAN.md only>"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--from-plan/);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});

test("setter --from-frontmatter resolves features/<name>/PLAN.md to --target single file", () => {
  const cwd = tmp();
  const md = join(cwd, "plan.md");
  fs.writeFileSync(md, '---\nwrites: ["features/<name>/PLAN.md"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md, "--target", "features/foo/PLAN.md");
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["features/foo/PLAN.md"]);
});

test("setter --from-frontmatter resolves a glob writes entry to --target single file", () => {
  const cwd = tmp();
  const md = join(cwd, "plan.md");
  fs.writeFileSync(md, '---\nwrites: ["features/**/PLAN.md"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md, "--target", "features/writes-scope/PLAN.md");
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["features/writes-scope/PLAN.md"]);
});

test("setter --from-frontmatter on placeholder writes without --target exits non-zero", () => {
  const cwd = tmp();
  const md = join(cwd, "plan.md");
  fs.writeFileSync(md, '---\nwrites: ["features/<name>/PLAN.md"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--target/);
  assert.equal(fs.existsSync(join(cwd, ".pharn", "writes-scope.json")), false);
});

test("setter --from-frontmatter keeps concrete paths and resolves placeholders with --target", () => {
  const cwd = tmp();
  const md = join(cwd, "review.md");
  fs.writeFileSync(md, '---\nwrites: ["features/<name>/REVIEW.md", "memory-bank/lessons-learned.md (gated)"]\n---\n# x\n');
  const r = setter(cwd, "--from-frontmatter", md, "--target", "features/foo/REVIEW.md");
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["features/foo/REVIEW.md", "memory-bank/lessons-learned.md"]);
});

// --- Regression (pipeline-integration-probe finding #2): the REAL /review declares ONLY its output ---
// /review writes one artifact — features/<name>/REVIEW.md. Canon (memory-bank/**) is written solely by
// /memory-promote (gated + check-provenance + human accept). A `memory-bank/**` entry in /review's
// `writes:` would make the setter resolve a scope the pre-write hook then PERMITS — a direct, ungated
// canon write. Pin the real command file's resolved scope to exactly its REVIEW.md path.

test("setter --from-frontmatter on the REAL review.md resolves to ONLY features/<name>/REVIEW.md (no canon path)", () => {
  const cwd = tmp();
  const reviewCmd = join(__dirname, "..", "commands", "review.md");
  const r = setter(cwd, "--from-frontmatter", reviewCmd, "--target", "features/sample/REVIEW.md");
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["features/sample/REVIEW.md"]);
  assert.ok(
    !rec.scope.includes("memory-bank/lessons-learned.md"),
    "/review proposes lessons; only /memory-promote writes canon (P2) — review's scope must exclude memory-bank"
  );
});

// --- Setter Mode B (PLAN.md ## Files) ---

test("setter --from-plan reads the leading back-tick path of each ## Files item, stopping at 'not touched'", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "Written by `/build`:",
      "",
      "- `.claude/hooks/enforce-writes-scope.cjs` — **NEW.** the hook",
      "- `CLAUDE.md` — **EDIT.** add a section",
      "",
      "Explicitly **not** touched:",
      "",
      "- `floor/validate.mjs` — unchanged (must NOT enter scope)",
      "",
      "## Next section",
      "",
      "- `should-not-appear.md`",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, [".claude/hooks/enforce-writes-scope.cjs", "CLAUDE.md"]);
});

// --- Setter Mode B: exclusion-boundary tightness (fix #7 — an excluded path must NEVER enter scope) ---
// The laundering-equivalent for writes-scope: a path listed in a plan's exclusion section leaking into
// the writable scope is exactly the dangerous-direction failure. The boundary is wording-independent —
// ANY heading (or a head-less prose cue) ends the authorized list, so phrasing cannot smuggle a path in.

test("setter --from-plan: a `### Out of scope` heading (no 'touch' wording) keeps its paths OUT of scope", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "- `pharn-core/a.md` — **NEW.** the increment",
      "- `pharn-core/b.md` — **EDIT.** the increment",
      "",
      "### Out of scope",
      "",
      "- `floor/validate.mjs` — unchanged (must NOT enter scope)",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["pharn-core/a.md", "pharn-core/b.md"]);
  assert.ok(!rec.scope.includes("floor/validate.mjs"), "excluded-section path must be ABSENT");
});

test("setter --from-plan: a `### Excluded paths` heading keeps its paths OUT of scope (wording-independent)", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "- `pharn-core/a.md` — **NEW.**",
      "",
      "### Excluded paths",
      "",
      "- `floor/validate.mjs` — unchanged (must NOT enter scope)",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["pharn-core/a.md"]);
  assert.ok(!rec.scope.includes("floor/validate.mjs"), "excluded-section path must be ABSENT");
});

test("setter --from-plan: the live-corpus `### Explicitly **not** touched` heading keeps its paths OUT", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "- `.claude/hooks/set-writes-scope.cjs` — **EDIT.**",
      "- `.claude/hooks/enforce-writes-scope.test.cjs` — **EDIT.**",
      "",
      "### Explicitly **not** touched (declared NOT written)",
      "",
      "- `.claude/hooks/enforce-writes-scope.cjs` — the GUARD is correct (must NOT enter scope)",
      "- `floor/validate.mjs` — unchanged",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, [".claude/hooks/set-writes-scope.cjs", ".claude/hooks/enforce-writes-scope.test.cjs"]);
  assert.ok(!rec.scope.includes(".claude/hooks/enforce-writes-scope.cjs"), "the GUARD path must be ABSENT");
  assert.ok(!rec.scope.includes("floor/validate.mjs"), "excluded-section path must be ABSENT");
});

test("setter --from-plan: a head-less prose exclusion intro ('Files NOT written:') keeps its paths OUT", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "- `pharn-core/a.md` — **NEW.**",
      "",
      "Files NOT written (left unchanged):",
      "",
      "- `floor/validate.mjs` — unchanged (must NOT enter scope)",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(rec.scope, ["pharn-core/a.md"]);
  assert.ok(!rec.scope.includes("floor/validate.mjs"), "excluded-section path must be ABSENT");
});

test("setter --from-plan: a flat `## Files` with no exclusion captures ALL authorized paths (no early break)", () => {
  const cwd = tmp();
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    [
      "# PLAN — x",
      "",
      "## Files",
      "",
      "- `pharn-core/a.md` — **NEW.** a description that says it is not yet modified anywhere",
      "- `pharn-core/b.md` — **EDIT.**",
      "- `pharn-core/c.md` — **NEW.**",
      "",
      "## Next section",
      "",
      "- `should-not-appear.md`",
      "",
    ].join("\n")
  );
  const r = setter(cwd, "--from-plan", plan);
  assert.equal(r.status, 0);
  const rec = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  // Item a.md's DESCRIPTION mentions "not ... modified" but it is a path-item, so the cue does NOT drop it.
  assert.deepEqual(rec.scope, ["pharn-core/a.md", "pharn-core/b.md", "pharn-core/c.md"]);
});

// --- Setter hand-off: per-stage overwrite semantics (DEFECT A — overwrite is correct, no audit stack) ---

test("setter overwrite: a second setter call REPLACES the scope, never merges (per-stage hand-off)", () => {
  const cwd = tmp();
  // Stage 1: --from-plan pins two paths.
  const plan = join(cwd, "PLAN.md");
  fs.writeFileSync(
    plan,
    ["# PLAN — x", "", "## Files", "", "- `pharn-core/a.md` — **NEW.**", "- `pharn-core/b.md` — **EDIT.**", ""].join("\n")
  );
  assert.equal(setter(cwd, "--from-plan", plan).status, 0);
  const first = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(first.scope, ["pharn-core/a.md", "pharn-core/b.md"]);
  // Stage 2: a later stage sets its own scope to ONE different file — it must REPLACE, not append.
  const md = join(cwd, "review.md");
  fs.writeFileSync(md, '---\nrole: lens\nwrites: ["features/<name>/REVIEW.md"]\n---\n# x\n');
  assert.equal(setter(cwd, "--from-frontmatter", md, "--target", "features/foo/REVIEW.md").status, 0);
  const second = JSON.parse(fs.readFileSync(join(cwd, ".pharn", "writes-scope.json"), "utf8"));
  assert.deepEqual(second.scope, ["features/foo/REVIEW.md"]);
  assert.ok(!second.scope.includes("pharn-core/a.md"), "stage-1 paths must NOT persist (overwrite, not merge)");
  assert.ok(!second.scope.includes("pharn-core/b.md"), "stage-1 paths must NOT persist (overwrite, not merge)");
});

// --- Integration: setter then hook, end to end ---

test("integration: setter unlocks memory-bank/lessons-learned.md; hook then allows it and denies a module path", () => {
  const cwd = tmp();
  const md = join(cwd, "review.md");
  fs.writeFileSync(md, '---\nwrites: ["memory-bank/lessons-learned.md (gated)"]\n---\n# review\n');
  assert.equal(setter(cwd, "--from-frontmatter", md).status, 0);
  assert.equal(hook(cwd, "memory-bank/lessons-learned.md").status, 0);
  assert.equal(hook(cwd, "pharn-core/x.md").status, 2);
});
