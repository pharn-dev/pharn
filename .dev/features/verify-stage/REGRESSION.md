# REGRESSION — verify-stage (`/pharn-verify` product command)

- **Base:** `4e508ab` (working tree dirty → `base = HEAD`, the pre-increment commit).
- **Inside (the build's changed scope):** `.claude/commands/pharn-verify.md` — **==** the plan's `## Files`
  (`scope` partition `escaped: []`, **no fix #7 breach**). The feature's own audit artifacts
  (`.dev/features/verify-stage/{PLAN,GRILL}.md` + these regression outputs) are pipeline scaffolding
  written by the plan/grill/regress stages under their own writes-scopes, not build user-code outputs, so
  they are excluded from the changed set (same handling as the build-stage/grill-stage/regress-stage
  regress runs).
- **Outside gates run** (the same set at base and head): `tests` (the 15 committed `.dev/floor/*` +
  `.claude/hooks/*` suites via the canonical `node --test` glob), `validate` (whole-repo — a named
  granularity limit), `structural:trust-fence` (the one committed eval pair:
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`). **Style gates skipped** deterministically — `inside` touches
  no shared style config (the config-touch skip rule; a style flip over byte-identical outside files is
  provably impossible).

## Per-gate base → head (deterministic exit-code comparison)

| gate                     | base | head | classification |
| ------------------------ | :--: | :--: | -------------- |
| `tests`                  |  0   |  0   | OK             |
| `validate`               |  0   |  0   | OK             |
| `structural:trust-fence` |  0   |  0   | OK             |

- `regressions[]`: **none** · `pre_existing[]`: **none**.
- The whole-repo `tests` gate is clean at both base and head (167 pass under the canonical suite this run
  — the full-glob form is stable; the partial-list scheduling flake noted in earlier increments did not
  recur). This increment adds only a **floor-ignored** command (`.claude/commands/pharn-verify.md`, in the
  `.claude/commands/` surface `validate.mjs` excludes) plus audit scaffolding, and touches **no** outside
  test / eval pair / validated capability — so every outside gate is byte-identical at base and head by
  construction.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the
deterministic exit-code comparison (`.dev/floor/check-regress.mjs verdict` → `no-regressions`, exit 0) —
zero LLM judgment in its core.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches —
nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature
flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the `/pharn-verify` command is
correct or well-designed (that is `/pharn-dev-verify` + human review). The orchestration (base resolution,
inside/outside partition, the scaffolding exclusion) is advisory; only the exit-code **comparison** is the
guarantee.
