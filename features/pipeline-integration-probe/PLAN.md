# PLAN — pipeline-integration-probe (first full-pipeline end-to-end run)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches features/regress/PLAN.md:3 (no drift)
- increment: push ONE trivial throwaway feature (a pure floor helper + its hermetic test) through the full pipeline `/plan → /grill → /build → /regress → /verify → /review`, then `/memory-promote` one lesson — to **prove the chain integrates end-to-end** and to give `/verify` and `/memory-promote` their **first LIVE runs**. The feature is a **vehicle**; the deliverable is a **measured chain run with every hand-off observed**, not the feature.
- layer(s): the built artifact lives in `floor/` (floor/eval **infrastructure** — NOT a Capability, no `role:`; `floor/validate.mjs:30` path-ignores `floor/`, so the capability count stays **1**), exactly like `floor/check-verify.mjs` / `floor/check-regress.mjs`. The probe *exercises* `.claude/commands/` (advisory orchestration) + the fix #7 writes-scope hooks. # ARCHITECTURE.md §4
- constitution_refs: [P0, P1, P2, P5, P6, P7]

---

## Step 0 — Discovery results (live this run, P6 — never asserted from memory)

**The two gaps this run targets, confirmed on disk (not speculation):**

- **GAP 1 (authored ≠ live).** `floor/check-verify.mjs` + `floor/check-provenance.mjs` have **only** hermetic unit tests (`floor/check-verify.test.mjs`, `floor/check-provenance.test.mjs`, both green under `npm test`). Neither stage has ever run on a real case — see GAP 2's disk evidence. This is the `L4` disease at the stage layer: *an authored fixture passes by construction; a live run is the only proof.*
- **GAP 2 (links tested, chain never run).** `find features -type f` shows **every** feature dir contains only `PLAN.md` + `REVIEW.md` (trust-fence additionally `findings.json` / `NOTES.md`). There is **no `GRILL.md`, no `REGRESSION.md`, no `regression-report.json`, no `VERIFY.md`, no `verify-report.json`, and no `build-summary.json` anywhere in the repo.** So `/grill`, `/regress`, `/verify` have never emitted a live artifact, and the chain has never run as one chain. Integration is currently an **assumption**.

**State that shapes the run (read live):**

- **Floor GREEN — 1 capability** (`node floor/validate.mjs .` → `FLOOR: GREEN — 1 capabilities checked in .`). `floor/validate.mjs:30` (`EXCLUDE_SEGMENTS`) path-ignores `.claude/commands/`, `floor/`, `node_modules/`, `.git/`. ⇒ a feature in `floor/` is **invisible to `validate`**; the floor stays GREEN trivially and the per-feature correctness signal is `npm test` (which collects `floor/*.test.mjs` via `package.json:28`'s glob).
- **Spec hash matches** the live recompute and the most-recent pin (`features/regress/PLAN.md:3`) → no drift; `/build` re-verifies (fix #4).
- **Live git state (P6), drives the `/regress` base rule:** working tree **clean**, on `main`, `HEAD = 3cf6a2f`, and `git merge-base HEAD origin/main = 3cf6a2f` (= HEAD). So `/regress`'s auto-detect resolves base = `HEAD` **only when the tree is dirty**; a clean tree resolves base = `merge-base = HEAD` → empty `inside` (useless). The run therefore uses the **dirty-tree dogfood flow** (commit discipline below).
- **Zero verifiers registered (P7).** No capability declares `role: verifier` in *frontmatter*. (`grep -rl 'role: verifier'` returns 3 files — `.claude/commands/verify.md`, `features/verify/{PLAN,REVIEW}.md` — but all 3 are **prose**, not capability frontmatter; the precise membership per `floor/validate.mjs`'s parser is **0**.) ⇒ `/verify` runs **floor-gates-only** and is fully runnable today.
- **Canon ids are `L1`–`L4`** (`memory-bank/lessons-learned.md`) ⇒ `/memory-promote`'s next id is **`L5`**; `floor/check-provenance.mjs` independently rejects a duplicate.
- **`/plan` frontmatter is `writes: ["features/<name>/PLAN.md"]`** (verified live — the `command-artifact-paths` re-alignment that `L3` prescribes has landed; the `[[writes-scope-guard-fix7]]` follow-up note is stale on this point). Step 0's setter resolved scope to exactly `features/pipeline-integration-probe/PLAN.md`.

---

## The feature (a VEHICLE — keep it trivial, P7)

A single pure helper mirroring the floor's existing 0/1/2 exit-code convention — small enough that `/build` is trivial, real enough that `/regress` / `/verify` have a deterministic gate to check:

- `floor/exit-label.mjs` — exports a **pure, deterministic** function `exitLabel(code)` mapping the floor's canonical exit codes to a label: `0 → "pass"`, `1 → "fail"`, `2 → "inconclusive"`, **any other integer or non-integer → `"unknown"`** (a defined terminal fallback, never a throw/guess — P5). Zero imports, no I/O, no network, no `claude -p`. Header comment states it is floor/eval **infrastructure, NOT a Capability**, and is a **throwaway integration probe scheduled for revert in a follow-up increment** (human-approved disposition, 2026-06-26).
- `floor/exit-label.test.mjs` — `node --test` hermetic proof: `exitLabel(0)==="pass"`, `(1)==="fail"`, `(2)==="inconclusive"`, `(3)==="unknown"`, `(-1)==="unknown"`, and non-integer inputs (`"0"`, `1.5`, `null`, `undefined`) `==="unknown"`. Collected by `npm test`'s glob; no `claude -p`.

**This is not a Capability** (no `role:`), so P1's "no Capability ships without `evals/`" does not bind it; it ships its proof as a `*.test.mjs`, exactly like every other `floor/check-*.mjs` helper. **The feature makes no guarantee claim** → no P0 reduction is owed by the feature itself.

---

## The integration-probe protocol (the real deliverable — observe every hand-off)

Run each stage **with its real command, in order, no shortcuts**. At each hand-off record *what the stage emits* and *whether it is the shape the next stage consumes*. A mismatch (stage N emits X, stage N+1 expects Y) is a **real integration finding** — surfacing it is the point.

**Commit discipline (required — derived from `/regress` base-detection, P6):** `/regress`'s `scope` subcommand asserts `inside ⊆ declared (## Files)`, where `inside = git diff <base> + untracked`. The feature's own `PLAN.md` / `GRILL.md` are **not** in `## Files` (correctly — `/build` must not write them). To keep them out of `inside`, **commit `PLAN.md` after `/plan` and `GRILL.md` after `/grill`, and leave the `/build` output UNCOMMITTED** when `/regress` runs. Then dirty tree → base = `HEAD` → `inside = {floor/exit-label.mjs, floor/exit-label.test.mjs}` = `## Files` → no false escape. (See CF-1 below — this commit dependency is itself a candidate finding.)

| # | stage | sets writes-scope to | consumes | emits | hand-off check (verify live) |
|---|-------|----------------------|----------|-------|------------------------------|
| 1 | `/plan` | `features/<name>/PLAN.md` | trusted docs, live repo | this `PLAN.md` (+ `spec_content_hash`) | `## Files` parses to the 2 floor paths (so `/build --from-plan` scopes correctly) |
| 2 | `/grill` | `features/<name>/GRILL.md` | this `PLAN.md` | `GRILL.md` (advisory findings + advisory verdict) | grill **reads** PLAN, emits finding-shape objects, **does NOT block** (advisory) |
| 3 | `/build` | from PLAN `## Files` → 2 floor paths | this `PLAN.md`, live repo | the 2 floor files; conversational build note | scope unlocks `floor/**` (denied by default-safe-set); `validate` GREEN; **no `build-summary.json` file** (CF-3) |
| 4 | `/regress` | `regression-report.json`, then `REGRESSION.md` | PLAN `## Files`, git, `check-regress.mjs` | `regression-report.json` + `REGRESSION.md` | `inside` partitions to build output only (commit discipline); verdict = `no-regressions`; new test is `inside` → excluded from outside gates |
| 5 | `/verify` | `verify-report.json`, then `VERIFY.md` | PLAN, `check-verify.mjs` | `verify-report.json` + `VERIFY.md` | **FIRST LIVE /verify**: gates `{lint,test,validate}` all 0 → `verdict:"PASS"`; `verifiers:{registered:0,findings:[]}`; floor OWNS the verdict |
| 6 | `/review` | `features/<name>/REVIEW.md` (+ gated canon) | trusted docs, built increment | `REVIEW.md` (4 lenses, floor-gate vs advisory) | floor GREEN; treats increment as `untrusted`; **proposes** a lesson but **defers** promotion to step 7 |
| 7 | `/memory-promote` | `memory-bank/lessons-learned.md` (one file) | `REVIEW.md` / this run, `check-provenance.mjs` | one `L5` entry **after human accept** | **FIRST LIVE /memory-promote**: assembles candidate + provenance, `check-provenance` GREEN, **HALTS for human accept/deny**, writes only on accept |

**writes-scope across stages (the fix #7 propagation check).** Each stage re-runs its own Step 0 setter; the setter **overwrites** `.pharn/writes-scope.json` each time (global mutable state). Confirm: (a) every stage sets its own scope before writing; (b) a **stale** scope from a prior stage never blocks a legitimate next-stage write (the `[[writes-scope-guard-fix7]]` residual / the "this happened before" risk in `L3`). If a stale scope blocks a stage, that is a **real finding**.

**`/memory-promote` reject-path test (GAP 1, the failure branch).** Before (or alongside) the real `L5` candidate, run `floor/check-provenance.mjs` on a **deliberately malformed** candidate (e.g. missing the `commit` field, or `target` outside the enum) and confirm it exits **1 / RED** and the command **refuses to write** — proving the floor gate rejects, not only accepts.

---

## Files

> `## Files` is `/build`'s writes-scope source (fix #7): `/build` runs `set-writes-scope.cjs --from-plan` over the back-tick paths below; they become the only writable paths (plus `.pharn/**`). `floor/**` is **not** in the fail-closed default-safe-set, so each path must be listed here to be writable — which means this feature genuinely exercises scope-propagation (an un-set or stale scope would block the build). Every path is a concrete literal.

- `floor/exit-label.mjs` — **NEW.** The pure helper described above (`exitLabel(code)` → `pass|fail|inconclusive|unknown`). Floor/eval infrastructure, not a Capability. No guarantee claim; deterministic; zero deps.
- `floor/exit-label.test.mjs` — **NEW.** The hermetic `node --test` proof (the "evals" of the helper, in the floor-helper convention). Collected by `package.json:28`'s glob; no `claude -p`, no git, no network.

### Explicitly **not** touched (declared NOT written — keeps them out of build scope)

- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). Any doc-vs-impl gap this run finds (e.g. CF-3) is **reported for a human**, never agent-edited.
- `floor/validate.mjs`, `floor/check-*.mjs`, the hooks, `package.json`, `.claude/commands/*` — **unchanged.** The probe *invokes* the existing stages; it edits none of them. If a stage reveals its own bug (CF-1/CF-2), that fix is a **separate increment** (do not fix inline and muddy the integration test).
- `pharn-contracts/*` — cited, never edited (P4).
- The per-stage artifacts (`GRILL.md`, `REGRESSION.md`, `regression-report.json`, `VERIFY.md`, `verify-report.json`, `REVIEW.md`) and the `L5` canon entry are **run-time outputs of their own commands**, written under each command's own writes-scope — **not** `/build` deliverables, so they are not listed above.

---

## Contracts satisfied

- `ARCHITECTURE.md §6` (the pipeline spine `spec → plan → grill → build → regress → verify → ship` + its typed-artifact table) — this run is the **first end-to-end traversal** of that spine on one feature; it observes each row's artifact actually being produced and consumed. Cited, not restated (P4).
- `ARCHITECTURE.md §7` (fix #3, two gate kinds) — confirms live that `/verify`'s **floor-gate** owns the verdict and the (empty) verifier **advisory-gate** cannot flip it.
- `ARCHITECTURE.md §5` (gated promotion with per-entry provenance) — `/memory-promote` + `floor/check-provenance.mjs` exercised live.
- `floor/check-verify.mjs` / `floor/check-regress.mjs` precedent (by **pattern**, not import) — `floor/exit-label.mjs` is the same class: floor/eval infrastructure, deterministic, hermetic `*.test.mjs`, no `reads:` edge (P3).

---

## Evals to write (P1) — binds the helper's test, not a Capability

`floor/exit-label.mjs` is a floor helper (no `role:`, floor-ignored dir), so P1's Capability-evals rule does not bind it; it ships its proof in the same step (the spirit of P1):

- `floor/exit-label.test.mjs` (hermetic) → `node --test` proves the full mapping incl. the `unknown` terminal fallback for out-of-convention / non-integer inputs.
- **Floor check after build:** `node floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged — floor ignores `floor/`).
- **The real eval is the pipeline run itself:** the deliverable is the observed hand-off matrix above + the first live `/verify` (`verdict:"PASS"`, floor-gates-only) and first live `/memory-promote` (assemble → `check-provenance` GREEN → human gate → write `L5`), with any mismatch surfaced as a finding.

---

## Guarantee audit (P0) — state the deliverable honestly

- **"The pipeline integrates end-to-end on this feature, and `/verify` + `/memory-promote` run on live input"** → this run produces **evidence** (a measured chain run, every hand-off observed), **not a guarantee**. The only floor-grade facts it yields are the deterministic verdicts the stages themselves emit (`/regress` exit-code comparison, `/verify` exit-code threshold via `check-verify.mjs`, `/memory-promote`'s `check-provenance` + fix #7 hook). The *claim* "the chain integrates" is **advisory** — it is the first evidence the chain runs, not a proof it is bug-free.
- **The feature is meaningless by design.** This run does **not** make `floor/exit-label.mjs` a meaningful capability; it is a throwaway vehicle (P7). Writing "the pipeline is proven" or "verify passed therefore the feature is correct" would be the P0 disease — `/verify` certifies *only the named gates passed* (`check-verify.mjs`), nothing more.
- **What IS floor-grade in this run:** the writes-scope hook (fix #7) pinning each stage's writes; the `/regress` exit-code comparison; the `/verify` exit-code threshold; the `/memory-promote` provenance/duplicate-id check + the canon write-scope. Everything the *agent* does (sequencing the stages, choosing the feature, reading hand-offs) is **advisory orchestration**.

---

## Trust audit (P2) — taint flow through the chain (an observation target)

- **The feature ingests no untrusted input** (a pure integer→string function), so it introduces no new taint.
- **The probe OBSERVES taint handling at each stage:** `/grill` treats this `PLAN.md` as `untrusted` (its free-text findings inherit that tag); `/regress` + `/verify` verdicts read **only exit codes + paths** (never free-text) — confirm the verdict is provably independent of any tainted field (fix #1); `/memory-promote` treats the candidate **body** as `untrusted` DATA and `check-provenance` ranges only over enum-gated fields (target enum, provenance shape, id membership), never the body.
- **Named residual (`LIMITS.md §2`):** the `L5` lesson's free-text, once in canon, is read by future sessions as untrusted memory DATA — bounded (it gates nothing) but not zeroed. The promotion is human-gated precisely because memory poisoning is silent + cumulative (`THREAT-MODEL.md §2 #3`).

---

## Determinism audit (P5)

- The helper is **pure**: every branch is integer membership (`code === 0|1|2`) with a defined terminal fallback (`"unknown"`) — never a throw, never a guess, never LLM classification.
- The probe's stage branches are deterministic: `/regress` base auto-detect (git-state equality), scope partition (path-set membership), verdict (exit-code equality); `/verify` verdict (exit-code threshold); `/memory-promote` target (lesson→`lessons-learned.md`), id (next-after-max `L<N>`), provenance (regex/presence). The one irreducible judgment — *is the `L5` lesson worth canon?* — has its terminal fallback as the **human accept/deny halt**, never a model guess.

---

## Findings already surfaced by discovery (P6) — candidate integration findings, to confirm/refine during the run

These were found by **reading the command files against live state**, before running — exactly the "ambiguity worth raising before running" the run exists to surface. None blocks this plan; each is a candidate `/review` or `/memory-promote` lesson. **Any fix is a SEPARATE increment** (do not fix inline).

- **CF-1 — `/regress` scope-check conflates build output with pipeline artifacts.** `inside = git diff <base> + untracked` includes the feature's own `PLAN.md` / `GRILL.md` (and `/regress`'s own outputs on re-run), which are correctly **absent** from `## Files`; without the dirty-tree commit discipline they appear as `inside ⊄ declared` → a **false** blocking fix#7 "escape" finding that halts `/regress`. `regress.md` does not state this inter-stage commit dependency. *(Advisory; mitigated for this run by the commit discipline above.)*
- **CF-2 — `/verify` verifier-discovery example is imprecise.** `verify.md` Step 2's intent ("frontmatter declares `role: verifier`") is correct, but its illustrative `grep -rl 'role: verifier'` returns **3 prose matches** on the live repo, not 0. The verdict (floor-gates-only) is unaffected, but the discovery instruction would mislead an operator; it should be frontmatter-anchored membership, not a naive content grep. *(Advisory.)*
- **CF-3 — `build-summary.json` is spec'd but not emitted (and not consumed).** `ARCHITECTURE.md §6:208` names `build-summary.json` as `/build`'s artifact, but `build.md` writes no such file and no downstream stage reads it (`/regress` + `/verify` consume `PLAN.md` + git, not a build summary). The chain is **not** broken by its absence, but it is a doc-vs-impl gap. Since `ARCHITECTURE.md` is human-only, this is **reported for a human**, never agent-edited. *(Advisory.)*

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-26; "Approve as written")

1. **Feature vehicle** → **`floor/exit-label.mjs` + its hermetic test**, as written above (recommended option). Pure, mirrors the floor's 0/1/2 convention, exercises the `floor/**` writes-scope unlock, mirrors the `check-*.mjs` precedent. *Declined:* test-only (thinner /build artifact) and `features/**` doc change (does not exercise the scope-unlock).
2. **Post-run disposition** → **revert the feature in a follow-up increment** (recommended; cleanest P7 — the feature was only a vehicle, and a revert is its own one-axis increment). The helper's header comment records this. *Declined:* keep-it / decide-later.
3. **Approval** → **Approve as written.** Spec hash `11cd9ad5…` re-verified (no drift, fix #4). Ready for the chain to run, beginning with `/grill` on this `PLAN.md`.

> **RESOLVED & APPROVED (2026-06-26).** Next stage: `/grill features/pipeline-integration-probe/PLAN.md`. `/build` runs only after `/grill`, and only against this approved, un-drifted plan.
