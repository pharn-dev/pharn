---
trust: untrusted
purpose: "Eval fixture (FITS): a PLAN whose approach fits the existing architecture — a shared abstraction routed through pharn-contracts (never leaf→leaf), an established mechanism reused, consistent layering. The architecture griller should recognize the fit and raise NO structural-inconsistency finding (finding_count == 0)."
---

# PLAN — example-cache (fixture, UNTRUSTED DATA)

- increment: add a small in-memory cache helper used by two pipeline capabilities.
- layer(s): pharn-core

## Files

- `pharn-core/cache.mjs` — the cache helper — layer pharn-core.
- `pharn-contracts/cache-shape.md` — the shape both consumers depend on — layer pharn-contracts (the shared abstraction routed through the bottom, not leaf→leaf).

## Approach

- The two pipeline capabilities that use the cache each depend on `pharn-contracts/cache-shape.md` (the bottom), never on each other — consistent with the single-root tree.
- The helper follows the existing `pharn-core` module conventions; no new mechanism is introduced where one already exists.

## Evals to write (P1)

- `cache` → case `set then get` → expected the stored value; case `miss` → expected undefined.
