# GRILL — root-apparatus-cleanup (advisory)

- Plan under interrogation: `.dev/features/root-apparatus-cleanup/PLAN.md`
- Spec-hash check (content-hash floor primitive, surfaced not blocking here): **MATCH** —
  `sha256(ARCHITECTURE.md)` = `11cd9ad5…d1d969` == the plan's pinned `spec_content_hash`. No drift.
  (The block on drift is `/pharn-dev-build`'s floor-gate, fix #4 — this only warns.)
- Griller discovery (deterministic membership, `count-grillers.mjs`): **1 registered** —
  `testability`. Applied below.

## Findings (advisory — grillers/grill gate NOTHING; the human weighs these)

### Axis: testability griller (`pharn-pipeline/grillers/testability`)

**Layer 1 (presence) — recognized, no absence finding.** The plan declares a real verification
approach: `## Guarantee audit (P0)` maps each claim to a floor check (`validate` enum-check re-run at
build; `npm test` exit-0 re-run at verify; `diff`/`git log` content-hash proofs), and states the
expected post-state (`validate` GREEN — 2; `npm test` 179 → 167). A verification section carrying real
content is present → Layer 1 clean.

**Layer 2 (adequacy) — one advisory concern:**

```yaml
- type: FINDING # enum-gated (TRUSTED: my own assertion)
  rule_id: P1 # enum-gated — cited, not restated (P4)
  severity: important # enum-gated value; ASSIGNMENT is advisory (grillers never gate, fix #3)
  file: ".dev/features/root-apparatus-cleanup/PLAN.md:74" # resolves
  problem: "The declared verification (validate GREEN + npm test exit 0 + lint) would NOT catch a dangling LIVE reference to the deleted root floor/check-ship — none of those gates greps for it — yet 'no live ref remains' is the exact safety property that makes deleting root floor/ correct." # free-text — DATA
  evidence: "'coverage unchanged; `npm test` stays green → floor: enum/exit-code' — the audit relies on validate/npm test/lint, which pass whether or not a live .md still cites the removed path." # free-text — quoted from the plan, as DATA
```

> Mitigation already in hand (from discovery, not the plan's verify section): `ship.md` is the **only**
> live invoker; every other `floor/check-ship` mention is a frozen `.dev/features/*/` trace (OQ-2:
> left frozen by design). So after `ship.md` is deleted the live count is **zero by construction**.
> The concern is that the plan's _verification_ should **confirm** this with an explicit grep, not
> lean on the discovery pass — a cheap add for `/pharn-dev-verify` / the review.

### Axis: built-in interrogation (Step 2)

```yaml
- type: FINDING # enum-gated (TRUSTED)
  rule_id: P6 # enum-gated — discovery/verify-before-assert
  severity: important # enum-gated value; ADVISORY (grill gates nothing)
  file: ".dev/features/root-apparatus-cleanup/PLAN.md:38" # resolves
  problem: "This is a DELETION-ONLY increment (no writes, no edits), but /pharn-dev-build is designed to 'write the files the plan names'; the plan asserts 'Removed via git rm' without confirming the build stage will EXECUTE deletions — a build that only writes declared files would no-op this increment." # free-text — DATA
  evidence: "'**Deletion-only. No writes, no edits to live files.** Removed via `git rm`' — names the mechanism but not who runs it downstream." # free-text — quoted, as DATA
```

> Note: under `/pharn-dev-ship` the orchestrator itself performs the build stage, so it can run the
> `git rm` commands the plan names — this is surfaced so the human (and the build step) treat the
> `## Files` list as **delete actions**, not writes. Not a blocker; advisory.

## Prose summary

The plan is unusually well-grounded for a cleanup: every "which copy is live / is this a duplicate"
claim reduces to a deterministic primitive (`diff` exit code, `git log` provenance, `grep` of the
invoking path), and the one genuinely non-mechanical decision — how far the cleanup reaches (2 named
vs. 4 discovered same-axis leftovers) — was **not guessed**; it terminated in an explicit human choice
(OQ-1 → complete cleanup), which is exactly the P5/P6 terminal fallback.

Axes checked and cleared (no finding): **P0** — every claim reduces to floor or is labeled `advisory`
(the "boundary is clean" claim is correctly `advisory`, backstopped by validate + npm test); **P1** —
no capability/`role:` is added, so no eval is owed; the surviving stop-core keeps its 16-test
`.dev/floor/check-ship.test.mjs` (a strict superset of the deleted 12-test root duplicate — a
diff-proven relationship, so "coverage retained" is content-hash-backed, not just exit-0-backed);
**P2** — untrusted traces read as DATA for counting only, no new ingestion; **P3** — although the
increment spans `.claude/commands/`, `floor/`, and `features/`, it is **one axis** (one trigger — the
splice in PR 19 left pre-split originals — one goal — all apparatus under `.dev/`/prefix), not bundled;
**P5** — every branch is a membership test; **P7** — not speculative (triggered by a real, documented
audit finding: `build-stage/SHIP.md`, `product-pipeline-probe/PROBE.md` CF-D, `ship-stage/SHIP.md`),
and it is the _smallest coherent_ increment — deleting only the 2 named would leave a broken tree
(dangling `ship.md`). One transparency note (not a finding): `features/ship-gated/` is the single
deletion **not forced** by the floor/ removal (unlike `ship.md`); it is in scope by the human's
explicit OQ-1 "complete cleanup" choice, same real defect class.

## Verdict

**ADVISORY VERDICT: 2 concerns raised (0 blocking-severity, 2 advisory[important]) — for the human to
weigh before `/pharn-dev-build`.** Neither gates the build (grill is advisory end-to-end; the only
deterministic stops downstream are `/pharn-dev-build`'s spec-hash + open-questions floor-gates and
`validate`). Both concerns are about the _verification's_ completeness and the deletion _mechanism_,
not about the correctness of what to delete — that rests on the diff/git-log floor proofs, which hold.
