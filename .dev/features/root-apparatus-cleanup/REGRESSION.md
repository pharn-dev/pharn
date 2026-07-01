# REGRESSION — root-apparatus-cleanup

**Question:** did deleting the four #19-splice root leftovers break anything **outside** the feature?

- **Base:** `cbda487` (working tree dirty with the staged deletions ⇒ `base = HEAD`, per the
  deterministic base rule).
- **Verdict (deterministic, `.dev/floor/check-regress.mjs verdict`):**
  **`no-regressions`** — exit 0.

## Inside (changed scope) — the feature's own file changes

The 15 deleted files (all `git rm`): `floor/check-ship.mjs`, `floor/check-ship.test.mjs`,
`features/ship-loop/` (6), `features/ship-gated/` (6), `.claude/commands/ship.md`.
`scope` confirmed **inside ⊆ declared** (`escaped: []`) — no write escaped the plan's `## Files`.
(The pipeline's own `.dev/features/root-apparatus-cleanup/*` process artifacts are the audit trail,
not part of `inside` — same convention as prior increments' reports.)

## Outside gates — same set at base and head (per-gate `base → head` exit code)

| gate                       | base | head | result |
| -------------------------- | ---- | ---- | ------ |
| `tests` (15 outside files) | 0    | 0    | OK     |
| `validate` (whole-repo)    | 0    | 0    | OK     |
| `structural:trust-fence`   | 0    | 0    | OK     |

- **Style gates (`lint` / `format:check` / `lint:md`): SKIPPED** deterministically — `inside` touches
  no shared style config (`eslint.config.mjs` / `.prettierrc.json` / `.prettierignore` /
  `.markdownlint-cli2.jsonc`), so an outside style flip is provably impossible.
- **`tests` count:** the outside 15-file suite is **167 pass / 0 fail** at head (was 179 before —
  the deleted stale root `floor/check-ship.test.mjs` contributed 12 tests that no longer double-run;
  the live `.dev/floor/check-ship.test.mjs` 16-test superset remains). 167-pass is a **pass→pass**, not
  a flip.
- **Harness note (not a finding):** the tests gate must be invoked with the file list as **separate
  argv** (a bash/zsh array); under zsh an unquoted list collapses to one argument and `node --test`
  reports "Could not find …" (exit 1) — a harness artifact, corrected here. `--test-concurrency=1`
  is used for a deterministic exit code (the documented parallel-scheduling flake on partial sets).

## `regressions[]`: none · `pre_existing[]`: none

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.**

_Honest residual (P0/P7):_ `/pharn-dev-regress` catches **exactly what its suite catches — nothing
more.** A broken behavior with no test / rule / eval is invisible here. The claim is
"deterministically-detectable breakage outside the feature is caught," **not** "nothing broke."
