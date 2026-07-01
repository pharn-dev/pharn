# REGRESSION — regress-stage (`/pharn-dev-regress` of the `/pharn-regress` increment)

- **Base:** `08881026` (working-tree dogfood ⇒ `base = HEAD`, the deterministic rule — `git status --porcelain` is non-empty).
- **Inside (the build's changed scope):** `.claude/commands/pharn-regress.md` — **==** the plan's `## Files` (`scope` partition `escaped: []`, **no fix #7 breach**). The feature's own audit artifacts (`.dev/features/regress-stage/{PLAN,GRILL}.md` + these regression outputs) are pipeline scaffolding written by the plan/grill/regress stages, not build user-code outputs, so they are excluded from the changed set (same handling as the build-stage/grill-stage regress runs).
- **Outside gates run** (the same set at base and head): `tests` (15 real `.dev/floor/*` + `.claude/hooks/*` suites), `validate` (whole-repo, a named granularity limit), `structural:trust-fence` (the one committed eval pair: `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔ `.dev/features/trust-fence/findings.json`). **Style gates skipped** deterministically — `inside` touches no shared style config.

## Per-gate exit codes (base → head)

| gate                     | base | head | result                     |
| ------------------------ | ---- | ---- | -------------------------- |
| `tests`                  | 1    | 1    | **pre_existing** (no flip) |
| `validate`               | 0    | 0    | clean                      |
| `structural:trust-fence` | 0    | 0    | clean                      |

- **`regressions[]`: none.** No gate flipped pass→fail.
- **`pre_existing[]`: `tests`.** RED at **both** base and head → by definition **not** a regression (a regression is a pass→fail flip; this was already RED at the base commit, which predates this increment).

## The `tests` pre-existing RED — characterized (honest, not hidden)

The `tests` gate exits **1 at both base and head**, but this is the **already-characterized pre-existing flake**, not a real failure and **not** caused by this increment (an increment that adds only a floor-ignored command — `.claude/commands/pharn-regress.md` — plus audit scaffolding, and touches **no** outside test):

- Reproduced at the **base commit `08881026`** (which predates this increment) — identical `tests:1`.
- The **canonical `npm test` gate passes — exit 0, 163 tests** (verified live this run). `node --test` over the partial 15-file set exits 1 due to a parallel-scheduling concurrency flake + a **stale committed root-level `floor/check-ship.{mjs,test.mjs}`** duplicate (an older copy left by the `.dev/` split; the real gate is `.dev/floor/*`). Both were documented in `.dev/features/build-stage/REGRESSION.md`.
- Because it is RED at base **and** head, `check-regress.mjs verdict` correctly classifies it `pre_existing`, excluded from `regressions[]`.

**Advisory (for the human; NOT blocking, NOT this increment's scope):** the pre-existing `node --test` partial-set flake and the stale root `floor/` duplicate remain open cleanup follow-ups (as noted since build-stage). The canonical `npm test` is unaffected (green).

## Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the deterministic exit-code comparison (zero LLM judgment in its core); the `tests` RED is `pre_existing` (base==head), correctly excluded from `regressions[]`.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the `/pharn-regress` command is correct (that is `/pharn-dev-verify` + human review). The orchestration (base resolution, inside/outside partition, the scaffolding exclusion) is advisory; only the exit-code **comparison** is the guarantee.
