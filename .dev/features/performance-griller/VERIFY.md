# VERIFY — performance-griller

- **Verdict (deterministic — `.dev/floor/check-verify.mjs`, exit 0):** `PASS` — every gate exit 0.
- Run once at HEAD (the repo with the feature in it); no detached worktree.

## FLOOR layer — the deterministic gates (own the verdict)

| gate         | exit | meaning                                                         |
| ------------ | ---- | --------------------------------------------------------------- |
| test         | 0    | `npm test` — the hermetic suite (floor + hook `*.test.*`) green |
| validate     | 0    | `.dev/floor/validate.mjs .` — GREEN, 8 capabilities checked     |
| lint         | 0    | `npm run lint` — eslint clean                                   |
| format:check | 0    | `npm run format:check` — prettier clean (whole-repo)            |
| lint:md      | 0    | `npm run lint:md` — markdownlint clean (whole-repo)             |

- **No `structural:*` gate:** the performance griller ships **expected-only** evals (the live griller
  runner is deferred, P7), so there is no committed `expected ↔ actual` pair for it — exactly as
  `/pharn-dev-regress` handles a feature that ships no eval-actual pair. The feature's correctness signal
  here is its inclusion in the whole-repo `validate` (frontmatter + evals present + `enforces: P7` ↔ eval
  binding, fix #6) plus the whole-repo `test` / style gates.
- **`VERIFIED: floor gates PASS.`**

> **Build-completion note (honest):** the first verify pass FAILed `format:check` + `lint:md` on trivial
> style nonconformance in the feature's own just-written files (6× MD049 emphasis-marker + 1× MD018
> heading-at-line-start + prettier table/emphasis normalization). These were mechanical fixes applied
> **within each file's already-authorized writes-scope** (no substantive change to the increment, no
> trusted-doc touch, no hook bypass — every fix went through the gated Edit tool after re-scoping). The
> re-run above is GREEN. Recorded here rather than hidden.

## ADVISORY layer — verifiers

`node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}`. **No verifiers registered —
floor gates only.** Step 2 is a no-op; the verdict is the floor gates alone (P7 — no verifier authored
speculatively).

## Honest residual (P0/P7)

`verified` = **the named gates passed** — nothing more. `/pharn-dev-verify` does **not** guarantee the
performance griller is "correct" in any sense the suite does not encode; a defect no test / eval / rule /
lint covers is invisible to this verdict, and the verifier layer that might notice it is advisory (and
empty today). Verifier concerns are advisory help, not assurance. This is **not** a judgment that the
increment is good — that is the human's call at the post-review gate.
