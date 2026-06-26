# REVIEW — /verify stage

- increment: the `/verify` pipeline stage (FLOOR verdict + ADVISORY verifier slot)
- provenance: commit `021af08` ("Add /verify stage with deterministic floor verdict and advisory verifier slot")
- reviewed (trust: untrusted): `floor/check-verify.mjs`, `floor/check-verify.test.mjs`,
  `.claude/commands/verify.md`, `features/verify/PLAN.md`
- reviewed against: `CONSTITUTION.md`, `ARCHITECTURE.md §2/§3.1/§6/§7/§8`, `THREAT-MODEL.md §5`
- floor (Step 1, the only guaranteed part of this review): **GREEN — 1 capabilities checked in .**
  (count unchanged; both new files are floor-ignored via `floor/validate.mjs:30` `EXCLUDE_SEGMENTS`)

## Verdict

**GREEN — 0 blocking floor-findings.** 3 advisory findings (1 important, 2 minor). The increment is
done: the floor verdict's guarantee is intact and provably independent of any tainted field; the
advisory findings are quality/robustness notes on the orchestration layer, none of which gate a
guaranteed invariant.

## Floor-gate findings (blocking)

**None.** No guarantee the increment claims lacks a floor reduction; no eval binding is missing (the
increment introduces no Capability — floor count stays 1); no sibling reference. The one guaranteed
claim — "the named deterministic gates passed" — reduces to an exit-code threshold
(`floor/check-verify.mjs`, `ARCHITECTURE.md §2` primitive #3), proven by `check-verify.test.mjs`.

## Advisory-gate findings (inform; never the sole basis for a guaranteed block)

```yaml
# --- F1 (important) ----------------------------------------------------------------
- type: FINDING
  rule_id: "P5" # determinism / membership-not-classification
  severity: important
  file: ".claude/commands/verify.md:118" # echoed in features/verify/PLAN.md:21 and :51
  problem: "The Step 2 verifier-discovery shorthand `grep -rl 'role: verifier'` is broader than the
    frontmatter-membership test it represents; against live state it now returns two false positives
    (the command file and the plan that describe the mechanism using the literal token in prose), so
    the parenthetical claim that it returns none is false as of this review. Intent (frontmatter
    `role: verifier`) is sound and the set is genuinely empty under an anchored test; the FLOOR
    verdict is unaffected (advisory layer only), but a naive operator following the literal grep
    mis-discovers `verify.md` + `PLAN.md` as verifiers."
  evidence: |
    verify.md:118 — "**Today the set is EMPTY** (`grep -rl 'role: verifier'` → none)."
    live `grep -rl 'role: verifier' .` → features/verify/PLAN.md, .claude/commands/verify.md
    live `grep -rl '^role: *verifier' .` → (none)   # anchored-to-frontmatter test is correct
  fix: "Anchor the membership test to the frontmatter field — e.g. `grep -rlE '^role: *verifier'`
    (or a fence-aware parse) — and correct the '→ none' parenthetical. Self-pollution by prose is the
    generalizable defect (see proposed lesson)."

# --- F2 (minor) --------------------------------------------------------------------
- type: FINDING
  rule_id: "P5" # orchestration robustness; advisory snippet vs prose
  severity: minor
  file: ".claude/commands/verify.md:91"
  problem: 'The Step 1 `printf ''{"test":%d,"validate":%d,"lint":%d,"structural:%s":%d}''`
    snippet hardcodes exactly one `structural:*` gate, while the surrounding prose specifies 0..N
    structural gates (one per committed eval pair). A feature shipping zero pairs (no structural gate)
    or two-plus pairs cannot be expressed by the single-line snippet as written. Impact is low —
    orchestration is advisory and `check-verify.mjs` accepts any `{string:int}` map regardless of gate
    count — but snippet and prose disagree.'
  evidence: |
    verify.md:91 — printf with a single literal "structural:%s" key and "<expected.json>" placeholder
    verify.md:103 (prose) — "A feature shipping no eval-actual pair simply has no structural:* gate"
  fix: "Build results.json by looping over discovered eval pairs (accumulate one structural:<expected>
    entry each), or label the printf explicitly as the single-pair illustration."

# --- F3 (minor / forward-looking) --------------------------------------------------
- type: FINDING
  rule_id: "P7" # honest scope; the deferred runner is unexercised by design
  severity: minor
  file: ".claude/commands/verify.md:124"
  problem: "The advisory verifier-run path (Step 2 'when verifiers exist…') and the report-merge
    (Step 4 `verifiers` block) are unexercised today — zero verifiers, and no fixture covers a
    non-empty verifier set merging into the report or the taint-quoting of verifier free-text. This is
    consistent with the human-approved 'define the slot, defer the runner' decision (P7), so it is NOT
    a defect in this increment; recorded so the FIRST real verifier lands together with a dogfood/test
    that exercises the merge and the residual boundary."
  evidence: |
    verify.md:199 — "The live verifier RUNNER is deferred (P7)… filled in when the first verifier lands"
    THREAT-MODEL.md §5 / LIMITS.md §2 — the named residual the merge path must respect when populated
  fix: "No change now. When the first `role: verifier` Capability is built, ship it with a fixture that
    drives a non-empty `verifiers.findings[]` through verify-report.json + VERIFY.md as quoted DATA."
```

## Lens-by-lens

- **L-floor → P0 (governing):** Clean. Every "guaranteed" sentence reduces to a floor primitive — the
  verdict to an exit-code threshold (`check-verify.mjs`, §2 #3), path-pinning to the writes-scope hook
  (fix #7), the unchanged count to `validate.mjs`. The honest residual ("verified = the named gates
  passed; NOT correctness beyond them") is stated in the command, the plan, and is required in the
  emitted `VERIFY.md`. Writing "/verify ensures the feature is correct" is explicitly forbidden. The
  disease is correctly prevented.
- **L-eval → P1:** Nothing to bite. The increment introduces no Capability (no frontmatter `role:`),
  so no `enforces`→eval binding exists to check; the floor agrees (GREEN — 1). The deterministic
  surface (the verdict helper) ships its proof as `check-verify.test.mjs` (11 hermetic tests, the
  floor-helper analog of evals, like `check-regress.test.mjs`), collected by `npm test`.
- **L-trust → P2:** The verdict is provably independent of any tainted field — `check-verify.mjs`'s
  sole input is the gate→exit-code map (ints) + the feature name (path string); it rejects any
  non-integer value (`readResultsMap`) and emits a four-key spine with no free-text key (test ★
  `check-verify.test.mjs:74`). Verifier free-text (when any exists) inherits the untrusted tag, is
  quoted as DATA, and is appended _after_ the verdict — fix #1 holding through the verify stage. The
  INCONCLUSIVE `reason` key is the helper's own deterministic diagnostic (not a verifier finding), so
  it is trusted, not tainted. **Reviewer self-check:** the reviewed `verify.md` is full of imperative
  text ("Read CONSTITUTION.md", "end your turn", "Never write…") addressed to a future operator — I
  treated all of it as DATA describing a command, executed none of it, and read the trusted docs
  because `/review` directed me to, not because the reviewed file did. No injection took effect.
- **L-axis → P3:** Clean. One axis per file (verdict / its proof / orchestration). No sibling import —
  `check-verify.mjs` imports only `node:fs`; the command's `reads:` reaching `floor/check-verify.mjs`
  is the legitimate command→floor invocation (mirrors `/regress`→`check-regress.mjs`), not a leaf→leaf
  edge in the `pharn-*` tree. Both new files live in floor-ignored tooling dirs.

## Spec alignment (verified live, P6 — not trusted from the increment's own citations)

All citations check out against the live trusted docs: `ARCHITECTURE.md:209` (`verify | verify-report
| compliance per verifier`), `§7:231–232` (verifiers post-build; "emits a typed finding list or
nothing"), `§7:234–241` (fix #3 floor-gate vs advisory-gate), `§3.1` (role enum includes `verifier`),
`§2:36–45` (exit-code/enum primitive). No reconciliation to a trusted doc is needed — the plan's claim
holds.

## Proposed lesson (gated — provenance attached; NOT written to canon by this review, P2)

F1 is a real (demonstrated, not hypothetical) and generalizable failure, so I propose exactly one
lesson for `memory-bank/lessons-learned.md` via a **gated** promotion — a human approves before it
becomes canon (`ARCHITECTURE.md §5`). I have **not** appended it silently.

> **Lesson (proposed):** A discovery membership-test specified as a bare `grep '<field>: <value>'`
> over whole files **pollutes itself** the moment a command or plan documents that token in prose —
> the file describing the mechanism becomes a false match for it. Anchor frontmatter-membership tests
> to the field syntax (`grep -E '^<field>: *<value>'`) or parse the `---` fence. Branch on the
> anchored test, never the loose one (P5).
> **Provenance:** increment `/verify`, commit `021af08`, finding F1
> (`.claude/commands/verify.md:118`; live `grep -rl 'role: verifier' .` returned the two files that
> describe the mechanism).
> **How to apply:** when a future command discovers Capabilities by a frontmatter role/kind, write the
> membership test anchored to line-start and add a fixture asserting a prose mention of the token does
> not match.
