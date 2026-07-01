# REGRESSION — ship-stage (`/pharn-ship` product command)

- **Base:** `3dc7849` (working tree dirty → `base = HEAD`, the pre-increment commit).
- **Inside (the build's changed scope):** `.claude/commands/pharn-ship.md` — **==** the plan's `## Files`
  (`scope` partition `escaped: []`, **no fix #7 breach**). The increment changed **zero tracked files** — it
  only **added** the new command plus its audit scaffolding (`.dev/features/ship-stage/{PLAN,GRILL}.md` +
  these regression outputs), which are written by the plan/grill/regress stages under their own
  writes-scopes, not build user-code outputs, so they are excluded from the changed set (same handling as
  the build-stage / grill-stage / regress-stage / verify-stage regress runs).
- **Outside gates run** (the same set at base and head): `tests` (the committed `.dev/floor/*.test.mjs` +
  `.claude/hooks/*.test.cjs` suites via the canonical `node --test` glob, run in an immutable base worktree),
  `validate` (whole-repo — a named granularity limit), `structural:trust-fence` (the one committed eval pair:
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`). **Style gates skipped** deterministically — `inside` touches no
  shared style config (the config-touch skip rule; a style flip over byte-identical outside files is provably
  impossible). _(The audit `.md` files I did touch were separately brought to prettier + markdownlint clean
  during the build; they are scaffolding, not outside-scope code.)_

## Per-gate base → head (deterministic exit-code comparison)

| gate                     | base | head | classification |
| ------------------------ | :--: | :--: | -------------- |
| `tests`                  |  0   |  0   | OK             |
| `validate`               |  0   |  0   | OK             |
| `structural:trust-fence` |  0   |  0   | OK             |

- `regressions[]`: **none** · `pre_existing[]`: **none**.
- The increment adds only a **floor-ignored** command (`.claude/commands/pharn-ship.md`, in the
  `.claude/commands/` surface `validate.mjs` excludes) plus audit scaffolding, and changes **no** tracked
  file — so every outside gate is byte-identical at base and head **by construction**, and the base worktree
  confirms 0/0/0.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the
deterministic exit-code comparison (`.dev/floor/check-regress.mjs verdict` → `no-regressions`, exit 0) — zero
LLM judgment in its core.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches —
nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature flipped
pass→fail**, _not_ "nothing broke" and _not_ a judgment that the `/pharn-ship` command is correct or
well-designed (that is `/pharn-dev-verify` + human review). The orchestration (base resolution, inside/outside
partition, the scaffolding exclusion) is advisory; only the exit-code **comparison** is the guarantee.
