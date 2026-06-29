#!/usr/bin/env node
// floor/count-verifiers.mjs — deterministic verifier-MEMBERSHIP counter (CONSTITUTION P0/P5).
//
// Answers ONE structural question for /verify Step 2: which capabilities DECLARE `role: verifier`?
// Membership is read ONLY from the `---`-fenced YAML frontmatter — never a substring grep over file
// contents. A `role: verifier` string in PROSE or a fenced code block is DATA *about* verifiers, not a
// declaration *of* one (the enum-gated / free-text split of ARCHITECTURE §8 / fix #1, applied to
// membership detection). This closes pipeline-integration-probe finding #3 (REVIEW.md:80 / VERIFY.md):
// the old `grep -rl 'role: verifier'` matched 8 files, ALL prose, and grew as the repo's own prose did
// — "monotonically unstable," not merely imprecise.
//
// Non-LLM, stdlib-only, fail-closed. It MIRRORS (does not import — neither is exported) two precedents:
//   • floor/validate.mjs — the same `walk` + EXCLUDE_SEGMENTS capability surface, and `role` read from
//     frontmatter (so it counts EXACTLY the files validate.mjs treats as role-bearing capabilities).
//   • .claude/hooks/set-writes-scope.cjs `writesFromFrontmatter` — the `^---\r?\n([\s\S]*?)\r?\n---`
//     fence-extraction mechanism (read the key only INSIDE that block).
// Cite, don't restate (P4); a NEW file, not bolted onto either — each has its own single axis (P3):
// validate.mjs owns the structural floor verdict; set-writes-scope.cjs owns writes-scope.json.
//
// Usage:  node floor/count-verifiers.mjs [targetDir]      (default: cwd)
// Output: {"registered":<int>,"verifiers":[<repo-rel path>,...]} on stdout; exit 0 on success.
//         Exits non-zero (writing NOTHING to stdout) if targetDir is missing / not a directory — never a
//         silent 0 from looking in the wrong place (P5, fail-closed).

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const TARGET = process.argv[2] || ".";
// Same exclusions as floor/validate.mjs: tooling (.claude/commands, floor/) and noise are NOT the
// capability surface, so a `role: verifier` frontmatter there is not a built-PHARN verifier.
const EXCLUDE_SEGMENTS = [`${sep}.claude${sep}commands${sep}`, `${sep}floor${sep}`, `${sep}node_modules${sep}`, `${sep}.git${sep}`];

function fail(msg) {
  process.stderr.write("count-verifiers: " + msg + "\n");
  process.exit(1);
}

// Fail-closed (P5): a missing / non-directory target is an ERROR, never a silent empty count.
if (!existsSync(TARGET) || !statSync(TARGET).isDirectory()) {
  fail(`target dir not found (or not a directory): ${TARGET}`);
}

// Recursive *.md collector — mirrors floor/validate.mjs `walk`.
function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

// Mirrors floor/validate.mjs `isExcluded` — the same EXCLUDE_SEGMENTS surface.
function isExcluded(file) {
  const norm = sep + relative(TARGET, file);
  return EXCLUDE_SEGMENTS.some((seg) => norm.includes(seg));
}

// The `role:` value declared INSIDE a file's `---`-fenced YAML frontmatter, or null if there is none.
// Uses the set-writes-scope.cjs `^---\r?\n([\s\S]*?)\r?\n---` fence regex; reads the key ONLY within that
// block, so a `role:` line in the body (prose or a code block) is structurally unreachable. Quote- and
// whitespace-stripping mirror validate.mjs's frontmatter parse, so the two agree on what `role` is.
function frontmatterRole(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^role:\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const verifiers = [];
for (const file of walk(TARGET)) {
  if (isExcluded(file)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  // The ONLY membership test: enum equality against a frontmatter-gated field (P5). No content grep.
  if (frontmatterRole(text) === "verifier") {
    verifiers.push(relative(TARGET, file).replace(/\\/g, "/"));
  }
}
verifiers.sort();

process.stdout.write(JSON.stringify({ registered: verifiers.length, verifiers }) + "\n");
process.exit(0);
