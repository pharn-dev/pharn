# REGRESSION — documentation-griller

- **Base:** `HEAD` (`615f1df`) — working-tree dogfood build (`git status` non-empty → base = HEAD, the pre-build state; the feature's files are untracked and absent from the baseline worktree).
- **Verdict (deterministic, `.dev/floor/check-regress.mjs`):** **`no-regressions`** — exit 0. Zero LLM judgment: the verdict is a pure base→head exit-code comparison.

## Inside / outside partition (deterministic; `scope` exit 0, no fix#7 escape)

- **Inside (12 changed paths, all ⊆ declared writes):** the 10 product files under `pharn-pipeline/grillers/documentation/**` plus the feature trace `.dev/features/documentation-griller/{PLAN,GRILL}.md`. `escaped: []` — the build stayed within its plan's `## Files` (+ the feature trace glob).
- **Outside gates run (identical set at base and head):** `tests` (all 19 committed `*.test.{mjs,cjs}` — none inside the feature), `validate` (whole-repo), `structural:trust-fence` (the one committed eval pair, `pharn-review/trust-fence/…expected-injection-comment.json` ↔ `.dev/features/trust-fence/findings.json`).
- **Style gates (`lint`/`format:check`/`lint:md`):** **skipped** (deterministic P5/P7 optimization) — `inside` touches no shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.markdownlint-cli2.jsonc`), so an outside-file style flip is provably impossible.

## Per-gate exit codes (base → head)

| gate                     | base | head | flipped? |
| ------------------------ | ---- | ---- | -------- |
| `tests` (208 tests)      | 0    | 0    | no       |
| `validate` (whole-repo)  | 0    | 0    | no       |
| `structural:trust-fence` | 0    | 0    | no       |

- `tests`: 208 tests / 208 pass / 0 fail at **both** base and head (the griller adds no `*.test.*` files, so the count is unchanged). `validate`: GREEN both sides (9 capabilities at base → 10 at head — an addition, not a flip). `structural:trust-fence`: the committed pair is untouched by this feature, identical both sides.
- `regressions: []` · `pre_existing: []`.

> **Capture note (honest):** an initial capture recorded a spurious `tests:1` at both base and head — a shell word-splitting artifact that passed the 19 test paths as a single argument (`Could not find '<list>'`, 0 tests actually run), identical on both sides so it produced no false flip. Re-captured with correct word-splitting: 208/208 pass both sides (matching the project's own `npm test`, exit 0). The table above is the corrected, true state.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the documentation-griller feature.**

This certifies **only the comparison**: `/pharn-dev-regress` catches exactly what its deterministic suite catches (the committed tests, whole-repo `validate`, and the one committed structural eval pair) — **nothing more**. It is **not** a claim that "nothing broke," and not a judgment that the feature is good (that is the human's call at the post-review gate). A breakage no deterministic check covers would be invisible here (P0/P7, named not hidden).
