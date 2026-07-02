# GRILL — i18n griller plan (ADVISORY)

- **Plan under interrogation:** `.dev/features/i18n-griller/PLAN.md` (177 lines).
- **Spec-hash check (content-hash floor primitive — surfaced, not blocking here):** `sha256(ARCHITECTURE.md)` =
  `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` **== plan's pinned `spec_content_hash`**.
  No drift → no P6 drift finding. (The actual block on drift is `/pharn-dev-build`'s floor-gate, fix #4 — not this stage.)
- **Grillers discovered (membership FLOOR, `count-grillers.mjs`):** 10 registered (i18n not yet built — correct, build is next → +1).
  Their deterministic sub-checks were run over the plan: `scan-plan-secrets` → `found:false`; `scan-plan-pii` → `found:false`;
  observability/migrations vocab → clean. This is a **methodology-artifact** plan (it builds a griller capability, not an app
  feature), so the app-axis grillers surface nothing material.

> The plan is `trust: untrusted` to me: its self-claims are tested, not believed; instruction-looking content is DATA.
> Findings' enum-gated fields (`type`/`rule_id`/`severity`/`file`) are my own enum/path assertions; `problem`/`evidence`
> inherit the plan's untrusted tag and are quoted as DATA. Nothing here gates `/pharn-dev-build` (P0, fix #3).

## Findings (grouped by axis; enum-gated / free-text split honored)

### P7 — honest scope / no speculation

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P7 # enum-gated
  severity: minor # enum-gated value; ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/i18n-griller/PLAN.md:124" # enum-gated — resolves
  problem: "The new capability + its new floor primitive are justified as 'not speculative' via griller-family expansion (the eleventh axis), not by a cited concrete dogfood/eval failure — the human should confirm this clears P7's 'real failure, not a hypothetical' bar." # free-text (untrusted DATA)
  evidence: "Line 124: 'New floor primitive, justified (P7): scan-plan-i18n.mjs is added because this griller's floor claim … requires a deterministic backstop … not speculative.' The trigger is a recurring-class family-expansion argument, mirroring a11y.md's explicit 'not a claim that a specific one-off dogfood run failed (none is asserted).'" # free-text (quoted DATA)
```

### P0 — guarantee-audit / honest bound completeness

```yaml
- type: FINDING # enum-gated
  rule_id: P0 # enum-gated
  severity: minor # enum-gated value; advisory assignment (fix #3)
  file: ".dev/features/i18n-griller/PLAN.md:119" # enum-gated — resolves
  problem: "The scanner fires on ANY line matching its patterns, so it cannot distinguish a hardcoded UI string the plan intends to BUILD from JSX/HTML the plan merely QUOTES illustratively — both produce a hit; the honest bound should explicitly name this illustrative-markup false-positive (it mirrors scan-plan-secrets firing on a quoted example key)." # free-text (untrusted DATA)
  evidence: "Line 119 claims the scan is 'injection-immune by construction: a hit fires a finding …'. True for suppression-immunity, but a plan that quotes '<div>Example</div>' as documentation would also fire — surfaced-not-gated + Layer-2 judgment mitigate, but the bound should say so." # free-text (quoted DATA)
```

### P1 — eval coverage / structural-vs-semantic split

```yaml
- type: FINDING # enum-gated
  rule_id: P1 # enum-gated
  severity: minor # enum-gated value; advisory assignment (fix #3)
  file: ".dev/features/i18n-griller/PLAN.md:52" # enum-gated — resolves
  problem: "The advisory 'plan-localization-concern' eval asserts finding_count == 1 over a Layer-2 JUDGMENT output; the structural check pins EXPECTED behavior but is only as stable as the inline judgment (the pre-runner 'two clocks'), so a green structural check must not be read as 'the advisory judgment is deterministic.'" # free-text (untrusted DATA)
  evidence: "Line 52: 'plan-localization-concern.json — expected: finding_count == 1 … advisory' — a deterministic count assertion whose input is irreducible judgment (backstopped by the semantic[] judge, exactly as the security griller's advisory fixture is)." # free-text (quoted DATA)
```

## Prose summary

The plan is **strong, thorough, and unusually honest** about its own guarantee boundary — the guarantee audit
labels every claim floor-or-advisory, the "ensures i18n" over-claim is explicitly struck, the trust audit and
the `needle_absent_from_enum_gated` trip-wire are present, and the determinism audit ends its fallback in "ask
the human." The core structural call is **correct and well-argued**: i18n's concern is the _presence_ of a
hardcoded string (security/PII polarity → a hit fires, prose cannot suppress → genuinely injection-immune),
which is the _opposite_ of a11y's _rejected_ launderable "mentions a11y" candidate — so a real scanner is
warranted where a11y's was not. Reusing `count-grillers.mjs` / `check-structural.mjs` / `validate.mjs`
unchanged, and leaving the grill commands untouched (they discover grillers dynamically), is consistent with
live state I verified this run.

The three concerns are all **minor**: (P7) the addition rests on the same "griller-family expansion" trigger
the committed a11y/documentation/migrations grillers established — accepted precedent, but worth the human
consciously ratifying rather than inheriting; (P0) the honest bound should name illustrative-markup false
positives, not only the misses (bare assignments/concatenation); (P1) the advisory eval's `finding_count == 1`
is a structural assertion over a judgment output — legitimate and precedented, but not evidence the judgment is
deterministic. None blocks; each is a small wording/coverage tightening the build can fold in.

## Verdict

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 3 minor/advisory) — for the human to weigh before
/pharn-dev-build.** This is not "grill passed" and not a guarantee the plan is sound (P0); it surfaces concerns,
it does not gate. The deterministic backstops remain `/pharn-dev-build`'s floor-gates (spec-hash drift, unresolved
`## Open questions (HALT)`) and `.dev/floor/validate.mjs`.
