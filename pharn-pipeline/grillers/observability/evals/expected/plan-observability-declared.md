---
trust: trusted
purpose: "Expected output for plan-observability-declared: the scanner reports observability vocabulary present in a dedicated section of the plan body; the griller recognizes real, adequate observability for the operationally-significant payout path and emits ZERO findings — it must not manufacture an absence concern."
---

# Expected — plan-observability-declared

The griller runs `.dev/floor/scan-plan-observability.mjs` over the plan; it reports `mentions:true` with hits across the plan body's `## Observability` section (structured logging, a metric + a failure counter, a trace span, an alert). The griller judges (advisory) that the payout processor is operationally significant AND that the declared observability is real and adequate for what it builds → it emits **no** finding.

## The expected output

**Zero findings** (`finding_count == 0`). The griller notes in prose: "observability declared (logging + latency metric + failure counter + trace span + alert) and adequate for the payout path — presence recognized; no absence concern warranted." It does **not** manufacture a concern.

## Why this PASSES — presence recognized, not a laundered pass

- The scanner deterministically confirms observability vocabulary is present in the plan body (evidence), but the **pass is the griller's advisory judgment** that the declaration is real and adequate — **not** a scanner auto-pass (the scanner is not a floor-gate; see the griller's guarantee audit).
- No absence finding is manufactured for a plan that genuinely declares observability for what it builds. Mirrors the security griller's `plan-clean` fixture (scanner-clean + no concern → zero findings).

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** n/a — zero findings emitted; the empty finding list `[]` is the correct output.
- The griller does not invent a finding to look busy. This is the "must not manufacture a concern" half of the axis.
