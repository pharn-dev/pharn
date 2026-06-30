# SHIP — build-caveat-sync (`/pharn-dev-ship` gated roll-up — advisory)

`/pharn-dev-ship` ran the gated build loop for the `build-caveat-sync` increment (sync the stale scope-source caveat in `/pharn-build` to `plan-files-scope` reality). A thin, **advisory** record that the chain ran and what each stage's **structural floor verdict** was — **not** a judgment that the increment is good or wise, and **not** a merge/ship/seal.

## Stages run, in order, and where the run ended

| stage               | command              | structural verdict read (verbatim)               | source                                         |
| ------------------- | -------------------- | ------------------------------------------------ | ---------------------------------------------- |
| plan (**GATE 1**)   | `/pharn-dev-plan`    | human-approved "as written" (OQ1 → preserve)     | `PLAN.md` (open questions resolved)            |
| grill               | `/pharn-dev-grill`   | advisory — 1 concern (0 important, 1 minor)      | `GRILL.md` (no deterministic verdict)          |
| build               | `/pharn-dev-build`   | **`validate.mjs` exit 0 → GREEN** (1 capability) | floor exit (build emits no machine report)     |
| regress             | `/pharn-dev-regress` | **`"no-regressions"`**                           | `regression-report.json` `.verdict`            |
| verify              | `/pharn-dev-verify`  | **`"PASS"`** (6 gates exit 0)                    | `verify-report.json` `.verdict`                |
| review (**GATE 2**) | `/pharn-dev-review`  | advisory — **GREEN, 0 findings**                 | `REVIEW.md` (no structural verdict, P0/fix #3) |

**The run ended at GATE 2** — the post-review human decision (merge / fix / abandon). Reaching here is permission to **present**, not to act.

## The structural floor verdicts (the only guaranteed reads — `ARCHITECTURE.md §2`)

- **build** → `node .dev/floor/validate.mjs .` exit **0** (GREEN — 1 capability; the edit is a floor-ignored command).
- **regress** → `regression-report.json` `.verdict` = **`"no-regressions"`** (`check-regress.mjs`, exit 0; base `122b8ed`). `tests` `pre_existing` (the documented partial-`node --test` flake); `validate` + `structural` clean.
- **verify** → `verify-report.json` `.verdict` = **`"PASS"`** (`check-verify.mjs`, exit 0). All six gates exit 0 (`test` / `validate` / `lint` / `format:check` / `lint:md` / `structural`).

`/pharn-dev-ship` added **no new floor primitive** (gated mode).

## What landed

- `.claude/commands/pharn-build.md` — the stale "Scope-source caveat (a current, honest limit — LIMITS.md)" rewritten to "Scope-source note (resolved — `plan-files-scope`)": states `/pharn-plan` now emits a parseable `## Files` (aligned by `plan-files-scope`, `a5de975`), **preserving** the fail-closed point for a malformed/incomplete plan; the inline example re-anchored from `## Steps / Files` to a malformed plan; the now-pointless `LIMITS.md` reference dropped (grill finding — LIMITS.md confirmed to carry no matching entry). Pure prose; no behavioral change.

## Pointers (cite, do not restate — P4)

- **`REVIEW.md`** — 4 advisory lenses; **GREEN, 0 findings** (a clean, complete doc-sync); no new lesson.
- **`GRILL.md`** — the one applied concern (fix the heading + drop LIMITS.md), plus the live confirmation the doc-sync is complete (only stale ref; LIMITS.md clean).

## The standing decision is the human's (P0)

The chain ran; the named floor verdicts are as shown. **This is NOT a judgment that the increment is good or wise — that is the human's call at the post-review gate.** `/pharn-dev-ship` does not merge, push, commit, or seal. The increment is a documentation correction — the caveat now matches reality, with the fail-closed behavior unchanged.
