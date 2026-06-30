# GRILL — build-caveat-sync (advisory interrogation of PLAN.md)

**Plan:** `.dev/features/build-caveat-sync/PLAN.md` (pure doc-sync of the stale scope-source caveat in `pharn-build.md`). **OQ1** resolved → PRESERVE the fail-closed framing.
**Spec-hash check (content-hash floor primitive — surfaced, not blocking):** recomputed `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pin (`PLAN.md:3`). No drift.

> **This grill is ADVISORY end-to-end (P0).** No finding gates `/pharn-dev-build`. Enum-gated fields are my own assertions; free-text quotes the (untrusted) plan as DATA; `severity` is an advisory assignment (fix #3).

## Findings

### Axis P6 / P0 — completeness of the doc-sync (the caveat HEADING is also stale)

```yaml
- type: FINDING
  rule_id: P6
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/build-caveat-sync/PLAN.md:26"
  problem: "The plan rewrites the caveat's BODY and the inline example, but the caveat's HEADING still labels the gap 'a current, honest limit — LIMITS.md'; once /pharn-plan emits a parseable `## Files`, the gap is RESOLVED — it is no longer 'a current limit', so the LIMITS.md framing in the heading is itself stale and should be dropped/reframed too."
  evidence: 'PLAN.md:26 — ''(1) Rewrite the "Scope-source caveat" blockquote (:103-107): replace the … framing …''. The heading at pharn-build.md:103 reads ''**Scope-source caveat (a current, honest limit — LIMITS.md).**'' Confirmed live: LIMITS.md carries NO specific entry for this gap (grep → no match), so dropping the LIMITS.md reference is clean — there is no LIMITS.md text to keep in sync.'
```

**For the build to weigh:** when rewriting the blockquote, also update the **heading** — the gap is resolved, so it is no longer "a current, honest limit". Reframe it as a resolved note (e.g. "Scope-source note (resolved — `plan-files-scope`)") and drop the `LIMITS.md` parenthetical (LIMITS.md has no matching entry to point at). The fail-closed point stays in the body.

## Prose summary

The plan is **correct, minimal, and complete**. The interrogation confirmed two things live: (1) `pharn-build.md:105` is the **only** remaining file that still calls `plan-files-scope` a pending follow-up (grep over the repo, excluding `.dev/features/` audit trails) — so the plan's one-file scope **fully covers** the stale reference; (2) `LIMITS.md` carries **no** stale entry for this gap, so there is no human-only trusted-doc cleanup hiding behind the caveat's `LIMITS.md` citation. The no-test decision is **P7-sound**: a pure prose doc-sync has no behavioral surface, and the real behavior the caveat describes is already pinned green by `set-writes-scope.test.cjs` (the closing-the-loop + fail-closed tests, from `plan-files-scope`). The guarantee audit honestly labels the change advisory (a doc correction) with the fail-closed behavior unchanged (floor).

One **minor** concern: the rewrite should also fix the caveat's **heading** ("a current, honest limit — LIMITS.md"), not just the body — the gap being resolved means it is no longer a current limit. Surfaced for the build.

## Verdict

**ADVISORY VERDICT: 1 concern raised (0 blocking-severity, 1 minor) — for the human to weigh before `/pharn-dev-build`.** Not a gate, not "grill passed": `/pharn-dev-build` is free to proceed; the deterministic backstops remain its own floor-gates (spec-hash drift fix #4; unresolved `## Open questions (HALT)` — already resolved) and `.dev/floor/validate.mjs`. The one finding is a small completeness refinement (fix the heading too), not a blocker.
