# REGRESSION — performance-griller

- **Base:** `HEAD` (working-tree dogfood build — `git status --porcelain` non-empty, so base auto-resolved
  to `HEAD` per the deterministic selector, P5). Baseline captured in a detached `git worktree` at HEAD
  (my untracked additions excluded).
- **Verdict (deterministic — `.dev/floor/check-regress.mjs`, exit 0):** `no-regressions`.

## Inside / outside partition (fix #7 cross-check)

- **Inside (the changed scope):** the 7 product files under `pharn-pipeline/grillers/performance/` plus the
  feature's own trace artifacts (`.dev/features/performance-griller/PLAN.md`, `GRILL.md`). `scope` exit 0,
  **`escaped: []`** — the build wrote nothing outside its plan's `## Files` (declared writes covered by the
  7 product paths + the `.dev/features/performance-griller/**` trace glob).
- **Outside (gates re-run at base and head):** 18 test files (`.dev/floor/*.test.mjs`,
  `.claude/hooks/*.test.cjs`), whole-repo `validate`, and the one committed eval pair
  `structural:trust-fence`.
- **Style gates (`lint` / `format:check` / `lint:md`) skipped** — the deterministic config-touch rule:
  `inside` touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`,
  `.markdownlint-cli2.jsonc`), so a style flip over the byte-identical outside files is provably
  impossible.

## Per-gate exit codes (base → head)

| gate                   | base | head | flip? |
| ---------------------- | ---- | ---- | ----- |
| tests (18 files)       | 0    | 0    | no    |
| validate (whole-repo)  | 0    | 0    | no    |
| structural:trust-fence | 0    | 0    | no    |

- **regressions[]:** none.
- **pre_existing[]:** none.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The stage does not
FAIL; the ship chain proceeds to `/pharn-dev-verify`.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches **exactly what its deterministic suite catches —
nothing more.** A regression no test / rule / eval covers is invisible here. This report certifies the
**comparison** (was-GREEN → still-GREEN outside the feature), **not** that "nothing broke" and **not** that
the increment is good — that is the human's call at the post-review gate.
