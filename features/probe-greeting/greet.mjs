// features/probe-greeting/greet.mjs
//
// THROWAWAY VEHICLE for the product-pipeline integration probe
// (.dev/features/product-pipeline-probe/). This is NOT a product capability and makes
// no guarantee claim (P0) — it exists only so the four product stages (/pharn-spec →
// /pharn-plan → /pharn-grill → /pharn-build) have a real feature to traverse end-to-end.
// Scheduled for revert in a follow-up increment (human-approved disposition, 2026-06-30).
//
// Pure, deterministic, zero imports, no I/O.

export function greet(name) {
  return `Hello, ${name}!`;
}
