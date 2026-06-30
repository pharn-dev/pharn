# VERIFY — pharn-spec

Did `pharn-spec` get built **correctly** — does it satisfy its own requirements? Answered in two
strictly-separated layers: a **FLOOR layer** that re-runs the existing deterministic gates and **owns**
the pass/fail verdict (`.dev/floor/check-verify.mjs`, an exit-code threshold), and an **ADVISORY** verifier
layer that only annotates. "verified" means **the named gates passed — full stop** (P0/fix #3).

## FLOOR layer — gates (exit codes)

| gate                          | exit | result |
| ----------------------------- | ---- | ------ |
| `test` (`npm test`, 128)      | 0    | PASS   |
| `validate` (whole-repo floor) | 0    | PASS   |
| `lint` (`eslint .`)           | 0    | PASS   |

- **No `structural:*` gate:** `pharn-spec` is a product command + a floor checker — it ships **no
  `evals/expected` ↔ `findings.json` pair** (a command is not a `role:`-bearing Capability), so there is no
  structural eval gate (exactly as the convention handles a feature with no eval pair).
- **Feature-specific correctness signal:** `pharn-spec`'s own suite `check-spec.test.mjs` (13 tests —
  required-section presence, the `Draft|Approved` enum, `spec_id` presence, the `Approved ⟹ spec_content_hash
== sha256(body)` pin, the `--hash`↔validate agreement, and the ★ "needle-in-intent-is-ignored" honesty
  test) is collected by the `test` gate.

**verdict (FLOOR):** `check-verify.mjs` exit **0** · `verdict: "PASS"` · `failing_gates: []`.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** `node .dev/floor/count-verifiers.mjs .` →
`{"registered":0,"verifiers":[]}` (deterministic frontmatter membership over `role: verifier`, never a prose
grep — P5). Step 2 is a no-op; the verdict is the floor gates alone. No verifier is authored speculatively
(P7) — the plug-in slot stays empty until a real one is triggered.

## Verdict

**VERIFIED: floor gates PASS** (`test` / `validate` / `lint` all exit 0; `verify-report.json` `verdict: "PASS"`).

_Honest residual (P0/P7):_ verified = the **named gates passed** — this is **NOT** a guarantee of correctness
beyond what those gates check. A defect no test/eval/rule/lint covers is invisible to the floor verdict, and
the verifier layer that might notice it is **advisory, not a guarantee** (and is empty today). Verifier
concerns, when they exist, are advisory help, never assurance. This stage certifies only the gates it ran —
it does **not** ensure the feature is correct.
