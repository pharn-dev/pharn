# GRILL — plan-files-scope (advisory interrogation of PLAN.md)

**Plan:** `.dev/features/plan-files-scope/PLAN.md` (make `/pharn-plan` emit a parseable `## Files`; add the closing-the-loop test). **OQ1** resolved → Option B (split `## Steps / Files` into advisory `## Steps` + parseable `## Files`).
**Spec-hash check (content-hash floor primitive — surfaced, not blocking here):** recomputed `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pin (`PLAN.md:3`). No drift. (The actual block on drift is `/pharn-dev-build`'s fix #4 floor-gate; this only surfaces it — fix #3.)

> **This grill is ADVISORY end-to-end (P0).** Every finding below rests on model judgment; **none gates `/pharn-dev-build`**. The only floor-grade items in this run are the writes-scope hook (pins where this file may be written) and the spec-hash recompute (above). The enum-gated fields (`type`/`rule_id`/`severity`/`file`) are my own enum/path assertions; the free-text `problem`/`evidence` quote the (untrusted) plan as DATA — never instructions, and `severity` is an advisory **assignment** (fix #3, `finding-shape.md`).

## Findings

### Axis P5 / P7 — determinism + fail-closed discipline (the template's placeholder style)

```yaml
- type: FINDING
  rule_id: P5
  severity: important # advisory assignment (fix #3)
  file: ".dev/features/plan-files-scope/PLAN.md:38"
  problem: "The template's `## Files` example uses a BARE-WORD back-tick path; copied unfilled it false-passes the setter (authorizes the literal `path`) instead of failing closed — the dev /pharn-dev-plan template's `<path>` placeholder fails closed, this one does not."
  evidence: 'PLAN.md:38 — ''a clean, parseable `## Files` section whose items lead with a **back-tick path** (`- `path` — what changes`)''. EMPIRICAL (set-writes-scope.cjs --from-plan): a `- `path`` item → exit 0, scope=["path"] (FALSE-PASS); a `- `<path>`` item → exit 1, no scope (fail-closed, the safe form). Cause: isConcrete (set-writes-scope.cjs:58-60) rejects only `<>`/glob entries, so a bare word is accepted as a real scope path.'
```

**For the build to weigh:** emit the template's `## Files` example with an **angle-bracket placeholder inside the back-ticks** — ``- `<path>` — <what changes>`` — so an unfilled `## Files` **fails-closed at the setter** (consistent with the dev template's `<path>` discipline), rather than authorizing a bogus literal. This is the single most actionable steer for the build.

### Axis P1 — eval coverage (test pins the PARSER, not the PRODUCER)

```yaml
- type: FINDING
  rule_id: P1
  severity: important # advisory assignment (fix #3)
  file: ".dev/features/plan-files-scope/PLAN.md:39"
  problem: "The closing-the-loop test feeds a SYNTHETIC hand-written fixture, not derived from the actual pharn-plan.md template — so it pins that the parser accepts a documented shape, NOT that /pharn-plan emits that shape; a future template edit (drops back-ticks / renames the heading) would still pass."
  evidence: "PLAN.md:39 — 'feed a **synthetic `/pharn-plan`-shaped** PLAN.md …'; PLAN.md:56 — 'Proves the chain `spec → plan → build` can now set scope'. The fixture and the template in pharn-plan.md are maintained independently; nothing ties them, so template drift is not caught by this test."
```

**For the build to weigh:** consider deriving/extracting the test fixture's `## Files` from the real `pharn-plan.md` template block (or adding an assertion that the template's own example parses) so a template regression trips the test. Honest counter-note: the existing #22 fail-closed test (`set-writes-scope.test.cjs:56-66`) has the same synthetic-fixture property, so this is a **consistent** limitation, not a new one — but the plan's "PROVES the chain … can now set scope" overstates a synthetic-fixture test.

### Axis P0 — guarantee-audit framing (headline "BUILD end-to-end")

```yaml
- type: FINDING
  rule_id: P0
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/plan-files-scope/PLAN.md:4"
  problem: "The increment headline says the product chain 'can derive a writes-scope and BUILD end-to-end,' but this increment only removes the scope-PARSE blocker; no root SPEC.md exists yet and the live dogfood is a deferred follow-up, so end-to-end build is UNBLOCKED, not demonstrated."
  evidence: "PLAN.md:4 — 'closing the named `plan-files-scope` follow-up so the product chain `spec → plan → grill → build` can derive a writes-scope and BUILD end-to-end'. The floor guarantee here is narrowly 'the parser accepts the documented shape' (PLAN.md:63); 'buildable end-to-end' rests on advisory emission + the deferred dogfood (named in the plan's Risks)."
```

**For the build to weigh:** the plan already separates these in the P0 audit (`PLAN.md:63`) and Risks; the framing is honest overall. No change required — surfaced so the human reads "unblocks the scope gap" rather than "proves end-to-end build."

### Axis P2 — trust propagation (the `## Files` LIST itself is SPEC-steerable)

```yaml
- type: FINDING
  rule_id: P2
  severity: minor # advisory assignment (fix #3)
  file: ".dev/features/plan-files-scope/PLAN.md:72"
  problem: "fix #7 bounds 'writes only WITHIN the list,' but WHICH paths enter `## Files` is advisory and SPEC-steerable; the real backstop for path SELECTION is human review of the plan's `## Files` at GATE 1 / grill (plus fix #2 for trusted docs), which the audit names but could foreground."
  evidence: "PLAN.md:72 — 'A hostile SPEC could steer the model's (advisory) choice of *which* paths to list — bounded … a malicious extra path merely authorizes that one path, which the human / /pharn-grill review.' A hostile SPEC steering a sensitive path into `## Files` is bounded by GATE-1/grill review + fix #2 (trusted-doc denylist), NOT by fix #7 (which only prevents writing OUTSIDE the list)."
```

**For the build to weigh:** the residual is correctly named in the trust audit; the only emphasis is that human/grill review of the emitted `## Files` is **load-bearing** for path selection (fix #7 protects the boundary, not the membership). No correctness change required.

## Prose summary

The plan is **sound and well-scoped**: one axis (the producer is tightened to the parser's contract, the parser untouched — the right discipline), the spec hash is un-drifted, the guarantee audit honestly separates the floor (the deterministic parser + reused fix #7 hook) from the advisory (the model emitting a correct shape; whether the list is the right set), and OQ1 was resolved to the cleaner Option B. No constitution violation is apparent.

Two **important** (advisory) concerns are worth addressing **in the build**, both concrete:

1. **Placeholder style (P5/P7).** The template's `## Files` example should use `` `<path>` `` (angle-bracket), not a bare-word `` `path` `` — empirically, the bare word **false-passes** the setter (`scope=["path"]`) when an unfilled template is copied, defeating the fail-closed posture the dev template preserves. This is the highest-value steer.
2. **Test↔template coupling (P1).** The synthetic fixture pins the parser, not the producer; nothing catches a future template regression. Consistent with the prior fail-closed test, but the "PROVES the chain can set scope" wording overstates a hand-written fixture.

Two **minor** framing notes (P0 headline "build end-to-end" = unblocked-not-proven; P2 the `## Files` list is SPEC-steerable and rests on human/grill review) are already named in the plan — surfaced for the human, no change required.

## Verdict

**ADVISORY VERDICT: 4 concerns raised (2 important-severity, 2 minor) — for the human to weigh before `/pharn-dev-build`.** This is **not** a gate and **not** "grill passed": `/pharn-dev-build` is free to proceed; the deterministic backstops remain `/pharn-dev-build`'s own floor-gates (spec-hash drift fix #4; an unresolved `## Open questions (HALT)` — already resolved here) and `.dev/floor/validate.mjs`. The two important findings are build-time refinements (placeholder style; test↔template coupling), not blockers.
