# VERIFY — verify-stage (`/pharn-verify` product command)

**Feature:** `verify-stage` — the just-built `/pharn-verify` product command
(`.claude/commands/pharn-verify.md`). **The built increment is `trust: untrusted`**; the verdict below
consumes only gate exit codes (ints) and file paths — never any free-text (P2).

## FLOOR layer — the deterministic gates (they OWN the verdict)

| gate                                         | exit | source                                                   |
| -------------------------------------------- | :--: | -------------------------------------------------------- |
| `test`                                       |  0   | `npm test` — the hermetic suite (167 pass)               |
| `validate`                                   |  0   | `.dev/floor/validate.mjs .` — GREEN, 1 capability        |
| `lint`                                       |  0   | `npm run lint` — eslint clean                            |
| `format:check`                               |  0   | `npm run format:check` — prettier clean (whole-repo, L9) |
| `lint:md`                                    |  0   | `npm run lint:md` — markdownlint clean (whole-repo, L9)  |
| `structural:expected-injection-comment.json` |  0   | `check-structural.mjs` over the trust-fence eval pair    |

- The `format:check` + `lint:md` + `lint` + `test` set is exactly the repo's `npm run check` aggregate, so
  the verdict tracks the full `npm run check` (L9 — cited, not restated, P4).
- The `structural:*` gate is the one committed eval pair the feature surface ships
  (`pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`). This increment added **no** new eval pair (it ships a
  floor-ignored command + audit scaffolding), so this pre-existing pair is the only `structural:*` gate.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** `.dev/floor/count-verifiers.mjs .` →
`{"registered":0,"verifiers":[]}` (deterministic frontmatter membership, never a prose grep — the #16
fix). Zero `role: verifier` capabilities exist today (P7 — the slot is defined, no occupant authored).
`verifiers: { registered: 0, findings: [] }`.

## Verdict

**VERIFIED: floor gates PASS** — `.dev/floor/check-verify.mjs .pharn/pharn-dev-verify/results.json
--feature verify-stage` → `verdict: "PASS"`, `failing_gates: []`, **exit 0**. Every named gate exited 0;
the verdict rests entirely on the helper comparing integers, never on model judgment, and **no verifier
finding can reach it** (its sole input is the gate→exit-code map).

**Honest residual (P0/P7):** verified = the named gates passed; this is **NOT** a guarantee of correctness
beyond what those gates check — a defect no test / eval / rule / lint covers is invisible to the floor
verdict, and the verifier layer that might notice it is advisory, not assurance. The gates ensure what
they check; `/pharn-dev-verify` does not certify the `/pharn-verify` command is well-designed or faithful
to intent (that is the human's call at the post-review gate).
