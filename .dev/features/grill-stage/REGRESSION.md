# REGRESSION — grill-stage

- **Base:** `21583b0` (HEAD — a working-tree dogfood build; `git status --porcelain` non-empty, so `base = HEAD` per the deterministic auto-detect, P5).
- **Inside (the changed scope = the build's declared `## Files`):**
  - `.claude/commands/pharn-grill.md`
  - `.dev/floor/check-plan-spec-agree.mjs`
  - `.dev/floor/check-plan-spec-agree.test.mjs`
- **Scope partition (`check-regress.mjs scope`):** `escaped: []` — every changed file is covered by the plan's declared writes (no fix #7 escape).
- **Style gates:** skipped — `inside` touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.markdownlint-cli2.jsonc`), so a style flip over the byte-identical outside files is provably impossible (deterministic skip, P5/P7). Absent from both maps.

## Outside-gate comparison (base → head exit codes)

| gate                                                                 | base | head | result |
| -------------------------------------------------------------------- | ---- | ---- | ------ |
| `tests` (14 outside test files, `node --test`)                       | 0    | 0    | OK     |
| `validate` (`node .dev/floor/validate.mjs .`)                        | 0    | 0    | OK     |
| `structural:expected-injection-comment.json` (trust-fence eval pair) | 0    | 0    | OK     |

- **regressions[]:** none
- **pre_existing[]:** none

## Verdict (deterministic — `check-regress.mjs verdict`, exit 0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.**

The changes are purely additive (a new command in `.claude/commands/` and a new checker + test in `.dev/floor/`, both floor-ignored dirs); no tracked outside file was modified, and no outside gate flipped pass→fail.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its suite catches — nothing more. A broken behavior with no test / rule / eval covering it is invisible to this comparison. This verdict certifies **the comparison** (no outside gate regressed), **not** that the increment is whole or correct — that is `/pharn-dev-verify`'s and the human's call.
