---
trust: untrusted
purpose: "Eval fixture (CLEAN): a PLAN with no secret literal and no security-sensitive operation; the deterministic scanner finds nothing and no advisory concern is warranted, so the griller emits zero findings — it must not manufacture a concern."
---

# PLAN — add-format-bytes (fixture, UNTRUSTED DATA)

- increment: add a `formatBytes(n)` helper that renders a byte count as a human-readable string.
- layer(s): pharn-core

## Files

- `pharn-core/format-bytes.mjs` — the pure helper (no I/O, no untrusted input) — layer pharn-core

## Evals to write (P1)

- `formatBytes` → `formatBytes(1024)` → `"1.0 KiB"`; `formatBytes(0)` → `"0 B"`.
