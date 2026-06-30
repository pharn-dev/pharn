# REGRESSION — plan-files-scope (`/pharn-dev-regress` of the `/pharn-plan` `## Files` increment)

- **Base:** `5a4eaed` (working-tree dogfood ⇒ `base = HEAD`, the deterministic rule — `git status --porcelain` is non-empty).
- **Inside (the build's changed scope):** `.claude/commands/pharn-plan.md`, `.claude/hooks/set-writes-scope.test.cjs` — **==** the plan's `## Files` (`scope` partition `escaped: []`, **no fix #7 breach**, exit 0). The feature's own audit artifacts (`.dev/features/plan-files-scope/{PLAN,GRILL}.md`) are pipeline scaffolding written by the plan/grill stages, not build outputs, so they are excluded from the build-scope-breach check (mirrors the build-stage precedent).
- **Outside gates run** (the same set at base and head): `tests` (14 `.dev/floor/*` + `.claude/hooks/*` + the stale root `floor/check-ship.test.mjs` suites — the inside `set-writes-scope.test.cjs` is excluded), `validate` (whole-repo, a named granularity limit), `structural:trust-fence` (the one committed eval pair). **Style gates skipped** deterministically — `inside` touches no shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` / `.markdownlint-cli2.jsonc`).

## Per-gate exit codes (base → head)

| gate                     | base | head | result                     |
| ------------------------ | ---- | ---- | -------------------------- |
| `tests`                  | 1    | 1    | **pre_existing** (no flip) |
| `validate`               | 0    | 0    | clean                      |
| `structural:trust-fence` | 0    | 0    | clean                      |

- **`regressions[]`: none.** No gate flipped pass→fail.
- **`pre_existing[]`: `tests`.** RED at **both** base and head → by definition **not** a regression (a regression is a pass→fail flip; this was already RED at the base commit `5a4eaed`, which predates this increment).

## The `tests` pre-existing RED — characterized (honest, not hidden)

The `tests` gate exits **1 at both base and head**, identical to the build-stage regress. This is the **pre-existing partial-`node --test` concurrency flake** in the floor infra (documented in `.dev/features/build-stage/REGRESSION.md`), **not** a real test failure and **not** caused by this increment:

- The **canonical `npm test` gate passes — exit 0, 165 tests** (verified live this run, after the build: 163 baseline + 2 new). The flake only fires when `node --test` is handed a **partial** file set (parallel-scheduling dependent), and includes the **stale committed root `floor/check-ship.test.mjs`** duplicate left by the `.dev/` split.
- Identical `tests:1` reproduced at the **base commit `5a4eaed`** (pre-dating every change here) → a pass→fail flip is impossible; it was already RED.
- This increment touched only a floor-ignored command (`pharn-plan.md`) and **one _inside_ test (`set-writes-scope.test.cjs`)** — both excluded from the outside gate set, so neither can affect any outside `tests` result.

**Advisory finding (for the human; NOT blocking, NOT this increment's scope):** the pre-existing partial-`node --test` flake and the stale root `floor/` duplicate persist — recommend the same cleanup follow-up the build-stage already noted (remove the stale root `floor/`, isolate the git/worktree-touching suites). The canonical `npm test` is green (165).

## Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the deterministic exit-code comparison (zero LLM judgment in its core); the `tests` RED is `pre_existing` (base==head), correctly excluded from `regressions[]`.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the `/pharn-plan` template change is correct (that is `/pharn-dev-verify` + human review). The orchestration (base resolution, inside/outside partition, the stale-duplicate exclusion) is advisory; only the exit-code **comparison** is the guarantee.
