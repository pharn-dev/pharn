# VERIFY — security-griller

**Verdict source:** `.dev/floor/check-verify.mjs` (deterministic exit-code threshold — PASS iff every gate
exit 0). Run once at HEAD (the repo with the security griller in it).

## FLOOR layer — the deterministic gates (these OWN the verdict)

| gate           | exit | what it checks                                                                    |
| -------------- | ---- | --------------------------------------------------------------------------------- |
| `test`         | 0    | the whole hermetic suite (incl. the scanner's 9 new `scan-plan-secrets.test.mjs`) |
| `validate`     | 0    | the structural floor — GREEN, **4 capabilities** (trust-fence + 3 grillers)       |
| `lint`         | 0    | eslint clean (whole-repo)                                                         |
| `format:check` | 0    | prettier clean (whole-repo)                                                       |
| `lint:md`      | 0    | markdownlint clean (whole-repo)                                                   |

- **No `structural:<expected>` gate:** the security griller ships expected eval fixtures but **no
  committed actual `findings.json`** (the live griller runner is deferred P7, exactly as for the
  testability / architecture grillers), so it contributes no `structural:*` pair — absent from the map,
  as `/pharn-dev-verify` prescribes. The griller's fixtures are still bound structurally at eval time by
  `check-structural.mjs`; that binding is exercised when a runner emits an actual, not at this stage.
- The scanner's own determinism/injection-immunity is proven by its 9 hermetic tests, collected by
  `test` above.

**VERIFIED: floor gates PASS.**

## ADVISORY layer — verifiers

`node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — **no verifiers registered
— floor gates only.** Step 2 is a no-op; the verdict is the floor gates alone. No verifier was authored
speculatively (P7). `verifiers: { registered: 0, findings: [] }`.

## Honest residual (P0/P7)

**Verified = the named gates passed; this is NOT a guarantee of correctness beyond what those gates
check** — a defect no test / eval / rule / lint covers is invisible to this verdict, and the verifier
layer that might notice it is advisory, not a guarantee. In particular, `/pharn-dev-verify` did **not** verify
the griller's _runtime_ behavior over a novel plan (no live griller runner yet) — only that the suite,
the structural floor, and the style gates are green with the feature present. "The named gates passed,"
never "the feature is correct." The verdict is the `check-verify.mjs` threshold; this render gates
nothing.
