# REGRESSION — pharn-spec

Did building `pharn-spec` break anything **outside** the feature? Pure state comparison: the same
outside-scoped deterministic gates run at the pre-build baseline and at HEAD; a gate that flipped
`pass → fail` is a regression. The verdict is owned by `.dev/floor/check-regress.mjs` (exit-code
comparison) — not by model judgment (P0).

## Base + partition

- **base:** `8155e699e2587605a991d7c400b7065588b7f990` (HEAD — working-tree dogfood build; `git status`
  dirty, changes purely additive, no tracked file modified).
- **inside (the build's outputs, `= PLAN.md` `## Files`):**
  - `.claude/commands/pharn-spec.md`
  - `.dev/floor/check-spec.mjs`
  - `.dev/floor/check-spec.test.mjs`
- **scope check (fix #7):** `inside ⊆ declared writes` — `escaped: []`, no build escape. (The feature's
  own process dir `.dev/features/pharn-spec/` — `PLAN.md` and these reports — is audit-trail, not a build
  output, so it is correctly not part of `inside`.)
- **outside tests (11):** the tracked `*.test.{mjs,cjs}` suites (the untracked `check-spec.test.mjs` is
  _inside_, so it is excluded from the outside set).
- **outside eval pair:** `pharn-review/trust-fence/evals/expected/expected-injection-comment.json ↔ .dev/features/trust-fence/findings.json`.
- **style gates (`lint` / `format:check` / `lint:md`):** **skipped** — `inside` touches no shared style
  config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.markdownlint-cli2.jsonc`), so an
  outside style result is provably unable to flip (P5/P7 deterministic skip).

## Per-gate comparison (exit codes)

| gate                                                       | base | head | result |
| ---------------------------------------------------------- | ---- | ---- | ------ |
| `tests` (11 outside suites)                                | 0    | 0    | OK     |
| `validate` (whole-repo)                                    | 0    | 0    | OK     |
| `structural:expected-injection-comment.json` (trust-fence) | 0    | 0    | OK     |

- **regressions:** none
- **pre_existing:** none

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** (`check-regress.mjs
verdict` exit 0; `verdict: "no-regressions"` in `regression-report.json`.)

_Honest residual (P0/P7):_ `/pharn-dev-regress` catches **exactly what its suite catches — nothing more.**
This certifies only the **comparison** — that no covered outside gate flipped `pass → fail`. It is **not**
a certification that the feature is whole or that nothing broke; a regression no deterministic check covers
is invisible here. The feature's own correctness is `/pharn-dev-verify` + `/pharn-dev-review`'s job, not
this stage's.
