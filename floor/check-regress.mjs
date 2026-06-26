#!/usr/bin/env node
// floor/check-regress.mjs — the deterministic REGRESSION CORE for the /regress stage.
//
// Floor/eval infrastructure — NOT a Capability (no `role:`; the floor capability count stays 1, exactly
// like floor/check-variance.mjs and floor/check-structural.mjs, which live in this floor-ignored dir).
// It owns the WHOLE deterministic verdict of /regress so the maximum surface is in tested Node, not in
// the command's Bash. The command (.claude/commands/regress.md) owns only the I/O side-effects (git,
// worktree, running the suite, writing artifacts); this helper does the set math and the comparison.
//
// One cohesive axis — "the regress verdict" — exposed as two subcommands (ARCHITECTURE §2, floor
// primitive #3: enum / path-membership / exit-code comparison):
//
//   scope   (PARTITION, runs BEFORE the suite) — pure path-set membership over PASSED-IN lists. No git,
//           no network, no filesystem. `inside` = the changed files; assert `inside ⊆ declared writes`
//           (a changed path outside the declared `writes:` is a BLOCKING fix#7 finding — the build
//           escaped its scope); derive the OUTSIDE gate inputs (test files + committed eval pairs whose
//           files are all outside the feature).
//
//   verdict (COMPARE, runs AFTER the suite) — over two { "<gate-id>": <exit-code int> } maps captured by
//           the command at the base commit and at HEAD. Per gate-id present in BOTH:
//             base != 0                 → PRE-EXISTING (already red at baseline — EXCLUDED, never blamed
//                                          on the feature, mirroring check-variance's errored-exclusion).
//             base == 0 && head != 0    → REGRESSION (a pass→fail flip OUTSIDE the feature).
//             base == 0 && head == 0    → OK.
//           A model detects regressions UNRELIABLY; this exit-code comparison detects them RELIABLY —
//           that is the entire reason /regress has ZERO LLM-judge in its core.
//
// HONEST SCOPE (P0/P7): the verdict is a deterministic function of the gate exit codes the command
// captures. /regress therefore catches EXACTLY what its suite catches — nothing more. A regression that
// NO deterministic check covers (a broken behavior with no test/rule/eval) is INVISIBLE here. The
// guarantee is "deterministically-detectable breakage outside the feature is caught," NOT "nothing
// broke." Said plainly, not hidden.
//
// TRUST (P2): every operand is produced by deterministic tooling — gate-ids (strings), exit codes
// (ints), and file paths (git diff / path membership): the enum-gated / floor-verifiable class. NO
// free-text (`problem`/`evidence`) is ever read by the verdict. Inputs are JSON.parsed and used ONLY as
// string/int operands and set members — never eval'd, executed, spawned, imported, or sent anywhere.
// No child process, no network. No guaranteed decision rests on a tainted field.
//
// Usage:
//   node floor/check-regress.mjs scope   --changed <list> --declared <list> [--tests <list>] [--eval-pairs <list>]
//   node floor/check-regress.mjs verdict <base-results.json> <head-results.json> [--base <ref>] [--inside <list>]
//     <list>       : comma/whitespace-separated repo-relative paths
//     <eval-pairs> : comma/whitespace-separated "EXPECTED::ACTUAL" tokens (the committed eval pairs)
//     results.json : a flat { "<gate-id>": <exit-code int>, ... } map written by the command
//
// Exit (both subcommands): 0 clean · 1 blocking (scope: escaped path | verdict: >=1 regression) ·
//   2 inconclusive / bad input — FAIL-CLOSED (P5), never a silent pass.

import { readFileSync, existsSync } from "node:fs";

// --- emit one JSON document to stdout, then exit. The command captures this verbatim. ---
function emit(obj, code) {
  console.log(JSON.stringify(obj, null, 2));
  process.exit(code);
}

// --- comma/whitespace list -> normalized, de-duplicated path array. ---
function parseList(s) {
  if (s === undefined || s === null) return [];
  const out = [];
  for (const tok of String(s).split(/[\s,]+/)) {
    const p = normPath(tok);
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

// --- strip a leading "./" and trailing slashes; trim. Repo-relative, forward-slash. ---
function normPath(p) {
  return String(p).trim().replace(/^\.\//, "").replace(/\/+$/, "");
}

// --- tiny stdlib glob matcher (same dialect as the writes-scope hooks): `**` spans segments
//     (incl. `/`), `*` matches within one segment, everything else is a LITERAL char — a path with no
//     glob chars therefore reduces to exact equality. Matched by deterministic O(glob·file) dynamic
//     programming, NOT by compiling the pattern into a `new RegExp(...)`: the pattern is an untrusted
//     CLI operand, so it is never handed to the regex engine — no regex-injection / ReDoS sink (P2/P5).
//     `dp[j]` = "the remaining glob tokens match file[j..]"; the table is filled token-by-token from
//     the end, so total work is bounded by tokens × (file length + 1). ---
function globToTokens(glob) {
  const tokens = [];
  for (let i = 0; i < glob.length; i++) {
    if (glob[i] === "*") {
      if (glob[i + 1] === "*") {
        tokens.push({ t: "globstar" }); // matches any run, including "/"
        i++;
      } else {
        tokens.push({ t: "star" }); // matches any run WITHIN one segment (no "/")
      }
    } else {
      tokens.push({ t: "lit", c: glob[i] }); // exact char — would-be regex metachars are inert
    }
  }
  return tokens;
}

function globMatch(glob, file) {
  const tokens = globToTokens(glob);
  const m = file.length;
  // next[j] — can the tokens after the current one match file[j..m) ? Seeded with the empty suffix:
  // only an exhausted file (j === m) matches zero remaining tokens.
  let next = new Array(m + 1).fill(false);
  next[m] = true;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const cur = new Array(m + 1).fill(false);
    const tok = tokens[i];
    for (let j = m; j >= 0; j--) {
      if (tok.t === "lit") {
        cur[j] = j < m && file[j] === tok.c && next[j + 1];
      } else if (tok.t === "star") {
        cur[j] = next[j] || (j < m && file[j] !== "/" && cur[j + 1]);
      } else {
        cur[j] = next[j] || (j < m && cur[j + 1]); // globstar
      }
    }
    next = cur;
  }
  return next[0];
}

function matchesAny(file, patterns) {
  return patterns.some((pat) => globMatch(pat, file));
}

// --- read a flag value (`--flag value`) from an argv slice; undefined if absent. ---
function flag(args, name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}

// ---------------------------------------------------------------------------------------------------
// scope — partition the changed files into inside/outside; assert inside ⊆ declared (fix #7).
// ---------------------------------------------------------------------------------------------------
function runScope(args) {
  const changedRaw = flag(args, "--changed");
  const declaredRaw = flag(args, "--declared");
  if (changedRaw === undefined || declaredRaw === undefined) {
    emit(
      {
        verdict: "inconclusive",
        reason: "scope requires --changed <list> and --declared <list>",
      },
      2
    );
  }

  const inside = parseList(changedRaw); // the changed files (from `git diff` — the command's job)
  const declared = parseList(declaredRaw); // the plan's `## Files` declared writes (patterns allowed)
  const tests = parseList(flag(args, "--tests")); // the FULL test-file universe (the command's job)

  // --tests is a LIST of REAL file paths — the command expands any globs (e.g. via `git ls-files`)
  // BEFORE calling. The partition below is exact-set membership, so a raw glob string would never
  // match an inside path and would silently bypass the inside/outside coverage. Reject glob
  // metacharacters up front (fail-closed, P5) — never a silent pass.
  const globbyTest = tests.find((t) => t.includes("*"));
  if (globbyTest !== undefined) {
    emit(
      {
        verdict: "inconclusive",
        reason: `--tests must be an expanded list of real file paths, not a glob: '${globbyTest}' (expand it first, e.g. via \`git ls-files\`)`,
      },
      2
    );
  }
  // --eval-pairs tokens are "EXPECTED::ACTUAL". A token missing the `::` separator is malformed input:
  // fail closed (P5, exit 2) rather than silently dropping it from the outside-gate set — a dropped
  // pair would silently shrink coverage, the exact silent pass this core forbids.
  const evalPairTokens = (flag(args, "--eval-pairs") || "")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const malformedPair = evalPairTokens.find((tok) => !tok.includes("::"));
  if (malformedPair !== undefined) {
    emit(
      {
        verdict: "inconclusive",
        reason: `--eval-pairs token '${malformedPair}' is missing the 'EXPECTED::ACTUAL' separator '::' — fail-closed, never silently dropped`,
      },
      2
    );
  }
  const evalPairs = evalPairTokens
    .map((tok) => {
      const cut = tok.indexOf("::");
      return { expected: normPath(tok.slice(0, cut)), actual: normPath(tok.slice(cut + 2)) };
    })
    .filter((p) => p.expected && p.actual);

  // fix #7 cross-check: every changed file must be covered by a declared `writes:` pattern. A changed
  // path matching none means the build wrote OUTSIDE its declared `## Files` — a blocking escape.
  const escaped = inside.filter((f) => !matchesAny(f, declared));

  // Derive the OUTSIDE gate inputs by path membership (NOT classification, P5): a test/eval is "inside"
  // iff its file is in the changed set; everything else is outside and must not regress.
  const insideSet = new Set(inside);
  const outsideTests = tests.filter((t) => !insideSet.has(t));
  const outsideEvalPairs = evalPairs.filter((p) => !insideSet.has(p.expected) && !insideSet.has(p.actual));

  if (escaped.length) {
    // Dogfood the finding object (fix #1): type/rule_id/severity/file are enum-gated (this helper's own
    // deterministic assertions → trusted); `problem` is free-text DATA. rule_id cites P0 — the
    // writes-scope is a floor guarantee (fix #7; the enforce-writes-scope hook cites P0 the same way).
    const findings = escaped.map((f) => ({
      type: "FINDING",
      rule_id: "P0",
      severity: "blocking",
      file: f,
      problem: `changed file '${f}' is outside the declared writes-scope (fix #7) — the build escaped its plan's \`## Files\``,
    }));
    emit({ inside, declared, escaped, findings, outside_tests: outsideTests, outside_eval_pairs: outsideEvalPairs }, 1);
  }

  emit({ inside, declared, escaped: [], outside_tests: outsideTests, outside_eval_pairs: outsideEvalPairs }, 0);
}

// ---------------------------------------------------------------------------------------------------
// verdict — compare two captured { gate-id: exit-code } maps; flag pass→fail flips outside the feature.
// ---------------------------------------------------------------------------------------------------
function readResultsMap(path, label) {
  if (!path) return { ok: false, reason: `${label} path not provided` };
  if (!existsSync(path)) return { ok: false, reason: `${label} not found: ${path}` };
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    return { ok: false, reason: `${label} is not valid JSON (${path}): ${e.message}` };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: `${label} must be a { "<gate-id>": <int> } object (${path})` };
  }
  const keys = Object.keys(parsed);
  if (keys.length === 0) return { ok: false, reason: `${label} is empty — no gates captured (${path})` };
  for (const k of keys) {
    if (!Number.isInteger(parsed[k])) {
      return { ok: false, reason: `${label} gate "${k}" is not an integer exit code: ${JSON.stringify(parsed[k])} (${path})` };
    }
  }
  return { ok: true, value: parsed };
}

function runVerdict(positional, args) {
  const basePath = positional[0];
  const headPath = positional[1];
  const baseRef = flag(args, "--base");
  const inside = parseList(flag(args, "--inside"));

  const base = readResultsMap(basePath, "base-results.json");
  const head = readResultsMap(headPath, "head-results.json");
  if (!base.ok || !head.ok) {
    emit({ verdict: "inconclusive", reason: [base.ok ? null : base.reason, head.ok ? null : head.reason].filter(Boolean).join("; ") }, 2);
  }

  // Fail-closed (P5): the command captures the SAME scoped gates at base and head by construction. If
  // the key sets differ, a gate ran on one side only — we cannot classify it and must NOT silently
  // pass (an uncompared gate could hide a regression). Inconclusive, naming the difference.
  const baseKeys = Object.keys(base.value);
  const headKeys = Object.keys(head.value);
  const onlyBase = baseKeys.filter((k) => !(k in head.value));
  const onlyHead = headKeys.filter((k) => !(k in base.value));
  if (onlyBase.length || onlyHead.length) {
    emit(
      {
        verdict: "inconclusive",
        reason: `gate set mismatch between base and head — only in base: [${onlyBase.join(", ")}], only in head: [${onlyHead.join(", ")}]`,
      },
      2
    );
  }

  const outsideGates = {};
  const regressions = [];
  const preExisting = [];
  for (const id of baseKeys.sort()) {
    const b = base.value[id];
    const h = head.value[id];
    outsideGates[id] = { base: b, head: h };
    if (b !== 0)
      preExisting.push(id); // already red at baseline — not the feature's fault
    else if (h !== 0) regressions.push(id); // GREEN → RED outside the feature = regression
    // else b === 0 && h === 0 → OK
  }

  const verdict = regressions.length ? "regressions" : "no-regressions";
  emit(
    {
      base: baseRef !== undefined ? baseRef : null,
      inside,
      outside_gates: outsideGates,
      regressions,
      pre_existing: preExisting,
      verdict,
    },
    regressions.length ? 1 : 0
  );
}

function main() {
  const sub = process.argv[2];
  const rest = process.argv.slice(3);
  // Leading positionals = args before the first `--flag` (so a flag VALUE like `--base abc123` never
  // leaks in as a positional). The command always passes the two results files first, then flags.
  const positional = [];
  for (const a of rest) {
    if (a.startsWith("--")) break;
    positional.push(a);
  }

  if (sub === "scope") return runScope(rest);
  if (sub === "verdict") return runVerdict(positional, rest);

  emit(
    {
      verdict: "inconclusive",
      reason:
        "usage: check-regress.mjs scope --changed <list> --declared <list> [--tests <list>] [--eval-pairs <list>] | verdict <base-results.json> <head-results.json> [--base <ref>] [--inside <list>]",
    },
    2
  );
}

main();
