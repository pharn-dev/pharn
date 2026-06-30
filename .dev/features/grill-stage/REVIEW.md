# REVIEW — grill-stage (`/pharn-grill` + `check-plan-spec-agree.mjs`)

Increment reviewed (as `trust: untrusted`): `.claude/commands/pharn-grill.md`, `.dev/floor/check-plan-spec-agree.mjs`, `.dev/floor/check-plan-spec-agree.test.mjs`.

## Step 1 — Floor first (P0)

`node .dev/floor/validate.mjs .` → **GREEN — 1 capability** (exit 0). The increment legitimately reached review. Floor is the only guaranteed part of this review; everything below is **advisory**.

## The four lenses

### L-floor → P0 — clean (no floor-gate finding)

Every guarantee the increment claims reduces to a floor primitive or is labeled `advisory`:

- the chain re-verification → content-hash equality (`planHash == sha256(SPEC body)`, primitive #2) + enum (`state == Approved`, primitive #3), in `check-plan-spec-agree.mjs`;
- the RED stop → the checker's exit code (enum/equality, primitive #3);
- the interrogation → explicitly **advisory**, "never gates";
- "produced a GRILL.md ≠ the plan is good" → explicitly struck as the P0 disease;
- writes-scope → hook (fix #7).

No guarantee is left unlabeled. The two-clocks split (verdict = floor; the act of invoking = advisory orchestration) is stated, mirroring `/pharn-plan`.

### L-eval → P1 — clean

`/pharn-grill` is a **command** (no `role:`), not a Capability → no `evals/` required (the floor count stays 1, confirming it is path-ignored). It declares no `enforces`, so there is no `rule_id`↔eval binding to satisfy. The floor code `check-plan-spec-agree.mjs` ships its test suite (`check-plan-spec-agree.test.mjs`, 11 cases): GREEN chain, stale-plan RED, Draft/drift propagated RED, three fail-closed REDs, three ★ injection tests (both directions + SPEC-side), and usage. Floor and this lens agree.

### L-trust → P2 — clean

The chain verdict ranges **only** over the gate exit code + two 64-hex digests; `planHash` is regex-gated to `HASH_RE` **before** the compare, so a needle in the carried field is rejected as not-a-hash — the ★ tests prove a needle in PLAN/SPEC prose does not move the verdict. The interrogation's free-text (`problem`/`evidence`) inherits the untrusted tag and is quoted DATA; no guaranteed decision rests on it. No instruction-looking content in the reviewed files (incl. the `SYSTEM OVERRIDE` needles in the test fixtures) altered this review — they are reported as data, never followed.

### L-axis → P3 — clean

One axis per file: the command = the grill stage's orchestration; the checker = the chain verdict; the test = the checker's tests. `check-plan-spec-agree.mjs` imports only Node stdlib (`fs`, `child_process`, `url`, `path`) and reaches the existing gates by **`spawnSync` CLI shelling**, never a sibling `import` (P3-clean — the same separation `check-spec-approved` uses). The command's `reads:`/shelling of `.dev/floor/*` mirrors the established `/pharn-plan` pattern (a product command invoking a floor checker), not a leaf→leaf module import.

## Findings — advisory only (no floor-gate / blocking findings)

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: ".claude/commands/pharn-grill.md:13"
  problem: "The product command's floor nature reduces to .dev/floor/check-plan-spec-agree.mjs, but packaging is 'root minus .dev/' (CLAUDE.md) — a shipped product would carry /pharn-grill WITHOUT its checker, so the floor guarantee's mechanism would be absent at a user's runtime. PRE-EXISTING across all product commands (/pharn-plan, /pharn-spec shell .dev/floor/ checkers too) — NOT introduced here and NOT blocking; surfaced for a future packaging increment to resolve (ship the floor checkers product-side, or relocate them)."
  evidence: 'reads: [ ... ".dev/floor/check-plan-spec-agree.mjs", ".dev/floor/check-spec-approved.mjs", ".dev/floor/check-spec.mjs" ]'

- type: FINDING
  rule_id: P0
  severity: minor
  file: ".claude/commands/pharn-grill.md:118"
  problem: "On a RED chain /pharn-grill HALTs and writes NO GRILL.md (the checker's stdout is the only record), while ARCHITECTURE.md §6 lists 'grill-log' as the grill stage's artifact. This mirrors /pharn-plan's halt-with-no-artifact-on-failed-gate precedent and is the approved design, but the human may wish to ratify it given audit-grade-ness is the product's core value. (Also raised in GRILL.md for the human.)"
  evidence: "RED / exit non-zero → HALT. Do not interrogate, do not write a GRILL.md."
```

## Gates (fix #3)

- **floor-gate (blocking):** **none.** `validate` GREEN; no missing eval binding; no sibling import; no unlabeled guarantee.
- **advisory-gate (warn):** the two findings above — both rest on judgment / architectural framing, neither is the sole basis for a guaranteed block. The packaging tension (important) is **pre-existing and repo-wide**; the RED-chain artifact choice (minor) is the approved design.

## Proposed lessons (P7 — none promoted)

No canon lesson is proposed. The build's first emission failing `format:check`/`lint:md` on its own new files (fixed in-stage with the deterministic formatters) is a **real** miss but a **single occurrence**, not yet a demonstrated recurring failure — promoting from it now would be speculative (P7). Recorded here so that, if it recurs in a future markdown-heavy increment, a `/pharn-dev-memory-promote` candidate has provenance ("run `prettier`/`markdownlint` on new files during `/pharn-dev-build`, before declaring done").

## Verdict

**GREEN — no floor-gate (blocking) findings.** Floor GREEN, regress `no-regressions`, verify `PASS`. Two advisory findings stand for the human at the post-review gate; neither blocks. This review certifies only the floor (validate GREEN) + the lens pass as **advisory** — it does not certify the increment is wise; that is the human's call.
