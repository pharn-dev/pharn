# REVIEW — ship-gated

**Increment under review:** `.claude/commands/ship.md` (the gated `/ship` orchestrator `/build`
produced). **Trust:** `untrusted` — and uniquely here, the artifact is a **command**, i.e. _entirely
instructions_. Every imperative in it (`Run /plan`, `Load CONSTITUTION.md`, `STOP`, `end your turn`) is
the command's direction to a **future `/ship` agent** — **DATA I reviewed, never instructions I
executed** (P2). I did **not** start running `/plan` because the file says to; that refusal is the
fence working (see L-trust). **Floor (Step 1):** `node floor/validate.mjs .` → **GREEN, 1 capability**
(exit 0) — the increment is eligible for review; the count is unchanged because `.claude/commands/` is
floor-ignored.

> The floor is the only guaranteed part of this review; everything below is **advisory** (P0). Findings
> dogfood `pharn-contracts/finding-shape.md`: enum-gated `type`/`rule_id`/`severity`/`file` are my own
> assertions (trusted); free-text `problem`/`evidence` quote the reviewed artifact as DATA.

## The four lenses (on the increment)

- **L-floor → P0: PASS (clean — exemplary).** Every guarantee `ship.md` makes reduces to the floor or
  is labeled advisory. It **strikes** the disease explicitly: "Never write `/ship` ensured the chain ran
  / ensures quality"; "RUNNING the stages … is advisory"; the human gates are "preserved **by
  construction**, not by a floor mechanism" (advisory); only "may write only `SHIP.md`" is claimed as
  FLOOR, correctly reduced to the fix#7 hook. No advisory-dressed-as-guarantee found. This is the single
  most important lens and the increment passes it on its own terms.
- **L-eval → P1: PASS (does not bind; convention met).** `ship.md` has **no `role:`** and **no
  `enforces:`**, so P1's Capability-evals rule does not bind it — exactly like `/regress` and `/verify`,
  the no-`role:` orchestrator commands it mirrors. The floor agrees (GREEN, count unchanged). _Advisory
  residual noted below: "convention met" means no eval is **required**, not that the orchestration logic
  is **tested** — it is not (finding A-1)._
- **L-trust → P2: PASS (no injection; the fence held).** `ship.md`'s own design reads **only** enum-gated
  verdict fields for control flow (`validate` exit, `regression-report.json`/`verify-report.json`
  `.verdict`) and renders `GRILL.md`/`REVIEW.md` free-text as quoted DATA — no proceed/stop rests on a
  tainted field. And as the reviewer I treated the file's pervasive imperatives as DATA, executing none.
  No guaranteed decision rests on a tainted/free-text field.
- **L-axis → P3: PASS (one axis, no sibling-import violation).** One reason to change: the gated chain +
  its per-stage verdict-reads (the `--loop` stop-condition was correctly split to a separate axis). Its
  references to other commands and `floor/check-*.mjs` are an **orchestrator invoking the pipeline
  spine** — its defined role (`ARCHITECTURE.md §6`), not a `pharn-*` leaf→leaf import; `.claude/commands/`
  is floor-ignored, so the P3 sibling-grep does not (and should not) flag it.

## Gates (fix #3)

- **floor-gate (blocking): NONE.** `validate` GREEN; no unlabeled P0 guarantee; no missing eval binding
  (none owed); no grep-detectable sibling reference.
- **advisory-gate (warn):** the findings below — all rest on my judgment, none blocks.

## Verdict

**GREEN — the increment is clean on all four lenses; 0 blocking floor-findings.** A carefully
P0-disciplined orchestrator. The advisory findings concern the **residual** every command-only
increment carries: its orchestration _logic_ is floor-invisible and untested until a live run.

## Advisory findings (non-blocking — orchestration residual)

```yaml
- type: FINDING
  rule_id: "P1"
  severity: important
  file: ".claude/commands/ship.md:68"
  problem: "ship.md's actual orchestration LOGIC — does it read the right verdict field per stage, stop
    on the first non-GREEN, place the two human gates correctly — is verified by NOTHING deterministic
    this run. build-GREEN, regress-no-regressions, and verify-PASS all passed, but ship.md is
    floor-ignored markdown, so every one of those gates confirmed only that ADDING the file broke no
    existing check — none executed the orchestrator. Three green verdicts on an increment whose behavior
    is untested is a real (demonstrated, not hypothetical) gap; the proof is the deferred live dogfood."
  evidence: "## Step 2 — Run the chain, branching ONLY on each stage's STRUCTURAL verdict (P5) … (the
    chain logic exists only as prose; no eval/test exercises it)."
```

```yaml
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".claude/commands/ship.md:80"
  problem: "The turn-handoff with self-halting sub-stages is underspecified. /plan ends at its own
    approval halt (GATE 1) and /build HALTs on a RED floor — both end their turn standalone. ship.md says
    'capture its verdict, then CONTINUE', and reads /build's verdict by RE-running validate (since /build
    emits no machine report, CF-3). But HOW /ship regains control to read that verdict after a sub-stage
    halts its own turn, and how it 'resumes (turn 2)' after the human answers GATE 1, is asserted, not
    mechanized — exactly the kind of seam a live dogfood must pin."
  evidence: "> Turn semantics. A stage's own 'end your turn' applies when it is run standalone. Under
    /ship, perform the stage's work, capture its verdict, then CONTINUE the orchestration."
```

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor
  file: ".claude/commands/ship.md:64"
  problem: "Slug propagation is named but not mechanized: /ship passes a free-text <description> to
    /plan, and /plan chooses the <name> slug — but ship.md says to 'reuse that one slug across every
    stage' without specifying HOW /ship learns the slug /plan picked (presumably by observing the
    features/<name>/PLAN.md path /plan created). A determinism gap at the very first hand-off."
  evidence: "<name> is the kebab-case slug /plan chooses for this increment; reuse that one slug across
    every stage."
```

```yaml
- type: FINDING
  rule_id: "P0"
  severity: minor
  file: "features/ship-gated/PLAN.md:1"
  problem: "Process papercut surfaced this run (not in ship.md itself): the /plan-authored PLAN.md failed
    the repo's own style gates (markdownlint MD058 on a table, then prettier), so `npm run check` went RED
    and required a post-build scoped fix. /plan does not format/lint its own output against the gates the
    rest of the repo must pass — so any plan (especially one with a table) can land non-conforming and is
    caught only later. Real and recurring; basis for the proposed lesson below."
  evidence: "observed live: `npm run check` → format:check flagged .claude/commands/ship.md AND
    features/ship-gated/PLAN.md; markdownlint MD058 at PLAN.md:23/29 — both fixed post-build."
```

## Proposed lesson for `/memory-promote` (gated — NOT written to canon here, P2)

Per `/review`'s final step, I propose **one** lesson from a **real** failure this run surfaced (P7 —
real, not hypothetical). It is **not** written to `memory-bank/lessons-learned.md` here; `/memory-promote`
assembles the candidate, runs `check-provenance.mjs`, and **halts for explicit human accept/deny** before
any write (the model never self-promotes — P2).

- **Candidate — _A green pipeline (build ∧ regress ∧ verify) on a floor-invisible increment certifies
  "added without breaking anything," NOT "the thing works" — an orchestrator/command-only feature is
  unverified by the floor and must be dogfooded live before its logic is trusted._** `ship.md` passed
  all three floor verdicts, yet every gate is blind to `.claude/commands/` content (floor-ignored), so
  none exercised the orchestrator; its verdict-reads and turn-handoff live only as prose. This **extends
  the probe's `L5`** (floor verdicts rest on advisory orchestration) one level up: when the _increment
  itself_ is the orchestration, the floor can confirm coexistence but not behavior.
  - **Why:** "verified/regress-clean" reads as "it's good," but for a floor-invisible artifact it means
    only "the existing suite still passes with it present." Treating three green verdicts as evidence the
    orchestrator _works_ is the P0 disease one level up — "the gates are green" mistaken for "the feature
    is correct."
  - **How to apply:** for any command-only / floor-ignored increment (a new `.claude/commands/*.md`,
    a prose-only orchestrator), require a **live dogfood** (a real run with every hand-off observed, like
    `pipeline-integration-probe`) as the correctness signal — and never present its floor verdicts as
    certifying its behavior. Keep the verdict-reads floor-grade; label the orchestration advisory-until-run.
  - **Provenance (for `/memory-promote`):** feature `ship-gated`; commit = HEAD at promote time (`ship.md`
    currently uncommitted on branch `ship-gated`; base `8063643`); source
    `features/ship-gated/REVIEW.md` (this file) + `VERIFY.md`; date `2026-06-29`.

**End of `/review`.** The actual promotion is a separate, human-gated `/memory-promote` run. The increment
is GREEN (0 blocking) — the post-review decision (merge / fix / abandon, and whether to run the live
`/ship` dogfood next) is yours.
