# VERIFY — plan-stage (`/pharn-plan`)

**Question answered:** was `/pharn-plan` built **correctly** — does it satisfy its own requirements?
The verdict is **floor-grade** — `.dev/floor/check-verify.mjs` reduces the gate exit codes to PASS/FAIL by
an exit-code threshold; it is **not** a model judgment. The verifier layer is **advisory** and never
flips the verdict (fix #3).

## FLOOR layer — the deterministic gates (own the verdict)

| gate       | exit | meaning                                                                   |
| ---------- | ---- | ------------------------------------------------------------------------- |
| `test`     | 0    | the hermetic suite is green (incl. the feature's own 7 new checker tests) |
| `validate` | 0    | the structural floor is GREEN — `1 capabilities` (count unchanged)        |
| `lint`     | 0    | eslint clean over the new `.mjs`                                          |

**`VERIFIED: floor gates PASS`** — `check-verify.mjs` exit `0`, `"verdict": "PASS"`, `failing_gates: []`.

- **Gate set = `{test, validate, lint}`** (the established convention, matching `features/ship-gated/verify-report.json`).
  `plan-stage` ships **no** `evals/` pair (it is a command + a floor checker, not a `role:` Capability),
  so there is **no `structural:*` gate** — exactly as the convention handles a feature with no eval pair.
- **Why the whole-repo style gates (`format:check` / `lint:md`) are NOT in the verify gate set (honest, not dodged):**
  they are **whole-repo** and would flag the pipeline's **own in-flight audit artifacts** (this very
  `VERIFY.md`, `REGRESSION.md`, the `*.json` reports written _during_ the run), not the feature's code.
  The convention excludes them for that reason. The feature's **code** files _are_ style-clean and were
  verified so at build time: the full `npm run check` (`format:check` + `lint` + `lint:md` + `test`) ran
  **GREEN** over `pharn-plan.md` + `check-spec-approved.mjs` + its test (151 tests), and the audit
  artifacts are kept prettier/markdownlint-clean as they are written.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** Deterministic membership (`.dev/floor/count-verifiers.mjs .`
→ `{"registered":0,"verifiers":[]}`) over `role: verifier` frontmatter (never a prose grep, P5). Zero
verifiers exist today (P7 — none authored speculatively), so the advisory layer is a no-op and the
verdict is the floor gates alone. `verifiers: { registered: 0, findings: [] }`.

## Honest residual (P0/P7)

**Verified = the named gates passed; this is NOT a guarantee of correctness beyond what those gates
check** — a defect no test / eval / rule / lint covers is invisible to the floor verdict, and the
verifier layer that _might_ notice it is **advisory**, not a guarantee. Verifier concerns (none today)
are advisory help, not assurance. This certifies only the gates that ran — not that `/pharn-plan` is
correct in any sense the suite does not encode.
