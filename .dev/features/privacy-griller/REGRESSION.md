# REGRESSION — privacy-griller

- **Base:** `cfa9798` (working-tree dogfood build → base = HEAD, per the deterministic base rule).
- **Verdict (FLOOR — `.dev/floor/check-regress.mjs verdict`, exit 0):** `no-regressions`.

## Inside / outside partition (deterministic — `check-regress.mjs scope`, exit 0, `escaped: []`)

**Inside (the feature's build outputs, 12 files — checked ⊆ declared `## Files`, no escape):** the privacy
griller + its 3 eval cases + 6 expected files, and the apparatus `.dev/floor/scan-plan-pii.mjs` +
`.dev/floor/scan-plan-pii.test.mjs`. (The pipeline trace artifacts — `PLAN.md`, `GRILL.md`, this report —
are pipeline bookkeeping, not build outputs, so they are correctly not in the scope-breach set, mirroring
`.dev/features/security-griller/regression-report.json`.)

**Outside gates run (identical set at base and head):** the 17 pre-existing tracked test files
(`tests`), whole-repo `validate`, and the one committed eval pair
`structural:trust-fence` (`pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
`.dev/features/trust-fence/findings.json`). The feature's own `scan-plan-pii.test.mjs` is **inside**, so
it is correctly not an outside gate.

## Per-gate result (base → head exit code)

| gate                     | base | head | result |
| ------------------------ | ---- | ---- | ------ |
| `tests`                  | 0    | 0    | OK     |
| `validate`               | 0    | 0    | OK     |
| `structural:trust-fence` | 0    | 0    | OK     |

- **`regressions[]`:** none.
- **`pre_existing[]`:** none (no outside gate was red at baseline).

## Style gates — deterministically SKIPPED (P5/P7)

`lint` / `format:check` / `lint:md` were **skipped**: the inside set touches no shared style config
(`eslint.config.mjs`, `.prettierrc*`, `.markdownlint-cli2.jsonc`), so over the byte-identical outside
files a style result **cannot** flip — the skip is provably safe, not a coverage gap.

> Note (context, not a regress input): 4 committed `.dev/features/observability-griller/*.md` files fail
> `prettier format:check` in the repo today. That gate was **not** run here (skip rule above) and, had it
> run, it would be **fail→fail** (those files are byte-identical at base and head) — i.e. **pre-existing,
> never attributable to this feature**. It is surfaced for the human, separate from this increment.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.**

Honest residual (P0/P7): `/pharn-dev-regress` catches **exactly what its suite catches — nothing more.** A
regression no deterministic check covers is invisible here. This certifies the **comparison** (base↔head
exit codes), not that the feature is whole.
