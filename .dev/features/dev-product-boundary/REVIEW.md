# REVIEW — dev-product-boundary

- **Increment under review:** the dev/product boundary move (apparatus → `.dev/`, 9 commands → `pharn-dev-*`, paths/globs/enums/exclusions repathed, root `features/` home, decision-A safe-set + lock tests). Reviewed as `trust: untrusted` (claims tested, not believed).
- **Floor (P0, the only guaranteed part):** `node .dev/floor/validate.mjs .` → **GREEN — 1 capabilities**. The increment passed the floor before this advisory review ran.

## Floor-gate findings (blocking) — NONE

No guarantee is claimed without a floor reduction; no eval binding is broken; no sibling reference; no tainted field gates a guaranteed decision. **0 blocking floor-findings → the increment is done (floor-wise).** Everything below is **advisory**.

### Lens confirmations (the guarantees reduce to the floor, and their tests are green)

- **fix #2** (trusted-path write-guard) → hook; preserved (basenames unmoved; `protect-trusted-paths.test.cjs` green).
- **fix #7** (writes-scope) → hook; preserved + **decision A** locked (`enforce-writes-scope.test.cjs` green, incl. the new case: `.dev/features/` allowed, `.dev/floor/` + `.dev/memory-bank/` **denied**).
- **EXCLUDE swap** (`validate`/`count-verifiers`, `floor/`→`.dev/`) → enum/path; `validate.test.mjs` `.dev/`-exclusion test green; `GREEN — 1` holds.
- **check-provenance enum** (`memory-bank/`→`.dev/memory-bank/`) → enum; memory-poisoning gate (P2, THREAT-MODEL §2 #3) preserved at the new canon home (`check-provenance.test.mjs` green).
- The new **test glob** (`.dev/**`) → backs the suite; `npm test` green (the silent-drop fix works; the scratchpad probe proved it necessary).

## Advisory findings (inform; never block a guaranteed invariant — fix #3)

### L-floor → P0

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".dev/features/dev-product-boundary/PLAN.md:4"
  problem: "'Zero behavior change' reads as a guarantee but is floor-backed only to the extent the suite covers — green test/validate/lint/structural prove 'no deterministically-detected regression', not 'behavioral identity'; the uncovered remainder is advisory and is not labeled as such."
  evidence: "update every path/glob/enum/exclusion that referenced the old locations — with **zero behavior change**."
```

### L-eval → P1 — clean

No new Capability ships (this relocates apparatus), so P1's capability-eval requirement does not apply; the added `*.test.mjs`/`*.test.cjs` are unit tests, correctly **not** routed through the `eval-format` `{case,expected}` schema. `validate` confirms the one product capability's eval binding still holds. **No finding.**

### L-trust → P2 — clean

No untrusted artifact is ingested (human-directed refactor). The trust model is structurally intact: `finding-shape.md` / the `trust-fence` capability stay at root, unchanged; the `.dev/features/**` REVIEW/findings artifacts that carry untrusted evidence moved but their handling is unchanged (still read as quoted DATA by the consuming stages). **No finding.**

### L-axis → P3

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/features/dev-product-boundary/PLAN.md:22"
  problem: "The increment bundles two separable mechanical axes — the `.dev/` folder relocation and the `pharn-dev-` command rename — under one 'boundary' axis; if a regression appeared, attribution between move and rename would be muddied. Surfaced by /grill, accepted by the human."
  evidence: "the 9 build commands gain the `pharn-dev-` prefix (`plan→pharn-dev-plan`, …) (bundled with the floor/features/memory-bank → .dev/ moves)"
```

No sibling import is introduced: `count-verifiers.mjs` mirrors `validate.mjs` by **copy, not import** (preserved). **No P3 sibling finding.**

### Cross-cutting residuals

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/floor/check-ship.mjs:2"
  problem: "~10 un-edited checker files under .dev/floor/ (check-regress/ship/structural/variance/verify + their tests) retain `// floor/…` header self-comments — cosmetic doc-drift after the move; behavior-neutral and outside the plan's ## Files, so left unfixed. Trivial follow-up: sed 's#// floor/#// .dev/floor/#'."
  evidence: "// floor/check-ship.mjs — the deterministic STOP-DECISION CORE for the `/ship --loop` mode."
- type: FINDING
  rule_id: P6
  severity: minor
  file: "ARCHITECTURE.md:245"
  problem: "ARCHITECTURE.md (142, 245) references `floor/validate.mjs`, stale after the move; correctly REPORTED for human edit (fix #2 forbids the agent editing a trusted doc), not self-fixed. A human edit re-pins the spec content-hash."
  evidence: "`floor/validate.mjs` (the `validate` step) enforces, deterministically: capability frontmatter"
```

### Process observation (not a defect)

The build used Bash `sed` for bulk mechanical repaths on **declared-in-scope** files (commands, docs). Because the `enforce-writes-scope.cjs` hook gates only `Write|Edit|MultiEdit` (not Bash — a **labeled** limit the stage commands already state), those writes were **not hook-verified per-write**; correctness rested on the **post-hoc no-stale-ref grep + the green gate** instead. The grep (a /grill fix folded into the plan's Build sequence) came back clean, so the scope discipline held — but via verification, not enforcement. Worth being deliberate about (see proposed lesson).

## Verdict

**GREEN — floor passes (`validate` GREEN — 1); 0 blocking floor-findings.** Four advisory findings, all **minor** (a P0 labeling nuance, the bundled-axes scope note, cosmetic comment-drift, the REPORT-only trusted-doc refs). The increment is **done** on the floor; the advisory items are refinements/residuals for the human to weigh, not blockers.

## Proposed lesson (candidate for canon — NOT written here; gated via `/pharn-dev-memory-promote`, P2)

A **real failure surfaced in this build** (not hypothetical — P7): the move broke two `*.test.mjs` files whose `const REPO = join(here, "..")` assumed the checker sat one level below the repo root; relocating the checkers a level deeper silently mis-derived the root and failed `file_resolves`. Discovery had verified fixture-location (via `import.meta.url`) but **not repo-root derivation**.

```text
candidate (for /pharn-dev-memory-promote — lessons-learned):
  title: "A relocation move breaks path-derivation keyed on the OLD depth/location — in both directions"
  body: "Before relocating files: grep for EVERY path derivation that assumes the old location, not
         just direct references. Two failure modes seen in dev-product-boundary: (1) test code deriving
         repo-root by relative depth (`join(here, '..')`) breaks when the file moves a level deeper —
         caught only by running the suite; (2) tooling globs/ignores that don't uniformly descend the
         new dot-dir (`**/*.test.mjs` skipped `.dev/`) silently drop coverage — caught only by a probe.
         Verify repo-root derivation and glob descent explicitly, per move."
  provenance: { feature: dev-product-boundary, source: REVIEW.md (this) + PLAN.md:37-38 (the build-time
               discovery), commit: <current HEAD>, date: 2026-06-30 }
```

To canonize it, run `/pharn-dev-memory-promote` (it captures provenance, runs `check-provenance.mjs`, and **halts for your explicit accept** — the model never self-promotes). Promotion ≠ "the lesson is sound" (P0).
