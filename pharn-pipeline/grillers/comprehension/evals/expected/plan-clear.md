---
trust: trusted
purpose: "Expected output for plan-clear: the same non-obvious constants as the debt fixture, but with the WHY captured (derived, source named, re-derivation bound stated). The comprehension griller recognizes the captured rationale and raises NO comprehension-debt finding (finding_count == 0)."
skill_kind: llm
---

# Expected — plan-clear

The griller must emit **no** comprehension-debt finding: `finding_count == 0`.

## Why this PASSES — the WHY is captured (one-axis discriminator)

This fixture is structurally identical to `plan-comprehension-debt.md` except on the **single axis** the
griller tests: whether the reasoning behind the non-obvious choice is captured. Here it is —

- **`137/sec`** is explained as the downstream store's **measured** p99 sustained throughput (source
  named: `docs/capacity.md`), with the **re-derivation trigger** stated ("if the store tier changes").
  The next maintainer knows what it means and when to change it.
- **`× 8`** is explained as matching the ingest client's **8-request batch** — the burst that absorbs one
  client flush without overrunning the store's queue depth.

The _what_ (the values) and the _why_ (the reasoning the next maintainer needs) are **both** present, so
there is no comprehension debt to surface.

## What a FAILING output looks like (the eval FAILS on any of these)

- **Any comprehension-debt finding emitted** — the griller flagged the constants despite their captured
  rationale (a false positive: it read the presence of a magic-looking number as debt without checking
  whether the WHY is captured). **FAIL.**
- A `severity`/`rule_id` finding manufactured from a **minor stylistic** preference (e.g. "I'd inline the
  capacity note differently"). A style nit is advisory prose, **never** a P7 finding. **FAIL.**

## Note (advisory, not a finding)

Recognizing captured rationale is **judgment**, surfaced as prose — the griller **never gates** on it.
"Raised no finding" does **not** mean "the plan is fully comprehensible"; it means **this** griller found
the WHY behind **this** non-obvious choice captured. Comprehension is advisory end-to-end (P0).
