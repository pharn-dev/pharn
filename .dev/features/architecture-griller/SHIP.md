# SHIP — architecture-griller (gated /pharn-dev-ship roll-up)

**Advisory roll-up.** `/pharn-dev-ship` ran the build loop in order and read each stage's structural floor
verdict to decide proceed/stop. It adds **no** new floor primitive; every verdict below belongs to a
sub-stage's own checker. This roll-up records **that the chain ran and its floor verdicts** — it is **not**
a self-issued "shipped", an approval, or a seal.

## Stages run, in order — ended at GATE 2 (post-review human decision)

| stage   | structural verdict (verbatim)    | source                            | result     |
| ------- | -------------------------------- | --------------------------------- | ---------- |
| plan    | human-approved (GATE 1)          | AskQuestion halt                  | proceed    |
| grill   | advisory (no gate)               | `GRILL.md` — 3 minor, all applied | proceed    |
| build   | `validate` exit **0**            | `node .dev/floor/validate.mjs .`  | proceed    |
| regress | `.verdict` = **no-regressions**  | `regression-report.json`          | proceed    |
| verify  | `.verdict` = **PASS**            | `verify-report.json`              | proceed    |
| review  | advisory (no structural verdict) | `REVIEW.md` — GREEN, 0 blocking   | **GATE 2** |

- **build** → `validate` exit `0` (GREEN — 3 capabilities; the griller is the 3rd counted capability).
- **regress** → `regression-report.json` `.verdict` = `no-regressions` (exit 0; outside gates
  test/validate/structural:trust-fence byte-identical base↔head).
- **verify** → `verify-report.json` `.verdict` = `PASS` (exit 0; test 167 / validate / lint / format:check
  / lint:md all 0).

## Two human gates (both held)

- **GATE 1 (plan acceptance):** approved as written — OQ1 advisory-only (membership is the only runtime
  floor; no manufactured floor sub-check), OQ2 `enforces: ["P3"]` / misfit severity `important`.
- **GATE 2 (post-review):** reached now. The merge / fix / abandon decision is the **human's** — see
  `REVIEW.md` (GREEN, 0 floor-gate findings) and `GRILL.md` (advisory).

## One in-run deviation, surfaced (not hidden)

Verify first returned **FAIL** on `lint:md` (a whole-repo gate) due to a **pre-existing** MD038 cluster in
`.dev/features/root-apparatus-cleanup/REVIEW.md` (#30), unrelated to this feature. At that RED-verdict STOP
the human **approved** fixing it as a **separate, out-of-scope cleanup**; after the fix verify re-ran to
**PASS**. That one file change is **outside** the griller's `## Files` and should be **split into its own
commit** (P3/P7) — flagged in `REVIEW.md` (L-axis) and `VERIFY.md`. This feature's own files were clean
independently (a cosmetic `PLAN.md:61` nested-back-tick was fixed).

## Pointers (cited, not restated — P4)

- `REVIEW.md` — the 4 advisory lenses + 2 proposed lesson candidates (L-GATE-1: whole-repo `lint:md`
  blocked by a pre-existing unrelated error; L-GATE-2: use the canonical `package.json` test glob, not a
  hand-expanded list). Lessons are candidates only — `/pharn-dev-memory-promote` gates any canon write.
- `GRILL.md` — advisory interrogation (3 minor notes, all applied at build).
- `VERIFY.md` / `REGRESSION.md` — the two-clock human renders of the floor verdicts above.

**Chain ran; the named floor verdicts are as shown — this is NOT a judgment that the increment is good or
wise; that is the human's call at the post-review gate.**
