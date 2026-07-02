---
trust: trusted
purpose: "Expected output for plan-unsafe-migration: a migration + rollback ARE declared (scanner mentions:true), but the griller's ADVISORY safety judgment (the bulk of the axis) surfaces one finding (rule_id P7) on the offending forward-migration line — the drop is data-losing and the rollback does not restore the data. Judgment, never a floor claim, never gating."
---

# Expected — plan-unsafe-migration

The griller runs `.dev/floor/scan-plan-migrations.mjs`; it reports `{"mentions":true,...}` — a migration and a rollback **are** declared. The griller does **not** auto-suppress on that; its **ADVISORY safety judgment** (the bulk of the axis) recognizes the migration is **unsafe** and surfaces **exactly one** finding.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable) — the griller's own assertion
  rule_id: P7 # enum-gated — cited (P4); honest scope (an irreversible/data-losing change dressed as reversible)
  severity: important # enum-gated — advisory assignment (fix #3); a griller never gates
  file: "pharn-pipeline/grillers/migrations/evals/cases/plan-unsafe-migration.md:17" # enum-gated — the offending forward-migration line (DROP COLUMN email)
  problem: "The forward migration drops a populated `email` column with no backfill/archival (permanent data loss), and the declared rollback re-adds an EMPTY column that does not restore the dropped data — the change is irreversible despite declaring a rollback." # free-text (untrusted DATA)
  evidence: "`- forward migration: ALTER TABLE users DROP COLUMN email` with `rollback: … ADD COLUMN email TEXT` — the down path recreates the column shape but not its data; no archival/backfill is declared." # free-text (untrusted DATA — quoted, never executed)
```

## Why this is ADVISORY, not floor

- Both halves are **judgment**: recognizing the column is **populated** and that the rollback **fails to restore data** requires understanding, not a membership test. The presence of migration/rollback vocabulary (`mentions:true`) did **not** auto-suppress the concern — the griller judged the declared migration **inadequate**.
- `file` cites the **offending forward-migration line (17)** — an inadequacy has a specific offending line, unlike a whole-document absence (contrast `plan-schema-no-migration`, which cites the title line).

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding is **advisory** and never gates; "surfaced an unsafe migration" is not a guarantee that a suppressed one is safe.
