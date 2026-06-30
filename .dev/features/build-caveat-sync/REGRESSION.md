# REGRESSION — build-caveat-sync (`/pharn-dev-regress` of the caveat doc-sync)

- **Base:** `122b8ed` (working-tree dogfood ⇒ `base = HEAD`, the deterministic rule — `git status --porcelain` is non-empty).
- **Inside (the build's changed scope):** `.claude/commands/pharn-build.md` — **==** the plan's `## Files` (`scope` partition `escaped: []`, **no fix #7 breach**, exit 0). The feature's own audit artifacts (`.dev/features/build-caveat-sync/{PLAN,GRILL}.md`) are pipeline scaffolding, excluded from the build-scope-breach check (per precedent).
- **Outside gates run** (same set at base and head): `tests` (15 suites), `validate` (whole-repo), `structural:trust-fence`. **Style gates skipped** — `inside` is a floor-ignored command `.md`, touching no shared style config.

## Per-gate exit codes (base → head)

| gate                     | base | head | result                     |
| ------------------------ | ---- | ---- | -------------------------- |
| `tests`                  | 1    | 1    | **pre_existing** (no flip) |
| `validate`               | 0    | 0    | clean                      |
| `structural:trust-fence` | 0    | 0    | clean                      |

- **`regressions[]`: none.** No gate flipped pass→fail.
- **`pre_existing[]`: `tests`.** RED at **both** base and head → not a regression (the documented partial-`node --test` flake; canonical `npm test` is green — 165 this run). The one changed file is a floor-ignored command (`pharn-build.md`), prose-only and test-irrelevant.

## Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** A pure prose doc-sync of a floor-ignored command cannot affect any outside gate; the `tests` RED is `pre_existing` (base==head), correctly excluded.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. "No regressions" is _not_ "nothing broke" and _not_ a judgment that the caveat rewrite is correct (that is `/pharn-dev-verify` + human review). The orchestration is advisory; only the exit-code **comparison** is the guarantee.
