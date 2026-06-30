# PLAN — build-stage (build `/pharn-build`: the product build stage — the first stage that writes the USER's code)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches grill-stage/plan-stage/ship-gated pins → no drift
- increment: build `.claude/commands/pharn-build.md` — the **product** build stage (`spec → plan → grill → build → …`, `ARCHITECTURE.md §6`), the FIRST product stage that writes the USER's code, gated by (a) the **reused** spec→plan hash chain (`check-plan-spec-agree.mjs`) and (b) **fix #7** writes-scope derived from the plan (`set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`). Adds **NO new floor primitive** — pure reuse + one new command file.
- layer(s): `.claude/commands/` for the command (advisory orchestration; floor-ignored — like `/pharn-plan` `/pharn-grill` `/pharn-spec`). No `pharn-*` library file, no new `.dev/floor/` checker. **Floor capability count stays 1** (`trust-fence`). # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P5, P6, P7]

---

## Step 0 — Discovery results (live this run; P6, never from memory)

- **Floor is GREEN — 1 capability** (`trust-fence`), recomputed live (`node .dev/floor/validate.mjs .`). The new command lives in `.claude/commands/` (path-ignored by `validate.mjs`); no new product-surface file ⇒ count stays **1**.
- **`/pharn-build` is a PRODUCT command** (`pharn-` prefix, no `-dev-`), distinct from `/pharn-dev-build` (the build-loop builder this increment USES). Different loop; separate file. Output: `.claude/commands/pharn-build.md`.
- **The hash-chain gate is cleanly reusable (no new code).** `check-plan-spec-agree.mjs <PLAN.md> <SPEC.md>` reads the PLAN's **frontmatter** `spec_content_hash` (`check-plan-spec-agree.mjs:66-74`) and re-verifies it equals the **current** Approved, un-drifted SPEC's body hash (reusing `check-spec-approved.mjs` + `check-spec.mjs --hash`). `/pharn-plan` emits that frontmatter field (`pharn-plan.md:127-130`), so `/pharn-build` reuses the checker exactly as `/pharn-grill` does — **arg order PLAN then SPEC**. Build is therefore the **SECOND** consuming stage that enforces the pin (grill was first): the chain is re-checked at build time, not trusted-once.
- **THE CRUX — the fix #7 scope source is a real GAP (Open Question 1).** `set-writes-scope.cjs --from-plan` (`pathsFromPlanFiles`, `set-writes-scope.cjs:155-177`) requires a **`## Files`** heading (`/^##\s+Files\b/`) with **back-tick-delimited paths** (`` - `path` ``). The product `/pharn-plan` PLAN.md template (`pharn-plan.md:136`, Step 4) emits **`## Steps / Files`** with **free-form bullets** (`- <a concrete step or file to change>`) — wrong heading, no back-ticks ⇒ `set-writes-scope.cjs --from-plan` over a real product PLAN **fails (exit 1)** → `/pharn-build` fails-closed (refuses). The existing `features/{ship-gated,ship-loop}/PLAN.md` are NOT counter-examples: they use the **dev** `/pharn-dev-plan` template (`# PLAN —` heading, bullet metadata, a dev-style `## Files`) and have **no `SPEC.md`** — they predate `/pharn-spec` (confirmed live: `find features -name SPEC.md` → none). So today there is **no product PLAN producer** that emits a parseable scope section.
- **`ARCHITECTURE.md §6` aligns; one reconciliation reported (not resolved).** The spine is `… → build → …` (build row: `build-summary.json | per-phase results`, `ARCHITECTURE.md:208`). That `build-summary.json` artifact is **spec'd but not emitted** by the existing build (the dev `/pharn-dev-build` writes a prose note, not a machine summary — `pipeline-integration-probe` finding CF-3, echoed `ship-gated/PLAN.md:26`). `/pharn-build` mirrors that precedent: **emits no machine artifact**; its verdict is the floor exit (which `/ship` already reads). The `build-summary.json` gap is **reported for a human** (§6 is human-only, hook-denied — fix #2), not newly implemented here (P7 — no triggering need).

## The two layers (stated explicitly — P0)

- **FLOOR — the guarantees, both REUSED (no new primitive):**
  1. **Hash-chain gate** — `check-plan-spec-agree.mjs <PLAN.md> <SPEC.md>` (content-hash equality + the `state == Approved` enum, via the reused `check-spec-approved.mjs` + `check-spec.mjs --hash`). A drifted/stale chain → RED → `/pharn-build` **REFUSES** (re-plan / re-approve). Build is the **second** enforcing consumer of the pin.
  2. **writes-scope (fix #7)** — `set-writes-scope.cjs --from-plan <PLAN.md>` sets `.pharn/writes-scope.json` to exactly the plan's authorized `## Files` paths (the #15-hardened extractor excludes "not touched" paths); `enforce-writes-scope.cjs` then **DENIES (exit 2)** any write outside them. **This now bounds the USER's code** — a write the plan did not authorize is blocked at the floor. Fail-closed: no parseable scope → no scope written → refuse.
  3. **Floor stays GREEN** — `node .dev/floor/validate.mjs .` (or the user's project gate) after the build; any RED → HALT.
- **ADVISORY — never a guarantee.** The actual implementation (HOW the user's code is written, whether it is correct or faithful to the plan's intent) is **model judgment**. `/pharn-build` helps write code that follows the plan; it does **NOT** guarantee the code is correct — downstream `/pharn-regress` / `/pharn-verify` + human review check that.
- **Two clocks (be honest):** each gate's **VERDICT** is FLOOR (the checker's exit code / the hook's deny). `/pharn-build`'s **act** of invoking them and obeying is **ADVISORY** command orchestration — the same split as `/pharn-grill` / `/pharn-plan` / `/pharn-dev-ship`.

> **The honest claim (P0).** `/pharn-build` **guarantees** it builds only from a **current Approved + un-drifted** plan (the reused hash chain) and writes **only within the plan's declared scope** (fix #7, now **load-bearing on USER code**). It does **NOT** guarantee the code is correct or faithful — that is downstream + human. **"`/pharn-build` produced code" must never read as "therefore the code is correct"** — that conflation is the P0 disease (precedents: `/pharn-grill` "produced ≠ good", `/pharn-plan` "produced ≠ sound").

## Files

> `/pharn-build`'s OWN writes-scope (fix #7) for THIS dev increment comes from the back-tick path below (dev `/pharn-dev-plan` template) — `/pharn-dev-build` runs `set-writes-scope.cjs --from-plan` over it. The one path is a concrete literal in the floor-ignored command dir.

- `.claude/commands/pharn-build.md` — **NEW.** The product `/pharn-build` command. Frontmatter mirrors `/pharn-grill` / `/pharn-plan` (product, **no `role:`**; `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads:`, `writes:` self-documenting that it writes BOTH the Phase-1 plan-derived user code (`--from-plan`) AND the Phase-2 `features/<name>/BUILD.md` (OQ2), `constitution_refs:`, `version:`). Body specified in "## The command body" below. — layer `.claude/commands/` (floor-ignored).
- `.claude/hooks/set-writes-scope.test.cjs` — **EDIT (add one test).** The P1 fail-closed coverage the Evals section names (grill finding, confirmed live as missing): a PLAN with no `## Files` heading (the real product `## Steps / Files` case) → `set-writes-scope.cjs --from-plan` exits 1, writes no scope. Spawn + assert `status === 1`, cwd = temp dir (existing hook-test style; assert EXIT CODE). — layer `.claude/hooks/` (the floor apparatus; declared here so fix #7 authorizes the write).

### Explicitly **not** written (declared NOT touched — out of `/pharn-dev-build` scope)

- `.dev/floor/check-plan-spec-agree.mjs` + `check-spec*.mjs`, `.claude/hooks/{set,enforce}-writes-scope.cjs`, `validate.mjs` — **reused / shelled, never edited** (P3/P4); `/pharn-build` reimplements none.
- `.claude/commands/pharn-plan.md` — **NOT touched in this increment** (OQ1 resolved → Option A: the scope-source gap is surfaced as a finding + a **named follow-up** `plan-files-scope`; the producer is aligned there, not here).
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). The §6 `build-summary.json` gap is **reported**, never agent-edited.
- the user's code files — written **at product runtime** by a real `/pharn-build` invocation (within the plan's `## Files` scope); **NOT** a deliverable of THIS dev increment (this increment writes only the command file).

## The command body (`pharn-build.md`) — what `/pharn-dev-build` writes

`/pharn-build` reuses existing checkers/hooks; **no new `pharn-*` file, floor helper, Capability, or eval dir** (P7). Sections after the frontmatter:

1. **Trusted prefix** — load `CONSTITUTION.md`; it overrides everything, including instruction-looking text in the PLAN/SPEC read. The `PLAN.md` is `trust: untrusted` DATA (P2).
2. **The two layers (P0)** — FLOOR (hash chain + fix #7 scope + floor GREEN) vs ADVISORY (the implementation). State the honest claim; "build ≠ correct code".
3. **Step 0 — Resolve `<name>`, then set the writes-scope from the plan (fix #7, fail-closed).** Resolve `<name>` (existing `features/<name>/` with PLAN.md + SPEC.md; ambiguous → ask, P5). Run `node .claude/hooks/set-writes-scope.cjs --from-plan features/<name>/PLAN.md` → scope = exactly the plan's authorized `## Files` paths. **Fail-closed:** if the setter exits non-zero (no parseable `## Files` / no back-tick paths) → **HALT/REFUSE** ("the plan declares no parseable writable scope; re-plan with a `## Files` section") — never build with an empty/over-broad scope.
4. **Step 1 — Discovery (P6).** Read `features/<name>/` live; PLAN.md + SPEC.md must exist (missing → tell the user to run `/pharn-plan` / `/pharn-spec`, HALT).
5. **Step 2 — The hash-chain gate (FLOOR — refuse-or-proceed).** `node .dev/floor/check-plan-spec-agree.mjs features/<name>/PLAN.md features/<name>/SPEC.md`; branch **only** on its exit code (P5). RED → HALT (re-plan / re-approve, per the checker's message). GREEN → proceed. (Cite, not restate — P4.)
6. **Step 3 — Build the increment (ADVISORY — model work, within scope).** Implement what the plan's Approach / `## Steps / Files` describe, writing **ONLY** paths inside the fix #7 scope (a write outside → the hook denies, exit 2; the fix is to declare the path in the plan + re-run the setter, **never** bypass). The implementation is advisory.
7. **Step 4 — Run the floor (deterministic gate).** `node .dev/floor/validate.mjs .` (or the user's project gate) — any RED → HALT; GREEN ≠ correct (downstream checks that).
8. **Step 5 — Re-scope to the build record, write `BUILD.md`, stop (OQ2 resolved → thin BUILD.md).** Re-set the writes-scope to the build record _before_ writing it — `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/pharn-build.md --target features/<name>/BUILD.md` (**Phase 2**; the Phase-1 `--from-plan` scope replaced the safe-set, so `features/<name>/BUILD.md` is otherwise denied — this mirrors how `/pharn-dev-ship` scopes its `SHIP.md` last). Then write a **thin, advisory** `features/<name>/BUILD.md`: which plan built, the chain-gate result (GREEN), the fix #7 scope that was set, the floor status (GREEN), and the files written — **never** a self-issued "correct" / seal (P0). NO machine `build-summary.json` (mirrors `/pharn-dev-build`; §6 gap reported, P7). Does **NOT** chain to `/pharn-regress`. End the turn.
9. **Guarantee / Trust / Determinism audits** — the P0/P2/P5 sections (mirroring those below), embedded in the command.

## Contracts satisfied (cite, don't restate — P4)

- **`ARCHITECTURE.md §6`** — the build stage of the spine (build row, `ARCHITECTURE.md:208`) + the §6 Keystone spec→plan content-hash chain (fix #4), now enforced at the **second** consuming stage. The `build-summary.json` artifact gap (CF-3) is **reported**, not resolved.
- **`.dev/floor/check-plan-spec-agree.mjs`** — the hash-chain gate, **shelled** (P3), reused exactly as `/pharn-grill` uses it (arg order PLAN, SPEC). No new edge.
- **`.claude/hooks/set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`** — fix #7: the plan-derived writes-scope + its pre-write enforcement, **reused as-is** (the #15-hardened `## Files` extractor). Cited, not restated.

## Evals to write (P1) — reuse-shaped; the proof is the reused (already-tested) helpers + a dogfood

- `/pharn-build` is a **command, not a Capability** (no `role:`, floor-ignored dir) — exactly like `/pharn-grill` / `/pharn-plan` / `/ship`; **P1's Capability-evals rule does not bind it**. It adds **no new checker**, so it ships no new `evals/` dir.
- The intent's three test scenarios are **already covered by the reused helpers' existing tests** (cite + confirm — add only on a real gap, P7):
  - **stale chain → build refuses** → `check-plan-spec-agree.test.mjs` (the stale-plan / Draft / drift / fail-closed cases, asserting **exit code**).
  - **write outside the planned scope → blocked** → `enforce-writes-scope.test.cjs` (out-of-scope deny exit 2; no-scope fail-closed safe-set).
  - **a plan with no parseable scope → refuse (fail-closed)** → `set-writes-scope.cjs` exits 1 when there is no `## Files` / no back-tick paths (`set-writes-scope.cjs:184,197`). **Confirmed live as UNCOVERED** (every `--from-plan` test uses a present `## Files`); **ADDED** as ONE small black-box test in `set-writes-scope.test.cjs` (spawn a no-`## Files` PLAN, assert `status === 1`, no scope file written) — a real coverage gap of the crux scenario, mirroring the existing hook test style (assert EXIT CODES; no `head`; correct arg order).
- **Floor check after build:** `node .dev/floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged — the command dir is path-ignored).
- **The real proof is a live product-chain dogfood** (like `pipeline-integration-probe` / `ship-gated` were): a `/pharn-spec → /pharn-plan → /pharn-grill → /pharn-build` run on a throwaway increment, observing the chain gate + fix #7 scope on real user code — a natural **follow-up** (P7), gated on OQ1's scope-source resolution; **not** part of this authoring increment.

## Guarantee audit (P0)

- `/pharn-build` builds only from a current Approved + un-drifted plan → **floor: content-hash + enum** (`check-plan-spec-agree.mjs` — reused). The pin enforced at a **second** consuming stage (after grill).
- a drifted/stale chain → REFUSE → **floor: enum-regex** (the checker's exit code).
- `/pharn-build` writes only within the plan's declared scope → **floor: hook (fix #7)** (`set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`) — **now load-bearing on USER code** (Phase-1).
- the build record `features/<name>/BUILD.md` is itself fix #7-scoped (Phase-2 `--from-frontmatter … --target`) → **floor: hook (fix #7)**; its **content** (the advisory roll-up) is model work, never a self-issued "correct" / seal → **advisory** (the §6 ship-stage seal is the human's GATE-2 decision, not `/pharn-build`'s).
- no parseable scope → refuse → **floor: fail-closed** (`set-writes-scope.cjs` exit 1; `/pharn-build` refuses rather than fall through to the hook's absent-scope default-safe-set).
- floor stays GREEN through the build → **floor: enum-regex** (`validate.mjs` exit).
- `/pharn-build`'s **act** of invoking the gates and obeying → **advisory** (command orchestration; two clocks).
- the implementation (the user's code) is correct / faithful → **NOT a claim** — struck as the P0 disease. ADVISORY model work; downstream + human verify.

## Trust audit (P2) — taint propagation

- **Inputs.** `features/<name>/PLAN.md` + `SPEC.md` bodies = untrusted DATA. The hash-chain gate ranges **only** over enum-gated / floor-verifiable values (the gate exit code; the two 64-hex digests — the carried hash regex-gated to 64-hex before the compare), **never** the prose's meaning (the `check-plan-spec-agree` ★ tests prove a needle does not move the verdict). The fix #7 scope is parsed **deterministically** from the plan's `## Files` back-tick paths — **path membership only**, never a free-text / tainted field (`enforce-writes-scope.cjs:13`).
- **Outputs.** The user's code is ADVISORY model work; it is **never** injected downstream as instructions and **never** gates a guaranteed decision. The only guarantees are the chain (hashes / state) and the scope (path membership).
- **Residual (named — `LIMITS.md §2`, `THREAT-MODEL.md §5`).** A hostile instruction in the PLAN prose could steer the model's (advisory) implementation choices — **bounded** (it cannot move the hash-chain verdict, and cannot escape the fix #7 scope: a write outside `## Files` is denied at the floor regardless of what the prose says) but **not zeroed**. fix #7 makes the blast radius **structural**: even a fully-injected build cannot write outside the plan's authorized paths. The same residual is already accepted across `finding-shape.md` / grill / attempt 0.

## Determinism audit (P5)

- The proceed/refuse branches read **only** exit codes / hook denies — `check-plan-spec-agree.mjs` exit (`state ∈ {Approved}` ∧ `planHash == sha256(SPEC body)`); `set-writes-scope.cjs` exit (parseable scope present); `enforce-writes-scope.cjs` path-membership. No LLM classification drives a gate.
- Terminal fallbacks, never a guess: a **broken chain** → the checker's clear RED (re-plan / re-approve); **no parseable scope** → refuse with a clear message (re-plan with a `## Files` section); a **missing PLAN/SPEC** → HALT and tell the user which command to run; an **ambiguous `<name>`** → ask the human. The implementation is advisory model judgment, never a guaranteed branch.

## Decisions made (intent asked to decide)

- **`/pharn-build` is a COMMAND**, not a Capability (no `role:`; markdown in `.claude/commands/`). Floor count stays 1.
- **Reuses `set-writes-scope.cjs` as-is** (the #15-hardened `--from-plan` `## Files` extractor) — no new scope-derivation code, no edit to the shared setter (modifying it would risk all stages; rejected).
- **Reuses `check-plan-spec-agree.mjs` as-is** (shelled, arg order PLAN/SPEC) — no new checker; build is its **second** consumer after grill.
- **OQ1 resolved (human, 2026-06-30) → Option A (follow-up).** `/pharn-build` reuses `set-writes-scope.cjs --from-plan` **as-is** (the scope contract IS `## Files` + back-tick paths); the product `/pharn-plan`'s non-compliance (`## Steps / Files` free-form, `pharn-plan.md:136`) is surfaced as a finding + a **named follow-up** `plan-files-scope`, **not** fixed here. `/pharn-build` is correct + fail-closed until that follow-up lands.
- **OQ2 resolved (human, 2026-06-30) → thin BUILD.md.** `/pharn-build` emits a thin advisory `features/<name>/BUILD.md` roll-up, scoped via a **Phase-2** `--from-frontmatter … --target` re-set after the user-code writes (mirrors `/pharn-dev-ship`'s SHIP.md). Two scope phases: Phase-1 user-code (`--from-plan`), Phase-2 BUILD.md.
- **Naming:** `/pharn-build` (`pharn-` prefix, product). No `-dev-`.

## Open questions (HALT) — RESOLVED (human-approved 2026-06-30; "Approve as written")

- **OQ1 (the crux) → Option A (follow-up to `/pharn-plan`).** `/pharn-build` reuses `set-writes-scope.cjs --from-plan` **as-is** — the scope contract IS a `## Files` heading with back-tick paths. The product `/pharn-plan`'s non-compliance (`## Steps / Files` free-form, `pharn-plan.md:136`) is surfaced as a finding + a **named follow-up** increment `plan-files-scope` (align the product PLAN template to emit a parseable `## Files`); it is **not** built here. `/pharn-build` is correct + **fail-closed** until that follow-up lands (it refuses any plan lacking a parseable `## Files`). _Declined: C (bundle the `/pharn-plan` edit into this PR); A-reversed (fix the producer first); B (modify the shared setter — fragile, risks all stages)._
- **OQ2 → thin BUILD.md.** `/pharn-build` emits a thin advisory `features/<name>/BUILD.md` roll-up (which plan built, chain GREEN, fix #7 scope set, floor GREEN, files written — **never** a "correct" / seal), scoped via a **Phase-2** `--from-frontmatter … --target` re-set after the user-code writes (mirrors `/pharn-dev-ship`'s SHIP.md). _Declined: none (no artifact)._

> **Build-ready — no open questions remain.** Spec hash `11cd9ad5…` re-verified live this run (no drift, fix #4). Next in the `/pharn-dev-ship` chain: `/pharn-dev-grill` (re-interrogate this plan), then `/pharn-dev-build` (writes `.claude/commands/pharn-build.md`, re-checks the spec hash, runs the floor).
