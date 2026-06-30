# SHIP — plan-stage (`/pharn-plan`) — gated `/pharn-dev-ship` roll-up

**Advisory roll-up only.** `/pharn-dev-ship` ran the build loop in order and read each stage's **structural**
verdict to decide proceed/stop. It added **no new floor primitive** — every verdict below belongs to a
sub-stage. This file records **that the chain ran and its floor verdicts**; it is **not** an approval, a
"shipped", or a `PHARN ✓ reviewed` seal.

## Stages run, in order

| #   | stage                | structural verdict (read verbatim)                            | source                                     | →          |
| --- | -------------------- | ------------------------------------------------------------- | ------------------------------------------ | ---------- |
| 1   | `/pharn-dev-plan`    | plan written + **human-approved (GATE 1)**, Option A          | `PLAN.md`                                  | proceed    |
| 2   | `/pharn-dev-grill`   | advisory — 5 concerns (0 blocking); **gates nothing**         | `GRILL.md`                                 | proceed    |
| 3   | `/pharn-dev-build`   | `validate.mjs` exit **0** (GREEN — 1 capability)              | floor exit code                            | proceed    |
| 4   | `/pharn-dev-regress` | `.verdict` = **`no-regressions`**                             | `regression-report.json`                   | proceed    |
| 5   | `/pharn-dev-verify`  | `.verdict` = **`PASS`** (test/validate/lint = 0; 0 verifiers) | `verify-report.json`                       | proceed    |
| 6   | `/pharn-dev-review`  | floor **GREEN — 0 floor-gate findings** (3 advisory)          | `REVIEW.md` (prose; no structural verdict) | **GATE 2** |

**Where the run ended:** **GATE 2** — the post-review human decision (merge / fix / abandon). The chain
reached the end with every floor verdict GREEN; no stage hit a RED-verdict STOP.

## The structural verdicts, verbatim (the floor reads — never my judgment)

- **`/pharn-dev-build`** → `node .dev/floor/validate.mjs .` exit **`0`** (`FLOOR: GREEN — 1 capabilities checked`).
- **`/pharn-dev-regress`** → `regression-report.json` `.verdict` = **`"no-regressions"`** (every outside gate
  `0→0`; base `0ff3b6c`; `escaped: []`).
- **`/pharn-dev-verify`** → `verify-report.json` `.verdict` = **`"PASS"`** (`failing_gates: []`; gates
  `test`/`validate`/`lint` = 0; `verifiers.registered: 0`).

## Advisory pointers (cited, not restated — P4)

- **`.dev/features/plan-stage/REVIEW.md`** — the 4-lens review (GREEN; 3 advisory minor findings + a
  proposed zsh lesson candidate). `/pharn-dev-review` writes **prose only**; it carries **no** structural
  verdict, so `/pharn-dev-ship` does **not** compute proceed/stop from it (reading LLM severity as a gate
  would be the fix#3 disease). Read it at GATE 2.
- **`.dev/features/plan-stage/GRILL.md`** — advisory interrogation (5 concerns, all folded into the build:
  two-clocks carve-out, deterministic carry-forward wording, path-resolution via `import.meta.url` +
  distinct refusal messages, explicit PLAN.md frontmatter, named residual).

## What landed (for the human's GATE-2 read)

- `.claude/commands/pharn-plan.md` — the **product** `/pharn-plan` command (the spine's plan stage after
  `/pharn-spec`): a deterministic **Approved-input gate** + an advisory PLAN.md carrying `spec_id` +
  `spec_content_hash` forward (`ARCHITECTURE.md §6`, fix #4).
- `.dev/floor/check-spec-approved.mjs` — the gate (reuses `check-spec.mjs`; adds `state == Approved`).
- `.dev/floor/check-spec-approved.test.mjs` — 7 tests, all green.

The increment makes `/pharn-spec`'s hash-pin **non-decorative**: `/pharn-plan` is the **first downstream
consumer that ENFORCES it** (refuses a Draft or a drifted SPEC).

---

The chain ran; the named floor verdicts are as shown — **this is NOT a judgment that the increment is
good or wise; that is the human's call at the post-review gate.**
