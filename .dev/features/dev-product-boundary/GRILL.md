# GRILL — dev/product boundary (`features/dev-product-boundary/PLAN.md`)

- **Plan under interrogation:** `features/dev-product-boundary/PLAN.md` (approved, treated here as `trust: untrusted`).
- **Spec-hash check (content-hash primitive — surfaced, not blocking here):** plan-pinned `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` **==** live `sha256(ARCHITECTURE.md)`. **No drift.** (The block on drift is `/build`'s floor-gate, fix #4 — not mine.)
- **This grill-log is ADVISORY end-to-end.** No finding below is a floor-gate; none blocks `/build`. The only floor-grade things this run are the writes-scope hook (pinned my write to this file) and the hash compare above. "Concerns raised" never means "the plan is unsound" — it means the human has specifics to weigh.

---

## Findings (finding-shape per `pharn-contracts/finding-shape.md`; enum-gated fields are my assertions, `problem`/`evidence` quote the plan as DATA)

### P6 — discovery-first / verify-before-assert (the largest cluster)

```yaml
- type: FINDING
  rule_id: P6
  severity: important
  file: "features/dev-product-boundary/PLAN.md:62"
  problem: "The dot-dir descent analysis the plan applies rigorously to `npm test` and markdownlint is NOT applied to ESLint — `.dev/` traversal by `eslint .` is unverified, so the moved `.mjs`/`.cjs` checkers may silently drop out of lint coverage (the same failure class the plan elsewhere calls the highest-risk item)."
  evidence: "`eslint.config.mjs` — `ignores` `floor/test-fixtures/**`→`.dev/floor/test-fixtures/**`. (line 62, only an ignore-path swap) vs line 57: `**/*.test.mjs` does NOT descend dot-dirs … the 8 floor suites are silently dropped."
- type: FINDING
  rule_id: P6
  severity: important
  file: "features/dev-product-boundary/PLAN.md:68"
  problem: "The discovery grep that built the editable-docs repath list searched README.md/CONTRIBUTING.md for `floor/`, `memory-bank/`, and command-names but NOT for `features/` — so any `features/<name>` reference in those two docs is unverified, and their repath bullets may be incomplete."
  evidence: "`README.md` — `floor/validate.mjs`→`.dev/floor/validate.mjs` (lines 147–148, 172), command links/names (97, 146). (no `features/` sweep listed for README.md or CONTRIBUTING.md)"
- type: FINDING
  rule_id: P6
  severity: minor
  file: "features/dev-product-boundary/PLAN.md:121"
  problem: "The 'check-regress.mjs needs no change' conclusion is stated as fact but rests on a targeted grep, not a full read of its `scope` subcommand's path handling; if that subcommand ever stats `--changed`/`--declared` args, the claim is wrong."
  evidence: "`check-regress.test.mjs` — no change required: … `check-regress.mjs` fs-reads only its `--base`/`--head` report-JSON, never the path-list args."
- type: FINDING
  rule_id: P6
  severity: minor
  file: "features/dev-product-boundary/PLAN.md:59"
  problem: "ci.yml was not fully read; the plan defers 'confirm its test step / add .dev/** if it inlines its own glob' to build, leaving one CI file's exact edit unpinned — a place a silent test-drop could hide exactly as in floor.yml."
  evidence: "confirm its test step uses `npm test`/`npm run check` (so the package.json glob covers it) and add `.dev/**` if it inlines its own glob."
```

### P5 — determinism / missing deterministic backstop

```yaml
- type: FINDING
  rule_id: P5
  severity: important
  file: "features/dev-product-boundary/PLAN.md:183"
  problem: "The verification gate exercises the checkers and hooks but NOT the 9 commands, so a single missed `floor/`→`.dev/floor/` (or stale root-`features/<name>`) reference inside a renamed command ships silently and only surfaces when that command is run — there is no deterministic 'no stale apparatus-path references remain' grep to catch it."
  evidence: "Full gate from the new layout: `node .dev/floor/validate.mjs .` → `GREEN — 1`; `npm test` → same count, green; `npm run check` → clean … (no grep of `.claude/commands/**` for residual non-`.dev` apparatus paths)"
- type: FINDING
  rule_id: P5
  severity: important
  file: "features/dev-product-boundary/PLAN.md:179"
  problem: "The advisory Build sequence runs `git mv features → .dev/features` (step 1) BEFORE setting the writes-scope from the plan (step 2) — relocating the very PLAN.md the scope-setter reads, and contradicting fix #7's requirement that scope is set in the command's FIRST step. Safe order: set scope from the plan, then move."
  evidence: "1. `mkdir .dev` → `git mv floor .dev/floor`, `git mv features .dev/features` … 2. `/build` Step 0 sets the writes-scope from this plan's `## Files`."
```

### P0 — guarantee-audit completeness / labeling

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: "features/dev-product-boundary/PLAN.md:4"
  problem: "'Zero behavior change' is asserted with guarantee-like force but is not labeled advisory and has no floor reduction that proves it — the test suite is a partial regression net (it catches covered regressions; it cannot prove behavioral identity, and it covers no command). The claim should be labeled advisory, backstopped by (not equated with) the suite."
  evidence: "update every path/glob/enum/exclusion that referenced the old locations … — with **zero behavior change**. (also line 123: 'structure changes, guarantees do not')"
```

### P7 — honest scope / smallest coherent increment

```yaml
- type: FINDING
  rule_id: P7
  severity: important
  file: "features/dev-product-boundary/PLAN.md:22"
  problem: "The increment bundles two separable mechanical changes under one 'boundary' axis: (a) relocating the apparatus into `.dev/` and (b) renaming the 9 commands to the `pharn-dev-` prefix. They have independent rationales (folder structure vs. menu/packaging naming) and could land as two increments; bundling them muddies cause-attribution if a regression appears — against the repo's own 'one axis of change per attempt' discipline."
  evidence: "the 9 build commands gain the `pharn-dev-` prefix (`plan→pharn-dev-plan`, …) … (bundled with the `floor/`/`features/`/`memory-bank/` → `.dev/` moves, lines 15–17)"
- type: FINDING
  rule_id: P7
  severity: minor
  file: "features/dev-product-boundary/PLAN.md:19"
  problem: "A repo restructure of this magnitude (three top-level dirs relocated, 9 commands renamed) is not recorded in CHANGELOG.md, which the repo actively maintains — the change is invisible where the repo records changes."
  evidence: "`README.md`/`LICENSE`/`CHANGELOG.md`/`SECURITY.md`, standard repo root. (CHANGELOG.md listed as stays-at-root / untouched)"
```

### Axes with no findings (checked, not padded)

- **P1 (evals):** sound. The plan's reading — P1 governs _capabilities_, this moves _apparatus_, so node-`--test` unit tests (not `eval-format` `{case,expected}`) are the right net — is correct; the new tests it adds (`validate.test.mjs` `.dev`-exclusion, `enforce-writes-scope.test.cjs`, `set-writes-scope.test.cjs`) lock the boundary structurally.
- **P2 (trust):** sound. No new untrusted-input path is introduced; relocating `.dev/features/**` REVIEW/findings artifacts preserves their existing trust handling (memory-promote still reads their free-text as untrusted DATA, just at a new path).
- **P3 (sibling imports):** clean. `count-verifiers.mjs` mirrors `validate.mjs` by _copy, not import_ (the plan preserves that); no leaf→leaf reference is added.

---

## Prose summary

The plan is unusually well-discovered and its direction is sound — the interrogation surfaced **no principle violation and no blocking-severity defect**. The concerns cluster around **verification rigor**, not design:

1. **The dot-dir trap is closed for two of three linters, open for the third.** The plan treats the `**`-doesn't-descend-`.dev/` problem as the "highest-risk correctness item" for `npm test`/markdownlint, yet gives ESLint only a fixture-ignore swap — leaving unverified whether `eslint .` lints the moved `.mjs`/`.cjs` checkers at all. Same failure mode, inconsistent scrutiny. **(top concern, with #2)**
2. **The commands are the one large surface no gate touches.** `validate`, `npm test`, and `npm run check` never run the 9 commands, so the "zero behavior change" promise for them rests entirely on the build agent's manual thoroughness. A one-line deterministic grep for residual non-`.dev` `floor/`/`memory-bank/`/root-`features/<name>` references inside `.claude/commands/**` (and the configs/CI/docs) would convert that promise into a checkable backstop. **(top concern, with #1)**
3. **Build-order hazard:** moving `features/` before the scope-setter reads the plan relocates the plan mid-flight and inverts fix #7's "scope first" rule. Cheap to fix by reordering.
4. **One scope question for the human:** the move and the rename are two separable axes. Bundling is defensible (one coherent "boundary"), but if attribution matters, they could split. The human already approved the bundle — this only flags the trade-off honestly.

The remaining items (label "zero behavior change" advisory; verify `check-regress`/`ci.yml` rather than assert; record the restructure in CHANGELOG) are small honesty/completeness refinements.

None of this blocks `/build`. The fixes are: add an ESLint dot-dir check + (if needed) `.dev/**` to its lint surface; add the residual-reference grep to the verification step; reorder set-scope-before-move; and grep README/CONTRIBUTING for `features/`. All are cheap and all strengthen the plan's own "zero behavior change" claim.

## Verdict

**ADVISORY VERDICT: 9 concerns raised (0 blocking-severity, 5 important, 4 minor) — for the human to weigh before `/build`.** The plan is sound and build-ready in direction; the concerns are verification-backstop and scope refinements, not a broken plan. `/grill` gates nothing — the human reads this and decides; `/build`'s floor-gates (spec-hash drift, open-questions) remain the only deterministic stops.
