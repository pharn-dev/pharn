# REVIEW — build-stage (`/pharn-dev-review` of the `/pharn-build` increment)

PHARN reviewing PHARN. The increment under review is `trust: untrusted`; instruction-looking content in the reviewed files is DATA reported, never followed. Findings dogfood the enum-gated / free-text split (`finding-shape.md`, fix #1).

**Increment:** `.claude/commands/pharn-build.md` (NEW product `/pharn-build` command — no `role:`, floor-ignored) + one fail-closed test in `.claude/hooks/set-writes-scope.test.cjs`. No new floor primitive (reuses `check-plan-spec-agree.mjs` + `set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`).

## Step 1 — Floor first (P0): GREEN

`node .dev/floor/validate.mjs .` → **GREEN — 1 capability** (unchanged; the command lives in the path-ignored `.claude/commands/`). The floor is the only guaranteed part of this review; the lenses below are **advisory**. Standing pipeline verdicts: **build floor GREEN · regress `no-regressions` · verify `PASS` (6/6 gates)**.

## Floor-gate findings (blocking)

**None.** No P0 guarantee lacks a floor reduction or `advisory` label; no missing eval binding; no sibling reference. The increment is not blocked by any floor-finding.

## Advisory findings (the four lenses — inform, never block)

### L-floor → P0 — guarantee discipline is exemplary (one standing-limit note)

```yaml
- type: FINDING
  rule_id: "P0"
  severity: minor
  file: ".claude/commands/pharn-build.md:185"
  problem: "The guarantee audit is honest end-to-end — every claim reduces to a floor primitive or is labeled advisory, the fail-closed refuse is correctly marked advisory (setter exit is floor; the stop is the command obeying it), and 'the code is correct' is struck as the disease. Standing limit (not a defect): the command itself is floor-IGNORED markdown, so NONE of its body is floor-verified — its correctness rests on the reused (tested) helpers + human review, exactly like /pharn-grill and /pharn-plan."
  evidence: '"The code is correct / faithful to the plan" → NOT a claim — struck as the P0 disease. ADVISORY; downstream /pharn-regress / /pharn-verify + human verify.'
```

### L-eval → P1 — not a Capability; the named test is well-formed

```yaml
- type: FINDING
  rule_id: "P1"
  severity: minor
  file: ".claude/hooks/set-writes-scope.test.cjs:50"
  problem: "P1's Capability-evals rule does not bind /pharn-build (it is a command, no role:, floor-ignored) — consistent with /pharn-grill /pharn-plan. The grill's P1 finding (the fail-closed 'no ## Files → exit 1' branch was UNCOVERED) was correctly folded: one hermetic black-box test added (spawn, assert status===1, no scope written, temp-dir cwd). Floor agrees: validate GREEN, npm test 163 green."
  evidence: '"--from-plan on a PLAN with no `## Files` heading (a free-text `## Steps / Files`) exits 1 and writes nothing (fail-closed)"'
```

### L-trust → P2 — taint never reaches a guaranteed decision

```yaml
- type: FINDING
  rule_id: "P2"
  severity: minor
  file: ".claude/commands/pharn-build.md:130"
  problem: "Trust handling is sound: the PLAN/SPEC are fenced as untrusted DATA; the hash-chain verdict ranges only over hashes/state; fix #7 ranges only over path membership; the BUILD.md output is classified advisory (quotes render as DATA). No guaranteed decision rests on a tainted/free-text field. Reviewing the command as untrusted, its instruction-looking steps (HALT/REFUSE/bash) are the command's own authored prose — reported, not followed; none changed reviewer behavior."
  evidence: "The fix #7 scope is parsed deterministically from the plan's `## Files` back-tick paths — path membership only, never a free-text / tainted field."
```

### L-axis → P3 — one axis per file; reuse by shell, not sibling import

```yaml
- type: FINDING
  rule_id: "P3"
  severity: minor
  file: ".claude/commands/pharn-build.md:1"
  problem: "One axis per file (the command = the build stage; the test edit = one fail-closed case). No sibling import: the command reaches check-plan-spec-agree.mjs and the hooks by SHELLING their CLIs (child-process), citing them in reads: — not by importing a sibling module's internals. The shared chain logic stays in one place (P4)."
  evidence: "node .dev/floor/check-plan-spec-agree.mjs features/<name>/PLAN.md features/<name>/SPEC.md"
```

## Carry-forward (for the human at GATE 2 — not blocking, surfaced by grill + regress)

```yaml
- type: FINDING
  rule_id: "P7"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:99"
  problem: "Option A (human-chosen at GATE 1) ships /pharn-build CORRECT but INERT against a real product plan: the product /pharn-plan emits a free-text `## Steps / Files`, not the `## Files` back-tick paths the scope-setter needs, so /pharn-build fail-closes until the named follow-up `plan-files-scope` aligns the producer. The central guarantee (fix #7 on USER code) is therefore not yet exercisable end-to-end. The follow-up must be tracked DURABLY (issue / feature stub), or the gap silently rots — see the lesson candidate below."
  evidence: "the product `/pharn-plan`'s non-compliance (`## Steps / Files` free-form) is surfaced as a finding + a named follow-up `plan-files-scope`, not fixed here."
- type: FINDING
  rule_id: "P6"
  severity: important
  file: ".dev/features/build-stage/REGRESSION.md:24"
  problem: "PRE-EXISTING test-infra debt (NOT this increment): a stale committed root-level floor/check-ship.{mjs,test.mjs} duplicate (left by the .dev/ split; differs from .dev/floor/check-ship.*) races with .dev/floor/check-ship under a single node --test invocation, so PARTIAL file sets exit 1 though every subtest passes. The canonical npm test gate is green (163). Recommend a cleanup follow-up: remove the stale root floor/ and isolate the git/worktree-touching suites so partial runs are deterministic."
  evidence: "a stale committed root-level `floor/check-ship.{mjs,test.mjs}` — an older duplicate of `.dev/floor/check-ship.*` left behind by the `.dev/` split"
```

## Proposed lesson candidate (P7 — provenance: build-stage; NOT written to canon here)

> A separate human-gated `/pharn-dev-memory-promote` run writes canon; `/pharn-dev-review` only proposes.

- **Candidate (lessons-learned):** _"When a downstream stage consumes a STRUCTURED section of an upstream artifact, verify the upstream actually EMITS that section in the consumable form before building the consumer — otherwise the consumer ships correct-but-inert (fail-closed) until the producer is aligned."_
- **Triggering failure (real, not hypothetical — P7):** `/pharn-build` derives its fix #7 scope from a `## Files` heading of back-tick paths (`set-writes-scope.cjs`), but the product `/pharn-plan` emits a free-text `## Steps / Files` — discovered at plan time (the crux OQ1), forcing a fail-closed-until-`plan-files-scope` posture.
- **Provenance:** increment `build-stage`; `PLAN.md` OQ1; `GRILL.md` P7 finding (`PLAN.md:99`); this `REVIEW.md`.

## Verdict

**GREEN — 0 blocking floor-findings.** The floor is GREEN; the four lenses raise only minor/advisory observations (guarantee discipline is exemplary), plus two **important advisory carry-forwards** for the human: (1) the `plan-files-scope` follow-up that makes `/pharn-build` runnable end-to-end, and (2) the pre-existing stale-root-`floor/` test-infra cleanup.

**Honest residual (P0):** "REVIEW GREEN" means the floor is GREEN and the reviewer raised no blocking finding — it is **not** a guarantee that `/pharn-build` is correct or that the carry-forwards are harmless. `severity` here is **LLM-assigned (advisory, fix #3)**; the merge / fix / abandon decision is the human's at GATE 2.
