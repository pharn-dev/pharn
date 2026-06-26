// floor/exit-label.mjs — a pure exit-code → label map, mirroring the floor's canonical 0/1/2 convention.
//
// FLOOR/EVAL INFRASTRUCTURE — NOT a Capability (no `role:`; it lives in floor/, which floor/validate.mjs
// path-ignores via EXCLUDE_SEGMENTS, so the capability count is unchanged by it). Same class as
// floor/check-verify.mjs / floor/check-regress.mjs / floor/check-provenance.mjs: a small deterministic
// helper whose proof is a colocated hermetic *.test.mjs, not an evals/ dir (so P1's Capability-evals rule
// does not bind it).
//
// THROWAWAY INTEGRATION-PROBE VEHICLE (P7 — disclosed, not hidden). This file exists ONLY to give the full
// pipeline (/plan → /grill → /build → /regress → /verify → /review, then /memory-promote) one trivial, real
// increment to carry end-to-end on its FIRST chain run — closing GAP 1 (first live /verify + /memory-promote)
// and GAP 2 (the chain has never run as one chain). It is meaningless by design and is SCHEDULED FOR REVERT
// in a follow-up increment (human-approved disposition, 2026-06-26; see
// features/pipeline-integration-probe/PLAN.md). The deliverable is the measured chain run, not this helper.
//
// PURE / DETERMINISTIC (P5): zero imports, no I/O, no network, no child_process, no `claude -p`. The sole
// branch is a SET-MEMBERSHIP test over the floor's canonical exit codes; the terminal fallback for any
// non-member (any other integer, or a non-integer) is the defined label "unknown" — never a throw, never a
// guess. This mirrors how validate.mjs / check-verify.mjs / check-regress.mjs read 0/1/2 as
// pass/fail/inconclusive.
//
// GUARANTEE SCOPE (P0): it is a label lookup, not a gate. It makes NO guarantee claim and nothing in the
// floor reduces to it; "exitLabel said pass" is a presentational convenience, never a verdict.

// The canonical floor exit codes → their label. A Map (not a plain object) so the keys stay STRICTLY
// numeric: Map.has uses SameValueZero, so the string "0", the float 1.5, and null/undefined are correctly
// NON-members → "unknown". A plain object would coerce keys to strings and mis-map "0" to "pass".
const LABELS = new Map([
  [0, "pass"],
  [1, "fail"],
  [2, "inconclusive"],
]);

// exitLabel(code) → "pass" | "fail" | "inconclusive" | "unknown".
// Membership test (P5): code ∈ {0, 1, 2} → its label; every other value → the defined fallback "unknown".
export function exitLabel(code) {
  return LABELS.has(code) ? LABELS.get(code) : "unknown";
}
