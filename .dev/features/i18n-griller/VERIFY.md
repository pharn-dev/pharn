# VERIFY — i18n-griller (two layers, kept separate)

## FLOOR layer (owns the verdict — `.dev/floor/check-verify.mjs`, exit-code threshold)

Every deterministic gate re-run at HEAD (repo-with-the-feature-in-it):

| gate           | exit | meaning                                                     |
| -------------- | ---- | ----------------------------------------------------------- |
| `test`         | 0    | `npm test` — 218/218 (incl. the feature's own scanner test) |
| `validate`     | 0    | `.dev/floor/validate.mjs .` — GREEN, 12 capabilities        |
| `lint`         | 0    | `eslint .` clean                                            |
| `format:check` | 0    | `prettier --check .` clean                                  |
| `lint:md`      | 0    | `markdownlint-cli2` clean                                   |

These five are exactly the repo's `npm run check` aggregate, so this verdict tracks the full `npm run check`
(L9 style-gate coverage — the increment's own markdown/style is caught here). The feature ships **no committed
eval-actual pair** (its evals ship `expected/*.json` but no committed `findings.json` — the live griller runner
is deferred, P7, as for every griller), so there is **no `structural:*` gate** — exactly as `/pharn-dev-regress`
handles a feature with no committed actual.

**VERIFIED: floor gates PASS** — `verdict: "PASS"`, `failing_gates: []` (exit 0).

## ADVISORY layer (verifiers — annotate, never gate)

`.dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}`.

**No verifiers registered — floor gates only.** Step 2 is a no-op; the verdict is the floor gates alone. No
verifier is authored speculatively (P7); the plug-in slot stays empty until a real failure triggers the first
one.

## The verdict, stated plainly (P0)

**verified = the named gates passed** — this is **NOT** a guarantee of correctness beyond what those gates
check; verifier concerns (none today) would be advisory help, not assurance. A defect no test / eval / rule /
lint covers is invisible to this verdict. Whether the i18n griller is _good_ is the human's call at the
post-review gate — `/pharn-dev-verify` certifies only the gates it ran.
