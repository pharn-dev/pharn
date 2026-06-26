# PLAN — /regress stage (deterministic regression detection OUTSIDE the feature)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches the grill-command/pharn-eval pins (no drift)
- increment: build the `/regress` pipeline stage — `.claude/commands/regress.md` (orchestration) + `floor/check-regress.mjs` (the deterministic core: scope partition **and** verdict) + `floor/check-regress.test.mjs` (its hermetic proof). After `/build`, `/regress` re-runs the **existing** deterministic suite (`npm run check`: tests, `validate`, `check-structural`, **and** the style gates lint/format:check/lint:md) over the area **OUTSIDE** the feature, at the pre-build **baseline** and at HEAD, and reports any check that flipped **pass→fail** as a regression. It emits both a machine `regression-report.json` and a human `REGRESSION.md`. The verdict is a **deterministic comparison** (exit-code flip per gate) — **ZERO LLM judgment** in its core.
- layer(s): `.claude/commands/` (advisory orchestration, like `/plan` `/build` `/review` `/grill` `/pharn-eval`) **+** `floor/` (the guarantee — `check-regress.mjs` is floor/eval **infrastructure**, NOT a Capability, exactly like `floor/check-variance.mjs`). The floor (`floor/validate.mjs`) ignores **both** dirs, so the capability count stays **1**. # ARCHITECTURE.md §4
- constitution_refs: [P0, P1, P2, P3, P5, P6, P7]

---

## Step 0 — Discovery results (stated in the plan, as required; P6, live this run)

- **Floor is GREEN — 1 capability** (`node floor/validate.mjs .` → `FLOOR: GREEN — 1 capabilities checked in .`, run live). The 1 is `trust-fence`. A command under `.claude/commands/` **and** a helper under `floor/` are **both path-ignored** by the floor (`EXCLUDE_SEGMENTS` in `floor/validate.mjs:30` lists `.claude/commands/` and `floor/`; the five existing commands carry `role:` yet the count is 1; `check-structural.mjs` / `check-variance.mjs` live in `floor/` and are uncounted) ⇒ building `/regress` keeps the count at **1**.
- **Spec hash matches** the live recompute and the most recent pins (`features/grill-command/PLAN.md:3`, `features/pharn-eval/PLAN.md:3`) → no drift; `/build` will re-verify (fix #4).
- **`regress` already lives in the spec** (so this implements a named stage, not invents one):
  - `ARCHITECTURE.md:199` + `:122` — pipeline spine `spec → plan → grill → build → regress → verify → ship` (also `README.md`, `CLAUDE.md:148`).
  - `ARCHITECTURE.md:208` — the stage's typed-artifact row: `| regress | regression-report | regressions outside the feature |`. This plan's `regression-report.json` (machine) + `REGRESSION.md` (human) **are** that regression-report (see "Spec alignment").
- **Live git/state grounding (P6), shapes the baseline rule below:**
  - Working tree is **clean**, on `main`, `HEAD = 7204a5f`. `origin/main` exists (`git@github.com:pharn-dev/pharn.git`). Features are built on **branches** (`attempt-0-trust-fence`, `feature/grill-command`, …) then merged to `main` — so at `/regress` time the base is normally `merge-base(HEAD, origin/main)`; in a working-tree dogfood build (uncommitted changes on `main`) the base is `HEAD`.
  - The **one committed eval fixture pair** the suite can re-check: expected `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔ committed actual `features/trust-fence/findings.json` (verified live).
  - The **core** deterministic suite (`node --test …`, `node floor/validate.mjs .`, `node floor/check-structural.mjs …`) runs **without `npm ci`** (Node stdlib only). The **style** gates (`eslint` / `prettier` / `markdownlint-cli2`) need devDeps — relevant to the baseline-worktree cost named below.
- **No `regress.md`, no `floor/check-regress*.mjs`, and no `features/regress/` existed before this run** (clean slate; this plan is the first file).

---

## Files

> `## Files` is the build's writes-scope source (fix #7): `/build` runs `set-writes-scope.cjs --from-plan` over the back-tick paths below; they become the only writable paths (plus `.pharn/**`). `.claude/**` and `floor/**` are NOT in the fail-closed default-safe-set, so each must be listed here to be writable. Every path is a concrete literal.

- `floor/check-regress.mjs` — **NEW (the deterministic core — the floor of this increment).** A non-LLM, stdlib-only program modeled on `floor/check-variance.mjs` ("Floor/eval infrastructure — NOT a Capability; the floor capability count stays 1"). It owns the **whole deterministic verdict** in two phases (so the maximum surface is in tested Node, not Bash); the command owns only the I/O side-effects (git, worktree, running the suite, writing files). One cohesive axis — "the regress verdict" — exposed as two subcommands:
  - **`scope` (partition, runs BEFORE the suite):** `node floor/check-regress.mjs scope --changed <list> --declared <list> --tests <glob-or-list> --eval-pairs <list>`. Deterministic set ops (P5): `inside` = the changed-files list (from `git diff`); **assert `inside ⊆` declared writes** (a changed path outside the declared `writes:` is a **blocking fix#7 finding** — the build escaped its scope); derive the **OUTSIDE** gate inputs — outside test-files (`tests` universe minus `inside`), outside committed eval pairs (pairs whose files are all outside). Emits these lists (the command then runs exactly those at base + head). No git, no network — pure path-set membership over passed-in lists ⇒ trivially testable.
  - **`verdict` (compare, runs AFTER the suite):** `node floor/check-regress.mjs verdict <base-results.json> <head-results.json>`. Each `results.json` is a flat map `{ "<gate-id>": <exit-code int>, … }` produced by the command (one entry per outside-scoped gate; gate-ids `"tests"`, `"validate"`, `"lint"`, `"format"`, `"lint:md"`, `"structural:<expected-path>"`). Per gate-id present in **both**: `base==0 && head!=0` → **REGRESSION** (pass→fail flip outside the feature); `base!=0` → **pre-existing** (already red at baseline — **excluded**, never blamed on the feature, like `check-variance`'s `errored`-exclusion); `base==0 && head==0` → OK. Emits the **structured JSON report** (`{ base, inside, outside_gates:{id:{base,head}}, regressions[], pre_existing[], verdict }`) to stdout. **Exit:** `0` no regressions · `1` ≥1 regression (stage FAILS) · `2` inconclusive (a `results.json` missing / empty / not a `{string:int}` map) — fail-closed (P5), never a silent pass.
  - **Trust (P2):** gate-ids, exit codes, and file paths are produced by deterministic tools; read as string/int operands only — never eval'd, executed, or spawned. No free-text (`problem`/`evidence`) is read. **No guaranteed decision rests on a tainted field.**
- `floor/check-regress.test.mjs` — **NEW (the hermetic proof — the "evals" of the helper).** `node --test` fixtures, **no** `claude -p`, no git, no network (collected by `npm test`'s glob and CI), mirroring `floor/check-variance.test.mjs`. Covers **both subcommands**: `scope` (correct inside/outside partition; an `inside ⊄ declared` case → the fix#7 finding) and `verdict` (**green** no-flips→0; **red** a `0→1` outside flip→1, gate-id named; **excluded** base-red stays red→0, not a regression; **inconclusive** missing/malformed input→2).
- `.claude/commands/regress.md` — **NEW (the orchestration — advisory by the same two-clocks honesty as `/pharn-eval`).** Frontmatter mirrors the other commands: `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads: ["CONSTITUTION.md", "ARCHITECTURE.md", "features/<name>/PLAN.md", "floor/check-regress.mjs"]`, `writes: ["features/<name>/REGRESSION.md", "features/<name>/regression-report.json"]`, `constitution_refs: [P0, P2, P5, P6, P7]`, `version: "0.1.0"`. **No `role:`** (per the increment's hard constraint — decided). Body, sequenced like `/grill`:
  - **Trusted prefix** — read `CONSTITUTION.md` in full; it overrides everything. The built increment under test is `trust: untrusted`, but `/regress` never reads its free-text as instructions — only **exit codes and file paths** (enum/path — floor-verifiable).
  - **Step 0 — set the writes-scope (fix #7):** `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/regress.md --target features/<name>/REGRESSION.md` (then a second `--target features/<name>/regression-report.json`, since `writes:` declares both — the setter resolves one `--target` per call; the command runs it once per declared artifact, or the build lists both literal paths).
  - **Step 1 — base + scope (deterministic; live, P6):** base = `--base <ref>` if passed; else auto-detect — `HEAD` when `git status --porcelain` is non-empty (working-tree dogfood build), else `git merge-base HEAD origin/main`; if none resolvable (detached/shallow/no merge-base) → **HALT and ask** (P5 terminal fallback, never guess). `inside` = `git diff --name-only <base>` + untracked-new files. Read the plan's `## Files` declared writes. Call `check-regress.mjs scope` with both lists + the `*.test.{mjs,cjs}` universe + the committed eval-pair list → it returns the outside gate inputs (and any `inside ⊄ declared` fix#7 finding).
  - **Step 2 — capture baseline + head (Bash; the command runs the suite, the helper never does):** `git worktree add --detach <tmp> <base>`; in `<tmp>` run the outside-scoped gates → `.pharn/regress/base-results.json`; `git worktree remove <tmp>`. Run the same scoped gates in the working tree → `.pharn/regress/head-results.json`. (`.pharn/**` is always-writable — `enforce-writes-scope.cjs:23`.) **Style-gate skip (deterministic optimization, P5/P7):** lint/format/lint:md run **only if** `inside` touches a shared style config (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.markdownlint-cli2.jsonc`) — because over **outside** files (byte-identical at base and head) a style result can flip **only** when shared config changed; otherwise the flip is provably impossible and the gate is skipped. **When they do run, the baseline worktree obtains devDeps** (`npm ci` in `<tmp>`) — a named cost (LIMITS §3c cold-start analog), incurred only on a config-touching feature.
  - **Step 3 — the deterministic verdict:** `node floor/check-regress.mjs verdict .pharn/regress/base-results.json .pharn/regress/head-results.json` — capture its **stdout JSON** and read its **exit code** (0/1/2). The agent does **not** judge "is this really a regression" — a flipped gate **is** a regression (the helper says so).
  - **Step 4 — emit both artifacts + halt:** write `features/<name>/regression-report.json` = the helper's JSON verbatim (the machine §6 regression-report), and `features/<name>/REGRESSION.md` = a human render (base SHA, inside/outside partition, per-gate `base→head` exit codes, the regressions, and the **deterministic verdict** `REGRESSIONS: none` / `N outside the feature — stage FAILS`). End the turn; `/regress` does not invoke `/verify`.
- _(Runtime-only, not built here:)_ `features/<name>/REGRESSION.md` and `features/<name>/regression-report.json` are `/regress`'s **outputs at run time**, declared in `regress.md`'s `writes:`; they are **not** `/build` deliverables (not listed above, so not in this increment's build scope).

### Explicitly **not** touched (declared NOT written — keeps them out of build scope)

- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied). No reconciliation needed (see "Spec alignment").
- `floor/validate.mjs`, `floor/check-structural.mjs`, `floor/check-variance.mjs`, the hooks, `package.json`, `eslint.config.mjs`/`.prettierrc.json`/`.markdownlint-cli2.jsonc`, `.github/workflows/*` — **unchanged**. `/regress` **reuses** every check by invocation (incl. the `npm run` style scripts); it invents **no new check** and adds **no `--json` flag** to `validate.mjs` (declined under P7 — out of scope).
- `.claude/commands/{plan,build,review,grill,pharn-eval}.md` — **unchanged**.
- `pharn-contracts/*` — **cited, never edited** (P4).

---

## Contracts satisfied

- `ARCHITECTURE.md §2` (the floor — primitive #3, enum/regex/exit-code membership) — `check-regress.mjs`'s `verdict` is a **deterministic comparison of exit codes** (`base==0 && head!=0`), and its `scope` is **path-set membership** — both the canonical floor primitive. Cited, not restated (P4).
- `ARCHITECTURE.md §6:208` (the `regress | regression-report | regressions outside the feature` row) — `regression-report.json` **is** that regression-report (machine), `REGRESSION.md` its human render. No new artifact type invented.
- `ARCHITECTURE.md §7:234–241` (fix #3, the two gate kinds) — `check-regress.mjs`'s verdict is a **floor-gate** (verdict from actual content — exit-code flips, not LLM `severity`); the surrounding `/regress` orchestration (the agent choosing to run the suite) is the **advisory** half (the two-clocks split — Guarantee audit).
- `floor/check-variance.mjs` (the precedent, by **pattern**, not import) — same class: floor/eval infrastructure, NOT a Capability, deterministic over captured results, exit `0/1/2`, hermetic `*.test.mjs`. (Pattern reuse, no `reads:` edge; P3.)

---

## Evals to write (P1) — binds the helper's test, not a Capability

`/regress` is a **command** and `check-regress.mjs` a **floor helper** — neither is a Capability (no floor-counted `role:`; both in floor-ignored dirs), so P1's "no Capability ships without evals" does not bind them as Capabilities (as `/plan` … `/pharn-eval` ship no eval dirs and `check-structural`/`check-variance` ship a `*.test.mjs`). The testable surface is the helper, and it ships its proof in the same step (the spirit of P1):

- `floor/check-regress.test.mjs` (hermetic) → `node --test` proves **both subcommands**: `scope` (partition + the `inside ⊄ declared` fix#7 finding) and `verdict` (green→0, red→1 with gate-id, excluded→0, inconclusive→2).
- **Floor check after build:** `node floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged).
- **Dogfood verification:** after `/build`, run `/regress` on a real built increment; confirm `regression-report.json` + `REGRESSION.md` are well-formed and the verdict matches `check-regress.mjs`'s exit code. (Self-referential note: `/regress` on **this** increment sees `floor/check-regress.test.mjs` as `inside` → excluded from the outside suite — correct; CI's `npm test` covers a feature's own new test.)

---

## Guarantee audit (P0) — the honest two-clocks split (the point of `/regress`)

- **"Any regression OUTSIDE the feature that a deterministic check covers is caught — deterministically"** → **FLOOR (exit-code comparison).** A **real guarantee**: the verdict rests entirely on `check-regress.mjs` comparing exit codes (`base==0 && head!=0`), never on model judgment (a model detects regressions unreliably; the floor comparison is reliable). Adding the style gates **widens** what the suite covers (lint/format/md-lint regressions are now caught too) without weakening the guarantee — they are deterministic tools, compared the same way.
- **The residual, named not hidden (P0/P7):** `/regress` catches **exactly what its suite catches — nothing more.** A regression no deterministic check covers (a broken behavior with no test/rule/eval) is **invisible**. The guarantee is "deterministically-detectable breakage outside the feature is caught," **not** "nothing broke."
- **"`/regress` ran the suite correctly"** → **ADVISORY (the orchestration clock).** The agent choosing to run the gates, scope them, and obtain the baseline is orchestration; like `/pharn-eval` end-to-end, that half is advisory. **Only the verdict is floor-grade.**
- **"`/regress` may write only `REGRESSION.md` + `regression-report.json`"** → **FLOOR: hook (fix #7).** `set-writes-scope.cjs` + `enforce-writes-scope.cjs` pin both paths. **Honest caveat (mirrors `/pharn-eval`):** the suite runs, the `git worktree`/`npm ci` dance, and the `.pharn/regress/*.json` captures are **Bash**, which the `Write|Edit|MultiEdit` hook does **not** gate — so fix #7 enforces only the two artifact Writes; `.pharn/**` scratch is always-writable. Stated, not hidden.
- **"The increment adds no counted capability"** → **FLOOR: enum/grep (`floor/validate.mjs`).** Both new files are in floor-ignored dirs ⇒ `GREEN — 1 capabilities`.
- **Named granularity limits (honest, not silent gaps):** (a) `validate` runs **whole-repo** (no outside-only CLI scope), so a `validate` flip is reported at repo granularity — but `validate` is already GREEN post-`/build` (Step 3 halts on RED), so it rarely fires; per-file precision lives in the scoped `tests`/`structural:*` gates. (b) **style-gate cost:** running lint/format/md-lint at baseline needs `npm ci` in the worktree; the deterministic **config-touch skip** (P5) confines that cost to features that change shared style config — a real flip can occur only then.

> **No claim is a guarantee without a floor reduction.** Verdict → exit-code comparison (§2); path-pinning → writes-scope hook; count → `validate`. Everything the **agent** does (running the suite) is labeled **advisory**.

---

## Trust audit (P2)

- **Input under test:** the built increment is `trust: untrusted`, but `/regress` and `check-regress.mjs` read only **deterministic-tool outputs** — exit codes (ints) and **file paths** (`git diff`, path membership) — the enum-gated / floor-verifiable class.
- **Taint propagation:** a finding's free-text (`problem`/`evidence`) is **never** read by the verdict (`check-regress.mjs` compares only exit codes); the `regression-report.json` it emits contains gate-ids + ints + paths, no untrusted free-text. The only free-text is `REGRESSION.md`'s human summary, which **gates nothing**. **No guaranteed decision rests on a tainted field** (mirrors `check-structural`/`check-variance`).
- **No new egress, no `claude -p`, no LLM-judge** in the core ⇒ `/regress` adds **no** new instance of the named downstream-free-text residual (`LIMITS.md §2`).

---

## Determinism audit (P5)

- **Deterministic branches (membership / equality / existence):** base = explicit `--base` else auto-detect (`git status --porcelain` empty? equality on git state); `inside` membership (`git diff` set); `inside ⊆ declared writes` (subset test → finding on violation); outside-gate scoping (path-not-in-`inside`); **style-gate run/skip** (does `inside ∩ style-config-set ≠ ∅`? membership); the verdict (`base==0 && head!=0`, integer equality). Every branch is membership/equality, not classification.
- **Terminal fallbacks are "ask"/"loud", never "guess":** no resolvable base → **HALT and ask**; a `results.json` missing/malformed → `verdict` exits **`2` inconclusive**, never a silent pass.
- **No LLM in the verdict:** the only irreducible judgment is the human reading `REGRESSION.md`; the pass/fail is `check-regress.mjs`'s exit code.

---

## Spec alignment (no reconciliation needed — reported with file:line)

Building `/regress` did **not** surface any conflict requiring a human edit to a trusted doc:

- `ARCHITECTURE.md:208` defines the artifact as a **regression-report** keyed on **"regressions outside the feature"** — `regression-report.json` is exactly that (machine), `REGRESSION.md` its human render. The `.json` form matches the table's machine siblings (`build-summary.json`). No new artifact type invented.
- `ARCHITECTURE.md §2:36–45` supplies the exit-code/enum comparison the verdict uses; `§7:234–241` the floor-gate vs advisory-gate split the Guarantee audit applies.
- `ARCHITECTURE.md §6`'s spine lists `regress` **between `build` and `verify`** — this increment builds `regress` only; `verify`/`ship` remain deferred (P7), and `/regress` does not invoke them.

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-26; "Approve with changes" → all four changes applied)

The two design forks and the role deviation resolved to the recommended options; the human then requested four changes, now folded into the plan above:

1. **Scope boundary** → **(A) Git diff vs base, cross-checked `⊆` the plan's `## Files`** (a diff escaping declared scope is a blocking fix#7 finding). Doubly grounded: verified (git) ∩ declared (plan). _Declined:_ declared-only (imprecise; misses escaped writes) and diff-only (drops the fix#7 composition).
2. **Baseline** → **(A) Recompute at the base commit via a throwaway `git worktree`** — deterministic, reproducible (immutable base SHA), non-destructive, no trusted cache. _Declined:_ a cached `regression-baseline.json` (a poisonable trusted artifact — the P0/P2 disease) and "assume green-`main`" (asserts an unverified invariant).
3. **`role:` on `regress.md`** → **omit** per the hard constraint (one role-less command among five; mechanically harmless — the floor ignores `.claude/commands/`, count stays 1).
4. **Change — suite breadth** → **add the style gates** (`lint` / `format:check` / `lint:md`, the full `npm run check`) to the deterministic suite, with the deterministic **config-touch skip** + named `npm ci`-at-baseline cost (P5/P7, LIMITS §3c).
5. **Change — machine artifact** → **also emit `features/<name>/regression-report.json`** (the §6 machine regression-report) alongside `REGRESSION.md`; both declared in `writes:`.
6. **Change — helper responsibilities** → **partition + compare both in the tested helper** (`scope` + `verdict` subcommands); the command does only git/worktree/run-suite/write I/O. Max deterministic-tested surface.
7. **Change — base-selection** → **`--base <ref>` explicit override + auto-detect default** (uncommitted→HEAD, else `merge-base(HEAD, origin/main)`), terminal fallback **HALT and ask**.

> **RESOLVED & APPROVED-WITH-CHANGES (2026-06-26).** All four changes applied above; the spec hash `11cd9ad5…` re-verified (no drift, fix #4). Ready for `/build` to execute this increment.
