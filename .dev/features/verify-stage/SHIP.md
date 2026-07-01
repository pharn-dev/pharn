# SHIP — verify-stage (`/pharn-verify` product command)

A thin, **advisory** roll-up of the gated `/pharn-dev-ship` chain for this increment. `/pharn-dev-ship`
adds **no floor primitive** — every verdict below belongs to a sub-stage; this file only records that the
chain ran and the verdicts it read.

## Stages run, in order, and where the run ended

`plan → [GATE 1: human approved] → grill → build → regress → verify → review → [GATE 2: human decides]`

The run reached **GATE 2** (post-review). No stage hit a RED-verdict STOP.

## The structural verdicts read (verbatim — the proceed decisions)

| stage       | verdict source                                       | verdict read                       | proceed?     |
| ----------- | ---------------------------------------------------- | ---------------------------------- | ------------ |
| **plan**    | `/pharn-dev-plan` approval halt                      | **GATE 1 — approved as written**   | ✓            |
| **grill**   | advisory (gates nothing)                             | 4 concerns (0 blocking-sev)        | ✓ (advisory) |
| **build**   | `node .dev/floor/validate.mjs .` exit code           | **0 (GREEN)**                      | ✓            |
| **regress** | `regression-report.json` `.verdict`                  | **`no-regressions`** (exit 0)      | ✓            |
| **verify**  | `verify-report.json` `.verdict`                      | **`PASS`** (exit 0, 6 gates green) | ✓            |
| **review**  | no structural verdict (`/pharn-dev-review` is prose) | **GATE 2 — present to human**      | —            |

- **build:** floor GREEN — the increment adds a floor-ignored command (`.claude/commands/pharn-verify.md`)
  - audit scaffolding; floor capability count stays **1**.
- **regress:** `inside == declared` (`escaped: []`, no fix #7 breach); outside gates `tests` / `validate` /
  `structural:trust-fence` all `0` at base and head → `no-regressions`.
- **verify:** all 6 gates (`test` / `validate` / `lint` / `format:check` / `lint:md` /
  `structural:expected-injection-comment.json`) exit 0; **zero verifiers registered** (floor gates only) →
  `PASS`.

## Pointers (cite, do not restate — P4)

- **Advisory grill:** `.dev/features/verify-stage/GRILL.md` — 4 concerns (2 important, 2 minor), all
  folded into the built command's prose during build.
- **Advisory review (GATE 2 input):** `.dev/features/verify-stage/REVIEW.md` — **GREEN (advisory)**, 0
  floor-gate (blocking) findings, 2 advisory findings (documentation-honesty refinements). Read it before
  deciding.
- Machine artifacts: `regression-report.json`, `verify-report.json` (verdicts above, verbatim).

## Standing decision

**The decision is the human's.** This `SHIP.md` records **only that the chain ran and its named floor
verdicts are as shown** — it is **not** a self-issued "shipped", an approval, or a `PHARN ✓ reviewed`
seal. `/pharn-dev-ship` does not merge, push, or seal.

_Chain ran; the named floor verdicts are as shown — this is NOT a judgment that the increment is good or
wise; that is the human's call at the post-review gate (merge / fix / abandon)._
