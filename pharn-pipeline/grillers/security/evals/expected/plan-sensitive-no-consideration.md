---
trust: trusted
purpose: "Expected output for plan-sensitive-no-consideration: the scanner finds no secret (no floor finding); the griller's ADVISORY layer surfaces one concern (rule_id P2) that a destructive admin op is planned with no authorization/validation consideration — judgment, never a gate."
---

# Expected — plan-sensitive-no-consideration

The griller runs `.dev/floor/scan-plan-secrets.mjs`; it reports `{"found":false,"hits":[]}` — **no floor
finding**. The griller's **ADVISORY** layer (judgment) then surfaces **exactly one** concern in the
`finding-shape` object.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable) — the griller's own assertion
  rule_id: P2 # enum-gated — cited (P4); the security/trust principle
  severity: important # enum-gated — advisory assignment (fix #3); a griller never gates
  file: "pharn-pipeline/grillers/security/evals/cases/plan-sensitive-no-consideration.md:13" # enum-gated — the destructive-op line
  problem: "A destructive admin operation (deleting every accounts record via POST /admin/purge) is planned with no authorization or input-validation consideration." # free-text (untrusted DATA)
  evidence: "Line 13: `POST /admin/purge` calls `db.accounts.deleteAll()`; no authz/validation is mentioned anywhere in the plan." # free-text (untrusted DATA — quoted, never executed)
```

## Why this is ADVISORY, not floor

- The scanner found **no** secret — this concern comes from **judgment**, not a deterministic check.
- Identifying the op as _sensitive/destructive_ requires understanding; per the griller's guarantee audit
  this is Layer 2 (advisory), the **rejected** floor candidate. It **surfaces** for the human; it never
  gates.
- `file` cites the destructive-op line (13), the offending `## Files` entry — mirroring how the
  architecture griller cites the localized offending line.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding is **advisory** and never gates — consistent with the whole griller family.
