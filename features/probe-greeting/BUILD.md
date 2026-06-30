# BUILD — probe-greeting

- **Plan built:** `features/probe-greeting/PLAN.md` (against `features/probe-greeting/SPEC.md`)
- **Chain gate (FLOOR, `.dev/floor/check-plan-spec-agree.mjs`):** GREEN — the PLAN's carried
  `spec_content_hash` (`843b4388…e852807`) equals the current Approved, un-drifted SPEC's body hash. This was
  the **second** enforcement of `/pharn-spec`'s pin (grill was the first).
- **fix #7 writes-scope (FLOOR, `set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`):** set from the
  plan's `## Files` to exactly `["features/probe-greeting/greet.mjs"]`. Verified live that the hook **denies**
  (exit 2) an out-of-scope write and **allows** (exit 0) the in-scope write — the build was bounded to the one
  authorized path.
- **Floor (FLOOR, `.dev/floor/validate.mjs .`):** GREEN — 1 capability checked (unchanged; the `.mjs` vehicle is
  not a capability and is invisible to the floor's `.md`-only walk).
- **Files written:** `features/probe-greeting/greet.mjs` (the pure `greet(name)` vehicle).
- **Advisory acceptance check (NOT a floor gate):** `greet("World")` returned exactly `"Hello, World!"` — the
  SPEC's Acceptance Criterion holds for the named case. There is no `npm`-wired test (per the SPEC's
  Out-of-scope), so this rests on a manual `node -e` run.

_Built within the named scope from a current approved plan — this is NOT a judgment that the code is correct;
that is `/pharn-regress` / `/pharn-verify` + the human._
