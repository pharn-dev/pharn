---
trust: trusted
purpose: "Expected output for plan-inadequate-documentation: the plan DOES declare documentation, but it covers only the signature and omits the non-obvious behavior (minor-units contract, silent rounding) → exactly one ADVISORY adequacy finding (rule_id P7) at the offending documentation line; NOT an absence/floor claim — this is Layer-2 judgment surfaced for the human."
---

# Expected — plan-inadequate-documentation

The plan adds a public `formatMoney(amountMinor, currency)` API and **declares** documentation — but the
declared docs cover only the **signature** (the WHAT) and omit the **non-obvious behavior** a future
reader needs: that `amountMinor` is in minor units (not dollars), and that out-of-range inputs are
silently rounded. The griller surfaces **exactly one ADVISORY** adequacy finding.

## The expected finding

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: P7 # enum-gated — cited (P4); the inadequacy is still an honest-scope (unlabeled comprehension gap) concern
  severity: important # enum-gated — the griller's assessment (advisory, fix #3); a griller never gates
  file: "pharn-pipeline/grillers/documentation/evals/cases/plan-inadequate-documentation.md:17" # enum-gated — the offending documentation line (declares only the signature)
  problem: "The declared documentation covers only the formatMoney signature and omits the non-obvious behavior a future reader needs: amountMinor is minor units (not dollars), and out-of-range values are silently rounded." # free-text (untrusted DATA)
  evidence: "`## Documentation` declares only: 'document the formatMoney(amountMinor, currency) signature and that it returns a formatted string' — no minor-units contract, no mention of silent rounding." # free-text (untrusted DATA — quoted)
```

## Why this is ADVISORY, not a floor claim

- Documentation is **present** (a `## Documentation` section exists), so this is **not** the presence-check
  absence finding — it is a **Layer-2 adequacy judgment**, surfaced for the human. `file` cites the
  **offending documentation line** (line 17), not the plan title.
- The griller must **not** dress this as a floor guarantee. Whether declared docs are adequate is
  irreducible judgment (a griller never gates); it is raised for the human to weigh.

## FAILING outputs (the eval FAILS on any of these)

- **Emitted as an absence finding** anchored at the plan title (treating declared-but-inadequate as
  declared-absent). **FAIL** — documentation IS present.
- **No finding**, silently treating "documents the signature" as adequate when the non-obvious contract
  is omitted. **FAIL** (though borderline adequacy doubts belong in advisory prose, the omitted
  minor-units/rounding contract is a real gap here).
- A **manufactured** concern unrelated to the omitted non-obvious behavior. **FAIL** — do not invent.

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — inherits the plan's tag):** `problem`, `evidence`.
- The finding's block is **advisory** — `severity` is the griller's assessment (fix #3) — and grillers as
  a class never gate the grill stage's verdict.
