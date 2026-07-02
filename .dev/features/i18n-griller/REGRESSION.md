# REGRESSION — i18n-griller (deterministic verdict)

- **Base:** `HEAD` (`cd4547f`) — auto-detected: the working tree is dirty (a dogfood build), so the
  pre-build baseline is the last commit.
- **Verdict (floor, `.dev/floor/check-regress.mjs verdict`):** `no-regressions` (exit 0). Zero gates
  flipped pass→fail outside the feature.

## Inside / outside partition (deterministic, `check-regress.mjs scope` — exit 0, no fix #7 escape)

- **Inside (this feature's footprint):** the 12 build files the plan's `## Files` authorized
  (`pharn-pipeline/grillers/i18n/**` + `.dev/floor/scan-plan-i18n.mjs` + its test) **plus** the pipeline
  trace files (`.dev/features/i18n-griller/PLAN.md`, `GRILL.md`). `scope` confirmed `escaped: []` — nothing
  was written outside the declared footprint (the build's own fix #7 scope already enforced this at write time).
- **Outside gates run:** `tests` (19 tracked test files, my new `scan-plan-i18n.test.mjs` correctly excluded
  as inside), `validate` (whole-repo — a named granularity limit), and `structural:trust-fence` (the one
  committed eval pair: `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`).
- **Style gates (`lint` / `format:check` / `lint:md`) skipped** — deterministically, because `inside` touches
  no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`,
  `.markdownlint-cli2.jsonc`); over byte-identical outside files a style result cannot flip. (They were run
  separately during the build and are green, but they are not regression gates for this change.)

## Per-gate `base → head` exit codes

| gate                     | base (HEAD) | head (worktree) | result |
| ------------------------ | ----------- | --------------- | ------ |
| `tests`                  | 0           | 0               | OK     |
| `validate`               | 0           | 0               | OK     |
| `structural:trust-fence` | 0           | 0               | OK     |

- **regressions[]:** none.
- **pre_existing[]:** none.

## Note on the `tests` gate capture (honesty)

The first capture attempt reported `tests: 1` at both base and head — this was a **shell word-splitting
artifact** (an unquoted list was passed to `node --test` as a single filename → "Could not find"), **not** a
real failure, and it was symmetric so it never affected the verdict. It was corrected by running each outside
test file individually; the honest result is `0 → 0`. The real aggregate gate `npm test` passes 218/218 at
HEAD.

## The verdict, stated plainly (P0)

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.**

Honest residual (`check-regress.mjs`, P0/P7): `/pharn-dev-regress` catches **exactly what its suite catches —
nothing more.** A regression no deterministic check covers (a broken behavior with no test / rule / eval) is
invisible here. This verdict certifies **the comparison of two exit-code maps**, not that "nothing broke" and
not that the increment is good — that is the human's call at the post-review gate.
