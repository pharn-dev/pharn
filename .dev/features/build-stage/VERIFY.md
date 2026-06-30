# VERIFY — build-stage (`/pharn-dev-verify` of the `/pharn-build` increment)

- **Feature:** `build-stage` — the product `/pharn-build` command (`.claude/commands/pharn-build.md`) + one fail-closed test (`.claude/hooks/set-writes-scope.test.cjs`).
- **Layers (P0 / fix #3):** the **FLOOR layer** (the deterministic gates below) OWNS the verdict; the **ADVISORY layer** (verifiers) only annotates. Zero verifiers are registered, so the verdict is the floor gates alone.

## FLOOR layer — deterministic gates (gate → exit code)

| gate                     | exit | notes                                                                                         |
| ------------------------ | ---- | --------------------------------------------------------------------------------------------- |
| `test`                   | 0    | canonical `npm test` full-glob suite — 163 green                                              |
| `validate`               | 0    | `node .dev/floor/validate.mjs .` — GREEN, 1 capability (unchanged; command dir floor-ignored) |
| `lint`                   | 0    | `eslint .` clean                                                                              |
| `format:check`           | 0    | `prettier --check .` clean                                                                    |
| `lint:md`                | 0    | `markdownlint-cli2` clean                                                                     |
| `structural:trust-fence` | 0    | `check-structural` over the one committed eval pair (trust-fence) holds                       |

**VERIFIED: floor gates PASS** (`.dev/floor/check-verify.mjs` → `verdict: "PASS"`, `failing_gates: []`, exit 0). The verdict reads only these gate exit codes (ints) — a deterministic threshold (`every gate === 0`), never model judgment.

> **Honest note on the `test` gate.** The canonical project gate is `npm test` (the full glob), which is **green / exit 0** (verified live, before and after the build). A pre-existing flake exists where _partial_ `node --test` file sets exit 1 (all subtests pass) due to a stale committed root-level `floor/check-ship.*` duplicate racing with `.dev/floor/check-ship.*` — `/pharn-dev-regress` flagged it as a cleanup follow-up. `/pharn-dev-verify` correctly uses the canonical `npm test`, which is unaffected.

## ADVISORY layer — verifiers

**No verifiers registered — floor gates only.** `node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` (deterministic frontmatter membership over `role: verifier`, never a prose grep — P5). Step 2 is a no-op; the verdict is the floor gates alone. No verifier was authored speculatively (P7).

## Verdict (FLOOR — `.dev/floor/check-verify.mjs`, exit 0)

**VERIFIED: floor gates PASS.**

**Honest residual (P0/P7):** "verified" = the named deterministic gates passed — **nothing more**. It is **not** a guarantee that `/pharn-build` is correct beyond what those gates check (no test/eval/rule/lint covers the command's _semantic_ behavior — `/pharn-build` is a floor-ignored markdown command, so `validate` does not inspect its content; its real exercise is a future live product-chain dogfood, gated on the `plan-files-scope` follow-up — see GRILL.md / PLAN.md). Verifier concerns would be advisory help, not assurance — and there are none today. The orchestration (running the gates, assembling the map) is advisory; only the exit-code **comparison** is the guarantee. "`/pharn-dev-verify` produced a PASS" never means "the feature is correct" (P0).
