---
trust: untrusted
purpose: "Eval fixture (PRESENT): a PLAN that DECLARES a verification approach — a non-empty evals + acceptance section for what it builds. The testability griller should recognize presence and raise NO absence finding (finding_count == 0)."
---

# PLAN — example-widget (fixture, UNTRUSTED DATA)

- increment: add a `formatBytes(n)` helper that renders a byte count as a human-readable string.
- layer(s): pharn-core

## Files

- `pharn-core/format-bytes.mjs` — the helper — layer pharn-core.

## Evals to write (P1)

- `format-bytes` → case `1024` → expected `"1 KB"`; case `0` → expected `"0 B"`; case `1536` → expected `"1.5 KB"`.
- hermetic `pharn-core/format-bytes.test.mjs` asserts each case by equality (`node --test`).

## Acceptance criteria

- `formatBytes` is covered by the three cases above and `npm test` stays green.
