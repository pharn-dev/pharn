# GRILL — regress-stage (`/pharn-regress`)

**Plan:** `.dev/features/regress-stage/PLAN.md` · **Spec-hash check:** GREEN — plan's carried `spec_content_hash` == current `sha256(ARCHITECTURE.md)` (`11cd9ad5…d969`); no drift (the binding **block** on drift is `/pharn-dev-build`'s floor-gate, fix #4 — this only surfaces).

> **ADVISORY end-to-end (P0).** Nothing here gates `/pharn-dev-build`. The floor-grade things this run touched are the writes-scope hook (pins where the grill may write) and the content-hash above. Every finding below is model judgment for the human to weigh. The `problem`/`evidence` free-text **inherits the plan's untrusted tag** (P2) and is rendered as quoted DATA.

## Findings

### P0/P5 — guarantee-audit completeness & determinism

```yaml
- type: FINDING
  rule_id: P5
  severity: important
  file: ".dev/features/regress-stage/PLAN.md:88"
  problem: "The config-touch style-skip is generalized to all whole-repo gates, but it is UNSOUND for type-check/compile gates, which have cross-file dependencies a style gate does not — so an inside change can legitimately flip an OUTSIDE-file type-check WITHOUT any shared-config change, and skipping it would hide a real regression."
  evidence: "runs **whole-repo gates** (lint / type-check) identically at base and head with the config-touch skip and a **named granularity limit** (repo-granular)"
```

> Why it matters: in `/pharn-dev-regress` the skip is sound because its style gates (`lint`/`format:check`/`lint:md`) are byte-stable over outside files — a flip is _provably impossible_ unless shared config changed. A **type-check/compile** gate is different: an outside file that imports a changed inside symbol can break at HEAD with no config touch. That is exactly the regression `/pharn-regress` exists to catch. **The command must restrict the config-touch skip to gates with no cross-file semantic dependency (style/format) and ALWAYS run cross-file gates (type-check/compile) at base+head.** As written, the OQ1 resolution would silently skip a class of real regressions.

```yaml
- type: FINDING
  rule_id: P5
  severity: important
  file: ".dev/features/regress-stage/PLAN.md:88"
  problem: "Gate-discovery is asserted to be 'a membership test (P5)' but is left abstract ('discover the project's gates ... from the manifest'); without a pinned, concrete membership rule the model ends up CLASSIFYING what counts as a deterministic gate — the exact LLM-classification-driving-a-branch P5 forbids."
  evidence: "**deterministically discovers** the project's gates (test / lint / type-check) from the project's manifest (e.g. `package.json` scripts — a membership test, P5)"
```

> Why it matters: "discovers from package.json" is only a membership test if the _set_ is fixed (e.g. an exact script-name allowlist like `{test, lint, typecheck, build}`). "Whatever deterministic checks the project has" is a judgment, not a membership test. **The command body must pin the discovery rule concretely** — a fixed script-name set and/or a required `--gates` override — with the terminal fallback = ask the human (which the plan already has). This keeps the floor reduction honest; otherwise the determinism claim at this line is "written in the plan," not real.

### P0/P7 — value over the upstream gate (honest scope)

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".dev/features/regress-stage/PLAN.md:64"
  problem: "The plan never states WHY /pharn-regress adds value over /pharn-build's own Step-4 project gate, which already runs the user's suite at HEAD — so 'regress' risks reading as a redundant re-run rather than a distinct guarantee."
  evidence: '"It detects deterministically-detectable breakage OUTSIDE the feature" → FLOOR: exit-code comparison of two {gate-id:int} maps'
```

> Why it matters: `/pharn-build` Step 4 runs the user's gate at HEAD and halts on RED, so a reader may ask "what's left for regress?" The real, distinct contributions — **(1)** the inside/outside scope _partition_ (build's gate doesn't partition), **(2)** the _base↔head comparison_ (build only checks HEAD), **(3)** _pre-existing exclusion_ (a gate already RED at baseline isn't blamed on the feature), and **(4)** _independence_ (regress runs even when build was skipped/halted) — are implicit in the mechanism but unstated. The command body should articulate them so the guarantee is sharp, not apparently-redundant. (Same shape applies to `/pharn-dev-regress` after `/pharn-dev-build`'s `validate`; surfacing it here keeps the product command honest.)

### P2 — trust propagation (completeness)

```yaml
- type: FINDING
  rule_id: P2
  severity: minor
  file: ".dev/features/regress-stage/PLAN.md:76"
  problem: "The trust audit says 'no new egress' but does not name that running the discovered/--gates suite EXECUTES arbitrary commands from the user's own project (package.json scripts) — the one place /pharn-regress runs code — which is user-trusted and distinct from the untrusted PLAN/SPEC free-text."
  evidence: "No `claude -p`, no LLM-judge, no new egress."
```

> Why it matters: the trust story is actually _fine_ — the executed gates come from the user's own repo (which the user already runs), never from a tainted PLAN/SPEC field — but the audit should _say_ so, closing the loop: the gate commands are never sourced from a free-text/tainted field, so no guaranteed decision (and no executed command) rests on untrusted input. State it rather than leave the reader to infer that `/pharn-regress` runs arbitrary user commands.

### P1 — what is and is NOT tested (honesty)

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/regress-stage/PLAN.md:53"
  problem: "The evals section correctly cites the reused checker's tests for the three behaviors, but does not label that the NEW generic suite-discovery + granularity + config-touch-skip logic is advisory command orchestration with NO test (like dev-regress's Bash) — so 'reuses tested checkers' could read as 'the whole stage is tested.'"
  evidence: "**None — and that is correct, not a gap (P7).** /pharn-regress is a **command**, not a Capability"
```

> Why it matters: the _floor_ (the comparison + the chain check) is reused and tested — true. But the new product behavior (gate discovery, the file-addressable-vs-whole-repo binning, the skip rule) lives in advisory command prose and is **untested by construction** (the two-clocks split: orchestration is advisory). The plan should say so explicitly, so the green test suite is not read as covering the new logic. No new test is owed (it's advisory orchestration), but the honesty label is.

## Summary

The plan is well-grounded, faithfully adapts `/pharn-dev-regress`, correctly reuses both checkers + the fix #7 hooks with **no new floor primitive**, and its guarantee/trust/determinism audits are strong. Two **important** concerns are worth resolving in the command body before/while building:

1. **The config-touch skip is unsound for type-check/compile gates** (cross-file deps) — as written it would silently skip a class of real outside regressions. Restrict the skip to style/format gates; always run cross-file gates at base+head.
2. **Gate-discovery determinism needs a concrete pinned membership rule** (fixed script-name set and/or required `--gates`), not "discover the project's checks" — else a P5 branch rests on classification.

Three **minor** concerns are honesty/completeness: articulate regress's value over build's Step-4 gate (P0/P7); name that the executed suite is the user's own (user-trusted) commands, never a tainted field (P2); and label the new orchestration logic as advisory/untested-by-design (P1). None of these are blocking, and the two important ones are _command-body_ refinements, not plan-structure defects — the increment's shape (one command, reuse-only, command-only) is sound.

`ADVISORY VERDICT: 5 concerns raised (0 blocking-severity, 2 important, 3 minor) — for the human to weigh before /pharn-dev-build. The only guarantee this run made is the spec-hash check result in the header (GREEN). Grilling does NOT certify the plan is good (P0).`
