# SHIP — ship-stage (`/pharn-ship`, built via the `/pharn-dev-ship` gated loop)

**Increment:** build `/pharn-ship` — the gated PRODUCT pipeline orchestrator (stage 7). This roll-up records
the **`/pharn-dev-ship` build-loop run** that produced it. Advisory record only — it is **not** a self-issued
"shipped" or a `PHARN ✓ reviewed` seal.

## Stages that ran (in order) and where the run ended

| stage                | outcome                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `/pharn-dev-plan`    | PLAN.md written; **GATE 1** — human **approved as written** (+ Q1 resolved) |
| `/pharn-dev-grill`   | GRILL.md written; spec-hash GREEN; 3 advisory concerns (folded into build)  |
| `/pharn-dev-build`   | `.claude/commands/pharn-ship.md` written; floor GREEN                       |
| `/pharn-dev-regress` | regression-report.json written; `no-regressions`                            |
| `/pharn-dev-verify`  | verify-report.json written; `PASS`                                          |
| `/pharn-dev-review`  | REVIEW.md written; GREEN — 0 blocking (**GATE 2**, run ends here)           |

**Run ended at GATE 2** (post-review human decision) — the intended terminal state, not a STOP.

## Structural verdicts read, verbatim (the proceed gates)

- **`/pharn-dev-build`** → `node .dev/floor/validate.mjs .` exit **0** — `FLOOR: GREEN — 1 capabilities` (a
  command is not a Capability; count unchanged).
- **`/pharn-dev-regress`** → `.dev/features/ship-stage/regression-report.json` `.verdict` = **`no-regressions`**
  (`check-regress.mjs verdict`, exit 0; `escaped: []`, base `3dc7849`, all outside gates 0/0).
- **`/pharn-dev-verify`** → `.dev/features/ship-stage/verify-report.json` `.verdict` = **`PASS`**
  (`check-verify.mjs`, exit 0; gates test/validate/lint/format:check/lint:md/structural:trust-fence all 0;
  0 verifiers registered — floor gates only).
- **`/pharn-dev-review`** has **no structural verdict** (prose `REVIEW.md`, LLM-assigned severity is advisory,
  fix #3) — so `/pharn-dev-ship` computes **no** proceed/stop from it; its only floor-grade content is
  `validate.mjs` GREEN, already gated by build + verify. The human reads it at GATE 2.

## Pointers (cited, not restated — P4)

- `.dev/features/ship-stage/REVIEW.md` — 4 advisory lenses (all GREEN); 1 advisory-minor `reads:` nit; a
  proposed lesson candidate (post-write markdown formatting friction) for a gated `/pharn-dev-memory-promote`.
- `.dev/features/ship-stage/GRILL.md` — the 3 advisory concerns (all folded into the command during build).
- `.dev/features/ship-stage/{PLAN,REGRESSION,VERIFY}.md` + the two report JSONs — the stage artifacts.

## Doc reconciliation carried forward (for the human)

The command surfaces (never edits) the `ARCHITECTURE.md §6` name overload: §6 lists **ship** as the terminal
spine stage (artifact `ship-report` = decision + `PHARN ✓ reviewed` seal); the built `/pharn-ship` realizes
that as a meta-orchestrator that brings the human to the ship **decision** at its own GATE 2, deliberately not
automating the seal — the same honest divergence `/pharn-dev-ship` already surfaces. `ARCHITECTURE.md` is
human-only (hook-denied); no agent edit was made or is proposed.

Also surfaced (Discovery finding **D2**, out of scope this increment): the pre-boundary **stale `/ship`
orbit** — `.claude/commands/ship.md` (orchestrates non-existent `/plan … /review`, points at `floor/` /
`features/`), root `features/ship-gated/` + `features/ship-loop/`, and a stale `floor/check-ship.test.mjs` —
flagged for a separate, human-decided cleanup.

## Honest close (P0)

Chain ran; the named floor verdicts are as shown, and the human approved the plan at GATE 1 — this is **NOT** a
judgment that `/pharn-ship` is good or wise; that is the human's call at the post-review gate (merge / fix /
abandon). `/pharn-dev-ship` added **no** new floor primitive: every guarantee in this run belongs to a
sub-stage (`validate` / `check-regress` / `check-verify` / the writes-scope hooks / `/pharn-dev-build`'s
spec-hash re-check).
