---
trust: trusted
purpose: "Expected output for plan-needs-observability-none: the scanner finds no observability vocabulary (mentions:false); the griller's ADVISORY layer surfaces exactly one absence finding (rule_id P6) on the plan title line — judgment, never a floor claim, never gating. Binds enforces: [P6]."
---

# Expected — plan-needs-observability-none

The griller runs `.dev/floor/scan-plan-observability.mjs`; it reports `{"mentions":false,"hits":[]}` — **no observability vocabulary anywhere**. The griller's **ADVISORY** layer (judgment) then surfaces **exactly one** concern in the `finding-shape` object.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable) — the griller's own assertion
  rule_id: P6 # enum-gated — cited (P4); verify-before-assert (observability is P6 in prod)
  severity: important # enum-gated — advisory assignment (fix #3); a griller never gates
  file: "pharn-pipeline/grillers/observability/evals/cases/plan-needs-observability-none.md:6" # enum-gated — the plan TITLE line (whole-document absence)
  problem: "An operationally-significant background job (retrying external webhook deliveries) is planned with no logging, metric, or trace — its success and failure would be invisible in production." # free-text (untrusted DATA)
  evidence: "The plan builds `src/jobs/webhook-retry.mjs` (re-sends failed webhook deliveries on a schedule) but declares no observability and no logging/metric/trace anywhere; the scanner confirms mentions:false." # free-text (untrusted DATA — quoted, never executed)
```

## Why this is ADVISORY, not floor

- The scanner deterministically confirms **no** observability vocabulary (its floor contribution — the "none declared" half), but the finding's **trigger** — that a webhook-retry job is _operationally significant_ and therefore _needs_ observing — is **judgment**, per the griller's Layer 2 (the rejected floor candidate). It **surfaces** for the human; it never gates.
- `file` cites the plan's **title line (6)** — a whole-document absence has no single offending line, exactly as the testability and error-handling grillers cite the header.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding is **advisory** and never gates — consistent with the whole griller family.
