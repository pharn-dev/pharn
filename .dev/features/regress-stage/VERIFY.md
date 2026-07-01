# VERIFY — regress-stage (`/pharn-dev-verify` of the `/pharn-regress` increment)

**Feature:** `regress-stage` · **Deliverable:** `.claude/commands/pharn-regress.md` (a floor-ignored command; no new checker, no new evals — reuses `check-regress.mjs` + `check-plan-spec-agree.mjs` as-is).

## FLOOR layer — the deterministic gates (own the verdict)

| gate                     | exit | notes                                                                          |
| ------------------------ | ---- | ------------------------------------------------------------------------------ |
| `test`                   | 0    | canonical `npm test` — 163 tests green (unaffected; command is floor-ignored)  |
| `validate`               | 0    | `.dev/floor/validate.mjs .` — GREEN, 1 capability (count unchanged)            |
| `lint`                   | 0    | eslint clean                                                                   |
| `format:check`           | 0    | prettier clean — **see the honest note below**                                 |
| `lint:md`                | 0    | markdownlint clean                                                             |
| `structural:trust-fence` | 0    | the one committed eval pair (expected ↔ `.dev/features/trust-fence/findings.json`) |

**VERIFIED: floor gates PASS** (`.dev/floor/check-verify.mjs`, exit 0 — every gate exit 0, `failing_gates: []`).

### Honest note — the `format:check` gate (transparency, not hidden)

On the first pass `format:check` exited **1**: the three files authored during this pipeline run —
`.claude/commands/pharn-regress.md` (the deliverable), and the audit scaffolding
`.dev/features/regress-stage/GRILL.md` + `regression-report.json` — were not yet prettier-formatted (they
were hand-written). Every prior committed pipeline output on `main` is prettier-clean, so a clean build must
leave these files formatted. The fix was the **deterministic formatter** `npx prettier --write` on exactly
those three files (content-preserving — whitespace/wrapping only; `regression-report.json`'s data, incl.
`verdict: "no-regressions"`, is byte-equivalent). The gates were then re-run on the clean output and the
verdict above is that **true** re-computed result — not a judgment override. `check-verify.mjs` recomputes
`PASS iff every gate == 0`; it cannot be faked.

## ADVISORY layer — verifiers

`node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}`. **No verifiers registered — floor
gates only.** Step 2 was a no-op; the verdict is the floor gates alone. No verifier is authored
speculatively (P7). No verifier free-text exists, so nothing tainted enters this report.

## Honest residual (P0/P7)

**Verified = the named gates passed; this is NOT a guarantee of correctness beyond what those gates check.**
The floor verdict rests entirely on the exit-code threshold (`check-verify.mjs`); the advisory verifier layer
that _might_ notice a defect no gate encodes is empty today. For this command-only increment the
feature-specific correctness signal is thin by nature: the new stage's own behavior (gate discovery, the
file-addressable-vs-whole-repo binning, the config-touch skip) lives in **advisory command prose** and is
**untested by construction** — only the reused `check-regress.mjs` / `check-plan-spec-agree.mjs` (with their
committed test suites) are floor-grade. "Verified" here means the whole repo is green with this command
present, and the reused floor mechanisms it invokes are tested — **not** that the command's prose logic is
proven. That is `/pharn-dev-review` (advisory) + human review.
