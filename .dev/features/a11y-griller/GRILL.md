# GRILL — a11y-griller (interrogation of `.dev/features/a11y-griller/PLAN.md`)

Header: interrogated the approved PLAN for the a11y (accessibility) griller. **Spec-hash check
(content-hash floor primitive):** `sha256(ARCHITECTURE.md)` = `11cd9ad5…d969` **matches** the plan's
pinned `spec_content_hash` → **no drift** (the binding block on drift is `/pharn-dev-build`'s floor-gate;
here it only confirms). The `PLAN.md` was read as `trust: untrusted` DATA — its self-claims were
tested, not believed.

## Findings (finding-shape; enum-gated / free-text split honored — all ADVISORY)

### Axis: P7 — honest scope / no speculative addition

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P7 # enum-gated — membership in the principle roster
  severity: important # enum-gated value; the ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/a11y-griller/PLAN.md:4" # enum-gated — the "increment: add a tenth griller" line
  problem: "The plan justifies the tenth-griller addition only tersely (line 62); the BUILT a11y.md must carry the explicit 'real, recurring failure CATEGORY, not a hypothetical' trigger paragraph that documentation.md (the ninth griller) uses, or the addition risks reading as speculative under P7." # free-text — untrusted DATA
  evidence: "PLAN line 4 introduces 'a tenth griller' and line 62 gives the P7 rationale, but neither spells out the griller-family-expansion trigger the way documentation.md does ('the failure it addresses is a real, recurring class … not a claim that a specific one-off dogfood run failed')." # free-text — quoted from the plan
```

### Axis: P1 / eval-format — the structural vs semantic split

```yaml
- type: FINDING # enum-gated
  rule_id: P1 # enum-gated
  severity: minor # enum-gated value; assignment advisory (fix #3)
  file: ".dev/features/a11y-griller/PLAN.md:31" # enum-gated — the "Evals to write (P1)" section
  problem: "The plan names the structural[] assertions per case but does not state that every expected/*.json will carry skill_kind: llm AND a semantic[] judge — including the two finding_count==0 cases (declares, non-ui), which per the documentation/performance precedent are structural finding_count==0 PLUS a semantic judge, not structural-only." # free-text — untrusted DATA
  evidence: "PLAN line 29 cites eval-format's structural[]/semantic[] split, and line 31's 'Evals to write' lists structural assertions, but no line commits each expected to skill_kind: llm + a semantic[] criterion." # free-text — quoted from the plan
```

## Grillers discovered + run (Step 2b — membership is FLOOR, running is advisory)

`node .dev/floor/count-grillers.mjs .` → `registered: 9` (architecture, documentation, error-handling,
migrations, observability, performance, privacy, security, testability). The a11y griller is correctly
**absent** (not yet built). Each was applied inline over the PLAN:

- **testability (P1)** — satisfied: the plan ships 4 eval cases + expected. No finding.
- **architecture (P3)** — satisfied: griller at `pharn-pipeline`, reuses `count-grillers.mjs`, routes
  shared shape through `pharn-contracts`; no sibling reference. No finding.
- **documentation (P7)** — the griller.md is its own documentation surface; reinforces the P7 finding
  above (ensure the built a11y.md documents its axis + trigger fully). Folded into the P7 finding.
- **error-handling (P7)** — **non-triggering**: a markdown griller prompt has no dependency call,
  timeout, or destructive op; `count-grillers.mjs`'s missing-dir path is already fail-closed. No finding.
- **security (P2)** — non-triggering: no secret literal, no authz surface. No finding.
- **privacy (P2)** — non-triggering: no PII handling. No finding.
- **performance (P7)** — non-triggering: no scaling cliff (a griller prompt does not loop over I/O). No finding.
- **observability (P7)** — non-triggering: no runtime signal surface to instrument. No finding.
- **migrations (P7)** — non-triggering: no schema / data migration. No finding.

_(All 9 grillers are ADVISORY — they gate nothing, fix #3. Membership was read from frontmatter, not
prose. The live isolated per-griller runner remains deferred, P7; procedures were applied inline.)_

## Prose summary

The plan is well-grounded and discovery-first: the ARCHITECTURE hash is pinned and matches, the
increment is the smallest coherent one (one griller + its evals, mirroring the documentation/error-handling
presence-check precedent), and the guarantee audit (P0) is honest — griller membership + the
fixture-pinned present/absent output are the only FLOOR claims, everything judgment-shaped ("touches
UI", WCAG adequacy) is labeled ADVISORY, the launderable `scan-plan-a11y.mjs` candidate is named and
rejected, and "ensures accessibility" is struck as the disease. Trust (P2) and determinism (P5) audits
are complete.

Two concerns, **both advisory, neither blocking**:

1. **(P7, important)** the _built_ `a11y.md` must carry the explicit "real recurring failure category,
   not a hypothetical" trigger justification (as `documentation.md` does) so the tenth-griller addition
   is demonstrably non-speculative — the PLAN states it only tersely.
2. **(P1, minor)** the eval `expected/*.json` should each explicitly declare `skill_kind: llm` + a
   `semantic[]` judge (including the two `finding_count == 0` cases), so nothing floor-checkable is
   laundered into — or mistakenly omitted from — the judge layer.

Neither is a gap that should stop the build; both are quality nudges the `/pharn-dev-build` step can absorb
by faithfully mirroring the documentation griller (which already satisfies both). No constitution
violation was found; the spec hash did not drift.

## Verdict

**ADVISORY VERDICT: 2 concerns raised (0 blocking-severity, 2 advisory) — for the human to weigh before
`/pharn-dev-build`.** This grill-log is advisory end-to-end (P0): it does **not** gate `/pharn-dev-build`, and
"produced a GRILL.md" never means "the plan is good." The only floor-grade facts in this run are the
writes-scope hook (pinned this log's path) and the content-hash comparison (matched).
