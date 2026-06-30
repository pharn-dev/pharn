# PLAN — review-scope-tighten (probe integration finding #2)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (SHA-256 of ARCHITECTURE.md, this run)
- increment: Tighten `/review`'s declared `writes:` so its resolved writes-scope is exactly its one real output (`features/<name>/REVIEW.md`) — removing the spurious `memory-bank/lessons-learned.md (gated)` entry that lets the fix #7 hook permit `/review` to write canon directly, bypassing `/memory-promote`'s `check-provenance` + human gate.
- layer(s): tooling — `.claude/commands/` (advisory orchestration) + `.claude/hooks/` test (the fix #7 floor's own suite). NOT a PHARN product layer; `floor/validate.mjs` deliberately ignores `.claude/`, so the capability count is unchanged.
- constitution_refs: [P0, P2, P5, P6, P7]

## Investigation result (why this is a real bug, not a false alarm)

The probe finding (`features/pipeline-integration-probe/REVIEW.md:101-114`, P0/important) is **confirmed**:

- **The second path is `memory-bank/lessons-learned.md`.** Origin: `review.md:8`
  `writes: ["features/<name>/REVIEW.md", "memory-bank/lessons-learned.md (gated)"]`. The setter's
  `clean()` strips the `(gated)` annotation and the bare path passes `isConcrete()`, so it is emitted
  verbatim → `writes-scope set: 2 path(s)`. **Cause = `/review`'s own declaration, NOT the
  `set-writes-scope.cjs` extractor** (the #15 fix is correct and untouched here).
- **`/review` writes exactly ONE artifact — `REVIEW.md`.** Its final step (`review.md:102-109`) says
  _propose_ a lesson "via a **gated** promotion … do not write canon silently (P2)" — it proposes,
  never writes. The probe's own `REVIEW.md:116-139` demonstrates this live: "**NOT written to canon
  here** … `/memory-promote` … halts for explicit human accept/deny before any write."
- **`/memory-promote` is the dedicated canon writer** (`memory-promote.md:16,61-80`): it declares
  `writes: ["memory-bank/<canon-file>"]`, sets its own scope, runs `check-provenance.mjs`, and gates
  on human accept. **`/build` proves the correct pattern** — it also proposes gated lessons but its
  `writes:` (`build.md:8`) does **not** list memory-bank at all.
- **Grep this run:** `/review` (review.md:8) is the **only** command over-declaring canon in `writes:`;
  `/memory-promote` declares it deliberately (correct). So fixing `/review` removes the one known
  non-gated canon-write path.

Verdict: the second path is **spurious**. Tighten it. (Not the HALT-and-confirm case: `/review` does
not legitimately write two artifacts.)

## Files

- `.claude/commands/review.md` — **EDIT.** (1) `writes:` (line 8) → `["features/<name>/REVIEW.md"]`
  only. (2) Step 0 prose (lines 29-31, 37-39): drop the "plus `memory-bank/lessons-learned.md` when a
  lesson is gated" clause and the now-stale "(the trailing `(gated)` annotation is stripped)"
  parenthetical; state `/review` declares no `memory-bank/**` and a gated lesson is written only by a
  separate `/memory-promote` run (P2). (3) Final-step prose (lines 102-109): clarify the proposal is
  recorded in `REVIEW.md` and the actual write is a separate, human-gated `/memory-promote` run — same
  axis. Layer: tooling (`.claude/commands/`, floor-ignored).
- `.claude/hooks/enforce-writes-scope.test.cjs` — **EDIT.** ADD one regression test that runs the
  setter `--from-frontmatter` against the **real** `.claude/commands/review.md` (resolved to a sample
  `--target`) and asserts the resolved scope is **exactly** `["features/<sample>/REVIEW.md"]` and does
  **not** include `memory-bank/lessons-learned.md`. Layer: tooling (fix #7 suite).

### Explicitly not touched (declared NOT written — must NOT enter scope)

- `.claude/hooks/set-writes-scope.cjs` — the extractor is correct (hardened in #15); the cause is
  review's declaration, not the setter.
- `.claude/hooks/enforce-writes-scope.cjs` — the guard is correct.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — trusted docs (hook-denied).
- The existing synthetic-fixture setter tests (review-like fixtures in temp dirs) — they test the
  setter mechanics, not the real command; they keep passing unchanged.

## Contracts satisfied

- No `pharn-contracts` schema changes. This increment aligns a command's declared `writes:` with the
  fix #7 contract (CLAUDE.md "Writes-scope": `memory-bank/**` is fail-closed, writable only when a
  command's `writes:` declares it) — and `ARCHITECTURE.md §5`'s "promotion = **gated** action with
  **provenance per entry**", whose floor reduction (`check-provenance.mjs` + the fix #7 hook) lives in
  `/memory-promote` only (cited, not restated — P4).

## Evals to write (P1)

- This increment touches **tooling**, not a product Capability (review.md is a command — `role: lens`
  — but `floor/validate.mjs` ignores `.claude/`, so it is not a counted capability and ships no
  product evals). Its spec/regression is the deterministic **test**, consistent with how the floor and
  hooks are themselves specified by `*.test.{mjs,cjs}`:
  - `enforce-writes-scope.test.cjs` → real `commands/review.md` + `--target features/<sample>/REVIEW.md`
    → resolved scope `deepEqual ["features/<sample>/REVIEW.md"]` (one path) **and**
    `!scope.includes("memory-bank/lessons-learned.md")`. **Fails today** (2 paths), **passes after** the
    review.md edit — the regression guard the finding asks for.

## Guarantee audit (P0)

- "After the fix, `/review`'s resolved writes-scope = exactly `[features/<name>/REVIEW.md]`, and the
  pre-write hook denies `/review` any other write (incl. canon)." → **FLOOR**: enum/regex — the setter
  parses `writes:` deterministically (P5); the fix #7 pre-write hook (`enforce-writes-scope.cjs`) denies
  out-of-scope writes, with `memory-bank/**` fail-closed. Pinned by the new test.
- "Canon (`memory-bank/lessons-learned.md`) is writable only through `/memory-promote`'s
  provenance-checked + human-gated path." → **FLOOR for `/review` specifically** (its scope no longer
  includes canon → hook denies). **ADVISORY at the system level** — exactly as the probe finding states
  ("the provenance gate is advisory … not floor-composed"): nothing yet floor-enumerates _every_
  command's `writes:`. This increment closes the **one known** leak (`/review`, grep-confirmed the only
  over-declarer besides the legitimate `/memory-promote`); it does **not** claim the broader
  system-level guarantee (P0 — no floor reduction for "no future command over-declares"; P7 — adding a
  command-frontmatter linter is a _different_ axis, not built here). See "Out-of-scope follow-up".
- "Existing fix #7 suite + floor stay green." → **FLOOR**: `npm test` (validate/enforce+setter/
  structural/variance/verify/provenance/regress/count-verifiers) and `node floor/validate.mjs .` →
  GREEN, 1 capability. `/build` re-runs the floor and halts on RED.

## Trust audit (P2)

- The increment ingests **no untrusted artifact** — it edits two trusted tooling files
  (`commands/review.md`, a hook test). No new taint path is introduced.
- It **reduces** memory-poisoning surface (THREAT-MODEL.md §2 #3, "write-once-influence-forever",
  silent + cumulative): removing `/review`'s non-gated canon-write path keeps the untrusted lesson
  _candidate body_ behind `/memory-promote`'s `check-provenance` + human accept — no guaranteed canon
  write rests on a path that skips the gate.

## Determinism audit (P5)

- Scope is **parsed** from `writes:` by the setter — no model chooses it. The new test asserts the
  deterministic output (set-equality). No branch is added. The terminal fallback for "promote this
  lesson?" remains the human accept/deny in `/memory-promote` (a question, never a guess).

## Out-of-scope follow-up (P7 — recorded, NOT built here)

- A floor check enumerating _every_ `.claude/commands/*.md` `writes:` and failing if any command other
  than `/memory-promote` declares a `memory-bank/**` path would convert the system-level "no command
  writes canon ungated" from advisory to floor. It is **a different axis** (a new enforcer) and is
  triggered by this same real failure (P7-eligible), but it is **not** this increment. Note it; do not
  build it under this plan.

## Resolved decisions (approval gate, this run)

- **Prose-edit extent** → **Include the final-step clarification (3).** `review.md` gets all three
  edits: (1) `writes:` → single path, (2) Step-0 consistency prose, (3) the tight final-step
  clarification routing the canon write to a separate `/memory-promote` run. (Human selection at the
  approval gate; matches the `## Files` description as written.)
- **Plan approval** → **Approved as written.** Ready for `/build`.

## Open questions (HALT)

- None — resolved above this run.
