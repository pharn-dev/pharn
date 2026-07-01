# REGRESSION — error-handling-griller

- **Base:** `HEAD` (`9a34451`) — working-tree dogfood build (`git status --porcelain` non-empty → `base = HEAD`).
- **Verdict (FLOOR, `.dev/floor/check-regress.mjs verdict`):** **`no-regressions`** (exit 0).

## Inside / outside partition (deterministic, `check-regress.mjs scope` — exit 0, no escape)

**Inside (the feature's changed scope, 12 files):** the 10 product files under
`pharn-pipeline/grillers/error-handling/**` + the 2 build-trace files
`.dev/features/error-handling-griller/{PLAN,GRILL}.md`. All 12 matched the declared writes
(`## Files` + the `.dev/features/error-handling-griller/**` build-trace safe-set) → **`escaped: []`**
(the build did not write outside its plan's `## Files`).

**Outside (re-checked at base and head):** 16 test files (`.claude/hooks/*.test.cjs` +
`.dev/floor/*.test.mjs`), the whole-repo `validate`, and 1 committed eval pair
(`trust-fence` expected ↔ `.dev/features/trust-fence/findings.json`). Style gates
(`lint`/`format:check`/`lint:md`) were **skipped** by the deterministic config-touch rule — the inside
set touches no shared style config, so an outside style flip is provably impossible (no `npm ci` needed).

## Per-gate exit codes: base → head

| gate                     | base (clean `9a34451`) | head (working tree) | result |
| ------------------------ | ---------------------- | ------------------- | ------ |
| `tests`                  | 0                      | 0                   | OK     |
| `validate`               | 0                      | 0                   | OK     |
| `structural:trust-fence` | 0                      | 0                   | OK     |

- `regressions[]`: **none**
- `pre_existing[]`: **none**

`validate` stays GREEN across the flip (baseline = 4 capabilities, head = 5 — the new
`error-handling` griller added — both exit 0), so the one gate the feature actually affects did not
regress.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.**

Honest residual (P0/P7): `/pharn-dev-regress` catches **exactly what its suite catches — nothing more**.
A regression no deterministic check covers (a broken behavior with no test / rule / eval) is invisible
here. The guarantee is "deterministically-detectable breakage outside the feature is caught," **not**
"nothing broke." The verdict rests entirely on `check-regress.mjs`'s exit-code comparison; the
orchestration around it (base choice, partition, running the suite) is advisory.

---

> **Run note (concurrency).** The working tree also held one **untracked foreign file** from a
> separate, now-killed concurrent run — `.dev/features/privacy-griller/PLAN.md` — which is **not** part
> of this feature. It was **excluded from the `--changed` set** (it is provably not this build's output:
> fix #7 _denied_ this run's writes whenever the privacy run's scope was active), so it neither counted
> as an escape nor polluted the partition. It was **not deleted** (it belongs to another run). The
> `observability-griller` dir was empty (no files) and did not appear in `git` output.
