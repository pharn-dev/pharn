# PLAN — setter-cue-fix (CF-E: blockquote prose under `## Files` must not truncate the scope)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), live this run; no drift
- increment: fix the `--from-plan` writes-scope setter so an EXPLANATORY blockquote line under `## Files` (a `> …` note that happens to contain an exclusion cue like "not touched") no longer triggers the head-less-exclusion Boundary-2 break and silently zeroes the scope. Triggered by a REAL failure (CF-E, `.dev/features/product-pipeline-probe/PROBE.md`) — P7 satisfied.
- layer(s): build apparatus — `.claude/hooks/` (the fix #7 setter + its test). # not a product Capability
- constitution_refs: [P5, P7]

## Files

- `.claude/hooks/set-writes-scope.cjs` — exempt blockquote lines (`> …`) from the Boundary-2 exclusion-cue break in `pathsFromPlanFiles`, so explanatory prose above the path items cannot truncate the authorized list.
- `.claude/hooks/set-writes-scope.test.cjs` — add a regression test: a `## Files` with a blockquote note containing "not touched" ABOVE the back-tick path still parses the path into scope (the CF-E reproduction).

### Explicitly not touched

- _(the exclusion-cue behaviour for NON-blockquote head-less intros like "Files NOT written:" is preserved — only blockquotes are exempted, so an exclusion-only `## Files` still fails closed.)_

## Guarantee audit (P0)

- "the setter parses a `## Files` whose authorized paths are preceded by an explanatory blockquote" → FLOOR: the setter is deterministic (regex/membership); the test pins the new behaviour. The fix only makes the parser MORE permissive about blockquotes (it can add a previously-truncated path, never remove one), so it cannot weaken the fail-closed guarantee for genuine exclusions.
- "blockquotes are explanatory, never exclusion-section intros" → the design assumption justifying the exemption; an exclusion section is a heading (`### …`, Boundary 1) or non-blockquote prose (Boundary 2), never a `> …` blockquote.

## Determinism audit (P5)

- The added branch is a membership test (`/^\s*>/` blockquote detection); no LLM. The exclusion-only / head-less-intro fail-closed path is unchanged (non-blockquote prose still breaks).

## Open questions (HALT) — none

> Direct fix of a surfaced bug (CF-E); scope is two build-apparatus files; no product surface, no trusted doc, no new guarantee. Proceeding under the human's "do everything" authorization.
