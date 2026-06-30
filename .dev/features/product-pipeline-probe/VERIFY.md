# VERIFY — product-pipeline-probe

**Feature verified:** `product-pipeline-probe` (the dev increment wrapping the product-pipeline probe).

## FLOOR layer — the deterministic gates (own the verdict)

| gate                                                                                   | exit | green? |
| -------------------------------------------------------------------------------------- | ---- | ------ |
| `test` (`npm test`, 165 suites)                                                        | 0    | ✅     |
| `validate` (`.dev/floor/validate.mjs .`)                                               | 0    | ✅     |
| `lint` (`eslint .`)                                                                    | 0    | ✅     |
| `format:check` (`prettier --check .`)                                                  | 0    | ✅     |
| `lint:md` (`markdownlint-cli2`)                                                        | 0    | ✅     |
| `structural:…/expected-injection-comment.json` (trust-fence eval ↔ committed findings) | 0    | ✅     |

**VERIFIED: floor gates PASS** (`.dev/floor/check-verify.mjs` → `verdict: "PASS"`, exit 0, `failing_gates: []`).

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only** (`.dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}`).
Step 2 was a no-op (membership → ∅); the verdict is the floor gates alone (P7 — no verifier authored speculatively).

## Note on the G3 style-gate interaction (the verify-stage RED path the grill predicted)

`format:check` and `lint:md` are GREEN **now**, but they were **RED on the first attempt** — the probe's own
markdown artifacts (the product `GRILL.md` and the dev `PLAN`/`GRILL`/`PROBE`/`REGRESSION`/`regression-report`)
were not prettier/markdownlint-clean (notably **MD060 table-column-style** on the hand-off-matrix tables). They
were formatted (`prettier --write` over the probe's own files) to conform, and both gates then passed. This is
the **second RED path** the grill flagged (G3) — confirmed live, then resolved as normal dev hygiene. It is a
real product↔floor interaction: any pipeline artifact on the scanned surface must satisfy the repo's style gates
at verify, not just the structural floor. (Candidate for a separate increment — e.g. have the `pharn-*` commands
emit prettier-clean markdown, or exclude pipeline artifacts from the style globs, mirroring CF-A's choice for
`validate`.)

---

_verified = the named gates passed; this is NOT a guarantee of correctness beyond what those gates check —
verifier concerns are advisory help, not assurance (and there are none today). The probe's substantive findings
(CF-A/B/C/E + G3) live in `PROBE.md`, not here; `/pharn-dev-verify` certifies only that the listed gates ran green._
