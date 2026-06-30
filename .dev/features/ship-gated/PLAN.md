# PLAN — ship-gated (the gated `/ship` pipeline orchestrator)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches features/pipeline-integration-probe/PLAN.md:3 → no drift
- increment: add `.claude/commands/ship.md` — a **gated** orchestrator command that runs the existing build loop in order (`/plan → [human approves] → /grill → /build → /regress → /verify → /review → [human decides]`), reading each stage's **structural** verdict to decide proceed-or-stop, preserving both human gates, adding **no new floor primitive**.
- layer(s): the command lives in `.claude/commands/` (advisory orchestration; `floor/validate.mjs:30` `EXCLUDE_SEGMENTS` path-ignores it, so the **floor capability count stays 1**) — exactly like `/regress` and `/verify`, the no-`role:` orchestrator commands it most resembles. It _exercises_ `pharn-pipeline` (the spine, `ARCHITECTURE.md §4`) and the fix #7 writes-scope hooks; it adds no `pharn-*` library file. # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P5, P6, P7]

> **Scope decision (P7, P3): this plan is the GATED `/ship` ONLY.** `--loop` is a **separate, named
> follow-up increment** (`ship-loop`), not built here. Rationale below (`## Why gated-only`); it is also
> Open Question 1. The gated orchestrator is independently complete and useful, and deferring `--loop`
> defers the one genuinely hard design knot (the floor-legality of the loop's stop condition — OQ3) until
> the chain exists and the knot is real, not hypothetical (P7).

---

## Step 0 — Discovery results (live this run, P6 — never asserted from memory)

Read this run from disk: the four trusted docs in full; all six stage commands (`plan/grill/build/regress/verify/review`); the two verdict cores (`floor/check-verify.mjs`, `floor/check-regress.mjs`); `pharn-contracts/finding-shape.md`; the first full-pipeline run (`features/pipeline-integration-probe/{PLAN,REVIEW}.md`). Confirmed on disk:

- **Spec hash matches** the live recompute and the most-recent pin (`pipeline-integration-probe/PLAN.md:3`) → no drift; `/build` re-verifies (fix #4).
- **`/ship` is genuinely new** — no `.claude/commands/ship.md`, no `features/ship*` exists.
- **Each stage's verdict surface (what `/ship` can read STRUCTURALLY), read live:**

| stage      | machine verdict `/ship` reads                                                                                                                                                                                                                               | shape                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/build`   | `node floor/validate.mjs .` **exit code** (0 = GREEN)                                                                                                                                                                                                       | exit-int; `/build` itself already HALTs on RED, emits **no** machine report (`build-summary.json` is spec'd at `ARCHITECTURE.md §6:210` but **not emitted** — `pipeline-integration-probe` finding CF-3) |
| `/regress` | `features/<name>/regression-report.json` → `.verdict ∈ {no-regressions, regressions, inconclusive}` + `.regressions[]`                                                                                                                                      | `check-regress.mjs verdict` JSON verbatim; exit `0/1/2`                                                                                                                                                  |
| `/verify`  | `features/<name>/verify-report.json` → `.verdict ∈ {PASS, FAIL, INCONCLUSIVE}` + `.failing_gates[]`                                                                                                                                                         | `check-verify.mjs` JSON + advisory `verifiers` block; exit `0/1/2`                                                                                                                                       |
| `/grill`   | — (advisory by design; **no** deterministic verdict — `grill.md:130` "No grill finding is a floor-gate")                                                                                                                                                    | `GRILL.md` prose + finding-shape YAML                                                                                                                                                                    |
| `/review`  | **— NONE that is structural —** `writes: ["features/<name>/REVIEW.md"]` only: **no `findings.json`, no `check-review.mjs` in `floor/`**; verdict is **prose** ("GREEN — … 0 blocking floor-findings") and `severity` is **LLM-assigned (advisory, fix #3)** | `REVIEW.md` prose + embedded YAML                                                                                                                                                                        |

- **The `/review` row is the central finding** (OQ3). The three floor-readable verdicts are `/build`-validate, `/regress`, `/verify`. `/review` has **no** machine verdict and its only floor primitive is `floor/validate.mjs` GREEN — **which `/verify` already runs as a gate** (`verify.md:86`). So `/review`'s floor content is already subsumed by `/verify`; everything else `/review` adds is **advisory lens judgment**.
- **`/regress`, `/verify` carry NO `role:`** (plain orchestrator commands) — the precedent `/ship` follows. `/build`, `/grill`, `/review` carry `role:` (Capabilities). A command in `.claude/commands/` is floor-ignored regardless, so `/ship` keeps the capability count at 1 either way; choosing **no `role:`** also keeps P1's Capability-evals rule from binding `/ship` (it is orchestration, like `/regress`/`/verify`).

---

## Files

> `/build`'s writes-scope source (fix #7): `/build` runs `set-writes-scope.cjs --from-plan` over the back-tick path below, which becomes the only writable path (plus `.pharn/**`). The `.claude/**` zone is denied by the fail-closed default-safe-set, so listing the path here is what unlocks it — this increment genuinely exercises scope-propagation. The path is a concrete literal.

- `.claude/commands/ship.md` — **NEW.** The gated `/ship` orchestrator command (frontmatter mirrors `/verify`/`/regress`: **no `role:`**; `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads:`, `writes: ["features/<name>/SHIP.md"]`, `constitution_refs:`, `version:`). Floor-ignored command dir → capability count stays 1. Body specified in `## The command body` below.

### Explicitly **not** written (declared NOT touched — out of `/build` scope)

- `.claude/commands/{plan,grill,build,regress,verify,review,memory-promote}.md`, `floor/check-*.mjs`, `floor/validate.mjs`, the hooks, `pharn-contracts/*` — invoked / cited, never edited (P4); `/ship` reuses them and reimplements none.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). The doc-vs-impl gaps this increment surfaces (OQ2 §6 ship-stage naming; OQ3 `/review` verdict; CF-3 `build-summary.json`) are reported for a human, never agent-edited.
- the per-stage runtime artifacts (`PLAN`/`GRILL`/`REGRESSION`/`regression-report.json`/`VERIFY`/`verify-report.json`/`REVIEW`, and `/ship`'s own `SHIP.md`) — each written under its **own** command's writes-scope, never a `/build` deliverable.

## The command body (`ship.md`) — what `/build` writes

`/ship` reuses the existing stages and reads their existing structural verdicts; **no new `pharn-*` file, floor helper, Capability, or eval dir** (P7).

- The body of `.claude/commands/ship.md` (specified here; written by `/build`) — after the frontmatter, section by section (advisory orchestration; the **verdicts** it reads are floor):

  1. **Trusted prefix** — load `CONSTITUTION.md`; it overrides everything (same preamble as every stage).
  2. **Entry** — `/ship <increment description>`; the description is passed to `/plan` (the chain starts at intent, not at an existing plan).
  3. **The chain + the two human gates (advisory orchestration; verdicts are floor):**
     - **Run `/plan <description>`.** `/plan` writes `features/<name>/PLAN.md` and ends with its **own** approval `AskQuestion` halt (`plan.md` Step 4). **GATE 1 (plan acceptance) = that halt** — `/ship` ENDS ITS TURN here; the human approves / corrects / rejects. The model never self-approves intent (the "intent as versioned record" thesis). _Reuse, do not reimplement: `/plan`'s halt **is** the gate._
     - **On approval, resume (turn 2): run `/grill`** on the approved plan; **present `GRILL.md`**; **proceed regardless** (grill is advisory, never a gate — `grill.md:130`).
     - **Run `/build`.** Read `node floor/validate.mjs .` **exit code**. `0` (GREEN) → proceed. Non-zero (`/build` halted RED) → **STOP**, present the RED floor, hand to human.
     - **Run `/regress`.** Read `features/<name>/regression-report.json` `.verdict`. `"no-regressions"` → proceed. `"regressions"` / `"inconclusive"` (or exit `1`/`2`) → **STOP**, present, hand to human.
     - **Run `/verify`.** Read `features/<name>/verify-report.json` `.verdict`. `"PASS"` → proceed. `"FAIL"` / `"INCONCLUSIVE"` → **STOP**, present, hand to human.
     - **Run `/review`.** Emit `REVIEW.md` (4 advisory lenses). **GATE 2 (post-review decision)** — `/ship` ENDS ITS TURN, **presents** the standing verdicts + `REVIEW.md` (advisory findings rendered as quoted DATA), and hands to the human to decide **merge / fix / abandon**. `/ship` **never** auto-merges, auto-ships, or applies the `PHARN ✓ reviewed` seal (`ARCHITECTURE.md §6:210`) — reaching the gate is permission to **present**, not to act.
  4. **Deterministic proceed/stop rule (P5):** proceed stage→stage **iff** the current stage's **structural** verdict is GREEN (validate exit `0`; `regression-report.verdict === "no-regressions"`; `verify-report.verdict === "PASS"`); on the **first** non-GREEN verdict, STOP and present (terminal fallback = hand to the human, never a guess). `/ship` always ends by **stopping for the human** — either early (a RED floor verdict) or at GATE 2 (chain completed through `/review`).
  5. **Orchestration note (turn semantics):** a stage's own "end your turn" applies when it is run **standalone**; under `/ship`, perform the stage's work, **capture its verdict, then CONTINUE** the orchestration — `/ship` ends its turn **only** at GATE 1, GATE 2, or a RED-verdict STOP.
  6. **Roll-up:** write `features/<name>/SHIP.md` — a thin, **advisory** record: which stages ran, each structural verdict read (validate exit / `regression-report.verdict` / `verify-report.verdict`), a pointer to `REVIEW.md`, and the **standing decision is the human's** (never a self-issued "shipped" / seal). See OQ4.
  7. **writes-scope across the chain (fix #7):** `/ship` sets **no global scope**. Each sub-stage runs its **own** Step 0 setter (overwriting `.pharn/writes-scope.json` — the per-stage propagation the `pipeline-integration-probe` confirmed). `/ship` runs its **own** Step 0 setter **only** for its single `SHIP.md` write, **last** (after `/review`), so no stale scope is involved. `/ship` declares exactly `writes: ["features/<name>/SHIP.md"]` — never an over-broad scope.

### Modes explicitly excluded (behavioral scope, not file scope)

- **`--loop`** — a **separate increment** (`ship-loop`, OQ1). Its floor-legal stop condition is the hard knot (OQ3); not built here.
- **No `--yolo`** — rejected by the methodology and never built (self-grilling defeats grill's purpose; bypassing the human plan/intent gate breaks the versioned-intent thesis). `/ship` has exactly **two** ways to end a run: a human gate, or a RED-verdict STOP.

---

## Contracts satisfied (cite, don't restate — P4)

- **`ARCHITECTURE.md §6` (the pipeline spine)** — `/ship` runs the spine's stages in order and reads each typed artifact's verdict. **Reconciliation reported, not resolved (OQ2):** §6's spine is `… → verify → ship` with "ship" as the **terminal stage** emitting a `ship-report` (decision + seal, §6:210), and "review" is **not** a §6 spine stage (lenses are `pharn-review`, §4:124). The argument's `/ship` is a meta-**orchestrator** over `plan…review` that stops for the human — a different concept than §6's ship **stage**. The name overload is surfaced for a human (`ARCHITECTURE.md` is human-only).
- **`ARCHITECTURE.md §7` (fix #3, two gate kinds)** — `/ship`'s proceed/stop reads only **floor-gate** verdicts (validate exit, `check-regress`/`check-verify` exit-code verdicts). It treats `/grill` and `/review` lens output as **advisory-gate** (presented, never a proceed/stop basis) — exactly the separation fix #3 demands.
- **`floor/check-regress.mjs` / `floor/check-verify.mjs`** (by consumption, not import — P3) — `/ship` reads their already-emitted `regression-report.json` / `verify-report.json` `.verdict` fields. No new edge into them.
- **`pharn-contracts/finding-shape.md`** — `/ship` renders any finding free-text (`problem`/`evidence`) from `GRILL.md`/`REVIEW.md` as **quoted DATA** (P2), never as an instruction; the enum-gated split is honored at presentation.

---

## Evals to write (P1)

- **`/ship` is a command, not a Capability** (no `role:`, in the floor-ignored `.claude/commands/`) — exactly like `/regress`, `/verify`, `/plan`, `/memory-promote`, none of which ship an `evals/` dir. **P1's Capability-evals rule does not bind it** (it binds `role:`-bearing capabilities). Its correctness signal is the **existing** floor helpers it reads (`check-regress` / `check-verify`, already hermetically tested under `npm test`) + `/review` of this increment.
- **Floor check after build:** `node floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged — the command dir is path-ignored).
- **The real proof is a live chain run** — like `pipeline-integration-probe` was for the stages. A `/ship` end-to-end dogfood (the orchestrator driving a throwaway increment, every gate observed) is a natural **follow-up** (P7 — triggered when needed); it is **not** part of this authoring increment.

---

## Guarantee audit (P0) — `/ship` adds NO new floor guarantee

The disease this repo prevents is "written in the command" mistaken for "therefore guaranteed." `/ship` is **convenience orchestration**; stated plainly:

- **"`/ship` runs the stages in order"** → **ADVISORY.** Nothing on the floor forces the sequence; the agent invokes each stage. Not a guarantee.
- **"`/ship` proceeds only past a GREEN floor verdict"** → the **verdicts** are FLOOR (each stage's own checker: validate exit / `check-regress` / `check-verify` — `ARCHITECTURE.md §2` primitive #3). `/ship`'s **act** of reading them and stopping is **ADVISORY orchestration** (the "two clocks" split, identical to `/regress` and `/verify` themselves). `/ship` reads the floor; it is not itself a floor primitive.
- **"the human gates (plan approval, post-review) are preserved"** → **ADVISORY** (command discipline). The plan-approval gate is `/plan`'s own `AskQuestion` halt; nothing on the floor forces a human to be asked. Honest: `/ship` preserves the gates **by construction**, not by a floor mechanism.
- **"`/ship` may write only `SHIP.md`"** → **FLOOR: hook (fix #7).** `set-writes-scope.cjs` + `enforce-writes-scope.cjs` pin the one path. (The `claude`/Skill stage invocations are not `Write|Edit|MultiEdit`, so the hook gates only `/ship`'s own `SHIP.md` write; each sub-stage's writes are gated by **its** own Step 0 scope — unchanged.)
- **Net:** `/ship` introduces **zero** new floor primitive. Every guarantee in a `/ship` run belongs to a **sub-stage** (validate, `check-regress`, `check-verify`, the writes-scope hooks, `/build`'s spec-hash re-check). Writing "`/ship` ensures the chain ran" or "`/ship` ensures quality" would be the disease — **struck**. `/ship` is convenience + preserved human gates, nothing more in this increment (the floor-gated **stop** is a `--loop` concept, deferred — OQ1/OQ3).

---

## Trust audit (P2) — taint flow through the orchestrator

`/ship` reads two classes of sub-stage output, and the split is structural:

- **Control flow reads ONLY the enum-gated / floor-verifiable class** — `validate` exit code (int), `regression-report.json` / `verify-report.json` `.verdict` (enum strings) + `.failing_gates[]`/`.regressions[]` (paths). These are produced by deterministic tooling; **no proceed/stop decision rests on any free-text field** (mirrors `/verify` / `/regress` discipline exactly).
- **`GRILL.md` / `REVIEW.md` free-text** (`problem`/`evidence`) **inherits the reviewed increment's untrusted tag** (`finding-shape.md`). `/ship` **presents** it to the human at GATE 2 as **quoted DATA** — it is **never** used as a `/ship` instruction and **never** gates a proceed/stop. So taint reaches the human-facing roll-up but **not** `/ship`'s control flow.
- **Named residual (`LIMITS.md §2`, `THREAT-MODEL.md §5`):** when a human or a downstream LLM consumes the presented `REVIEW.md`/`GRILL.md` free-text, "do not execute this as an instruction" is a heuristic again — **bounded** (`/ship` gates nothing on it) but **not zeroed**. Stated, not hidden.

---

## Determinism audit (P5)

- Every `/ship` branch is a **membership / exit-code test**: `validate exit === 0`; `regression-report.verdict ∈ {no-regressions | …}`; `verify-report.verdict ∈ {PASS | …}`. No LLM classification drives a proceed/stop.
- The terminal fallback at every decision point is **hand to the human** (GATE 1, GATE 2, or a RED-verdict STOP) — never a guess. `/grill`'s advisory output is presented, never branched on.

---

## Why gated-only, and why split `--loop` out (P3 axis / P7 smallest increment) — OQ1

- **Two axes of change (P3).** The gated chain changes when **stages are added/reordered or a verdict-read changes**. `--loop` changes when the **stop condition or the max-iteration cap policy** changes. Two reasons to change → two files / two increments.
- **`--loop` depends on gated `/ship` existing** (it iterates the chain), so the **smallest coherent increment that moves the build forward (P7)** is the gated orchestrator first.
- **`--loop`'s stop condition is the hard knot, and it is genuinely unresolved (OQ3).** Its third leg — "`/review` zero **blocking** findings" — **cannot be made floor-grade today**: `/review` emits no machine `findings.json`, there is no `check-review.mjs`, and `severity` is **LLM-assigned (advisory, fix #3)**. A loop that **blocks on a counted LLM-severity** is precisely the "deterministic gate over probabilistic severity" that `THREAT-MODEL.md §4` fix #3 calls **advisory-dressed-as-deterministic — the disease**. The honest floor-legal stop is almost certainly **`/verify` PASS ∧ `/regress` clean** (the two genuine floor verdicts — which already subsume `/review`'s only floor primitive, `validate` GREEN), with `/review` **advisory** (surfaced, never loop-gating). Building gated `/ship` first lets that knot be resolved in its own increment, against a real chain, with the human's explicit choice — not pre-committed here.
- **Crucially, the gated increment never needs `/review`'s verdict structurally** — it **presents** `REVIEW.md` to the human at GATE 2. So OQ3 does **not** block this increment; it blocks `--loop`. Splitting defers the knot cleanly.

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-29; "Approve as written")

- **OQ1 — Split gated `/ship` from `--loop`?** → **YES — gated only now.** This plan builds the gated orchestrator; `--loop` is a named follow-up (`ship-loop`) where the stop-condition knot (OQ3) is resolved against a real chain. _Declined: both-in-one; drop-loop._
- **OQ2 — `/ship` name vs `ARCHITECTURE.md §6` "ship" stage.** → **Keep `/ship` (accept the overload).** §6's ship-stage decision+seal maps to the human's post-review decision, which `/ship` deliberately does **not** automate. The §6:199/§6:210 wording mismatch (orchestrator vs terminal stage; "review" absent from the spine) is **reported for a future human doc-reconciliation** — `ARCHITECTURE.md` is human-only (hook-denied, fix #2), never agent-edited. _Declined: `/pipeline`, `/run`._
- **OQ3 — `--loop` stop-condition framing (carried into `ship-loop`).** → **Accepted via OQ1.** The floor-legal stop will be **`/verify` PASS ∧ `/regress` clean** (the two genuine floor verdicts, which already subsume `/review`'s only floor primitive — `validate` GREEN); **`/review` stays advisory** (surfaced, never loop-gating). Making "`/review` zero-blocking" a hard loop-gate would commit the fix #3 disease (deterministic gate over LLM-assigned severity) — **excluded by design**. Not built here.
- **OQ4 — `/ship` writes its own `features/<name>/SHIP.md` roll-up?** → **YES.** Thin, advisory, fix#7-scoped to the single path; records stages-run + each structural verdict + a pointer to `REVIEW.md`; **no seal, no auto-ship**. `/ship` declares `writes: ["features/<name>/SHIP.md"]`. _Declined: no-own-artifact._

> **RESOLVED & APPROVED (2026-06-29).** Spec hash `11cd9ad5…` re-verified this run (no drift, fix #4). The plan is build-ready; no open questions remain. Next step: **`/build features/ship-gated/PLAN.md`** — it re-checks the spec hash and refuses on drift, then writes `.claude/commands/ship.md` (the only file in `## Files`) and runs the floor.
