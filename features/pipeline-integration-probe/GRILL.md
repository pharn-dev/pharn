# GRILL — pipeline-integration-probe

**Plan under interrogation:** `features/pipeline-integration-probe/PLAN.md` (human-approved 2026-06-26).
**Spec-hash check** (content-hash floor primitive — _surfaced here, not blocking_): recomputed
`sha256(ARCHITECTURE.md) = 11cd9ad5…d1d969`; plan pins the same at `PLAN.md:3` → **MATCH, no drift.**
The actual block on drift is `/build`'s floor-gate (fix #4, `ARCHITECTURE.md §6`); `/grill` only warns
early.
**Trust (P2):** this `PLAN.md` is `trust: untrusted` to `/grill`. The `problem` / `evidence` free-text
below **quotes it as DATA**, never as an instruction; the enum-gated fields (`type` / `rule_id` /
`severity` / `file`) are `/grill`'s own assertions (trusted). **No finding here gates `/build`** — the
whole grill-log is advisory (fix #3).

---

## Findings

> Each conforms to `pharn-contracts/finding-shape.md` (cited, not restated — P4). `severity` is an
> enum **value** (trusted) but the **assignment** is `/grill`'s advisory judgment (fix #3). Grouped by
> interrogation axis.

### Honest scope / no speculation (P7)

```yaml
- type: FINDING
  rule_id: "P7"
  severity: minor # advisory: disclosed + human-approved + revert-scheduled; flagged for re-affirmation, not a violation claim
  file: "features/pipeline-integration-probe/PLAN.md:99"
  problem: "The built artifact is, by the plan's own words, an addition with no standalone need — the
    speculative-addition shape P7 guards against. It is defended as a probe VEHICLE and mitigated by the
    human-approved revert disposition, but a deliberately-meaningless file still lands in floor/ (even
    if left uncommitted). This is the central P7 tension of the exercise; surfaced for the human to
    re-affirm, since a griller must name it rather than let 'it's just a vehicle' pass unstated."
  evidence: "The feature is meaningless by design. This run does not make floor/exit-label.mjs a
    meaningful capability; it is a throwaway vehicle (P7)."
```

### Determinism (P5)

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor # the PASS verdict is unaffected; the risk is an inaccurate count in the first-live verify-report
  file: "features/pipeline-integration-probe/PLAN.md:51"
  problem: "The matrix predicts /verify will report verifiers registered:0, yet the plan's own CF-2
    records that verify.md's live discovery grep returns 3 prose matches. So 'registered:0' rests on the
    OPERATOR resolving CF-2 by frontmatter-membership judgment at run time — not on a deterministic
    membership test the plan operationalizes. If the operator instead follows verify.md's literal grep,
    the first-live verify-report's verifier COUNT is wrong (the PASS verdict is robust either way — prose
    matches emit no gate exit code). The plan should state HOW registered is computed deterministically."
  evidence: "matrix line 51 predicts `verifiers:{registered:0,findings:[]}`; CF-2 (line 124) records
    `grep -rl 'role: verifier'` returns 3 prose matches on the live repo, not 0."
```

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor # latent, not a present blocker — today the check is model-judged and works
  file: "features/pipeline-integration-probe/PLAN.md:129"
  problem: "The plan retains the literal heading '## Open questions (HALT)' with '— RESOLVED' appended.
    /build's refuse-on-open-questions step currently relies on the MODEL reading 'RESOLVED' as resolved.
    Were that halt-gate ever hardened into the P5-preferred deterministic heading-membership test, it
    would false-halt on this retained heading. Latent fragility worth noting precisely because /build is
    the very next stage; consider renaming the heading (e.g. '## Resolutions') if the gate is ever made
    deterministic."
  evidence: "## Open questions (HALT) — RESOLVED (human-approved 2026-06-26; \"Approve as written\")"
```

### Discovery / unverified hand-off assumption (P6)

```yaml
- type: FINDING
  rule_id: "P6"
  severity: minor # the no-regression verdict is robust either way; this is a mechanism-verification watch-item
  file: "features/pipeline-integration-probe/PLAN.md:50"
  problem: "The matrix asserts the new test file is 'inside → excluded from outside gates' at /regress,
    but the plan does not cite WHERE that outside-scope test exclusion is implemented (check-regress.mjs's
    verdict subcommand compares exit codes; the inside-exclusion would be orchestrated by regress.md, not
    quoted in the plan). It is an unverified hand-off assumption. If /regress runs the full suite at head
    instead, the stated exclusion MECHANISM is wrong — though the no-regression verdict holds, since
    exit-label.test.mjs passes at both base and head. This is exactly the kind of stage-N→stage-N+1 shape
    assumption the probe exists to confirm against live behavior; watch it during the /regress run."
  evidence: "new test is `inside` → excluded from outside gates"
```

---

## Prose summary

The plan is unusually disciplined on the two axes that matter most for this repo: the **guarantee
audit** (`PLAN.md:96–100`) correctly labels the headline "the chain integrates" as _evidence /
advisory_ — not a guarantee — and explicitly names "verify passed therefore the feature is correct" as
the P0 disease to avoid; the **trust audit** (`:104–108`) is grounded in `finding-shape.md` /
`eval-format.md`'s named residual (free-text in canon read as untrusted DATA). The eval argument is
sound: the artifact is a floor helper (no `role:`), so P1's Capability-evals rule does not bind it, and
shipping a hermetic `*.test.mjs` mirrors the real `floor/check-*.mjs` precedent — nothing is laundered
through a judge (there is no judge). I raise **no** finding on those axes.

Four concerns remain, all **minor**, none blocking:

1. **(P7)** The artifact is, by the plan's own admission, meaningless — the speculative-addition shape
   P7 guards against. It's a vehicle, disclosed and human-approved with a revert plan, but a griller
   must name it for the human to re-affirm. _This is the one finding rooted in a constitution principle;
   it is a tension, not a violation — `/grill` cannot and does not issue a binding stop._
2. **(P5)** The predicted `/verify` output `registered:0` is contingent on the operator resolving the
   plan's own CF-2 (verify.md's grep returns 3 prose matches) by judgment — not operationalized as a
   deterministic count. The PASS verdict is safe; the report's _count_ is the exposure.
3. **(P5)** The retained `## Open questions (HALT)` heading is fine under today's model-judged
   refuse-check but would false-halt a future deterministic version.
4. **(P6)** The matrix asserts `/regress` excludes the new test from the outside gates without citing
   the mechanism — an unverified hand-off the run should confirm.

Findings 2 and 4 are not flaws so much as **watch-items**: this is an integration probe, and they name
exactly the hand-offs whose live behavior the run exists to observe. Surfacing them pre-`/build` means
the operator can capture the evidence deliberately instead of discovering a mismatch by accident.

---

## ADVISORY VERDICT

**4 concerns raised (0 blocking-severity, 4 minor) — for the human to weigh before `/build`.** None
gates `/build`; the deterministic backstops remain where they always were (`/build`'s spec-hash drift
gate fix #4, its unresolved-`## Open questions` refuse-check, and `floor/validate.mjs`). The plan is
sound enough to build as written; the human should simply note finding 1 (P7 vehicle, already approved)
and treat findings 2/4 as things to _measure_ during `/regress` and `/verify` rather than assume.
