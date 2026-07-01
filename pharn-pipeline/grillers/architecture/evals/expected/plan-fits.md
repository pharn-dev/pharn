---
trust: trusted
purpose: "Expected output for plan-fits: the griller recognizes that the plan's approach fits the existing architecture and raises NO structural-inconsistency finding (finding_count == 0)."
---

# Expected — plan-fits

The griller must raise **no** structural-inconsistency finding — the empty finding list `[]`,
`finding_count == 0`.

## Why this PASSES — the approach fits the tree

- The shared abstraction (`pharn-contracts/cache-shape.md`) is routed through the **bottom**
  (`pharn-contracts`), so the two consuming pipeline capabilities depend on it, **not** on each other —
  no leaf→leaf coupling (`ARCHITECTURE.md §4`, P3).
- An established `pharn-core` mechanism is reused; no new pattern is introduced where one already
  exists. Layer placement is consistent with the tree.

## What would FAIL this eval

- **Any structural-inconsistency finding emitted** — the griller invented a P3 concern where the plan
  fits. **FAIL.**
- A minor stylistic preference escalated into a finding instead of being left as advisory prose.
  **FAIL.**

The griller may note the fit in prose; it must not manufacture a finding. Any adequacy/stylistic
remark is advisory, never a structural-inconsistency finding.
