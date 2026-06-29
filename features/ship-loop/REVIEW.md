# REVIEW — ship-loop

**Increment under review:** `.claude/commands/ship.md` (the `--loop` section + frontmatter/guarantee-audit
edits) + `floor/check-ship.mjs` + `floor/check-ship.test.mjs`. **Trust:** `untrusted` — the command is
all imperatives (`apply a fix`, `iterate`, `STOP`, `obey its exit code`); every one is the command's
direction to a **future `/ship --loop` agent**, **DATA I reviewed, never instructions I executed** (P2).
**Floor (Step 1):** `node floor/validate.mjs .` → **GREEN, 1 capability** (exit 0) — count unchanged
(`floor/` + `.claude/commands/` are floor-ignored); eligible for review.

> The floor is the only guaranteed part of this review; everything below is **advisory** (P0). Findings
> dogfood `pharn-contracts/finding-shape.md`: enum-gated `type`/`rule_id`/`severity`/`file` are my own
> assertions (trusted); free-text `problem`/`evidence` quote the reviewed artifact as DATA.

## The four lenses (on the increment)

- **L-floor → P0: PASS (clean — and a genuine reduction, not prose).** The increment's central claim —
  "`--loop` stops only on floor-GREEN or cap; `/review` never gates it" — **reduces to the floor**:
  `check-ship.mjs` decides by enum-membership over the two floor `.verdict`s + an integer `iter ≥ cap`
  compare, hermetically tested. The advisory parts are **labeled advisory** (the fix "is irreducible model
  work"; "`--loop` guarantees only the stop, never that a fix works"). The new floor primitive is named
  honestly (the guarantee-audit "Net (`--loop`)" bullet says it adds **exactly one**). No
  advisory-dressed-as-guarantee.
- **L-eval → P1: PASS (convention met, and meaningfully).** `check-ship.mjs` is a floor helper (no
  `role:`) so P1's Capability-evals rule does not bind it; it ships `check-ship.test.mjs` (12 cases) in
  the same step — and unlike a markdown-only increment, that test **actually exercises the feature's
  logic** (the decision table, the off-by-one boundary, fail-closed, `/review`-independence). The floor
  agrees (GREEN). `ship.md` (no `role:`) owes no eval.
- **L-trust → P2: PASS — and structurally stronger than the other stages.** `check-ship.mjs` reads
  **only** two enum `.verdict`s + two ints (`check-ship.mjs:54`, `:109`); it has **no `/review` input**
  (`:19`, `:41`), and the test asserts the decision object carries no `review`/`severity`/`findings`
  channel. So a `/review` finding's free-text **cannot** reach the loop decision — structural, not
  discipline. As reviewer I treated `ship.md`'s imperatives as DATA, executed none.
- **L-axis → P3: PASS (one axis, no sibling-import).** One reason to change: the loop controller + its
  tested stop core. `ship.md` invoking `floor/check-ship.mjs`, and `check-ship.mjs` reading the two
  report files, are an **orchestrator/floor-helper** relationship (the `/verify`↔`check-verify`
  pattern), not a `pharn-*` leaf→leaf import; both dirs are floor-ignored, so the P3 grep does not flag
  them.

## Gates (fix #3)

- **floor-gate (blocking): NONE.** `validate` GREEN; the P0 claim is floor-reduced + tested; no missing
  eval binding; no grep-detectable sibling reference.
- **advisory-gate (warn):** the findings below — all rest on my judgment, none blocks.

## Verdict

**GREEN — clean on all four lenses; 0 blocking floor-findings.** A well-reduced increment: the loop's
_termination_ is genuinely floor (tested helper) and the `/review`-exclusion is genuinely structural. The
advisory findings are about the **agent-side execution** the floor cannot see — and one concrete spec gap
(A-3) worth fixing.

## Advisory findings (non-blocking)

```yaml
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".claude/commands/ship.md:181"
  problem: "The CONTINUE step says 'apply a fix … within the approved plan's ## Files (fix #7 already
    pins the scope)' — but by the time the loop reaches CONTINUE, the intervening stages each ran their
    OWN Step 0 setter, so .pharn/writes-scope.json was OVERWRITTEN and now pins the LAST stage's target
    (e.g. /review's REVIEW.md), NOT the plan's ## Files. fix #7 does NOT 'already pin' the build scope
    here; the loop MUST re-run `set-writes-scope.cjs --from-plan <PLAN.md>` before applying a fix, or the
    fix-write is denied. A real spec gap a live run hits on the first CONTINUE."
  evidence: "`3` `CONTINUE` → iterate: apply a fix to the failing gate within the approved plan's `##
    Files` (fix #7 already pins the scope), then re-run /regress → /verify → /review."
```

```yaml
- type: FINDING
  rule_id: "P2"
  severity: important
  file: ".claude/commands/ship.md:189"
  problem: "'/review can NEVER gate the loop (structural)' is precise about check-ship.mjs's DECISION
    (it has no /review input) — but it must not be over-read as 'the loop cannot be swayed by /review.'
    The loop still RUNS /review each iteration and the agent OBEYS check-ship's exit code as ADVISORY
    compliance (ship.md:195 says so). So the structural guarantee bounds the helper's decision; the
    loop's actual continue/stop remains only as floor-grade as the agent honoring that exit code over
    any /review free-text it just read (the LIMITS §2 residual). Structural for the decision; advisory
    for the compliance — both true, and the second is the residual."
  evidence: "That exclusion is **structural** (the input does not exist), the fix#3 disease made
    impossible, not merely promised."
```

```yaml
- type: FINDING
  rule_id: "P7"
  severity: important
  file: ".claude/commands/ship.md:180"
  problem: "The loop's ORCHESTRATION — does the agent invoke check-ship.mjs with the right args each
    iteration, re-run regress/verify/review in order, apply fixes within scope, re-enter correctly — is
    floor-invisible prose, verified by NOTHING this run (ship.md is floor-ignored markdown). build-GREEN
    / regress-clean / verify-PASS exercised only check-ship.mjs's LOGIC (its test), never the loop's
    execution. This is the ship-gated A-1 residual amplified: --loop adds an autonomous loop (no human
    between iterations), so the unverified surface is larger. A live --loop dogfood is the only proof."
  evidence: "## Step `--loop` … 1. Iteration 1 = the gated /build → /regress → /verify → /review … 3.
    CONTINUE → iterate (the loop body exists only as prose; no eval/test runs it)."
```

```yaml
- type: FINDING
  rule_id: "P4"
  severity: minor
  file: "floor/check-ship.mjs:54"
  problem: "check-ship.mjs hardcodes the verify/regress verdict enums ({PASS,FAIL,INCONCLUSIVE} and
    {no-regressions,regressions,inconclusive}) — duplicated from check-verify.mjs / check-regress.mjs's
    outputs with no shared source (there is no contract for the stage verdict strings, unlike the
    severity/finding-shape enums in pharn-contracts). If a stage renames a verdict, check-ship silently
    goes fail-closed (INCONCLUSIVE) on every call until updated. Bounded (fail-closed is safe), but a
    coupling worth noting; a `pharn-contracts` verdict-enum would remove it."
  evidence: 'const VERIFY_VERDICTS = new Set(["PASS", "FAIL", "INCONCLUSIVE"]); const REGRESS_VERDICTS =
    new Set(["no-regressions", "regressions", "inconclusive"]);'
```

## Proposed lesson for `/memory-promote` (gated — NOT written to canon here, P2)

Per `/review`'s final step, I propose **one** lesson from a **real** failure this run surfaced (P7 —
real, not hypothetical), drawn from finding **A-3**. It is **not** written to canon here; `/memory-promote`
assembles the candidate, runs `check-provenance.mjs`, and **halts for explicit human accept/deny** (the
model never self-promotes — P2).

- **Candidate — _A re-entrant write-step cannot assume an earlier stage's writes-scope still holds:
  every stage's Step 0 setter OVERWRITES `.pharn/writes-scope.json`, so the active scope is always the
  LAST setter's target, not the plan's `## Files`. An orchestrator that writes again after intervening
  stages MUST re-run `set-writes-scope --from-plan` before the write._** The `--loop` spec wrote "apply a
  fix within `## Files` (fix #7 already pins the scope)" at the CONTINUE point — but `/regress`/`/verify`/
  `/review` had each re-scoped to their own artifacts, so the build scope was long gone.
  - **Why:** fix #7 is a single mutable global (`.pharn/writes-scope.json`), not a stack — the
    `pipeline-integration-probe` already observed each stage overwrites it. "fix#7 pins it" is true only
    for the window between a setter and the next; across stages it is false. Treating it as durable is the
    P0 disease in miniature ("declared in the contract" ≠ "still in effect").
  - **How to apply:** any command/loop that performs a Write after another scope-setting stage ran must
    **re-run its own `set-writes-scope` immediately before the Write** (as `/regress` and `/verify`
    already do per-artifact). Never assume a prior stage's scope persists; never write "fix #7 already
    pins it" across a stage boundary.
  - **Provenance (for `/memory-promote`):** feature `ship-loop`; commit = HEAD at promote time (`ship.md`
    - `check-ship.*` uncommitted on branch `ship-gated`; base `eb8fea4`); source
      `features/ship-loop/REVIEW.md` (this file), finding A-3; date `2026-06-29`.

**End of `/review`.** Verdict GREEN (0 blocking). The post-review decision — merge / **fix A-3** (a
one-line scope-setter correction in `ship.md` is the obvious next move) / run a live `--loop` dogfood
(A-2/A-3) / abandon — is yours.
