# GRILL — grill-stage (`/pharn-grill`) — ADVISORY

Plan interrogated: `.dev/features/grill-stage/PLAN.md`. **Spec-hash check (content-hash floor primitive, surfaced not blocking):** live `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` **==** the plan's carried `spec_content_hash` → **no drift**. (The actual drift _block_ is `/pharn-dev-build`'s floor-gate, not this grill — fix #3.)

This grill-log is **advisory end-to-end** (P0). Nothing here blocks `/pharn-dev-build`; every finding rests on model judgment and is for the human to weigh. The findings' free-text (`problem`, `evidence`) quotes the plan as **untrusted DATA** (P2), never an instruction.

## Findings

### Axis: Determinism / correctness (P5)

```yaml
- type: FINDING
  rule_id: P5
  severity: important
  file: ".dev/features/grill-stage/PLAN.md:29"
  problem: "The checker reads check-spec.mjs --hash stdout into specHash but the plan never says to .trim() it; check-spec.mjs prints `hash + \"\\n\"` (check-spec.mjs:111), so a raw compare planHash === specHash would see a trailing newline and yield a SPURIOUS RED on an agreeing chain."
  evidence: "(2) shell `check-spec.mjs --hash <SPEC.md>` → `specHash`, ... (4) `planHash === specHash` → GREEN (exit 0) else RED (exit 1)."
```

### Axis: Trust propagation (P2)

```yaml
- type: FINDING
  rule_id: P2
  severity: minor
  file: ".dev/features/grill-stage/PLAN.md:29"
  problem: "The plan says planHash is fail-closed 'if absent/malformed' but does not explicitly regex-gate it to 64-hex (HASH_RE) before the compare; making the gate explicit means a needle in the carried field is structurally rejected as not-a-hash, so the 'ranges only over hashes' P2 claim becomes literally true rather than merely fail-closed-by-inequality."
  evidence: "(3) parse PLAN frontmatter `spec_content_hash` → `planHash` (fail-closed if absent/malformed)"
```

### Axis: Guarantee-audit / audit-grade (P0)

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: ".dev/features/grill-stage/PLAN.md:73"
  problem: "On a RED chain /pharn-grill writes NO GRILL.md and halts with the checker's stdout as the only record; for an audit-grade pipeline the human should explicitly confirm whether the RED verdict ought to be persisted as an artifact, or whether halt-with-message (mirroring /pharn-plan's Approved-gate) is the intended, sufficient behavior."
  evidence: "It is written only when the chain check is GREEN ... On a RED chain /pharn-grill HALTs and writes no GRILL.md — it tells the user to re-plan / re-approve."
```

### Axis: Honest scope / no speculation (P7)

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/features/grill-stage/PLAN.md:16"
  problem: "The P7 trigger offered is a DOCUMENTED DEFERRED GAP (pharn-plan.md:166 deferred the re-verifier) plus the P0 'decorative pin' concern — not a demonstrated dogfood/eval failure; the framing is defensible (an unenforced pin is the P0 disease), but the human should confirm that a deferred-gap+P0 trigger meets P7's 'real failure' bar for this self-hosting build."
  evidence: '/pharn-plan''s own guarantee audit (pharn-plan.md:166) deferred this re-verifier to "a later stage, not built yet — P7"; this increment is that stage (a real need, not a hypothetical).'
```

### Axis: Eval coverage / anti-steering (P1)

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/grill-stage/PLAN.md:45"
  problem: "The ★ injection test is RED-stays-RED (a needle cannot FORCE a passing verdict); consider ALSO asserting GREEN-stays-GREEN with a needle present (a matching-hash case whose prose carries a needle still passes purely on the hashes), for symmetric proof that the needle neither forces nor suppresses the verdict."
  evidence: "★ injection: an instruction-looking needle in the PLAN prose ... in a case whose hashes disagree → verdict stays RED / exit 1"
```

## Prose summary

The plan is **sound in its core shape** and its floor/advisory split is honest: the two natures (advisory interrogation + a single floor chain-check), the guarantee audit, the trust audit, and the P3 factoring of the deterministic verdict into a separate `check-plan-spec-agree.mjs` are all in order, and the spec-hash chain shows no drift. The concerns are refinements, not rejections:

- **One concrete correctness risk worth fixing in build (P5, important):** `check-spec.mjs --hash` emits a trailing newline, so the checker must `.trim()` (and ideally 64-hex-validate) `specHash` before the equality compare, or an agreeing chain falsely REDs. Pair this with explicitly regex-gating `planHash` to 64-hex (P2, minor) so the carried field is structurally enum-gated.
- **One design choice for the human to ratify (P0, important):** no `GRILL.md` is persisted on a RED chain. It mirrors `/pharn-plan`'s halt-with-no-artifact precedent and is likely fine, but given that audit-grade-ness is the product's whole point, the human should confirm the RED record need not be persisted.
- **Two framing/coverage nudges (P7 minor, P1 minor):** confirm the deferred-gap P7 trigger, and consider a symmetric GREEN-with-needle ★ assertion.

None of these contradicts the approved intent; all are tractable inside the planned `## Files`.

ADVISORY VERDICT: 5 concerns raised (0 blocking-severity, 2 important, 3 minor) — for the human to weigh before /pharn-dev-build. This grill does NOT block; it surfaces concerns and does NOT certify the plan is good (P0).
