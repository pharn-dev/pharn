# REGRESSION — plan-stage (`/pharn-plan`)

**Question answered:** did building `/pharn-plan` break anything **outside** the feature? The verdict
below is **floor-grade** — `.dev/floor/check-regress.mjs verdict` comparing two exit-code maps, never my
judgment. The orchestration (base resolution, scoping, running the suite) is advisory.

- **Base (pre-build):** `0ff3b6c` (branch `plan-stage`; `git status --porcelain` non-empty → `base = HEAD`).
- **Inside (the feature's changed scope, ⊆ the build's declared `## Files`):**
  - `.claude/commands/pharn-plan.md`
  - `.dev/floor/check-spec-approved.mjs`
  - `.dev/floor/check-spec-approved.test.mjs`
  - _(The `.dev/features/plan-stage/` audit artifacts — PLAN.md, GRILL.md, this file — are pipeline
    bookkeeping, excluded from the partition, mirroring the prior convention where `inside` is the
    build's declared files only.)_
- **`scope` partition:** `escaped: []` — **no fix#7 breach**; every changed file is within the declared
  writes. Outside gate set derived: **13 test files + `validate` + the trust-fence structural pair**.
  Style gates (`lint` / `format:check` / `lint:md`) **skipped** deterministically — `inside` touches no
  shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` /
  `.markdownlint-cli2.jsonc`), so a style flip over the byte-identical outside files is provably impossible.

## Per-gate exit codes (base `0ff3b6c` → head)

| outside gate                                                         | base | head | result |
| -------------------------------------------------------------------- | ---- | ---- | ------ |
| `tests` (13 committed test files)                                    | 0    | 0    | OK     |
| `validate` (`validate.mjs .`, whole-repo)                            | 0    | 0    | OK     |
| `structural:expected-injection-comment.json` (trust-fence eval pair) | 0    | 0    | OK     |

- **regressions[]:** none
- **pre_existing[]:** none

> **Capture note (honest):** the first `tests` capture mis-reported `1→1` because the env shell is
> **zsh**, where an unquoted list variable does **not** word-split — `node --test` received the 13 paths
> as one bogus filename and "failed" identically on both sides. Re-run with a proper array, the `tests`
> gate genuinely executes and is `0→0`. The bug was symmetric (same on base and head) so it never
> masked a real flip, but it would have given the `tests` gate **zero** coverage — fixed, so the gate
> really runs.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** (`check-regress.mjs
verdict` exit `0`, `"verdict": "no-regressions"`.) Every change in this increment is a **new file**
(the build added three; it modified no existing tracked file except prettier's whitespace reflow of the
already-committed PLAN.md), so no existing outside gate could flip.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches **exactly what its suite catches — nothing
more.** A regression no deterministic check covers (a broken behavior with no test / rule / eval) is
invisible here. This is "deterministically-detectable breakage outside the feature is caught," **not**
"nothing broke." This is **not** a certification that `/pharn-plan` is whole — only that the comparison
is clean.
