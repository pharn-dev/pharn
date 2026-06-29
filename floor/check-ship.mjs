#!/usr/bin/env node
// floor/check-ship.mjs — the deterministic STOP-DECISION CORE for the `/ship --loop` mode.
//
// Floor/eval infrastructure — NOT a Capability (no `role:`; the floor capability count stays 1, exactly
// like floor/check-verify.mjs / floor/check-regress.mjs / floor/check-variance.mjs / check-structural.mjs,
// which live in this floor-ignored dir). It owns the WHOLE deterministic stop/continue decision of the
// loop so the maximum surface is in tested Node, not in the command's prose. The command
// (.claude/commands/ship.md, `--loop` mode) owns only the I/O side-effects (running the stages, applying
// fixes, writing artifacts); this helper computes whether the loop STOPS or CONTINUES.
//
// WHY THIS FILE EXISTS — the floor reduction that makes `--loop` legal (ARCHITECTURE §2 / §7, P0):
//   `--loop` iterates the verification body with NO human between iterations, so its termination is
//   safety-critical and MUST be floor, not agent judgment. This helper reduces the stop to two
//   deterministic operations: (1) enum membership over the two FLOOR verdicts that the existing stages
//   already emit — /verify's `.verdict` and /regress's `.verdict` — and (2) an integer `iter >= cap`
//   compare. The agent OBEYS the exit code (advisory COMPLIANCE, exactly as it obeys check-verify).
//
// "/review NEVER GATES THE LOOP" IS STRUCTURAL, NOT DISCIPLINE (the core invariant, ship-gated OQ3):
//   this helper's input signature is exactly { verify-report.json, regression-report.json, iter, cap }.
//   It has NO `/review` parameter — it CANNOT receive REVIEW.md, a finding, or an LLM-assigned severity.
//   So "the loop stops on the two FLOOR verdicts, /review is advisory" is true by construction, not by an
//   agent promise. Counting /review blocking-findings as a loop gate would read LLM severity as a
//   deterministic gate — the fix#3 disease — and is impossible here because the input does not exist.
//
// DECISION (ARCHITECTURE §2 primitive #3 — enum membership + integer threshold):
//   floor_green := verify.verdict === "PASS" && regress.verdict === "no-regressions"
//     floor_green                        → STOP_GREEN   exit 0  (the loop reached the floor stop)
//     !floor_green && iter >= cap        → STOP_CAP     exit 1  (bounded: cap hit without green — bail)
//     !floor_green && iter <  cap        → CONTINUE     exit 3  (iterate: fix + re-verify)
//     bad input (missing/unparseable report, .verdict not a known enum value, iter/cap not a positive
//                integer)                → INCONCLUSIVE exit 2  (FAIL-CLOSED, P5 — NEVER a silent CONTINUE)
//
// The 4 outcomes need 4 exit codes (a pass/fail gate's 0/1/2 cannot express CONTINUE). 0/1/2 keep their
// usual meaning (converged / failed-to-converge / bad-input); 3 is the distinct non-terminal CONTINUE.
//
// HONEST SCOPE (P0/P7): this guarantees the loop's STOP CONDITION (stops only on floor-GREEN or cap;
// never unbounded; /review never gates) — it guarantees NOTHING about whether any fix WORKS (that is
// irreducible model work, advisory). A non-converging fix simply runs to the cap and hands to the human.
//
// TRUST (P2): every operand is produced by deterministic tooling — two `.verdict` enum strings and two
// ints. NO free-text (`problem`/`evidence`), NO /review input is ever read. Inputs are JSON.parsed and
// used ONLY as string/int operands — never eval'd, executed, spawned, imported, or sent anywhere. No
// child process, no network. The decision is PROVABLY independent of any tainted field.
//
// Usage:
//   node floor/check-ship.mjs <verify-report.json> <regression-report.json> --iter <N> --cap <M>
//
// Exit: 0 STOP_GREEN · 1 STOP_CAP · 2 INCONCLUSIVE (bad input, fail-closed) · 3 CONTINUE.

import { readFileSync, existsSync } from "node:fs";

// The known verdict enums the two FLOOR stages emit (check-verify.mjs / check-regress.mjs). A `.verdict`
// outside its set is malformed input → INCONCLUSIVE (fail-closed), NOT a silent "not green → continue".
const VERIFY_VERDICTS = new Set(["PASS", "FAIL", "INCONCLUSIVE"]);
const REGRESS_VERDICTS = new Set(["no-regressions", "regressions", "inconclusive"]);

// --- emit one JSON document to stdout, then exit. The command captures this verbatim. ---
function emit(obj, code) {
  console.log(JSON.stringify(obj, null, 2));
  process.exit(code);
}

// --- read a flag value (`--flag value`) from an argv slice; undefined if absent. ---
function flag(args, name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}

// --- read a report file and validate its `.verdict` is a member of `allowed`. A missing / unparseable
//     file, a non-object, or a `.verdict` outside the enum is bad input → fail-closed (P5). ---
function readVerdict(path, label, allowed) {
  if (!path) return { ok: false, reason: `${label} path not provided` };
  if (!existsSync(path)) return { ok: false, reason: `${label} not found: ${path}` };
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    return { ok: false, reason: `${label} is not valid JSON (${path}): ${e.message}` };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: `${label} must be a JSON object (${path})` };
  }
  const v = parsed.verdict;
  if (typeof v !== "string" || !allowed.has(v)) {
    return { ok: false, reason: `${label} .verdict ${JSON.stringify(v)} is not one of {${[...allowed].join(", ")}} (${path})` };
  }
  return { ok: true, verdict: v };
}

// --- parse a positive-integer flag (`--iter 2`). A missing / non-digit / < 1 value is bad input. ---
function posInt(raw, name) {
  if (raw === undefined) return { ok: false, reason: `--${name} not provided` };
  if (!/^\d+$/.test(raw)) return { ok: false, reason: `--${name} must be a positive integer, got ${JSON.stringify(raw)}` };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return { ok: false, reason: `--${name} must be >= 1, got ${raw}` };
  return { ok: true, value: n };
}

function main() {
  const argv = process.argv.slice(2);
  // Leading positionals = everything before the first `--flag` (so a flag VALUE like `--iter 2` can never
  // leak in as a report path). The command always passes the two report files first, then the flags.
  const positional = [];
  for (const a of argv) {
    if (a.startsWith("--")) break;
    positional.push(a);
  }

  const verify = readVerdict(positional[0], "verify-report.json", VERIFY_VERDICTS);
  const regress = readVerdict(positional[1], "regression-report.json", REGRESS_VERDICTS);
  const iterR = posInt(flag(argv, "--iter"), "iter");
  const capR = posInt(flag(argv, "--cap"), "cap");

  // Fail-closed (P5): any malformed operand → INCONCLUSIVE (exit 2), NEVER a silent CONTINUE. Echo back
  // whatever parsed cleanly (nulls otherwise) plus the helper's OWN diagnostic `reason` (not free-text).
  const bad = [verify, regress, iterR, capR].find((r) => !r.ok);
  if (bad) {
    emit(
      {
        verify_verdict: verify.ok ? verify.verdict : null,
        regress_verdict: regress.ok ? regress.verdict : null,
        floor_green: null,
        iter: iterR.ok ? iterR.value : null,
        cap: capR.ok ? capR.value : null,
        decision: "INCONCLUSIVE",
        reason: bad.reason,
      },
      2
    );
  }

  const iter = iterR.value;
  const cap = capR.value;
  const floorGreen = verify.verdict === "PASS" && regress.verdict === "no-regressions";

  let decision, code, reason;
  if (floorGreen) {
    decision = "STOP_GREEN";
    code = 0;
    reason = "floor-GREEN: /verify PASS and /regress no-regressions — stop and present at the human gate";
  } else if (iter >= cap) {
    decision = "STOP_CAP";
    code = 1;
    reason = `cap reached: iter ${iter} >= cap ${cap} without floor-GREEN — stop and hand to the human`;
  } else {
    decision = "CONTINUE";
    code = 3;
    reason = `not floor-GREEN and iter ${iter} < cap ${cap} — iterate (fix within scope, then re-verify)`;
  }

  emit({ verify_verdict: verify.verdict, regress_verdict: regress.verdict, floor_green: floorGreen, iter, cap, decision, reason }, code);
}

main();
