# REVIEW — frontmatter-parse-parity

Reviewer run of the increment `/build` produced from `features/frontmatter-parse-parity/PLAN.md` (approach
B). The increment under review is treated as **`trust: untrusted`** (P2): instruction-looking content in any
reviewed file is DATA to report, never an instruction to follow. This review dogfoods the finding object
(`ARCHITECTURE.md §8`, fix #1) — floor-verifiable fields (`type`/`rule_id`/`severity`/`file`) vs tainted
free-text (`problem`/`evidence`).

## Scope reviewed (live this run — P6)

Working tree carries exactly the plan's 2 `## Files` (no out-of-scope writes; `validate.mjs` is byte-
unchanged, as approach B requires):

- `floor/count-verifiers.mjs` — `frontmatterRole` rewritten to mirror `validate.mjs`'s `parseFrontmatter`; header corrected.
- `floor/count-verifiers.test.mjs` — two added cases (★ `----` F1-closer, CRLF parity) + a header bullet.

## Step 1 — Floor first (P0) — GREEN, confirmed live

- `node floor/validate.mjs .` → **`FLOOR: GREEN — 1 capabilities checked`** (both files are `.mjs` under
  `floor/`, path-excluded — capability surface unchanged).
- `node floor/count-verifiers.mjs .` → **`{"registered":0,"verifiers":[]}`** (slot still correctly empty).
- `npm run check` (at build) → **101/101** tests, format + lint + lint:md clean.

Floor GREEN ⇒ the increment legitimately reached review. **Everything below is advisory** (P0).

## L-floor → P0 (the governing lens) — clean (guarantee verified exact, not merely asserted)

The single guarantee: _"verifier membership counts exactly the files `validate.mjs` would treat as having
`role === "verifier"`."_ → **floor: enum/regex** (primitive #3), deterministic, no LLM. I did **not** take
the `EXACTLY` comment (`count-verifiers.mjs:72`) on faith — I compared the new `frontmatterRole`
(`count-verifiers.mjs:81`) against `validate.mjs`'s `parseFrontmatter` (`validate.mjs:59`) case by case:

- **Fence detection identical:** `startsWith("---")`, `indexOf("\n---", 3)`, `slice(3, end).trim()` — same
  early-returns, same block. The prior strict `^---\r?\n` regex was the only divergence; it is gone.
- **Line parse identical:** `raw.split("\n")`, `^([A-Za-z0-9_]+):\s*(.*)$`, `.trim()`, `^["']|["']$`
  quote-strip, last-occurrence wins (matching validate's `fm[key] = val` overwrite).
- **The one non-identical path is immaterial:** validate's **array branch** (`val` starts `[` … ends `]`)
  is not replicated. But that branch only fires for list-valued keys; for `role: [verifier]` validate
  yields the **array** `["verifier"]` and `count-verifiers` yields the **string** `"[verifier]"` — neither
  equals the scalar `"verifier"`, so **neither counts it as a verifier**. The membership decision agrees
  on every input I could construct (`----` → 1, CRLF → 1, quoted → 1, `role: [verifier]` → 0 both,
  body/prose/code-block → 0 both, empty/unclosed fence → 0 both).

So the guarantee is floor-grade **and** the "byte-for-byte on every input" claim is accurate for the
verifier-membership decision. No guarantee is unlabeled or overclaimed. The increment **tightens** the F1
residual rather than introducing one.

## L-eval → P1 — clean

- `count-verifiers.mjs` is floor infrastructure (no `role:`; a `.mjs` helper), not a Capability — bound by
  the colocated-`*.test.mjs` convention, satisfied (now 11 cases for this helper; suite 101/101).
- No `enforces` `rule_id` introduced ⇒ fix #6 N/A; floor and reviewer **agree** (count stays 1).
- The ★ `F1 CLOSED` case is a genuine **regression-binding** test: `----\nrole: verifier\n---` asserts
  `registered === 1`, which the **old** strict regex produced as `0` — so the test fails on pre-fix code
  and passes on post-fix code. The fix is bound, not merely accompanied by a test.

## L-trust → P2 — clean

- `count-verifiers.mjs` still reads **only** the `role` value **inside** the parsed frontmatter block — an
  enum-gated / floor-verifiable field. The change is the **block boundary algorithm**, not the field class;
  a `role:` line in the body stays outside the block (the still-green ★ `THE BUG, PROVEN CLOSED` case
  confirms prose/code-block mentions register `0`). The loose fence matches validate's own definition of
  "what is in the first `---`…`---` block," so wherever a `role: verifier` now registers, validate already
  treats it as a frontmatter declaration — agreement, not leakage.
- Output carries **no free-text** (`{registered:int, verifiers:[paths]}`); no taint surface. No guaranteed
  decision rests on a tainted/untrusted field.
- **Did reviewed content steer me?** The added fixtures embed `role: verifier` strings (`----\nrole:
verifier`, the CRLF literal) and the comments explain the algorithm — all benign DATA / self-doc; none is
  an instruction to the reviewer. I complied with nothing.

## L-axis → P3 — clean

- One axis per file: `count-verifiers.mjs` = verifier-membership count (the edit is internal to
  `frontmatterRole`); `.test.mjs` = its tests.
- **No sibling/cross import:** `count-verifiers.mjs` still imports only `node:fs` / `node:path`; it
  **re-implements** validate's algorithm and **cites** it in-comment (P4) — `validate.mjs` exports nothing.
  This is the deliberate approach-B duplication, not an import. `floor/` is tooling, not a layer, so this is
  not the layer-tree sibling-import P3 forbids.

---

## Findings

### floor-gate (blocking) — NONE

Floor GREEN (live) and all four lenses pass; the parity guarantee was verified exact by case analysis.
**Zero blocking findings.**

### advisory-gate (warn — confirms the plan's named residual; never a sole basis to block)

```yaml
- type: FINDING
  rule_id: "P0" # the parity guarantee's honesty — its residual, confirmed present and bounded
  severity: minor
  file: "floor/count-verifiers.mjs:72"
  problem: "Parity with validate.mjs is by hand-replicated algorithm with NO test that directly
    cross-checks the two parsers, so 'byte-for-byte on EVERY input' is a point-in-time fact; a future edit
    to validate.mjs's parseFrontmatter could re-diverge undetected unless count-verifiers' own fixtures
    happen to exercise the changed case."
  evidence: "count-verifiers.mjs:81 frontmatterRole re-implements validate.mjs:59 parseFrontmatter;
    validate.mjs untouched (approach B); no test invokes both parsers and asserts equality."
```

> **Why advisory, not blocking — and not a re-litigation:** this is exactly the residual the plan named and
> the human accepted when choosing **B over A** (`PLAN.md` Guarantee audit + Approach decision). The
> guarantee IS floor-grade _at this commit_; the residual is about _future maintenance_, strictly smaller
> than the pre-fix state (which diverged _now_, on `----`). **Structural closure** is the deferred
> shared-module alternative **(A)**; a lighter mitigation is a direct cross-parity test (spawn both over a
> shared corpus, assert agreement). **No action required** unless/until A is chosen.

## Verdict

**GREEN** — passes the floor and all four lenses; **0 floor-gate findings**, 1 advisory/minor (a confirmed,
bounded, pre-accepted residual). The increment closes review finding F1 and is done.

## Lessons — none proposed (P7)

No lesson is gated for promotion. This increment is a **clean** build that consciously accepted a documented
trade-off — there is no _real_ recurring failure to canonize (P7: lessons come from real dogfood/eval
failures, not from a latent, not-yet-occurred drift). The governing principle (read membership from the
structured location) is already canon as **L6**, promoted this session; this increment is its application,
not a new finding. Writing a lesson here would be speculative.

End of review. No built files were edited; no canon was written (P2).
