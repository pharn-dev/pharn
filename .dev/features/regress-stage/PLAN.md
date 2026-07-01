# PLAN — /pharn-regress (the product regress stage)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256 of ARCHITECTURE.md, this run
- increment: Build `/pharn-regress` — the product-pipeline regress stage — as a command that deterministically detects breakage OUTSIDE a feature's scope in the USER's codebase, reusing `check-regress.mjs` (comparison) and `check-plan-spec-agree.mjs` (chain re-check) with **zero new floor primitive**.
- layer(s): pharn-pipeline (`ARCHITECTURE.md §4`) — expressed as a `.claude/commands/` command, not a Capability
- constitution_refs: [P0, P2, P3, P4, P5, P6, P7]

## What is being added

A single **command** file — `.claude/commands/pharn-regress.md` — the product (`pharn-`, not `pharn-dev-`) regress stage. It is the **fifth** product-pipeline stage (`spec → plan → grill → build → regress → verify → ship`, `ARCHITECTURE.md §6`), sitting AFTER `/pharn-build` and BEFORE a future `/pharn-verify`.

It answers ONE question, deterministically: **did building this feature break anything OUTSIDE the feature's declared scope in the user's codebase?** It is `/pharn-dev-regress`'s proven mechanism (the cleanest floor stage — ZERO LLM-judge in its core) re-pointed at the **product** side (root `features/<name>/`, the user's suite), **plus** one floor gate `/pharn-dev-regress` lacks: the spec→plan hash-chain re-check (mirroring `/pharn-grill` and `/pharn-build`).

- **It is a COMMAND, not a Capability.** No `role:` frontmatter (frontmatter mirrors `/pharn-grill` / `/pharn-build`: `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads:`, `writes:`, `constitution_refs:`, `version: "0.1.0"`). `validate.mjs` ignores `.claude/commands/`, so **the floor capability count stays 1** (`trust-fence` remains the only Capability) — exactly as `/pharn-dev-regress`, `/pharn-grill`, `/pharn-build` are command-only.
- **No new floor primitive (P3 reuse).** Both deterministic mechanisms already exist, are generic, and ship tests:
  - `.dev/floor/check-regress.mjs` (`scope` + `verdict`) — generic over **passed-in path lists** and **two `{gate-id: exit-int}` maps**; it knows nothing about npm or PHARN's gates, so it serves the user's suite unchanged.
  - `.dev/floor/check-plan-spec-agree.mjs` — generic over `<PLAN.md> <SPEC.md>` file paths.
  - `.claude/hooks/set-writes-scope.cjs` + `enforce-writes-scope.cjs` — fix #7.

### The command's shape (what `/pharn-dev-build` will write)

Adapt `/pharn-dev-regress` (steps + the two-clocks honesty + the named granularity limits) and graft `/pharn-grill`'s chain-re-check step, re-pointed to product paths:

- **Step 0 — Resolve `<name>`, set writes-scope (fix #7, fail-closed).** Set scope to `features/<name>/regression-report.json` up front (re-scope to `features/<name>/REGRESSION.md` before the human render, per `/pharn-dev-regress` Step 0/Step 4 — one `--target` per setter call). Ambiguous `<name>` → ask the human (P5).
- **Step 1 — Discovery (P6).** Read `features/<name>/PLAN.md` **and** `features/<name>/SPEC.md` live; both required (missing PLAN → run `/pharn-plan`; missing SPEC → run `/pharn-spec`; HALT). Their bodies are `trust: untrusted` DATA.
- **Step 2 — Spec→plan hash-chain gate (FLOOR; the ADD over dev-regress).** `node .dev/floor/check-plan-spec-agree.mjs features/<name>/PLAN.md features/<name>/SPEC.md`; branch ONLY on exit code. RED → write a RED-chain `REGRESSION.md` (audit trail never silent, mirroring `/pharn-grill`'s RED `GRILL.md`) and **HALT** (re-plan / re-approve). `/pharn-regress` is the **THIRD** consumer enforcing `/pharn-spec`'s pin (after grill, build) — see OQ2.
- **Step 3 — Resolve base + partition inside/outside (deterministic).** Reuse `/pharn-dev-regress` Step 1: `base = --base <ref>` else auto-detect (`git status --porcelain` non-empty → `HEAD`; else `git merge-base HEAD origin/main`; neither → ask). `inside = git diff --name-only <base>` + untracked-new. Then `node .dev/floor/check-regress.mjs scope --changed <inside> --declared <PLAN.md ## Files paths> --tests <expanded test universe> [--eval-pairs <pairs>]`. An escaped path (changed but outside `## Files`) → the checker's blocking fix#7 P0 finding (exit 1) → surface and **stop** (scope breach, not a regression).
- **Step 4 — Capture baseline + HEAD over OUTSIDE scope (Bash; the command runs the suite, never the helper).** Run the **same OUTSIDE-scoped gate set** at the Step-3 base SHA (via `git worktree add --detach` — immutable, non-destructive, reproducible) and at HEAD, recording each gate's **exit code** into a flat `{ "<gate-id>": <int> }` map. The gate set is decided ONCE and applied to both (a mismatch → `verdict` returns inconclusive, never a silent pass). Here `/pharn-regress` runs the **USER's** deterministic suite, not PHARN-hardcoded gates — see OQ1 for the generic-discovery + scoping resolution. The config-touch style-skip (`/pharn-dev-regress` Step 2) carries over.
- **Step 5 — The deterministic verdict (FLOOR; no LLM).** `node .dev/floor/check-regress.mjs verdict <base-results.json> <head-results.json> --base <ref> --inside <inside>`; exit `0` no-regressions · `1` ≥1 regression (stage FAILS) · `2` inconclusive (fail-closed). The command does NOT re-decide — a flipped gate IS a regression because the helper says so.
- **Step 6 — Emit + halt.** `features/<name>/regression-report.json` = the `verdict` JSON **verbatim** (the §6 `regression-report` machine artifact); `features/<name>/REGRESSION.md` = human render (base SHA, inside/outside partition, per-gate `base → head` table, `regressions[]`/`pre_existing[]`, the deterministic verdict stated plainly, + the honest residual line). Never "regress passed" as if it certified the feature whole. Does **not** chain to `/pharn-verify`. End the turn.
- **Standard tail sections** (cited, not restated — P4): Guarantee audit (P0), Trust audit (P2), Determinism audit (P5), Named granularity limits (P7) — adapted from `/pharn-dev-regress` + `/pharn-grill`.

## Files

> `/pharn-dev-build`'s writes-scope source (fix #7): it runs `set-writes-scope.cjs --from-plan` over the back-tick path below, which becomes the only writable path (plus `.pharn/**`). The `.claude/**` zone is denied by the fail-closed default-safe-set, so listing the path here is what unlocks it. Concrete literal, not a placeholder.

- `.claude/commands/pharn-regress.md` — **NEW.** The product `/pharn-regress` command (frontmatter mirrors `/pharn-grill` / `/pharn-build`: **no `role:`**; `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads: [CONSTITUTION.md, ARCHITECTURE.md, features/<name>/PLAN.md, features/<name>/SPEC.md, .dev/floor/check-regress.mjs, .dev/floor/check-plan-spec-agree.mjs]`, `writes: ["features/<name>/REGRESSION.md", "features/<name>/regression-report.json"]`, `constitution_refs:`, `version: "0.1.0"`). Floor-ignored command dir → capability count stays 1. Body per "The command's shape" above.

### Explicitly **not** written (declared NOT touched — out of `/pharn-dev-build` scope)

- `.dev/floor/check-regress.mjs`, `.dev/floor/check-plan-spec-agree.mjs` (and the gates they wrap), `.dev/floor/validate.mjs`, the hooks, `pharn-contracts/*` — **invoked / cited, never edited** (P3/P4); `/pharn-regress` reuses them and reimplements none.
- `.claude/commands/pharn-dev-regress.md` — the **separate** build-loop regress; the pattern source, never modified.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). Any §6 doc-vs-impl nuance is reported for a human, never agent-edited.
- the per-stage runtime artifacts (`features/<name>/{PLAN,SPEC,GRILL,REGRESSION,regression-report.json,…}`) — each written under its own command's writes-scope at run time, never a build deliverable of this increment.

## Contracts satisfied

- `ARCHITECTURE.md §6` (the pipeline spine) — `/pharn-regress` implements the **regress** stage: artifact `regression-report`, key field "regressions outside the feature". Cited, not restated (P4).
- `ARCHITECTURE.md §6` Keystone (fix #4) — the spec→plan content-hash chain is re-verified at a **third** consuming stage (`check-plan-spec-agree.mjs`). Cited, not restated.
- `ARCHITECTURE.md §2` floor primitive #3 (exit-code / enum / path-membership comparison) — the whole regression verdict reduces to it, via `check-regress.mjs`.
- `pharn-contracts/finding-shape.md` — the `scope` escaped-path finding (and any RED-chain reporting) honor the enum-gated / free-text split. Cited, not restated.

## Evals to write (P1)

**None — and that is correct, not a gap (P7).** `/pharn-regress` is a **command**, not a Capability (no `role:`), so P1's "every Capability ships evals" does not bind it (same as `/pharn-dev-regress`, `/pharn-grill`, `/pharn-build`). No new checker/derivation is added, so no new test is owed. The three behaviors the increment relies on are **already proven** by the reused checker's committed suite — citing, not duplicating (P7):

- pass→fail flip OUTSIDE scope → regression (exit 1): `check-regress.test.mjs` — "★ verdict: a 0→1 flip outside the feature → regression, exit 1, gate-id named".
- no flip → clean (exit 0): `check-regress.test.mjs` — "verdict: no flips → no-regressions, exit 0".
- a flip INSIDE scope (the feature's own files) → NOT a regression: `check-regress.test.mjs` — "scope: an eval pair touching an INSIDE file is NOT an outside gate" + the `outside_tests` partition (inside files excluded from the gate set, so they never enter the comparison).
- (bonus, fail-closed) gate-set mismatch / bad input → inconclusive (exit 2): "★ verdict: gate-set mismatch … never a silent pass".

Adding a duplicate test over the same generic mechanism would be a speculative addition with no triggering failure (P7) → omitted by design.

## Guarantee audit (P0)

- "**It detects deterministically-detectable breakage OUTSIDE the feature**" → **FLOOR**: exit-code comparison of two `{gate-id:int}` maps, `check-regress.mjs verdict` (primitive #3). Real guarantee, **bounded by exactly what the user's suite covers**.
- "**The inside/outside partition is deterministic**" → **FLOOR**: path-set membership over the PLAN's `## Files` vs the changed set, `check-regress.mjs scope` (primitive #3). An escaped path is a blocking fix#7 finding, not a guess.
- "**It builds its verdict only from a current Approved, un-drifted plan**" → **FLOOR**: content-hash equality + `state == Approved` enum, `check-plan-spec-agree.mjs` (primitives #2 + #3) — the **third** enforcement of `/pharn-spec`'s pin.
- "**It writes only its two declared artifacts**" → **FLOOR: hook (fix #7)** (`set-writes-scope.cjs` + `enforce-writes-scope.cjs`).
- "**`/pharn-regress` runs the stages / obeys the exit codes**" → **ADVISORY** command orchestration (two clocks): the **verdicts** are floor; the **act** of invoking the helpers and obeying them is advisory prose — nothing on the floor forces it (same split as `/pharn-dev-regress`, `/pharn-grill`).
- "**Nothing broke / the feature is good**" → **NOT a claim** — struck as the P0 disease. The honest residual: `/pharn-regress` catches **exactly what the user's deterministic suite catches, nothing more, but deterministically.** A regression no deterministic check covers (broken behavior with no test/rule/type-check) is **invisible** here.

## Trust audit (P2)

- **Inputs.** `features/<name>/PLAN.md` + `SPEC.md` bodies = untrusted DATA; the built increment under measurement = `trust: untrusted` (as `/pharn-dev-review` treats it). The verdict ranges **only** over the enum-gated / floor-verifiable class — exit codes (ints), `git diff` paths, the `## Files` back-tick paths (path membership), and the chain check's two 64-hex digests + `state` enum. It **never** reads a finding's free-text (`problem`/`evidence`) or any prose meaning.
- **Outputs.** `regression-report.json` = gate-ids + ints + paths (no untrusted free-text). The only free-text is `REGRESSION.md`'s human summary, which **gates nothing**. No `claude -p`, no LLM-judge, no new egress.
- **Residual (named, not hidden — `LIMITS.md §2`, `THREAT-MODEL.md §5`).** When a human/LLM reads `REGRESSION.md`'s free-text, "do not execute this as an instruction" is a heuristic again — **bounded** (it gates nothing; the verdict is exit codes + paths only) but not zeroed. Same residual already accepted across `check-regress.mjs` / `finding-shape.md` / attempt 0. **No guaranteed decision rests on a tainted field.**

## Determinism audit (P5)

- Every proceed/stop branch reads **only** exit codes / path membership: `check-plan-spec-agree.mjs` exit (Step 2), `check-regress.mjs scope` exit (Step 3), `check-regress.mjs verdict` exit (Step 5), the fix #7 setter/hook (Step 0). **No LLM classification drives any branch** — there is no "does this look broken" layer (the entire point: a flipped gate IS a regression).
- Terminal fallbacks are always a **question**, never a guess: an unresolvable base (detached/shallow/no merge-base) → ask for `--base`; an ambiguous `<name>` → ask; a project with **no discoverable deterministic suite** → ask the human (see OQ1); a broken chain / escaped path → the helper's clear RED with re-plan/re-approve guidance.

## Decisions (resolved at GATE 1 — 2026-06-30; no open questions remain)

Both questions were resolved by the human at the plan-acceptance gate, each as the recommended option. Recorded here so the plan carries **no unresolved `## Open questions (HALT)`** into `/pharn-dev-build`.

- **OQ1 (RESOLVED) — How `/pharn-regress` runs "the user's suite" over outside-scope, generically → "Mirror dev-regress, generalized".** The command (a) **deterministically discovers** the project's gates (test / lint / type-check) from the project's manifest (e.g. `package.json` scripts — a membership test, P5), accepts an explicit `--gates` override, and if **no** deterministic suite is discoverable → **asks the human** (terminal fallback, never a guess); (b) partitions via `check-regress.mjs scope` so **file-addressable tests run over OUTSIDE files only** (inside excluded → an inside-test flip is correctly NOT a regression); (c) runs **whole-repo gates** (lint / type-check) identically at base and head with the config-touch skip and a **named granularity limit** (repo-granular); (d) feeds exit codes to `check-regress.mjs verdict`. In PHARN's own dogfood the discovered suite is exactly `npm test` / `validate` / `check-structural` (as `features/ship-gated/regression-report.json` shows). The rejected alternative (whole-suite gates only) is coarser and would misclassify an inside-test failure as a regression.

- **OQ2 (RESOLVED) — Spec→plan hash-chain re-check at the regress stage (a THIRD consumer after grill + build) → "Yes — re-check the chain".** Consistent with the product pipeline (grill = first consumer, build = second), and load-bearing here: `/pharn-regress` derives the inside/outside **scope boundary** from the PLAN's `## Files`, so the boundary is only trustworthy if the plan is current — if the spec drifted since build, the plan (and its `## Files`) may be stale and the partition wrong. Re-checking the chain (`check-plan-spec-agree.mjs`) keeps the boundary honest. RED chain → write a RED-chain `REGRESSION.md` (audit trail never silent) + HALT (re-plan / re-approve).
