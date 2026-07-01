# PLAN — root-apparatus-cleanup (remove the #19-splice pre-split leftovers)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, this run)
- increment: Delete the pre-split apparatus originals that PR #19 (the `.dev/` split) left at the repo root — the drifted `floor/check-ship.*` duplicate, the identical `features/ship-{loop,gated}/` build-trace duplicates, and the stale un-prefixed `ship.md` command that is the only live invoker of the root floor copy — so ALL apparatus lives under `.dev/` (or the `pharn-dev-`/`pharn-` prefix) and root holds product only.
- layer(s): none — this is a **deletion-only** increment over build apparatus (`.dev/`-destined tooling + `.claude/commands/`). No product layer (`pharn-contracts`/`pharn-core`/…) is touched. No new files; no edits to any live file. # ARCHITECTURE.md §4
- constitution_refs: [P0, P3, P6, P7]

## Context (discovered live this run — P6)

Git provenance proves one root cause. **PR #18** (`83a446c` "ship-gated: add gated /ship pipeline
orchestrator") added, at the then-flat root: `.claude/commands/ship.md`, `floor/check-ship.{mjs,test.mjs}`,
`features/ship-gated/`, `features/ship-loop/`. **PR #19** (`2e773b9` "…dev-product-boundary…the `.dev/`
split") created the relocated + upgraded successors — `pharn-dev-ship.md`, `.dev/floor/check-ship.{mjs,test.mjs}`,
`.dev/features/ship-{gated,loop}/` — but **failed to delete the pre-split originals**. Those originals are
the four artifacts below. This cleanup is triggered by a real, documented audit finding — prior traces
already flag it as pending debt (`.dev/features/build-stage/SHIP.md:38`, `.dev/features/product-pipeline-probe/PROBE.md:126`
CF-D, `.dev/features/ship-stage/SHIP.md:50`) — so it is **not speculative** (P7).

Live deltas vs. the task description (both surfaced for approval, below):

1. **root `floor/check-ship.mjs` is NOT orphaned.** `.claude/commands/ship.md` invokes it (`floor/check-ship.mjs`
   at lines 10/171/202/204/227). `ship.md` is the **only bare command** in `.claude/commands/` (no bare
   `plan`/`build`/`verify` exist) and the **only live invoker** of the root floor copy; every other reference
   is a frozen `.dev/features/*/` trace. `pharn-ship.md` only _mentions_ `.dev/floor/check-ship.mjs` in a note
   (no invocation). So deleting root `floor/` **forces** a decision on `ship.md` — leaving it would create a
   dangling command. `ship.md` is the superseded pre-#19 original of `pharn-dev-ship.md` and additionally
   references non-existent bare sibling commands (`/plan`, `/build`, `/review`) → already non-functional.
2. **root `features/ship-loop/` is byte-identical** to `.dev/features/ship-loop/` (`diff -rq` exit 0), and
   **root `features/ship-gated/` is byte-identical** to `.dev/features/ship-gated/` (`diff -rq` exit 0). So both
   are **deletes of exact duplicates**, not "moves" — the canonical copies already exist under `.dev/`.

Baseline (live): `node .dev/floor/validate.mjs .` → **GREEN — 2 capabilities**; canonical `npm test` →
**179 pass, 0 fail** (the stale root `floor/check-ship.test.mjs` = 12 of those tests; its `.dev/` superset =
16 tests, containing all 12 + 4 extra fail-closed argv tests).

## Files

**Deletion-only. No writes, no edits to live files.** Removed via `git rm` (deletion is not a
`Write|Edit|MultiEdit`, so neither the trusted-path hook nor the fix #7 writes-scope hook gates it; the
scope-setter still runs per stage).

- **DELETE** `floor/check-ship.mjs` — drifted stale duplicate of `.dev/floor/check-ship.mjs` (live copy untouched).
- **DELETE** `floor/check-ship.test.mjs` — stale duplicate test; then remove the now-empty root `floor/` dir.
- **DELETE** `features/ship-loop/` (6 files) — byte-identical dup of `.dev/features/ship-loop/`.
- **DELETE** `features/ship-gated/` (6 files) — byte-identical dup of `.dev/features/ship-gated/`.
- **DELETE** `.claude/commands/ship.md` — stale pre-#19 `/ship`; superseded by `pharn-dev-ship.md`; sole live
  invoker of root `floor/check-ship.mjs`.

**Not touched (frozen historical record — decision below):** all `.dev/features/*/` traces that mention
`floor/check-ship.mjs` (e.g. `.dev/features/ship-loop/*`) stay verbatim — they record the repo state _at the
time each increment was built_; retro-editing their paths to `.dev/floor/` would falsify the audit trail.
Root `features/README.md` stays (it declares the product-loop home; after removal, root `features/` = README only).

## Contracts satisfied

- None. No `pharn-contracts` schema is added or consumed — this is apparatus deletion, not a capability. (P4 n/a.)

## Evals to write (P1)

- None **added**. P1 binds `role:`-bearing Capabilities; nothing here has a `role:` (a command `.md`, floor
  `.mjs` helpers, and trace artifacts are not Capabilities — `validate` excludes `.claude/commands/` and
  `.dev/`). The **existing** proof for the surviving stop-core is `.dev/floor/check-ship.test.mjs` (16 tests),
  which is a strict superset of the deleted root test — real coverage is retained, only the duplicate run drops.

## Guarantee audit (P0)

- "root `floor/check-ship.mjs` is a stale duplicate, `.dev/` is the live copy" → **floor: content-hash** (`diff`
  proved DRIFT; git log proves `.dev/` is the #19 successor; `pharn-dev-ship.md` invokes `.dev/`, `ship.md` invokes root).
- "root `features/ship-{loop,gated}/` are exact duplicates → deletable without loss" → **floor: content-hash**
  (`diff -rq` exit 0 against the `.dev/` canonical copies).
- "the boundary is clean after this" (root = product only; all apparatus under `.dev/`/prefix) → **advisory**
  (a structural claim `validate` does not encode as a rule; backstopped by `validate` staying GREEN + `npm test`
  green, both re-run by build/regress/verify).
- "coverage unchanged; `npm test` stays green" → **floor: enum/exit-code** — `npm test` exit 0 re-verified at
  verify; count drops 179 → **167** (−12 duplicate) with the 16-test `.dev/` superset retained.
- "`validate` stays GREEN — 2 capabilities" → **floor: enum-check** — no deleted file carries `role:`; re-run at build.

## Trust audit (P2)

- The `.dev/features/*/` trace files and `ship.md` read during discovery are `trust: untrusted` DATA; they were
  read to _locate/count_ references (a membership/path test), never executed as instructions. No untrusted free
  text steers this plan. No new untrusted ingestion is introduced.

## Determinism audit (P5)

- Every "duplicate?"/"which is live?" branch is a deterministic membership test (`diff` exit code, `git log`
  provenance, `grep` of the invoking path), not classification. The one genuinely non-mechanical choice — **how
  far the cleanup should reach** (task named 2 of 4 same-axis artifacts) — is not guessed: it terminates in
  **ask the human** (OQ-1, below).

## Open questions (HALT)

- None remain. Both were resolved at the GATE-1 human approval this run:
  - **OQ-1 — scope reach → RESOLVED: (A) Complete cleanup.** Delete all four #19 leftovers — root `floor/`
    (both files + dir), `features/ship-loop/`, `features/ship-gated/`, and stale `ship.md`. This is the scope
    reflected in `## Files` above. End state: root `features/` = README only; `.dev/` = sole apparatus home;
    `pharn-dev-ship.md` = sole ship orchestrator.
  - **OQ-2 — frozen traces → RESOLVED: leave frozen.** No `.dev/features/*/` trace is edited (historical record).
