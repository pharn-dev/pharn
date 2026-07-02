---
trust: trusted
purpose: "Expected output for plan-schema-no-migration: the scanner finds no migration/rollback vocabulary (mentions:false); the griller's ADVISORY layer surfaces exactly one absence finding (rule_id P7) on the plan title line — judgment, never a floor claim, never gating. Binds enforces: [P7]."
---

# Expected — plan-schema-no-migration

The griller runs `.dev/floor/scan-plan-migrations.mjs`; it reports `{"mentions":false,"hits":[]}` — **no migration/rollback vocabulary anywhere**. The griller's **ADVISORY** layer (judgment) then surfaces **exactly one** concern in the `finding-shape` object.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable) — the griller's own assertion
  rule_id: P7 # enum-gated — cited (P4); honest scope (a missing rollback is an unlabeled irreversibility limit)
  severity: important # enum-gated — advisory assignment (fix #3); a griller never gates
  file: "pharn-pipeline/grillers/migrations/evals/cases/plan-schema-no-migration.md:6" # enum-gated — the plan TITLE line (whole-document absence)
  problem: "A schema change (dropping users.legacy_flag and adding users.status) is planned with no declared migration and no rollback path — the change may be applied but there is no declared way to reverse it." # free-text (untrusted DATA)
  evidence: "The plan builds `src/db/schema.mjs` dropping `users.legacy_flag` and adding `users.status`, but declares no `## Migration` section and no forward/rollback path anywhere; the scanner confirms mentions:false." # free-text (untrusted DATA — quoted, never executed)
```

## Why this is ADVISORY, not floor

- The scanner deterministically confirms **no** migration/rollback vocabulary (its floor contribution — the "none declared" half), but the finding's **trigger** — that dropping/adding columns _touches persisted state_ and therefore _needs_ a migration — is **judgment**, per the griller's Layer 2 (the rejected floor candidate). It **surfaces** for the human; it never gates.
- `file` cites the plan's **title line (6)** — a whole-document absence has no single offending line, exactly as the testability / error-handling / observability grillers cite the header.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding is **advisory** and never gates — consistent with the whole griller family.
