# GRILL — security-griller (advisory)

**Plan:** `.dev/features/security-griller/PLAN.md` ·
**Spec-hash check (content-hash floor primitive):** `sha256(ARCHITECTURE.md)` recomputed live =
`11cd9ad5…d1d969` **==** the plan's pinned `spec_content_hash` → **chain holds** (no drift; not a
finding). ·
**Grillers registered (FLOOR membership, `count-grillers.mjs`):** `{"registered":2}` — `architecture`,
`testability`; both run below.

> This grill-log is **ADVISORY end-to-end** (P0). Nothing here gates `/pharn-dev-build`. The only floor-grade
> facts in this run are the writes-scope hook (pins where I may write) and the spec-hash comparison
> (holds). Findings' free-text quotes the plan as **untrusted DATA** (P2), never executed.

## Built-in interrogation (P0/P1/P2/P3/P5/P7)

The plan is unusually thorough: a complete guarantee audit (every claim labeled floor/advisory), an
explicitly **rejected** floor candidate (authz-mention presence, honestly demoted to advisory), and a
genuinely novel, correct P2 point (the scanner is **injection-proof by construction** — a regex cannot
be "instructed"). The concerns below are **refinements for the build to fold into `security.md`**, not
defects — all `minor`, none blocking.

```yaml
- type: FINDING
  rule_id: P0 # enum-gated (cited, not restated — P4)
  severity: minor # enum-gated value; assignment advisory (fix #3) — a griller never gates
  file: ".dev/features/security-griller/PLAN.md:110" # enum-gated — resolves
  problem: "Secret-detection is labeled 'FLOOR (regex)' but the griller is applied INLINE by the model today (the live griller runner is deferred, P7, per the sibling grillers); the built security.md should carry the two-clocks split explicitly — the scanner's OUTPUT is floor (deterministic), the griller's ACT of invoking it inline is advisory orchestration, backstopped by the scanner's own tests + the eval."
  evidence: "'Secret-literal detection (the griller's procedure invokes .dev/floor/scan-plan-secrets.mjs …) → FLOOR (regex; ARCHITECTURE.md §2 primitive #3).'"
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/security-griller/PLAN.md:83"
  problem: "The eval's structural[] verifies the finding OUTPUT (count + enum-gated fields), not that the secret-finding was PRODUCED BY the deterministic scanner rather than judgment; that provenance binding rests on the scanner's OWN tests + the procedure. security.md should state this precisely (as testability.md already does: 'finding_count captures the output, not the finding's correctness')."
  evidence: '''the griller runs .dev/floor/scan-plan-secrets.mjs, which detects the secret literal deterministically → exactly 1 finding … Binds enforces: ["P2"] (fix #6) AND the trust-fence discipline.'''
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/features/security-griller/PLAN.md:54"
  problem: "The increment adds a NEW floor primitive (scan-plan-secrets.mjs), which stretches 'smallest increment'; it is justified (the griller's floor claim needs a deterministic backstop or it is the disease, and the human approved it at GATE 1) — recorded so the trigger is explicit, not assumed. No action beyond keeping the justification visible in security.md's guarantee audit."
  evidence: "'.dev/floor/scan-plan-secrets.mjs — NEW deterministic, stdlib-only, fail-closed secret-literal scanner over a plan file (regex membership; the genuine floor sub-check).'"
```

## Griller: testability (`pharn-pipeline/grillers/testability/testability.md`)

**PRESENT → no absence finding (`finding_count == 0`).** The plan declares a substantial verification
approach — a full `## Evals to write (P1)` section binding four behaviors (the scanner's own hermetic
tests incl. the ★ injection-immunity cases; the griller's floor/advisory/clean fixtures; the reused
membership). Presence recognized from the plan's **structure**; adequacy is sound for the axis. No
finding.

## Griller: architecture (`pharn-pipeline/grillers/architecture/architecture.md`)

Structural fit is **good**: the griller lands at root `pharn-pipeline/grillers/security/` mirroring
increments 29/31; the scanner lands under `.dev/floor/` with the other checkers; no sibling coupling (`reads:` is
`finding-shape` + the plan); the dev/product boundary is respected (product griller / apparatus scanner).
One advisory consistency point:

```yaml
- type: FINDING
  rule_id: P3 # architecture griller's axis (cited, not restated — P4)
  severity: minor
  file: ".dev/features/security-griller/PLAN.md:54"
  problem: "A NEW secret-scanning mechanism is introduced at PLAN time; the repo already carries a secret-scanning posture at COMMIT/CI time (push-protection / gitleaks, per the project's security posture — verify live). Confirm the two are COMPLEMENTARY layers (plan-time early-warning before code exists vs commit-time hard gate), not redundant/conflicting — and note that relationship in security.md so the new mechanism reads as an added layer, not a reinvention."
  evidence: "'.dev/floor/scan-plan-secrets.mjs — NEW deterministic … secret-literal scanner over a plan file.'"
```

## Summary + verdict

The plan is strong and honest. Four `minor` refinements surfaced — three built-in (make the two-clocks
split and the output-vs-provenance nuance explicit in `security.md`; keep the P7 new-primitive
justification visible), one from the architecture griller (reconcile the plan-time scanner with the
repo's existing commit-time secret-scanning posture as a complementary layer). The testability griller
found no gap. None of these blocks the build; they are wording/precision improvements the build should
fold into `security.md`.

**ADVISORY VERDICT: 4 concerns raised (0 blocking-severity, 4 minor) — for the human to weigh before
`/pharn-dev-build`. This grill-log guarantees nothing about the plan's quality; the chain-hold in the header is
the only floor-grade fact.**
