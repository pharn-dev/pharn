# SHIP — observability-griller (gated `/pharn-dev-ship` roll-up; advisory)

**Increment:** add the fifth griller — an **observability** griller (`role: griller`, `enforces: P6`) at `pharn-pipeline/grillers/observability/`, with a partial floor (griller membership + a deterministic observability-vocabulary presence scanner used as **advisory evidence, never a floor-gate**) and an advisory bulk (needs + adequacy).

## Stages that ran, in order, and where the run ended

`/pharn-dev-plan → [GATE 1: human approved] → /pharn-dev-grill → /pharn-dev-build → /pharn-dev-regress → /pharn-dev-verify → /pharn-dev-review → [GATE 2: human decides]`

The run reached **GATE 2** (post-review) — the human decision point. It did **not** stop on any RED verdict.

## Structural verdicts read (verbatim — the floor-grade proceed/stop inputs)

| stage   | verdict source                             | value                                |
| ------- | ------------------------------------------ | ------------------------------------ |
| build   | `node .dev/floor/validate.mjs .` exit code | **0 (FLOOR GREEN — 6 capabilities)** |
| regress | `regression-report.json` `.verdict`        | **`no-regressions`** (exit 0)        |
| verify  | `verify-report.json` `.verdict`            | **`PASS`** (all 6 gates exit 0)      |

Membership: `count-grillers .` → **5** (testability, architecture, security, error-handling, observability). Verifiers: **0** (floor gates only, P7).

## Pointers (cite, do not restate — P4)

- **GRILL:** `.dev/features/observability-griller/GRILL.md` — advisory; **2 findings**. Finding 1 (important, P0/P7) caught that the scanner is the same launderable-presence-scanner shape the `error-handling` griller (landed mid-run) rejects as the disease → **halted to the human**, who chose _keep the scanner + add the explicit "advisory evidence, never a floor-gate" distinction_; that distinction is in `observability.md`'s guarantee audit. Finding 2 (minor) count-drift → fixed (live count 5).
- **REVIEW:** `.dev/features/observability-griller/REVIEW.md` — **GREEN, 0 floor-gate findings**; 2 minor advisory findings + 2 proposed lessons (see below).

## Deviations from a clean single-increment run (honest, P6)

This ran **concurrently with other griller ship runs** in the same working copy, which caused three externally-sourced frictions — **none** in this increment's own files:

1. **writes-scope race:** the shared `.pharn/writes-scope.json` (not a stack) was clobbered by concurrent runs; the `PLAN.md` write was blocked 3× until the human paused the other sessions.
2. **pre-existing HEAD breakage:** the concurrent `error-handling` commit left `format:check` + `lint:md` RED (its committed `REVIEW/SHIP/VERIFY.md` trace files were never style-gated). This blocked verify; per the human's decision those 3 files were repaired as a **separate** repo-hygiene pass (not part of this increment), after which verify PASSED.
3. **flaky outside-test gate:** the regress subset `node --test` gate flaked 0/1 under concurrent load (`npm test` stayed green); base==head, so no regression.

Both #1 and #2 are captured as **proposed lessons** in `REVIEW.md` (candidates for a separate human-gated `/pharn-dev-memory-promote`).

## Standing decision

Chain ran; the named floor verdicts are as shown (build GREEN, regress `no-regressions`, verify `PASS`; review GREEN with 0 floor-gate findings). **This is NOT a judgment that the increment is good or wise — that is the human's call at the post-review gate (GATE 2):** merge / fix / abandon. `/pharn-dev-ship` does not merge, push, commit, or apply the `PHARN ✓ reviewed` seal.
