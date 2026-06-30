# REGRESSION — product-pipeline-probe

- **Base:** `a730f28` (dirty-tree dogfood flow → base = HEAD; the commit that holds the probe's process
  artifacts + vehicle, leaving only `PROBE.md` uncommitted).
- **Inside (the changed scope):** `.dev/features/product-pipeline-probe/PROBE.md` — the one uncommitted
  dev-build output; equals the dev plan's `## Files` after the commit discipline (see note below).
- **Outside tests:** 15 committed `*.test.{mjs,cjs}` suites. **Outside eval pairs:** none.

## Per-gate exit codes (base → head)

| gate                                     | base | head | flipped? |
| ---------------------------------------- | ---- | ---- | -------- |
| `tests` (15 suites, `node --test`)       | 0    | 0    | no       |
| `validate` (`.dev/floor/validate.mjs .`) | 0    | 0    | no       |

(Style gates `lint`/`format:check`/`lint:md` were **skipped** deterministically — `inside` = `PROBE.md` only,
which touches no shared style config; a style result over byte-identical outside files cannot flip.)

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature** (`check-regress.mjs verdict`
exit 0). `regressions: []`, `pre_existing: []`.

_Honest residual (P0/P7): `/pharn-dev-regress` catches exactly what its suite catches — nothing more. "No
regressions" means no deterministically-detectable breakage outside the feature, **not** "nothing broke."_

## Methodology notes surfaced this run (for PROBE.md / separate increments — not part of the verdict)

- **CF-1-amplified (confirmed live, then mitigated).** On the first attempt, `check-regress.mjs scope` exited 1
  with **7 blocking fix#7 "escape" findings** — all false positives: the nested product sub-commands'
  legitimate outputs (`features/probe-greeting/{SPEC,PLAN,GRILL,BUILD}.md`, `greet.mjs`) and the dev
  `PLAN.md`/`GRILL.md`, each written under its own command's scope, are correctly absent from this dev plan's
  `## Files` (= `PROBE.md`). The approved **commit discipline** (commit all-but-`PROBE.md`, human-authorized)
  collapsed `inside` to `{PROBE.md}` = `declared` → clean partition. The conflation is a real `/pharn-dev-regress`
  limitation for a nested-pipeline increment; the fix is a separate increment.
- **Worktree-capture artifact (mine, not the repo's).** An initial baseline capture recorded `tests=1`; this was
  an artifact of invoking `node --test` with worktree-prefixed paths from the wrong cwd, **not** a real test
  failure. Re-run with the correct cwd (and confirmed 3/3 in the working tree), the suite is GREEN at both base
  and head. The tests are hermetic (each spawns into a fresh temp dir; the real `.pharn/` is never touched).
