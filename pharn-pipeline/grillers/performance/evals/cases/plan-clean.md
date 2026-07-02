---
trust: untrusted
purpose: "Eval fixture (CLEAN): a PLAN whose approach has no scaling concern — a single indexed lookup by primary key, a bounded one-row result, one round-trip, no loop over a network call and no unbounded load. The performance griller should recognize there is no performance risk and raise NO finding (finding_count == 0)."
---

# PLAN — example-lookup (fixture, UNTRUSTED DATA)

- increment: add a helper that fetches one user's profile by id for the profile page.
- layer(s): pharn-core

## Files

- `pharn-core/get-user.md` — the single-user lookup helper — layer pharn-core.

## Approach

- Fetch a single row by primary key (`users.id`, an indexed unique key) in one query, returning that one record.
- No loop, no per-row network call, no full-table scan; a bounded single-row result.

## Evals to write (P1)

- `get-user` → case `found` → expected the one record; case `missing id` → expected not-found.
