# SHIP — performance-griller (gated /pharn-dev-ship roll-up)

Advisory roll-up of the gated `/pharn-dev-ship` chain. `/pharn-dev-ship` adds **no** floor primitive — every
verdict below belongs to a sub-stage; running the stages in order is **advisory orchestration**. This
file is **not** a "shipped" marker, an approval, or a `PHARN ✓ reviewed` seal.

## Stages that ran, in order, and where the run ended

`/pharn-dev-plan` → **[GATE 1: human approved as written]** → `/pharn-dev-grill` → `/pharn-dev-build` →
`/pharn-dev-regress` → `/pharn-dev-verify` → `/pharn-dev-review` → **ended at GATE 2 (post-review human
decision)**. No RED-verdict STOP occurred; the run reached GATE 2.

## Structural verdicts read (verbatim — the floor-grade decisions)

| stage             | verdict source                        | value read              |
| ----------------- | ------------------------------------- | ----------------------- |
| `/pharn-dev-build`   | `validate.mjs` exit code              | **0** (GREEN, 8 caps)   |
| `/pharn-dev-regress` | `regression-report.json` `.verdict`   | **"no-regressions"**    |
| `/pharn-dev-verify`  | `verify-report.json` `.verdict`       | **"PASS"** (5/5 gates)  |

Each verdict was read from the sub-stage's own deterministic checker (`validate` exit /
`check-regress` / `check-verify`), never from `/pharn-dev-ship`'s judgment. Proceeding past each was
advisory orchestration on a GREEN floor verdict.

## Advisory stage outputs (pointers — not restated here, P4)

- **Grill:** `.dev/features/performance-griller/GRILL.md` — 1 minor advisory finding (P7: family-build-out
  vs a captured failure; mitigated by the approved sibling-griller precedent). Advisory; gated nothing.
- **Review (GATE 2 input):** `.dev/features/performance-griller/REVIEW.md` — verdict **GREEN, 0 floor-gate
  (blocking) findings**; two advisory notes; one proposed memory-bank lesson candidate (markdown-authoring
  style) for a separate human-gated `/pharn-dev-memory-promote` run. `/pharn-dev-ship` computes **no**
  proceed/stop from `REVIEW.md` (its severities are LLM-assigned — advisory; fix #3).

## What landed (the increment)

The 7th griller — 7 product files under `pharn-pipeline/grillers/performance/` (the `role: griller`
capability + 2 eval cases + 4 expected). Advisory-only floor profile (membership is the sole runtime
guarantee; `enforces: P7`, the "unlabeled scaling limit" mapping confirmed by the human at GATE 1). No new
floor primitive; `count-grillers.mjs` unchanged; the griller is auto-discovered by the grill stage.
Trusted docs untouched.

> **Build-completion note:** the first verify pass FAILed the style gates on the feature's own files
> (trivial MD049/MD018/prettier nonconformance); fixed within each file's authorized writes-scope via the
> gated Edit tool (no hook bypass, no substantive change), and re-verify is GREEN. Recorded, not hidden.

## Standing decision

Chain ran; the named floor verdicts are as shown — this is **NOT** a judgment that the increment is good
or wise; that is the human's call at the post-review gate (GATE 2). `/pharn-dev-ship` does not merge, push,
commit, or seal.
