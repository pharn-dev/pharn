# REGRESSION — ship-gated

**Question:** did building `.claude/commands/ship.md` break anything **OUTSIDE** the feature?
**Verdict (FLOOR — `floor/check-regress.mjs verdict`, exit 0):** **`no-regressions`** — no
deterministically-detectable breakage outside the feature.

> The verdict is the **only** floor-grade thing here: a deterministic exit-code comparison
> (`ARCHITECTURE.md §2` primitive #3). Everything I did to get there — base detection, the
> inside/outside partition, running the suite — is **advisory orchestration** (the two-clocks split).

## Base + partition (live, P6)

- **Base:** `8063643` (dirty-tree dogfood: `git status --porcelain` non-empty → `base = HEAD`). The
  `/plan` artifact `features/ship-gated/PLAN.md` was **committed** at this base, and the `/build`
  output `.claude/commands/ship.md` left **uncommitted** as the feature under test — so the partition
  resolves to `inside = {ship.md}` and the `/plan` artifact never enters `inside` (avoids the false
  fix#7 escape, `pipeline-integration-probe` CF-1).
- **Inside (changed scope):** `.claude/commands/ship.md` — exactly the plan's `## Files` `declared`
  writes. `check-regress.mjs scope` → `escaped: []` (no scope breach).
- **Outside gates (run identically at base and head):** the 9 committed `*.test.*`, `validate`
  (whole-repo), and the one committed eval pair
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json ↔ features/trust-fence/findings.json`.
- **Style gates (`lint` / `format:check` / `lint:md`): SKIPPED** (deterministic, P5/P7) — `inside`
  touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`,
  `.markdownlint-cli2.jsonc`), so an outside style result is provably unable to flip; no `npm ci`
  incurred.

## Per-gate comparison (base → head exit codes)

| gate                                                       | base | head | result |
| ---------------------------------------------------------- | ---- | ---- | ------ |
| `tests` (9 outside `*.test.*`)                             | 0    | 0    | OK     |
| `validate` (`floor/validate.mjs .`)                        | 0    | 0    | OK     |
| `structural:expected-injection-comment.json` (trust-fence) | 0    | 0    | OK     |

- **`regressions`:** none.
- **`pre_existing`:** none (no gate was already red at baseline).

## Why a clean verdict is expected here (not a coincidence)

`.claude/commands/ship.md` is **floor-ignored markdown** (`floor/validate.mjs` `EXCLUDE_SEGMENTS`
path-ignores `.claude/commands/`), adds **no** test or eval, and touches **no** shared config. So no
outside gate can read it, and a base↔head flip is structurally impossible. The clean verdict therefore
confirms the **chain + partition** ran correctly more than it stresses the comparison — exactly what a
command-only increment should yield.

## Honest residual (P0/P7)

`/regress` catches **exactly what its suite catches — nothing more.** A regression no deterministic
check covers (a broken behavior with no test / rule / eval) is **invisible** here. This certifies the
**comparison** — "deterministically-detectable breakage outside the feature is caught" — **not** that
the increment is whole or correct. This is **not** "regress passed" as a feature certification; the
feature's own correctness is `/verify`'s (floor) + `/review`'s (advisory) concern.

**Next:** `/verify features/ship-gated/PLAN.md` (floor gates own the verdict), then `/review`. The
verdict's exit code (`0`) decides this stage; `/regress` does not invoke `/verify`.
