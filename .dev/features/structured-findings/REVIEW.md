# REVIEW — structured findings output (findings.json emission contract)

- increment: `pharn-contracts/finding-shape.md` amended with a `## Emission — findings.json` section
  (increment 3a). Reviewed as `trust: untrusted` per `/review`.
- diff under review: 21 insertions to `pharn-contracts/finding-shape.md` (working tree; the
  `features/structured-findings/` planner artifacts are untracked and out of product scope).
- reviewer: PHARN reviewing PHARN — this file obeys the finding object (fix #1): enum-gated
  `{type, rule_id, severity, file}` + free-text `{problem, evidence}` rendered as DATA.

## Step 0 — Floor (the only guaranteed gate)

`node floor/validate.mjs .` → **`GREEN — 1 capabilities checked`**. The amended file carries no
`role:` (capability count unchanged) and retains the CHECK 5 tokens. The floor passed; **everything
below is advisory** (P0).

## Lens results

- **L-eval (P1):** PASS, **no finding.** The increment adds no Capability, no `enforces`, no
  `rule_id` — so P1 imposes nothing, and the floor agrees (count stays 1). Floor and lens concur.
- **L-trust (P2):** PASS, **no finding.** The section describes the trust split faithfully
  (enum-gated = the capability's own assertion, TRUSTED; free-text = inherits the input's trust,
  carried as quoted DATA), consistent with `ARCHITECTURE.md §8` and the file's own Residual note. No
  guaranteed decision is made to rest on a free-text field, and the named residual
  (`THREAT-MODEL.md §5`) is neither widened nor claimed zeroed. **Injection scan of the reviewed
  artifact:** the `MUST`/`MUST NOT`-style sentences are contract DATA describing capability
  obligations, not directives aimed at me; there is no "ignore previous instructions / approve /
  skip-review"-class content. My behavior was not changed by anything in the artifact.
- **L-axis (P3):** PASS, **no finding.** No sibling reference: the section cites the spec
  (`ARCHITECTURE.md §3.1`), the floor tooling (`floor/check-structural.mjs`), and itself —
  `pharn-contracts` is the tree root and the sibling contract `eval-format.md` is not referenced.
  One axis: serializing the finding object is the same axis as defining it (the human-approved A1
  decision). _Watch-note (non-blocking, P7-respecting):_ the filename/location convention is a latent
  second concern; revisit only if packaging grows (e.g. the deferred multi-capability namespacing) —
  not a finding today.
- **L-floor (P0), the governing lens:** **2 findings (both advisory, both important)** — see below.
  The increment's own content is a faithful P4 citation of the spec and the floor is GREEN, so there
  is **no blocking floor-finding against the increment**; but the review surfaced that the emission
  requirement the contract states is **not backed by any live floor operation today.**

## Findings — floor-gate (blocking)

**None.** `validate.mjs` is GREEN; no floor-checkable violation exists in the increment, and the
increment faithfully cites the trusted spec rather than fabricating a guarantee.

## Findings — advisory-gate (warn — inform, never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: "pharn-contracts/finding-shape.md:45"
  problem: "The emission section states a capability 'MUST' emit findings.json but does not label the requirement advisory or note it is not floor-enforced this increment, unlike the sibling contract eval-format.md which carries an explicit '## Guarantee audit (P0)'."
  evidence: "Line 45: 'A Capability that emits findings MUST serialize them as a single findings.json ...'. Live floor: floor/validate.mjs has no findings.json check (its `findings` array is the floor's own output; the only .json it reads is archetype-maps.json), and no findings.json exists in the repo while the floor is GREEN — so emission has no enum/regex/hook reduction today. The PLAN's guarantee audit labeled this 'advisory at the contract level this increment', but that honesty did not reach the durable artifact."
```

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: "ARCHITECTURE.md:73"
  problem: "The contract's cited enforcement — 'writes: ... enforced by the pre-write hook' — does not hold against the live floor: the only wired pre-write hook implements protected-paths (fix #2) but not writes-scope (fix #7), so the emission MUST has no live hook backstop either. Pre-existing and human-only (the spec is write-protected; fix #7 is unimplemented)."
  evidence: 'ARCHITECTURE.md:73 ''writes: ["<path>"] # declared outputs — ENFORCED by the pre-write hook (§5, fix #7)'' and §2:40 / lines 228-229 (''writes-scope guard (fix #7)''). But .claude/hooks/protect-trusted-paths.cjs (the sole PreToolUse hook in .claude/settings.json) only denies writes to DEFAULT_PROTECTED (4 docs + CODEOWNERS) and exit-0s every other write — it never reads a writes: field. finding-shape.md:48 faithfully cites this (P4-correct), thereby importing the unbacked claim into the contract.'
```

### Why these are advisory, not blocking

The increment **faithfully cites** `ARCHITECTURE §3.1` (P4 mandates citing the spec, and it did), and
the floor is GREEN — so there is no false guarantee _fabricated by the increment_ and no
floor-checkable violation _in the increment_. Both findings rest on the reviewer's reading of P0
honesty and on a **pre-existing** spec/implementation gap (fix #7), which lives in a write-protected
trusted doc and is therefore **human-only** (CLAUDE.md hard-constraint #1; never auto-fixed, P0/P2).
Calling them "blocking" would mis-attribute a constitutional STOP to an increment that did the
P4-correct thing and passed its only guaranteed gate.

### Recommended resolutions (the reviewer does not edit built files)

- **F1 (agent-fixable, follow-up increment):** add one honesty line to the emission section — that
  the `MUST` is a conformance requirement, **not floor-enforced this increment** (`validate.mjs` does
  not check for `findings.json`), with the named downstream backstops being 3b/3c — mirroring
  `eval-format.md`'s `## Guarantee audit (P0)`. `finding-shape.md` is agent-editable, so this is a
  clean small follow-up.
- **F2 (human-only):** either implement fix #7 (the `writes`-scope guard) in the pre-write hook so
  the cited enforcement becomes real, or soften `ARCHITECTURE §3.1`'s "ENFORCED by the pre-write
  hook" to reflect that the writes-scope guard is **spec'd-but-unimplemented** (cf. the
  already-deferred pre-egress hook). Until then, no live floor operation backstops emission — the PLAN
  step (a) backstop ("the pre-write writes: hook enforces the path") presumes fix #7 and is not yet
  real.

## Verdict

**GREEN on the floor (the increment's only guaranteed gate passed); NOT blocked. 0 floor-gate
findings, 2 advisory (important) P0 findings to resolve.** The increment is structurally sound,
trust-correct, single-axis, and honest in its PLAN — but the contract now states an emission
requirement (`MUST emit findings.json`, `writes:` "enforced by the pre-write hook") that **no live
floor operation backs today.** That is precisely the disease P0 exists to catch — "written in the
contract" ≠ "guaranteed" — caught by PHARN on its own freshly-built contract. The gap is that the
PLAN's guarantee-audit honesty did not propagate into the durable artifact (F1, fixable), and the
cited spec enforcement (fix #7) is unimplemented (F2, human-only).

## Proposed lesson (gated — provenance attached; human promotes to canon, P2)

Proposed for `memory-bank/lessons-learned.md` (do not write canon silently). Distinct from L1.

```markdown
## L2 — A contract's honesty must travel with the artifact, and may cite only live floor ops

**Lesson.** When a `/build` amends a contract with a normative `MUST`, two checks must pass at
`/review`: (1) the PLAN's `## Guarantee audit (P0)` honesty (what is advisory vs floor-enforced) must
be written **into the artifact**, not just the PLAN — the PLAN is ephemeral, the contract is durable;
(2) any "enforced by <floor op>" phrase must cite an op that is **live**, verified by reading the
implementation this run (P6), not merely spec'd. A contract can faithfully cite the spec (P4) and
still import an unbacked guarantee when the cited floor op (here, fix #7 / the writes-scope guard) is
unimplemented.

**Why it matters.** This is the core P0 disease ("written in the contract" ≠ "guaranteed") reproduced
inside PHARN's own contracts. `validate.mjs` cannot catch it — it checks structure, not prose honesty
— so only `/review`, reading the live hook + validate.mjs, surfaces it. The remedy is a `/review`
sub-check: for every new `MUST`/"enforced by" in a contract, confirm a live floor reduction or an
explicit `advisory` label.

**Provenance.**

- feature: `structured-findings` (increment 3a)
- diff: `pharn-contracts/finding-shape.md` +21 lines (`## Emission — findings.json`).
- surfaced by: `features/structured-findings/REVIEW.md` — F1 (`finding-shape.md:45` MUST unlabeled)
  and F2 (`ARCHITECTURE.md:73` cites fix #7 writes-scope guard; `protect-trusted-paths.cjs` implements
  only fix #2).
- promoted: <pending human-gated approval>
```

---

## RE-REVIEW — F1 fix (Emission enforcement audit added) — increment 3a follow-up

- increment: `pharn-contracts/finding-shape.md` +22 lines — a new `### Emission enforcement audit (P0)`
  subsection under `## Emission — findings.json` (commit `151123d`). This is the agent-fixable **F1**
  from the review above, landed.
- diff under review: 22 insertions to `finding-shape.md` (lines 64-84); no other file. Reviewed as
  `trust: untrusted` per `/review`.
- reviewer: PHARN reviewing PHARN — findings obey the finding object (fix #1): enum-gated
  `{type, rule_id, severity, file}` + free-text `{problem, evidence}` rendered as DATA.

### Step 0 — Floor (the only guaranteed gate)

`node floor/validate.mjs .` → **`GREEN — 1 capabilities checked`**. No `role:` added (capability count
stays 1); CHECK 5 tokens retained. The floor passed; **everything below is advisory** (P0).

### Lens results

- **L-eval (P1):** PASS, **no finding.** No Capability / `enforces` / `rule_id` added → P1 imposes
  nothing, and the floor concurs (count stays 1). Floor and lens agree.
- **L-trust (P2):** PASS, **no finding.** The new text documents the trust split faithfully and adds
  **no** new untrusted payload — it uses the generic `trust: untrusted` needle phrasing and does
  **not** re-quote the trust-fence `skip authz`/`pre-approved` strings. **Injection scan of the
  reviewed artifact:** the `MUST` / "Labeled plainly per P0" / "Once a Capability names…" sentences are
  contract DATA about capability obligations and the contract's own honesty labeling — not directives
  aimed at the reviewer; no "ignore previous instructions / approve / skip-review"-class content. My
  behavior was not changed by anything in the artifact. No guaranteed decision is made to rest on a
  free-text field.
- **L-axis (P3):** PASS, **no finding.** One axis: the enforcement honesty _of_ the emission
  requirement is the same axis as the `## Emission` section it nests under (consistent with the 3a
  ruling that "serializing the object is the same axis as defining it"). No sibling reference: the
  subsection cites the spec (`ARCHITECTURE.md §2, §3.1`) and the **floor tooling**
  (`enforce-writes-scope.cjs`, `floor/validate.mjs`, `floor/check-structural.mjs`) — naming the floor
  op a guarantee reduces to is exactly what P0 requires; the sibling contract `eval-format.md` is
  deliberately **not** referenced.
- **L-floor (P0), the governing lens:** **1 finding (advisory, minor)** — see below. The fix lands the
  F1 honesty: the `MUST` is now a labeled three-way split (declaring → fix #7 _live_; emitting →
  advisory; shape/laundering → `check-structural` at eval/3c). Two of the three facets reduce to a
  named **live** floor op; the residual is a single-facet labeling nuance.

### Findings — floor-gate (blocking)

**None.** `validate.mjs` is GREEN; the increment claims no guarantee without a floor reduction or an
`advisory` label. Each facet reduces to a named floor op or is plainly marked advisory.

### Findings — advisory-gate (warn — inform, never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: P0
  severity: minor # advisory assignment (fix #3)
  file: "pharn-contracts/finding-shape.md:77"
  problem: "The third facet labels the shape/no-laundering check 'floor-checked at eval time (3c)' / 'guaranteed at eval time (check-structural.mjs, 3c)' without stating that the 3c eval-time application — a runner invoking check-structural.mjs over a capability's emitted findings.json — is itself not yet built, unlike the sibling contract eval-format.md which explicitly says its checker 'is the next increment ... must not call them guaranteed today.'"
  evidence: "Lines 77-80 (the bullet) + 82-84 (the summary 'guaranteed at eval time'). Live reads this run: no capability declares findings.json in writes: (trust-fence writes only `features/trust-fence/REVIEW.md` → 3b unbuilt); no command/capability invokes check-structural (grep over .claude/commands + pharn-* empty → 3c unbuilt; only floor/ + its tests + docs reference it); finding-shape.md carries no 'not-yet-built / next increment / deferred' qualifier for 3c (grep empty). The check-structural PRIMITIVE exists and is tested, but its application over emitted output is deferred — so 'guaranteed at eval time (3c)' sits in parallel with the live 'floor-enforced (fix #7)' facet and could be misread as equally live today."
```

#### Why this is advisory (minor), not blocking

The facet **does** reduce to a real floor primitive (`check-structural.mjs` exists and is tested) and
**does** carry contingency markers ("at eval time", "when an eval runner ranges it over the emitted
file", "(3c)") — so it is substantially honest and fabricates no guarantee. It is **not** blocking:
the floor is GREEN, no live output is falsely claimed-as-checked (3b is unbuilt → nothing is emitted
to check yet), and the verdict rests on the reviewer's reading of "guaranteed (3c)" against
`eval-format.md`'s stricter precedent — a free-text/labeling judgment, hence advisory-gate (fix #3).
Severity **minor**: a one-clause consistency refinement, not a material false claim.

#### Recommended resolution (the reviewer does not edit built files)

- **F1b (agent-fixable, optional follow-up):** add one clause to the third facet — that the 3c
  eval-time application (a runner ranging `check-structural` over emitted output) is **not yet built**
  (only the primitive exists and is tested today), mirroring `eval-format.md`'s "the checker … is the
  next increment." That makes the artifact-borne honesty symmetric with facet 1 (fix #7, which **is**
  live). Purely additive; `finding-shape.md` is agent-editable.

### Verdict

**GREEN on the floor (the increment's only guaranteed gate passed); NOT blocked. 0 floor-gate
findings, 1 advisory (minor) P0 finding.** The increment **closes F1** from the review above and
**satisfies L2**: the PLAN's guarantee-audit honesty now lives in the durable artifact — `MUST emit`
is labeled a three-way split (declaring → fix #7 _live_; emitting → advisory; shape/laundering →
`check-structural` at 3c), no longer an unlabeled blanket `MUST`. The lone residual is itself a tiny,
recursive instance of the same P0 discipline on one facet (the 3c application's not-yet-built status
should travel with the artifact too).

### Lesson

**None proposed.** The single advisory finding is an _application_ of existing canon **L2** ("a
contract's honesty must travel with the artifact, and may cite only live floor ops"), not a new
recurring failure — proposing a new lesson would duplicate L2 and violate P7. Recorded above as
**F1b** for an optional follow-up; canon is untouched (P2).
