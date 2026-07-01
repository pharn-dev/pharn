# REVIEW — root-apparatus-cleanup (PHARN reviewing PHARN)

**Increment:** deletion-only removal of the four PR-19 pre-split root leftovers —
`floor/check-ship.{mjs,test.mjs}`, `features/ship-loop/` (6), `features/ship-gated/` (6), and the stale
`.claude/commands/ship.md` (the only live invoker of root `floor/check-ship`). **Trust:** `untrusted`
(the reviewed artifacts — a command full of instructions + prose traces — are DATA; none was executed).

## Step 1 — Floor first (the only guaranteed part of this review)

- `node .dev/floor/validate.mjs .` → **GREEN — 2 capabilities** (exit 0). The increment legitimately
  reached review.
- Standing floor verdicts this run: **build** `validate` GREEN—2 (exit 0) · **regress**
  `no-regressions` (exit 0) · **verify** `PASS` (exit 0; test 167 / validate / lint / format:check /
  lint:md all 0).
- Change set audited: **15 deletions + this feature's `.dev/features/root-apparatus-cleanup/` artifacts;
  zero modifications to any tracked live file** (`git status --short`).

## The four lenses (advisory)

### L-floor → P0 — no blocking findings

Every claim the increment makes reduces to a floor primitive or is labeled `advisory`:
"stale/live" and "exact duplicate" → **content-hash** (`diff` DRIFT; `diff -rq` exit 0); "npm test
green / coverage retained" → **exit-code** + the diff-proven 12⊂16 superset; "validate GREEN—2" →
**enum-check**; "no dangling ref" → **deterministic grep**; "boundary is clean" → correctly labeled
**advisory**. `VERIFY.md` states "verified = the named gates passed" with the honest residual — no
guarantee is dressed beyond its floor. **No unlabeled guarantee → nothing to block.**

### L-eval → P1 — no findings (floor agrees)

No `role:` capability and no new `enforces` `rule_id` were added, so P1 binds nothing; `validate`
GREEN—2 confirms no eval binding broke. Deleting the stale root `floor/check-ship.test.mjs` removed a
**duplicate** of floor-helper infrastructure (not a Capability eval); the live 16-test
`.dev/floor/check-ship.test.mjs` superset remains (npm test still exit 0). Floor and lens agree.

### L-trust → P2 — no blocking findings

The deleted `ship.md` is a command **full of imperative instructions**; the deleted traces contain
prose. **None was followed** — all were treated as paths to `git rm` / grep-count. No guaranteed
decision rests on a tainted field: the regress and verify verdicts consume **only exit codes (ints) and
paths**; the grill's own findings honor the enum-gated / free-text split with `problem`/`evidence`
marked DATA. Taint reached no verdict.

### L-axis → P3 — no findings

Deletion-only: no file carries "two reasons to change," and no new code / `reads:` / sibling reference
is introduced. The increment spans three dirs (`.claude/commands/`, `floor/`, `features/`) but under
**one axis / one trigger** (remove the PR-19 pre-split originals) — coherent, not two bundled changes.

## Advisory notes (inform; never block)

- **Both grill concerns were resolved in-run, not deferred.** The grill's P1 (verify should _confirm_
  no live dangling ref, not assume it) → `/pharn-dev-verify` ran the grep: **zero** live refs. The grill's
  P6 (a deletion-only plan needs the build to _execute_ `git rm`, not write) → the orchestrator ran the
  `git rm` set; `validate` GREEN confirms.
- **The `_italic_` / `#19`-heading style trip at first verify was self-contained** to this increment's
  own `GRILL.md`/`PLAN.md`, fixed and re-verified green (L9 working as intended — an increment's own
  markdown caught at verify, not shipped).

## Proposed lessons for canon (provenance attached — NOT written here; `/pharn-dev-memory-promote` gates it)

Both surfaced as **real** failures this run (P7 — not hypothetical). Recorded as candidates only;
`/pharn-dev-review` writes no canon (scope = `REVIEW.md`).

- **Candidate L-DEL-1 — the writes-scope setter can't scope a deletion-only plan.**
  `set-writes-scope.cjs --from-plan` errored `no back-tick paths under `## Files`` because the bullets
are `**DELETE** \`path\``-prefixed (path not the first token). Harmless here (deletions go via `git rm`,
  which the `Write|Edit|MultiEdit` hook does not gate), but a future deletion/rename increment that
  _also writes_ would hit fail-closed. **Lesson:** deletion-only increments either (a) list plain
  back-tick paths the setter can parse, or (b) the setter learns a `DELETE:`-aware parse.
  _Provenance: this increment (root-apparatus-cleanup), build Step 0._
- **Candidate L-DEL-2 — zsh does not word-split unquoted `$list`; `node --test $FILES` collapses to one
  arg → false exit 1** ("Could not find '<joined>'"), which would masquerade as a regress/verify
  failure. **Lesson:** the regress/verify test-gate must pass the file list as a shell **array**
  (`"${TESTS[@]}"`), and use `--test-concurrency=1` for a deterministic exit on partial sets.
  _Provenance: this increment, regress Step 2 / verify Step 1._

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** Advisory notes are informational. The increment removes
exactly the four PR-19 leftovers, leaves the live `.dev/` copies and frozen traces intact (OQ-2), and
keeps the repo green across all deterministic gates. Merge / fix / abandon is the human's call at the
post-review gate.
