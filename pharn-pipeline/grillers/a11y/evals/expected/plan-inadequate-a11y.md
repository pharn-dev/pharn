---
trust: trusted
purpose: "Expected output for plan-inadequate-a11y: the plan DOES declare accessibility (so NOT an absence finding), but the declaration covers only contrast and omits keyboard + screen-reader support for a custom div-based control → exactly one ADVISORY adequacy finding (rule_id P7) at the offending declaration line; never a floor/absence gate."
---

# Expected — plan-inadequate-a11y

The plan adds a custom `<Dropdown>` (a div-based clickable menu) and **does** declare accessibility —
but only colour contrast, omitting the keyboard operability and screen-reader semantics a non-native
control critically needs. This is a **present-but-inadequate** case: not an absence, a judgment.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: P7 # enum-gated — cited (P4); the eval binding for enforces: ["P7"]
  severity: important # enum-gated — the griller's assessment (advisory, fix #3); a griller never gates
  file: "pharn-pipeline/grillers/a11y/evals/cases/plan-inadequate-a11y.md:17" # enum-gated — the offending inadequate a11y line, NOT the title
  problem: "The declared accessibility covers only colour contrast and omits keyboard operability + focus management and a name/role/value for screen readers, which a custom div-based dropdown (not a native <select>) critically requires." # free-text (untrusted DATA)
  evidence: "`## Accessibility` names only 'menu colours that meet WCAG AA contrast'; the div-based `<Dropdown>` opens on mouse click with no keyboard or screen-reader affordance declared." # free-text (untrusted DATA — quoted)
```

## Why this is an ADVISORY adequacy finding, not an absence

- The plan **declares** accessibility, so the presence check is satisfied — the griller must **not**
  raise an absence finding, and `file` is the **offending declaration line** (line 17), never the plan
  title.
- The gap is one of **adequacy** (real WCAG coverage), which is irreducible **judgment** — surfaced for
  the human, never a floor claim. Grillers never gate; this finding informs, it does not block.

## FAILING outputs (the eval FAILS on any of these)

- An **absence** finding (as if no a11y were declared) — the declaration is present. **FAIL.**
- `file` pointing at the plan title (line 6) instead of the offending declaration line (line 17). **FAIL.**
- The finding presented as a floor/blocking gate rather than advisory judgment. **FAIL.**
- Zero findings (the inadequacy silently passed) or a manufactured unrelated concern. **FAIL.**

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — inherits the plan's tag):** `problem`, `evidence`.
- This finding's block is **advisory** — `severity` is the griller's assessment (fix #3); grillers as a
  class never gate the grill stage's verdict.
