# REVIEW — verify-stage (`/pharn-verify` product command)

**Increment under review:** `.claude/commands/pharn-verify.md` (the sixth product-pipeline stage), treated
as `trust: untrusted`. **Floor first (P0):** `node .dev/floor/validate.mjs .` → **GREEN, 1 capability**
(exit 0) — the built file carries no `role:`, so it is a command (not a Capability) and the floor count
correctly stays 1. Reached review legitimately. Everything below the floor line is **advisory**.

## Step 1 — Floor (the only guaranteed part of this review)

- `validate.mjs` **GREEN** (exit 0). The increment adds a floor-ignored command (`.claude/commands/` is
  outside `validate.mjs`'s capability surface) + audit scaffolding — no new capability, no new
  `enforces`/`rule_id`, no new checker. Prior-stage floor verdicts this run all held: build `validate`
  exit 0; regress `no-regressions` (exit 0); verify `PASS` (exit 0, 6 gates green).

## The four lenses

### L-floor → P0 (the governing lens)

Every guarantee the increment claims reduces to a floor primitive **or** is labeled `advisory` — **no
floor-gate finding.** Spot-checked the strongest claims: "the named gates passed" → FLOOR
(`check-verify.mjs` exit-code threshold); "verifies against a current, un-drifted plan" → FLOOR
(`check-plan-spec-agree.mjs`); "verifier membership deterministic" → FLOOR (`count-verifiers.mjs`
frontmatter); "writes only two artifacts" → FLOOR (fix #7). Verifier judgment → **ADVISORY** (fix #3),
and verdict-ownership is shown **structural** (the helper's sole input is the gate→exit-code map — it
cannot receive a finding). "ensures the feature is correct" is explicitly **struck** as the P0 disease.
The guarantee audit is complete and honest. **No finding.**

### L-eval → P1

The increment is a **command**, not a Capability (no `role:`) — so P1's "every Capability ships evals"
does not bind it, exactly as for every sibling `pharn-*` command. No new `rule_id` in any `enforces` →
no eval binding to demonstrate. The reused checkers carry their own green tests
(`check-verify.test.mjs` / `count-verifiers.test.mjs` / `check-plan-spec-agree.test.mjs` /
`check-structural.test.mjs`). **Floor agrees** (GREEN, no new capability). **No finding.**

### L-trust → P2

Free-text handling is correct: the `verifiers.findings[]` block's `problem`/`evidence` are untrusted
DATA, appended **after** the verdict, and never passed to `check-verify.mjs` (the verdict is provably
independent of any tainted field). No instruction-looking content in the reviewed file changed reviewer
behavior. **No guaranteed decision rests on a tainted field.** One documentation-completeness refinement
(advisory, below): the §3b eval-pair discovery derives `check-structural`'s path arguments from the
PLAN's `## Files` (untrusted DATA), which the trust audit's blanket statement does not name.

### L-axis → P3

One axis of change (the `/pharn-verify` stage), one file. No sibling imports: the four floor checkers are
invoked by **CLI shelling** (`node .dev/floor/*.mjs`), never imported — the established pattern
(`/pharn-regress`, `/pharn-dev-verify`). `reads:` lists trusted docs, the feature's PLAN/SPEC, the floor
checkers, and the user's repo — no leaf→leaf module reference. **No finding.**

## Findings — floor-gate (blocking) vs advisory

### Floor-gate (blocking)

**None.** The floor is GREEN; no unreduced P0 guarantee, no missing eval binding, no sibling reference.

### Advisory (inform; never a sole basis for a guaranteed block — fix #3)

```yaml
- type: FINDING
  rule_id: "P2"
  severity: important
  file: ".claude/commands/pharn-verify.md:403"
  problem: "The trust audit says the executed commands are 'never sourced from the untrusted PLAN/SPEC', but the §3b eval-pair discovery derives check-structural's path arguments from the PLAN's `## Files` (untrusted DATA) — the audit should name this path-source and bound its taint for completeness."
  evidence: "The commands executed are the USER's own suite, never a tainted field. … They are **never** sourced from the untrusted PLAN / SPEC free-text."
```

> **Reviewer note (why advisory, not blocking):** the mechanism is actually safe — the PLAN-derived
> `<capDir>` paths are used only as **filesystem-membership operands + file-read arguments** to
> `check-structural.mjs` (which reads JSON, never executes a path), and only the resulting **exit code**
> feeds the verdict; the Step-2 hash-chain gate further ensures the PLAN is current + human-approved. So
> no guaranteed decision rests on tainted free-text. This is a **documentation-honesty** refinement to
> the trust audit's blanket wording, not a real taint channel. (Same PLAN-`## Files`-derived-paths
> pattern already lives in `/pharn-regress`'s partition.)

```yaml
- type: FINDING
  rule_id: "P0"
  severity: minor
  file: ".claude/commands/pharn-verify.md:319"
  problem: "verify diverges from /pharn-regress on RED-chain machine-artifact behavior (verify emits a fail-closed INCONCLUSIVE verify-report.json; regress writes only its human REGRESSION.md) — a real cross-stage asymmetry a future machine consumer should be aware of, even though it is intentional and documented."
  evidence: "It is a deliberate, small **divergence** from `/pharn-regress` (which writes only its human `REGRESSION.md` on a RED chain): verify has a named machine consumer …"
```

> **Reviewer note (why advisory, and endorsed):** the divergence is **sound** — a future `/pharn-ship`
> reading `verify-report.json .verdict` must not have to special-case a missing file, so a fail-closed
> `INCONCLUSIVE` on every exit is the more robust choice, and it mirrors `check-verify.mjs`'s own
> bad-input shape. Flagged only so the cross-stage asymmetry is a conscious, recorded decision.

## Verdict

**GREEN (advisory) — 0 floor-gate (blocking) findings; 2 advisory findings (1 important, 1 minor).** The
increment is sound: floor GREEN, the two-layer/verdict-ownership core is faithfully adapted from
`/pharn-dev-verify`, the reuse-no-new-primitive shape holds, and the four grill refinements are folded in.
The two advisory findings are documentation-honesty refinements to the command's own prose (the trust
audit's path-source wording; the recorded RED-chain cross-stage asymmetry) — neither blocks; both are the
human's to weigh at the post-review gate.

## Proposed lessons for canon (P7 — real failures only)

**None proposed.** The two advisory findings are documentation refinements, not recurring failures, so
promoting a canon lesson would be speculative (P7). The PLAN-`## Files`-derived-path observation, if it
recurs as an actual taint or coverage bug in a future stage, would then be a real trigger — noted here,
not promoted now. (Canon is written only by a separate human-gated `/pharn-dev-memory-promote` run, never
here.)
