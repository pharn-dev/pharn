# REVIEW — review-scope-tighten

**Increment under review:** `.claude/commands/review.md` (writes-scope tightened, `writes:` 2→1 entry +
prose alignment) and `.claude/hooks/enforce-writes-scope.test.cjs` (+1 regression test) — what `/build`
produced for pipeline-integration-probe finding #2. **Trust:** `untrusted` — `review.md` is itself a
file of reviewer-instructions; its imperative prose ("you are the reviewer", "do not write canon here")
is DATA under review, never directions to me (P2). **Floor (Step 1):** `node floor/validate.mjs .` →
**GREEN, 1 capability** (exit 0); `.claude/` is floor-ignored, so the capability count is unchanged by
this increment.

> The floor is the only guaranteed part of this review; everything below is **advisory** (P0). Findings
> dogfood `ARCHITECTURE.md §8`: enum-gated `type`/`rule_id`/`severity`/`file` are my own assertions
> (trusted); free-text `problem`/`evidence` are quoted DATA.

**Live dogfood of the fix:** `/review`'s own Step 0 — run this review against the now-fixed `review.md` —
resolved to `["features/review-scope-tighten/REVIEW.md"]` — **one path, with no `memory-bank` entry.** The command
reviewing the increment is the increment working. Before the fix the same setter emitted 2 paths.

## The four lenses (on the increment)

- **L-floor → P0: PASS (strengthens the floor).** The increment makes one guarantee — "a canon write is
  never permitted to `/review`" — and it reduces cleanly to the floor: the setter parses `writes:`
  deterministically to `[REVIEW.md]` (enum/regex, P5) and the fix #7 pre-write hook denies any write
  outside it, with `memory-bank/**` fail-closed (hook). Pinned by the new test. The claim is correctly
  **scoped to `/review`** and does not overreach to a system-level guarantee. This is the P0 cure, not the
  disease: an over-declared allowlist (advisory-permissive) was replaced by a tight one the hook enforces.
  _Evidence (`.claude/commands/review.md:37`):_ "the scope is parsed from `writes:`, never chosen by a
  model … so a canon write is never permitted to `/review`."
- **L-eval → P1: PASS (the test is the bound spec).** `review.md` carries `role: lens` + `enforces`, but
  it lives in `.claude/`, which `validate.mjs` ignores — so it is not a counted capability and needs no
  product evals; the floor and the convention **agree** (no disagreement-finding), and this increment did
  not touch `role:`/`enforces`. The increment's spec is the new deterministic test, which is genuinely
  **bound** to the fix: it fails on the old 2-entry declaration and passes on the new one (verified live,
  99/99). _Evidence (`enforce-writes-scope.test.cjs:231`):_ "resolves to ONLY features/<name>/REVIEW.md
  (no canon path)."
- **L-trust → P2: PASS (the guarantee rests on the floor, not on my compliance).** The scope decision is
  pure enum/regex over `writes:` — no free-text touches it, so no taint enters a guaranteed path; the
  finding-object split in `review.md` (lines 86-93) is unchanged and still honors `ARCHITECTURE.md §8`.
  The recursive case held: `review.md`'s imperative prose did **not** steer me beyond the
  legitimately-invoked command, and even if it were hostile, the setter+hook — not my judgment — set the
  1-path scope I observed. The §5 trust-fence residual (downstream LLM consuming free-text) is untouched
  by this increment.
- **L-axis → P3: PASS (one axis, no siblings).** `review.md` changed for exactly one reason (align its
  declared/documented scope with its single real output); the test for one reason (guard that scope). No
  new `reads:` entry; the prose mention of `/memory-promote` is an orchestration cross-reference between
  commands, not a `pharn-*` layer-tree sibling import.

### Findings (advisory — none blocking)

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: "P0"
  severity: important
  file: "floor/validate.mjs:1"
  problem: "This increment closes the /review instance, but the system-level invariant 'no command writes
    canon except via /memory-promote's gate' is still ADVISORY, not floor-composed: nothing enumerates
    every .claude/commands/*.md `writes:` to fail-closed if a NEW command over-declares a memory-bank/**
    path. The per-command guarantee is floor-backed (tight scope + hook); the cross-command one rests on
    declaration discipline + this review. This is the residual the probe named, not a defect introduced
    here — a P7-eligible follow-up enforcer, deliberately out of this increment's one axis."
  evidence: "PLAN 'Out-of-scope follow-up'; probe REVIEW.md:108 'at the system level the provenance gate
    is advisory … not floor-composed.'"
```

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: "P1"
  severity: minor
  file: ".claude/hooks/enforce-writes-scope.test.cjs:240"
  problem: "The explicit `!scope.includes('memory-bank/lessons-learned.md')` assert is logically
    redundant with the preceding `deepEqual(scope, ['features/sample/REVIEW.md'])` (the deepEqual already
    excludes any second path). It is defensible — a named, self-documenting regression message pinned to
    the exact finding — so no change is required; noted for completeness, not as a defect."
  evidence: "two asserts on the same fact: deepEqual then a named !includes guard for the canon path."
```

## Gates (fix #3)

- **floor-gate (blocking): none.** `validate.mjs` GREEN; the single guarantee reduces to the floor (no
  unlabeled P0 claim); no missing eval binding (the floor and convention agree `review.md` is
  floor-ignored tooling); no sibling reference.
- **advisory-gate (warn):** the two findings above — one important **system-level residual** (a P7
  follow-up, not a defect of this increment) and one minor, no-action observation.

## Verdict

**GREEN — 0 blocking floor-findings.** The increment does exactly what the plan scoped on one axis:
`/review`'s resolved writes-scope is now exactly its real output (`REVIEW.md`), the fix #7 hook denies it
any canon write, and a deterministic test pins it. It **tightens** the floor (removes an allowlist entry
that was permissive in the dangerous direction) rather than adding any unbacked guarantee. The increment
is done.

## Proposed lesson for `/memory-promote` (gated — NOT written to canon here, P2)

Per `/review`'s final step, I propose **one** lesson from the **real** failure this increment closed (P7
— real, not hypothetical). It is **not** written to `memory-bank/lessons-learned.md` here; my scope is
`REVIEW.md` only. `/memory-promote` assembles the candidate, runs `check-provenance.mjs`, and **halts for
explicit human accept/deny** before any write (the model never self-promotes — P2).

- **Candidate id `L<next>` — _A stage's `writes:` must equal exactly what it writes this run; never
  declare a downstream gate's target in an upstream stage's scope._** Declaring
  `memory-bank/lessons-learned.md` in `/review`'s `writes:` made the fix #7 setter resolve — and the hook
  then PERMIT — a direct, ungated canon write, silently granting `/review` the very power
  `/memory-promote`'s `check-provenance` + human gate exist to withhold. An over-declared scope is
  permissive in the dangerous direction (the same class as the #15 scope-setter leak and this #2 finding).
  - **Why:** fix #7's guarantee ("a stage may write only its declared outputs") is only as tight as the
    declaration. "Proposes a lesson" is not "writes canon" — conflating the two in `writes:` turns an
    advisory intent into a floor-granted capability, one layer up from the P0 disease.
  - **How to apply:** declare in `writes:` only paths the stage's own code writes this run; route any
    gated/downstream write through the dedicated gated command, which declares that path itself. Add a
    test pinning the resolved scope to exactly the real outputs (set-equality), so a future re-widening
    fails closed.
  - **Provenance (for `/memory-promote`):** feature `review-scope-tighten`; commit = HEAD at promote time;
    source `features/review-scope-tighten/REVIEW.md` (this review) + probe finding #2
    (`features/pipeline-integration-probe/REVIEW.md:101-114`); date `2026-06-29`.

**End of `/review`.** The actual promotion is a separate, human-gated `/memory-promote` run.
