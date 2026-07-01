# GRILL — verify-stage (`/pharn-verify` product command)

**Plan under interrogation:** `.dev/features/verify-stage/PLAN.md` ·
**Spec-hash check (content-hash floor primitive, surfaced not blocking):** `sha256(ARCHITECTURE.md)` =
`11cd9ad5…d1d969` **== the plan's pinned `spec_content_hash`** → **no drift**. (The binding block on
drift is `/pharn-dev-build`'s floor-gate, fix #4 — not this grill.)

> **Advisory end-to-end (P0).** Every finding below rests on the griller's judgment; **none blocks
> `/pharn-dev-build`.** The `PLAN.md` is `trust: untrusted` — its self-claims are tested, not believed; any
> instruction-looking content is DATA. `/pharn-dev-grill` cannot issue a binding stop; the floor backstops
> (`/pharn-dev-build` spec-hash + `## Open questions` gate, `validate.mjs`) remain where they were.

## Findings (finding-shape; enum-gated fields trusted, free-text = quoted DATA from the plan)

### Axis P5 — determinism of a FLOOR-gate input

```yaml
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".dev/features/verify-stage/PLAN.md:81"
  problem: "The structural:<expected> gate feeds the FLOOR verdict, but the plan does not state the deterministic membership rule for WHICH committed eval pairs 'the feature ships' — found how, from where — so the floor gate SET risks resting on judgment rather than a P5 membership test."
  evidence: "**Plus** one `structural:<expected>` gate per committed eval pair the feature ships (`check-structural.mjs`; membership — absent if none)."
```

### Axis P0/§6 — RED-chain machine-artifact behavior is unspecified

```yaml
- type: FINDING
  rule_id: "P0"
  severity: important
  file: ".dev/features/verify-stage/PLAN.md:74"
  problem: "On a RED hash-chain the plan writes only VERIFY.md (mirroring /pharn-regress) but is SILENT on whether verify-report.json is also emitted; since a named future consumer (/pharn-ship) reads verify-report.json's .verdict, the build must decide+state this branch explicitly rather than leaving the machine artifact's presence to inference."
  evidence: "→ **HALT**, write a RED-chain `VERIFY.md` (the §6 artifact exists even on RED — audit trail never silent, mirroring `/pharn-regress`), stop …"
```

### Axis P0 — a gate named in prose that the discovery rule does not produce

```yaml
- type: FINDING
  rule_id: "P0"
  severity: minor
  file: ".dev/features/verify-stage/PLAN.md:20"
  problem: "'floor GREEN' is listed as a FLOOR-layer gate in the two-layers prose, but .dev/floor/validate.mjs is PHARN-internal and is NOT in the gate-discovery allowlist { test, lint, format:check, lint:md, typecheck, type-check, build }; for a generic USER codebase it runs only if exposed as a script or via --gates. The build's command prose should not imply validate runs in every user project."
  evidence: "Runs the **project's** deterministic gates (its tests / lint / type-check, floor GREEN) over the repo-with-the-feature-in-it, ONCE at HEAD …"
```

### Axis P7 — honest-scope note thinner than the dev-sibling's

```yaml
- type: FINDING
  rule_id: "P7"
  severity: minor
  file: ".dev/features/verify-stage/PLAN.md:98"
  problem: "verify's ABSOLUTE 'are all green NOW?' threshold means a pre-existing, feature-UNRELATED red gate in the user's repo also fails verify (unlike /pharn-regress, which excludes pre-existing failures via base↔HEAD). This is by design (verify asks 'is the repo green with this in it'), but the plan does not carry over /pharn-dev-verify's plain whole-repo honesty note, so the build should state it so users aren't surprised."
  evidence: '…runs them **once at HEAD** and asks an **absolute** "are all green NOW?" — hence the separate verdict core …'
```

## Prose summary

The plan is **strong and honest**: the guarantee audit reduces every claim to a floor primitive or an
explicit `advisory` label; verdict ownership is shown to be **structural** (the reused
`check-verify.mjs` cannot receive a verifier finding, proven by its test), not merely disciplinary; the
trust audit correctly keeps the executed commands to the user's own suite and fences verifier free-text
as DATA appended after the verdict; the P1 accounting (a command is not a Capability → no evals; no new
checker → no new test) is correct; and P7 discipline is exemplary (zero authored verifiers, live runner
deferred, `/pharn-ship` named as a separate future increment). The spec→plan hash chain is un-drifted.

The four concerns are **sharpen-the-build**, not redesign: (1 · important) the `structural:<expected>`
gate feeds the floor verdict, so the build must give it a **deterministic** eval-pair discovery rule
(mirror `/pharn-dev-verify`'s `<cap>/evals/expected/*.json` ↔ committed `findings.json` convention),
else a floor-gate input rests on judgment; (2 · important) the **RED-chain** path must state
explicitly whether `verify-report.json` is emitted, because a named machine consumer depends on it;
(3–4 · minor) two **honest-scope** wording fixes — don't imply `validate` runs in every user project,
and carry over the dev-sibling's whole-repo/absolute-threshold caveat so an unrelated pre-existing red
gate failing verify is documented, not surprising.

None of these touch the two-layer core, the reuse-no-new-primitive shape, or the verdict-ownership
guarantee. They are refinements the build agent should fold into the command's prose.

## Verdict

**ADVISORY VERDICT: 4 concerns raised (0 blocking-severity, 2 important, 2 minor) — for the human to
weigh before `/pharn-dev-build`.** This is not a gate and not a "grill passed"; the plan remains the
human-approved intent, and `/pharn-dev-build`'s floor-gates are the only deterministic stops.
