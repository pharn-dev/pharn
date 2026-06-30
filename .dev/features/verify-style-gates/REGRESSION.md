# REGRESSION — verify-style-gates (`/pharn-dev-regress` of the verify gate-map increment)

- **Base:** `931e20c` (working-tree dogfood ⇒ `base = HEAD`, the deterministic rule — `git status --porcelain` is non-empty).
- **Inside (the build's changed scope):** `.claude/commands/pharn-dev-verify.md` — **==** the plan's `## Files` (`scope` partition `escaped: []`, **no fix #7 breach**, exit 0). The feature's own audit artifacts (`.dev/features/verify-style-gates/{PLAN,GRILL}.md`) are pipeline scaffolding (plan/grill stages), excluded from the build-scope-breach check (per the established precedent).
- **Outside gates run** (same set at base and head): `tests` (15 `.dev/floor/*` + `.claude/hooks/*` + the stale root `floor/check-ship.test.mjs` suites — nothing changed this increment, so all 15 are outside), `validate` (whole-repo), `structural:trust-fence`. **Style gates skipped** deterministically — `inside` is a floor-ignored command `.md`, touching no shared style config.

## Per-gate exit codes (base → head)

| gate                     | base | head | result                     |
| ------------------------ | ---- | ---- | -------------------------- |
| `tests`                  | 1    | 1    | **pre_existing** (no flip) |
| `validate`               | 0    | 0    | clean                      |
| `structural:trust-fence` | 0    | 0    | clean                      |

- **`regressions[]`: none.** No gate flipped pass→fail.
- **`pre_existing[]`: `tests`.** RED at **both** base and head → not a regression (the documented partial-`node --test` concurrency flake; canonical `npm test` is green — 165 this run). The one changed file is a floor-ignored command (`pharn-dev-verify.md`), test-irrelevant, so it cannot affect any outside `tests` result.

## Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the deterministic exit-code comparison; the `tests` RED is `pre_existing` (base==head), correctly excluded from `regressions[]`.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. "No regressions" means no deterministically-detectable breakage outside the feature flipped pass→fail, _not_ "nothing broke" and _not_ a judgment that the `/pharn-dev-verify` gate-map change is correct (that is `/pharn-dev-verify` + human review). The orchestration is advisory; only the exit-code **comparison** is the guarantee.
