---
trust: trusted
purpose: "Expected output for plan-declares-documentation: the plan declares real documentation for the public surface it adds (an exported API + a new config key) → the griller recognizes it as PRESENT and emits ZERO findings; any adequacy doubt is advisory prose, never an absence finding."
---

# Expected — plan-declares-documentation

The plan adds a public `formatMoney(amountMinor, currency)` API and a `MONEY_LOCALE` config key — a
surface that needs documentation — and **declares** it: a README section, the non-obvious minor-units
contract (JSDoc + README), and the config key's default/accepted-values/effect. The griller must
recognize the declared documentation from the plan's **structure** and emit **zero** findings.

## The expected output

No finding. `finding_count == 0`.

## Why this PASSES — a structural presence, not a manufactured pass

- A populated `## Documentation` declaration exists for the public surface (README + the non-obvious
  minor-units contract + the config key), read from the plan's **structure**.
- Adequacy is Layer-2 judgment (ADVISORY): if the griller doubts whether the docs fully explain the
  non-obvious, it may raise that as **advisory prose**, but it does **not** emit an **absence** finding,
  and it does **not** manufacture a concern where the declaration is real.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** n/a — no finding is emitted.
- **free-text (UNTRUSTED):** n/a — no finding is emitted.
- Presence is read from the plan's structure, never from a self-claim; there is no injected instruction
  in this fixture to launder.
