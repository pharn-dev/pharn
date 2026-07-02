# VERIFY — migrations-griller

**Feature:** `migrations-griller` · **Verdict source:** `.dev/floor/check-verify.mjs` (FLOOR; `PASS iff every gate exit 0`). Run once at HEAD (no worktree).

## FLOOR layer — deterministic gates (own the verdict)

| gate                                  | exit | meaning                                                           |
| ------------------------------------- | ---- | ----------------------------------------------------------------- |
| test                                  | 0    | `npm test` — full hermetic suite incl. the new scanner's 11 tests |
| validate                              | 0    | `.dev/floor/validate.mjs .` — GREEN, 9 capabilities               |
| lint                                  | 0    | `npm run lint` — eslint clean                                     |
| format:check                          | 0    | `npm run format:check` — prettier clean (whole-repo)              |
| lint:md                               | 0    | `npm run lint:md` — markdownlint clean (whole-repo)               |
| structural:expected-injection-comment | 0    | `check-structural` over the one committed eval pair (trust-fence) |

**VERIFIED: floor gates PASS** (`check-verify.mjs` exit 0; `failing_gates: []`).

## Feature-specific correctness signal (honest granularity, P7)

- `test` / `validate` / `lint` / `format:check` / `lint:md` are **whole-repo** — PASS requires the whole repo green with the increment present, not just the increment's files.
- The migrations griller ships **4 eval `expected/*.json`** but **no committed actual `findings.json`** (the live griller runner is deferred P7, exactly as for every griller). So those evals are **not** a committed eval pair and produce **no** `structural:*` gate here; their presence + shape is floor-checked by `validate.mjs` (P1 presence) and the scanner's own hermetic tests (`scan-plan-migrations.test.mjs`, collected by `npm test`). The one `structural:*` gate that ran is the outside trust-fence pair.

## ADVISORY layer — verifiers

`node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — **no verifiers registered — floor gates only.** Step 2 is a no-op (P7: none authored speculatively); the verdict is the floor gates alone.

## Honest residual (P0/P7)

Verified = **the named gates passed**; this is **NOT** a guarantee of correctness beyond what those gates check — a defect no test/eval/rule/lint covers is invisible to the floor verdict, and the verifier layer that might notice it is advisory (and empty today). Verifier concerns would be advisory help, not assurance. This does **not** certify the increment is good or wise — that is the human's call at the post-review gate.
