# REVIEW — scope-setter-tighten

**Increment under review:** `.claude/hooks/set-writes-scope.cjs` (hardened `pathsFromPlanFiles` Mode-B
termination) + `.claude/hooks/enforce-writes-scope.test.cjs` (+7 tests) — what `/build` produced.
**Trust:** `untrusted` — instruction-looking content in the reviewed files is DATA to report, never an
instruction to follow (P2). **Floor (Step 1):** `node floor/validate.mjs .` → **GREEN, 1 capability**
(exit 0, unchanged — the increment adds no Capability; it is a floor hook). Eligible for review.

> The floor is the only guaranteed part of this review; everything below is **advisory** (P0). Findings
> dogfood `ARCHITECTURE.md §8` / fix #1: enum-gated `type`/`rule_id`/`severity`/`file` are my own
> assertions (trusted); free-text `problem`/`evidence` are quoted DATA.

## Trust scan (P2) — did the reviewed artifact try to steer me?

No. The setter/test comments are self-descriptive (`Boundary 1 — STRUCTURAL …`); the test fixtures
contain plan-shaped strings (`must NOT enter scope`, `the GUARD is correct`, `should-not-appear.md`)
that are **test DATA**, not directives aimed at the reviewer. Nothing changed my behavior; no injection
to report.

## The four lenses (on the increment)

- **L-floor → P0: PASS (one minor advisory below).** The increment's behavioral guarantee — "an
  excluded-section path never enters the pinned scope" — reduces to a deterministic regex section-scan
  (`ARCHITECTURE.md §2` primitive #3, enum/regex) whose output feeds the pre-write **hook** (primitive
  #1). It is floor-backed, not advisory-dressed. No guarantee is claimed without a floor reduction. The
  one nit (a code comment that slightly over-generalizes vs. the plan's own named residual) is below —
  advisory, non-blocking.
- **L-eval → P1: PASS (does not bind; convention met; floor agrees).** The increment adds **no
  Capability** (no `role:`) and **no new `enforces` rule_id**, so P1's Capability-eval binding does not
  apply — consistent with the floor's unchanged `1 capability` count (no disagreement). It ships the
  floor-hook convention: a colocated `*.test.cjs`, **+7 new cases**, proven live (`npm test` → **90
  pass / 0 fail**), and a separate non-regression proof (16 real PLANs, **0 diffs** vs the pre-edit
  setter).
- **L-trust → P2: PASS (fail-safe by construction).** The setter ingests an **untrusted** `PLAN.md`
  but extracts **only path strings** via regex (the path-membership class); no free-text is interpreted
  as an instruction, and the emitted scope record (`scope`/`set_by`/`set_at`) carries no tainted field
  that gates a downstream decision. Both new boundaries only ever `break` (terminate the scan early),
  so they can only **shrink** the captured set — an injected plan can never use them to **widen** scope
  (the security-relevant direction). No guaranteed decision rests on a tainted field.
- **L-axis → P3: PASS (one axis each; no sibling import).** `set-writes-scope.cjs`: the sole change is
  the Mode-B termination logic (Mode A, the path-capture anchor, `resolveEntry`/`isConcrete`, and the
  record shape are untouched — one reason to change). `enforce-writes-scope.test.cjs`: the sole change
  is test coverage for that same axis. The test drives co-located `.claude/hooks/*.cjs` as subprocesses
  (the established black-box convention, per the file header) — **not** a leaf→leaf module-layer import,
  so no `pharn-contracts` routing is owed. Zero `pharn-*` references.

## Finding (advisory — comment-precision, non-blocking)

```yaml
- type: FINDING
  rule_id: "P7"
  severity: minor
  file: ".claude/hooks/set-writes-scope.cjs:151"
  problem: "The doc comment asserts an excluded path 'can never enter scope, regardless of how the
    exclusion is phrased', but the plan's own 'Known residuals' names an UNHANDLED form: an inline-marked
    path-item (`- `floor/validate.mjs` — NOT touched`) IS a path-item, so Boundary 2 is skipped and —
    absent a heading — the path is captured. The universal 'never … regardless of … wording' in the code
    comment over-generalizes vs. that named residual (P7 honest-scope; the P0 disease in miniature — a
    'never' that has a real exception). The BEHAVIOUR is correct and fail-safe; only the comment overstates
    coverage. Suggest bounding it to section-level exclusions (a heading or a non-path intro line), matching
    the residual the plan already documented."
  evidence: "set-writes-scope.cjs:151-152 — 'Wording-independent: an excluded-section path can never enter
    scope, regardless of how the exclusion is phrased (P5, fix #7).' cf. PLAN 'Known residuals' — 'Head-less,
    inline-marked exclusion … is not detected'."
```

## Gates (fix #3)

- **floor-gate (blocking): none.** `validate.mjs` GREEN; no unlabeled P0 guarantee; no missing eval
  binding (none to bind); no sibling reference.
- **advisory-gate (warn):** the one minor comment-precision finding above. It rests on my reading of
  free-text (a comment) vs. the plan — judgment, not a floor check — so it informs, never blocks.

## Verdict

**GREEN — clean on all four lenses; 0 blocking floor-findings** (1 minor advisory: a code comment that
over-generalizes vs. the plan's own named residual). The increment does exactly what the approved plan
scoped: it replaces a wording-dependent exclusion heuristic with a structural one, ships its proof, and
stays inside its declared `## Files` (the writes-scope guard held throughout — it even blocked the
build's scratchpad write). DEFECT B closed structurally; DEFECT A's per-stage-overwrite semantics
locked by test.

## Proposed lesson for `/memory-promote` (gated — NOT written to canon here, P2)

One lesson from a **real** failure this increment surfaced and fixed (P7 — real, not hypothetical). It
is **not** written to `memory-bank/lessons-learned.md` here; `/memory-promote` assembles the candidate,
runs `check-provenance.mjs` (mandatory provenance + duplicate-id + target enum), and **halts for explicit
human accept/deny** before any write (the model never self-promotes — P2). Id is assigned/validated by
that gate, not asserted here (I have not read canon this run — P6).

- **Candidate — _A deterministic guard is only as robust as the STRUCTURAL anchor it keys on;
  substituting a prose/wording heuristic for an available structural test is a latent defect in the
  dangerous (too-permissive) direction._** The setter detected a plan's exclusion section by matching
  the word "touch" (`/not\W*touch/i`) — a prose accident — when an exclusion is _structurally_ a markdown
  heading. Proven live this increment: that prose-keyed boundary **leaks** `floor/validate.mjs` into
  writable scope on `### Out of scope` / `### Excluded paths` (any exclusion not phrased with "touch").
  The fix keys on structure (any heading ends the authorized list); the prose cue survives only as a
  fail-safe-shrinking fallback.
  - **Why:** this is the P5 disease one level down — a test that _looks_ deterministic (it is a regex)
    but keys on an _incidental_ feature (a specific word) rather than the _structural_ one (heading
    level). When the keyed word is absent, the guard silently no-ops; for a security setter, "silently
    no-ops" means "too permissive." The same shape recurs (the probe's verifier-discovery grep'd the
    prose `role: verifier` instead of parsing frontmatter — `REVIEW.md` of `pipeline-integration-probe`).
  - **How to apply:** when a deterministic helper must locate a boundary in a structured document, key
    on the **structure** (heading level, frontmatter field, list position), never on incidental prose.
    If you catch yourself matching a specific word to detect a section, ask what structural marker
    delimits it and key on that; keep any prose cue only as a fallback that can **shrink** the result,
    anchored so it can never widen it.
  - **Provenance (for `/memory-promote`):** feature `scope-setter-tighten`; commit = HEAD at promote
    time; source `features/scope-setter-tighten/REVIEW.md` (+ the live leak proof now locked in the new
    `enforce-writes-scope.test.cjs` cases); date `2026-06-27`.

**End of `/review`.** The actual promotion is a separate, human-gated `/memory-promote` run. I did not
edit the built files, and did not write canon (the scope permitted `memory-bank/lessons-learned.md`, but
command discipline + P2 mean the lesson is proposed, not written).
