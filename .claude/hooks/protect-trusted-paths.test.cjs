// .claude/hooks/protect-trusted-paths.test.cjs — black-box tests for the pre-write floor hook.
//
// The hook reads a PreToolUse payload from stdin and exits 2 (deny) on a trusted path,
// 0 (allow) otherwise. We drive it as a subprocess and assert on exit code + stderr.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const HOOK = join(__dirname, "protect-trusted-paths.cjs");

function run(payload) {
  return spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
}

test("blocks writes to a trusted spec doc", () => {
  const r = run({ tool_name: "Write", tool_input: { file_path: "CONSTITUTION.md" } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /BLOCKED by PHARN floor/);
});

test("allows writes to an ordinary file", () => {
  const r = run({ tool_name: "Write", tool_input: { file_path: "src/foo.js" } });
  assert.equal(r.status, 0);
});
