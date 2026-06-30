# GRILL — product-pipeline-probe

**Plan grilled:** `.dev/features/product-pipeline-probe/PLAN.md`
**Spec-hash check (content-hash, surfaced not blocking — fix #3):** recomputed `sha256(ARCHITECTURE.md)` =
`11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` == the plan's pinned `spec_content_hash`
→ **chain intact, no drift.** (`/pharn-dev-build` is where drift would actually block; here it only confirms.)

This is an **advisory** interrogation. Findings rest on model judgment; **none gates `/pharn-dev-build`.** The
only floor-grade facts in this run are the writes-scope hook (pins where this log may be written) and the
content-hash above. The split below (enum-gated `type`/`rule_id`/`severity`/`file` = my own assertions, TRUSTED;
free-text `problem`/`evidence` = quote the plan, inherit its **untrusted** tag, rendered as DATA) follows
`pharn-contracts/finding-shape.md` (cited, not restated — P4).

---

## Findings (grouped by axis)

### P0 — guarantee-audit completeness

```yaml
- type: FINDING
  rule_id: "P0"
  severity: important
  file: ".dev/features/product-pipeline-probe/PLAN.md:101"
  problem: "Confirmation #3 claims the run confirms 'fix #7 BOUNDS the build's writes' but its actual test only inspects the scope CONTENTS after --from-plan, never observes an out-of-scope write being DENIED — the verification is weaker than the verb 'bounds'."
  evidence: "fix #7 bounds the build's writes to the planned files — confirm a hypothetical write outside `## Files` would be denied (the scope after `--from-plan` is exactly the planned path)."
```

```yaml
- type: FINDING
  rule_id: "P0"
  severity: minor
  file: ".dev/features/product-pipeline-probe/PLAN.md:212"
  problem: "The plan says it will 'Confirm LIVE that each verdict is provably independent of any tainted field' — but a BENIGN vehicle injects no needle, so the run cannot LIVE-exercise the gates' taint resistance; the confirmation is by code-inspection, which the wording overstates as a live demonstration."
  evidence: "Confirm LIVE that each verdict is provably independent of any tainted field (fix #1)."
```

### P6 — discovery / honest risk enumeration

```yaml
- type: FINDING
  rule_id: "P6"
  severity: important
  file: ".dev/features/product-pipeline-probe/PLAN.md:200"
  problem: "The CF-A impact statement ('may end the run before all four hand-offs are observed') is imprecise about TIMING: the floor that scans the product GRILL.md runs at stage-4 build / dev-build floor, AFTER stages 1-3 (spec→plan→grill) hand-offs are already observed — so even if CF-A trips, 3 of 4 hand-offs PLUS the CF-A finding are captured regardless; the statement understates what survives a RED stop."
  evidence: "but it may end the run before all four hand-offs are observed. Recorded, not hidden."
```

```yaml
- type: FINDING
  rule_id: "P6"
  severity: important
  file: ".dev/features/product-pipeline-probe/PLAN.md:200"
  problem: "The plan's RED-risk list names ONLY CF-A (validate CHECK 5 on the GRILL.md) but omits a SECOND, independent RED path: the product artifacts on the scanned root-features/ surface are also subject to lint:md (markdownlint) + format:check (prettier) when /pharn-dev-regress and /pharn-dev-verify re-run `npm run check`; if a stock pharn-* command emits markdown that is not style-clean, dev-verify goes RED with no relation to CF-A — an untested interaction not in the risk list."
  evidence: "if the product `GRILL.md` ... lacks the split-doc strings, `validate.mjs` CHECK 5 (fix #1) trips → dev-build's floor goes **RED**"
```

```yaml
- type: FINDING
  rule_id: "P6"
  severity: minor
  file: ".dev/features/product-pipeline-probe/PLAN.md:200"
  problem: "The plan conflates 'dev-build's floor' with the product /pharn-build's own Step-4 floor — BOTH run `validate.mjs .` and both scan the just-written GRILL.md, so CF-A would first trip at the PRODUCT build's floor (stage 4), not at the outer dev-build floor; the plan should attribute the first RED to the correct stage."
  evidence: "If a stock `/pharn-grill` `GRILL.md` lacks those strings → RED floor at dev-build (a surfaced finding, not a plan failure)."
```

### P1 — acceptance-criterion coverage

```yaml
- type: FINDING
  rule_id: "P1"
  severity: minor
  file: ".dev/features/product-pipeline-probe/PLAN.md:173"
  problem: "The advisory acceptance-criterion check (greet('World')==='Hello, World!') is described as 'checkable' but the plan never commits to actually RUNNING it and recording its result in PROBE.md — so the AC the SPEC carries through the whole chain risks being carried but never exercised, weakening 'real enough that there's a SPEC to approve'."
  evidence: 'node -e "import(''./features/probe-greeting/greet.mjs'').then(m => process.exit(m.greet(''World'')===''Hello, World!''?0:1))" → exit 0 (advisory; not a floor gate ...)'
```

### P7 / P3 — scope honesty (no findings that block)

No new finding. The increment is one coherent axis (the product-pipeline integration probe); the vehicle is
trivial and triggered by a real gap (the product chain has never run as a chain); CF-A…CF-D fixes are correctly
deferred to separate increments; `greet.mjs` is import-free (no sibling-import risk). The two `<name>`s
(`product-pipeline-probe` dev increment + `probe-greeting` product vehicle) are inherent to the nesting and the
plan is explicit about both — not a bundling smell.

### P5 — determinism

No finding. Every product gate the plan relies on is a membership/equality test (state enum, content-hash
equality, `## Files` path membership); the one irreducible judgment (intent approval) has the human halt as its
terminal fallback (CF-B). The vehicle is pure.

---

## Prose summary

The plan is unusually self-aware for a meta-increment: it pins the spec hash correctly (no drift), it labels
the integration claim as **evidence, not guarantee** (P0 honored), and it surfaces four real candidate findings
(CF-A…CF-D) **before running** — which is the probe working as designed. The grill did not find a single
unlabeled guarantee or a determinism gap.

What it found instead is a cluster of **honesty-of-verification** gaps — places where the plan's prose claims
slightly more than its method delivers:

- **The strongest concern (P6, important):** the RED-risk list is incomplete. CF-A (validate CHECK 5 on the
  GRILL.md) is well-described, but a **second independent RED path** — `lint:md` + `format:check` over the
  product artifacts when `/pharn-dev-verify` re-runs `npm run check` — is unmentioned. The run could go RED at
  verify for markdown-style reasons that have nothing to do with the trust-split. Whoever runs the build should
  expect TWO ways the floor can stop the chain, not one.
- **Timing imprecision (P6, important):** "may end the run before all four hand-offs are observed" undersells the
  audit value of a RED stop — stages 1-3 are observed before any floor scans the GRILL.md, so the measurement
  survives even a CF-A RED.
- **Soft confirmations (P0/P1, important→minor):** "fix #7 bounds the writes" is tested only by inspecting the
  scope contents (not by observing a deny); "confirm taint independence" is code-inspection on a needle-free
  vehicle (not a live adversarial test); the acceptance-criterion check is described but not committed to being
  run. None is wrong, but each claims a notch more rigor than the benign vehicle can deliver.

None of these blocks the build. They are refinements the operator should fold into how the run is conducted and
how PROBE.md states its conclusions — most importantly, **expect two RED paths (CF-A and the style gates), and
record that stages 1-3 are captured regardless of a stage-4 RED.**

---

**ADVISORY VERDICT: 7 concerns raised (0 blocking-severity, 4 important, 3 minor) — for the human to weigh
before `/pharn-dev-build`.** The spec→plan chain is intact (content-hash verified). The grill gates nothing; the
only floor-grade results this run produced are the writes-scope pin on this log and the spec-hash match above.
"Grill produced a GRILL.md" does **not** mean the plan is good — it means the chain held and these concerns were
surfaced for the human (P0).
