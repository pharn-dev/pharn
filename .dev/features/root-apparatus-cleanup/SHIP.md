# SHIP — root-apparatus-cleanup (advisory roll-up)

`/pharn-dev-ship` (gated mode) ran the build loop in order. This file records **that the chain ran and
its floor verdicts** — it is **not** a judgment that the increment is good or wise, and it is **not** a
merge, a ship, or a `PHARN ✓ reviewed` seal.

## Stages run, in order

| stage                | ran | structural verdict (read verbatim)                                            |
| -------------------- | --- | ----------------------------------------------------------------------------- |
| `/pharn-dev-plan`    | ✓   | GATE 1 — human **approved** (OQ-1 complete cleanup; OQ-2 leave traces frozen) |
| `/pharn-dev-grill`   | ✓   | advisory — 2 concerns (0 blocking); gates nothing                             |
| `/pharn-dev-build`   | ✓   | **FLOOR: `validate` exit 0** (GREEN — 2 capabilities)                         |
| `/pharn-dev-regress` | ✓   | **`regression-report.json` .verdict = `no-regressions`** (exit 0)             |
| `/pharn-dev-verify`  | ✓   | **`verify-report.json` .verdict = `PASS`** (exit 0)                           |
| `/pharn-dev-review`  | ✓   | advisory — REVIEW verdict GREEN, 0 floor-gate findings                        |

**Where the run ended:** GATE 2 (post-review human decision) — not a RED-verdict STOP.

## The two human gates

- **GATE 1 (plan acceptance):** hit and passed — the human approved the plan and resolved OQ-1
  (complete cleanup: all four PR-19 leftovers) and OQ-2 (leave `.dev/features/*/` traces frozen).
- **GATE 2 (post-review decision):** **this is where the run stops.** The human decides
  **merge / fix / abandon**. `/pharn-dev-ship` does not merge, push, commit, or seal.

## What landed (working tree, staged — not committed)

Deletion-only: `git rm` of `floor/check-ship.{mjs,test.mjs}`, `features/ship-loop/` (6),
`features/ship-gated/` (6), `.claude/commands/ship.md`. Root `floor/` is gone; root `features/` = README
only; `.dev/floor/check-ship.mjs` (live copy) and all `.dev/features/*/` traces untouched.

## Pointers (cited, not restated — P4)

- Interrogation: `.dev/features/root-apparatus-cleanup/GRILL.md` (advisory; both concerns resolved in-run).
- Review: `.dev/features/root-apparatus-cleanup/REVIEW.md` (GREEN; two lesson candidates proposed for a
  separate human-gated `/pharn-dev-memory-promote` — not written to canon here).
- Machine verdicts: `regression-report.json`, `verify-report.json`.

## Guarantee audit (P0)

`/pharn-dev-ship` (gated) added **no** new floor primitive — every verdict above belongs to a sub-stage's
own checker (`validate` exit / `check-regress` / `check-verify`). Running the stages in order and reading
their verdicts is **advisory orchestration**; only the sub-stage verdicts are floor-grade.

---

**Chain ran; the named floor verdicts are as shown — this is NOT a judgment that the increment is good
or wise; that is the human's call at the post-review gate.**
