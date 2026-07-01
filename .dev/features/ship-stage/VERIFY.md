# VERIFY — ship-stage (`/pharn-ship` product command)

**Feature:** `ship-stage` — `.claude/commands/pharn-ship.md` (the gated product pipeline orchestrator).
Verified at HEAD (single run; no baseline worktree — that is `/pharn-dev-regress`'s cost, not verify's).

## FLOOR layer — the deterministic gates (own the verdict)

| gate                     | exit | notes                                                               |
| ------------------------ | :--: | ------------------------------------------------------------------- |
| `test`                   |  0   | `npm test` — 167 pass, 0 fail (the increment adds no test files)    |
| `validate`               |  0   | `.dev/floor/validate.mjs .` → GREEN, 1 capability (unchanged)       |
| `lint`                   |  0   | `eslint .` clean                                                    |
| `format:check`           |  0   | `prettier --check .` clean (whole-repo; L9 coverage)                |
| `lint:md`                |  0   | `markdownlint-cli2` clean (whole-repo; L9 coverage)                 |
| `structural:trust-fence` |  0   | `check-structural.mjs` over the one committed eval pair (unchanged) |

`structural:*` eval pair: `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
`.dev/features/trust-fence/findings.json` (the increment ships no new eval pair — `/pharn-ship` is a command,
not a Capability — so the only structural gate is the standing trust-fence pair).

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only** (`.dev/floor/count-verifiers.mjs .` → `{"registered":0,
"verifiers":[]}`). Step 2 is a no-op; the verdict is the floor gates alone. No verifier is authored
speculatively (P7).

## Verdict

**VERIFIED: floor gates PASS.** The verdict is the deterministic exit-code threshold
(`.dev/floor/check-verify.mjs` → `PASS`, exit 0 — every gate exit 0), and **no verifier finding can flip it**
(the helper's only input is the gate→exit-code map).

**Honest residual (P0/P7):** verified = **the named gates passed** — this is NOT a guarantee of correctness
beyond what those gates check. The gates here are whole-repo/structural: they confirm the tree is green with
`/pharn-ship` present, that the floor still holds, and that style is clean. They do **not** judge whether the
orchestrator's prose is _wise_ or whether its proceed-gate semantics are the right design — that is
`/pharn-dev-review` (advisory) and the human's call. Verifier concerns, when any exist, are advisory help, not
assurance. The gate-set composition (which gates are in the map) is advisory orchestration (two clocks); only
the exit-code threshold over the assembled map is the guarantee.
