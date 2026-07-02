# GRILL — migrations-griller (advisory)

**Plan:** `.dev/features/migrations-griller/PLAN.md` · **Spec-hash check (content-hash floor primitive, surfaced not blocking):** `sha256(ARCHITECTURE.md)` == plan `spec_content_hash` = `11cd9ad5…d1d969` → **MATCH, no drift** (the block on drift is `/pharn-dev-build`'s floor-gate, fix #4). · **Registered grillers (membership FLOOR, `count-grillers.mjs .`):** 7 (architecture, error-handling, observability, performance, privacy, security, testability) — the migrations griller is not among them (it is what this plan builds), so the 7 were applied over this PLAN.

## Findings (all ADVISORY — `/pharn-dev-grill` gates nothing; fix #3)

### Axis: honest scope / no speculation (P7) — inline interrogation

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/features/migrations-griller/PLAN.md:84"
  problem: "The new floor primitive (scan-plan-migrations.mjs) is justified by the griller's own presence-detection claim (the observability precedent), not by an observed dogfood/eval failure; P7 prefers a real-failure trigger."
  evidence: '''New floor primitive, justified (P7). …added because this griller makes a "deterministically detects migration-vocabulary presence + line" claim.'' The scanner route was chosen at GATE 1 over the simpler membership-only (error-handling) route; confirm the deterministic hit-line evidence earns the new primitive rather than adopting a want.'
```

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/features/migrations-griller/PLAN.md:68"
  problem: "Fixture 3 (plan-unsafe-migration) takes the fixture count to 4, above the observability precedent's 3, which folded adequacy into the declared fixture's semantic[] judge rather than a separate 'inadequate' fixture."
  evidence: "'plan-unsafe-migration … migration declared but unsafe … one advisory finding on the offending … line.' Confirm this demonstrates a genuinely distinct behavior (declared-but-unsafe inadequacy, offending-line anchor) versus redundant P7 coverage — fixture 2 alone already binds enforces:[P7]."
```

### Axis: error-handling / determinism (P7 / P5) — from the error-handling griller applied inline

```yaml
- type: FINDING
  rule_id: P5
  severity: minor
  file: ".dev/features/migrations-griller/PLAN.md:67"
  problem: "For whole-document absence/needle findings the plan sets file = the plan's TITLE line, but does not state the griller's deterministic fallback when a plan under interrogation has no parseable `# PLAN — …` title line."
  evidence: '''file_resolves "<…:TITLE_LINE>"'' on the schema-no-migration and fake-injection fixtures. Specify at build a deterministic fallback (e.g. first content line) or the P5 terminal fallback (emit a finding and ask the human) so file always resolves; mirror how observability/error-handling anchor a whole-document absence.'
```

## Registered grillers applied over this PLAN (Step 2b — advisory, gate nothing)

- **security (P2)** — `scan-plan-secrets.mjs` over the plan → `found:false`; no secret-shaped literal. **No finding.**
- **privacy (P2)** — `scan-plan-pii.mjs` over the plan → `found:false`; no PII-shaped pattern. **No finding.**
- **testability (P1)** — the increment declares its verification: 4 committed evals (structural[]+semantic[]), a hermetic scanner test asserting exit codes, and reuse of `validate`/`count-grillers`. Strong. **No finding.**
- **architecture (P3)** — one axis per file (griller = the capability; scanner = its regex set; test = its tests), tree-shaped, scanner-in-`.dev/floor` invoked-not-imported by the pharn-pipeline griller (the observability pattern). **No finding.**
- **observability (P6)** — PHARN is a markdown methodology repo with no prod runtime; correctness is observable via the tests + floor. **No finding** (consistent with the observability griller not claiming PHARN-the-repo needs prod observability).
- **performance (P7)** — the scanner is a fixed regex set over plan lines (`O(lines × patterns)`); no scaling risk. **No finding.**
- **error-handling (P7)** — the scanner's fail-closed contract (missing/non-file → nonzero exit, empty stdout) and the griller's ask-the-human terminal fallback are declared; the one gap (title-line-absent `file` fallback) is filed above as the P5 finding.

## Summary

The plan is **strong and internally honest** — its stand-out move is **correcting the request**: it relabels the arg's "schema-touching plan with NO migration → _floor_ finding" as **advisory**, because both the trigger (touches-schema) is judgment **and** the presence half (`mentions:true`) is launderable — the exact observability reconciliation, not the error-handling disease. The guarantee audit reduces or labels every claim, the trust audit dogfoods fix #1 via the needle fixture, and the fix #7 writes-scope note correctly anticipates that the two `.dev/floor/scan-plan-migrations.*` paths must stay in `## Files` to be writable.

The three concerns are all **minor and non-blocking**: (1) the new floor primitive is a GATE-1-ratified _want_ (observability precedent) rather than a real-failure trigger — transparency, not a defect; (2) the 4th fixture exceeds the observability precedent's count — confirm it earns distinct coverage; (3) one concrete build-time gap — specify the deterministic `file` fallback when a plan has no parseable title line. None touches P0/P1/P2 soundness; none blocks `/pharn-dev-build`.

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 3 minor/advisory) — for the human to weigh before /pharn-dev-build. This is NOT "grill passed" and NOT a guarantee the plan is sound (P0); the deterministic backstops remain `/pharn-dev-build`'s floor-gates + `.dev/floor/validate.mjs`.**
