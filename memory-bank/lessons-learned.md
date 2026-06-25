# Lessons learned

Canonical memory-bank state (`ARCHITECTURE.md §5`). Each entry is promoted by a **gated** `/review`
action and carries **provenance** (run / feature / diff); promotion to canon is never silent (P2). The
other three canonical files (`architecture-context`, `feature-catalog`, `pattern-library`) are created
when first needed, not speculatively (P7).

## L1 — `/plan` must scope the meta-docs an increment invalidates

**Lesson.** When an increment changes a fact asserted in a meta-doc — `CLAUDE.md` test/command counts,
`CHANGELOG.md`, the root `README.md` — `/plan` must name that meta-doc in its _Files_ list, or `/build`
ships stale canon (it writes only the files the plan names). Add a meta-doc sweep to the `/plan`
discovery step (P6): after scoping the built artifacts, ask _"which meta-docs state a fact this
increment changes?"_ and include them.

**Why it matters.** Stale canon in `CLAUDE.md` misleads every future session — it is injected as project
instructions; a missing `CHANGELOG` entry breaks the file's own "all notable changes are documented"
contract. The floor cannot catch this: `validate.mjs` does not scan meta-docs, so it is an advisory gap
that only `/review` surfaces — exactly how this lesson was found.

**Provenance.**

- feature: `structural-checker`
- diff: commit `0de6f7b` — added a third `node --test` suite (5 → 11 tests) and a new floor command,
  without updating `CLAUDE.md` or `CHANGELOG.md`.
- surfaced by: `features/structural-checker/REVIEW.md` — findings **F2** (`CLAUDE.md:60` asserted "5
  tests" vs live 11) and **F3** (missing `CHANGELOG` `[Unreleased]` entry).
- promoted: 2026-06-24 via gated `/review` (human-approved).

## L2 — A contract's honesty must travel with the artifact, and may cite only live floor ops

**Lesson.** When a `/build` amends a contract with a normative `MUST`, two checks must pass at
`/review`: (1) the PLAN's `## Guarantee audit (P0)` honesty (what is advisory vs floor-enforced) must
be written **into the artifact**, not just the PLAN — the PLAN is ephemeral, the contract is durable;
(2) any "enforced by `<floor op>`" phrase must cite an op that is **live**, verified by reading the
implementation this run (P6), not merely spec'd. A contract can faithfully cite the spec (P4) and
still import an unbacked guarantee when the cited floor op (at the time, fix #7 / the writes-scope
guard) is unimplemented.

**Why it matters.** This is the core P0 disease ("written in the contract" ≠ "guaranteed") reproduced
inside PHARN's own contracts. `validate.mjs` cannot catch it — it checks structure, not prose honesty
— so only `/review`, reading the live hook + validate.mjs, surfaces it. The remedy is a `/review`
sub-check: for every new `MUST`/"enforced by" in a contract, confirm a live floor reduction or an
explicit `advisory` label.

**Provenance.**

- feature: `structured-findings` (increment 3a)
- diff: `pharn-contracts/finding-shape.md` +21 lines (`## Emission — findings.json`).
- surfaced by: `features/structured-findings/REVIEW.md` — F1 (`finding-shape.md:45` MUST unlabeled)
  and F2 (`ARCHITECTURE.md:73` cites fix #7 writes-scope guard; `protect-trusted-paths.cjs` implements
  only fix #2). The cited gap (fix #7) has since landed — see L3.
- promoted: 2026-06-25 via gated `/review` (human-approved).

## L3 — Making a declarative field load-bearing requires re-auditing every existing declaration of it

**Lesson.** When an increment turns a previously-advisory declarative field (here `writes:`) into a
floor-enforced gate, the SAME increment must audit every existing value of that field against where the
workflow actually writes. A declaration that was harmless while advisory (`/review`'s
`writes: ["REVIEW.md"]`) becomes a guaranteed block the moment it is enforced and the real artifact
lives elsewhere (`features/<name>/REVIEW.md`): the guard then denies the correct path while permitting
nothing useful.

**Why it matters.** Fail-closed enforcement is only safe if the declarations it reads are already true.
Retrofitting enforcement onto a field that drifted from reality converts latent doc-vs-repo drift (P6)
into active, guaranteed friction — and the friction lands on the next operator, not the author.
`validate.mjs` cannot catch it (it checks structure, not declaration-vs-usage), so only `/review`,
running the new guard live, surfaces it. Remedy: a `/review` sub-check — when a field becomes
load-bearing, diff every declaration of it against actual usage in the same increment.

**Provenance.**

- feature: `writes-scope` (fix #7).
- diff: 9 files (3 new hooks/test + 6 edits); `protect-trusted-paths.cjs` byte-unchanged.
- surfaced by: `features/writes-scope/REVIEW.md` — live, Step 0 scoped to root `REVIEW.md`, denying the
  conventional `features/writes-scope/REVIEW.md` (F1). Pre-flagged in the fix #7 build note.
- applied by: `command-artifact-paths` — re-aligned `/plan` + `/review` `writes:` to `features/<name>/`
  (the re-audit L3 prescribes); reviewed GREEN, the convention confirmed live.
- promoted: 2026-06-25 via gated `/review` (human-approved).
