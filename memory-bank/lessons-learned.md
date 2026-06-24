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
