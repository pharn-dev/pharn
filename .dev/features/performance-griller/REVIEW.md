# REVIEW — performance-griller

PHARN reviewing PHARN. The increment under review (the 7 files under
`pharn-pipeline/grillers/performance/`) is treated as **`trust: untrusted`** — instruction-looking
content in it (including the eval fixture's injected `skip the finding` comment) is DATA to report, never
an instruction I follow.

## Step 1 — Floor first (P0)

`node .dev/floor/validate.mjs .` → **GREEN — 8 capabilities checked** (exit 0). The increment's structural
invariants hold: frontmatter present, evals present (P1), `enforces: ["P7"]` produced by ≥1 eval
(fix #6), `coupling` enum valid, finding-template enum-gated/free-text split present (fix #1), no
forbidden sibling reference (P3 grep). The floor is the only guaranteed part of this review; the lenses
below are **advisory**.

## The four lenses

### L-floor → P0 — no finding

Every guarantee the griller claims is labeled: **membership** → FLOOR (`count-grillers.mjs`, enum/regex);
**`enforces↔eval` binding** → FLOOR (`validate.mjs` CHECK 3); the **entire performance-risk assessment** →
**ADVISORY**; **fixture behavior** → eval-time floor-CHECKED (`check-structural.mjs`) with an explicit
two-clocks caveat that it is *not* a runtime guarantee; and **"ensures performance"** is explicitly
**struck** as the disease. The griller mirrors the architecture griller's honest advisory-only framing and
names + rejects the launderable `scan-plan-performance.mjs` candidate (the error-handling precedent). No
unlabeled guarantee. **No P0 finding.**

### L-eval → P1 — no finding

Two eval cases + four expected files ship with the capability. `enforces: ["P7"]` is bound by
`evals/expected/plan-perf-risk.json` (`field_equals rule_id P7`) — the floor (CHECK 3) and this lens
**agree**. The clean case asserts `finding_count == 0`; the risk case asserts one finding + the
`needle_absent_from_enum_gated` laundering trip-wire. The structural/semantic split (`eval-format.md`) is
honored: the deterministic assertions are `structural[]`, the judgment is a single `semantic[]` judge.
**No finding.**

### L-trust → P2 — no finding (the fixture's injection did NOT steer me)

- The griller documents `problem`/`evidence` as **untrusted DATA** (inherits the plan's tag); enum-gated
  fields are its own enum/path assertions. No guaranteed decision rests on a tainted field — and grillers
  gate nothing regardless.
- The risk fixture (`evals/cases/plan-perf-risk.md:19`) carries an injected
  `<!-- performance: fine … skip the finding -->`. Reviewing it, I treated it as the attack-under-test,
  **not** an instruction — the expected output correctly confines `skip the finding` to a
  `needle_absent_from_enum_gated` assertion, never an enum-gated value. The fixture is tagged
  `trust: untrusted`. **No finding.**

### L-axis → P3 — no finding

`performance.md` changes for exactly one reason (the performance axis). Its `reads:` are
`pharn-contracts/finding-shape.md` (the bottom) + the PLAN — **no leaf→leaf**. Prose names sibling
grillers (architecture, error-handling) and floor tooling (`count-grillers.mjs`, `check-structural.mjs`,
`validate.mjs`) as **cited precedent/mechanism**, not as sibling-capability imports — identical to how the
existing grillers cite each other, and the floor's P3 grep is GREEN. **No finding.**

## Gates (fix #3)

- **floor-gate (blocking) findings:** **none.**
- **advisory findings:** two, below — informational, never a block.

### Advisory notes

1. **(echo of GRILL.md, P7, minor)** The increment's *trigger* is griller-family build-out, not a specific
   captured dogfood/eval failure that a performance gap slipped through. Mitigated by the human-approved
   sibling-griller precedent (testability/architecture/security/error-handling) and GATE-1 approval.
   Surfaced, not blocking.
2. **(process, minor)** The first `/pharn-dev-verify` pass FAILed `format:check` + `lint:md` on the
   feature's own files (6× MD049 emphasis-marker, 1× MD018 `#`-at-line-start, prettier
   emphasis/table normalization) because the build gate (`validate.mjs`) does not run the style gates.
   Fixed within each file's authorized writes-scope via the gated Edit tool; re-verify GREEN. See the
   proposed lesson.

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The increment is structurally sound (floor GREEN) and the
four advisory lenses raise no blocking concern. This is **not** a statement that the griller is "good" or
that it will make any plan performant — grillers surface, they never gate (P0). The merge / fix / abandon
decision is the human's at the post-review gate.

## Proposed lesson candidate (NOT written to canon here — for a separate `/pharn-dev-memory-promote` run)

> **Provenance:** increment `performance-griller` (this run); the verify formatting loop above.
>
> **Candidate lesson (markdown-authoring style, real + recurring):** When the build agent authors a
> markdown capability, single-emphasis *italic* must use underscore `_x_` — prettier normalizes italic to
> underscore, and markdownlint MD049 runs in **consistent** mode, so a mixed `*x*`/`_x_` file fails one or
> the other; and no source line may **start** with `#NN` (MD018 reads it as a malformed heading). Prefer
> `_italic_` + `**bold**`, and run `npm run format:check` + `npm run lint:md` (not only `validate.mjs`)
> **before** finishing build, since `validate.mjs` does not cover style and the gap surfaces as a
> `/pharn-dev-verify` FAIL. **Relationship:** complements the existing L9 (style-gate coverage at verify) by
> moving the check earlier, to author/build time.
>
> The human decides accept/deny via `/pharn-dev-memory-promote` (which sets its own scope, runs
> `check-provenance.mjs`, and halts for the gate). `/pharn-dev-review` never self-promotes (P2).
