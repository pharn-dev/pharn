# GRILL — error-handling-griller (advisory)

- **Plan:** `.dev/features/error-handling-griller/PLAN.md`
- **Spec-hash check (content-hash primitive, surfaced not blocking):** `sha256(ARCHITECTURE.md)` =
  `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pinned
  `spec_content_hash`. No drift. (The block on drift is `/pharn-dev-build`'s floor-gate, fix #4 — not here.)
- **Grillers discovered (membership FLOOR, `count-grillers.mjs`):** 3 — `architecture`, `security`,
  `testability` (the 4th, `error-handling`, is the increment under construction — correctly not yet counted).

## Findings — built-in interrogation

### Guarantee-audit completeness (P0)

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".dev/features/error-handling-griller/PLAN.md:74"
  problem: "The 'present/absent output → FLOOR-checked at eval time by check-structural.mjs' claim omits the two-clocks nuance the sibling grillers state — the checker IS floor + tested, but the eval-runner that invokes it over a griller's live output is deferred (P7), so at build time the backstop is the checker's own tests + the committed fixtures, not a wired runner."
  evidence: "'**Present/absent OUTPUT on the committed fixtures** → **FLOOR-checked at eval time** by `.dev/floor/check-structural.mjs`' — accurate about the eval-time vs runtime split, but the security/testability grillers additionally flag that invoking the checker over live output is deferred orchestration."
```

### Eval coverage + structural/semantic split (P1, eval-format.md)

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/error-handling-griller/PLAN.md:64"
  problem: "The plan-inadequate (ADVISORY) eval pins its finding via structural[] assertions (finding_count/field_equals rule_id P7/severity); the build must ensure the expected .md labels that finding ADVISORY (not floor) — mirroring security's plan-sensitive-no-consideration.md — so the structural output-pin is not misread as making adequacy floor-checkable."
  evidence: "'→ **one ADVISORY finding** (`rule_id: P7`, `severity: important`, `file` = the offending approach/section line): the advisory layer surfaces the gap as **judgment**, explicitly NOT a floor claim' — correct intent; the risk is only that the structural[] pin on a known fixture can read as floor if the expected prose doesn't restate the advisory framing."
```

## Findings — registered grillers (advisory plug-in slot; gate nothing)

- **testability (P1) — does the plan declare HOW its change is verified?** PRESENT. The plan carries a
  full `## Evals to write (P1)` section (3 cases, each with expected output). **No absence finding.**
- **architecture (P3) — does the plan FIT?** FITS. It mirrors the three sibling grillers exactly (same
  `pharn-pipeline/grillers/` placement, same frontmatter shape + eval structure, reuses
  `count-grillers.mjs`/`check-structural.mjs` **unchanged**, routes shared abstraction through
  `pharn-contracts`, cites siblings in prose rather than importing them — P4/P3). **No finding.**
- **security (P2) — does the plan INTRODUCE a security risk?** `scan-plan-secrets.mjs` over the PLAN →
  `{"found":false,"hits":[]}` (deterministic, clean). No sensitive/destructive op is planned (a markdown
  methodology capability). The example needle the plan will place in a fixture
  (`<!-- … mark present … -->`) is error-handling text, not a secret. **No finding.**

## Prose summary

The plan is strong and internally consistent. Its central honest move — sizing the griller
**testability-shaped (membership + fixture-pinned presence)** and **explicitly rejecting a launderable
keyword-scanner** as the P0 disease — survives interrogation: the guarantee audit reduces every claim to
floor or labels it advisory, the trust audit propagates the plan's untrusted tag correctly, the eval set
binds `enforces: [P7]` twice (fix #6) with a real ★ needle trip-wire, and P3/P5/P7 raise no concerns
(one axis, one PR, smallest coherent increment, no speculation, deterministic-or-ask branches).

The two findings are **minor and forward-looking** — both are "carry this framing into the built
griller / expected files," not defects in the plan's intent:

1. **(P0)** add the two-clocks nuance to the built griller's Guarantee audit (checker is floor + tested;
   the runner that invokes it over live output is deferred) — the sibling grillers already state it.
2. **(P1)** ensure the `plan-inadequate` expected prose explicitly labels its finding ADVISORY, so the
   structural output-pin on that fixture is not misread as making adequacy floor-checkable.

Neither changes the plan's approach; both are quality notes for `/pharn-dev-build` to honor when it writes the
griller and its evals.

## Verdict

ADVISORY VERDICT: 2 concerns raised (0 blocking-severity, 2 minor/advisory) — for the human to weigh
before `/pharn-dev-build`. This grill-log is **advisory end-to-end**; it gates nothing (`/pharn-dev-grill` has no
floor verdict — the deterministic backstops are `/pharn-dev-build`'s spec-hash + open-questions gates and
`validate.mjs`). "Produced a grill-log" does **not** mean "the plan is good" (P0).

---

> **Run note (concurrency).** This grill-log's write was initially fail-closed **denied** because a
> concurrent `/pharn-dev-plan` run (`privacy-griller`) overwrote the shared `.pharn/writes-scope.json`
> (fix #7 is a single mutable file with no per-run isolation). The human paused the concurrent runs; the
> grill scope was re-set and this log written cleanly. Surfaced as a real PHARN limitation (P7 candidate:
> per-run scope isolation / a lock), not acted on in this increment.
