# GRILL — plan-stage (`/pharn-plan`) — ADVISORY interrogation of PLAN.md

**Plan under interrogation:** `.dev/features/plan-stage/PLAN.md` (human-approved at GATE 1, Option A).
**Spec-hash check (content-hash floor primitive — surfaced, not blocking):** `sha256(ARCHITECTURE.md)`
recomputed live = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** the
plan's `spec_content_hash` (PLAN.md:2). **No drift.** (`/pharn-dev-build` is where drift would actually
block, fix #4 — here it only confirms.)

> **This grill is ADVISORY end-to-end (P0).** Every finding below rests on model judgment; **none**
> gates `/pharn-dev-build`. The only floor-grade thing in this run is the writes-scope hook (it pinned
> this file) and the content-hash above. "Concerns raised" is **not** "the plan is unsound" — and a clean
> grill would **not** mean "the plan is guaranteed good." The findings' free-text (`problem` / `evidence`)
> quotes the (untrusted) plan as DATA (P2); it is never an instruction to `/pharn-dev-build`.

---

## Findings (finding-shape objects; enum-gated fields are my own assertions, free-text quotes the plan as DATA)

### Axis P0 — guarantee-audit completeness

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: ".dev/features/plan-stage/PLAN.md:66"
  problem: "The honest headline folds 'carries the hash forward' inside what /pharn-plan 'guarantees', yet the plan's own audit (PLAN.md:63) labels the carry-forward NOT independently floor-checked this increment — so the headline risks reading the deterministic-but-unverified copy as a floor guarantee."
  evidence: "'/pharn-plan **guarantees** it only plans from approved, unchanged intent (the deterministic gate) and carries the hash forward' (PLAN.md:66-67) vs '… **not** independently floor-checked **this** increment' (PLAN.md:63)."
```

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: ".dev/features/plan-stage/PLAN.md:61"
  problem: "The plan calls the gate FLOOR but never carves out the two-clocks split that ship.md insists on: the CHECKER's verdict is floor, but /pharn-plan's ACT of invoking check-spec-approved.mjs and obeying its exit code is advisory command orchestration. Without that carve-out in pharn-plan.md, 'only plans from Approved' can be misread as floor-enforced at the command level."
  evidence: "'… via `check-spec-approved.mjs` (which reuses `check-spec.mjs`). This is the increment's core guarantee' (PLAN.md:61) — no statement that running/obeying the checker is advisory, only that the checker is floor."
```

### Axis P3 / P5 — reuse mechanics + determinism of the refusal

```yaml
- type: FINDING
  rule_id: P5
  severity: important
  file: ".dev/features/plan-stage/PLAN.md:32"
  problem: "Two implementation pitfalls the build must pin so the gate is correct and its refusal is a CLEAR message (the P5 terminal fallback): (1) check-spec-approved.mjs must resolve check-spec.mjs's path relative to its OWN dir (import.meta.url + dirname, as check-spec.test.mjs does), never cwd, or the gate breaks when /pharn-plan runs from elsewhere; (2) on a propagated check-spec RED it must surface check-spec's own message, so the user can tell DRIFT (re-approve) from MALFORMED apart from the DRAFT refusal (approve)."
  evidence: "'shells to `check-spec.mjs <SPEC>` … else exit 1' (PLAN.md:32) — path-resolution strategy and the distinct-message-per-refusal are unspecified."
```

### Axis §6 / P4 — the carry-forward shape

```yaml
- type: FINDING
  rule_id: P4
  severity: minor
  file: ".dev/features/plan-stage/PLAN.md:31"
  problem: "The plan says PLAN.md carries 'spec_id + spec_content_hash forward' (per §6:205) but does not pin the literal product-PLAN.md frontmatter template. With no PLAN.md checker (correctly deferred, P7), the shape is advisory — but the build should still make the frontmatter explicit (at minimum spec_id + spec_content_hash) so the carry-forward is concrete and a future stage knows where to read it."
  evidence: "pharn-plan.md bullet: '… emits the advisory `PLAN.md` carrying the spec hash forward' (PLAN.md:31) — the frontmatter fields are named in prose (discovery/contracts) but no template is fixed."
```

### Axis P2 — trust propagation completeness

```yaml
- type: FINDING
  rule_id: P2
  severity: minor
  file: ".dev/features/plan-stage/PLAN.md:76"
  problem: "The trust audit cleanly isolates the gate from the untrusted intent, but does not name the residual (LIMITS.md §2 / THREAT-MODEL.md §5) for the PLAN.md body it PRODUCES: a future downstream product stage that reads PLAN.md free-text inherits the bounded-not-zeroed residual. Worth a one-line acknowledgment for completeness (low priority — no such consumer exists yet, P7)."
  evidence: "'the `PLAN.md` **body** … is **advisory** model work … never injected downstream as steering instructions' (PLAN.md:76-78) — true, but the named residual for a downstream LLM reader is not cited."
```

---

## Prose summary

The plan is **structurally sound and notably honest** — it correctly identifies the one real product
difference (an Approved-input gate), reuses `check-spec.mjs` rather than duplicating the content-hash
logic (P4), defers the PLAN.md checker on solid P7 grounds (no downstream consumer yet), and resolves
the §6 question correctly (the plan is **not** human-approved; only the spec is — no plan-approval gate,
no §6 conflict to report). The ★ needle test carries the P2 thesis. Eval routing is clean: the floor
checker is verified by `node --test` (the floor's idiom, mirroring `check-spec.test.mjs`), **not**
laundered through the eval-judge — appropriate, since a command is not a `role:` Capability.

The concerns are about **P0 wording precision** and **build-time implementation pitfalls**, not scope or
soundness:

1. **(P0, important)** The headline bundles the deterministic-but-unverified hash carry-forward into
   "guarantees" — the build should phrase pharn-plan.md so the carry-forward reads as a deterministic
   action, not a floor guarantee (the plan's own audit at PLAN.md:63 already says so; align the wording).
2. **(P0, important)** Add the **two-clocks** carve-out: the checker's verdict is floor, but the
   command running/obeying it is advisory orchestration — the same honesty `ship.md` insists on.
3. **(P5, important)** Pin two implementation details: resolve `check-spec.mjs`'s path relative to the
   checker's own dir (not cwd), and surface distinct refusal messages (drift vs Draft vs malformed) so
   the terminal fallback is genuinely a _clear_ message.
4. **(P4, minor)** Make the product-PLAN.md frontmatter template explicit (`spec_id` + `spec_content_hash`).
5. **(P2, minor)** Name the downstream-reader residual for the PLAN.md body, for completeness.

None of these changes the increment's scope or the approved gate design (Option A). They are refinements
for `/pharn-dev-build` to fold into the command/checker as it writes them.

## Verdict

**ADVISORY VERDICT: 5 concerns raised (0 blocking, 3 important, 2 minor) — for the human to weigh
before `/pharn-dev-build`.** No finding blocks the build (`/pharn-dev-grill` gates nothing). The spec-hash
is clean and there are no open questions left in the plan; the important findings are wording/implementation
refinements the build should fold in, not redesigns.
