# PLAN — build-caveat-sync (sync the stale scope-source caveat in /pharn-build to plan-files-scope reality)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches the plan-files-scope/verify-style-gates pins → no drift
- increment: a **pure doc-sync** — rewrite the now-stale "Scope-source caveat" in `.claude/commands/pharn-build.md` (and its inline reference) so it states that `/pharn-plan` **now emits a parseable `## Files`** (resolved by the `plan-files-scope` increment, commit `a5de975`), while **preserving** the still-true fail-closed point: a **malformed/incomplete** plan with no parseable `## Files` still makes `/pharn-build` refuse rather than guess a scope. **No behavioral change**, no new floor primitive, no test.
- layer(s): `.claude/commands/` (the command — advisory orchestration; floor-ignored). No `pharn-*` file, no `.dev/floor/` change. **Floor capability count stays 1**. # ARCHITECTURE.md §4
- constitution_refs: [P0, P6, P7]

---

## Step 0 — Discovery results (live this run; P6, never from memory)

- **The stale caveat is at `pharn-build.md:103-107`** (read live): _"The product `/pharn-plan` template **currently** emits a free-text `## Steps / Files` section … so a stock product PLAN.md **fails this step fail-closed** **until the `plan-files-scope` follow-up** aligns `/pharn-plan` to emit a parseable `## Files`."_ — and an inline reference at `pharn-build.md:95-96`: _"(e.g. a plan carrying only a free-text `## Steps / Files` section — see the caveat)"_.
- **The gap is RESOLVED (confirmed live):** `/pharn-plan`'s Step-4 template now emits `## Steps` (`pharn-plan.md:136`) **+** a parseable `## Files` (`pharn-plan.md:141`) with leading back-tick paths (`pharn-plan.md:163`). The `plan-files-scope` increment landed at `a5de975` (`git log` confirms). So the caveat describes a **resolved** gap as **current** — stale.
- **The fail-closed behavior itself is UNCHANGED and still correct.** `/pharn-build` Step 0 still HALTs on a non-zero `set-writes-scope.cjs --from-plan` exit (`pharn-build.md:94-99`). What changed: a **stock** product PLAN now PASSES this step (it has a parseable `## Files`); only a **malformed/incomplete** plan (no `## Files` back-tick paths) still fails-closed. The rewrite must keep the fail-closed point, just re-anchor it from "the stock template" to "a malformed plan".
- **Floor is GREEN — 1 capability**; the edit is a floor-ignored command, count unchanged (re-confirm in build).

## The two layers (stated explicitly — P0)

- **FLOOR — unchanged.** This increment changes **no** floor mechanism. `/pharn-build`'s fail-closed-on-no-parseable-scope (the `set-writes-scope.cjs --from-plan` exit code + the command's HALT discipline) is **byte-identical** after this edit; only the **prose describing `/pharn-plan`'s current state** changes.
- **ADVISORY — the caveat prose.** The caveat is human-facing documentation; correcting it to match reality is advisory model work (a doc-sync). It makes **no** new guarantee claim.

> **The honest claim (P0).** This is a **documentation correction**: the caveat now matches reality (`/pharn-plan` emits a parseable `## Files`). It does **not** add, remove, or alter any guarantee — `/pharn-build` still fail-closes on a plan with no parseable scope (correct behavior, not a bug), exactly as before.

## Files

- `.claude/commands/pharn-build.md` — **EDIT (one axis).** (1) Rewrite the "Scope-source caveat" blockquote (`:103-107`): replace the "currently emits a free-text `## Steps / Files` … until the `plan-files-scope` follow-up" framing with a statement that `/pharn-plan` **now emits a parseable `## Files`** (resolved by `plan-files-scope`), while **keeping** the fail-closed point for a **malformed/incomplete** plan (no parseable `## Files` → `/pharn-build` refuses rather than guess — correct, not a bug). (2) Re-anchor the inline example at `:95-96` from "a plan carrying only a free-text `## Steps / Files` section" to a **malformed/incomplete** plan generally (an old or hand-written plan lacking `## Files` back-tick paths). — layer `.claude/commands/` (floor-ignored).

### Explicitly **not** touched

- `.claude/commands/pharn-plan.md` — already emits a parseable `## Files` (`plan-files-scope`, `a5de975`); **NOT** touched (one axis; it is the producer this caveat now describes correctly).
- `.claude/hooks/set-writes-scope.cjs`, `.claude/commands/pharn-dev-verify.md`, `/pharn-dev-regress`, and all other commands — out of scope.
- `ARCHITECTURE.md` / `CONSTITUTION.md` / `THREAT-MODEL.md` / `LIMITS.md` — human-only (hook-denied, fix #2).

## Contracts satisfied (cite, don't restate — P4)

- **`.claude/commands/pharn-plan.md` (`plan-files-scope`, `a5de975`)** — the producer the caveat describes; now emits a parseable `## Files`, which is the fact this doc-sync records.
- **`ARCHITECTURE.md §6`** — the build stage's scope-derivation precondition (unchanged); the caveat is the human-facing note about it.

## Evals to write (P1)

- **None — and that is correct (P7).** This is a pure prose doc-sync with **no behavioral change**: `/pharn-build`'s fail-closed logic is untouched, `check-*`/`set-writes-scope` are untouched, no new `rule_id`/Capability. There is nothing behavioral to test; adding a test would be speculative (P7). The "proof" is that the corrected prose matches live reality — confirmed in discovery (`/pharn-plan` emits `## Files`).
- The existing `set-writes-scope.test.cjs` already pins the real behavior the caveat describes: the closing-the-loop test (a `/pharn-plan`-shaped plan parses) **and** the fail-closed test (a no-`## Files` plan exits 1) — both green (from `plan-files-scope`).
- **Floor check after build:** `node .dev/floor/validate.mjs .` → `GREEN — 1 capability`; `npm run check` green.

## Guarantee audit (P0)

- the caveat now matches reality (`/pharn-plan` emits a parseable `## Files`) → **advisory** (a doc correction; no guarantee claim).
- `/pharn-build` still fail-closes on a plan with no parseable scope → **floor: fail-closed** (`set-writes-scope.cjs --from-plan` exit + command HALT discipline) — **UNCHANGED** by this edit; the rewrite preserves the point, re-anchored to a malformed plan.
- this increment adds/changes a floor primitive → **NO** (pure prose).

## Trust audit (P2)

- Ingests **no untrusted artifact** — it edits a trusted command (`pharn-build.md`). No taint path; no runtime free-text involved.

## Determinism audit (P5)

- No branch changes. `/pharn-build`'s proceed/refuse branch (the `set-writes-scope` exit code) is untouched; only the human-facing caveat prose changes.

## Open questions (HALT) — RESOLVED (human-approved 2026-06-30; "Approve as written")

- **OQ1 → PRESERVE (human-approved 2026-06-30).** The rewrite keeps the fail-closed point explicitly — a **malformed/incomplete** plan (no parseable `## Files`) still makes `/pharn-build` refuse rather than guess a scope (correct behavior, not a bug). It only re-anchors that point from "the stock `/pharn-plan` template" (no longer true) to "a malformed plan" (still true).

> **Build-ready — no open questions remain.** Spec hash `11cd9ad5…` re-verified live this run (no drift, fix #4). Next in the chain: `/pharn-dev-grill` → `/pharn-dev-build` (edits `.claude/commands/pharn-build.md`).
