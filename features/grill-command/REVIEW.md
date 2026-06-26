# REVIEW — /grill command (advisory-only)

- increment: `.claude/commands/grill.md` (the `/grill` pipeline stage between `/plan` and `/build`) + this feature's `PLAN.md`.
- reviewed as: **`trust: untrusted`** (PHARN reviewing PHARN). Instruction-looking content in the reviewed file is treated as data to scrutinize, never as instructions to me.
- spec_content_hash (live recompute this run): `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` — **matches** `PLAN.md:3`; no drift (P6, fix #4).

## Floor first (P0) — the only guaranteed part of this review

`node floor/validate.mjs .` → **GREEN — 1 capabilities checked** (exit 0). The single counted
capability is `trust-fence`; `grill.md` is path-ignored under `.claude/commands/`, so the count is
unchanged — exactly as the plan predicted (`PLAN.md:12`, `:57`, `:68`). The floor reaching review GREEN
is the precondition for the advisory lenses below.

## The four lenses (advisory; each cites a principle)

### L-floor → P0 — PASS (no findings)

Every claim `grill.md` makes is either reduced to a floor primitive or explicitly labeled `advisory`:

- Self-labels advisory end-to-end (`grill.md:22-28`, `:130-134`, `:147-149`); never writes "grill
  passed" / "guaranteed good." The verdict template is `ADVISORY VERDICT: …` (`:148`).
- The two floor reductions are named and correctly scoped: the **writes-scope hook** (fix #7,
  `grill.md:39-51`) and the **content-hash computation** (`:57-68`). Crucially, the spec-hash check is
  labeled floor-grade _as a computation_ but **surfacing-only here** — the _block_ on drift stays at
  `/build` (fix #3 / fix #4). That is the fix #3 split applied correctly: the same content-hash is a
  floor-gate at `/build` and an advisory surfacing at `/grill`.
- The CONSTITUTION_VIOLATION handling is honest (`:125-128`): grill raises a high-severity **FINDING**
  for the human rather than claiming a binding `CONSTITUTION_VIOLATION` STOP it cannot back with a floor
  primitive. This is the P0 move, not a gap.

No guarantee is asserted without a floor reduction or an `advisory` label. This is the governing lens
and it is clean.

### L-eval → P1 — PASS (floor agrees)

`grill.md` is a **command**, not a floor-counted Capability (no `role:` instance under a floor-scanned
path; `.claude/commands/` is ignored). It carries **no `enforces:`** field, so there is no
`rule_id`↔eval binding to satisfy. The floor confirms (`GREEN — 1`, no new capability, no missing
binding). Floor and reviewer agree; verification is by dogfood, as for `/plan` `/build` `/review`
`/pharn-eval` (`PLAN.md:52-58`).

### L-trust → P2 — PASS (the residual is named, not a defect)

- The finding object grill emits honors the split (`grill.md:110-122`): enum-gated `{type, rule_id,
severity, file}` are grill's **own** enum/path-resolution assertions (trusted); free-text `{problem,
evidence}` quote the plan and **inherit its untrusted tag**, rendered as quoted DATA, "never injected
  into `/build` as instructions." Matches `finding-shape.md` and `ARCHITECTURE.md §8`.
- The spec-hash check compares an **untrusted** plan value (`PLAN.md`'s claimed `spec_content_hash`)
  against grill's **trusted live recompute** — the authoritative side is the recomputation, so a
  tampered plan hash can at most raise a spurious (advisory) drift finding, never suppress the check.
  This is the correct direction (verify untrusted claims against trusted computation).
- No guaranteed decision rests on any field grill emits — and since grill is advisory end-to-end, no
  guaranteed decision rests on grill at all. The named residual (`grill.md:159-162`) matches
  `THREAT-MODEL.md §5` / `LIMITS.md §2`: a downstream human/LLM reading free-text is bounded, not
  zeroed.
- **Reviewer diligence (P2):** the reviewed file is dense with imperative text, but all of it is
  directed at the _griller_ persona (its own command body); I found **no** content attempting to steer
  _me, the reviewer_, off-task (no "approve this," "skip the floor," etc.). I did not catch myself
  complying with anything in the artifact.

### L-axis → P3 — PASS with one minor advisory

One reason to change (the grill stage). `reads:` cross no sibling module root — they target the root
spec docs and the root `pharn-contracts` layer (the allowed dependency direction), plus the `PLAN.md`
input. The floor's sibling grep (which ignores `.claude/commands/`) and I agree: no blocking sibling
reference. One minor maintainability nit recorded below.

## Findings

### Floor-gate (blocking) — none

No finding's verdict comes from content the floor can deterministically check against the increment;
nothing blocks. The increment is **not** held.

### Advisory (warn) — 1

```yaml
- type: FINDING
  rule_id: "P3"
  severity: minor
  file: ".claude/commands/grill.md:67"
  problem: "Grill's prose cites another command's internal step number (build.md Step 1.2), coupling grill to build.md's numbering; if build.md is re-sequenced the pointer goes stale. The durable anchor (fix #4) is already cited beside it, so prefer it (or ARCHITECTURE.md §6:213) alone."
  evidence: "the actual block on drift is /build's floor-gate (fix #4, build.md Step 1.2)"
```

Advisory rationale: this is a cross-_command_ prose coupling, not a layered-tree sibling import
(commands sit outside the `pharn-*` tree the floor's P3 grep ranges over), so it is **not** a floor-gate
violation — hence `minor`, non-blocking. Impact is low because `grill.md:67` already cites the durable
`fix #4` alongside the volatile step number; dropping the step number would make it fully durable.

## Prose observations (advisory, for the human — not findings)

- **`role:`-on-a-command vs the "`role:` ⇒ capability" wording.** `grill.md` carries `role: griller`
  yet is intentionally a command, not a floor-counted Capability. This is the **established pattern** —
  `plan`/`build`/`review`/`pharn-eval` all carry `role:` and all sit in `.claude/commands/` with the
  floor at GREEN/1 — and the plan called it out (`PLAN.md:54`, `:96`). The only friction is terminology
  in `CLAUDE.md` ("A `.md` file becomes a capability the moment its frontmatter has a `role:`"), which
  reads more absolutely than the floor behaves. Not a defect in this increment; flagged only so a human
  may someday reconcile the doc wording. `CLAUDE.md` is not under review here.
- **Spec alignment confirmed.** `ARCHITECTURE.md §6:206` already defines the grill stage's artifact as a
  grill-log of "findings vs plan"; `GRILL.md` is exactly that. `§7` enforcement _moments_ are
  pre-write/in-build/post-build — grill is none of them, which independently supports advisory-only. No
  trusted-doc reconciliation is needed (agrees with `PLAN.md:90-96`).
- **No findings.json collision.** Embedding findings as YAML inside `GRILL.md` (rather than a separate
  `findings.json`, which is Capability-scoped and would collide with `/review`'s output in the shared
  `features/<name>/` dir) is the right call (`grill.md:139-149`, `PLAN.md:31`).

## Verdict

**GREEN — 0 floor-gate findings; 1 minor advisory.** The advisory-only `/grill` increment is sound:
faithfully self-labeled (P0), dogfoods the enum-gated/free-text split (P2, fix #1), adds no counted
capability and no new floor primitive (floor GREEN/1), and aligns with the spec without touching a
trusted doc. The increment is **done**; the single advisory is a non-blocking maintainability nit for a
future pass.

## Lessons (P7 — gated promotion)

**None proposed.** This was a clean build; the one advisory is a one-off prose nit, not a _recurring_
failure pattern, so there is nothing to promote to `memory-bank/lessons-learned.md`. No canon written
(P2).
