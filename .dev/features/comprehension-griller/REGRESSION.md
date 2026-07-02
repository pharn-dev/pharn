# REGRESSION — comprehension-griller

- **Base:** `HEAD` (`6ee14e4`) — working-tree dogfood build (`git status --porcelain` non-empty; the feature is entirely new untracked files, so the base is the committed HEAD without it).
- **Verdict (deterministic, `.dev/floor/check-regress.mjs`): `no-regressions` — exit 0.** No deterministically-detectable breakage outside the feature.

## Inside / outside partition (fix #7 scope check: `escaped: []`, exit 0)

**Inside** (the changed scope — 7 product `## Files` + 2 pipeline-trace artifacts written by plan/grill,
all ⊆ declared, so no build escape):

- `pharn-pipeline/grillers/comprehension/comprehension.md` + its 6 eval files
- `.dev/features/comprehension-griller/PLAN.md`, `GRILL.md`

**Outside** gates (must not flip GREEN→RED): the whole `node --test` suite, `validate`, and the one
committed eval pair `structural:trust-fence`.

## Per-gate exit codes: base → head

| gate                     | base | head | result |
| ------------------------ | ---- | ---- | ------ |
| `tests` (`node --test`)  | 0    | 0    | clean  |
| `validate`               | 0    | 0    | clean  |
| `structural:trust-fence` | 0    | 0    | clean  |

- **regressions[]:** none
- **pre_existing[]:** none

Style gates (`lint` / `format:check` / `lint:md`) were **skipped** deterministically: `inside` touches no
shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`,
`.markdownlint-cli2.jsonc`), so an outside style flip is provably impossible.

## Capture note (honest — a harness bug I hit and corrected, not a product signal)

My first two capture attempts recorded `tests: 1` at **both** base and head. That was a **word-splitting
bug in my ad-hoc capture script** — the test-file list was passed to `node --test` as a single
concatenated string, so it reported `Could not find '<list>'` and ran **zero** tests (exit 1). Because it
was equally broken on both sides it never produced a _false regression_, but it mislabeled a GREEN gate as
red. Corrected by inlining `$(git ls-files …)` so the list word-splits into separate arguments; the gate
then reads its true value **0** at both base and head. Cross-checked against the canonical aggregate
`npm test` → **exit 0, 218/218 pass, 0 fail**. The report above reflects the corrected capture.

## Verdict

**REGRESSIONS: none — no deterministically-detectable breakage outside the feature.** The comprehension
griller is additive (new files; `count-grillers` picks it up dynamically, no floor edit), so the outside
surface is byte-identical at base and head and nothing could flip.

Honest residual (P0/P7): `/pharn-dev-regress` catches **exactly what its deterministic suite catches —
nothing more.** This certifies only the outside-scope comparison; it is **not** a claim that "nothing
broke" in any behavior no test/rule/eval covers. It does not certify the feature is good — that is
`/pharn-dev-verify` (floor gates) and the human's call.
