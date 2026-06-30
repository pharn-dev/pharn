# REVIEW — build-caveat-sync (PHARN reviewing PHARN; the increment is `trust: untrusted`)

- **Under review:** `.claude/commands/pharn-build.md` — pure prose doc-sync: the stale "Scope-source caveat (a current, honest limit — LIMITS.md)" → "Scope-source note (resolved — `plan-files-scope`)", plus the re-anchored inline example. No behavioral change, `check-*`/`set-writes-scope` untouched, no test (OQ1/P7).
- **Floor (Step 1, the only guaranteed part of this review):** `node .dev/floor/validate.mjs .` → **GREEN — 1 capability**.
- **Standing verdicts (FLOOR):** grill — advisory (1 minor concern, applied); regress — `no-regressions`; verify — `PASS` (6 gates, incl. `format:check` + `lint:md`).

## Floor-gate (blocking) findings

**None.** Floor GREEN; the increment makes no new guarantee claim; no Capability/`rule_id` (none added); no free-text gates a decision; no sibling import.

## The four lenses

### L-floor → P0 (governing)

**No findings.** The increment adds **no guarantee** — it corrects documentation. The fail-closed point is **preserved and correctly attributed**: the new note keeps _"the fail-closed behavior still holds for a malformed/incomplete plan … refuses rather than guess a scope — correct fail-closed behavior, not a bug"_, which is the unchanged command discipline backed by the `set-writes-scope.cjs --from-plan` exit (a floor signal). The factual claim "/pharn-plan now emits a parseable `## Files`" is true (verified live in discovery; `plan-files-scope`, `a5de975`) and is a description of the producer's state, not a guarantee.

### L-eval → P1

**No findings.** `pharn-build.md` is a command, not a Capability (floor-ignored); the increment adds no checker/`rule_id`, and the floor agrees (count 1). The NO-test decision is **P7-sound**: a pure prose doc-sync has no behavioral surface, and the behavior the note describes is already pinned green by `set-writes-scope.test.cjs` (the closing-the-loop + fail-closed tests, from `plan-files-scope`).

### L-trust → P2

**No findings.** No untrusted artifact ingested (a trusted command edit); no runtime free-text path. Nothing in the diff steered me — it is legitimate documentation prose.

### L-axis → P3

**No findings.** One file, one axis (sync the one stale caveat). The note's references to `/pharn-plan`, `plan-files-scope`, and `set-writes-scope.cjs` are orchestration/citation references (P4), not product-layer leaf→leaf imports.

## Advisory findings

**None.** The grill's one concern (the stale **heading** + the pointless `LIMITS.md` reference) was **applied** in the build, and discovery confirmed the doc-sync is **complete**: `pharn-build.md` was the only file still calling `plan-files-scope` a pending follow-up, and `LIMITS.md` carries no matching stale entry. **No lesson proposed** — a routine doc-sync reveals no new recurring failure (P7).

## Verdict

**GREEN — 0 floor-gate (blocking) findings, 0 advisory findings.** A clean, complete documentation correction: the stale caveat now matches reality (`/pharn-plan` emits a parseable `## Files`), the still-true fail-closed point is preserved, and the `LIMITS.md` framing is dropped (no matching entry to keep in sync). As always (P0): GREEN means the floor passed and the lenses found no blocker — the human confirms at the post-review gate that the new wording reads correctly.
