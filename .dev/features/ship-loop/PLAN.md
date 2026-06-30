# PLAN — ship-loop (the `--loop` mode for `/ship`)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), recomputed LIVE this run (P6); matches features/ship-gated/PLAN.md:3 → no drift
- increment: add a `--loop` mode to `/ship` that **iterates** the build loop (fix → regress → verify → review) until a **floor-grade STOP** — `/verify` PASS ∧ `/regress` clean — or a bounded max-iteration **cap**, the stop decision computed by a small **tested** floor helper (`floor/check-ship.mjs`) whose inputs are **only the two floor verdicts** (so `/review` structurally cannot gate the loop), preserving both human gates and adding `--yolo` nowhere.
- layer(s): `.claude/commands/ship.md` is advisory orchestration (floor-ignored command dir); `floor/check-ship.mjs` + its test are floor/eval **infrastructure** — NOT a Capability (no `role:`; `floor/` is path-ignored by `validate`), exactly like `floor/check-verify.mjs` / `floor/check-regress.mjs`. **Floor capability count stays 1.** Exercises `pharn-pipeline` (the spine, `ARCHITECTURE.md §4`). # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P5, P6, P7]

> **This is the follow-up to `ship-gated` (OQ1 split).** The gated `/ship` (committed `86255a7`) runs the
> chain **once** and stops at the two human gates. `--loop` adds **only** the iteration controller on top
> — a distinct axis of change (P3): the gated chain changes when stages/verdict-reads change; `--loop`
> changes when the **stop/cap policy** changes. Default `/ship` (no flag) is **unchanged**.

---

## Step 0 — Discovery results (live this run, P6)

- **Spec hash matches** the live recompute and the most-recent pin → no drift (fix #4).
- **`ship.md` is committed** (`86255a7`, 207 lines); its `## What /ship does NOT do` carries the **"No
  `--loop` here … separate increment (`ship-loop`) … honest floor-legal stop is `/verify` PASS ∧
  `/regress` clean … `/review` advisory (never loop-gating)"** bullet (`ship.md:193`) — this increment
  **fulfils** that deferred note and updates the bullet to point at the new section.
- **`floor/check-ship.mjs` does not exist** — it would be novel, joining `check-verify` / `check-regress`
  / `check-structural` / `check-variance` / `check-provenance` as floor/eval infrastructure.
- **The two floor verdicts `--loop` reads, confirmed live:** `features/<name>/verify-report.json` →
  `.verdict ∈ {PASS, FAIL, INCONCLUSIVE}`; `features/<name>/regression-report.json` →
  `.verdict ∈ {no-regressions, regressions, inconclusive}`. Both are written by the existing stages
  (`check-verify` / `check-regress` verbatim). **`/review` writes only prose `REVIEW.md`** (no machine
  verdict) — which is _why_ it cannot be a loop gate (`ship-gated` OQ3).
- **Relevant prior finding (`ship-gated` REVIEW A-1/A-2):** an orchestrator's logic is floor-invisible and
  unmechanized until a live run. `--loop` adds **more autonomous** orchestration (no human between
  iterations), which **raises the stakes** of the termination decision — the direct motivation for making
  that decision a **tested** helper rather than prose (OQ-A).

---

## Files

> `/build`'s writes-scope source (fix #7): the back-tick paths below become the writable set (plus `.pharn/**`). `.claude/**` and `floor/**` are both denied by the fail-closed default-safe-set, so listing each here is what unlocks it. All paths are concrete literals. (If **OQ-A** resolves to _inline_, this list narrows to `ship.md` alone — re-confirm before `/build`.)

- `.claude/commands/ship.md` — **EDIT.** Add a `## /ship --loop — iterate to a floor-grade stop` section (the iteration controller) and update the `## What /ship does NOT do` "No `--loop` here" bullet to cite it. The gated Steps 1–3 are **reused unchanged**.
- `floor/check-ship.mjs` — **NEW.** The loop-stop decision core: given the two verdict files + `iter` + `cap`, emit `STOP_GREEN` / `CONTINUE` / `STOP_CAP` (+ fail-closed). Floor/eval infrastructure, not a Capability. (Contingent on **OQ-A = helper**.)
- `floor/check-ship.test.mjs` — **NEW.** Hermetic `node --test` proof of the decision table (both-green→stop; not-green+under-cap→continue; not-green+at-cap→stop-cap; malformed→inconclusive; the off-by-one boundary). (Contingent on **OQ-A = helper**.)

### Explicitly **not** written (declared NOT touched — out of `/build` scope)

- The six stage commands, the other `floor/check-*.mjs`, the hooks, `pharn-contracts/*` — invoked / cited, never edited (P4); `--loop` reuses them and reimplements none.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). The §6 ship-stage naming reconciliation (already surfaced in `ship.md`) stays reported, never agent-edited.
- per-stage runtime artifacts (`PLAN`/`GRILL`/`REGRESSION`/`regression-report.json`/`VERIFY`/`verify-report.json`/`REVIEW`/`SHIP.md`) — written under each command's own scope, never a `/build` deliverable.

---

## The `--loop` design (what `/build` writes into `ship.md` + the helper)

### A. `ship.md` — the `## /ship --loop` section (controller; advisory orchestration over a floor stop)

- **Entry:** `/ship --loop [--max-iter N] <increment description>`. Runs the gated chain (Steps 1–2),
  but instead of stopping after the first `/review`, it **iterates the verification body** until the
  **floor stop** (below). Default `/ship` (no `--loop`) is byte-for-byte the gated behavior.
- **The iteration body (deterministic boundary; advisory work inside):**
  1. **Iteration 1** = the gated chain's `/build → /regress → /verify → /review` (after GATE 1 approval).
  2. **Read the stop** (Section B): `node floor/check-ship.mjs <verify-report.json> <regression-report.json> --iter <N> --cap <M>`.
     - exit `0` (`STOP_GREEN`) → **STOP**, present at GATE 2 (floor-GREEN reached).
     - exit `1` (`STOP_CAP`) → **STOP**, present "could not reach floor-GREEN in N iterations" + the
       standing `failing_gates[]` / `regressions[]`, hand to the human.
     - exit `2` (`INCONCLUSIVE`) → **STOP**, fail-closed (a verdict file missing/malformed), hand to human.
     - exit `3` (`CONTINUE`) → iterate: **apply a fix** to the failing gate **within the approved plan's
       `## Files` scope only** (fix #7 — the writes-scope already pins it), then re-run
       `/regress → /verify → /review`, `iter++`, and re-read the stop.
- **The fix is ADVISORY agent work (stated plainly, P0):** `--loop` does **NOT** guarantee it _can_ fix
  anything — fixing a failing gate is irreducible model work. `--loop` guarantees only the **STOP
  condition** (it stops on floor-GREEN or cap, never unbounded). A fix that doesn't converge simply runs
  to the cap and hands to the human. Never write "`--loop` makes it pass."
- **Human gates (unchanged from gated `/ship`):** GATE 1 (`/plan`'s approval halt) runs **once, before**
  the loop; the loop body **never re-plans and never re-approves** — it only fixes within the approved
  `## Files`. If a failure is plan-level (un-fixable within scope), the loop runs to the cap and **STOPs
  to the human**, who may re-plan via a fresh `/ship` run. GATE 2 (present, never auto-act) at every stop.
  See **OQ-C**.

### B. `floor/check-ship.mjs` — the tested stop-decision core (the floor reduction)

- **Signature:** `node floor/check-ship.mjs <verify-report.json> <regression-report.json> --iter <N> --cap <M>`.
- **Inputs (enum-gated / floor-verifiable ONLY):** `verify-report.json` `.verdict` (must be `"PASS"`),
  `regression-report.json` `.verdict` (must be `"no-regressions"`), `iter`/`cap` (positive ints). **It
  takes NO `/review` input** — so "`/review` never gates the loop" is **structural**, not discipline.
- **Decision (membership + integer compare — `ARCHITECTURE.md §2` primitive #3):**
  `floor_green := verify.verdict === "PASS" && regress.verdict === "no-regressions"`.
  - `floor_green` → `STOP_GREEN`, exit `0`.
  - `!floor_green && iter >= cap` → `STOP_CAP`, exit `1`.
  - `!floor_green && iter < cap` → `CONTINUE`, exit `3`.
  - missing/unparseable file, `.verdict` not a known enum value, `iter`/`cap` not positive ints →
    `INCONCLUSIVE`, exit `2` — **fail-closed** (P5), never a silent continue.
- **Emits JSON** `{verify_verdict, regress_verdict, floor_green, iter, cap, decision, reason}` for the
  roll-up. Pure: no child process, no network, inputs `JSON.parse`d and used only as string/int operands
  (P2 — like every `check-*.mjs`).

---

## Contracts satisfied (cite, don't restate — P4)

- **`ARCHITECTURE.md §6` (pipeline spine)** — `--loop` iterates the spine's verification stages; the stop
  reads their typed-artifact `.verdict` fields.
- **`ARCHITECTURE.md §7` (fix #3, two gate kinds)** — the loop stop is a **floor-gate** (a tested
  deterministic decision over the two floor verdicts); `/review`'s LLM-`severity` output is **advisory-
  gate** and is **structurally excluded** from `check-ship.mjs`'s inputs. This is the increment's core P0
  move and the reason it is legal (vs. counting `/review` blocking-findings = the fix#3 disease).
- **`floor/check-verify.mjs` / `floor/check-regress.mjs`** (by consumption, not import — P3) —
  `check-ship.mjs` reads their emitted `.verdict` strings; no new edge into them.

---

## Evals to write (P1)

- **`floor/check-ship.mjs` is a floor helper (no `role:`), so P1's Capability-evals rule does not bind
  it** — it ships its proof as `floor/check-ship.test.mjs` (the floor-helper convention, like every
  `check-*.mjs`), collected by `npm test`'s glob; no `claude -p`. Cases: both-green → exit 0; verify
  `FAIL` + `iter<cap` → exit 3; verify `FAIL` + `iter==cap` → exit 1; regress `regressions` + under cap →
  exit 3; **off-by-one** (`iter==cap-1`→3, `iter==cap`→1); malformed verdict / missing file / non-int
  `iter`/`cap` → exit 2 (fail-closed); **`/review`-independence** (decision identical regardless of any
  `REVIEW.md` — there is no review input to vary).
- **Floor check after build:** `node floor/validate.mjs .` still `GREEN — 1 capabilities` (count
  unchanged — `floor/` + `.claude/commands/` are path-ignored).
- **`ship.md`'s `--loop` section is a command (no eval dir).** Its real proof is a **live `--loop`
  dogfood** — a natural follow-up (P7), like `pipeline-integration-probe` for the stages; **not** part of
  this authoring increment.

---

## Guarantee audit (P0) — what `--loop` does and does NOT guarantee

- **"`--loop` stops ONLY on floor-GREEN (`/verify` PASS ∧ `/regress` clean) or the cap"** → **FLOOR:
  `check-ship.mjs`** (a tested deterministic decision: enum-membership over the two floor `.verdict`
  strings + an integer `iter ≥ cap` compare — `§2` primitive #3). The agent **obeys** the helper's exit
  code (advisory **compliance**, exactly as it obeys `check-verify`).
- **"`/review` never gates the loop"** → **FLOOR (structural):** `check-ship.mjs`'s input signature has
  **no `/review` parameter** — it _cannot_ receive `REVIEW.md`. This is the strongest possible form of
  the invariant (not "the agent promises not to"). The `check-ship.test.mjs` `/review`-independence case
  demonstrates it.
- **"`--loop` is never unbounded"** → **FLOOR:** `check-ship.mjs` emits `STOP_CAP` deterministically at
  `iter ≥ cap`; fail-closed (`INCONCLUSIVE`) on any malformed input — never a silent `CONTINUE`.
- **"`--loop` runs the stages / applies fixes each iteration"** → **ADVISORY orchestration** (the agent
  invokes stages and edits files). The **fix working is NOT guaranteed** — `--loop` guarantees the _stop_,
  not that any failure is fixable. A non-converging fix runs to the cap and hands to the human.
- **"the human gates (plan approval, post-stop) are preserved"** → **ADVISORY** (command discipline); the
  loop never auto-re-enters GATE 1.
- **Net:** the **one** new floor primitive is `check-ship.mjs` (justified by a **real** need, P7 — the
  loop's autonomy removes the human checkpoint between iterations, so its termination + the
  `/review`-exclusion must be tested/structural, not prose; motivated by `ship-gated` REVIEW A-1). Writing
  "`--loop` ensures quality" or letting it self-certify "good" is the disease — **struck**: floor-GREEN
  means the two deterministic gates passed, **not** that the increment is wise (the human's call at GATE 2).

---

## Trust audit (P2)

- **`check-ship.mjs` reads ONLY enum-gated / floor-verifiable inputs** — two `.verdict` enum strings +
  two ints. **No free-text, no `/review`** — so no loop decision can rest on a tainted field (stronger
  than `/verify`, which at least carries advisory verifier free-text in its report; here there is none).
- **`/review` free-text** is still **presented** to the human each iteration as quoted DATA (advisory),
  **never** an instruction and **never** a stop input. Taint reaches the roll-up, not the control flow.
- **Named residual (`LIMITS.md §2`):** unchanged from gated `/ship` — a human/LLM consuming the presented
  free-text is the bounded-not-zeroed residual; `--loop` adds no new taint path (it removes one: the stop
  is now computed by a helper that can't see free-text at all).

---

## Determinism audit (P5)

- The loop's **continue/stop** is `check-ship.mjs`'s exit code (deterministic over enum verdicts + integer
  cap) — never LLM classification. The terminal fallback (cap reached, or fail-closed) is **STOP → hand to
  the human**, never a guess.
- The **fix** inside an iteration is advisory agent work (not a gate); it is bounded to the approved
  `## Files` by fix #7, and its _result_ is re-checked by the floor stages — so an unsound fix cannot
  produce a false floor-GREEN (the verdicts are recomputed each iteration).

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-29; "Approve as written")

- **OQ-A — stop/cap decision: helper or inline?** → **HELPER (`floor/check-ship.mjs` + `check-ship.test.mjs`).**
  The `## Files` is the **3-file** set as written. Decisive reason: it makes "`/review` never gates the
  loop" **structural** (the helper has no `/review` input) and the cap/fail-closed logic **tested** —
  the honest realization of "the stop must be floor" for an autonomous loop (motivated by `ship-gated`
  A-1). _Declined: inline (untested prose stop; `/review`-exclusion by discipline only)._
- **OQ-B — max-iteration cap default?** → **3** (overridable via `--max-iter N`): iteration 1 + up to 2
  fix attempts, bounding the expensive fan-out (`LIMITS.md §3`). _Declined: 5._
- **OQ-C — re-plan / re-approval semantics?** → **The loop NEVER re-plans and NEVER re-approves.** GATE 1
  is hit once before the loop; iterations only fix within the approved `## Files`; a plan-level failure
  runs to the cap and **STOPs to the human**, who re-plans via a fresh `/ship` run. The intent gate is
  never auto-re-entered. _Declined: auto-re-plan-with-re-approval mid-loop._

> **RESOLVED & APPROVED (2026-06-29).** Spec hash `11cd9ad5…` re-verified (no drift, fix #4). Build-ready;
> no open questions remain. Next step: **`/build features/ship-loop/PLAN.md`** — it re-checks the spec
> hash, scopes to the 3 `## Files` paths (`ship.md` + `floor/check-ship.mjs` + its test), writes the
> `--loop` section + the tested helper **together** (P1 floor-helper convention), and runs the floor.
