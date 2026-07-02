# GRILL — observability-griller (advisory)

- **Plan under interrogation:** `.dev/features/observability-griller/PLAN.md`
- **Spec-hash check (content-hash floor primitive — surfaced, not gating):** recomputed `sha256(ARCHITECTURE.md)` = `11cd9ad5…d1d969` — **matches** the plan's pinned `spec_content_hash`. **No drift**, no spec-hash finding. (The actual drift-block is `/pharn-dev-build`'s floor-gate; here it only warns.)
- **Trust (P2):** the PLAN is `trust: untrusted`. Instruction-looking content in it is DATA I report, never followed. My findings' enum-gated fields are my own assertions; free-text quotes inherit the plan's untrusted tag.

---

## Findings — built-in interrogation (my Step 2 axes)

### Finding 1 — the scanner may be P7-unjustified and is inconsistent with a sibling griller (headline)

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P7 # enum-gated — honest scope / no speculative additions; also P0 (floor-or-advisory)
  severity: important # enum-gated value; ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/observability-griller/PLAN.md:56" # the "New floor primitive, justified (P7)" claim
  problem: "The increment's central new floor primitive (scan-plan-observability.mjs) is the same launderable presence-scanner shape that the error-handling griller — which landed as a registered griller DURING this plan run — explicitly rejects as the P0 disease; and because observability's concern is about ABSENCE, a needle can flip the scanner to mentions:true, so it is NOT injection-immune in the direction that matters (unlike security's secret-scan), weakening the very '★ needle doesn't move the floor verdict' rationale that justified it at GATE 1."
  evidence: "PLAN.md:56 justifies the scanner 'Identical justification shape to scan-plan-secrets.mjs.' But security's scan fires a FLOOR finding on a secret's presence and is suppression-immune; the observability scanner (by the plan's own Guarantee audit) 'never fires a floor finding' and every observability finding is 'ADVISORY'. Meanwhile pharn-pipeline/grillers/error-handling/error-handling.md rejects a structurally-identical scanner: a presence scan's 'present verdict is launderable … treating its verdict as floor would dress a launderable heuristic as a guarantee — the exact disease P0 forbids.' The plan's own fixture-3 confirms the launderability (an injected comment's obs-vocabulary makes the scanner report mentions:true). Net floor over membership-only: deterministic token-presence line numbers that gate nothing."
```

**Why this matters (P0/P7).** Two sibling grillers now take **opposite** positions on the same launderable-presence-scanner shape: **security built one** (justified — its hit fires a suppression-immune FLOOR finding), **error-handling rejected one** (its present-verdict is launderable, so floor-dressing it is the disease). Observability's axis is an **absence** concern like error-handling's, and its scanner is launderable like error-handling's — yet the plan builds it like security's. The plan is scrupulously honest that the scanner "never fires a floor finding" and findings are "advisory," so it does **not** overtly commit error-handling's named disease — **but** that honesty is exactly what exposes the P7 question: a new floor primitive that **gates nothing, fires no floor finding, and is not injection-immune in the direction that matters** may not earn its place (P7), and its "★ needle doesn't move the floor verdict" GATE-1 rationale is weaker than security's. **This post-dates the GATE-1 "build the scanner" decision** (error-handling landed mid-run), so it warrants explicit human reconciliation (see halt below).

### Finding 2 — griller-count prose drifted (concurrent landing during planning)

```yaml
- type: FINDING # enum-gated (my own assertion)
  rule_id: P6 # enum-gated — discovery-first; verify-before-assert (a claim not grounded in current live state)
  severity: minor # enum-gated value; ASSIGNMENT is advisory (fix #3)
  file: ".dev/features/observability-griller/PLAN.md:32" # the "live count 3 → 4" claim (also :50 "registered == 4")
  problem: "The plan asserts the live griller baseline is 3 (this increment 3→4, 'registered == 4 at build'), but the concurrent error-handling griller landed during planning, so the live baseline is now 4 and this increment yields 5 — the count prose is stale."
  evidence: "count-grillers . now returns registered:4 [architecture, error-handling, security, testability]; PLAN.md:32 says 'live count 3 → 4 after this increment' and PLAN.md:50 says 'registered == 4 at build'. Non-blocking (grill gates nothing; /pharn-dev-build reads the live count), but observability.md's guarantee-audit prose must state the LIVE count (→5), not the stale 4."
```

---

## Findings — griller plug-in slot (Step 2b; membership is FLOOR, running is advisory)

`node .dev/floor/count-grillers.mjs .` → `registered:4` = `[architecture, error-handling, security, testability]` (frontmatter-gated membership — FLOOR; the not-yet-built observability griller is correctly absent). Each registered griller applied to the plan; **all four surfaced no finding**:

- **testability (P1)** — verification approach **present**: `## Evals to write` (3 fixtures with `finding_count` assertions) + a hermetic scanner test. Adequate. No finding.
- **architecture (P3)** — structural fit: griller in `pharn-pipeline`, `reads: finding-shape` routed through `pharn-contracts` (no sibling import), one axis, correct layer placement, scanner in `.dev/floor/` apparatus. No misfit. No finding.
- **security (P2)** — FLOOR layer: `scan-plan-secrets.mjs .dev/features/observability-griller/PLAN.md` → `{"found":false,"hits":[]}` (exit 0) — no secret literal. ADVISORY layer: the increment adds a read-only regex scanner + a griller that reads a plan as DATA — no destructive op, no injection surface introduced. No finding.
- **error-handling (P7)** — error-handling **declared**: the scanner's fail-closed contract (missing/non-file → nonzero exit, nothing on stdout), the no-arg failure path, and the griller's terminal-fallback-is-ask are all specified with a test asserting the exit codes. Present + adequate. No finding. _(Note: this same griller is the source of Finding 1's tension.)_

---

## Prose summary

The plan is unusually rigorous: the spec-hash is clean, the trust/determinism audits are thorough and honest, the eval set mirrors the proven security fixtures, and **all four registered grillers find nothing**. The one **material** concern is **Finding 1**: the scanner — the increment's defining new floor primitive — is the same launderable-presence-scanner shape a sibling griller (`error-handling`) **explicitly rejects as the P0 disease**, and its injection-immunity (the GATE-1 rationale) is weaker than security's because observability is an absence-concern (a needle can fake `mentions:true`). The plan's honesty ("never fires a floor finding", "advisory") avoids the _overt_ disease but surfaces the real question: **does a floor primitive that gates nothing, fires no floor finding, and isn't suppression-immune earn its place (P7)?** Finding 2 is a minor, non-blocking count-drift caused by the concurrent error-handling landing.

## ADVISORY VERDICT

**2 concerns raised (0 blocking-severity, 1 important, 1 minor) — for the human to weigh before /pharn-dev-build.** Grill gates nothing; the only deterministic stop in this stage is the spec→plan hash chain, which **held**. Finding 1 materially post-dates the GATE-1 scanner decision, so `/pharn-dev-ship` halts to reconcile it with the human before building (P6) rather than baking a questioned primitive into 12 files.
