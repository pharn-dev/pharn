# REGRESSION — observability-griller

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** (`.dev/floor/check-regress.mjs verdict` → `verdict: no-regressions`, exit 0.)

- **Base:** `HEAD` (working-tree dogfood build — `git status --porcelain` non-empty).
- **Inside (this feature's build outputs, 12):** the observability griller + its 10 eval files + the two `.dev/floor/scan-plan-observability.*` files. _(The pipeline stage-trace `.dev/features/observability-griller/{PLAN,GRILL,…}.md` and the unrelated untracked `privacy-griller/` leftover were excluded from `--changed` — they are not `/pharn-dev-build` outputs of this increment.)_
- **Outside gates (base → head):**

  | gate                   | base | head | flip?             |
  | ---------------------- | ---- | ---- | ----------------- |
  | validate               | 0    | 0    | no                |
  | structural:trust-fence | 0    | 0    | no                |
  | tests                  | 1    | 1    | no (pre-existing) |

- **Style gates skipped** (deterministic P5 optimization): `inside` touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, …), so a style flip over byte-identical outside files is impossible.

**On the `tests` gate (honest, P6/P7).** The outside-test gate was recorded as `1` at **both** base and head, so it is **pre-existing** — **not** a regression (a regression is a `0→1` flip; this is `1→1`). It is a **flaky** result of the subset invocation `node --test <outside *.test.*>`: it returns `0` on some runs and `1` on others, while the full `npm test` (the verify gate) passes cleanly and stably (exit 0). The flakiness lives in the pre-existing committed test suite (it reproduces at the un-modified baseline HEAD), is independent of this increment, and does not flip → no regression. Flagged as an observation for a future (separate-axis) increment; not this increment's to fix (P7).

**Honest residual:** `/pharn-dev-regress` catches exactly what its deterministic suite catches — nothing more. The verdict is "no deterministically-detectable breakage outside the feature," not "nothing broke."
