# GRILL — comprehension-griller (ADVISORY)

- Plan: `.dev/features/comprehension-griller/PLAN.md`
- Spec-hash check: **MATCH** (live `sha256(ARCHITECTURE.md)` == plan's `spec_content_hash` `11cd9ad5…d969`; no drift). Content-hash is floor-grade; here it only **surfaces** — `/pharn-dev-build` is where drift blocks (fix #4).
- Griller plug-in slot: `count-grillers.mjs` → **11 registered** (comprehension not yet built — correct). Relevant axes applied inline below; none fired.
- **This grill-log is ADVISORY end-to-end. It gates nothing.** It surfaces concerns for the human before `/pharn-dev-build`; it is NOT "grill passed" and NOT a guarantee the plan is sound (P0).

## Findings (finding-shape; enum-gated / free-text split honored)

### Axis: honest scope / no speculation (P7)

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P7 # enum-gated — cited, not restated (P4)
  severity: important # enum-gated value; ASSIGNMENT is advisory (fix #3) — grill never gates
  file: ".dev/features/comprehension-griller/PLAN.md:54" # enum-gated — the boundary section
  problem: "The comprehension axis genuinely co-fires with the already-built documentation griller — both enforce P7 and both ask 'will the next person understand' — so on a public, non-obvious behavior BOTH grillers will raise a P7 finding, which the human should keep weighing even though 'distinct griller' was ratified at GATE 1."
  evidence: "Plan: 'documentation = public-surface docs presence; comprehension = internal WHY/rationale of decisions, including code with no public surface. The overlap in the middle (a public, non-obvious behavior left unexplained) is legitimate axis co-firing.' The boundary is the mitigation; it is a boundary of judgment, not a floor partition."
```

### Axis: evals are the spec (P1)

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/comprehension-griller/PLAN.md:96" # the CLEAR fixture description
  problem: "For the eval to isolate the comprehension signal, the DEBT and CLEAR fixtures should differ on EXACTLY one axis — whether the WHY/rationale is captured — and be otherwise structurally identical; if they differ on other dimensions too, a finding_count flip can't be attributed to the comprehension axis."
  evidence: "Plan: 'plan-clear.md (the same shape of non-obvious choice, but the WHY is captured)'. The intent is right; the build must hold everything but the rationale constant across the two fixtures."
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/comprehension-griller/PLAN.md:91" # file_resolves target
  problem: "The DEBT expected pins file_resolves to 'the specific offending line'; the case and expected must be authored together so that line number is exact — a stale/off-by-one line silently fails the file_resolves structural assertion at eval time."
  evidence: "Plan: 'file_resolves to the specific offending line carrying the unexplained value'. Cleaner than architecture's whole-doc title-line cite, but it makes the assertion line-number-sensitive — a build-correctness detail, not a design gap."
```

## Griller plug-in slot (Step 2b) — applied inline, ADVISORY

`count-grillers.mjs` reports 11 registered grillers (frontmatter membership, FLOOR). Applying the axes
relevant to a markdown griller capability over this plan:

- **architecture (P3)** — **fit recognized, no finding.** The griller sits at `pharn-pipeline`, `reads:`
  only `pharn-contracts/finding-shape.md` (the bottom) + its input plan — no leaf→leaf sibling reference;
  it mirrors the existing griller structure. Fits the tree.
- **documentation (P7)** — **no absence finding.** The griller `.md` (frontmatter + procedure + finding
  output) is itself the documentation of the capability's surface; the plan declares it in full.
  (Note the irony: this very co-fire is the subject of the P7 finding above.)
- **testability (P1)** — **no finding.** The plan declares evals (two fixtures + expected, structural/
  semantic split) — the presence property holds.
- **a11y / error-handling / i18n / migrations / observability / performance / privacy / security** — **not
  applicable** to a stdlib-free markdown griller (no UI, runtime error paths, locale surface, schema
  migration, observability surface, scaling cliff, PII, or secret literal). No findings.

## Prose summary

The plan is unusually clean and its P0 guarantee audit is exemplary for exactly the axis most at risk of
over-claiming: it reduces the **only** runtime guarantee to griller membership, labels the entire
comprehension assessment **advisory**, keeps fixture behavior as **eval-time** (not runtime) checking,
**rejects** a launderable `scan-plan-comprehension.mjs` by name, and **strikes** "ensures comprehension"
as the disease. Trust audit (P2), determinism (P5), and no-sibling-import (P3) are all concretely
addressed. The `enforces:["P7"] ↔ eval` binding (fix #6) is satisfied by the DEBT fixture.

The one design risk worth carrying into build and review is the **P7 co-fire with the documentation
griller** (F1): the boundary (internal-WHY vs public-docs-presence) is a **judgment** boundary, not a
floor partition, so the two axes will overlap on public non-obvious behavior. The human ratified
"distinct" at GATE 1; F1 records the residual honestly for the review lens to keep in view. The two
minor P1 notes are **build-correctness** guidance for the eval fixtures (one-axis isolation; exact
`file_resolves` line), not design gaps.

On the P7 "no speculation" test itself: the increment rests on the **deliberate griller-family
expansion** grounded in a **real failure class** (comprehension debt), the same justification grillers
2 and 7–11 used — it does **not** assert a specific one-off dogfood failure, and per the family
precedent it does not need to. Consistent, not speculative.

## Verdict

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 1 important, 2 minor) — for the human to
weigh before /pharn-dev-build.** Nothing here blocks; the deterministic backstops remain `/pharn-dev-build`'s
floor-gates (spec-hash drift, unresolved `## Open questions (HALT)`) and `.dev/floor/validate.mjs`. The
plan's `## Open questions (HALT)` records none blocking. This is not "grill passed" and not a guarantee
the plan is good (P0).
