# REGRESSION — migrations-griller

**Base:** `f811151` (working-tree dogfood build → `base = HEAD`, per the deterministic auto-detect: `git status --porcelain` non-empty). **Verdict source:** `.dev/floor/check-regress.mjs verdict` (floor; exit-code comparison, zero LLM-judge).

## Inside / outside partition (deterministic, `check-regress.mjs scope`)

- **Inside (the 15 build outputs = the PLAN's `## Files`):** `pharn-pipeline/grillers/migrations/**` (griller + 4 evals) and `.dev/floor/scan-plan-migrations.{mjs,test.mjs}`. `escaped: []` — the build wrote nothing outside its declared scope (fix #7 clean). The increment is **purely additive** (`git diff --name-only HEAD` is empty — no tracked file modified). The pipeline trace artifacts under `.dev/features/migrations-griller/` are stage bookkeeping (plan/grill/regress), not build outputs, and are excluded from `--changed`.
- **Outside gates run:** `tests` (the 18 committed test files, all outside the feature), `validate` (whole-repo — a named granularity limit), and `structural:expected-injection-comment` (the one committed eval pair, trust-fence, outside the feature). **Style gates skipped** deterministically — `inside` touches no shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` / `.markdownlint-cli2.jsonc`), so a style flip over byte-identical outside files is provably impossible; no `npm ci` incurred.

## Per-gate exit codes (base → head)

| gate                                  | base | head | result |
| ------------------------------------- | ---- | ---- | ------ |
| tests (18 outside test files)         | 0    | 0    | OK     |
| validate (whole-repo)                 | 0    | 0    | OK     |
| structural:expected-injection-comment | 0    | 0    | OK     |

- `regressions[]`: **none**
- `pre_existing[]`: **none**

## Methodology note (reproducibility)

The `tests` gate runs `node --test` over the 18 outside test files passed as **separate arguments** (a zsh array). An earlier attempt passed them as one unquoted variable; zsh does not word-split unquoted expansions, so `node --test` received a single bogus path and errored (exit 1) **identically at base and head** — which the verdict would have (correctly) classified PRE-EXISTING, but it tested nothing. The corrected run (array-splat) genuinely executes all 18 files, which pass at both ends.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature (`check-regress.mjs` exit 0, `verdict: "no-regressions"`).**

Honest residual (P0/P7): `/pharn-dev-regress` catches **exactly what its suite catches — nothing more**. A regression no deterministic check covers (a broken behavior with no test / rule / eval) is invisible here. This certifies the **comparison**, not that "nothing broke" and not that the increment is good — that is the human's call at the post-review gate.
