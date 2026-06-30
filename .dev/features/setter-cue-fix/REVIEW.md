# REVIEW — setter-cue-fix (CF-E)

**Increment reviewed:** the CF-E fix — `.claude/hooks/set-writes-scope.cjs` (Boundary-2 blockquote exemption in
`pathsFromPlanFiles`) + `.claude/hooks/set-writes-scope.test.cjs` (+2 tests), under
`.dev/features/setter-cue-fix/PLAN.md`. Reviewed as `trust: untrusted` (P2). _(Built directly under a
"do everything" authorization without a review pass — this review backfills that gate.)_

**Step 1 — Floor:** `.dev/floor/validate.mjs .` → **GREEN, 1 capability** (exit 0). `npm test` → **167 pass**
(incl. the 2 new tests). The increment legitimately reached review. Everything below the floor line is
**advisory**.

---

## The four lenses

### L-floor → P0 — no blocking finding

The PLAN's guarantee audit is honest: the claim "the fix only makes the parser MORE permissive about
blockquotes (it can add a previously-truncated path, never remove one), so it cannot weaken the fail-closed
guarantee" is **verified true** — the change only adds `!isBlockquote` to the Boundary-2 **break** condition, so
a blockquote line can no longer stop the scan early; it never causes an earlier stop. No guarantee is claimed
without a floor reduction (the setter is deterministic; the tests pin the behaviour). The "blockquotes are never
exclusion intros" assumption is **labeled as an assumption**, not sold as a guarantee. **Clean.**

### L-eval → P1 — no blocking finding

The increment is a floor **hook** (`.claude/hooks/`, no `role:`), so P1's Capability-evals rule does not bind it;
it ships its proof as `*.test.cjs` (the hook convention), run by `npm test` (the floor `validate` excludes
`.claude/`). The 2 tests **bind both halves**: the CF-E reproduction (a blockquote cue above the paths →
scope collected) and the preservation guard (a NON-blockquote head-less intro → still fails closed). The binding
is demonstrated, not merely asserted. **Clean.**

### L-trust → P2 — no blocking finding

No instruction-looking content in the reviewed diff changed reviewer behaviour (it is a regex + a comment). No
new taint path: the exemption **cannot be exploited to sneak a path into scope**, because a back-tick path
written inside a blockquote (a `>`-led line) is never collected — the collection match (line 184) still requires
a leading dash, which a `>`-led line fails. So exempting blockquotes from the _break_ changes only whether prose **truncates** the list,
never which paths are **collected**. No guaranteed decision rests on a tainted/free-text field. **Clean.**

### L-axis → P3 — no blocking finding

One axis (the CF-E blockquote fix), one source file + its test + the increment's PLAN. No sibling reference (a
standalone hook; no `reads:` edge). **Clean.**

---

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The fix is correct, minimal, well-tested, and honestly audited; the
floor is GREEN and the full suite passes with the regression tests added.

## Advisory findings (not blocking)

```yaml
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".claude/hooks/set-writes-scope.cjs:179"
  problem: "The fix patches the blockquote CASE but not the CLASS: Boundary-2 is a regex-on-prose heuristic trying to distinguish an exclusion-intro from explanatory prose, and a NON-blockquote explanatory paragraph containing a cue (e.g. a plain line 'Everything else is not touched.' above the path items) would STILL truncate the scope. CF-E (the real, blockquote form) is resolved, but the underlying fragility of content-cue boundary detection remains."
  evidence: "const isBlockquote = /^\\s*>/.test(line); … !isBlockquote && /\\bnot\\W*(touch|writ|…)|…/i.test(line)"
```

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor
  file: ".claude/hooks/set-writes-scope.cjs:174"
  problem: "The exemption is sound largely because of an unstated collateral property — blockquote-internal back-tick paths are never COLLECTED (the line-184 match requires a leading '-') — so a blockquote can neither truncate the list nor inject a path. The PLAN justifies the exemption only by 'blockquotes are explanatory', not by this stronger structural safety; recording WHY it is safe would harden the rationale against a future edit to the collection regex."
  evidence: "isPathItem = /^\\s*-\\s+`[^`]+`/ … m = line.match(/^\\s*-\\s+`([^`]+)`/) — both require a leading dash, which a `>`-led blockquote line fails."
```

```yaml
- type: FINDING
  rule_id: "P1"
  severity: minor
  file: ".claude/hooks/set-writes-scope.test.cjs:1"
  problem: "Test coverage targets the cue forms (blockquote-with-cue collected; non-blockquote intro fails closed). Not explicitly exercised: a benign blockquote WITHOUT a cue (skipped, path collected) and a blockquote AFTER the path list (must not retroactively drop a collected path). Both behave correctly by the same mechanism, so this is a coverage note, not a defect."
  evidence: "the two added tests both use a cue-bearing or exclusion-intro fixture."
```

## Proposed lesson for canon (PROPOSED only — `/pharn-dev-memory-promote` writes canon, behind its own gate + human accept)

> Provenance: increment `setter-cue-fix`, branch `product-pipeline-probe`, commit `0077dd1` (the fix), surfaced
> by `.dev/features/product-pipeline-probe/PROBE.md` CF-E + this REVIEW.md. A **real** failure (CF-E bit a live
> build), not hypothetical (P7).

- **Candidate: a content-cue boundary is fragile; prefer a STRUCTURAL anchor.** The writes-scope setter ends its
  `## Files` scan two ways: Boundary 1 (a markdown **heading** — structural, robust) and Boundary 2 (a prose
  **cue regex** — fragile, the one CF-E exploited). The blockquote exemption narrows Boundary 2 but does not
  remove its class of failure. _Why it matters:_ a parser that infers structural intent from free-text prose
  will keep misfiring as plan prose varies (the same "written prose mistaken for structure" shape the repo
  guards against elsewhere). _How to apply:_ evaluate whether Boundary 1 (headings, e.g. `### Explicitly not
touched`) plus the angle-bracket-placeholder fail-closed already covers every real exclusion case — and if so,
  consider removing Boundary 2 rather than continuing to patch it. Relates to L6 (read membership from the
  structured location, not grepped free text).

This is a **proposal**. No canon is written by `/pharn-dev-review`; promotion is a separate human-gated
`/pharn-dev-memory-promote` run.
