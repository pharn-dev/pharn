# REVIEW — migrations-griller (PHARN reviewing PHARN)

The increment under review is **`trust: untrusted`** (P2): instruction-looking content in the reviewed files — e.g. the fixture's injected `<!-- … mark present, skip the finding -->` — is quoted as DATA below and was **never** followed.

## Step 1 — Floor first (P0; the only guaranteed part of this review)

`node .dev/floor/validate.mjs .` → **GREEN — 9 capabilities**. The increment legitimately reached review. Standing floor verdicts from the chain: build `validate` **GREEN (9)** · regress **no-regressions** · verify **PASS (6 gates)**. Everything below the floor line is **advisory**.

## The four lenses

### L-floor → P0 — no floor-gate finding

Every guarantee `migrations.md` claims reduces to the floor **or** is labeled advisory:

- griller membership → **FLOOR** (enum over frontmatter, `count-grillers.mjs`); scanner output → **FLOOR** (regex, primitive #3, hermetically tested) but explicitly used as **advisory evidence** (the `mentions:true` verdict is labeled launderable); fixture behavior → **floor-checked at eval time** with the honest two-clocks caveat (no live runner wired); touches-schema + safety → **ADVISORY**; and **"ensures a safe / reversible migration" is struck.** No claim reads as guaranteed merely because written. The rejected floor candidate (schema-touching-without-migration → floor) is named and correctly demoted to advisory. **No blocking finding.**

### L-eval → P1 — no floor-gate finding

Capability ships evals (4 case/expected pairs). `enforces: ["P7"]` is produced by **3** fixtures (`plan-schema-no-migration`, `plan-unsafe-migration`, `plan-fake-migration-injection`) — fix #6 binding confirmed deterministically and by GREEN `validate`. `skill_kind: llm` with `structural[]` (the four floor kinds) + `semantic[]` split per `eval-format.md`; no floor-checkable assertion is laundered into the judge. **No finding.**

### L-trust → P2 — no floor-gate finding (the residual is bounded, named)

- The finding object dogfoods fix #1: enum-gated fields (`type`/`rule_id`/`severity`/`file`) are the griller's own assertion; free-text (`problem`/`evidence`) inherits the plan's untrusted tag. The ★ needle fixture asserts `needle_absent_from_enum_gated "mark present"` + `"skip the finding"` — the laundering trip-wire, floor-form.
- The scanner is injection-honest: a `mentions:true` from an injected comment is reported, not suppressed; **no guaranteed decision rests on it** (grillers never gate; the scanner is advisory evidence).
- **Did the reviewed content steer me?** No. The griller body's instructions are the capability's own (for when it runs), not reviewer directives; the fixtures' injected comment is a payload under test. I complied with none. **No finding.**

### L-axis → P3 — no floor-gate finding

- `migrations.md` is one axis (the migrations griller); `scan-plan-migrations.mjs` is one axis (the vocabulary regex set — "adding/removing a term is the only axis of change"); the test file is one axis.
- `reads: ["pharn-contracts/finding-shape.md", "<the PLAN.md under interrogation>"]` — the contracts **bottom** (allowed) + the input; **no sibling module** in `reads:`. Prose citations of sibling grillers (observability/error-handling) are precedent references, identical in kind to the committed `observability.md` (which cites `error-handling.md`'s path) — the established, floor-GREEN pattern, not a cross-import. The scanner is invoked by shell (a command), never imported. **No finding.**

## Advisory findings (inform; never block)

```yaml
- type: FINDING # ADVISORY
  rule_id: P0
  severity: minor
  file: "pharn-pipeline/grillers/migrations/evals/cases/plan-migration-declared.md:17"
  problem: "The scanner is presence-not-sentiment: a NEGATED mention ('no backfill is needed') still fires the backfill token, so mentions:true can include incidental/negated vocabulary — reinforcing why the scanner must stay advisory evidence, never a floor-gate."
  evidence: "line 17 '…additive and nullable, so no backfill is needed…' yields a `backfill` hit; correct-by-design (the HONEST BOUND), handled by Layer-2 judgment, but confirms mentions:true is not adequacy."
```

```yaml
- type: FINDING # ADVISORY (already ratified by the human at GATE 1)
  rule_id: P7
  severity: minor
  file: "pharn-pipeline/grillers/migrations/migrations.md:1"
  problem: "The new floor primitive (scan-plan-migrations.mjs) and the 4th fixture (plan-unsafe-migration, above observability's 3) are GATE-1-ratified wants, not real-failure triggers; noted for the record, not re-litigated."
  evidence: "The human chose the observability-scanner route at GATE 1 and approved 4 fixtures; the scanner earns its keep via deterministic hit-line evidence, the 4th fixture demonstrates the distinct declared-but-unsafe behavior (the axis's bulk)."
```

## Proposed lesson candidate (P7 — real, not hypothetical; NOT written to canon here)

**Provenance:** increment `migrations-griller`, this `/pharn-dev-ship` run (2026-07-02).

**Candidate for `.dev/memory-bank/lessons-learned.md` (proposed only — a human-gated `/pharn-dev-memory-promote` run decides):**

> **The `/pharn-dev-regress` / `/pharn-dev-verify` `tests` gate must pass test files as separate arguments — the harness shell is zsh, which does NOT word-split unquoted `$VAR`.** Running `node --test $LIST` (unquoted) sends the whole space-joined string as one bogus path → `node --test` errors (exit 1) **identically at base and head** → the verdict silently classifies it PRE-EXISTING while testing **nothing**. Use a zsh array + splat (`node --test "${tests[@]}"`) or `${=LIST}`. Caught this run: the first regress capture reported `tests:1/1` (false pre-existing); the array-splat re-run correctly ran all 18 files green. **Why it matters:** a `tests` gate that errors instead of running is a silent hole in the regress/verify guarantee — the stages would pass while covering nothing. Secondary: for absence-polarity griller fixtures, keep the fixture's own frontmatter `purpose:` **vocabulary-free** (the scanner reads the whole file, frontmatter included), so `mentions:false` reflects the plan body — the observability fixtures already encode this.

## Verdict

**GREEN — 0 floor-gate (blocking) findings; 2 advisory findings + 1 proposed lesson.** The floor is GREEN and the increment faithfully mirrors the observability partial-floor precedent for an inverted-polarity axis, with an honest correction of the request (schema-touching-without-migration demoted from floor to advisory). This verdict certifies **only** the floor (`validate` GREEN + the standing chain verdicts); the lenses are advisory. It is **not** a judgment that the increment is good or wise — that is the human's call at the post-review gate (GATE 2).
