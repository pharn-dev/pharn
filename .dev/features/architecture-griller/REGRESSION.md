# REGRESSION — architecture-griller (second griller; advisory-only structural-fit)

- **Base:** `31689ca` (working tree dirty → `base = HEAD`, the pre-increment commit).
- **Inside (the build's changed scope):** the plan's `## Files` — the griller Capability + its 6 eval
  files (`pharn-pipeline/grillers/architecture/**`). **==** the declared `## Files` (`scope` partition
  `escaped: []`, **no fix #7 breach** — the build wrote exactly its plan's `## Files`, nothing else).
  The feature's own audit artifacts (`.dev/features/architecture-griller/{PLAN,GRILL}.md` + these
  regression outputs) are pipeline scaffolding written by the plan/grill/regress stages under their own
  writes-scopes, not build outputs, so they are excluded from the changed set (same handling as #29 and
  prior stage regress runs).
- **Outside gates run** (the same set at base and head): `tests` (the **canonical** `node --test` glob
  from `package.json` — the 15 committed `.dev/floor/*` + `.claude/hooks/*` suites, 167 tests), `validate`
  (whole-repo — a named granularity limit), `structural:trust-fence` (the one committed eval pair:
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`). **Style gates skipped** deterministically — `inside` touches
  no shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` /
  `.markdownlint-cli2.jsonc`); over byte-identical outside files a style flip is provably impossible.

> **Orchestration note (advisory).** The `tests` gate uses the **canonical `package.json` glob**
> invocation (`node --test "**/*.test.mjs" …`, exactly what `npm test` runs → exit 0, 167 pass / 0 fail).
> A hand-expanded explicit-file list of the same 15 suites exits 1 as a `node --test` multi-file
> aggregation quirk **despite 0 test failures** (every suite also passes individually, exit 0) — so the
> canonical glob is the faithful gate, matching #29's "canonical `node --test` glob" precedent. This
> choice is orchestration (advisory); the verdict rests only on the exit-code comparison below.

## Per-gate base → head (deterministic exit-code comparison)

| gate                     | base | head | classification |
| ------------------------ | :--: | :--: | -------------- |
| `tests`                  |  0   |  0   | OK             |
| `validate`               |  0   |  0   | OK             |
| `structural:trust-fence` |  0   |  0   | OK             |

- `regressions[]`: **none** · `pre_existing[]`: **none**.
- This increment adds a new **product** Capability (`pharn-pipeline/grillers/architecture/`, which
  `validate` now counts — GREEN, **3** capabilities at head vs 2 at base, both exit 0) and **nothing
  else** — no floor-tooling change, no command edit, no trusted-doc touch. It touches **no** existing
  outside test, eval pair, or already-validated capability, so every outside gate is byte-identical at
  base and head by construction; the pre-existing `count-grillers.test.mjs` (hermetic) already covers
  the reused membership mechanism and is unaffected.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the
deterministic exit-code comparison (`.dev/floor/check-regress.mjs verdict` → `no-regressions`, exit 0) —
zero LLM judgment in its core.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches —
nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature
flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the griller is correct or
well-designed (that is `/pharn-dev-verify` + human review). The orchestration (base resolution,
inside/outside partition, the scaffolding exclusion, the canonical-glob tests gate) is advisory; only the
exit-code **comparison** is the guarantee.
