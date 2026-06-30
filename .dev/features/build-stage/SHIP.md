# SHIP — build-stage (`/pharn-dev-ship` gated roll-up of the `/pharn-build` increment)

> **Advisory roll-up.** Records that the chain ran and its floor verdicts. It is **not** a self-issued "shipped", an approval, or a `PHARN ✓ reviewed` seal. The standing decision is the human's at the post-review gate.

## Stages run (in order) — gated chain, ended at GATE 2

| stage                | what ran                                                     | structural verdict read                                                      | outcome      |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------ |
| `/pharn-dev-plan`    | `PLAN.md` written; **human approved at GATE 1**              | — (human approval gate, not a floor verdict)                                 | ✓ approved   |
| `/pharn-dev-grill`   | `GRILL.md` (advisory interrogation)                          | — (advisory; gates nothing) — 8 concerns, **0 blocking**                     | ✓ (advisory) |
| `/pharn-dev-build`   | wrote `.claude/commands/pharn-build.md` + 1 fail-closed test | `node .dev/floor/validate.mjs .` exit **0** (GREEN — 1 cap)                  | ✓ proceed    |
| `/pharn-dev-regress` | `regression-report.json`                                     | `.verdict = "no-regressions"`                                                | ✓ proceed    |
| `/pharn-dev-verify`  | `verify-report.json`                                         | `.verdict = "PASS"` (6/6 floor gates)                                        | ✓ proceed    |
| `/pharn-dev-review`  | `REVIEW.md` (4 advisory lenses)                              | — (no structural verdict; floor GREEN already gated) — GREEN, **0 blocking** | **GATE 2**   |

**Run ended at GATE 2** (post-review human decision) — not at a RED-verdict STOP.

## The structural verdicts (the only floor-grade facts `/pharn-dev-ship` branched on)

- **`/pharn-dev-build`** → `node .dev/floor/validate.mjs .` exit **0** (GREEN — 1 capability, count unchanged; the command dir is floor-ignored).
- **`/pharn-dev-regress`** → `regression-report.json` `.verdict` = **`no-regressions`**. (The `tests` gate is `pre_existing` RED at base==head — a flaky partial-`node --test` artifact of a stale root `floor/` duplicate, **not** a regression; canonical `npm test` is green.)
- **`/pharn-dev-verify`** → `verify-report.json` `.verdict` = **`PASS`** (`test` · `validate` · `lint` · `format:check` · `lint:md` · `structural:trust-fence` all exit 0; 0 verifiers registered → floor-only).

## Decisions resolved at GATE 1 (human-approved 2026-06-30)

- **OQ1 → Option A** — `/pharn-build` reuses `set-writes-scope.cjs --from-plan` as-is; the product `/pharn-plan`'s `## Steps / Files` non-compliance is a named follow-up `plan-files-scope` (not bundled). `/pharn-build` is correct + **fail-closed** until then.
- **OQ2 → thin `BUILD.md`** — Phase-2 `--from-frontmatter … --target` re-scope after the user-code writes (mirrors this command's `SHIP.md` scoping).

## Pointers (cited, not restated — P4)

- `.dev/features/build-stage/REVIEW.md` — 4 advisory lenses; verdict **GREEN** (0 blocking); 2 important advisory carry-forwards + 1 lesson candidate.
- `.dev/features/build-stage/GRILL.md` — advisory interrogation (8 concerns, 0 blocking); spec→plan hash chain held (no drift).
- `.dev/features/build-stage/{PLAN,REGRESSION,VERIFY}.md` + `regression-report.json` + `verify-report.json`.

## Carry-forwards for the human (from grill + review — NOT blocking)

1. **`plan-files-scope` follow-up** — align the product `/pharn-plan` to emit a parseable `## Files` (back-tick paths) so `/pharn-build` runs end-to-end; until then it fail-closes on a real product plan. Track durably.
2. **Stale root `floor/` cleanup** — remove the committed root `floor/check-ship.*` duplicate and isolate the git/worktree-touching test suites (pre-existing test-infra flake; canonical `npm test` green).
3. **Lesson candidate** (`REVIEW.md`) — _"verify the upstream EMITS the consumed section before building the consumer"_ — for a future human-gated `/pharn-dev-memory-promote`.

## Honest line

Chain ran; the named floor verdicts are as shown (build `validate` **0**, regress **`no-regressions`**, verify **`PASS`**) — this is **NOT** a judgment that the increment is good or wise; that is the human's call at the post-review gate. `/pharn-dev-ship` does not merge, push, or seal.
