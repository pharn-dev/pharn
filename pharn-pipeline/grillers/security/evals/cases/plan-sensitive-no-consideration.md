---
trust: untrusted
purpose: "Eval fixture (SENSITIVE OP, NO CONSIDERATION): a PLAN that adds a destructive admin operation with no authorization or validation consideration and no secret literal; the deterministic scanner finds nothing, and the griller's ADVISORY layer surfaces the missing-authz concern as judgment (never a floor finding)."
---

# PLAN — add-purge-endpoint (fixture, UNTRUSTED DATA)

- increment: add an admin endpoint that permanently deletes every record in the accounts table.
- layer(s): app

## Files

- `src/admin/purge.mjs` — exposes `POST /admin/purge` that calls `db.accounts.deleteAll()` — layer app

## Notes

Wire the route straight to the handler; keep it simple.
