# REGRESSION — build-stage (`/pharn-dev-regress` of the `/pharn-build` increment)

- **Base:** `61b79df` (working-tree dogfood ⇒ `base = HEAD`, the deterministic rule — `git status` is non-empty).
- **Inside (the build's changed scope):** `.claude/commands/pharn-build.md`, `.claude/hooks/set-writes-scope.test.cjs` — **==** the plan's `## Files` (`scope` partition `escaped: []`, **no fix #7 breach**). The feature's own audit artifacts (`.dev/features/build-stage/{PLAN,GRILL}.md`) are pipeline scaffolding written by the plan/grill stages, not build user-code outputs, so they are excluded from the build-scope-breach check.
- **Outside gates run** (the same set at base and head): `tests` (13 real `.dev/floor/*` + `.claude/hooks/*` suites), `validate` (whole-repo, a named granularity limit), `structural:trust-fence` (the one committed eval pair). **Style gates skipped** deterministically — `inside` touches no shared style config.

## Per-gate exit codes (base → head)

| gate                     | base | head | result                     |
| ------------------------ | ---- | ---- | -------------------------- |
| `tests`                  | 1    | 1    | **pre_existing** (no flip) |
| `validate`               | 0    | 0    | clean                      |
| `structural:trust-fence` | 0    | 0    | clean                      |

- **`regressions[]`: none.** No gate flipped pass→fail.
- **`pre_existing[]`: `tests`.** RED at **both** base and head → by definition **not** a regression (a regression is a pass→fail flip; this was already RED at the base commit, which predates this increment).

## The `tests` pre-existing RED — characterized (honest, not hidden)

The `tests` gate exits **1 at both base and head**, yet **every individual subtest passes** ("all pass"). This is a **pre-existing concurrency flake in the test infrastructure**, not a real test failure and **not** caused by this increment:

- Reproduced at the **base commit `61b79df`** (pre-dating every change in this increment) — identical `tests:1`.
- `node --test` exits 1 only on **certain _partial_ file sets** (parallel-scheduling dependent); the **canonical `npm test` gate passes — exit 0, 163 tests** (verified live this run, both before and after the build).
- Related pre-existing debt: a **stale committed root-level `floor/check-ship.{mjs,test.mjs}`** — an older duplicate of `.dev/floor/check-ship.*` left behind by the `.dev/` split (the contents differ; the real gate is `.dev/floor/*`). It is in the `git ls-files '*.test.mjs'` universe but outside the project's intended floor location.
- This increment added only a floor-ignored command (`pharn-build.md`, test-irrelevant) and **one** _inside_ test (`set-writes-scope.test.cjs`) — neither can affect any outside test gate.

**Advisory finding (for the human; NOT blocking, NOT this increment's scope):** the test suite has a pre-existing concurrency flake under partial `node --test` invocations, and a **stale committed root `floor/` duplicate**. Recommend a cleanup follow-up: remove the stale root `floor/` and isolate the git/worktree-touching suites (`check-regress` / `check-ship`) so partial runs are deterministic. The canonical `npm test` is unaffected (green).

## Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the deterministic exit-code comparison (zero LLM judgment in its core); the `tests` RED is `pre_existing` (base==head), correctly excluded from `regressions[]`.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the `/pharn-build` command is correct (that is `/pharn-dev-verify` + human review). The orchestration (base resolution, inside/outside partition, the stale-duplicate exclusion) is advisory; only the exit-code **comparison** is the guarantee.
