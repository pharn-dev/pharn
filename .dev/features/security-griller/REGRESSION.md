# REGRESSION — security-griller

**Base:** `0c4d4d7` (working-tree dogfood: `git status --porcelain` non-empty → `base = HEAD`, the
pre-build commit — the repo _without_ the security griller). **Verdict source:**
`.dev/floor/check-regress.mjs verdict` (deterministic exit-code comparison — zero LLM-judge).

## Inside / outside partition (deterministic — `check-regress.mjs scope`, `escaped: []`)

- **Inside (the feature's changed scope, 12 files):** `.dev/floor/scan-plan-secrets.mjs` (+ its
  `.test.mjs`) and `pharn-pipeline/grillers/security/**` (the griller + 3 cases + 6 expected). Every
  changed file matched the plan's declared `## Files` (fix #7 cross-check clean — **no escape**). The
  `.dev/features/security-griller/` trace (PLAN/GRILL/this report) is stage-audit, not the feature, so
  it is not in the changed scope.
- **Outside (re-checked at base and HEAD):** the 15 tracked deterministic test files, the whole-repo
  `validate`, and the one committed eval pair `structural:trust-fence`
  (`pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`).
- **Style gates (`lint` / `format:check` / `lint:md`) — SKIPPED (deterministic, P5/P7):** the inside set
  touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`,
  `.markdownlint-cli2.jsonc`), so an outside style result cannot flip; the gate is provably unnecessary
  and absent from both maps. (The increment is nonetheless clean under prettier/eslint/markdownlint.)

## Per-gate `base → head` exit codes

| gate                     | base (`0c4d4d7`) | head (working tree) | result |
| ------------------------ | ---------------- | ------------------- | ------ |
| `tests` (15 files)       | 0                | 0                   | OK     |
| `validate` (whole-repo)  | 0                | 0                   | OK     |
| `structural:trust-fence` | 0                | 0                   | OK     |

- `regressions[]`: **none**
- `pre_existing[]`: **none**

> **Note on the run (honesty).** The baseline `tests` gate was first mis-measured as `1` due to a zsh
> word-splitting quirk (an unquoted list variable is not word-split in zsh, so the file list reached
> `node --test` as a single bogus argument). Corrected with `${=...}` splitting; the 15 tests pass at
> both base and HEAD. The recorded verdict is over the corrected, consistent gate set.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** `validate` stays
GREEN (3 → 4 capabilities), the 15 deterministic tests stay green (the new scanner adds 9 more, all
green, but those are _inside_ the feature), and the trust-fence structural gate is unmoved.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches **exactly what its suite catches — nothing more.**
A regression no deterministic check covers (a broken behavior with no test / rule / eval) is invisible
here. This is "deterministically-detectable breakage outside the feature is caught," **not** "nothing
broke." The verdict is the `check-regress.mjs` comparison; this render gates nothing.
