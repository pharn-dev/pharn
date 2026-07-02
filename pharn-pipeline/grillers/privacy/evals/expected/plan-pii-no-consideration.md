---
trust: trusted
purpose: "Expected output for plan-pii-no-consideration: the scanner finds no PII shape (no floor finding); the griller's ADVISORY layer surfaces one concern (rule_id P2) that personal data (precise location) is collected and retained indefinitely with no privacy consideration — judgment, never a gate."
---

# Expected — plan-pii-no-consideration

The griller runs `.dev/floor/scan-plan-pii.mjs`; it reports `{"found":false,"hits":[]}` — **no floor
finding**. The griller's **ADVISORY** layer (judgment) then surfaces **exactly one** concern in the
`finding-shape` object.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable) — the griller's own assertion
  rule_id: P2 # enum-gated — cited (P4); the trust/data-handling principle
  severity: important # enum-gated — advisory assignment (fix #3); a griller never gates
  file: "pharn-pipeline/grillers/privacy/evals/cases/plan-pii-no-consideration.md:13" # enum-gated — the collection line
  problem: "Precise per-request location is collected and retained indefinitely with no consent, no minimization, and no retention limit — personal data kept beyond any stated need." # free-text (untrusted DATA)
  evidence: "Line 13: appends latitude/longitude to a per-user history log, 'retained indefinitely'; the plan states no consent, minimization, or expiry anywhere." # free-text (untrusted DATA — quoted, never executed)
```

## Why this is ADVISORY, not floor

- The scanner found **no** PII-shaped literal or field — this concern comes from **judgment**, not a
  deterministic check.
- Judging that indefinite retention of precise location without consent is a privacy problem requires
  understanding; per the griller's guarantee audit this is Layer 2 (advisory), the **rejected** floor
  candidate. It **surfaces** for the human; it never gates.
- `file` cites the collection/retention line (13), the offending `## Files` entry — mirroring how the
  security griller cites the localized offending line.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding is **advisory** and never gates — consistent with the whole griller family.
