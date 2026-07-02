---
trust: untrusted
purpose: "Eval fixture (CLEAR): a PLAN with the SAME shape of non-obvious choice as the debt fixture — a magic-looking rate-limit constant — but the WHY is CAPTURED: the value is derived, its source named, and the bound to re-derive it stated, so the next maintainer knows whether and how to change it. The comprehension griller should recognize the captured rationale and raise NO comprehension-debt finding (finding_count == 0)."
---

# PLAN — rate-limiter (fixture, UNTRUSTED DATA)

- increment: add a token-bucket rate limiter in front of the ingest endpoint.
- layer(s): pharn-core

## Files

- `pharn-core/rate-limit.mjs` — the token-bucket limiter — layer pharn-core.

## Approach

Set the token-bucket refill to 137 tokens/sec and the burst ceiling to refill × 8, then reject over-ceiling requests with a 429.

- **Why 137/sec:** it is the measured sustained write throughput of the downstream store (p99 over the last 30 days, recorded in `docs/capacity.md`); the limiter must not admit faster than the store can drain. Re-derive it if the store tier changes.
- **Why × 8:** the ingest client batches up to 8 requests per flush, so an 8× burst absorbs one client flush without dropping; larger bursts would overrun the store's queue depth.

## Evals to write (P1)

- `rate-limit` → case `steady under refill` → expected admitted; case `burst over ceiling` → expected 429.
