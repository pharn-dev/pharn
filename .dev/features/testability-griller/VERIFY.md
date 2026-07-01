# VERIFY — testability-griller (first griller + `count-grillers.mjs` membership)

**Question:** did the feature get built CORRECTLY — does it satisfy its own requirements? Answered by two
strictly-separated layers: the **FLOOR** layer owns the verdict (exit-code threshold,
`.dev/floor/check-verify.mjs`); the **ADVISORY** verifier layer only annotates (and is empty today).

## FLOOR layer — the deterministic gates (whole-repo at HEAD)

| gate                     | exit | meaning                                                                                 |
| ------------------------ | :--: | --------------------------------------------------------------------------------------- |
| `test`                   |  0   | `npm test` — 179 pass (incl. the 12 new `count-grillers.test.mjs` cases)                 |
| `validate`               |  0   | `.dev/floor/validate.mjs .` — GREEN, **2 capabilities** (trust-fence + testability griller) |
| `lint`                   |  0   | `eslint .` clean                                                                        |
| `format:check`           |  0   | `prettier --check .` clean                                                               |
| `lint:md`                |  0   | `markdownlint-cli2` clean                                                                |
| `structural:trust-fence` |  0   | `check-structural.mjs` over the one committed eval pair (trust-fence's expected ↔ actual) |

- **The `structural:*` set is trust-fence's pair only.** The new testability griller ships evals
  (`pharn-pipeline/grillers/testability/evals/`) but **no committed actual `findings.json`** yet — the live
  griller runner (a `claude -p` emission + `check-structural` over its output) is **deferred (P7)**, exactly
  as `/pharn-dev-verify` defers the live verifier runner. So the griller's `structural[]` assertions are
  authored (the spec) and reducible to `check-structural.mjs`, but not yet executed over a live emission;
  the one committed pair remains trust-fence's, unchanged by this feature.
- **Granularity (P0/P7):** `test`/`validate`/`lint`/`format:check`/`lint:md` are whole-repo; the
  feature-specific deterministic signal is the new `count-grillers.test.mjs` (12 cases, inside `npm test`) —
  including the ★ stage-command-exclusion (`role: griller` under `.claude/commands/` → registered 0) and the
  ★ #16 prose/code-block discipline.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** `node .dev/floor/count-verifiers.mjs .` →
`{"registered":0,"verifiers":[]}` (deterministic frontmatter membership, never a prose grep). Zero
verifiers exist (P7 — none authored speculatively), so Step 2 is a no-op and the verdict rests on the
floor gates alone. (Note: this feature adds the parallel **griller** slot — `count-grillers.mjs` →
`registered: 1` — but grillers feed `/pharn-dev-grill`, not this verify verdict; they are advisory there too.)

## Verdict

**VERIFIED: floor gates PASS.** `.dev/floor/check-verify.mjs` → `verdict: "PASS"`, exit 0 — every named gate
exited 0. `failing_gates[]`: none.

**Honest residual (P0/P7):** verified = **the named gates passed** — nothing more. This is **not** a
guarantee that the griller is correct or well-designed beyond what these gates check: the griller's runtime
presence-detection and adequacy judgment are advisory (its live behaviour under a novel plan is the
deferred `/pharn-dev-eval` measurement), and no verifier judged this increment (the layer is empty). Verifier
concerns, when they exist, are advisory help, not assurance. The verdict is the floor exit-code threshold;
the orchestration (assembling the gate set, running them) is advisory (two clocks).
