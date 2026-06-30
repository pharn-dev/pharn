# REVIEW — plan-files-scope (PHARN reviewing PHARN; the increment is `trust: untrusted`)

- **Under review:** `.claude/commands/pharn-plan.md` (Step-4 template split into advisory `## Steps` + parseable `## Files`, with angle-bracket placeholders, an `### Explicitly not touched` subsection, and guidance prose citing the setter contract + `ARCHITECTURE.md §6`) and `.claude/hooks/set-writes-scope.test.cjs` (the closing-the-loop + producer-faithfulness tests).
- **Floor (Step 1, the only guaranteed part of this review):** `node .dev/floor/validate.mjs .` → **GREEN — 1 capability**. The increment legitimately reached review.
- **Standing verdicts (FLOOR, from earlier stages):** grill — advisory (4 concerns, 0 blocking); regress — `no-regressions`; verify — `PASS` (all 6 gates: test / validate / lint / lint:md / format:check / structural:trust-fence).

## Floor-gate (blocking) findings

**None.** The floor is GREEN; no guarantee lacks a floor reduction; no Capability/`rule_id` binding is missing (none added); no free-text gates a guaranteed decision; no sibling import.

## The four lenses

### L-floor → P0 (governing)

**No findings.** Every claim the increment makes reduces to the floor or is labeled advisory:

- "A correctly-shaped product PLAN parses (exit 0, scope = the `## Files` paths)" → **floor: enum-regex** (the deterministic `set-writes-scope.cjs` parser), pinned by the closing-the-loop test (a real, running `npm test` case).
- "Exclusion-subsection paths never enter scope" / "the real template fails closed when unfilled" → **floor: enum-regex**, pinned by the same test + the producer-faithfulness test.
- "`/pharn-build` writes nothing outside the `## Files` paths" (the template guidance) → **floor: hook** (fix #7, reused) — correctly attributed, not overclaimed.
- The template labels `## Steps` **advisory prose** and only `## Files` paths as scope — the floor/advisory split is stated, not blurred. No "written in the contract ⇒ guaranteed" disease.

### L-eval → P1

**No blocking findings.** `pharn-plan.md` is a **command, not a Capability** (no `role:`, floor-ignored dir), so P1's Capability-evals rule does not bind it (same as `/pharn-build` / `/pharn-grill` / `/pharn-spec`); no new `rule_id`/`enforces` ⇒ no binding to check, and the floor agrees (count stays 1). The behavior change _is_ covered by two real tests: the closing-the-loop (a filled plan → exit 0, scope exact, exclusions + steps-prose absent) and the producer-faithfulness (the real template → exit 1). One advisory note below.

### L-trust → P2

**No findings.** At `/pharn-plan` runtime the template reads an untrusted SPEC, but the `## Files` paths it emits become fix #7 scope parsed as **path membership only** (deterministic, never a free-text field); the hash chain reads frontmatter, not body — no guaranteed decision rests on tainted free-text. As reviewer I checked whether any reviewed content steered me: the template's imperative guidance ("cite … do not restate", "keep an unfilled placeholder in angle-brackets") is **legitimate trusted command guidance to a future plan author**, not an injection; the test fixture's prose path `src/should-not-leak.ts` is deliberate DATA verifying the parser does not leak prose paths into scope. Neither changed my behavior.

### L-axis → P3

**No findings.** Each file changes for one reason — `pharn-plan.md` for the emitted-scope shape, the test file for its coverage. The template guidance citing `set-writes-scope.cjs --from-plan` and `ARCHITECTURE.md §6`, and the test referencing the real `pharn-plan.md`, are **command/test orchestration references within the build apparatus** (`.claude/**`), not product-layer leaf→leaf imports — P3's no-sibling-imports rule (about `pharn-*` modules routing through `pharn-contracts`) is not engaged.

## Advisory findings (judgment-based; inform, never block)

```yaml
- type: FINDING
  rule_id: P0
  severity: important # advisory assignment (fix #3) — a gate-COVERAGE gap, not a defect in this (now-green) increment
  file: ".claude/commands/pharn-dev-verify.md:1"
  problem: "An increment's own markdown (build output + audit artifacts) can redden `npm run check` yet pass BOTH /pharn-dev-regress (deterministic style-gate skip when no shared style config changed) AND /pharn-dev-verify's canonical gate set (test/validate/lint/structural — omits format:check + lint:md); the style defect surfaced only on the full npm run check this run."
  evidence: "This increment initially failed format:check (pharn-plan.md + the PLAN/GRILL/regression-report artifacts) and lint:md (PLAN.md MD038, MD049). /pharn-dev-regress reported no-regressions (style gates skipped — inside touched no shared config); /pharn-dev-verify's four canonical gates were green. Only `npm run check` was RED. Caught at verify, corrected (prettier --write + a markdownlint rephrase), re-verified green."
```

```yaml
- type: FINDING
  rule_id: P1
  severity: minor # advisory
  file: ".claude/hooks/set-writes-scope.test.cjs:108"
  problem: "Coverage proves a filled SYNTHETIC plan parses and the real template fails-closed (placeholders), but no test asserts a FILLED instance of the REAL pharn-plan.md template parses — producer↔consumer agreement is proven structurally (mirrored fixture) + fail-closed, not by parsing a filled real template."
  evidence: "The closing-the-loop test uses a hand-written fixture mirroring the template's section structure; the producer-faithfulness test asserts the real template exits 1 (unfilled placeholders). The gap is bounded (the two together strongly constrain the shape) and arguably untestable without programmatically filling the template's placeholders."
```

```yaml
- type: FINDING
  rule_id: P6
  severity: minor # advisory
  file: ".dev/features/plan-files-scope/GRILL.md:1"
  problem: "GRILL.md cites PLAN.md line numbers (e.g. :4, :38, :72) captured before the verify-stage prettier reformat + the MD038 rephrase of PLAN.md:15; a few citations may now be off by the small in-place edits."
  evidence: "prettier ran with proseWrap=preserve (line structure kept) and the MD038 fix was an in-place single-line replacement, so drift is minimal — but the citations are pre-correction. Cosmetic; the artifacts are advisory."
```

## Proposed lesson for canon (NOT written here — `/pharn-dev-review` writes only `REVIEW.md`)

A **real, structurally-recurring** failure surfaced this run (P7 — real, not hypothetical), so I **propose** one lesson candidate. It is recorded here with provenance; the actual write to `.dev/memory-bank/lessons-learned.md` is a separate, human-gated `/pharn-dev-memory-promote` run (the model never self-promotes — P2).

- **candidate id:** `verify-include-style-gates`
- **lesson:** Where an increment writes markdown (a command edit, or the pipeline's own `.dev/features/<name>/*` audit artifacts), the per-increment gate coverage has a hole: `/pharn-dev-regress` deterministically **skips** `format:check` / `lint:md` unless a shared style config changed, and `/pharn-dev-verify`'s canonical gate map (`test` / `validate` / `lint` / `structural`) **omits** them — so a style regression in the increment's own files passes both stages and surfaces only at the full `npm run check` (or CI). **Recommendation:** add `format:check` + `lint:md` to `/pharn-dev-verify`'s canonical gate map (verify runs at HEAD with devDeps present → no `npm ci`, cheap), so the verify verdict tracks the full `npm run check`.
- **provenance:** increment `plan-files-scope`; this run's verify stage found `npm run check` RED on the build output + audit artifacts while the four canonical gates and regress were green; fixed (prettier --write + markdownlint rephrase) and re-verified green (`VERIFY.md`, "Style-gate correction").
- **target:** `.dev/memory-bank/lessons-learned.md` (proposed).

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The increment is structurally sound: the floor is GREEN, the closing-the-loop and producer-faithfulness tests pin the new behavior (and the template's fail-closed-on-unfilled discipline), and the guarantee/trust/axis lenses are clean. Three **advisory** findings (one important: a verify gate-coverage gap, with a proposed lesson; two minor) inform the human at the post-review gate — none blocks. As always (P0): GREEN here means **the floor passed and the lenses found no blocker**, NOT that the `## Files` restructure is the _right_ design — that judgment is the human's at GATE 2.
