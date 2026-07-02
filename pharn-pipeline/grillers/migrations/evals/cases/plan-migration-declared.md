---
trust: untrusted
purpose: "Eval fixture (DECLARED/safe): a schema-touching PLAN (adds a nullable deleted_at column) that DECLARES both the forward schema step and a safe way-back that restores the prior schema with no data loss; the scanner reports the relevant vocabulary present in the plan body, the griller recognizes the change is real and safe (additive, nullable, undoable), and emits ZERO findings — it must not manufacture an absence concern. (This purpose line is deliberately vocabulary-free so the plan body drives the scan, not this header.)"
---

# PLAN — add-soft-delete (fixture, UNTRUSTED DATA)

- increment: add soft-delete to users by adding a `deleted_at` timestamp column.
- layer(s): app

## Files

- `src/db/schema.mjs` — adds a nullable `deleted_at` column to the `users` table — layer app

## Migration

- forward migration: `ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL` — additive and nullable, so no backfill is needed and no existing row breaks.
- rollback / down migration: `ALTER TABLE users DROP COLUMN deleted_at` — restores the prior schema exactly; no data loss, because the column is new and nullable.
