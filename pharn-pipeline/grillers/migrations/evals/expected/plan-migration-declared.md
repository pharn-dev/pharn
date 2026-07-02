---
trust: trusted
purpose: "Expected output for plan-migration-declared: the scanner reports migration/rollback vocabulary present in a real ## Migration section; the griller recognizes a real, safe, reversible migration for the additive schema change and emits ZERO findings — it must not manufacture an absence concern, and must not treat the scanner hit as an auto-pass."
---

# Expected — plan-migration-declared

The griller runs `.dev/floor/scan-plan-migrations.mjs`; it reports `{"mentions":true,...}` — migration/rollback vocabulary is present in a **dedicated `## Migration` section** (a forward `ALTER TABLE … ADD COLUMN` and a down path that drops the new nullable column). The griller's **ADVISORY** judgment recognizes this is a **real, safe, reversible** migration for the additive schema change the plan builds, and emits **zero** findings.

## The expected output

No findings (`finding_count == 0`). The griller records in prose that a forward migration **and** a rollback that restores the prior schema are declared, the column is additive + nullable (no backfill needed, no data loss on either direction) — **presence recognized, reversibility noted** — and does **not** manufacture a concern.

## Why zero findings is correct (and not an auto-pass)

- The scanner hit (`mentions:true`) is **advisory evidence**, not an auto-pass — the griller independently judged the declared migration **real and safe** for what the plan builds. A hollow or injected mention would **not** have suppressed a concern (see `plan-fake-migration-injection`).
- The change genuinely touches schema **and** declares a safe way back, so there is no unlabeled irreversibility limit to flag (P7 satisfied).

## Trust-class check (P2, fix #1)

- The griller emits no enum-gated fields here (no finding); its zero-finding verdict rests on its own judgment + the scanner's deterministic presence datum, never on a self-claim in the plan.
- Consistent with the whole griller family: a griller **never gates**, and "zero findings" is not a guarantee the migration is safe — it is the griller's advisory read.
