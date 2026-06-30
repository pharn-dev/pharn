// .dev/floor/validate.test.mjs — black-box tests for the deterministic floor validator.
//
// Run as a subprocess so validate.mjs keeps its dependency-free, top-level-exec contract:
// we only assert on its public surface (exit code + canonical stdout report).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const VALIDATE = join(here, "validate.mjs");

function run(target) {
  return spawnSync(process.execPath, [VALIDATE, target], { encoding: "utf8" });
}

test("GREEN fixture: valid capability exits 0", () => {
  const r = run(join(here, "test-fixtures", "green"));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /FLOOR: GREEN/);
});

test("RED fixture: missing required fields exits 1", () => {
  const r = run(join(here, "test-fixtures", "red"));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FLOOR: RED/);
});

// Build a hermetic repo of { "rel/path": "contents" } in a scratch dir, run validate, clean up.
function withRepo(files, fn) {
  const root = mkdtempSync(join(tmpdir(), "pharn-validate-"));
  try {
    for (const [rel, body] of Object.entries(files)) {
      const p = join(root, rel);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, body);
    }
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// A minimal valid product capability (role-bearing + non-empty evals) — validate COUNTS and passes it.
const VALID_CAP = `---
name: sample-lens
role: lens
kind: pharn-owned
version: 0.1.0
---

# A sample product capability
`;

// Locks the dev/product boundary on the floor: validate excludes .dev/ WHOLESALE (the move replaced the
// old per-folder `floor/` special-case with a single `.dev/` segment). A role-bearing file anywhere under
// .dev/ must NOT be counted; the one product capability at root must be. If either .dev/ file were counted
// the report would be "RED — … 2/3 capabilities checked" (they have no evals), never "GREEN — 1".
test("★ .dev/ excluded WHOLESALE: role-bearing files under .dev/ are NOT counted; the root product capability IS (count stays 1)", () => {
  withRepo(
    {
      "pharn-review/sample/sample.md": VALID_CAP,
      "pharn-review/sample/evals/cases/case-1.md": "# a case\n",
      "pharn-review/sample/evals/expected/expected-1.md": "# expected\n",
      ".dev/floor/fake-capability.md": VALID_CAP,
      ".dev/features/x/also-fake.md": VALID_CAP,
    },
    (root) => {
      const r = run(root);
      assert.equal(r.status, 0);
      assert.match(r.stdout, /FLOOR: GREEN — 1 capabilities checked/);
    }
  );
});
