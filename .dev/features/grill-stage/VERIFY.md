# VERIFY — grill-stage

The FLOOR layer owns the verdict; the ADVISORY (verifier) layer is empty today and annotates nothing.

## FLOOR layer — deterministic gates (the verdict)

| gate                                                                            | exit | result |
| ------------------------------------------------------------------------------- | ---- | ------ |
| `test` (`npm test` — 162 tests, incl. the 11 new `check-plan-spec-agree` cases) | 0    | PASS   |
| `validate` (`node .dev/floor/validate.mjs .` — GREEN, 1 capability)             | 0    | PASS   |
| `lint` (`npm run lint` — eslint)                                                | 0    | PASS   |
| `format:check` (`npm run format:check` — prettier)                              | 0    | PASS   |
| `lint:md` (`npm run lint:md` — markdownlint)                                    | 0    | PASS   |
| `structural:expected-injection-comment.json` (trust-fence eval pair)            | 0    | PASS   |

**VERIFIED: floor gates PASS** (`check-verify.mjs` verdict `PASS`, exit 0 — every gate exit 0, `failing_gates: []`).

> **Note on the style gates (transparency).** The build's first emission did not pass `format:check` / `lint:md`; the offenders were **only this increment's own new files** (the command, the checker + test, and the pipeline artifacts) — never any pre-existing file. They were brought to green with the deterministic formatters (`prettier --write`, `markdownlint-cli2 --fix`, plus a manual `MD028` blockquote merge in `pharn-grill.md`) — formatting only, no behavior change, entirely within the increment's footprint. The table above is the re-run, all green.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** `node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` (deterministic frontmatter membership, P5 — never a prose grep). Step 2 is a no-op; the verifier plug-in slot stays empty by design (P7 — no verifier authored speculatively). `verifiers: { registered: 0, findings: [] }`.

## Honest residual (P0/P7)

Verified = the named gates passed; this is **NOT** a guarantee of correctness beyond what those gates check. A defect no test / eval / rule / lint covers is invisible to this verdict, and the verifier layer that might notice it is advisory (and empty today). Verifier concerns would be advisory help, not assurance. `/pharn-dev-verify` certifies only the gates it ran.
