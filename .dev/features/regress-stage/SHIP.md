# SHIP — regress-stage (`/pharn-dev-ship` roll-up for `/pharn-regress`)

**Increment:** build `/pharn-regress` — the fifth product-pipeline stage (deterministic regression detection
in the user's codebase). **Mode:** gated `/pharn-dev-ship` (no `--loop`). **Run ended at:** **GATE 2** — the
post-review human decision (merge / fix / abandon). This roll-up is **advisory**; it records that the chain
ran and its floor verdicts — it is **not** a judgment that the increment is good, and **not** a ship/seal.

## Stages run, in order

| stage             | outcome                    | verdict source (read verbatim)                                     |
| ----------------- | -------------------------- | ----------------------------------------------------------------- |
| `/pharn-dev-plan`   | PLAN written, **approved** | GATE 1 — human approved as written (OQ1, OQ2 resolved as recommended) |
| `/pharn-dev-grill`  | advisory, proceeded        | no structural verdict (grill gates nothing); 5 findings — see `GRILL.md` |
| `/pharn-dev-build`  | **GREEN** → proceed        | `node .dev/floor/validate.mjs .` **exit 0** (FLOOR)               |
| `/pharn-dev-regress`| **no-regressions** → proceed | `regression-report.json` `.verdict` = **`no-regressions`** (FLOOR, exit 0) |
| `/pharn-dev-verify` | **PASS** → proceed         | `verify-report.json` `.verdict` = **`PASS`** (FLOOR, exit 0, all 6 gates green) |
| `/pharn-dev-review` | **GREEN** (0 blocking)     | prose `REVIEW.md` — **no structural verdict** (LLM severity is advisory, fix #3) |

## Structural (FLOOR) verdicts, verbatim — the only guarantees in this run

- **build** → `validate.mjs` **exit 0** (GREEN — 1 capability; the new command is floor-ignored, count unchanged).
- **regress** → `.verdict = "no-regressions"` (`.dev/floor/check-regress.mjs verdict`, exit 0). `tests` is
  `pre_existing` (RED at base==head — the known partial-set flake; canonical `npm test` green), correctly
  excluded from `regressions[]`.
- **verify** → `.verdict = "PASS"` (`.dev/floor/check-verify.mjs`, exit 0). `failing_gates: []`;
  `verifiers: {registered: 0}`.

`/pharn-dev-ship` **added no floor primitive** — every verdict above belongs to a sub-stage's own checker; the
orchestration (running the stages in order, reading the verdicts) is **advisory** (two clocks).

## Pointers (cited, not restated — P4)

- **`REVIEW.md`** — GATE-2 reading. Verdict GREEN, 0 blocking; advisory: **1 important** (the product command
  references `.dev/floor/*` checkers excluded by "ship root minus `.dev/`" — **pre-existing across
  `/pharn-grill` + `/pharn-build`**, a packaging follow-up, not this increment's defect) + 2 minor. Two
  lesson candidates proposed for a separate human-gated `/pharn-dev-memory-promote` (the model never
  self-promotes, P2).
- **`GRILL.md`** — advisory interrogation; 5 findings (2 important, 3 minor). Both important findings
  (config-touch skip unsound for cross-file gates; gate-discovery needs a concrete membership rule) were
  **folded into the built command body** and confirmed honored by `REVIEW.md`.
- **`PLAN.md` / `REGRESSION.md` / `VERIFY.md`** — the per-stage artifacts.

## One transparency note (not hidden)

During `/pharn-dev-verify`, `format:check` initially exited 1 because the run's own **hand-written** outputs
(the deliverable `.claude/commands/pharn-regress.md` + audit `GRILL.md` + `regression-report.json`) were not
yet prettier-formatted. The fix was the **deterministic formatter** `npx prettier --write` over exactly those
three files (whitespace-only; `regression-report.json`'s data incl. `verdict` byte-equivalent), after which
the gates were **re-run** and the `PASS` above is the true recomputed verdict — not an override
(`check-verify.mjs` recomputes `PASS iff every gate == 0`).

## The standing decision is the human's

Chain ran; the named floor verdicts are as shown — **this is NOT a judgment that the increment is good or
wise; that is the human's call at the post-review gate.** `/pharn-dev-ship` does not merge, push, commit, or
apply the `PHARN ✓ reviewed` seal. Nothing has been committed. Decide **merge / fix / abandon**.
