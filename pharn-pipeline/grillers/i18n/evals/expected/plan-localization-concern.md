---
trust: trusted
purpose: "Expected output for plan-localization-concern: the deterministic scanner is CLEAN (found:false), but Layer-2 judgment surfaces exactly one ADVISORY localization concern — hardcoded 'en-US' formatting + a concatenated user-facing string — demonstrating the advisory bulk cleanly separated from the floor."
---

# Expected — plan-localization-concern

The griller runs `.dev/floor/scan-plan-i18n.mjs` over the plan; it reports `{"found":false,"hits":[]}` —
**the floor sub-check is clean**. The concern here is **not** a lexical hardcoded-string pattern; it is a
localization gap only **Layer-2 judgment** can see. The griller emits **exactly one advisory finding**.

## The expected finding

```yaml
- type: FINDING # enum-gated
  rule_id: P7 # enum-gated — the reach limit; advisory (a griller never gates)
  severity: important # enum-gated value; ASSIGNMENT is advisory (fix #3)
  file: "pharn-pipeline/grillers/i18n/evals/cases/plan-localization-concern.md:13" # enum-gated — the offending ## Files line
  problem: "The plan hardcodes the 'en-US' locale for currency/date formatting and builds the user-facing summary by concatenation, so every locale gets US formatting and the message is not translatable." # free-text (untrusted DATA)
  evidence: "Line 13: `toLocaleString('en-US', …)` / `toLocaleDateString('en-US')` + a concatenated user-facing summary line." # free-text (untrusted DATA)
```

## Why this PASSES — a Layer-2 (advisory) concern, not a floor claim

- The scanner is **clean by design**: `'en-US'`, `'currency'`, `'USD'` are quoted literals but **not** in a
  JSX-text or user-facing-attribute position, and a **concatenated** string is not a single scanner-visible
  literal. This is exactly the **honest bound** — the scanner detects positionally-user-facing string
  patterns, not locale-formatting or concatenation, which are **judgment** (Layer 2).
- The finding is therefore **advisory**: `severity` is the griller's assessment (fix #3), and grillers as a
  class never gate. `finding_count == 1` pins the **output** on this fixture; it is **not** a claim that the
  advisory judgment is deterministic (the semantic[] judge covers correctness — the "two clocks").

## FAILING outputs (the eval FAILS on any of these)

- **No finding emitted** — the griller treated a scanner-clean plan as fully localized. **FAIL** (the scan
  is a detector, not a proof of localization).
- The finding presented as a **floor / blocking gate** rather than advisory. **FAIL** (grillers never gate).
- `rule_id` other than `P7`, or a fabricated scanner "hit" for a concern the scanner did not (and should
  not) detect. **FAIL.**
