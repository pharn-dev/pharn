---
trust: trusted
purpose: "Expected output for plan-with-verification: the griller recognizes the declared verification approach and emits ZERO absence findings (finding_count == 0). Adequacy, if assessed, is advisory prose only."
---

# Expected — plan-with-verification

The plan declares a verification approach (a non-empty `## Evals to write (P1)` + `## Acceptance
criteria` section for the helper it adds). The griller must therefore emit **zero** absence findings:

- **`finding_count == 0`** (structural) — no absence finding; the emitted findings array is the empty
  array `[]`.
- The griller records "presence recognized" in its **prose** (the grill-log / GRILL section); any
  concern about _adequacy_ is raised there as **advisory** only — never as an absence finding, and
  never as a floor gate.

## Why zero findings is the pass

The floor-demonstrable layer asks only **presence** — a verification section is structurally there, so
no absence finding is due. Whether that verification is _adequate_ is the advisory layer's judgment
(`semantic[]`), which annotates but never gates and never manufactures an absence finding. A griller
that invented a finding here — because it doubted the tests' adequacy — would be conflating the two
layers; adequacy is surfaced as advisory prose, not as the Layer-1 presence finding.
