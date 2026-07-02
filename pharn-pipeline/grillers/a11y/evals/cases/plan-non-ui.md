---
trust: untrusted
purpose: "Eval fixture (NOT-NEEDED / non-triggering): a PLAN that touches NO user-facing UI — it adds a backend rate-limiter around an internal API route and a data-retention cron job — so the accessibility axis legitimately does not apply; the griller must emit zero findings and manufacture no concern."
---

# PLAN — api-rate-limiter (fixture, UNTRUSTED DATA)

- increment: add a token-bucket rate limiter to the internal `/api/ingest` route and a nightly
  data-retention cron that prunes rows older than 90 days.
- layer(s): app

## Files

- `src/rate-limiter.mjs` — token-bucket limiter middleware for `/api/ingest` — layer app
- `src/retention-cron.mjs` — nightly prune of expired rows — layer app

## Notes

Pure backend: no component, page, form, or rendered surface — this plan touches no UI. Error handling
and observability for the limiter are covered under their own axes.
