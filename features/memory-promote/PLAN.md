# PLAN — memory-promote (provenance-gated promotion mechanism)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read live this run)
- increment: Add `/memory-promote` — a command that ASSEMBLES + VALIDATES + GATES a lesson/pattern promotion to canon, plus the deterministic `floor/check-provenance.mjs` that makes the provenance + duplicate-ID part floor-grade. It does NOT decide what is canon: it prepares a candidate and HALTS for explicit human accept/deny.
- layer(s): tooling — `.claude/commands/` (base command, conceptually pharn-core per ARCHITECTURE.md §4) + `floor/` (the deterministic floor). Both are this repo's own dev tooling, which the floor's capability count deliberately ignores (CLAUDE.md). No new `pharn-*` capability — floor count stays 1.
- constitution_refs: [P0, P2, P4, P5, P6, P7]

## What this is (and is NOT)

- **Automates the MECHANICS** of promotion: assemble the entry, capture provenance, validate shape, detect duplicate IDs, set the fix-#7 writes-scope to the one canon file, render the candidate, write **only on explicit human accept**.
- **Does NOT automate the DECISION.** The model never self-promotes. Whether a lesson is true / general / worth canonizing is the human's call (advisory). The command mirrors `/plan`'s approval gate: prepare → show → HALT for accept/deny.
- **NOT a Capability** (no `role:`). It follows the `regress.md` / `verify.md` precedent: an orchestration command paired with a deterministic `floor/check-*.mjs` that owns the floor verdict.

## Files

- `.claude/commands/memory-promote.md` — the command the agent executes (frontmatter w/o `role:`, matching regress/verify); orchestrates assemble→validate→render→HALT→write. — layer tooling (pharn-core base command)
- `floor/check-provenance.mjs` — deterministic, stdlib-only checker: mandatory-provenance presence + shape (enum/regex), duplicate-ID detection (set-membership over the target canon file), target-file enum membership. Exit 1 on any RED, 0 + GREEN otherwise. Mirrors `floor/check-structural.mjs` shape. — layer floor
- `floor/check-provenance.test.mjs` — `node --test` suite for the checker (the checker's regression proof; repo convention — every `floor/check-*.mjs` ships one). — layer floor
- `CHANGELOG.md` — add an `[Unreleased] → Added` entry for the command + checker (L1 meta-doc sweep). — root meta-doc
- `CLAUDE.md` — add `check-provenance.mjs` to the floor-commands list and correct the live test-suite/test count to reflect the new 8th suite (L1 meta-doc sweep; correcting the count also fixes the pre-existing 3-suite/"11 tests" drift discovered this run). — root meta-doc

### Explicitly **not** touched

- `CONSTITUTION.md`, `ARCHITECTURE.md`, `THREAT-MODEL.md`, `LIMITS.md`, `CODEOWNERS` — trusted/human-only (hook-protected). ARCHITECTURE.md §5 already names this exact gate; **no spec edit** is needed (see Spec-reconciliation note).
- `memory-bank/lessons-learned.md`, `memory-bank/pattern-library.md` — these are the command's **runtime** targets, written only when the command is _run_ on a real candidate (gated). They are **not** written by this build increment (no speculative canon — P7).
- `pharn-*/**`, `floor/validate.mjs` — untouched; no new capability, no change to the validator.

## Contracts satisfied (cite, don't restate — P4)

- **ARCHITECTURE.md §5 (lines 189–190)** — "Promotion of a lesson/pattern to canon is a **gated** action with provenance per entry (which run / feature / diff)." `check-provenance.mjs` is the floor reduction of _"provenance per entry"_; the fix-#7 write-gate is the floor reduction of _"gated write"_. The command realizes §5's mechanism without restating it.
- **THREAT-MODEL.md §2 #3 / §3 (memory-poisoning row)** — "promotion to canon is a gated write with per-entry provenance | pre-write hook." This increment makes that row operational (the deliberate writes-scope declaration IS the gate, by design).
- **ARCHITECTURE.md §8 / fix #1 (finding-shape split)** — applied by analogy: the checker's verdict ranges ONLY over floor-verifiable fields (provenance shape, ID); the free-text lesson body is DATA, never gates.

## Spec-reconciliation note (P6)

ARCHITECTURE.md §5 + THREAT-MODEL.md §3 name the **pre-write hook** as the floor primitive for memory-poisoning, with "provenance per entry" as a required attribute. `check-provenance.mjs` adds a second, composable floor op — a primitive-#3 (enum/regex/presence) reduction of "provenance per entry." This is **domknięcie** (tightening an existing contract to its floor), like `check-structural.mjs` did for `eval-format`'s `structural[]` — **not** a new spec claim. No trusted-doc edit is required. (If a reviewer reads §5 as naming _only_ the hook, that is the one reconciliation point — flagged here, not silently assumed.)

## Behaviour of `floor/check-provenance.mjs` (the floor part)

Input: `node floor/check-provenance.mjs <candidate.json> <canon-file.md>`

- `<candidate.json>` (assembled by the command into `.pharn/` scratch): `{ target, id, provenance: { feature, commit, source, date } }` (+ free-text `title`/`body` which the checker IGNORES).
- Deterministic checks (each a membership/regex test — P5; any failure → RED, exit 1):
  1. `target` ∈ {`memory-bank/lessons-learned.md`, `memory-bank/pattern-library.md`} (Q1 resolved: the two prescription files).
  2. every mandatory provenance field present + shape-valid (Q2 resolved): `feature` (non-empty), `commit` (`^[0-9a-f]{7,40}$`), `source` (non-empty), `date` (`^\d{4}-\d{2}-\d{2}$`).
  3. `id` does NOT already appear as a `## <id>` heading in `<canon-file>` → duplicate-ID is RED. **Expected heading format:** the checker reads each line matching `^##\s+(\S+)` and takes the **first whitespace-delimited token** after the `##` marker as the id (so `## L1 — title` → `L1`), which is exactly the format `memory-bank/lessons-learned.md` (and the future `pattern-library.md`) use today. This format is a **coupling**: if either canon file ever adopts a different entry structure (e.g. ids on a metadata line, or multi-word ids), `check-provenance.mjs` **and this documentation must be updated together** — the parser is the contract.
- Pure Node stdlib (no network, no `child_process`, no `eval`) — matching `check-structural.mjs`. The real commit SHA is captured by the _command_ via `git rev-parse HEAD` (deterministic bash); the checker validates its **shape**, not its existence.
- Semantic contradiction (candidate contradicts an existing entry) is **advisory** — surfaced for the human, never auto-resolved (P5 terminal fallback = ask).

## Command flow (`/memory-promote`) — mirrors /plan's gate

1. **Step 0 — set writes-scope** to the ONE target canon file: `set-writes-scope.cjs --from-frontmatter .claude/commands/memory-promote.md --target <canon-file>`. The deliberate act of declaring `memory-bank/<file>` IS part of the P2 gate (by design, fix #7).
2. **Discovery (P6)** — read the target canon file live (existing IDs), read `features/<name>/REVIEW.md` (the lesson is typically _proposed_ there), capture `git rev-parse HEAD`.
3. **Assemble** the candidate: model may DRAFT the body; provenance is assembled **deterministically** (commit from git, feature/source from the increment ref, date = today). Compute the next ID **per target** — the prefix is keyed to the target canon file (`lessons-learned.md` → `L<N>`, `pattern-library.md` → `P<N>`), and `<N>` is the max existing `<prefix><N>` heading in **that file** + 1. IDs are **unique within each file's own namespace** (per-file, not global — see the Guarantee-audit duplicate-ID row): `L1` in lessons and `P1` in patterns are independent. The Step-4 `check-provenance.mjs` duplicate check enforces exactly this per-file namespace (set-membership over `## <id>` headings in the single target file).
4. **Validate (floor)** — run `floor/check-provenance.mjs`. Any RED → **HALT and refuse** (do not write).
5. **Render + HALT (the human gate)** — show the full candidate + provenance and ask, via the interactive form, **accept / deny**. Write to canon **only on explicit accept**. The model NEVER writes without it.
6. **Write** — on accept, append the entry to the (scope-permitted) canon file; on deny, discard. End turn.

## Evals to write (P1)

- Not a `role:` Capability → no `evals/` dir (P1 governs Capabilities). The floor checker's regression proof is its `node --test` suite (the regress/verify precedent), covering:
  - `check-provenance` → candidate missing each mandatory provenance field → RED (one case per field).
  - `check-provenance` → malformed `commit` / `date` shape → RED.
  - `check-provenance` → `id` already present in canon file → RED (duplicate).
  - `check-provenance` → `target` not in allowed enum → RED.
  - `check-provenance` → fully-valid candidate, unique id → GREEN (exit 0).
  - `check-provenance` → free-text body containing an instruction-looking needle does NOT affect the verdict (P2: body is ignored).

## Guarantee audit (P0) — the honest split

- **"Every promoted entry carries valid, well-shaped provenance"** → **floor**: enum/regex/presence (`check-provenance.mjs`, primitive #3). A candidate missing/malforming a mandatory field is REJECTED deterministically before any write.
- **"No duplicate-ID entry enters _the target_ canon file"** → **floor**: set-membership over existing `## <id>` headings in the **single** `<canon-file.md>` passed to `check-provenance.mjs`. Scope is **per-file, not global** — each canon file has its own ID namespace keyed to a per-target prefix (`lessons-learned.md` → `L<N>`, `pattern-library.md` → `P<N>`), so `L1`/`P1` are independent and the same number may legitimately recur across files; this is **not** a cross-file uniqueness guarantee, and does not need to be (the `Assemble` step computes the next ID per-target within the target file, and the write lands in exactly one declared file).
- **"The write lands only in the declared canon file"** → **floor**: the fix-#7 pre-write hook (`enforce-writes-scope.cjs`) denies any out-of-scope write; memory-bank/\*\* is fail-closed until explicitly declared.
- **"The human approved THIS specific entry" (halt-for-accept/deny)** → **advisory / procedural**, NOT floor. The floor cannot verify a human said "yes"; the halt is an instruction the model follows. Backstopped by the two floor ops above (a self-promoted entry would still need valid provenance + land only in the declared file) — but **unwise-but-well-formed** content is caught only by the human gate, not the floor.
- **"The lesson is true / general / worth canonizing"** → **advisory / human**. The command does NOT judge worth.
- **The honest claim:** this command guarantees _no entry without valid provenance, and no write outside the declared canon file_ (floor). It does **NOT** guarantee the lesson is correct, wise, or even human-approved (those are advisory/procedural). "memory-promote promoted it" must NEVER read as "therefore the lesson is sound" — that is the P0 disease.

## Trust audit (P2) — taint propagation

- **Input:** the candidate lesson **body** is free text, often derived from a `features/<name>/REVIEW.md` whose findings inherited `trust: untrusted` from reviewed code (§8, fix #1). It is therefore **untrusted**.
- **Propagation:** the body is written into canon as **DATA** (human-readable markdown), never injected downstream as instructions. Future sessions read `lessons-learned.md` as untrusted memory content (THREAT-MODEL §2 #3) — DATA, not steering instructions.
- **Gate isolation:** `check-provenance.mjs` ranges ONLY over floor-verifiable fields (provenance shape, ID set-membership, target enum) — **never** over the free-text body. No guaranteed decision rests on a tainted field (mirrors fix #1). The body's correctness is the human's advisory accept/deny.

## Determinism audit (P5)

- Every branch in `check-provenance.mjs` is a membership/regex/presence test; no LLM classification drives the gate.
- The terminal fallback for "is this lesson worth canon?" is **ask the human** (the accept/deny halt), never a model guess.
- Semantic contradiction with existing canon is surfaced advisory → human resolves; never auto-merged.

## Decisions (resolved via interactive form, 2026-06-26)

1. **Canon-file scope (Q1) → lessons + patterns.** `/memory-promote` targets `memory-bank/lessons-learned.md` and `memory-bank/pattern-library.md` only. `pattern-library.md` is created on the first _real_ pattern promotion (not by this build — P7). `feature-catalog.md` / `architecture-context.md` are out of scope.
2. **Provenance schema (Q2) → feature + commit + source + date.** `check-provenance.mjs` requires: `feature` (non-empty), `commit` (`^[0-9a-f]{7,40}$`, the real SHA captured by the command via `git rev-parse HEAD`), `source` (non-empty — the surfacing `REVIEW.md` path / finding IDs = §5 "diff"), `date` (`^\d{4}-\d{2}-\d{2}$`). No `arch_sha256` pin for lessons.
3. **Meta-doc sweep (Q3) → CHANGELOG + CLAUDE.md.** Add a `CHANGELOG.md [Unreleased]` entry and update `CLAUDE.md` (floor-commands list + correct the live test count). Correcting the count also remedies the pre-existing 3-suite/"11 tests" drift found in discovery.

## Open questions (HALT)

- None remaining — all three resolved above. Awaiting plan approval.
