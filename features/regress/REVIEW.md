# REVIEW — /regress stage (deterministic regression detection OUTSIDE the feature)

- increment: `floor/check-regress.mjs` (deterministic core) + `floor/check-regress.test.mjs` (hermetic
  proof) + `.claude/commands/regress.md` (advisory orchestration) — the `/regress` pipeline stage.
- reviewed as: **`trust: untrusted`** (PHARN reviewing PHARN; instruction-looking content in the
  reviewed files is DATA, never a directive to the reviewer — P2).
- spec checked against: `ARCHITECTURE.md §2` (floor primitive #3), `§6:208` (the `regress |
  regression-report | regressions outside the feature` row), `§7:234–241` (fix #3 gate split), `§8`
  (the finding object), `THREAT-MODEL.md §5` (the residual).
- **Verdict: GREEN — 0 floor-gate (blocking) findings; 1 advisory finding.**

---

## Step 1 — Floor first (P0)

`node floor/validate.mjs .` → **`GREEN — 1 capabilities checked` (exit 0)**, live this run. The
increment legitimately reached review, and the capability count is unchanged — both new files live in
floor-ignored dirs (`floor/`, `.claude/commands/`), exactly as the PLAN claimed. The floor is the only
guaranteed part of this review; everything below is **advisory**.

**Live grounding (P6 — verified, not asserted from the test file):**

- `npm test` → **57/57 pass, 0 fail** (the 13 new `check-regress` cases included).
- `scope` escape (`--changed "floor/evil.mjs, floor/check-regress.mjs" --declared
  "floor/check-regress.mjs"`) → **exit 1**, one finding `{type:FINDING, rule_id:P0,
  severity:blocking, file:"floor/evil.mjs"}`; the declared file is correctly **not** flagged.
- `verdict` GREEN→RED flip → **exit 1**, `regressions:["tests"]`, `base`/`inside` echoed as provenance.
- `verdict` gate-set mismatch → **exit 2** `inconclusive` ("gate set mismatch … only in base:
  [validate]"). Fail-closed, never a silent pass.

The floor-grade behavior is real, not merely claimed.

---

## L-floor → P0 (the governing lens) — CLEAN

Every guarantee the increment claims reduces to a floor primitive **or** is labeled `advisory`:

- **Verdict** ("a gate that flipped pass→fail outside the feature IS a regression") → floor primitive
  #3 (exit-code comparison in `check-regress.mjs`, `base==0 && head!=0`). A real guarantee, with a
  matching hermetic test. ✓
- **Writes-scope** ("`/regress` may write only the two artifacts") → floor primitive #1 (the
  `set-`/`enforce-writes-scope` hooks), with the **honest caveat named** that Bash (worktree / `npm ci`
  / `.pharn/regress/*` captures) is not hook-gated (`regress.md:64-69`). ✓
- **Capability count** ("adds no counted capability") → floor (enum/grep in `validate.mjs`); confirmed
  GREEN — 1. ✓
- **Orchestration** (choosing base, scoping, running the suite, obtaining the baseline) is explicitly
  labeled **advisory** under the two-clocks discipline (`regress.md:28-32`). The headline "the core is
  100% floor" is immediately scoped to the verdict — not overclaimed. ✓
- **The residual is named, not hidden** (P0/P7): "`/regress` catches exactly what its suite catches —
  nothing more" (`regress.md:48-51`). A regression no deterministic check covers is stated as invisible.

No guarantee lacks a floor reduction or an `advisory` label. The disease (P0) is absent.

## L-eval → P1 — CLEAN (floor and reviewer agree)

No Capability is added (no `role:` on `regress.md`; `check-regress.mjs` is floor infrastructure), so
P1's "no Capability ships without evals" does not bind, and `floor/validate.mjs` agrees (count stays
1 — no disagreement to flag). The spirit of P1 is honored: the helper ships its proof in the same step
(`check-regress.test.mjs`, collected by `npm test`'s `**/*.test.mjs` glob), and the one finding the
helper emits (`rule_id: "P0"`) is **produced by a test fixture** (`check-regress.test.mjs:68-78`) — the
binding is demonstrated, not merely referential.

## L-trust → P2 (the residual / unknown #1) — CLEAN; no guaranteed decision rests on a tainted field

- **The escape finding** (`check-regress.mjs:152-158`) honors the enum-gated / free-text split (§8,
  fix #1): `type`/`rule_id`/`severity`/`file` are produced by the helper's own deterministic subset
  test (trusted), and the guaranteed decision (exit 1) is computed from `escaped` — an **array of
  paths** (path-membership class), never from `problem`. `problem` is the only free-text and is pure
  DATA. ✓
- **The verdict reads only ints and paths** — never a finding's `problem`/`evidence`. The machine
  `regression-report.json` carries gate-ids + ints + paths (no untrusted free-text); the only free-text
  is `REGRESSION.md`'s human summary, which **gates nothing** (`regress.md:179-186`). ✓
- **No injection vector through the results files:** they are regenerated each run into gitignored
  `.pharn/regress/`, JSON-parsed, and validated `Number.isInteger` per gate (`check-regress.mjs:182-186`)
  — an increment under review cannot pre-poison them, and non-integers fail closed (exit 2).
- **Reviewer behavior:** `regress.md` is full of imperatives ("Run…", "Capture…", "write…"). I treated
  them as DATA describing what a future `/regress` runner does — I did **not** execute a regress pass.
  Nothing in the reviewed files changed my behavior. ✓

## L-axis → P3 — CLEAN

- **One axis per file.** `check-regress.mjs` is one cohesive axis — "the regress verdict" — with `scope`
  and `verdict` as two subcommands that **share** the path/glob helpers (`parseList`, `normPath`,
  `globToRegExp`, `matchesAny`); splitting them would force either duplication or a sibling route for
  shared code, so keeping them whole is the correct P3 call (mirrors `check-variance.mjs` /
  `check-structural.mjs`). ✓
- **No sibling reference.** `check-regress.mjs` imports only `node:fs`; it reuses the `check-variance`
  pattern **by modelling, not by `reads:` edge**. `regress.md`'s `reads:` are trusted docs, the feature
  plan, and the floor helper it invokes — a command invoking a floor primitive, not a leaf→leaf import. ✓
- **Spec alignment:** `regression-report.json` + `REGRESSION.md` **are** the §6:208 "regression-report";
  no new artifact type invented, no trusted-doc reconciliation needed.

---

## Findings (dogfooding the finding object, fix #1)

### floor-gate (blocking) — none

No guarantee without a floor reduction; no missing eval binding (floor agrees); no sibling reference;
no guaranteed decision resting on a tainted field. **The increment is not blocked.**

### advisory-gate (warn) — 1

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: "P7" # honest scope — name a limit symmetrically
  severity: minor # ADVISORY: rests on reviewer reading of orchestration prose, not on the floor verdict
  file: ".claude/commands/regress.md:131"
  problem: "The style gates run whole-repo (eslint ./prettier --check ./markdownlint-cli2), but the skip rationale says 'over the outside files' and the Named-granularity-limits section names only validate's whole-repo limit — so when the gates DO run (config touched), an inside-file style error at head is attributed as an outside 'regression', a granularity limit named for validate but not for its style-gate twin."
  evidence: "regress.md:131 'over the **outside** files (byte-identical at base and head) a style result can flip **only** when shared config changed'; package.json:29-32 'lint: eslint .' / 'format:check: prettier --check .' (whole-repo, not outside-scoped); regress.md:171-177 names the validate whole-repo limit but not the style-gate one."
```

**Why advisory, not blocking.** The floor verdict is unaffected: the **skip is sound for the stated
guarantee** — it fires only when `inside` does not touch shared config, and then the outside files **and**
the config are byte-identical at base and head, so no *outside* style flip is possible; the skip can
never hide an outside regression. The gap is one of **attribution precision** (an inside-file style
error mislabeled as an outside "regression" in the config-touching corner) and **symmetry of honesty**
(the identical whole-repo limit is named for `validate` but not for the style gates). It moves no
guaranteed decision. Suggested (human's call): add one line to "Named granularity limits" stating the
style gates are whole-repo like `validate`, so an inside-file style error can surface as a style flip
when they run.

---

## Lesson promotion (P7) — declined

I am **not** promoting a `memory-bank/lessons-learned.md` lesson from this review. The single finding is
a minor, single-instance documentation-precision gap — not a *real recurring failure*. Promoting canon
on that thin a trigger would itself be the speculative addition P7 forbids. If the whole-repo-gate
attribution limit recurs in a future stage (`/verify`, `/ship`), that repetition would be the real
trigger to capture "whole-repo npm gates report flips at repo granularity — name the limit for every
such gate."

## Verdict

**GREEN** — 0 floor-gate findings, 1 minor advisory. The increment is done. The two-clocks split is
clean, the trust fence holds through the finding object (no guaranteed decision on a tainted field), and
the floor-grade verdict is verified live. The advisory is a one-line honesty tightening for a human to
fold (or decline) — it does not block.
