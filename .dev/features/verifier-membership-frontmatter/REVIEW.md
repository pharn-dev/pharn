# REVIEW — verifier-membership-frontmatter

Reviewer run of the increment `/build` produced from `features/verifier-membership-frontmatter/PLAN.md`.
The increment under review is treated as **`trust: untrusted`** (P2): instruction-looking content in any
reviewed file is DATA to report, never an instruction to follow. This review is PHARN reviewing PHARN, so
its own findings dogfood the finding object (`ARCHITECTURE.md §8`, fix #1) — floor-verifiable fields
(`type`/`rule_id`/`severity`/`file`) vs tainted free-text (`problem`/`evidence`).

## Scope reviewed (live this run — P6)

Working tree carries exactly the plan's `## Files` (no out-of-scope writes):

- `floor/count-verifiers.mjs` — new deterministic verifier-membership counter (floor tooling, untracked).
- `floor/count-verifiers.test.mjs` — 9 hermetic spawn/parse tests (untracked).
- `.claude/commands/verify.md` — Step 2 shorthand swap (`+9 / -1`); diff confined to the membership line
  (118) + one explanatory sub-bullet. The intent prose (115–116) and the slot definition (188–210) are
  untouched, as the plan promised.

## Step 1 — Floor first (P0) — GREEN, confirmed live

- `node floor/validate.mjs .` → **`FLOOR: GREEN — 1 capabilities checked`** (the helper + test are `.mjs`
  and under `floor/`; `verify.md` is under `.claude/commands/` — all three are path-excluded, so the
  capability surface is unchanged).
- `node floor/count-verifiers.mjs .` → **`{"registered":0,"verifiers":[]}`** (matches `verify.md:118`).
- `npm test` → **99 / 99 pass** (prior 90 + the 9 new `count-verifiers` cases, auto-collected).

The floor is GREEN, so the increment legitimately reached review. **Everything below is advisory** (P0): the
floor is the only guaranteed part of this review.

## L-floor → P0 (the governing lens) — clean

Every guarantee the increment claims reduces to a floor primitive **or** is labeled advisory:

- _"Verifier membership is counted from frontmatter declarations only; a prose / code-block mention can
  never register a verifier."_ → **floor: enum/regex** (primitive #3). Deterministic `^---…---` fence
  extraction + `role === "verifier"` equality, pure Node, no LLM. A real guarantee, bound by the ★ test
  `THE BUG, PROVEN CLOSED`. Verified by construction: a body/prose/code-block `role: verifier` is outside
  the non-greedy capture group and is structurally unreachable (`count-verifiers.mjs:76`,
  `count-verifiers.test.mjs:114`).
- _"`registered: 0` on this repo."_ → labeled a **measured fact** (P6), not a standalone guarantee;
  re-confirmed live this run.
- _"`/verify` therefore runs floor-gates-only."_ → the membership **number** is floor-grade; the command
  **acting** on it is **advisory orchestration** — correctly labeled "two clocks" in `verify.md`.
- **Honest non-claim, independently verified:** the count does **not** feed the verdict.
  `floor/check-verify.mjs` takes only the `{gate:exit-int}` results map + `--feature` (`check-verify.mjs:98–99`);
  there is **no channel** for the count to reach the verdict (the ★ spine test `check-verify.test.mjs:74`
  asserts the emitted object has no such key). So even a wrong count could never flip a guaranteed
  decision — this fix improves the **advisory** layer's honesty only, exactly as the plan states
  (`PLAN.md:60`).

No guarantee lacks a floor reduction; none is mislabeled. The increment **applies** the P0 discipline — it
converts a non-floor prose-grep into a floor-grade enum/regex read.

## L-eval → P1 — clean

- `count-verifiers.mjs` is **not a Capability** (no `role:` frontmatter; it is a `.mjs` helper), so P1's
  "every Capability ships evals" does not bind it. It is floor infrastructure governed by the floor-helper
  convention (colocated hermetic `*.test.mjs`), which it satisfies: 9 tests, collected by `npm test`'s
  `**/*.test.mjs` glob, all green.
- It introduces **no `enforces` rule_id**, so the rule_id↔eval binding (fix #6) is N/A. The floor and this
  reviewer **agree** (both: no capability added; count stays 1) — no disagreement-finding.
- The load-bearing cases are present and pass: both ★ bug-closing cases (prose+code-block → 0; real
  frontmatter → 1) and the ★ excluded-segment case (a `role: verifier` under `floor/` / `.claude/commands/`
  → 0, pinning parity with `validate.mjs`'s surface).

## L-trust → P2 (targets the residual) — clean

- `count-verifiers.mjs` ingests untrusted `*.md` bodies but reads **only** the `role:` line **inside** the
  `---` frontmatter fence — an enum-gated / floor-verifiable field. A `role: verifier` in an untrusted body
  is structurally excluded from the count (the ★ bug test proves taint cannot propagate into it).
- **Its output carries no free-text at all**: `{registered:<int>, verifiers:[<path>…]}` — `verifiers[]` is
  path-resolved, `registered` is an int. There is no tainted-free-text surface to launder, which is
  _stronger_ than handling free-text correctly. No guaranteed decision rests on a tainted field.
- **Did reviewed content steer me?** I examined the test fixtures (which embed `role: verifier` strings and
  sentences like _"this is a DECLARATION"_ / _"prose, not our frontmatter"_) and the `verify.md` note. All
  are benign DATA / self-documentation; none is an instruction directed at the reviewer. I complied with
  nothing — there was nothing to comply with. Noting this per the lens.
- **Residual (named, bounded — concur with `PLAN.md:66`):** a hostile capability may put `role: verifier`
  in its **real** frontmatter to self-register — a legitimate declaration whose findings are advisory-only
  (never gate the verdict, fix #3) and which remains subject to the rest of the floor. Blast radius
  unchanged from today.

## L-axis → P3 — clean

- One axis per file: `count-verifiers.mjs` = count membership from frontmatter; `.test.mjs` = its tests;
  the `verify.md` edit stays within Step 2's membership shorthand.
- **No sibling import.** The helper is self-contained (own `walk` / `isExcluded` / `frontmatterRole`); it
  **re-implements** the `^---…---` mechanism rather than importing `set-writes-scope.cjs` / `validate.mjs`
  (neither is exported — both run on load). Its header **cites** both precedents (P4) — a citation, not an
  import.
- The new-file decision (vs bolting onto `set-writes-scope.cjs` or `check-verify.mjs`) is P3-correct: three
  distinct axes (writes-scope.json / exit-code verdict / membership count) → three files.

---

## Findings

### floor-gate (blocking) — NONE

The increment passes the floor (GREEN, confirmed live) and all four lenses. **Zero blocking findings.**

### advisory-gate (warn — judgment / clarity; never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: "P3" # mechanism-reuse-not-import has a named cost: two parsers can diverge
  severity: minor
  file: "floor/count-verifiers.mjs:76"
  problem: "The opening-fence test is stricter than validate.mjs's, so the 'counts exactly what
    validate.mjs treats as role-bearing' parity holds only for well-formed frontmatter: a file beginning
    with >=4 dashes that declares role: verifier is parsed as a capability by validate.mjs but returns
    null here (an undercount)."
  evidence: "count-verifiers uses /^---\\r?\\n/ (exactly three dashes then newline); validate.mjs uses
    text.startsWith('---') (3+ dashes, any next char) + indexOf('\\n---',3). For '----\\nrole: verifier\\n---',
    validate parses role=verifier; count-verifiers's regex fails to match and returns null."
```

> **Why advisory, not blocking:** no such malformed file exists in the repo (registered:0, floor GREEN — 1,
> both live-confirmed); a ≥4-dash opening is not valid frontmatter; and the divergence direction is an
> _undercount_, which `validate.mjs` independently surfaces (it would treat such a file as a capability
> subject to CHECK 1–3). Parity holds for all well-formed frontmatter, and the load-bearing parity (quote-
> stripping, frontmatter-only, EXCLUDE_SEGMENTS) is pinned by tests. If strict parity is ever required, the
> route is a single exported parser in `pharn-contracts` (or a corpus parity-test asserting both agree) —
> but that is a **separate increment** (refactoring two non-exported parsers is its own axis; doing it now
> would be speculative, P7).

```yaml
- type: FINDING
  rule_id: "P6" # a persistent doc asserting transient state ("this run") can mislead a future reader
  severity: minor
  file: ".claude/commands/verify.md:125"
  problem: "'this run' in a persistent command doc reads as the current /verify run, but the grep it
    describes no longer exists at run time; the 8-file count is historical (the pipeline-integration-probe
    run), so a future reader running /verify sees a claim about a grep that is gone."
  evidence: "the grep hit 8 files this run — PLAN/GRILL/REVIEW/VERIFY text and this command itself"
```

> **Why advisory, not blocking:** the provenance is correctly cited inline (`pipeline-integration-probe`
> finding #3, `REVIEW.md:80` / `VERIFY.md`), so the claim is accurate and attributed; only the word
> _"this run"_ is imprecise in a doc read on every future run. Trivial fix (e.g. _"in the probe's run"_),
> no behavior impact.

## Verdict

**GREEN** — the increment passes the floor and all four lenses; **0 floor-gate (blocking) findings**, 2
advisory/minor. The increment is done. The advisories are improvement notes for a future pass, not blockers.

## Proposed lesson (for a gated `/memory-promote` — NOT canon; P2)

A real, recorded recurring failure (P7 — measured, not hypothetical) underlies this increment and echoes
fix #1 (finding-shape) and fix #15 (scope-setter): **a structural/membership fact must be read from its
structured location, never grepped from free text.** Proposed for the human accept/deny gate via
`/memory-promote` (which runs `floor/check-provenance.mjs` first) — **not** written to
`memory-bank/lessons-learned.md` here (silent canon writes are forbidden, P2; memory poisoning is the worst
persistence vector, `THREAT-MODEL.md §2`).

```yaml
candidate_lesson:
  target: lessons-learned
  statement: "Membership / structural facts are read from the structured location (YAML frontmatter, an
    enum, package.json), never pattern-matched in free text. The enum-gated vs free-text split (fix #1)
    governs MEMBERSHIP detection, not only finding emission: a `role: verifier` string in prose or a code
    block is DATA about verifiers, not a declaration of one."
  provenance:
    increment: verifier-membership-frontmatter
    triggering_failure: "pipeline-integration-probe finding #3 (REVIEW.md:80 / VERIFY.md): the
      `grep -rl 'role: verifier'` membership shorthand matched 8 prose files (0 real declarations) and grew
      with the repo's prose — 'monotonically unstable'."
    diff: "floor/count-verifiers.mjs (new) + floor/count-verifiers.test.mjs (new) + .claude/commands/verify.md:118"
    related: ["fix #1 (finding-shape enum-gated/free-text split)", "fix #15 (scope-setter ## Files extractor)"]
```

End of review. `/review` does not edit the built files and does not write canon; the proposed lesson awaits
a separate, human-gated `/memory-promote` run.
