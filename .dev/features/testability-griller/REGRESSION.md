# REGRESSION — testability-griller (first griller + `count-grillers.mjs` membership)

- **Base:** `4b03d74` (working tree dirty → `base = HEAD`, the pre-increment commit).
- **Inside (the build's changed scope):** the plan's `## Files` — the griller Capability + its 6 eval
  files (`pharn-pipeline/grillers/testability/**`), the membership counter + test
  (`.dev/floor/count-grillers.{mjs,test.mjs}`), and the two grill-command edits
  (`.claude/commands/{pharn-dev-grill,pharn-grill}.md`). **==** the declared `## Files`
  (`scope` partition `escaped: []`, **no fix #7 breach**). The feature's own audit artifacts
  (`.dev/features/testability-griller/{PLAN,GRILL}.md` + these regression outputs) are pipeline
  scaffolding written by the plan/grill/regress stages under their own writes-scopes, not build outputs,
  so they are excluded from the changed set (same handling as prior stage regress runs, e.g.
  `verify-stage`).
- **Outside gates run** (the same set at base and head): `tests` (the canonical `node --test` glob — the
  15 committed `.dev/floor/*` + `.claude/hooks/*` suites), `validate` (whole-repo — a named granularity
  limit), `structural:trust-fence` (the one committed eval pair:
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔
  `.dev/features/trust-fence/findings.json`). **Style gates skipped** deterministically — `inside` touches
  no shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` /
  `.markdownlint-cli2.jsonc`); over byte-identical outside files a style flip is provably impossible.

## Per-gate base → head (deterministic exit-code comparison)

| gate                     | base | head | classification |
| ------------------------ | :--: | :--: | -------------- |
| `tests`                  |  0   |  0   | OK             |
| `validate`               |  0   |  0   | OK             |
| `structural:trust-fence` |  0   |  0   | OK             |

- `regressions[]`: **none** · `pre_existing[]`: **none**.
- This increment adds a new **product** Capability (`pharn-pipeline/grillers/testability/`, which
  `validate` now counts — GREEN, 2 capabilities), new **floor tooling** (`count-grillers.{mjs,test.mjs}`,
  in the `.dev/` surface `validate` excludes), and edits two **floor-ignored** grill commands
  (`.claude/commands/`). It touches **no** existing outside test, eval pair, or already-validated
  capability — so every outside gate is byte-identical at base and head by construction, and the new
  `count-grillers.test.mjs` (12 cases) rides inside the canonical `tests` glob at head (all pass).

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The verdict is the
deterministic exit-code comparison (`.dev/floor/check-regress.mjs verdict` → `no-regressions`, exit 0) —
zero LLM judgment in its core.

**Honest residual (P0/P7):** `/pharn-dev-regress` catches exactly what its deterministic suite catches —
nothing more. "No regressions" means **no deterministically-detectable breakage outside the feature
flipped pass→fail**, _not_ "nothing broke" and _not_ a judgment that the griller is correct or
well-designed (that is `/pharn-dev-verify` + human review). The orchestration (base resolution,
inside/outside partition, the scaffolding exclusion) is advisory; only the exit-code **comparison** is the
guarantee.
