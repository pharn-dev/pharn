# REVIEW — command artifact paths → `features/<name>/` (fix F1)

- increment: align `/plan` and `/review` declared `writes:` (+ write-step wording) and one `build.md`
  prose line to the `features/<name>/` artifact convention, so fix #7's now-enforced scope permits the
  real path. Command-doc edits only; no code, no evals, no trusted-doc edits.
- diff under review: 3 files — `.claude/commands/{plan,review,build}.md` (12 insertions / 11
  deletions). All hook/floor code byte-unchanged.
- reviewer: PHARN reviewing PHARN. The increment is `trust: untrusted`. This file obeys the finding
  object (`ARCHITECTURE.md §8`, fix #1): enum-gated `{type, rule_id, severity, file}` + free-text
  `{problem, evidence}` carried as DATA.

## Step 0 / Step 1 — the fix confirmed itself live

- **Step 0 (scope):** `set-writes-scope.cjs --from-frontmatter .claude/commands/review.md` →
  `scope = ["features/**/REVIEW.md", "memory-bank/lessons-learned.md"]`. The **newly built** glob.
- **Dogfood (the whole point of this increment):** under that scope the live hook **allows**
  `features/command-artifact-paths/REVIEW.md` (exit 0) and still **denies** `floor/x.mjs` (exit 2). So
  this review is written **directly** to its `features/<name>/` home with **no safe-set reset** — the
  exact friction F1 named is gone, verified by the guard itself.
- **Step 1 (floor):** `node floor/validate.mjs .` → **`GREEN — 1 capabilities checked in .`** (exit 0).
  Commands are floor-excluded, so the count is unchanged. Floor passed; everything below is
  **advisory** (P0).

## Trigger closed (P7 — real, recorded)

`features/writes-scope/REVIEW.md` **F1**: the commands declared root `PLAN.md`/`REVIEW.md` while
artifacts live in `features/<name>/`, so fix #7 denied the conventional path (demonstrated live in
that review). This increment makes the declarations name reality. **F1 is closed** — and the closure
is self-evidencing: the command I am running was the one repaired, and it just let me write here.

## Lens results

- **L-floor (P0), governing lens:** PASS; **1 minor advisory (A1)**. The increment introduces **no new
  guarantee** — the commands are advisory orchestration (ARCHITECTURE §7), and the fix #7 hook (the
  guarantee) is byte-unchanged; it merely consumes a corrected `writes:` declaration. Nothing is
  claimed as guaranteed without a floor reduction. A1 records that the necessary switch to a glob
  slightly widens what each command may write.
- **L-eval (P1):** PASS, no finding. No Capability, no `enforces`, no `rule_id`; `.claude/commands/`
  is excluded from `floor/validate.mjs` (line 30, read live), so no `evals/cases` are required and the
  capability count stays 1. Option A (no regression test for the `features/**/<artifact>` glob) was the
  approved choice; the glob behaviour was empirically verified at plan time and re-verified live in
  Step 0. Floor and lens concur.
- **L-trust (P2):** PASS, no finding — with one **observation deliberately surfaced.** The increment
  edits `review.md`, the **very command now executing**, and its new prose steered where I wrote this
  file. I checked rather than complied blindly: the command is `trust: trusted`, human-approved (option
  A), and built through the loop; the new target is a benign `features/<name>/REVIEW.md`, not a
  redirect to a sensitive zone; and fix #7 independently fences the write (a hostile redirect to
  `floor/`/`memory-bank/`/`.claude/` would still deny — confirmed exit 2 in Step 0). So the
  self-reference is the intended convention taking effect, **not** an injection. No finding emits
  free-text into a guaranteed decision (the commands emit none at build).
- **L-axis (P3):** PASS; **1 minor advisory (A2)**. One axis per file — all three change for the single
  reason "artifact location → `features/<name>/`". No sibling reference: the commands' `reads:` name
  only trusted root docs + placeholders, no `pharn-stack-*`/`pharn-skills-*` crossing. A2 records a
  same-axis frontmatter line left stale by the approved prose-only scope on `build.md`.

## Findings — floor-gate (blocking)

**None.** `validate.mjs` is GREEN; no new guarantee is fabricated; no sibling reference; capability
count unchanged. The increment is structurally sound and may proceed.

## Findings — advisory-gate (warn — inform; never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: "fix#7/P0"
  severity: minor
  file: ".claude/commands/review.md:8"
  problem: "The features/**/REVIEW.md (and features/**/PLAN.md) glob admits ANY feature folder's REVIEW.md/PLAN.md during /review and /plan, not only the current increment's — the guard's granularity drops from 'exactly one file' to 'any artifact of that type under features/'."
  evidence: 'Before: writes: ["REVIEW.md"] permitted exactly one path. After: writes: ["features/**/REVIEW.md", …] — enforce-writes-scope.cjs allows features/<anything>/REVIEW.md (e.g. it would permit overwriting features/trust-fence/REVIEW.md). Inherent to static-declaration + dynamic-path: the folder is chosen at runtime, so a glob is the only static expression. Bounded and accepted: only PLAN.md/REVIEW.md under features/ are reachable (floor/, memory-bank/, .claude/ still deny — confirmed exit 2 live), and every such write is git-tracked, so a cross-feature overwrite is visible in the diff.'
```

```yaml
- type: FINDING
  rule_id: P3
  severity: minor
  file: ".claude/commands/build.md:7"
  problem: "build.md's reads: still names the root 'PLAN.md' path, now inconsistent with the features/<name>/ convention this increment establishes for /plan and /review."
  evidence: 'build.md:7 reads: ["CONSTITUTION.md", "ARCHITECTURE.md", "PLAN.md", "<target repo>"] — ''PLAN.md'' is the now-moved root path. Deliberately left: the approved plan scoped build.md to ''prose only — no frontmatter change'', and reads: is advisory (ARCHITECTURE: enforced only at the write side), so this is cosmetic staleness, not a fix #7 collision. The builder flagged it; a one-line follow-up aligns reads:/writes: parity if wanted.'
```

### Why these are advisory, not blocking

Both are `minor`, rest on reviewer judgment (not floor-checkable content), and neither touches a
guaranteed invariant. A1 is the accepted, only-possible consequence of expressing a dynamic path in a
static field; A2 is a deliberate scope decision recorded by the builder. Neither is a constitutional
STOP.

## Verdict

**GREEN on the floor (the increment's only guaranteed gate passed); NOT blocked. 0 floor-gate findings,
2 minor advisory.** The increment closes `features/writes-scope/REVIEW.md` F1, and the closure proved
itself: `/review`'s repaired command wrote this file straight into `features/<name>/` with no reset,
while the fix #7 sensitive-zone fence held. The two minor items (glob granularity; one stale advisory
`reads:` line) are honest residuals, not defects.

## Lesson — no new proposal; this increment validates L3

No new lesson (P7 — the two findings are minor and specific, not a recurring failure). This increment
is the **application** of **L3** (proposed gated in `features/writes-scope/REVIEW.md`: "making a
declarative field load-bearing requires re-auditing every existing declaration of it"). L3 predicted
exactly this work and remains **pending human promotion** to `memory-bank/lessons-learned.md`; this
clean execution strengthens the case to promote it. Provenance to append on promotion: applied by
feature `command-artifact-paths` (the `writes:` re-audit L3 prescribes).
