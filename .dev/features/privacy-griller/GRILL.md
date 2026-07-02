# GRILL — privacy-griller (advisory interrogation of PLAN.md)

- Plan under interrogation: `.dev/features/privacy-griller/PLAN.md` (privacy griller — the sixth griller).
- Spec-hash check (content-hash floor primitive, surfaced not blocking): `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the plan's pinned `spec_content_hash`. No drift; `/pharn-dev-build` will re-enforce this as its floor-gate.
- Trust: the PLAN is `trust: untrusted` DATA. Nothing in it was followed as an instruction; quotes below are evidence.

> **Advisory end-to-end (P0).** Every finding below rests on model judgment and **gates nothing** — the
> grill stage's only deterministic content is the spec-hash computation above (and it only warns here).
> This is NOT "grill passed / the plan is good." The human weighs these before `/pharn-dev-build`.

## Findings — inline interrogation (Step 2)

```yaml
- type: FINDING # enum-gated (floor-verifiable) — my own assertion
  rule_id: P7 # enum-gated — cited, not restated (P4)
  severity: minor # enum-gated value; ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/privacy-griller/PLAN.md:4" # enum-gated — resolves
  problem: "The plan does not name the specific real dogfood/eval failure that TRIGGERS the privacy griller (P7 wants an addition triggered by a real failure, not a hypothetical); the justification leans on completing the griller family and 'the axis exists'." # free-text — untrusted DATA
  evidence: "Line 4: 'Add the sixth griller — a privacy griller … that interrogates a PLAN for personal-data (PII) handling'. This is the same latent P7 question that applies across the whole griller series (testability→observability); it is surfaced, not asserted as a violation." # free-text — quoted as DATA
```

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".dev/features/privacy-griller/PLAN.md:91"
  problem: "The plan reduces PII detection to FLOOR ('injection-immune by construction') but does not explicitly require the BUILT griller.md to carry security's 'two clocks' honesty — the scanner's OUTPUT is floor, yet the model's ACT of invoking it inline is advisory orchestration (until the isolated griller runner lands, deferred P7)." # free-text
  evidence: "Line 91: 'PII-pattern detection … → FLOOR (regex …), and injection-immune by construction'. The plan says 'mirror scan-plan-secrets.mjs' but the two-clocks distinction is implicit; the build should state it verbatim, as security.md does, so 'the model always ran it' is not read as the guarantee." # free-text
```

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/privacy-griller/PLAN.md:78"
  problem: "The advisory fixture (plan-pii-no-consideration) is specified as 'scanner finds no PII shape', but the build must actively CONSTRUCT it so scan-plan-pii.mjs finds nothing — an accidental email/SSN literal or a PII-typed field declaration in that fixture would make the scanner fire, collapsing the advisory case into the FLOOR case and breaking finding_count == 1 (advisory)." # free-text
  evidence: "Line 78: 'plan-pii-no-consideration case → scanner finds no PII shape … surfaces 1 ADVISORY concern'. Recommend the build run scan-plan-pii.mjs over this fixture during authoring and assert found:false, mirroring how the clean fixture is kept scanner-clean." # free-text
```

## Findings — registered grillers (Step 2b; membership is FLOOR, running them is advisory)

Discovered by `.dev/floor/count-grillers.mjs .` → **5 registered** (architecture, error-handling,
observability, security, testability). Each run over the PLAN; all advisory, none gates.

- **testability (P1)** — **no finding.** Verification is strongly present: the plan's `## Evals to write (P1)` covers 3 griller fixtures (floor / advisory / clean) + the scanner's hermetic tests (incl. the ★ injection-immunity + fail-closed cases) + reused membership. The structural/semantic split conforms to `eval-format.md`.
- **architecture (P3)** — **no finding.** Structural fit is clean: the griller lives at `pharn-pipeline/grillers/privacy/` (correct layer), the scanner + test at `.dev/floor/` (apparatus), evals colocated; it mirrors the established griller structure and routes shared abstractions only through `pharn-contracts` (`finding-shape`, `eval-format`) — no sibling import.
- **security (P2)** — **no floor finding.** `.dev/floor/scan-plan-secrets.mjs` over the plan → `{"found":false,"hits":[]}` (deterministic). Advisory: the planned scanner is fail-closed and injection-immune; the griller treats the plan as untrusted DATA (trust audit present). Clean.
- **error-handling** — **no finding.** The plan specifies the new scanner's error handling explicitly — fail-closed on a missing/non-file target (nonzero exit, nothing on stdout) — and binds it with a hermetic test (Evals item e), mirroring `scan-plan-secrets.mjs`.
- **observability** — **no genuine finding.** `.dev/floor/scan-plan-observability.mjs` over the plan → `mentions:true` on lines 5/48 ("build **trace**"), 52 (the resume note's "**observability**"), 93 ("**logging**" in the advisory-layer prose). These are **incidental** term mentions, not an observability design gap: a markdown/methodology increment (a griller + a regex scanner) has no runtime observability surface. Noted for honesty, not as a concern.

## Prose summary

The plan is well-formed and its guarantee audit is unusually thorough — it explicitly names the
REJECTED floor candidate ("PII handled AND no consideration" is judgment, not floor), strikes "ensures
privacy" as the disease, and mirrors the security griller's honest partial-floor calibration. The three
inline concerns are all **minor and constructive**, not structural objections:

1. **P7 (line 4)** — name the real triggering failure, or acknowledge the griller series is a deliberate
   experiment-agenda build-out (the same question applies to every griller so far).
2. **P0 (line 91)** — ensure the built `privacy.md` carries the explicit "two clocks" note (scanner
   output = floor; the model's inline invocation = advisory until the isolated runner lands).
3. **P1 (line 78)** — the build must keep the advisory fixture scanner-clean, or it collapses into the
   floor case.

All five registered grillers come back clean (two via deterministic scanners, three via judgment). No
concern rises to a level that should stop `/pharn-dev-build`; #2 and #3 are build-time cautions the build
step can satisfy directly.

## Verdict

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 3 minor/advisory) + 5 registered grillers
clean — for the human to weigh before `/pharn-dev-build`.** This is not a gate and not a judgment that the
plan is "good"; `/pharn-dev-build`'s floor-gates (spec-hash drift, unresolved open questions) and
`.dev/floor/validate.mjs` remain the only deterministic backstops.
