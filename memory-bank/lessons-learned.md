# Lessons learned

Canonical memory-bank state (`ARCHITECTURE.md §5`). Each entry is promoted by a **gated** `/review` or `/build`
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

## L4 — An authored fixture passes by construction; a live capability must be measured

**Lesson.** A capability's eval fixture (`evals/expected/*`) is **authored to pass** — it proves the
CHECK is shaped right, never that the live capability satisfies it. Do not trust that a capability does
what its fixture says until you measure it **live** (`/pharn-eval`: run the real LLM N times, then count
structural pass/fail with `floor/check-variance.mjs`). The **structural/semantic split** (`eval-format`,
cited per P4) is what **localized** the defect: in the trust-fence attempt-0 before-run, run 5 was
structural-**FAIL** (the enum-gated `file` cited the injection-comment line `:16`, not the destructive
op `:20`) **and** semantic-**PASS** (reasoning sound — blocking grounded in the unenforced authz, the
comment named as an attack) _simultaneously_. A single LLM-judge assertion would have been **masked by
the semantic pass**, leaving the wrong-line emission invisible; splitting the floor-checkable structural
row from the advisory semantic judge is what made the miss a deterministic RED. **"Authored-fixture ≠
live capability" is the empirical form of "written ≠ guaranteed"** (P0).

**Why it matters.** This is the repo's core P0 disease ("written in the contract" ≠ "therefore
guaranteed") reproduced at the eval layer: a green fixture reads as "the capability works," but it only
proves the assertion is well-formed. `floor/validate.mjs` confirms the fixture EXISTS and binds its
`rule_id` (P1) — it cannot run the LLM, so it cannot catch a capability that passes its authored
expected yet drifts live. Only `/pharn-eval` (live emission + `check-variance` counting) closes that
gap, and only the structural/semantic split keeps a structural miss from hiding behind a semantic pass.
Remedy: treat a built + fixture-green capability as **plumbing-in-place, not proven** — the proof is the
live measurement, and that measurement must keep the floor-grade structural rows separate from the
advisory semantic ones.

**Provenance.**

- feature chain: `trust-fence` 3a→3c (`structured-findings` 3a finding-shape emission contract →
  trust-fence `findings.json` plumbing 3b → `/pharn-eval` live runner 3c) + the `trust-fence-baseline`
  before/after record.
- before: first live `/pharn-eval` (5 runs, commit `480fa50`) → flaky-structural **4/5**; run 5
  structural-FAIL (`file` = `:16`) + semantic-PASS — recorded in [[feature-catalog]].
- fix: `trust-fence-cite-action-line` (lens tightened to cite the destructive op; built + reviewed
  GREEN). It deferred the candidate lesson (P7: "only after a fix proves out") — this entry is that
  lesson, now earned.
- after: second live `/pharn-eval` (5 runs, commit `6b90d18`) → **structural 5/5** (`file_resolves`
  4/5→5/5); `node floor/check-variance.mjs … runs .` → exit 0, PASS — recorded in [[feature-catalog]].
- boundary (P0): the after is **advisory evidence** (LLM-produced findings; only the counting is
  floor-grade), NOT a guarantee the lens never drifts — the floor guarantee is the DETECTOR
  (`check-variance` / `check-structural` `file_resolves`).
- promoted: 2026-06-25 via gated `/build` (writes-scope = `memory-bank/feature-catalog.md` +
  `memory-bank/lessons-learned.md`, set from `features/trust-fence-baseline/PLAN.md`); P7 trigger = the
  before→fix→after cycle closed (structural 4/5 → 5/5). Note: prior entries were promoted via `/review`;
  this one via gated `/build` per the `/build` instruction — the gate that makes it non-silent is fix #7
  (writes-scope) + per-entry provenance (`ARCHITECTURE.md §5`), not the command name.

## L5 — A floor verdict is only as trustworthy as the orchestration that captures its inputs

**Lesson.** A pipeline stage's deterministic FLOOR verdict (`/regress`, `/verify` — exit-code
comparisons) is only as trustworthy as the ADVISORY orchestration that captures its inputs: the exit
codes and file lists are assembled by the command's Bash, and that assembly can silently corrupt them.
Treat input-capture as a trust boundary — make it robust and self-checking (array-expand or quote shell
lists; assert the expected cardinality; fail-closed on a surprising shape) — and never read a green
floor verdict as a guarantee without accounting for how its inputs were produced.

**Why it matters.** The "two clocks" split (the verdict is floor-grade; the orchestration that feeds it
is advisory) has teeth: a verdict computed over corrupted inputs is GIGO, not a guarantee — the P0
disease ("written" ≠ "guaranteed") reproduced one layer up, at the input boundary. Concretely, on the
first full-pipeline run `/regress`'s `tests` gate ran `node --test $LIST` with an unquoted variable
under zsh (the macOS default shell, which does **not** word-split unquoted expansions); the whole list
was passed as a single bogus path → "could not find" → exit 1 at **both** base and head. Being equal on
both sides it evaded a false _regression_ (1 == 1, classified pre-existing), but it fabricated a
pre-existing red and would have **masked** a real tests-gate regression. The floor core
(`check-regress.mjs`) was correct; its inputs were not. The remedy lives in the orchestration layer, not
the floor.

**Provenance.**

- feature: `pipeline-integration-probe` (first full-pipeline integration run).
- commit: `0ae1b38`.
- surfaced by: `features/pipeline-integration-probe/REVIEW.md` (integration finding,
  `.claude/commands/regress.md:116`) + `REGRESSION.md` observation #2.
- promoted: 2026-06-27 via gated `/memory-promote` (human-approved).

## L6 — Membership/structural facts are read from the structured location, never grepped from free text

**Lesson.** A structural or membership fact — "does this capability declare `role: verifier`?", "what
paths does this plan write?" — is read from its STRUCTURED location (the `---`-fenced YAML frontmatter, an
enum, `package.json`), never pattern-matched as a substring over file contents. The enum-gated vs free-text
split (fix #1) governs MEMBERSHIP DETECTION, not only finding emission: a `role: verifier` string in prose
or a fenced code block is DATA about verifiers, not a declaration of one. A substring grep over contents is
not a membership test — it conflates documentation with declaration.

**Why it matters.** A prose-matching membership check is monotonically unstable: it silently grew from a
predicted 3 to 8 matches as the repo accumulated prose mentioning `role: verifier` (none real
declarations), so `/verify` could believe verifiers exist when none do, or run garbage over them. This is
the P0 disease ("written" mistaken for "declared/guaranteed") at the membership layer — the same discipline
as the scope-setter reading `## Files` structurally (fix #15) and the finding object's enum-gated vs
free-text split (fix #1). Remedy: read membership deterministically from the structured field
(`floor/count-verifiers.mjs` parses the frontmatter fence and counts `role === "verifier"`); reserve free
text for human-facing DATA. Complements L5.

**Provenance.**

- feature: `verifier-membership-frontmatter`
- commit: `c355221f929769ae78dd90063843e804cb3a8fa4`
- surfaced by: `features/verifier-membership-frontmatter/REVIEW.md` — proposed lesson (triggered by
  `pipeline-integration-probe` finding #3, `REVIEW.md:80` / `VERIFY.md`).
- promoted: 2026-06-29 via gated `/memory-promote` (human-approved).
