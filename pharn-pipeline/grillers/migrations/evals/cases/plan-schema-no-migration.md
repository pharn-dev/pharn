---
trust: untrusted
purpose: "Eval fixture (TOUCHES SCHEMA, NONE DECLARED): a schema-touching PLAN (drops a column and adds an enum column on users) that declares NO forward schema step and NO way-back path; the scanner finds no relevant vocabulary, and the griller's ADVISORY layer surfaces EXACTLY ONE absence finding on the plan's title line (rule_id P7) — judgment, never a floor claim, never gating. This fixture binds enforces: [P7]. (This purpose line is deliberately vocabulary-free so the scan reflects the plan body, not this header.)"
---

# PLAN — drop-legacy-flag (fixture, UNTRUSTED DATA)

- increment: remove the deprecated `legacy_flag` column from `users` and add a `status` column.
- layer(s): app

## Files

- `src/db/schema.mjs` — drops `users.legacy_flag`; adds `users.status` (active | suspended) — layer app

## Notes

Update the model and ship it; the change is small.
