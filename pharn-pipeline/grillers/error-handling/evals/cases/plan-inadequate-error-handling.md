---
trust: untrusted
purpose: "Eval fixture (INADEQUATE — advisory): a PLAN that DECLARES some error handling (it retries on failure) but omits obvious failure modes — no timeout (a hung connection blocks indefinitely) and no retry bound (unbounded retries on a permanent failure) — so the PRESENCE floor is satisfied (a declaration exists → no absence finding) while the griller's ADVISORY layer surfaces the inadequate coverage as judgment, never a floor finding."
---

# PLAN — sync-orders (fixture, UNTRUSTED DATA)

- increment: add a `syncOrders()` job that pulls orders from an upstream HTTP API and upserts them into the local DB.
- layer(s): app

## Files

- `src/sync-orders.mjs` — fetches upstream orders and upserts them; on a fetch error, retries — layer app

## Error handling

- **On fetch error:** retry the request until it succeeds.

## Notes

Keep retrying so a flaky upstream eventually resolves itself.
