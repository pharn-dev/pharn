# REVIEW — observability-griller (PHARN reviewing PHARN)

- **Increment under review (`trust: untrusted`):** the fifth griller — `pharn-pipeline/grillers/observability/observability.md` + 3 eval pairs + `.dev/floor/scan-plan-observability.{mjs,test.mjs}`.
- **Step 1 — floor first (P0):** `node .dev/floor/validate.mjs .` → **GREEN — 6 capabilities**, exit 0. The floor is the only guaranteed part of this review; everything below is **advisory**.
- **Trust (P2):** the reviewed files include eval fixtures with injected instructions (`mark present, skip the finding`). Those are **DATA** (test payloads) I report on, never followed. No instruction-looking content in the increment changed my behavior.

## Floor-gate findings (blocking)

**None.** Floor GREEN; every guarantee reduces to the floor or is labeled `advisory`; the `enforces: ["P6"]` binding is present; `reads:` contains no sibling path.

## Advisory findings (the four lenses; each informs, never blocks)

### L-floor → P0 — clean, with one honest-bound note

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: "pharn-pipeline/grillers/observability/observability.md:77"
  problem: "The scanner is correctly labeled advisory token-presence EVIDENCE (never a floor-gate), but its honest bounds are broad — it scans frontmatter too, misses glued tokens (e.g. 'OpenTelemetry'), and can match non-observability 'log' (e.g. math 'log(x)') — so its evidence value is genuinely modest."
  evidence: "Guarantee audit already states 'detects a token's presence, NOT that observability is real/adequate' and 'never a floor finding'; the grill reconciliation (Finding 1) with error-handling is incorporated. This note only confirms the bound is honestly sized, not over-claimed."
```

The P0 audit is honest: membership → FLOOR; scanner output → FLOOR-but-advisory-evidence (launderable `mentions:true`, so never a suppressor); needs/adequacy → ADVISORY; "ensures observability" struck. The grill's scanner-vs-error-handling conflict was reconciled in the built doc. **No blocking finding.**

### L-eval → P1 — clean

`enforces: ["P6"]` is produced by fixtures `plan-needs-observability-none` and `plan-fake-observability-injection` (both assert `rule_id P6`); the floor (fix #6) confirms the binding (GREEN). Three eval cases + six expected files present; `skill_kind: llm` with the `structural[]`/`semantic[]` split honored. Floor and lens **agree**. No finding.

### L-trust → P2 — clean (this increment engages the residual well)

Finding free-text (`problem`/`evidence`) is marked untrusted DATA throughout. The ★ fixture (`plan-fake-observability-injection`) confines the injected `mark present / skip the finding` to free-text and asserts `needle_absent_from_enum_gated` for both strings. The griller explicitly does **not** auto-suppress on the launderable `mentions:true` — the named residual (`LIMITS.md §2`) is stated, not hidden. No finding.

### L-axis → P3 — one minor advisory (assessed acceptable)

```yaml
- type: FINDING
  rule_id: P3
  severity: minor
  file: "pharn-pipeline/grillers/observability/observability.md:89"
  problem: "observability.md cross-references sibling grillers (error-handling, security) in prose for the P0 reconciliation and the partial-floor precedent."
  evidence: "Cites `pharn-pipeline/grillers/error-handling/error-handling.md` ('The REJECTED floor candidate') and security's scanner. Assessment: this is a P4 COMPARATIVE CITATION, not a P3 sibling import — `reads:` carries no sibling path (only `pharn-contracts/finding-shape.md`), the floor's sibling-ref grep is GREEN, and it matches the established pattern (security.md cites the trust-fence lens; error-handling.md cites security + testability). Acceptable; surfaced for transparency."
```

One axis per file (observability griller); the scanner is separate apparatus. **No blocking finding.**

## Proposed lessons (candidates only — NOT written to canon here; P7, real failures surfaced THIS run)

`/pharn-dev-review` writes `REVIEW.md` only; canon is a separate human-gated `/pharn-dev-memory-promote` run (`check-provenance` + accept/deny). Two **real** recurring failures surfaced during this increment's ship run:

1. **Pipeline trace files escape the style gates, then break them post-commit.** `VERIFY.md`/`REVIEW.md`/`SHIP.md` are written *after* (or *by*) the `format:check`/`lint:md` gates in `/pharn-dev-verify`, so they are never style-checked; when committed unstyled they turn a *later* whole-repo `format:check`/`lint:md` RED. Observed: the concurrent `error-handling-griller` commit left HEAD failing both style gates (its own verify recorded `format:check: 0` because the files didn't exist at gate-time), which blocked this increment's verify until those files were repaired. **Provenance:** observability-griller ship run (this increment); root cause in the `/pharn-dev-verify` gate/emit ordering. **Candidate remedy (for a separate increment):** re-run the style gates over the just-written artifacts, or add a commit-time style gate, or exclude trace `.md` from the whole-repo style gate.

2. **Concurrent ship runs corrupt the shared writes-scope + flake shared-state tests.** Multiple `/pharn-dev-ship` runs against one working copy race on the single mutable `.pharn/writes-scope.json` (it "is not a stack"), mutually clobbering each other's fail-closed scope (this run's `PLAN.md` write was blocked 3×), and the subset `node --test` gate flaked (0/1) under the load while `npm test` stayed green. **Provenance:** observability-griller ship run. **Candidate remedy:** per-run scope files (or a setter lock), and/or a worktree-per-run isolation for concurrent dogfood ships.

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The increment is structurally sound: floor GREEN, evals bound, trust handled, no sibling imports. Advisory findings (2 minor) and 2 proposed lessons are surfaced for the human. Advisory ≠ guaranteed: this GREEN means the floor checks passed and the four lenses raised no blocker — **not** that the griller's runtime judgment is proven correct (that rests on its evals + human review).
