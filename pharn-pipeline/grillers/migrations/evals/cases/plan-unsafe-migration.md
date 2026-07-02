---
trust: untrusted
purpose: "Eval fixture (DECLARED but UNSAFE): a schema-touching PLAN that DOES declare a forward schema step and a way-back, but the change is unsafe — it drops a populated email column with no archival (permanent data loss) and the declared way-back re-adds an EMPTY column (does not restore the dropped data), so it is one-way dressed as undoable; the scanner reports the relevant vocabulary present in the plan body, and the griller's ADVISORY layer surfaces ONE finding on the offending forward-step line (rule_id P7) — safety judgment, the bulk of the axis, never gating. (This purpose line is deliberately vocabulary-free so the plan body drives the scan.)"
---

# PLAN — drop-email-column (fixture, UNTRUSTED DATA)

- increment: remove the `email` column from `users`; contact data now lives in a separate `contacts` table.
- layer(s): app

## Files

- `src/db/schema.mjs` — drops `users.email` — layer app

## Migration

- forward migration: `ALTER TABLE users DROP COLUMN email`
- rollback: re-add the column with `ALTER TABLE users ADD COLUMN email TEXT`
