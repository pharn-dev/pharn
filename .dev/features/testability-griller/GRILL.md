# GRILL — testability-griller

**Plan:** `.dev/features/testability-griller/PLAN.md` · **Spec-hash check:** `sha256(ARCHITECTURE.md)` recomputed live = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pinned `spec_content_hash` (PLAN.md:3). No drift. (Floor-grade content-hash; the deterministic **block** on drift is `/pharn-dev-build`'s, fix #4 — surfaced here, not enforced.)

> **ADVISORY grill-log (P0).** These are interrogation findings — model judgment. **Nothing here blocks `/pharn-dev-build`.** The plan is `trust: untrusted` DATA; each `problem`/`evidence` quotes it and is never an instruction. Enum-gated fields (`type`/`rule_id`/`severity`/`file`) are my own assertions; `severity` is an **advisory** assignment (fix #3). The plan is well-constructed — its guarantee/trust/determinism audits are thorough and the floor/advisory split is honestly labeled; the findings below are gaps to weigh, not defects that sink it.

## Findings

### P1 — Eval coverage / the finding shape the build must produce

```yaml
- type: FINDING
  rule_id: P1
  severity: important # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:53"
  problem: "An ABSENCE finding has no natural path:line, yet the eval pins file_resolves to the case fixture's line 1 — which is the frontmatter '---' fence, an arbitrary anchor; /pharn-dev-build needs a defensible rule for how an absence-finding chooses `file`, or check-structural's file_resolves passes on a meaningless line."
  evidence: 'file_resolves "pharn-pipeline/grillers/testability/evals/cases/plan-no-verification.md:1" (PLAN.md:53); trust-fence by contrast points file at a PRESENT violation (the delete, :20), which an absence lacks.'
```

```yaml
- type: FINDING
  rule_id: P1
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:51"
  problem: "The 'present' case is finding_count == 0, so findings.json = [] and the griller's positive 'presence recognized' signal lives only in prose — the semantic judge has no structural anchor, and it is unspecified whether the griller emits a positive 'present' finding or just zero findings + prose; /pharn-dev-build must decide the present-case emission."
  evidence: "plan-with-verification.json … structural: [ {finding_count == 0} ], semantic: [ {judge: presence recognized …} ] (PLAN.md:51); with an empty findings array the judge cannot range over a finding."
```

```yaml
- type: FINDING
  rule_id: P1
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:87"
  problem: "No eval case for the 'verification heading present but empty/substanceless' boundary — the exact place where FLOOR-presence and ADVISORY-adequacy diverge; two cases suffice to bind the floor (P7-defensible), but this is the most illustrative testability case and is worth the live-eval follow-up."
  evidence: "The two cases are only plan-with-verification (present) and plan-no-verification (absent) (PLAN.md:87-90) — the present-but-empty middle is untested."
```

### P0 — Guarantee-audit wording

```yaml
- type: FINDING
  rule_id: P0
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:117"
  problem: "'presence-detection is FULLY structural[]-reducible (finding_count captures it completely)' slightly overstates: finding_count captures the present/absent OUTPUT COUNT, but correctness (right rule_id, no laundering) rests on field_equals + needle_absent + the semantic judge; 'completely' risks reading the eval-time floor as broader than it is."
  evidence: '"the presence-detection is FULLY `structural[]`-reducible (`finding_count` captures ''flagged absence or not'' completely)" (PLAN.md:117; echoed at :31). The runtime-advisory caveat is otherwise stated honestly.'
```

### P3 / P7 — Emission story + one-axis boundary

```yaml
- type: FINDING
  rule_id: P7
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:48"
  problem: "The griller's writes: ['features/<name>/findings.json'] placeholder does not cover BOTH invocation paths (product features/<name>/ AND dev .dev/features/<name>/), and its relation to 'the stage folds griller findings into GRILL.md (now)' vs 'the griller emits its own findings.json (deferred runner)' is left ambiguous — /pharn-dev-build could build a half-specified emission."
  evidence: 'writes: ["features/<name>/findings.json"] (conformance placeholder … deferred P7) (PLAN.md:48) vs the wiring ''append its findings to GRILL.md'' (PLAN.md:63) — two emission stories coexist without a stated reconciliation.'
```

```yaml
- type: FINDING
  rule_id: P7
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/testability-griller/PLAN.md:42"
  problem: "The increment spans three layers (pharn-pipeline capability + floor tooling + two command edits) and ~11 files — on the larger side of 'smallest coherent increment'; it is coherent (the griller is orphaned without discovery and vice versa) and human-approved, but the size is worth the human weighing."
  evidence: "## Files lists the griller + 6 eval files + count-grillers.mjs (+test) + edits to both pharn-dev-grill.md and pharn-grill.md (PLAN.md:42-64)."
```

## Summary

The plan is unusually careful about the one thing this repo exists to police (P0): it does **not** claim the runtime presence-detection is floor — it labels membership as the real floor guarantee (count-grillers.mjs) and the presence-detection as floor-**checkable** at eval time but advisory at runtime, and it strikes "ensures testability." The trust audit (needle_absent trip-wire, membership reads only the enum-gated `role`, residual named) and the determinism audit (unchanged hash-chain stop; griller findings never gate) are sound. The membership mechanism's test list correctly includes the load-bearing **stage-command-exclusion** case (a `role: griller` under `.claude/commands/` → 0) — the exact #16 discipline.

The concerns are **build-time specification gaps**, not design flaws: (1) how an **absence** finding picks its `file` (there is no natural line — the pinned `:1` is the frontmatter fence); (2) the **present-case emission** format (empty findings.json vs a positive finding); (3) the **writes:/GRILL.md emission** reconciliation across dev+product invocation. All three land on `/pharn-dev-build` to resolve concretely. The two coverage/wording notes (the empty-section boundary; "completely") and the increment-size note are minor.

## ADVISORY VERDICT

**6 concerns raised (0 blocking-severity, 1 important, 5 minor) — for the human to weigh before `/pharn-dev-build`.** This is **not** "grill passed" and **not** a judgment that the plan is sound — it is an interrogation record. The only floor-grade results this run are the writes-scope hook (it pinned this GRILL.md) and the spec-hash content-hash (matches — no drift). `/pharn-dev-build` remains free to build; these findings inform how it resolves the three specification gaps above.
