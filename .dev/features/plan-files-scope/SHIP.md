# SHIP — plan-files-scope (`/pharn-dev-ship` gated roll-up — advisory)

`/pharn-dev-ship` ran the gated build loop for the `plan-files-scope` increment (close the spec→plan→grill→build chain: make `/pharn-plan` emit a parseable `## Files` the fix #7 setter can read). This is a thin, **advisory** record that the chain ran and what each stage's **structural floor verdict** was — it is **not** a judgment that the increment is good or wise, and **not** a merge/ship/seal.

## Stages run, in order, and where the run ended

| stage               | command              | structural verdict read (verbatim)               | source                                         |
| ------------------- | -------------------- | ------------------------------------------------ | ---------------------------------------------- |
| plan (**GATE 1**)   | `/pharn-dev-plan`    | human-approved "as written" (Option B for OQ1)   | `PLAN.md` (open questions resolved)            |
| grill               | `/pharn-dev-grill`   | advisory — 4 concerns (2 important, 0 blocking)  | `GRILL.md` (no deterministic verdict)          |
| build               | `/pharn-dev-build`   | **`validate.mjs` exit 0 → GREEN** (1 capability) | floor exit (build emits no machine report)     |
| regress             | `/pharn-dev-regress` | **`"no-regressions"`**                           | `regression-report.json` `.verdict`            |
| verify              | `/pharn-dev-verify`  | **`"PASS"`** (6 gates all exit 0)                | `verify-report.json` `.verdict`                |
| review (**GATE 2**) | `/pharn-dev-review`  | advisory — **GREEN, 0 floor-gate findings**      | `REVIEW.md` (no structural verdict, P0/fix #3) |

**The run ended at GATE 2** — the post-review human decision (merge / fix / abandon). Reaching here is permission to **present**, not to act.

## The structural floor verdicts (the only guaranteed reads — `ARCHITECTURE.md §2`)

- **build** → `node .dev/floor/validate.mjs .` exit **0** (GREEN — 1 capability `trust-fence`; count unchanged, both edits in floor-ignored `.claude/`).
- **regress** → `regression-report.json` `.verdict` = **`"no-regressions"`** (`check-regress.mjs`, exit 0). `tests` was `pre_existing` (base==head==1, the documented partial-`node --test` flake); `validate` + `structural:trust-fence` clean.
- **verify** → `verify-report.json` `.verdict` = **`"PASS"`** (`check-verify.mjs`, exit 0). All six gates exit 0: test / validate / lint / lint:md / format:check / structural:trust-fence.

Each verdict is FLOOR (a sub-stage checker's exit code / `.verdict`); `/pharn-dev-ship` reading them and proceeding is **advisory orchestration**. `/pharn-dev-ship` added **no new floor primitive** (gated mode).

## What landed

- `.claude/commands/pharn-plan.md` — Step-4 PLAN template split: advisory `## Steps` + a **parseable `## Files`** (back-tick paths, angle-bracket placeholders that fail closed when unfilled, an `### Explicitly not touched` subsection) + guidance citing the `set-writes-scope.cjs --from-plan` contract and `ARCHITECTURE.md §6` (P4).
- `.claude/hooks/set-writes-scope.test.cjs` — two tests: the closing-the-loop (a filled `/pharn-plan`-shaped plan → exit 0, scope = exactly the `## Files` paths, exclusions/steps-prose absent) and the producer-faithfulness (the real `pharn-plan.md` template → exit 1, locking the placeholder discipline). `npm test`: 165 (163 + 2).

## Pointers (cite, do not restate — P4)

- **`REVIEW.md`** — the 4 advisory lenses; GREEN, 0 floor-gate findings; 3 advisory findings + 1 **proposed** lesson candidate (`verify-include-style-gates`) to be promoted only via a separate human-gated `/pharn-dev-memory-promote` run.
- **`GRILL.md`** — advisory interrogation (the placeholder + test-faithfulness concerns, both applied in the build).
- **`VERIFY.md`** — notes a real **style-gate gap** found and fixed this run: the increment initially reddened `npm run check` (the build output + audit artifacts were not prettier/markdownlint clean); corrected mechanically and re-verified green (full `npm run check` exit 0). This is the basis for the proposed lesson.

## The standing decision is the human's (P0)

The chain ran; the named floor verdicts are as shown above. **This is NOT a judgment that the increment is good or wise — that is the human's call at the post-review gate.** `/pharn-dev-ship` does not merge, push, commit, or apply any `PHARN ✓ reviewed` seal. Nothing here changes that the `## Files` list a future `/pharn-plan` emits is the model's **advisory** declaration of intended writes; fix #7 only deterministically **holds** a build to whatever paths the list names.
