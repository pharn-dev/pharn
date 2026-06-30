# REGRESSION — dev-product-boundary

- **Stage:** `/pharn-dev-regress` (detect pass→fail flips OUTSIDE the just-built feature).
- **Base:** `defdc0d` (HEAD) — working-tree dogfood build (`git status --porcelain` non-empty → base = HEAD, P5).
- **Verdict:** **NOT-APPLICABLE / degenerate** for this increment. **No base↔head comparison was run** (human-approved 2026-06-30). This is **not** a "no-regressions" certification (P0).

## Why `/pharn-dev-regress` is degenerate for this increment

This increment is a **repo-wide `git mv` MOVE** of the build apparatus into `.dev/`. Three structural reasons make the stage's deterministic core ill-posed here:

1. **The checkers themselves relocated.** `/pharn-dev-regress` re-runs gates (`validate`, `node --test`, `check-structural`) at the base commit and at HEAD and compares exit codes. But `floor/validate.mjs` (base, old layout) → `.dev/floor/validate.mjs` (head, new layout): the gate **binary moved**, so "the same gate at base and head" is ill-posed at the path level — the comparison the verdict rests on cannot be formed cleanly.
2. **Nothing is meaningfully "outside" a whole-repo move.** The only unchanged product surface — `pharn-review/trust-fence/` (the lens, stayed at root) and `pharn-contracts/` — is already covered: `node .dev/floor/validate.mjs .` → **GREEN — 1 capabilities** at HEAD.
3. **The scope-partition false-positives on the moves.** The deterministic changed-vs-declared comparison:

   | metric                                          | count   |
   | ----------------------------------------------- | ------- |
   | changed vs HEAD (+ untracked)                   | **127** |
   | declared in the plan's `## Files` (Write-scope) | 32      |
   | changed **outside** the declared `## Files`     | **95**  |

   `check-regress.mjs scope` would exit **1** (blocking "build escaped its `## Files`") on those 95. **But that is a false positive for a move-increment:** the 95 are the **`git mv` relocations** (the `features/`, `floor/`, `memory-bank/` trees + the 9 command renames), declared in the plan's **`### Moves`** section. **fix #7 gates `Write`/`Edit`/`MultiEdit`, not `git mv` (Bash)** — so moves are _intentionally_ outside the Write-scope `## Files`, and `scope` cannot distinguish an intended relocation from a Write that escaped its scope. No `/pharn-dev-build` Write escaped scope (every Write was hook-enforced within the 32-path scope).

## Decision (human-approved)

**Defer the "still green" check to `/pharn-dev-verify`**, which OWNS the HEAD-state gate verdict (`npm test` + `.dev/floor/validate.mjs` GREEN + `npm run lint`) — the meaningful "is the feature correct at HEAD" signal, at the whole-repo granularity that fits a move. Running a _faithful_ base↔head comparison would additionally require `npm ci` + the style gates (`lint`/`format:check`/`lint:md`) in a base worktree **twice** (the `inside` set touched shared style config — `eslint.config.mjs`, `.prettierignore`, `.markdownlint-cli2.jsonc`), the expensive cold-start case (`LIMITS.md §3c`), and would largely confirm green↔green (HEAD is committed-green).

## HEAD-state signals already green (advisory; the verdict is `/pharn-dev-verify`'s)

- `node .dev/floor/validate.mjs .` → **GREEN — 1 capabilities**
- floor suite (`.dev/floor/*.test.mjs`, incl. the 2 depth-fixed tests) → green
- ESLint **does** traverse `.dev/` (moved checkers stay linted)
- functional stale-ref grep (commands / CI / configs / docs) → clean

## Honest residual

`/pharn-dev-regress` catches exactly what a base↔head comparison of its suite catches — **nothing here**, because no such comparison was meaningfully runnable for a whole-repo apparatus move. **REGRESSIONS: not assessed by `/pharn-dev-regress` — deferred to `/pharn-dev-verify`.** This certifies nothing about the feature; it records, honestly, that the stage was degenerate and where the real green-check lives.
