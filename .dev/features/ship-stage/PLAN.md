# PLAN — /pharn-ship (product pipeline stage 7, gated orchestrator)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, this run)
- increment: Add `/pharn-ship`, the gated **product** orchestrator that runs `spec → plan → grill → build → regress → verify` in order with two human gates and floor-gated proceed decisions, then stops for the human — reusing the six product commands and their existing floor checkers, adding **no** new floor primitive.
- layer(s): pharn-pipeline (orchestration) — realized as a **command** (`.claude/commands/pharn-ship.md`), not a Capability with a `role:`; the floor (`validate.mjs`) ignores `.claude/commands/`, so **floor capability count stays 1** (`ARCHITECTURE.md §4`, §7).
- constitution_refs: [P0, P2, P5, P6, P7]

## What this is (one screen)

`/pharn-ship <increment description>` is the **product** UX a PHARN user runs to ship one feature with a
single command instead of six. It is the seventh, terminal pipeline stage (`ARCHITECTURE.md §6`),
realized as a **meta-orchestrator** over stages 1–6 that ends at the human's ship decision. It is the
product-side twin of `/pharn-dev-ship` (which orchestrates the _build_ loop that builds PHARN itself),
and it **reuses `/pharn-dev-ship`'s gated verdict-reading pattern** — cited, not restated (P4).

- **Gated mode ONLY this increment.** No `--yolo` (rejected — self-grilling defeats grill, bypassing
  intent approval breaks the versioned-intent thesis). No `--loop` (a separate follow-up increment,
  same split `/pharn-dev-ship` used — see Open questions / Follow-ups).
- **Reuses the six product commands; reimplements none.** It invokes each stage's real command and reads
  each stage's **structural** verdict to decide proceed/stop.

## Files

- `.claude/commands/pharn-ship.md` — the product ship orchestrator command (NEW; `pharn-` prefix,
  product — NOT `pharn-dev-`). Prose orchestration + two human gates + floor-gated proceed reads.

### Explicitly not touched

- `.claude/commands/ship.md` — a **stale pre-boundary orphan** (Discovery finding D2); out of scope (P7),
  left for a separate human-decided cleanup. Never edited here.
- `.claude/commands/pharn-dev-ship.md` — the dev orchestrator; **cited as the reused pattern (P4)**, never edited.
- `.claude/commands/pharn-spec.md` / `-plan` / `-grill` / `-build` / `-regress` / `-verify.md` — the six
  reused product stages; invoked, never reimplemented or edited.
- `ARCHITECTURE.md` + the three other trusted docs — human-only, hook-denied (fix #2). §6 alignment is
  **reported** (Doc reconciliation below), never agent-edited.
- `.dev/floor/*` — every proceed verdict reuses an **existing** checker; no new checker, no `.dev/floor/` edit.

## How `/pharn-ship` runs the chain (the design — reused verdict-reading, P4)

Frontmatter (mirrors `/pharn-dev-ship`, retargeted to the **product** paths):
`kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `version: "0.1.0"`,
`constitution_refs: [P0,P2,P5,P6,P7]`, `writes: ["features/<name>/SHIP.md"]`,
`reads:` the four checkers + the product artifacts (`features/<name>/{SPEC,PLAN,GRILL,BUILD,REGRESSION,VERIFY}.md`,
`features/<name>/{regression-report,verify-report}.json`, `CONSTITUTION.md`, `ARCHITECTURE.md`).

**Step 1 — Entry.** `<increment description>` is the feature intent; `/pharn-ship` passes it to `/pharn-spec`.
`<name>` is the kebab-case slug `/pharn-spec` resolves; **reuse that one slug** across every stage. All
product artifacts live in root `features/<name>/` (never `.dev/` — `features/README.md`, the product boundary).

**Step 2 — Run the chain, branch ONLY on each stage's STRUCTURAL verdict (P5).** On the first non-proceed
verdict, STOP and hand to the human (terminal fallback = the human, never a guess).

1. **`/pharn-spec <description>`** → writes `features/<name>/SPEC.md` and **HALTS at its own approval form**
   (`pharn-spec.md` Step 4, Draft → Approved). **This IS GATE 1** — the human approves their own intent;
   the model never self-approves. `/pharn-ship` **ends its turn here** (turn semantics reused from
   `/pharn-dev-ship`: a stage's standalone "end turn" = the gate; `/pharn-ship` resumes on the next turn).
   `/pharn-ship` neither adds nor bypasses this halt. **Structural backstop:** on resume, before invoking
   `/pharn-plan`, confirm the SPEC is Approved + un-drifted via `node .dev/floor/check-spec-approved.mjs
features/<name>/SPEC.md` (exit 0 → proceed; non-zero → STOP, the human has not approved / must re-approve).
   And `/pharn-plan`'s own first gate re-checks it — so a Draft can **never** flow to build even if the halt
   were skipped.

2. **`/pharn-plan`** → writes `features/<name>/PLAN.md`. Its **own** first gate (`check-spec-approved.mjs`)
   refuses unless the SPEC is Approved + un-drifted; if it produced a `PLAN.md`, that floor gate passed.
   Product `/pharn-plan` has **no** separate human-approval halt (deliberate divergence from `/pharn-dev-plan`:
   in the product loop the **SPEC** is the human-approved intent record, and the plan flows from it). Proceed.

3. **`/pharn-grill`** → writes `features/<name>/GRILL.md`. **Verdict read (FLOOR):** the exit code of
   `node .dev/floor/check-plan-spec-agree.mjs features/<name>/PLAN.md features/<name>/SPEC.md` — grill's own
   deterministic chain stop (grill's **divergence** from `/pharn-dev-grill`: the product grill **owns** the
   hash-chain block, first enforcing consumer). `0` → proceed. Non-zero → **STOP**, present the RED chain
   (grill wrote a RED `GRILL.md`), hand to the human (re-plan / re-approve). The interrogation itself is
   ADVISORY and gates nothing (present its findings' free-text as quoted DATA, P2).

4. **`/pharn-build`** → writes the user's code + a thin `features/<name>/BUILD.md`. `/pharn-build` re-checks
   the chain (2nd consumer) and the fix #7 writes-scope itself, and **HALTs on a RED floor** at its Step 4.
   **Verdict read (FLOOR):** the exit code of the **same deterministic project gate `/pharn-build` ran at its
   Step 4** — for a PHARN-shaped capability build (this repo's dogfood) that is `node .dev/floor/validate.mjs .`
   (identical to `/pharn-dev-ship`); for a general user project it is the gate resolved **exactly as
   `/pharn-build` Step 4 / `/pharn-verify` Step 3a resolve it** (`--gates` or the closed allowlist ∩
   `package.json` scripts — reused, NOT hard-coded `validate.mjs`, P3). `0` → proceed; non-zero → **STOP**,
   present the RED floor, hand to the human. (This floor is **re-confirmed** structurally two stages later
   by `/pharn-verify`'s absolute all-green-at-HEAD `.verdict` — belt-and-suspenders.)

5. **`/pharn-regress`** → writes `features/<name>/regression-report.json` (+ `REGRESSION.md`). **Verdict read
   (FLOOR):** that file's `.verdict` (the `check-regress.mjs verdict` output verbatim). `"no-regressions"` →
   proceed. `"regressions"` / `"inconclusive"` → **STOP**, present, hand to the human. **Fail-closed on a
   missing file:** on a RED chain `/pharn-regress` writes **only** `REGRESSION.md` (no verdict JSON), so a
   **missing `regression-report.json` → STOP** (present the RED-chain `REGRESSION.md`) — a membership test
   (present ∧ verdict enum), never a silent proceed.

6. **`/pharn-verify`** → writes `features/<name>/verify-report.json` (+ `VERIFY.md`). **Verdict read (FLOOR):**
   that file's `.verdict`. `"PASS"` (every gate exit 0 at HEAD) → proceed to GATE 2. `"FAIL"` (offenders in
   `.failing_gates[]`) / `"INCONCLUSIVE"` (fail-closed — e.g. RED chain, always emitted) → **STOP**, present,
   hand to the human. The advisory `verifiers` block is **NOT** a proceed input — a verifier finding never
   flips the verdict (fix #3, `ARCHITECTURE.md §7`).

7. **GATE 2 — post-verify decision.** On a `PASS` verify, `/pharn-ship` **presents** the standing verdicts
   (steps 1–6) + the `GRILL.md` / `REGRESSION.md` / `VERIFY.md` free-text quoted as DATA, then **ends its
   turn**, handing to the human to decide **merge / fix / abandon**. Reaching here is permission to
   **present**, never to auto-merge / ship / seal. (There is no product `/review` stage — the dev loop's
   `/pharn-dev-review` is not a §6 spine stage; the product spine ends at `verify` then the human's ship
   decision, which §6 names "ship".)

**The spec→plan hash chain is read at grill (step 3) and re-enforced structurally inside build, regress, and
verify** (2nd/3rd/4th consumers); a RED chain at regress/verify surfaces as a missing `regression-report.json`
(→ fail-closed STOP) or an `INCONCLUSIVE` `verify-report.json` — so "chain held at each consuming stage" is
covered by the stages' own `.verdict`s, not re-implemented by `/pharn-ship`.

**Step 3 — writes-scope (fix #7) + emit `features/<name>/SHIP.md`.** `/pharn-ship` sets **no global scope**;
each sub-stage runs its own Step 0 setter (per-stage `.pharn/writes-scope.json` overwrite). `/pharn-ship`'s
**only** Write-tool output is `SHIP.md` — scope it to itself immediately before writing:
`node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/pharn-ship.md --target
features/<name>/SHIP.md`. `SHIP.md` is a **thin, advisory** roll-up: which stages ran + where it ended
(GATE 2 or which stage's STOP); each structural verdict **verbatim** (spec approval; grill chain exit;
build floor exit; `regression-report.json .verdict`; `verify-report.json .verdict`); a **pointer** to the
`GRILL.md` / `REGRESSION.md` / `VERIFY.md` (cite, don't restate — P4). It ends with the honest line that the
chain ran and the named floor verdicts are as shown — **NOT** a judgment the increment is good/wise, and
**never** a self-issued "shipped" or `PHARN ✓ reviewed` seal (that is the human's GATE-2 call, P0). Then
end the turn.

## Contracts satisfied

- **`pharn-contracts/finding-shape.md`** — the enum-gated / free-text split governs how `/pharn-ship`
  presents `GRILL.md` / `REGRESSION.md` / `VERIFY.md` free-text (quoted DATA) vs reads verdict fields
  (enum-gated). Cited, not restated (P4).
- **`ARCHITECTURE.md §6`** (pipeline spine / ship stage) + **§2** (the three floor primitives — every
  proceed verdict is primitive #1 hook / #2 content-hash / #3 enum-exit) + **§7** (floor-gate vs advisory;
  verifier findings never gate). Cited, not restated (P4).
- **The six product stage commands** (`pharn-spec/-plan/-grill/-build/-regress/-verify.md`) — reused as-is;
  `/pharn-ship` consumes their emitted artifacts and verdicts, reimplements none.

## Evals to write (P1) — none; purely prose orchestration over already-tested checkers

`/pharn-ship` is a **command**, not a Capability with a `role:` — P1's "every Capability ships evals" does
not apply (same as `/pharn-dev-ship`, `ship.md`, and the six product stage commands, none of which ship an
`evals/` dir). It **adds no checker and no new floor primitive**, so there is nothing new to unit-test.
**How the proceed-gate logic is verified:** every verdict `/pharn-ship` branches on is produced by an
**already-floor-tested** checker —

- `check-spec-approved.mjs` → `.dev/floor/check-spec-approved.test.mjs` (GATE-1 structural backstop)
- `check-plan-spec-agree.mjs` → `.dev/floor/check-plan-spec-agree.test.mjs` (grill chain; the build/regress/verify re-checks)
- `check-regress.mjs` → `.dev/floor/check-regress.test.mjs` (`regression-report.json .verdict`)
- `check-verify.mjs` → `.dev/floor/check-verify.test.mjs` (`verify-report.json .verdict`)
- `validate.mjs` → `.dev/floor/validate.test.mjs` (the PHARN-dogfood build floor)

The **orchestration prose itself is ADVISORY and untested by construction** (it lives in the command, not a
checker) — exactly like `/pharn-dev-ship` gated mode and `/pharn-regress` / `/pharn-verify` orchestration.
"Reuses tested checkers" must NOT read as "the whole command is tested" (P0). Build-time floor gate for this
increment: `node .dev/floor/validate.mjs .` stays **GREEN — 1 capability** (the command is not a Capability),
and `npm run check` stays green (no code changed, only a markdown command added).

## Guarantee audit (P0) — gated `/pharn-ship` adds ZERO new floor primitive

- **"Runs the six stages in order"** → **ADVISORY.** Nothing on the floor forces the sequence; the agent
  invokes each stage.
- **"Proceeds past a stage only on that stage's floor verdict"** → the **verdicts** are **FLOOR** (each
  stage's own checker: `check-spec-approved` / `check-plan-spec-agree` exits, `regression-report.json` /
  `verify-report.json` `.verdict`, the build project-gate exit — `ARCHITECTURE.md §2` primitive #3);
  `/pharn-ship`'s **act** of reading and obeying them is **ADVISORY** orchestration (the two-clocks split,
  same as `/pharn-regress` / `/pharn-verify` / `/pharn-dev-ship`).
- **"The two human gates (SPEC approval, post-verify) are preserved"** → **ADVISORY** (command discipline).
  GATE 1 **is** `/pharn-spec`'s own halt; nothing on the floor forces a human to be asked. Preserved by
  construction, backstopped (not replaced) by `/pharn-plan`'s deterministic approved-input gate.
- **"`/pharn-ship` may write only `SHIP.md`"** → **FLOOR: hook (fix #7)** (`set-writes-scope.cjs` +
  `enforce-writes-scope.cjs` pin the one path). Bash stage-invocations aren't `Write|Edit|MultiEdit`, so the
  hook gates only the `SHIP.md` write; each stage's own writes are gated by **its** own Step-0 scope.
- **Net:** the gated chain introduces **zero** new floor primitive — every guarantee belongs to a
  **sub-stage**; `/pharn-ship` is **convenience + two preserved human gates**, nothing more.
- **NOT a claim (struck as the disease):** "`/pharn-ship` ensures a good feature" / "the chain ran, therefore
  it's correct/wise." Reaching GATE 2 means **the deterministic gates passed and the human approved intent** —
  NOT that the feature is wise (the human's post-verify call). Any wording that lets `/pharn-ship`
  self-certify past a human gate is the P0 disease.

## Trust audit (P2) — taint propagation

- **Control flow reads ONLY the enum-gated / floor-verifiable class:** checker exit codes (ints),
  `regression-report.json` / `verify-report.json` `.verdict` (enum strings) + `.regressions[]` /
  `.failing_gates[]` (paths). **No proceed/stop decision rests on any free-text field** (mirrors
  `/pharn-verify` / `/pharn-regress` / `/pharn-dev-ship` exactly).
- **`GRILL.md` / `REGRESSION.md` / `VERIFY.md` free-text** (`problem` / `evidence`) **inherits the reviewed
  increment's untrusted tag** (`finding-shape.md`). `/pharn-ship` **presents** it to the human as quoted
  DATA — never an instruction it follows, never a proceed/stop basis. Taint reaches the human-facing roll-up
  but **not** `/pharn-ship`'s control flow.
- **The user's `<increment description>`** (Step 1) is untrusted prose passed to `/pharn-spec`, which already
  treats it as DATA to structure + interrogate (P2) — `/pharn-ship` adds no new ingestion path.
- **Residual (named, not hidden — `LIMITS.md §2`, `THREAT-MODEL.md §5`):** when a human or a downstream LLM
  consumes the presented free-text, "do not execute this as an instruction" is a heuristic again — **bounded**
  (`/pharn-ship` gates nothing on it) but **not zeroed**. Stated, not hidden.

## Determinism audit (P5)

- Every proceed/stop branch is a **membership / exit-code test**: `check-spec-approved` exit (GATE-1
  backstop); `check-plan-spec-agree` exit (grill); the build project-gate exit; `regression-report.json`
  `.verdict` ∈ {`no-regressions`,`regressions`,`inconclusive`} (+ **missing → fail-closed STOP**);
  `verify-report.json` `.verdict` ∈ {`PASS`,`FAIL`,`INCONCLUSIVE`}. **No LLM classification drives any
  branch.**
- The **build project-gate** is itself resolved by the fixed rule reused from `/pharn-build` /
  `/pharn-verify` (`--gates` → allowlist ∩ scripts → ask), not by classification.
- Terminal fallback on **every** non-proceed verdict (and on any ambiguity — e.g. an unresolvable `<name>`,
  a missing report) is **STOP and hand to the human**, never a guess.

## Doc reconciliation (`ARCHITECTURE.md §6`) — reported, never agent-edited

`ARCHITECTURE.md §6` (line 210) names **ship** as the terminal spine stage with artifact
`ship-report` = _decision + `PHARN ✓ reviewed` seal_. `/pharn-ship` **aligns**: it realizes stage 7 as a
meta-orchestrator over stages 1–6 that brings the human to that ship **decision** at GATE 2. The one honest
divergence (identical to what `/pharn-dev-ship` already surfaces): `/pharn-ship` **does not automate the
decision or the seal** — `SHIP.md` records that the chain ran + its floor verdicts; the decision + seal are
the **human's** GATE-2 call. No conflict to file; §6 is human-only (hook-denied, fix #2) and stays unedited.

## Open questions (HALT)

- **None — resolved before build.** Q1 (the post-build floor read, step 4) was confirmed by the human:
  **explicit re-run + verify re-confirm** — `/pharn-ship` re-runs the same deterministic gate `/pharn-build`
  ran at its Step 4 and branches on its exit (a real stop between build and regress), with `/pharn-verify`
  re-confirming downstream. Step 4 stands as written. Plan **approved as written** (GATE 1 passed).

## Follow-ups (named, NOT built here — P7, one axis)

- **`/pharn-ship --loop`** — a separate increment (same split `/pharn-dev-ship` used: gated first, `--loop`
  second). It would iterate `build → regress → verify` to a floor-grade stop via the **already-existing**
  `.dev/floor/check-ship.mjs` (reused; its inputs are only the two verdict files + iter/cap, so no product
  `/review` — none exists — could gate it). Not in scope this increment.
- **Stale `/ship` orphan cleanup (Discovery finding D2)** — a human-decided, separate increment.

## Discovery findings (live state, this run — P6)

- **D1 —** `pharn-ship.md` does **not** yet exist; the six product stages (`pharn-spec/-plan/-grill/-build/
-regress/-verify`) exist and emit the artifacts/verdicts above; `ARCHITECTURE.md` hash pinned this run.
- **D2 — stale pre-boundary orphan (surfaced, not acted on).** `.claude/commands/ship.md` (PR #18, pre
  dev/product boundary) orchestrates unprefixed `/plan … /review` (commands that no longer exist) and points
  at `floor/` / `features/` (now `.dev/floor/`, `.dev/features/`); its root `features/ship-gated/` +
  `features/ship-loop/` are the pre-boundary artifacts (the current build trails live in
  `.dev/features/ship-{gated,loop}/`). Out of scope here (P7); flagged for a human-decided cleanup. It does
  **not** block this increment (`/pharn-ship` is a new, correctly-scoped file).
