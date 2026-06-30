# SHIP — grill-stage (gated `/pharn-dev-ship` roll-up) — ADVISORY

A gated `/pharn-dev-ship` run of the `grill-stage` increment (build `/pharn-grill`: the product grill stage = advisory interrogation **+** floor spec→plan hash-chain re-verification via the new `.dev/floor/check-plan-spec-agree.mjs`). This is a roll-up only — it records **that the chain ran and its floor verdicts**; it is **not** a judgment that the increment is good or wise.

## Stages run, in order

| stage                | what                                                | structural verdict (read verbatim)                                                                     |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/pharn-dev-plan`    | wrote `PLAN.md`; halted at **GATE 1**               | human **approved as written** (intent gate)                                                            |
| `/pharn-dev-grill`   | wrote `GRILL.md` (advisory interrogation)           | _no structural verdict_ — `ADVISORY VERDICT: 5 concerns (0 blocking, 2 important, 3 minor)`; proceeded |
| `/pharn-dev-build`   | wrote the 3 planned files; ran the floor            | `validate.mjs` exit **0** (GREEN — 1 capability)                                                       |
| `/pharn-dev-regress` | baseline-vs-HEAD over outside gates                 | `regression-report.json` `.verdict` = **`no-regressions`**                                             |
| `/pharn-dev-verify`  | re-ran the deterministic gates (floor owns verdict) | `verify-report.json` `.verdict` = **`PASS`** (`failing_gates: []`)                                     |
| `/pharn-dev-review`  | 4 advisory lenses; wrote `REVIEW.md`                | _no structural verdict_ — `GREEN — no floor-gate findings`; 2 advisory findings stand                  |

**Where the run ended:** **GATE 2** (post-review). The chain ran end-to-end with every floor verdict GREEN; it stopped here for the human, as the gated `/pharn-dev-ship` always does.

## Floor verdicts read (the only guarantees in this run)

- `/pharn-dev-build` → `node .dev/floor/validate.mjs .` exit **0** (GREEN — 1 capability; the count is unchanged — the command is in `.claude/commands/` and the checker/test in `.dev/floor/`, both floor-ignored).
- `/pharn-dev-regress` → `.dev/features/grill-stage/regression-report.json` `.verdict` = **`no-regressions`** (outside gates `tests` / `validate` / `structural:expected-injection-comment.json` all `0→0`; `escaped: []`).
- `/pharn-dev-verify` → `.dev/features/grill-stage/verify-report.json` `.verdict` = **`PASS`** (gates `test` / `validate` / `lint` / `format:check` / `lint:md` / `structural:*` all `0`).

Each verdict is owned by its own sub-stage checker; `/pharn-dev-ship` only **read** these exit codes/`.verdict` fields to proceed — that orchestration is **advisory** (the two-clocks split). `/pharn-dev-ship` added **no new floor primitive**.

## Pointers (cited, not restated — P4)

- `.dev/features/grill-stage/REVIEW.md` — the 4-lens review; verdict GREEN, two **advisory** findings: (P0, important) the product command's floor checker lives under `.dev/` so a "root minus `.dev/`" package would ship `/pharn-grill` without its checker — **pre-existing repo-wide**, for a future packaging increment; (P0, minor) no `GRILL.md` is persisted on a RED chain — approved design, human may ratify.
- `.dev/features/grill-stage/GRILL.md` — advisory interrogation (5 concerns; 2 important folded into the build: `.trim()`+64-hex-gate the `--hash` output, explicit 64-hex gate on the carried hash).
- `.dev/features/grill-stage/{PLAN,REGRESSION,VERIFY}.md` + the two `*-report.json` — the full audit trail.

## Build note (transparency)

The build's first emission did not pass `format:check`/`lint:md` — the offenders were **only this increment's own new files**, brought to green in-stage with the deterministic formatters (`prettier --write`, `markdownlint-cli2 --fix`, one manual `MD028` blockquote merge). Formatting only, no behavior change, within the increment's footprint; the re-run is all-green (`VERIFY.md`).

## GATE-2 outcome — "fix all findings" (post-review)

At GATE 2 the human chose to **address the findings before merging**. Disposition of all seven (GRILL ×5, REVIEW ×2):

- **Folded into the build (3, already done):** trim + 64-hex-validate the `--hash` output (GRILL P5); explicit 64-hex gate on the carried hash (GRILL P2); symmetric GREEN-with-needle ★ test (GRILL P1).
- **Fixed now, in-scope (1):** persist a `GRILL.md` on a **RED** chain (GRILL P0 / REVIEW B). `pharn-grill.md` Step 2/Step 4 now write the §6 grill-log on **either** chain result (RED: the broken-chain verdict + re-plan guidance, no interrogation; GREEN: chain-GREEN + findings). This **reverses the approved plan's** "halt-no-artifact-on-RED" decision — a GATE-2 human override, recorded in `PLAN.md` "Decisions made". Re-verified: `npm run check` GREEN, `validate` GREEN, checker tests GREEN.
- **Ratified, no change (1):** the P7 trigger framing (GRILL P7) — the human's "fix everything" confirms the deferred-gap + P0 trigger meets the P7 bar.
- **P7-DEFERRED, deliberately NOT fixed here (1):** the `.dev/` packaging boundary (REVIEW A). "Fixing" it now would be **speculative (P7)** — there is **no packaging step in the repo yet** to fix against, the concern is pre-existing and repo-wide (`/pharn-plan`, `/pharn-spec` share it), and a real fix would touch the **hook-protected** `ARCHITECTURE.md` / `CLAUDE.md` boundary docs and span multiple commands (breaking one-axis, P3). It stays **recorded** in `REVIEW.md` as a forward-constraint for the future packaging increment — the honest action, not laziness. (Available as its own `/pharn-dev-ship` when packaging is real.)

## Standing decision

Chain ran; the named floor verdicts are as shown, and the in-scope findings are fixed and **re-verified GREEN** — this is still **NOT** a judgment that the increment is good or wise; that is the human's call. `/pharn-dev-ship` does **not** merge, push, commit, or apply the `PHARN ✓ reviewed` seal. **The decision (merge / abandon) is yours.**
