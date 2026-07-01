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

## Post-review fix (at GATE 2, human-directed)

At GATE 2 the human chose **fix** and directed: address the **important** advisory (`REVIEW.md` finding
F1, P2). Applied to `.claude/commands/pharn-verify.md` (Trust audit §P2), a **prose-only** refinement (no
behavioral change): the trust audit now (a) narrows the "gate commands are never sourced from the PLAN"
claim to the gate _command strings_ (§3a), and (b) adds an explicit bullet naming the §3b eval-pair
discovery's PLAN-`## Files` path-source (untrusted DATA) and **bounding** its taint — those PLAN-derived
values are used only as filesystem-membership / file-read operands to `check-structural.mjs` (never
executed, never shell-interpolated) whose sole output is an exit code, so no command and no guaranteed
decision rests on a tainted field (the same pattern `/pharn-regress` uses).

**Re-verified after the fix (an unsound edit cannot fake a green verdict — the gates recompute):**
`format:check` + `lint:md` re-checked the edited markdown; full `npm run check` **exit 0**; floor
**GREEN**; verify re-run over the edited file → **`PASS`** (all 6 gates 0). The edit is **inside** the
declared `## Files` scope and changed **no** outside gate input, so the regress `no-regressions` verdict
still stands (not re-run — nothing outside changed). The **minor** advisory (F2, RED-chain cross-stage
asymmetry) was left as-is per the human's scope ("the important advisory") and is reviewer-endorsed as
sound + intentional.

## Standing decision

**The decision is the human's.** This `SHIP.md` records **only that the chain ran and its named floor
verdicts are as shown** — it is **not** a self-issued "shipped", an approval, or a `PHARN ✓ reviewed`
seal. `/pharn-dev-ship` does not merge, push, or seal.

_Chain ran; the named floor verdicts are as shown — this is NOT a judgment that the increment is good or
wise; that is the human's call at the post-review gate (merge / fix / abandon)._
