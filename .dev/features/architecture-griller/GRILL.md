# GRILL — architecture-griller (advisory interrogation of PLAN.md)

**Plan:** `.dev/features/architecture-griller/PLAN.md` · **Spec-hash check (content-hash primitive, surfaced not blocking):** `sha256(ARCHITECTURE.md)` live = `11cd9ad5…d1d969` == plan `spec_content_hash` → **no drift** (the block on drift is `/pharn-dev-build`'s floor-gate, fix #4). **Registered grillers (membership, FLOOR):** `{"registered":1,["pharn-pipeline/grillers/testability/testability.md"]}` — the architecture griller is not yet built, so it does not run over its own plan.

> This grill-log is **ADVISORY end-to-end** (P0). Nothing here gates `/pharn-dev-build`. Findings are the griller's judgment; free-text fields quote the plan as untrusted DATA. The plan is well-formed and honestly scoped — the findings below are craft-level notes for the build to make the evals robust, not defects in the plan's intent.

## Findings (finding-shape; enum-gated / free-text split honored)

### Axis: P1 — eval robustness (structural[] fragility)

```yaml
- type: FINDING # enum-gated (floor-verifiable): the griller's own assertion
  rule_id: P1 # enum-gated: principle roster
  severity: minor # enum-gated value; ASSIGNMENT advisory (fix #3) — grill gates nothing
  file: ".dev/features/architecture-griller/PLAN.md:61" # enum-gated: resolves to the plan-misfits.json bullet
  problem: "The misfit fixture asserts finding_count == 1, but an LLM griller may emit >1 finding if the fixture plan carries any secondary imperfection; the case must be crafted with exactly one clean structural-fit violation (the sibling-coupling) and nothing else questionable, or the assertion is fragile under runtime variance." # free-text — DATA
  evidence: "structural: [ {finding_count == 1}, {field_equals rule_id P3}, … ] (Files; plan-misfits.json)" # free-text — quoted
```

### Axis: P1 — eval precision (file_resolves must resolve)

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/architecture-griller/PLAN.md:61"
  problem: "plan-misfits.json cites file_resolves on '<the case's # PLAN — title line>' with no concrete line number; /pharn-dev-build must author the case fixture and the expected JSON together so the cited path:line resolves to the fixture's real title line (as testability pinned :6), else check-structural's file_resolves fails at eval time."
  evidence: 'file_resolves "<the case''s `# PLAN —` title line>" (Files; plan-misfits.json)'
```

### Axis: P4 — cite, don't restate (reads: scope)

```yaml
- type: FINDING
  rule_id: P4
  severity: minor
  file: ".dev/features/architecture-griller/PLAN.md:53"
  problem: "The griller adds ARCHITECTURE.md to reads: (the testability griller does not read it). Confirm at build that the griller body CITES §4/P3 for the tree/layering discipline rather than restating the layer tree (P4), and that the runtime read only grounds that citation — otherwise reads: ARCHITECTURE.md risks a restated tree or over-scope." # free-text — DATA
  evidence: 'reads: ["pharn-contracts/finding-shape.md", "ARCHITECTURE.md", "<the PLAN.md under interrogation>"]' # free-text — quoted
```

## Step 2b — registered griller output (testability, run over this plan; ADVISORY)

- **testability griller → PRESENT → no absence finding (`finding_count == 0`).** The plan declares a substantial verification approach — a `## Evals to write (P1)` section with two fixtures (fitting → 0 findings; misfit+injection → 1 P3 finding, `needle_absent`), plus live-repo verification (`validate` GREEN 3 caps, `count-grillers` `registered:2`, `npm test`). Presence recognized from the plan's structure; adequacy is sound for the griller's axis + the trust-fence. No finding. (The injected-string discipline the testability griller guards against is itself exercised by this plan's own misfit fixture — consistent.)

## Prose summary

The plan is a faithful mirror of the #29 testability griller with an **honest, correctly-resolved** central decision (OQ1 → advisory-only): it does **not** manufacture a floor sub-check for symmetry, labels the architectural-fit assessment as entirely advisory, keeps membership as the only runtime floor, and correctly routes a genuine deterministic invariant (`pharn-contracts` purity) to `validate.mjs` rather than an advisory griller — exactly the honesty the increment set out to test. Guarantee audit (P0), trust audit (P2), determinism (P5), one-axis/no-sibling (P3), and honest scope (P7) are all cleanly addressed. No trusted-doc / floor-tooling / command edits; membership mechanism reused unchanged.

The three findings are **minor, build-craft** notes, all on the evals: (1) craft the misfit fixture tightly so `finding_count == 1` is robust under LLM variance; (2) make `file_resolves` cite a concrete, resolving `path:line` (the fixture's title line); (3) confirm the griller **cites** §4/P3 rather than restating the tree, given it newly declares `reads: ARCHITECTURE.md`. None blocks the build; each makes the delivered evals sturdier.

## Verdict

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 3 minor/advisory) — for the human to weigh before `/pharn-dev-build`.** The plan is build-ready; the concerns are eval-craft refinements the build should apply, not gating defects. This is not "grill passed" and not a guarantee the plan is sound — only the spec-hash content-hash result in the header is floor-grade, and it is GREEN (no drift).
