# PLAN — dev/product boundary (move build apparatus into `.dev/`)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read this run)
- increment: Draw the dev/product boundary in the filesystem — move the build apparatus (`floor/`, `features/`, `memory-bank/`) under `.dev/`, rename the 9 build commands to the `pharn-dev-` prefix, update every path/glob/enum/exclusion that referenced the old locations, and create a root `features/` home for product-pipeline artifacts — with **zero behavior change**.
- layer(s): build apparatus + repo configuration + root docs — **not** a product layer (`ARCHITECTURE.md §4`). This increment adds no `pharn-*` capability; it relocates the tooling that builds them and the artifacts of building.
- constitution_refs: [P0, P2, P3, P5, P6, P7]

## Summary — the boundary (decided by the human; this plan only mechanizes it)

`validate.mjs` already path-ignores the apparatus (`floor/`, `.claude/commands/`), so the dev/product
split exists **in code** but not **in structure** — fragile (a new apparatus folder must be remembered
in `EXCLUDE_SEGMENTS`). This increment makes the boundary **structural**, so packaging later =
"ship root minus `.dev/`" and every future product capability lands on the product side from the start.

- **Moves under `.dev/`** (apparatus a contributor uses, not what a user receives): `floor/` →
  `.dev/floor/`, `features/` → `.dev/features/` (build-loop audit trails), `memory-bank/` →
  `.dev/memory-bank/`.
- **Stays at root** (product + foundation a user clones): `pharn-review/`, `pharn-contracts/`, the four
  trusted docs (byte-unchanged), `README.md`/`LICENSE`/`CHANGELOG.md`/`SECURITY.md`, standard repo root.
- **New root `features/`** = product-loop artifacts (`SPEC.md` from a future `/pharn-spec`, …),
  mirroring `.dev/features/` but for the product loop. Created with a `README.md` that explains it.
- **Command naming:** the 9 build commands gain the `pharn-dev-` prefix (`plan→pharn-dev-plan`, …,
  `pharn-eval→pharn-dev-eval`). `.claude/commands/` and `.claude/hooks/` **cannot** move (Claude Code
  reads them there), so the dev/product command split is by **name (prefix)**, not folder. Future
  product commands use `pharn-` without `-dev-`.

## Files (the writes-scope — concrete create/edit targets; `/build` Step 0 reads these via `--from-plan`)

Floor checkers + their tests (edited **after** the `git mv` of `floor/`, at their new `.dev/` paths):

- `.dev/floor/validate.mjs` — `EXCLUDE_SEGMENTS`: drop the `/floor/` special-case, add `/.dev/` (exclude the apparatus **wholesale**). Behavior identical: exclude apparatus, scan the product surface.
- `.dev/floor/count-verifiers.mjs` — same `EXCLUDE_SEGMENTS` swap; it **mirrors** validate byte-for-byte by design (its own header asserts this, closing verifier-membership-frontmatter F1) — so it must change identically.
- `.dev/floor/check-provenance.mjs` — `TARGET_ENUM` (line 37) `memory-bank/{lessons-learned,pattern-library}.md` → `.dev/memory-bank/…`. The canon gate now points at canon's new home; gate behavior identical.
- `.dev/floor/check-provenance.test.mjs` — `target:` fixtures `memory-bank/…` → `.dev/memory-bank/…` (match the new enum). Required for green.
- `.dev/floor/count-verifiers.test.mjs` — the apparatus-exclusion case (line ~202) synthetic `floor/fake-verifier.md` → `.dev/floor/fake-verifier.md` (keeps testing the **new** exclusion). `.claude/commands/also.md` stays (commands stay at root).
- `.dev/floor/validate.test.mjs` — **add** a `.dev/`-wholesale-exclusion test: a temp repo with a role-bearing `.md` under `.dev/…` **and** a product capability at root → assert the `.dev/` one is NOT counted and the product one IS (locks the boundary on the floor — the user-requested confirmation).
- `.dev/floor/check-variance.test.mjs` — **(build-time discovery, human-approved 2026-06-29)** `const REPO = join(here, "..")` → `join(here, "..", "..")`. The move added the `.dev/` level, so the depth-1 repo-root derivation now resolves to `.dev/` instead of the repo root, and the fixtures' `file_resolves` paths (`pharn-review/…`) no longer resolve. Squarely the increment's charter ("update every path broken by the move"); discovery missed it (it verified fixture-location via `import.meta.url`, not repo-root derivation).
- `.dev/floor/check-structural.test.mjs` — same `const REPO = join(here, "..")` → `join(here, "..", "..")` repo-root depth fix (same root cause; same build-time discovery).

Artifact-home READMEs:

- `.dev/features/README.md` — (edited after move) reword to "**build-loop** audit trails: how each increment of **building PHARN itself** was planned/grilled/built/reviewed."
- `features/README.md` — **new** root home: "**product-loop** artifacts (`SPEC.md`, …) a PHARN **user** produces; mirrors `.dev/features/` for the product pipeline."

The 9 renamed commands (edited after `git mv` to the `pharn-dev-` name; update `node floor/…`→`node .dev/floor/…`, `features/<name>/…`→`.dev/features/<name>/…`, the `--from-frontmatter .claude/commands/<self>.md` self-reference to the new name, and — for `pharn-dev-ship` — the sibling-command references):

- `.claude/commands/pharn-dev-plan.md`
- `.claude/commands/pharn-dev-build.md`
- `.claude/commands/pharn-dev-grill.md`
- `.claude/commands/pharn-dev-regress.md` — also `reads: floor/check-regress.mjs`→`.dev/floor/…`
- `.claude/commands/pharn-dev-verify.md` — also `reads: floor/check-verify.mjs`→`.dev/floor/…`
- `.claude/commands/pharn-dev-review.md`
- `.claude/commands/pharn-dev-ship.md` — also the `node floor/check-ship.mjs` + every sibling-stage reference (`/plan`→`/pharn-dev-plan`, …) and `features/<name>/…`→`.dev/features/<name>/…`
- `.claude/commands/pharn-dev-memory-promote.md` — also `memory-bank/<canon-file>`→`.dev/memory-bank/…`, `floor/check-provenance.mjs`→`.dev/floor/…`, `features/<name>/REVIEW.md`→`.dev/features/<name>/REVIEW.md`
- `.claude/commands/pharn-dev-eval.md` — also `node floor/check-variance.mjs`→`.dev/floor/…`; `writes: ["runs/**"]` unchanged (see "not touched")

Repo configuration + CI (the silent-drop surface — edited in place):

- `package.json` — `test` script: append `".dev/**/*.test.mjs" ".dev/**/*.test.cjs"`. **Proven necessary** (probe below): `**/*.test.mjs` does NOT descend dot-dirs, so without this the 8 floor suites are **silently dropped**.
- `.github/workflows/floor.yml` — same `.dev/**` test-glob append (line 26) + `node floor/validate.mjs .`→`.dev/floor/validate.mjs .` (line 28).
- `.github/workflows/ci.yml` — `node floor/validate.mjs .`→`.dev/floor/validate.mjs .` (line 35); confirm its test step uses `npm test`/`npm run check` (so the package.json glob covers it) and add `.dev/**` if it inlines its own glob.
- `.markdownlint-cli2.jsonc` — `globs` add `".dev/**/*.md"` (preserve lint coverage of the moved markdown — `**` does not descend dot-dirs); `ignores` `floor/test-fixtures`→`.dev/floor/test-fixtures`.
- `.prettierignore` — `floor/test-fixtures`→`.dev/floor/test-fixtures` (Prettier **does** descend dot-dirs — it already ignores `.claude/settings*.json` — so the malformed fixtures must stay ignored at the new path).
- `eslint.config.mjs` — `ignores` `floor/test-fixtures/**`→`.dev/floor/test-fixtures/**`. **Verify `.dev/` lint coverage** (the ESLint twin of the test-glob dot-dir trap, GRILL F-P6): confirm `eslint .` (flat config) actually traverses `.dev/floor/*.{mjs,cjs}` — run `npx eslint .dev/floor/validate.mjs` post-move; if ESLint skips the dot-dir, add an explicit `.dev/**` to the lint surface so the moved checkers do not silently drop out of linting (a coverage drop is the same failure class as the silently-dropped test suites).

Editable root docs (document the boundary + the `pharn-dev-` convention — `.claude/settings.json` needs **no** change; its hook commands are `.claude/hooks/*.cjs`, which stay):

- `CLAUDE.md` — `floor/`→`.dev/floor/`, `memory-bank/`→`.dev/memory-bank/`, build-loop `features/`→`.dev/features/`; the writes-scope zone description; **document the `pharn-dev-*` (apparatus) vs `pharn-*` (product) convention** and the `.dev/` layout.
- `CONTRIBUTING.md` — `node floor/validate.mjs`→`.dev/floor/…`, the build-loop line, command links/names, `floor/*.mjs`→`.dev/floor/*.mjs`; restate the naming convention for contributors. **Also grep this file for `features/`** (discovery's editable-docs grep omitted it — GRILL F-P6:68) and repath any build-loop `features/<name>` → `.dev/features/<name>`.
- `README.md` — `floor/validate.mjs`→`.dev/floor/validate.mjs` (lines 147–148, 172), command links/names (97, 146); **also grep this file for `features/`** (same omission) and repath build-loop references.
- `.github/workflows/gitleaks.yml` — comment-only `floor/validate.mjs`→`.dev/floor/validate.mjs` (line 8; accuracy, non-blocking).

Writes-scope hook (decision **A** — preserve `.dev/features/**`; resolved at approval):

- `.claude/hooks/enforce-writes-scope.cjs` — add `.dev/features/**` to `DEFAULT_SAFE_SET` → `["features/**", ".dev/features/**", "pharn-*/**"]`. Literal zero behavior change: the build-artifact zone stays writable-by-default at its new path; every sensitive zone (`.dev/floor/`, `.dev/memory-bank/`, `.claude/`, root) stays deny-by-default.
- `.claude/hooks/enforce-writes-scope.test.cjs` — add a fail-closed case: with no scope set, a write to `.dev/features/<x>` is **allowed** while `.dev/floor/<x>` and `.dev/memory-bank/<x>` are **denied** (locks decision A; proves the sensitive zones stay closed).

Artifact-split lock (**included** — the approved "if feasible" test):

- `.claude/hooks/set-writes-scope.test.cjs` — **new** (backfills absent setter coverage): assert `--from-frontmatter .claude/commands/pharn-dev-plan.md --target .dev/features/x/PLAN.md` resolves to `.dev/features/x/PLAN.md`, and a **root** `features/x/PLAN.md` target does **not** match the command's `.dev/features/<name>/…` placeholder — locking "pharn-dev-\* writes target `.dev/features/`, not root `features/`."

### Moves (`git mv`, history-preserving — Bash, **not** Write/Edit-gated, so out of the scope list above)

- `floor/` → `.dev/floor/` (8 checkers + 8 test files + `test-fixtures/` + `README.md`, as one unit — tests locate the checker/fixtures via `import.meta.url`, so moving the dir whole preserves every relative path; **verified**).
- `features/` → `.dev/features/` (all build-loop artifacts incl. this `PLAN.md` and the existing `README.md`), then recreate root `features/` via the new `features/README.md` above.
- `memory-bank/` → `.dev/memory-bank/` (`lessons-learned.md`, `feature-catalog.md`).
- `git mv` each `.claude/commands/<name>.md` → `.claude/commands/pharn-dev-<name>.md` (`pharn-eval`→`pharn-dev-eval`).

### Explicitly not touched

- **Trusted docs** (`CONSTITUTION.md`, `ARCHITECTURE.md`, `THREAT-MODEL.md`, `LIMITS.md`) — stay at root, **byte-unchanged** (fix #2 + hash-pin). Two stale path references are **REPORTED, not edited** — see below.
- **`CODEOWNERS`** — unchanged (fix #2-protected).
- **`.claude/hooks/*.cjs`** + **`.claude/settings.json`** — the hooks reference no moved path; protection is path-independent (see Guarantee audit). `set-writes-scope.cjs` is a generic parser (no hard-coded apparatus path).
- **`runs/`** — gitignored eval scratch, **not** in the human-decided move list; stays at root; `pharn-dev-eval` keeps `writes: ["runs/**"]`.
- **`.pharn/`** — gitignored runtime writes-scope state; unrelated to `.dev/` (committed apparatus); unchanged.
- **`.claude/settings.local.json`** — gitignored, machine-local permission allowlist; stale `node floor/validate.mjs` entries only cost a re-prompt; out of scope.

### Trusted-doc references to REPORT for human edit (cannot self-edit — fix #2; would also break the hash-pin)

- `ARCHITECTURE.md:142` — "`floor/validate.mjs` greps for forbidden cross-references…"
- `ARCHITECTURE.md:245` — "`floor/validate.mjs` (the `validate` step) enforces…"

Both become `.dev/floor/validate.mjs` after the move. They are **documentation accuracy**, not executable — the floor itself moves and runs from `.dev/`. A human may update them outside the agent loop (which re-pins the hash); this build pins the **current** hash and does not require the edit. No `features/`/`memory-bank/` references exist in any trusted doc (grepped).

## Contracts satisfied

- No `pharn-contracts/` schema is added or changed. The increment relocates the **consumers** of the
  contracts (the floor, the commands), not the contracts. `pharn-contracts/` stays at root, byte-unchanged
  (cite, don't restate — P4).

## Evals / tests to write (P1)

No new capability ships → no new `evals/cases|expected` required (P1 applies to capabilities; this moves
apparatus). The existing **deterministic suite is the regression net** and must stay green **from the new
layout**:

- **Confirm live** before/after: `npm test` (10 suites: 8 `.dev/floor/*.test.mjs` + 2 `.claude/hooks/*.test.cjs`) — read the count live (P6; ~108 `test()` calls statically, exact total via the runner). Zero net change in pass count.
- **check-provenance.test.mjs** — `target` fixtures → `.dev/memory-bank/…` (required for green under the new enum).
- **count-verifiers.test.mjs** — exclusion fixture `floor/…`→`.dev/floor/…` (keeps the exclusion **tested**).
- **validate.test.mjs** — **add** the `.dev/`-wholesale-exclusion + product-count assertion (locks the boundary; the user-requested "confirm validate excludes `.dev/` wholesale and still counts the product capability").
- **enforce-writes-scope.test.cjs** — **add** the decision-A fail-closed case: `.dev/features/<x>` allowed, `.dev/floor/<x>` + `.dev/memory-bank/<x>` denied (no scope set).
- **set-writes-scope.test.cjs** — **new** artifact-split lock (above): pharn-dev-\* `writes:` resolves under `.dev/features/`; a root `features/` target is rejected.
- `check-regress.test.mjs` — **no change required**: its `"floor/…"`/`"features/…"` strings are **synthetic inputs** to the path **partitioner** (string-only; `check-regress.mjs` fs-reads only its `--base`/`--head` report-JSON, never the path-list args). May be updated for realism; not a correctness gate.

## Guarantee audit (P0) — structure changes, guarantees do not

- **fix #2 (trusted-path write-guard)** → floor: **hook (pre-write)**. **PRESERVED.**
  `protect-trusted-paths.cjs` matches by **basename/path-fragment** over a fixed list (`CONSTITUTION.md`,
  `ARCHITECTURE.md`, `THREAT-MODEL.md`, `LIMITS.md`, `CODEOWNERS`). Those files **stay at root, names
  unchanged**, and the hook references **no** moved path — so the move **cannot** create a hole. Verify at
  build with the two self-tests in CLAUDE.md (Edit `CONSTITUTION.md`→exit 2; Write a non-trusted path→exit 0).
- **fix #7 (writes-scope guard)** → floor: **hook (pre-write)**. **PRESERVED — protection-critical invariant intact.**
  Sensitive zones stay **deny-by-default**: `.dev/floor/`, `.dev/memory-bank/`, `.claude/`, and root files
  match **neither** safe-set glob (`features/**`, `pharn-*/**`), exactly as `floor/`/`memory-bank/` did
  before. `set-writes-scope.cjs` is a generic parser (no hard-coded apparatus path) → unchanged.
  **Resolved (decision A):** `.dev/features/**` is **added** to the fail-closed safe-set
  (`["features/**", ".dev/features/**", "pharn-*/**"]`) — literal zero behavior change for the
  build-artifact zone; every sensitive zone stays denied (no hole), locked by the new
  `enforce-writes-scope.test.cjs` case.
- **validate / count-verifiers EXCLUDE swap** (`/floor/`→`/.dev/`) → floor: **enum/path check**.
  The guarantee (structural checks over the **product** capability surface) is preserved and made **more
  robust** — keyed on the explicit `.dev/` boundary, not an implicit per-folder memory. Capability count
  stays **1** (root `pharn-review/trust-fence`); build confirms `.dev/floor/validate.mjs .` → `GREEN — 1`.
- **check-provenance enum** (`memory-bank/`→`.dev/memory-bank/`) → floor: **enum/regex/presence**. The
  promotion gate still admits only the canon files — at their new home.
- **npm-test-glob `.dev/**`append** → this **backs** the floor/hook guarantees (the suite is their
regression net). **Probe (run this session, in scratchpad):** a`.dev/floor/x.test.mjs`under`**/\*.test.mjs`
  yielded **0 tests** — `**`does not descend dot-dirs (which is exactly why`.claude/**` is already listed
  explicitly). Without the append, 8 suites vanish **silently\*\* — the single highest-risk correctness item.
- **`pharn-dev-` prefix + autocomplete** → **guarantees nothing about access; it is naming/menu UX, NOT a
  security boundary.** No new floor primitive. **No** gatekeeping, contributor-check, or
  refusal-if-not-contributor is added (Apache-2.0; an unenforceable access check that looks like security is
  the disease). **Verified against the docs:** Claude Code has **no** frontmatter field that hides a command
  from the human `/` menu while keeping it human-typeable — `disable-model-invocation` keeps it human-visible
  (gates only model auto-invoke), and `user-invocable:false` removes human access entirely (a gate — forbidden
  here). Per the pre-decided fallback, the **prefix alone** is the mechanism; **no hiding field is applied and
  none is invented**.

Net: **no new guarantee added; an existing structural fragility (dev/product split living only in
`validate`'s `EXCLUDE`) is removed.** After this, packaging = "root minus `.dev/`."

## Trust audit (P2)

This increment ingests **no untrusted artifact** — it is a human-directed structural refactor of the repo's
own apparatus. No new taint source, no new free-text-into-instruction path. The finding object, the
trust-fence, and the enum-gated/free-text split are **untouched** (the `trust-fence` capability and
`finding-shape` contract move nowhere — they stay at root). N/A beyond "nothing new ingested."

## Determinism audit (P5)

Every branch touched is a **membership/path test**, no LLM classification:

- validate/count-verifiers exclusion = path-segment membership; check-provenance = set membership;
  writes-scope = glob/path membership; `set-writes-scope` = deterministic frontmatter/plan parse (no model
  picks scope).
- The autocomplete decision is a deterministic check against Claude Code's **documented** fields; terminal
  fallback = "use the prefix" (a decision, **not** a guess) — P5-clean.

## Build sequence (advisory — `/build` owns the mechanics)

1. **Set the writes-scope FIRST** (fix #7 — `/build` Step 0): `set-writes-scope --from-plan <PLAN.md>` while the plan is **still at its current path**, authorizing the `## Files` edits. **Mandatory before the move** (GRILL F-P5:179) — step 2's `git mv features/` relocates this PLAN.md itself, so the setter must read it first.
2. `mkdir .dev` → `git mv floor .dev/floor`, `git mv features .dev/features`, `git mv memory-bank .dev/memory-bank`; `git mv` each command to `pharn-dev-*`. (`git mv` is Bash, **not** Write/Edit-gated — it runs under any scope.)
3. Edit the checkers/enums/configs/CI/docs + the renamed commands + READMEs per `## Files` (now at their `.dev/` paths).
4. Recreate root `features/` via the new `features/README.md`.
5. **No-stale-reference grep** (deterministic backstop — the command surface is run by no test, GRILL F-P5:183): grep `.claude/commands/`, `.dev/`, the configs, CI, and editable docs for any residual `node floor/`, bare `floor/`, `memory-bank/`, or build-loop `features/<name>` reference **not** already under `.dev/` — e.g. `grep -rnE '(node |[^.v])(floor/|memory-bank/)|features/[a-z0-9-]+/' .claude/commands .dev package.json .github *.md | grep -v '\.dev/'`. **Expect zero hits**, excluding the two REPORT-only `ARCHITECTURE.md` lines. Any hit = a missed repath → fix before the gate.
6. **Full gate from the new layout:** `node .dev/floor/validate.mjs .` → `GREEN — 1`; `npm test` → same count, green; `npm run check` → clean; fix #2/#7 hook self-tests → deny/allow as expected; ESLint `.dev/` scope check (see `## Files` → `eslint.config.mjs`).

## Decisions (resolved at approval — no open questions remain; `/build` may proceed)

Resolved interactively by the human on 2026-06-29:

1. **`enforce-writes-scope.cjs` `DEFAULT_SAFE_SET` after the move** → **(A) Preserve.** Add
   `.dev/features/**` to the fail-closed safe-set → `["features/**", ".dev/features/**", "pharn-*/**"]`.
   Literal zero behavior change; every sensitive zone (`.dev/floor/`, `.dev/memory-bank/`, `.claude/`,
   root) stays deny-by-default; locked by a new `enforce-writes-scope.test.cjs` case.
2. **Artifact-split lock test** → **include** `set-writes-scope.test.cjs` (asserts pharn-dev-\* `writes:`
   resolve under `.dev/features/`, root `features/` target rejected).
3. **Autocomplete-hiding** → resolved during discovery (verified against the docs): no human-menu hide
   field exists that preserves human access; the `pharn-dev-` prefix is the sole mechanism, no hiding
   field applied, no gatekeeping added.
4. **Grill fixes folded (post-approval, from `GRILL.md`)** — the four important `/grill` concerns:
   (a) explicit ESLint `.dev/` coverage check (§Files `eslint.config.mjs`); (b) a no-stale-reference grep
   added as `## Build sequence` step 5; (c) reordered set-scope-**before**-move (`## Build sequence`
   steps 1–2); (d) a `features/` sweep of README/CONTRIBUTING (§Files). Remaining **minor** grill concerns
   are left for `/build` to weigh: label "zero behavior change" advisory (it is backstopped by — not
   equal to — the suite); verify `check-regress`/`ci.yml` internals rather than assert; add a CHANGELOG
   entry for the restructure.

Plan **approved as written**, with the four grill fixes folded in above. Next: `/build` — building is
not this command's job.
