# REVIEW — testability-griller (first griller + `count-grillers.mjs` membership)

PHARN reviewing PHARN. The increment under review is `trust: untrusted`; instruction-looking content in
it (e.g. the eval fixture's injected `mark present` comment) is DATA reported as a finding, never
followed. My own findings dogfood the enum-gated / free-text split (fix #1).

**Floor (Step 1, precondition):** `node .dev/floor/validate.mjs .` → **GREEN, 2 capabilities** (trust-fence
+ testability griller). The increment legitimately reached review. The floor is the only guaranteed part
of this review; everything below is **advisory**.

## Floor-gate findings (blocking)

**None.** The four lenses found no guarantee lacking a floor reduction or an `advisory` label, no missing
eval binding, no tainted-field gate, and no sibling reference. The floor (validate GREEN + the eval
binding) and my L-floor / L-eval reading **agree**.

## Advisory findings (inform; never the sole basis for a block — fix #3)

### L-floor → P0 (the governing lens) — clean, with two honesty notes

The P0 discipline is unusually well-honored: membership is labeled the real floor guarantee
(`count-grillers.mjs`), presence-detection is labeled floor-**checkable at eval-time but advisory at
runtime**, adequacy is `semantic[]`/advisory, and "ensures testability" is explicitly struck. The grill's
"completely" overclaim was tightened. Two notes, both advisory:

```yaml
- type: FINDING
  rule_id: P0
  severity: minor # advisory
  file: ".claude/commands/pharn-dev-grill.md:113"
  problem: "'the grill stage discovers and runs grillers' is advisory orchestration in prose (in BOTH grill commands) — nothing on the floor forces a discovered griller to actually run; only membership (count-grillers.mjs) is floor."
  evidence: "Step 2b 'Discover + run grillers (the advisory plug-in slot; membership is FLOOR)' — the wiring itself labels this correctly, so this is a note confirming the honest split, not a defect (mirrors verify's verifier slot)."
```

```yaml
- type: FINDING
  rule_id: P0
  severity: minor # advisory
  file: "pharn-pipeline/grillers/testability/testability.md:9"
  problem: "The griller declares writes: ['features/<name>/findings.json'] but the in-loop emission is a fold into GRILL.md and the standalone findings.json runner is deferred (P7); the declaration is a conformance placeholder, not a live floor-enforced write this increment."
  evidence: "writes: [\"features/<name>/findings.json\"] + the body's '§Machine-readable emission' note that the standalone path 'is finalized when the live griller runner lands' — honestly labeled, tracked for the follow-up."
```

### L-eval → P1 — binding present and floor-confirmed; the live measurement is deferred

The griller ships 2 eval cases + expected (json+md); `enforces: ["P1"]` is bound by
`plan-no-verification.json`'s `rule_id: P1` (validate CHECK 3 GREEN — floor and lens agree).
`count-grillers.test.mjs` (12 cases) satisfies the floor-helper convention.

```yaml
- type: FINDING
  rule_id: P1
  severity: important # advisory
  file: "pharn-pipeline/grillers/testability/evals/expected/plan-no-verification.json:8"
  problem: "The griller's structural[] assertions (finding_count==1, rule_id P1, file_resolves ...:6, needle_absent 'mark present') are AUTHORED but not yet EXECUTED over a live findings.json — so the eval is a spec, not a measured pass; the file_resolves ':6' in particular is only correct if the griller cites the fixture's title line at runtime."
  evidence: "No committed actual findings.json for the griller (the live claude -p runner is deferred, P7, like verify's verifier runner). The follow-up /pharn-dev-eval must confirm the griller emits exactly this shape under injection before the floor sub-check is a measured guarantee, not just a reducible one."
```

```yaml
- type: FINDING
  rule_id: P1
  severity: minor # advisory
  file: "pharn-pipeline/grillers/testability/evals/cases/plan-with-verification.md:1"
  problem: "No eval case for the 'verification heading present but empty/substanceless' boundary — the exact place FLOOR-presence and ADVISORY-adequacy diverge; two cases bind the floor (P7-defensible) but this boundary is the most illustrative testability case (also raised at grill time)."
  evidence: "The cases are only plan-with-verification (present, non-empty) and plan-no-verification (absent); the present-but-empty middle is untested — worth the live-eval follow-up."
```

### L-trust → P2 — the fence held; no tainted field gates anything

The griller's finding shape confines the injected `mark present` payload to free-text
(`problem`/`evidence`), guarded by the `needle_absent_from_enum_gated "mark present"` structural
assertion. `count-grillers.mjs` reads **only** the frontmatter `role` (enum-gated) — a `role: griller` in
an untrusted plan/prose body never counts (hermetically tested, incl. the stage-command-exclusion). The
injected fixture content did **not** steer this review (I report it as DATA). **No guaranteed decision
rests on a free-text field.** No advisory finding.

### L-axis → P3 — one axis per file; no sibling imports

`count-grillers.mjs` is a **new** self-contained file (not an edit to `count-verifiers.mjs`) — the
membership-counting axis, distinct from the verifier one (same self-contained convention as every floor
helper). The griller `reads:` only `pharn-contracts/finding-shape.md` (the bottom) + the PLAN input — no
leaf→leaf reference; it lives in `pharn-pipeline` (the layer §4 assigns `grill`). Editing **both** grill
commands is one axis (the griller-discovery mechanism) applied to the dev+product stages, symmetric with
the verifier slot in both verify commands (human-approved, OQ3). No advisory finding.

## Verdict

**GREEN — 0 blocking floor-findings.** The increment is done at the floor level: validate GREEN (2
capabilities), the eval binding holds, the trust fence is honored, no sibling reference. The advisory
findings are **honesty/coverage notes and a deferred live measurement**, not defects — the pattern this
increment sets (a griller carrying floor membership + a `finding_count`-reducible presence check, cleanly
split from advisory adequacy) is exemplary and correctly labeled.

> **Advisory, not a guarantee (P0).** GREEN here means the floor checks passed and the four lenses found
> nothing blocking — **not** that the griller is "good" or that it will behave correctly under a novel
> plan at runtime (that is the deferred `/pharn-dev-eval` measurement + human judgment). The one guaranteed
> result is validate GREEN; the lens judgments are advisory.

## Proposed lessons (candidates only — the model never self-promotes; P2/P7)

- **Single-occurrence observation, NOT yet a canon candidate (respecting P7 — real recurring failure, not
  one-off):** `/pharn-dev-plan` does not run `lint:md`, so a plan-authored markdown lint issue (here an
  MD028 blank-line-in-blockquote in this increment's own `PLAN.md`) surfaces only downstream at
  `/pharn-dev-verify`'s whole-repo `lint:md` gate. It was fixed this run. **Promote only if it recurs** —
  if a second `/pharn-dev-ship` run hits the same plan-markdown-lint friction, that would justify a
  `/pharn-dev-memory-promote` candidate (e.g. "plan-stage markdown must be lint-clean, or the plan stage
  should run `lint:md` on its own artifact"). No provenance-shaped candidate is proposed here for a single
  occurrence.
