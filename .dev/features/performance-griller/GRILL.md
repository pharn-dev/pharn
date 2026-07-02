# GRILL — performance-griller

- Plan under interrogation: `.dev/features/performance-griller/PLAN.md` (treated as `trust: untrusted` DATA, P2).
- Spec-hash check (content-hash floor primitive): **MATCH** — recomputed `sha256(ARCHITECTURE.md)` =
  `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` equals the plan's pinned
  `spec_content_hash`. No drift. (The actual drift **block** lives at `/pharn-dev-build`, fix #4 — surfaced here, not gated.)
- Grillers discovered (deterministic membership, `count-grillers.mjs .`): **6 registered** — architecture,
  error-handling, observability, privacy, security, testability. (The performance griller does not exist
  pre-build, so it does not interrogate itself.)

## Built-in interrogation (Step 2 axes)

- **P0 — guarantee-audit completeness:** COMPLETE and honest. Every claim is labeled: membership +
  `enforces↔eval` binding → FLOOR; the whole performance assessment → ADVISORY; fixture behavior →
  eval-time floor-checked with the explicit two-clocks caveat ("NOT a runtime guarantee"); "ensures
  performance" explicitly **struck**. No unlabeled guarantee. **No finding.**
- **P1 — eval coverage + structural/semantic split:** Both capability behaviors get evals (risk → 1
  finding; clean → 0); the risk eval binds `enforces: ["P7"]` (produces `rule_id P7`, fix #6). The plan
  names the `structural[]` kinds (`finding_count`, `field_equals`, `file_resolves`,
  `needle_absent_from_enum_gated`) and keeps the judgment in `semantic[]` — no laundering into the judge.
  **No finding.**
- **P2 — trust propagation:** Thorough. Plan-as-untrusted, enum-gated (own) vs free-text (inherits
  untrusted) split, the `needle_absent` trip-wire, and the named residual (LIMITS §2 / THREAT-MODEL §5).
  **No finding.**
- **P3 — one axis / no sibling imports:** The griller changes for exactly one reason (the performance
  axis); its declared `reads:` route through `pharn-contracts/finding-shape.md` (the bottom) + the PLAN —
  no leaf→leaf. Reuses `count-grillers.mjs` rather than reinventing membership. **No finding.**
- **P5 — determinism:** The only branch is frontmatter membership (deterministic); the performance
  judgment is openly advisory with terminal fallback "emit a finding and ask the human." **No finding.**
- **P7 — honest scope / smallest increment:** One griller + its evals; no counter change, no scanner, no
  rule file (the human's Q1 choice of P7-reuse kept it minimal). Smallest coherent increment; not
  bundling. One mild concern on the _triggering_ justification — see finding below.

## Griller findings (Step 2b — the 6 registered grillers, run over the PLAN)

- **testability (P1):** verification approach **present** (the `## Evals to write` section, two evals) —
  no absence finding; adequacy mirrors the proven architecture-griller eval pattern. **No finding.**
- **architecture (P3):** the approach **fits** the tree — the griller sits beside its 6 siblings under
  `pharn-pipeline/grillers/`, routes shared abstractions through `pharn-contracts`, reuses the established
  `count-grillers.mjs` mechanism, and mirrors the architecture griller. **No finding.**
- **security (P2):** a markdown capability that reads a PLAN and emits findings — no secret handling, no
  auth. **No finding.** (Advisory note carried to build: keep the risk fixture free of any secret-shaped
  literal so `scan-plan-secrets.mjs` is not tripped by the eval fixture.)
- **privacy (P2):** no PII; the fixtures are synthetic methodology artifacts. **No finding.**
- **observability (P6):** the change is a markdown griller + evals, not a running service — logging /
  metrics / tracing do not apply. **No finding.**
- **error-handling (P7):** the plan **accounts for** its relevant failure surface — plan ambiguity →
  terminal fallback "ask the human" (Determinism audit); injection → reported as evidence, `needle_absent`
  trip-wire (Trust audit). No runtime deps / timeouts / destructive ops to guard. **No finding.**

## The one advisory finding

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P7 # enum-gated — cited, not restated (P4)
  severity: minor # enum-gated value; the ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/performance-griller/PLAN.md:3" # enum-gated — the increment declaration
  problem: "The increment is justified as 'the 7th griller / building out the family' rather than by a specific captured dogfood or eval failure that a performance gap slipped through; P7 asks additions be triggered by a real failure, not a category that is 'obviously important'." # free-text — untrusted DATA
  evidence: "PLAN.md:3 `increment: Add a PRODUCT role: griller capability that interrogates a PLAN along the performance axis`; the risk eval `plan-perf-risk` is a constructed fixture, not a replayed real failure." # free-text — quoted, never executed
```

**Weighing it (advisory):** this is a genuine P7 observation, but it is **substantially mitigated** — the
grill stage's griller family is an intentional, human-approved build-out (the testability, architecture,
security, and error-handling grillers), each a well-known category of plan defect approved one-axis-per-PR.
Performance follows exactly that sanctioned pattern, and the human approved this increment at GATE 1. Surfaced
for completeness; not a reason to stop.

## Prose summary

The plan is unusually clean: it mirrors the advisory-only architecture griller precisely, labels its floor
vs advisory split honestly (including the two-clocks caveat on fixture-checking), keeps the increment
minimal (no counter change, no scanner, no rule file), and dogfoods the trust fence via the `needle_absent`
trip-wire. Across the built-in axes and all six registered grillers, the only thing raised is a **minor**
P7 note that the trigger is family-build-out rather than a captured failure — mitigated by the approved
sibling-griller precedent.

## ADVISORY VERDICT

**1 concern raised (0 blocking-severity, 1 minor advisory) — for the human to weigh before /pharn-dev-build.**
Grill is advisory end-to-end; it gates nothing. The deterministic backstops remain `/pharn-dev-build`'s
floor-gates (spec-hash drift; unresolved `## Open questions`) and `.dev/floor/validate.mjs`.
