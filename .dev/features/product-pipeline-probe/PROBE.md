# PROBE — product-pipeline-probe (first measured end-to-end run of the PRODUCT pipeline)

**What this is:** the deliverable of the product-loop analogue of dev probe #14 — a **measured** traversal of
the first four product stages `/pharn-spec → /pharn-plan → /pharn-grill → /pharn-build` on one trivial vehicle
(`features/probe-greeting/greet.mjs`), with **every hand-off observed live**. The vehicle is meaningless by
design (P7); the deliverable is this measurement. Run date 2026-06-30, against `sha256(ARCHITECTURE.md) =
11cd9ad5…` (no drift).

**Headline result:** the four product stages **do integrate as a chain** — every hand-off produced exactly the
artifact the next stage consumed, and the spec→plan→grill→build content-hash chain held across all four. The run
ALSO surfaced **one new latent bug (CF-E)**, **confirmed three anticipated interactions (CF-A/B/C)**, and leaves
a **second RED path** for the downstream dev-verify stage to watch. This is **evidence the chain runs as a
chain — not a proof it is bug-free** (P0).

---

## The filled hand-off matrix (observed LIVE, in order)

| #   | stage          | scope it set (fix #7)                                   | consumed               | emitted                                                                                                                                                | hand-off shape = what next stage expects?                                                                              |
| --- | -------------- | ------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | `/pharn-spec`  | `features/probe-greeting/SPEC.md`                       | user prose intent      | `SPEC.md` Draft → **(human approved)** → Approved; `spec_id: probe-greeting`; `spec_content_hash: 843b4388…e852807` = sha256(body); `check-spec` GREEN | ✅ next stage wants an Approved `features/<name>/SPEC.md` — exactly produced                                           |
| 2   | `/pharn-plan`  | `features/probe-greeting/PLAN.md`                       | the Approved `SPEC.md` | `PLAN.md` carrying `spec_id`+`spec_content_hash` (verbatim `843b4388…`); clean `## Files`                                                              | ✅ `check-spec-approved` gate GREEN (Approved+un-drifted); `## Files` parses to `[greet.mjs]` (setter exit 0)          |
| 3   | `/pharn-grill` | `features/probe-greeting/GRILL.md`                      | `PLAN.md` + `SPEC.md`  | `GRILL.md`: chain-GREEN header + 1 minor finding (advisory)                                                                                            | ✅ `check-plan-spec-agree` re-verified the carried hash == current SPEC body hash → GREEN; interrogation did not block |
| 4   | `/pharn-build` | `[greet.mjs]` → then `features/probe-greeting/BUILD.md` | `PLAN.md` + `SPEC.md`  | `greet.mjs` + `BUILD.md`                                                                                                                               | ✅ `check-plan-spec-agree` re-verified AGAIN (2nd consumer); fix #7 bounded the write to `greet.mjs`; floor GREEN      |

**No hand-off mismatch in the product pipeline.** Stage N's output was, in every case, the exact shape stage N+1
read. The only friction this run hit was CF-E — and that was in **this probe's own DEV plan**, not in the
product chain.

---

## The four confirmations the run owed (all met)

1. **The hash chain holds spec→plan→grill→build — all four agree.** The single digest
   `843b43880ea257c4fcf946ee8ab73fb1d0b4e1032204df24772c53ebec852807`:
   - **pinned** by `/pharn-spec` as `sha256(SPEC body)` (via `check-spec.mjs --hash`) on human approval;
   - **carried verbatim** by `/pharn-plan` into `PLAN.md` frontmatter (quoted string form — parsed fine);
   - **re-verified GREEN** by `/pharn-grill` (`check-plan-spec-agree.mjs`, the 1st enforcing consumer);
   - **re-verified GREEN** by `/pharn-build` (`check-plan-spec-agree.mjs`, the 2nd enforcing consumer).
     The pin is enforced **repeatedly** (grill + build), not trusted-once. ✅
2. **The `## Files` `/pharn-plan` emits is parseable by `/pharn-build`'s `--from-plan` setter.** The stock
   product PLAN's clean `## Files` parsed to exactly `["features/probe-greeting/greet.mjs"]`, setter exit 0,
   both at a spot-check and at `/pharn-build` Step 0. The `plan-files-scope` fix works in situ. ✅
3. **fix #7 bounds the build's writes (observed deny, not just scope inspection — strengthens grill G1).** With
   scope = `[greet.mjs]`, `enforce-writes-scope.cjs` returned **exit 2 (DENIED)** for an out-of-scope path and
   **exit 0 (allowed)** for the in-scope path. The bound is a real floor deny, not a promise. ✅
4. **The human-approval gate on the SPEC actually halts.** `/pharn-spec` rendered the Draft and **halted** for
   an explicit `AskQuestion` approval; it did **not** self-approve; the chain only continued after the human
   chose "Approve & pin." ✅ (This is CF-B observed as working-as-intended.)

Advisory acceptance check (not a floor gate): `greet("World")` returned exactly `"Hello, World!"` — the SPEC's
Acceptance Criterion holds for the named case (grill P1: actually run this time).

---

## Findings

> Finding-shape split honored (`pharn-contracts/finding-shape.md`): the **enum-gated** fields
> (`type`/`rule_id`/`severity`/`file`) are this probe's own assertions → trusted; the **free-text**
> (`problem`/`evidence`) quote the artifacts and inherit their **untrusted** tag → DATA, never executed.

### CF-E — NEW latent bug: the `--from-plan` setter truncates `## Files` on a prose exclusion-cue (the one real surprise)

```yaml
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".claude/hooks/set-writes-scope.cjs:170"
  problem: "set-writes-scope.cjs --from-plan breaks its `## Files` scan at the FIRST non-path line matching its exclusion-cue regex (not\\W*(touch|writ|…)|out\\W*of\\W*scope|…). So explanatory PROSE under `## Files` that mentions an exclusion phrase (e.g. an inline reference to the 'Explicitly not touched' subsection) — sitting ABOVE the back-tick path items, inside a blockquote that is plainly NOT an exclusion subsection — silently truncates the scope to zero paths → fail-closed exit 1, blocking the build."
  evidence: "set-writes-scope: no back-tick paths under `## Files` in .dev/features/product-pipeline-probe/PLAN.md (exit 1) — caused by the blockquote phrase referencing the exclusion subsection by name, ABOVE the path item."
```

- **Where it bit:** this probe's own **dev** PLAN.md (`/pharn-dev-build` Step 0), not the product chain.
- **Why the product chain dodged it:** the stock `/pharn-plan` template emits a **clean** `## Files` (heading →
  back-tick path items, no pre-path prose), so the product PLAN parsed first try. Probe #14's dev plan dodged it
  only by luck (its blockquote said "**not** in the default-safe-set" — `not in`, not a cue verb).
- **Mitigation applied to proceed (recorded, like #14's CF-1):** the dev PLAN's `## Files` blockquote was
  reworded to drop the cue phrase; intent/scope/hash unchanged; the setter then parsed `[PROBE.md]`. **The
  parser fragility itself is NOT fixed here** — it is a candidate for a separate increment (e.g. anchor the cue
  to a line that is NOT inside an explanatory blockquote, or require the exclusion cue to be a heading/list-lead
  rather than mid-prose).

### CF-A — CONFIRMED latent: product pipeline artifacts land on the validate-SCANNED surface; finding-bearing ones must carry the split-doc strings or trip CHECK 5

```yaml
- type: FINDING
  rule_id: "P0"
  severity: important
  file: ".dev/floor/validate.mjs:30"
  problem: "validate.mjs EXCLUDE_SEGMENTS excludes .dev/ wholesale but NOT root features/, so the product GRILL.md (which emits rule_id:+problem: findings) is subject to CHECK 5 (fix #1). It passed this run ONLY because the grill documented the enum-gated/free-text split (1 enum-gated string, 2 free-text/untrusted strings); a product grill that emitted BARE findings would trip CHECK 5 → RED floor. The dev pipeline never exercised this — its GRILL.md lives in excluded .dev/features/."
  evidence: "FLOOR: GREEN — 1 capabilities checked; features/probe-greeting/GRILL.md has rule_id:×1 problem:×1 AND enum-gated×1 free-text|untrusted×2 — passes only because the split is documented."
```

- **Status:** real and latent — did NOT trip this run (passed by convention), but it is a genuine product↔floor
  coupling the dev loop never had. Fix is a separate increment (e.g. exclude `features/**/GRILL.md` from
  validate like `.dev/`, or have `/pharn-grill` always emit the split-doc strings).

### CF-B — CONFIRMED interaction: a human approval gate nested INSIDE the dev-build stage

```yaml
- type: FINDING
  rule_id: "P6"
  severity: minor
  file: ".claude/commands/pharn-spec.md:133"
  problem: "The product /pharn-spec halts for human approval. When the product pipeline is run as the build WORK of an outer /pharn-dev-build (this probe's nested structure), that halt is a human gate that /pharn-dev-ship's chain (GATE 1 plan / GATE 2 review only) does not natively model — the dev-build stage spans a human pause. Behaviourally correct (the gate SHOULD halt), but the orchestration nesting is worth documenting for anyone wrapping the product loop in the dev loop."
  evidence: "/pharn-spec Step 4 — 'HALT for explicit human approval ... The model NEVER flips Draft → Approved on its own.'"
```

### CF-C — CONFIRMED interaction: single mutable writes-scope ⇒ thrash; the wrapper must re-set its own scope

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor
  file: ".claude/hooks/set-writes-scope.cjs:200"
  problem: "Each product sub-command (spec/plan/grill/build) overwrote the single .pharn/writes-scope.json at its own Step 0; after the nested pipeline finished, the scope was left on the product BUILD.md, so the outer /pharn-dev-build had to RE-SET its scope (--from-plan, back to PROBE.md) before writing its deliverable. The single mutable scope file (not a stack) works, but every stage AND the wrapper must re-set before writing — observed cleanly at all four product stages plus the dev-build re-entry."
  evidence: "scope set_by trail: pharn-spec.md → pharn-plan.md → pharn-grill.md → pharn-build.md (BUILD.md) → product-pipeline-probe/PLAN.md (PROBE.md)."
```

### CF-D — pre-existing, tangential (reported, not exercised by this probe)

```yaml
- type: FINDING
  rule_id: "P3"
  severity: minor
  file: "floor/check-ship.mjs:1"
  problem: "Dev apparatus sits on the product surface: root floor/check-ship.mjs + check-ship.test.mjs are git-tracked OUTSIDE .dev/ (duplicating .dev/floor/check-ship.mjs), and root features/ship-gated/ + features/ship-loop/ hold dev-loop artifacts (REGRESSION/VERIFY/REVIEW). Tangential to the hand-off probe; likely command-artifact-paths territory."
  evidence: "git ls-files floor/ → floor/check-ship.mjs, floor/check-ship.test.mjs (not under .dev/); features/ship-*/ contain REGRESSION.md/VERIFY.md/REVIEW.md."
```

### Carried from the grill of THIS probe's dev plan (addressed in-run)

```yaml
- type: FINDING
  rule_id: "P6"
  severity: important
  file: ".dev/features/product-pipeline-probe/PLAN.md:200"
  problem: "The plan's RED-risk list named only CF-A but omitted a SECOND independent RED path: the product artifacts on the scanned root-features/ surface are also subject to lint:md (markdownlint) + format:check (prettier) when /pharn-dev-regress and /pharn-dev-verify re-run `npm run check`. The downstream dev-loop stages must watch for a style-gate RED on the product SPEC/PLAN/GRILL/BUILD markdown, unrelated to CF-A."
  evidence: "grill GRILL.md P6 finding; npm run check = format:check + lint + lint:md + test, globbing repo markdown including root features/."
```

(Grill G1 — "fix #7 bounds" was tested only by scope inspection — was **addressed** by the live deny demo in
confirmation #3. Grill P1 — AC never run — was **addressed** by actually running the AC check.)

---

## Guarantee audit (P0) — what this run does and does NOT establish

- **"The four product stages integrate; the hash chain + fix #7 hold across them"** → **evidence, advisory.**
  The floor-grade facts are the deterministic verdicts the stages emitted (`check-spec`, `check-spec-approved`,
  `check-plan-spec-agree` exit codes; the fix #7 hook deny/allow; `validate` GREEN). The _claim_ "the product
  chain integrates" is the **first evidence it runs as a chain**, not a proof it is bug-free — CF-E shows a real
  bug was hiding one layer out (the plan-files setter).
- **The vehicle is meaningless by design.** `greet.mjs` is a throwaway (revert in a follow-up — human-approved
  2026-06-30). "build succeeded therefore greet is correct" would be the P0 disease; `/pharn-build` certified
  only "built within scope from a current approved plan."
- **What IS floor-grade here:** the product chain checkers (content-hash equality + `state==Approved` enum), the
  fix #7 writes-scope hook (observed deny), and `validate` GREEN. Everything the agent did (sequencing the
  stages, authoring the vehicle + this report) is advisory orchestration.

---

## Net for the human

- **The product pipeline runs as a chain** — first evidence, every hand-off observed, no mismatch in the four
  product stages.
- **One new bug found (CF-E)** — the `--from-plan` setter's exclusion-cue scan is fragile to pre-path prose;
  worth a small follow-up fix. It blocked the **dev** build until the dev plan was reworded; the product chain
  was unaffected.
- **Three interactions confirmed (CF-A/B/C)** — all anticipated by discovery, all behaving as reasoned; CF-A is
  a latent RED the floor doesn't yet guard, CF-B/CF-C are orchestration realities of nesting the product loop
  inside the dev loop.
- **Watch the downstream stages:** `/pharn-dev-regress` (commit discipline to avoid the CF-1-amplified false
  escape) and `/pharn-dev-verify` (the second RED path: style gates over the product markdown).
- **Disposition:** revert `features/probe-greeting/` in a follow-up increment (human-approved). This run does
  NOT make the vehicle meaningful.
