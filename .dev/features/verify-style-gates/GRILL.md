# GRILL — verify-style-gates (advisory interrogation of PLAN.md)

**Plan:** `.dev/features/verify-style-gates/PLAN.md` (add `format:check` + `lint:md` to `/pharn-dev-verify`'s canonical gate map — L9's remedy). **OQ1** resolved → NO new test (P7).
**Spec-hash check (content-hash floor primitive — surfaced, not blocking):** recomputed `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pin (`PLAN.md:3`). No drift. (The block on drift is `/pharn-dev-build`'s fix #4 gate; this only surfaces it.)

> **This grill is ADVISORY end-to-end (P0).** No finding gates `/pharn-dev-build`. Enum-gated fields (`type`/`rule_id`/`severity`/`file`) are my own assertions; free-text `problem`/`evidence` quote the (untrusted) plan as DATA; `severity` is an advisory assignment (fix #3).

## Findings

### Axis P0 — guarantee-audit framing (the remedy is advisory-deep)

```yaml
- type: FINDING
  rule_id: P0
  severity: important # advisory assignment (fix #3) — a framing/residual to weigh, not a defect
  file: ".dev/features/verify-style-gates/PLAN.md:45"
  problem: "L9's remedy is implemented as ADVISORY command prose (the gate set in pharn-dev-verify.md) with no floor or test lock that the two style gates STAY in the set; the only proof is this run's dogfood, so a future edit could silently drop format:check/lint:md and re-open L9's hole, undetected."
  evidence: "PLAN.md:45 — 'The proof is the dogfood … will run format:check + lint:md … demonstrating the widened set end-to-end'; PLAN.md:67 (OQ1) — 'the real risk … the command prose dropping the gates — is not unit-testable without an L6-forbidden prose grep'. check-verify.mjs (the floor verdict) covers whatever map is assembled, but the map's COMPOSITION is advisory orchestration; nothing floor-prevents its regression."
```

**For the human to weigh:** this is **inherent to command orchestration** (the two-clocks reality — every verify gate's _presence_ is advisory; only the verdict over the assembled map is floor), not a defect, and the plan names it honestly (OQ1). But note the recursion: L9's fix has the _same_ structural property L9 describes — an advisory gate set, not floor-locked. A genuinely floor-locked fix would require turning verify's gate set into a **structured, testable artifact** (so a test could assert `format:check`/`lint:md` ∈ the set) — a larger refactor, out of this one-axis increment and arguably over-engineering (P7). The NO-test decision is P7-defensible; the residual is that the remedy is advisory-deep.

### Axis P5 / P7 — the added gates are WHOLE-REPO (unstated scope)

```yaml
- type: FINDING
  rule_id: P7
  severity: minor # advisory
  file: ".dev/features/verify-style-gates/PLAN.md:28"
  problem: "format:check and lint:md are WHOLE-REPO gates (like the existing validate/lint), so after this change /pharn-dev-verify's PASS requires the ENTIRE repo to be style-clean, not just the increment's files — the plan does not state this scope."
  evidence: "PLAN.md:28 names the gates but not their granularity; the existing command's granularity note already flags test/validate/lint as whole-repo. A pre-existing style issue ANYWHERE would now FAIL verify (none today — npm run check is green at baseline), which is the intended absolute 'is the repo green with this in it' semantics, but worth stating in the build's granularity note."
```

**For the build to weigh:** when editing the command, extend its granularity note to say `format:check`/`lint:md` are whole-repo (consistent with `validate`/`lint`) — so the absolute "all green" semantics is explicit. No correctness change.

## Prose summary

The plan is **sound, minimal, and well-scoped**: one axis (a command-prose widening), `check-verify.mjs` correctly left **unchanged** (it is genuinely generic over gate keys, confirmed at `check-verify.mjs:108-118`), `/pharn-dev-regress` correctly left alone (its style-gate skip is sound and a separate axis), the spec hash is un-drifted, and the guarantee audit honestly labels the verdict FLOOR (reused) and the gate-set widening ADVISORY (two clocks). The NO-test decision (OQ1) is P7-defensible.

Two advisory concerns: **(important, P0)** the remedy is _advisory-deep_ — the gate set lives in command prose with no floor/test lock, so a future edit could silently re-open L9's hole; inherent to orchestration and named in the plan, surfaced for the human. **(minor, P7)** the added gates are whole-repo; the build should state that in the granularity note.

**One execution note (not a plan defect):** the dogfood proof is real **only if** this increment's own `/pharn-dev-verify` run uses the **newly-built** gate set (reads the edited `pharn-dev-verify.md` with `format:check`/`lint:md`), not the pre-edit set — otherwise it does not actually exercise the change. The verify stage should run the two style gates as canonical, first-class gates in the results map.

## Verdict

**ADVISORY VERDICT: 2 concerns raised (1 important-severity, 1 minor) — for the human to weigh before `/pharn-dev-build`.** Not a gate, not "grill passed": `/pharn-dev-build` is free to proceed; the deterministic backstops remain its own floor-gates (spec-hash drift fix #4; unresolved `## Open questions (HALT)` — already resolved) and `.dev/floor/validate.mjs`. Neither finding is a blocker; the important one is a framing residual the plan already names.
