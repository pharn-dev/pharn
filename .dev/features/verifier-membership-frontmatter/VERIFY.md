# VERIFY — verifier-membership-frontmatter

`/verify` answers one question deterministically: **did the named floor gates pass with this increment in
the tree?** The verdict is owned by the FLOOR layer (`floor/check-verify.mjs`, an exit-code threshold); the
ADVISORY verifier layer only annotates and never flips it (fix #3, `ARCHITECTURE.md §7`). The built
increment is `trust: untrusted` (P2).

## Verdict

**VERIFIED: floor gates PASS** — every named gate exited 0 (`check-verify.mjs` exit 0).

## FLOOR layer — gates (exit code per gate)

| gate       | exit | check                                                                                       |
| ---------- | ---- | ------------------------------------------------------------------------------------------- |
| `test`     | 0    | `npm test` — hermetic suite incl. the feature's own `count-verifiers.test.mjs` (99/99 pass) |
| `validate` | 0    | `node floor/validate.mjs .` — structural floor (GREEN — 1 capability)                       |
| `lint`     | 0    | `npm run lint` — eslint clean                                                               |

**No `structural:*` gate.** This feature ships floor tooling only (`floor/count-verifiers.mjs` + its
`*.test.mjs` + a `verify.md` edit) — no Capability and no `evals/expected/*.json` ↔ `findings.json` pair,
so there is no structural eval gate to run (P7 — absent, not silently skipped). The feature's own
correctness signal is carried by `count-verifiers.test.mjs` inside the `test` gate.

## ADVISORY layer — verifiers

**no verifiers registered — floor gates only.** `node floor/count-verifiers.mjs .` →
`{"registered":0,"verifiers":[]}` (deterministic frontmatter membership, P5 — never a content grep). Step 2
is a no-op; the verdict is the floor gates alone. No verifier authored speculatively (P7).

## The honest residual (P0/P7)

verified = the named gates passed; this is **NOT** a guarantee of correctness beyond what those gates check
— verifier concerns are advisory help, not assurance. A defect no test / eval / lint / floor-check covers
is invisible to this verdict.

## Provenance

- feature: `verifier-membership-frontmatter`
- gates map: `.pharn/verify/results.json` → `{"test":0,"validate":0,"lint":0}`
- verdict: `floor/check-verify.mjs` exit 0 (PASS), stdout merged verbatim into `verify-report.json`
- run: 2026-06-29
