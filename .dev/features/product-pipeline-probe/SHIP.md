# SHIP — product-pipeline-probe (gated `/pharn-dev-ship` roll-up)

**Run type:** gated `/pharn-dev-ship` (no `--loop`). **Ended at:** GATE 2 (post-review) — handed to the human.
This roll-up is **advisory**; every guarantee belongs to a sub-stage. `/pharn-dev-ship` added no floor primitive.

## Stages that ran, in order

| stage                | result                                     | structural verdict read (verbatim)                                |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `/pharn-dev-plan`    | PLAN.md written → **GATE 1** approved      | _(human approval — not a floor verdict)_                          |
| `/pharn-dev-grill`   | GRILL.md written (7 concerns, advisory)    | _(advisory; gates nothing)_                                       |
| `/pharn-dev-build`   | ran the nested PRODUCT pipeline + PROBE.md | `validate.mjs .` exit **0** (GREEN)                               |
| `/pharn-dev-regress` | regression-report.json                     | `.verdict` = **`no-regressions`**                                 |
| `/pharn-dev-verify`  | verify-report.json                         | `.verdict` = **`PASS`**                                           |
| `/pharn-dev-review`  | REVIEW.md (4 lenses)                       | GREEN — 0 floor-gate findings _(no structural verdict; advisory)_ |

All three floor verdicts are GREEN: `validate` exit 0 · `no-regressions` · `PASS`.

## Human gates / stops hit this run (the honest record)

- **GATE 1 (plan approval):** approved "as written" (vehicle `greet(name)`, disposition = revert in a follow-up).
- **Nested product-SPEC gate (CF-B):** the product `/pharn-spec` halted **inside** `/pharn-dev-build` for a second
  human approval; approved "Approve & pin." This confirmed probe confirmation #4 (the SPEC gate halts) live.
- **Regress STOP → human decision:** `/pharn-dev-regress`'s scope partition first exited 1 with a CF-1-amplified
  **false** fix#7 escape (the nested sub-commands' legitimate outputs vs the dev plan's one-path `## Files`). The
  human chose **branch + commit discipline + continue**; after committing all-but-`PROBE.md` (branch
  `product-pipeline-probe`, commit `a730f28`), the partition was clean and the verdict computed `no-regressions`.
- **GATE 2 (post-review):** this stop. The decision (merge / fix / abandon) is the human's.

## Pointers (cited, not restated — P4)

- Substantive deliverable + all findings: `.dev/features/product-pipeline-probe/PROBE.md` (the measured hand-off
  matrix, the four confirmations, CF-A/B/C/E + G3).
- Advisory interrogation of the plan: `.dev/features/product-pipeline-probe/GRILL.md`.
- Advisory review of the increment: `.dev/features/product-pipeline-probe/REVIEW.md` (GREEN; two proposed
  lessons for a future `/pharn-dev-memory-promote`).

## What this run established (and did not)

The product pipeline **runs as a chain** — first evidence, every hand-off observed, no mismatch in the four
product stages; the spec→plan→grill→build content-hash chain held; fix #7 bounded the build (observed deny); the
SPEC gate halted. It surfaced **one new latent bug** (CF-E, the `--from-plan` cue truncation) and **confirmed
four anticipated interactions** (CF-A scanned-surface CHECK 5; CF-B nested gate; CF-C scope thrash; CF-1-amplified
regress conflation; G3 verify style gates). The vehicle is meaningless by design and is slated for revert.

_chain ran; the named floor verdicts are as shown — this is NOT a judgment that the increment is good or wise;
that is the human's call at the post-review gate. `/pharn-dev-ship` did not merge, push, or seal._
