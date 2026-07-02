# VERIFY — a11y-griller

- **Feature:** `a11y-griller` (the tenth griller, `pharn-pipeline/grillers/a11y/`).
- **Verdict (deterministic, `.dev/floor/check-verify.mjs`):** **`PASS`** — exit 0. Every floor gate exit 0.
- **Verifiers:** **none registered** (`.dev/floor/count-verifiers.mjs` → `{"registered":0}`) — floor gates
  only. Step 2 (advisory layer) is a no-op (P7: no verifier authored speculatively).

## FLOOR layer — the gates that own the verdict (whole-repo at HEAD)

| gate           | exit | meaning                                                             |
| -------------- | ---- | ------------------------------------------------------------------ |
| `test`         | 0    | `npm test` — 208/208 hermetic tests pass (incl. the floor suites)  |
| `validate`     | 0    | `.dev/floor/validate.mjs .` — FLOOR GREEN, 11 capabilities checked  |
| `lint`         | 0    | `npm run lint` — eslint clean                                       |
| `format:check` | 0    | `npm run format:check` — prettier clean (whole-repo)               |
| `lint:md`      | 0    | `npm run lint:md` — markdownlint clean (whole-repo)                |

No `structural:*` gate: the a11y feature ships `expected` fixtures but **no committed `actual`
`findings.json`** (the live griller runner is deferred, P7), so it contributes no committed eval **pair**
— exactly as the documentation-griller feature did. The feature's correctness signal here is the
whole-repo `validate` GREEN (which counts + structurally checks the new capability + its evals) plus the
style/test gates.

> **Capture note (honest — verify caught a build-completeness gap and it was fixed in-scope, not
> waived).** The **first** gate run reported `format:check` = 1 and `lint:md` = 1, both failing **only**
> on the feature's own new files (`pharn-pipeline/grillers/a11y/a11y.md`,
> `.dev/features/a11y-griller/GRILL.md`): prettier formatting + markdownlint `MD049` (emphasis should be
> `_underscore_`, the build emitted `*asterisk*`). These are mechanical, deterministic style gaps within
> the feature's declared scope — no defect to adjudicate. The repo's own formatter
> (`prettier --write`, which also normalizes emphasis to `_`, resolving `MD049`) was applied to those two
> files, and **all five gates were re-run**: the `PASS` above is the honestly **recomputed** verdict from
> real exit codes, not a waiver. `validate` stayed GREEN and the griller count stayed 10 (prettier did
> not touch frontmatter). This is exactly the L9 value of running the style gates at verify — an
> increment's own markdown style is caught here, not only at CI.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** When the first `role: verifier` capability lands it will
be discovered by frontmatter membership (P5) and its findings **appended as advisory** (never flipping
this verdict, fix #3). None exists today (P7).

## Verdict

**VERIFIED: floor gates PASS** (`test`, `validate`, `lint`, `format:check`, `lint:md` all exit 0).

Honest residual (P0/P7): **verified = the named gates passed** — this is **NOT** a guarantee of
correctness beyond what those gates check. The gates confirm the increment is structurally valid
(`validate`), hermetically test-green, and style-clean; they do **not** prove the a11y griller's *prose
judgment* is sound on a novel plan (that is the griller's own advisory nature, and the human's call at
the post-review gate). Verifier concerns would be advisory help, not assurance — and none are registered.
