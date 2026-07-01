# REVIEW — ship-stage (`/pharn-ship` product command)

**Increment:** `.claude/commands/pharn-ship.md` — the gated PRODUCT pipeline orchestrator (`/pharn-ship`,
stage 7). Reviewed as `trust: untrusted` (a command doc is markdown-is-executable, LIMITS §1a).

## Step 1 — Floor first (P0)

`node .dev/floor/validate.mjs .` → **GREEN, 1 capability** (exit 0). The increment adds a **command**, not a
Capability (no `role:`), so the floor capability count is unchanged and correct. Standing chain verdicts for
this increment: floor GREEN · `/pharn-dev-regress` → `no-regressions` · `/pharn-dev-verify` → `PASS`. The floor
is the only guaranteed part of this review; everything below is **advisory**.

## The four lenses

### L-floor → P0 (governing) — GREEN, no findings

Every guarantee the command claims reduces to the floor or is labeled `advisory`, and the disease is struck:

- "runs the six stages in order" → **ADVISORY** (`pharn-ship.md:239`); "proceeds only past a proceed floor
  verdict" → the **verdicts** FLOOR, the **act** ADVISORY (two clocks, `:241`); "human gates preserved" →
  **ADVISORY** (`:251`); "writes only `SHIP.md`" → **FLOOR: hook fix #7** (`:255`); "**Net:** zero new floor
  primitive" (`:258`).
- The post-build gate's **discovery** is explicitly labeled **advisory/untested-by-construction** (`:246-250`)
  — the exit code is FLOOR, the gate-selection is not; "Build floor = FLOOR" is guarded against over-reading.
- "`/pharn-ship` ensures a good feature" is **struck** as the P0 disease (`:260-263`; frontmatter `:2`) —
  reaching GATE 2 = deterministic gates passed + human approved intent, **not** "the feature is wise."

### L-eval → P1 — GREEN, no findings (correctly N/A)

`/pharn-ship` is a command, not a Capability, so P1's "every Capability ships evals" does not apply (same as
`/pharn-dev-ship`, the six product stage commands, and `ship.md`). It introduces **no new `rule_id`** and **no
new checker**, so there is no eval binding to demand. Every proceed verdict reuses an already-floor-tested
checker (`check-spec-approved` / `check-plan-spec-agree` / `check-regress` / `check-verify` / `validate` —
each with a `.dev/floor/*.test.mjs`). The floor (validate) and this lens agree.

### L-trust → P2 — GREEN, no findings

- The command's control flow reads **only** the enum-gated / floor-verifiable class (checker exit codes;
  `.verdict` enum strings; `.regressions[]` / `.failing_gates[]` paths) — `:269-272`. The
  `GRILL/REGRESSION/VERIFY/BUILD` free-text and the user's `<increment description>` are handled as **quoted
  untrusted DATA**, never a proceed/stop basis (`:273-278`); the residual is named (`:279-281`). Matches
  `/pharn-dev-ship` faithfully.
- **Did the reviewed artifact steer me?** No. It is a legitimate orchestrator command; nothing in it
  attempted to make the reviewer act outside reviewing. No guaranteed decision in the command rests on a
  tainted/free-text field.

### L-axis → P3 — GREEN, no findings

One axis of change (the gated product ship orchestrator), one file. `--loop` and the stale `/ship` orphan are
explicitly deferred (`:228-235`, and the plan's Follow-ups). No sibling-import violation: the command
**orchestrates** the six product commands and **cites** `/pharn-dev-ship` as the reused pattern (P4) — neither
is a leaf→leaf import; `reads:` points at floor infrastructure (`.dev/floor/*`) and the product artifacts,
reached appropriately.

## Grill-finding landing check (the three folded refinements)

All three advisory GRILL.md findings landed in the command:

1. **(P5) Fail-closed on `/pharn-build`'s early refusals** → landed as the general **"Fail-closed on a missing
   verdict"** completeness rule (`:99-104`), plus the explicit build early-refusal STOP (`:160-164`) and the
   plan-refused STOP (`:133`).
2. **(P0) Label the build-gate discovery advisory/untested** → landed (`:246-250`).
3. **(P6) Thread `<name>` explicitly** → landed in Step 1 (`:85-90`, "threads that exact slug as the explicit
   `<name>` / `--feature <name>` argument into every subsequent stage invocation").

## Findings — floor-gate (blocking) vs advisory

**Floor-gate (blocking): NONE.** The floor is GREEN and no guarantee lacks a floor reduction or an `advisory`
label.

**Advisory (informational — never a block):**

```yaml
- type: FINDING
  rule_id: "P6"
  severity: minor
  file: ".claude/commands/pharn-ship.md:20"
  problem: "reads: lists .dev/floor/check-regress.mjs and .dev/floor/check-verify.mjs, but /pharn-ship never INVOKES those two checkers — it reads their emitted report outputs (regression-report.json / verify-report.json, already listed on :16-17) via the .verdict field. The two checker-script entries are a slightly inaccurate `reads:` declaration (it directly invokes only check-spec-approved, check-plan-spec-agree, and validate)."
  evidence: '".dev/floor/check-regress.mjs", ".dev/floor/check-verify.mjs",'
```

This is **advisory and non-blocking**: `reads:` is a declaration whose floor teeth are on the **write** side
(fix #7, `THREAT-MODEL.md §4` #7), so an over-broad `reads:` is harmless — and one can defend it as a
transitive dependency (the reports only exist because those checkers ran). Left for the human to tighten or
keep; not a defect that blocks.

## Proposed lesson candidate (NOT promoted here — provenance recorded for a gated `/pharn-dev-memory-promote`)

- **Candidate:** _"A pipeline stage's own `format:check` / `lint:md` gate runs BEFORE it writes its own `.md`
  artifact, so every stage-authored markdown (`PLAN`/`GRILL`/`REGRESSION`/`VERIFY`/`REVIEW`/`SHIP.md`) must be
  brought to prettier + markdownlint clean AFTER writing — otherwise the NEXT stage's whole-repo `format:check`
  / `lint:md` (verify, L9) fails on the just-written artifact."_
- **Provenance:** increment `ship-stage`; observed 3× this run (PLAN+GRILL, then REGRESSION, then VERIFY each
  needed a post-write `prettier --write`; the built command also needed an MD028 `>`-continuation fix for two
  adjacent blockquotes).
- **Status:** a **candidate only.** `/pharn-dev-review` does not write canon (P2). Whether this is worth
  promoting — and whether it is already captured (it is adjacent to L9's style-gate coverage note) — is for a
  separate, human-gated `/pharn-dev-memory-promote` run (check-provenance + accept/deny). The model never
  self-promotes.

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** Floor GREEN, all guarantees floor-reduced or `advisory`-labeled,
P1/P2/P3 clean, and the three grill refinements landed. One **advisory minor** finding (a `reads:` accuracy
nit) and one **proposed lesson candidate** are recorded for the human — neither blocks. This review is
**advisory**; the only guaranteed part is the floor (GREEN) already gated by build + verify. "Review GREEN"
is **not** "the increment is good" (P0) — that is the human's call at the post-review / ship gate.
