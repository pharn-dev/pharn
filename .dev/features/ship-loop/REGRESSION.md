# REGRESSION — ship-loop

**Question:** did building the `--loop` increment (`ship.md` edit + `floor/check-ship.mjs` + its test)
break anything **OUTSIDE** the feature? **Verdict (FLOOR — `floor/check-regress.mjs verdict`, exit 0):**
**`no-regressions`** — no deterministically-detectable breakage outside the feature.

> The verdict is the **only** floor-grade thing here: a deterministic exit-code comparison
> (`ARCHITECTURE.md §2` primitive #3). Base detection, partition, and running the suite are **advisory
> orchestration** (the two-clocks split).

## Base + partition (live, P6)

- **Base:** `eb8fea4` (dirty-tree dogfood → `base = HEAD`). The `/plan` artifact
  `features/ship-loop/PLAN.md` was **committed** at this base; the 3 `/build` outputs left
  **uncommitted** as the feature under test — so the partition resolves to `inside = {ship.md,
check-ship.mjs, check-ship.test.mjs}` and the `/plan` artifact never enters `inside` (avoids the false
  fix#7 escape, CF-1; same discipline as `ship-gated`).
- **Inside (changed scope):** `.claude/commands/ship.md`, `floor/check-ship.mjs`,
  `floor/check-ship.test.mjs` — exactly the plan's `## Files` `declared` writes.
  `check-regress.mjs scope` → `escaped: []` (no scope breach).
- **Outside gates (run identically at base and head):** the 9 committed `*.test.*`, `validate`
  (whole-repo), and the committed eval pair
  `pharn-review/trust-fence/evals/expected/expected-injection-comment.json ↔ features/trust-fence/findings.json`.
  The feature's **own** test `floor/check-ship.test.mjs` is **inside** → correctly **not** an outside
  gate (it is exercised by `/verify`'s `npm test`, not here).
- **Style gates (`lint` / `format:check` / `lint:md`): SKIPPED** (deterministic, P5/P7) — `inside` touches
  no shared style config; an outside style result cannot flip; no `npm ci`.

## Per-gate comparison (base → head exit codes)

| gate                                                       | base | head | result |
| ---------------------------------------------------------- | ---- | ---- | ------ |
| `tests` (9 outside `*.test.*`)                             | 0    | 0    | OK     |
| `validate` (`floor/validate.mjs .`)                        | 0    | 0    | OK     |
| `structural:expected-injection-comment.json` (trust-fence) | 0    | 0    | OK     |

- **`regressions`:** none.
- **`pre_existing`:** none (no gate was already red at baseline).

## Why a clean verdict is expected here

The `--loop` increment adds a new `floor/` helper + edits a `.claude/commands/` markdown file — **both
floor-ignored** by `validate` — and the new `check-ship.mjs` is imported by **nothing outside the
feature** (only its own colocated test, which is `inside`). So no outside gate can read the changed
files, and a base→head flip is structurally impossible. The clean verdict confirms the **chain +
partition** ran correctly more than it stresses the comparison.

## Honest residual (P0/P7)

`/regress` catches **exactly what its suite catches — nothing more.** It certifies the **comparison**
("deterministically-detectable breakage outside the feature is caught"), **not** that the increment is
whole or correct — and in particular it does **not** exercise `--loop`'s orchestration _behavior_ (that
is a live-dogfood concern; the floor `check-ship.mjs` logic is covered by its own hermetic test, run by
`/verify`'s `npm test`, not here).

**Next:** `/verify features/ship-loop/PLAN.md` (floor gates own the verdict; `npm test` will run the 12
`check-ship` tests), then `/review`. The verdict's exit code (`0`) decides this stage.
