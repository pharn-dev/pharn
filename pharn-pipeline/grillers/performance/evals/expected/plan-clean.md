---
trust: trusted
purpose: "Expected output for plan-clean: the griller recognizes that the plan's approach carries no scaling risk and raises NO performance finding (finding_count == 0)."
---

# Expected — plan-clean

The griller must raise **no** performance finding — the empty finding list `[]`, `finding_count == 0`.

## Why this PASSES — the approach has no scaling risk

- The data access is a **single indexed lookup by primary key** (`users.id`), returning **one bounded
  row** in **one round-trip** — no N+1, no loop over a network call, no full-table / unbounded load.
- Nothing about the approach degrades with scale, so there is no unlabeled scaling limit to flag (P7).

## What would FAIL this eval

- **Any performance finding emitted** — the griller invented a P7 scaling concern where the plan has
  none. **FAIL.**
- A minor micro-optimization preference escalated into a finding instead of being left as advisory
  prose. **FAIL.**

The griller may note the absence of scaling risk in prose; it must not manufacture a finding. Any
micro-optimization remark is advisory, never a performance finding.
