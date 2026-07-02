---
trust: trusted
purpose: "Expected output for plan-declares-a11y: the plan adds a UI surface (a form component + a modal) and DECLARES a real accessibility approach → the griller recognizes it as PRESENT and emits zero absence findings; any adequacy doubt stays advisory prose, never a manufactured finding."
---

# Expected — plan-declares-a11y

The plan adds a `<Checkout>` form and a confirmation modal and declares an `## Accessibility` approach
covering keyboard operability, ARIA semantics, contrast, and screen-reader support. The griller must
recognize the declaration from the plan's **structure** and emit **zero** findings.

## The expected output

- **No finding.** `finding_count == 0`. The accessibility declaration is present and covers the UI the
  plan builds; there is no unlabeled reach limit to flag (P7 is satisfied for the presence check).
- If the griller has a doubt about the declaration's **adequacy** (Layer 2 judgment), it records it as
  **advisory prose**, never as an absence finding and never as a floor claim.

## Why this PASSES

- Presence is read from the plan's **structure** — a populated `## Accessibility` section naming
  keyboard, ARIA, contrast, and screen-reader considerations for the surface it builds.
- The griller does **not** manufacture a concern where the declaration is present and plausibly
  adequate; grillers never gate, and a clean plan yields an empty finding list.

## FAILING outputs (the eval FAILS on any of these)

- Any absence finding emitted despite the present, on-point `## Accessibility` declaration. **FAIL.**
- An adequacy doubt escalated into a floor/absence finding instead of advisory prose. **FAIL.**
- A manufactured, unrelated concern raised to look productive. **FAIL.**

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file` — none emitted here (zero findings).
- **free-text (UNTRUSTED — inherits the plan's tag):** `problem`, `evidence` — none emitted here.
- With zero findings, there is nothing to launder; the present declaration is honored structurally, not
  because the plan "claims" it.
