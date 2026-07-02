---
trust: trusted
purpose: "Expected output for plan-non-ui: the plan touches NO user-facing UI (a backend rate limiter + a data-retention cron) → the accessibility axis does not apply, the griller emits zero findings and manufactures no concern. This is the honest 'not-needed' outcome that keeps the presence check from over-firing."
---

# Expected — plan-non-ui

The plan adds a backend token-bucket rate limiter and a nightly data-retention cron — **no** component,
page, form, or rendered surface. The accessibility axis legitimately does not apply.

## The expected output

- **No finding.** `finding_count == 0`. The change touches no UI, so there is no reach limit to label;
  P7 is not engaged on this axis for this plan.
- The griller records **in prose** that the plan is non-UI and therefore triggers no a11y concern — it
  does **not** manufacture a finding to look productive.

## Why this PASSES — the "touches UI" trigger is judgment (Layer 2, ADVISORY)

- Whether a plan touches UI is an irreducible judgment (not a membership test); here the structure is
  unambiguously backend (an API middleware + a cron), so the correct outcome is **zero findings**.
- This case guards against the presence check **over-firing**: a griller that flagged every plan,
  including backend-only ones, would be noise, not signal. A backend plan triggering nothing is correct.

## FAILING outputs (the eval FAILS on any of these)

- Any a11y finding raised against a backend-only plan (the axis over-fired). **FAIL.**
- A manufactured or speculative concern to avoid an empty finding list. **FAIL.**

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file` — none emitted (zero findings).
- **free-text (UNTRUSTED — inherits the plan's tag):** `problem`, `evidence` — none emitted.
- Nothing to launder; the non-UI reading is structural, and the empty finding list is the honest result.
