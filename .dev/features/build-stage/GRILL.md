# GRILL — build-stage (`/pharn-dev-grill` of `.dev/features/build-stage/PLAN.md`)

- **Plan under interrogation:** `.dev/features/build-stage/PLAN.md` (build `/pharn-build`, the product build stage).
- **Spec-hash check (content-hash floor primitive — surfaced, advisory here):** `sha256(ARCHITECTURE.md)` recomputed live = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` == the plan's carried `spec_content_hash` (`PLAN.md:3`). **No drift.** (The binding block on drift is `/pharn-dev-build`'s floor-gate, fix #4 — not this stage.)
- **Trust:** the PLAN is `trust: untrusted` DATA. Findings' enum-gated fields (`type`/`rule_id`/`severity`/`file`) are my own assertions (trusted); `problem`/`evidence` quote the plan and inherit its untrusted tag (rendered as DATA). `finding-shape.md` cited, not restated (P4).
- **Gate status:** **ADVISORY end-to-end. Nothing here blocks `/pharn-dev-build`.** The plan's two decisions were human-resolved at GATE 1 (OQ1 → Option A; OQ2 → thin BUILD.md); these findings are concerns to weigh, not vetoes.

---

## Findings

### P0 — guarantee-audit completeness (floor-vs-advisory)

```yaml
- type: FINDING
  rule_id: "P0"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:78"
  problem: "The 'no parseable scope → refuse' claim is labeled 'floor: fail-closed', but the REFUSE is advisory (the command obeying set-writes-scope.cjs's exit code) — only the setter's exit-1 is floor; the stop is the same two-clocks split the plan applies to the other gates, and is unlabeled here."
  evidence: "no parseable scope → refuse → **floor: fail-closed** (`set-writes-scope.cjs` exit 1; `/pharn-build` refuses rather than fall through to the hook's absent-scope default-safe-set)."
- type: FINDING
  rule_id: "P5"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:51"
  problem: "Stale-scope hazard: a failed `--from-plan` (Step 0) writes NOTHING, leaving any PRIOR .pharn/writes-scope.json active (e.g. the grill stage's GRILL.md scope under /pharn-dev-ship). If the command does not HALT on the setter's non-zero exit BEFORE any write, the build proceeds under an unrelated scope. The command must hard-stop on setter exit≠0; the safety must not rest on a stale scope coincidentally denying the path."
  evidence: "Step 3 — Build the increment ... writing **ONLY** paths inside the fix #7 scope (a write outside → the hook denies, exit 2 ...)"
- type: FINDING
  rule_id: "P0"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:33"
  problem: 'The declared `writes: ["features/<name>/BUILD.md"]` UNDER-declares: the command also writes plan-derived USER code (Phase-1). A reader of the §3.1 `writes:` honesty surface would think it only writes BUILD.md. Mirror /pharn-dev-build''s self-documenting placeholder (`<files named in PLAN.md only>`) so the user-code writes are visible in `writes:`, not only in prose.'
  evidence: '`writes: ["features/<name>/BUILD.md"]` — the placeholder for the **Phase-2** build-record scope (OQ2); the **Phase-1** user-code scope comes from `--from-plan`, not from `writes:`'
```

### P1 — eval / test coverage of the named axes

```yaml
- type: FINDING
  rule_id: "P1"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:68"
  problem: "The intent-named 'plan with no parseable scope → refuse (fail-closed)' test is deferred to a runtime 'Confirm … if not, add'. Confirmed LIVE this run: NO test feeds a PLAN lacking a `## Files` heading and asserts exit 1 (all --from-plan tests in enforce-writes-scope.test.cjs use a present `## Files`). Since `## Steps / Files` (the real product-plan section) IS exactly the missing-`## Files` case, this fail-closed branch — the crux scenario — is UNTESTED. Make the test a definite deliverable, not a conditional."
  evidence: "**Confirm** an explicit exit-1 assertion exists for the missing-`## Files` case; if not, add **ONE** small black-box test ..."
```

### P7 — honest scope / no speculation / smallest increment

```yaml
- type: FINDING
  rule_id: "P7"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:100"
  problem: "OQ2 (thin BUILD.md) is a human-chosen convenience with no P7-triggering failure (no dogfood/eval failure motivates it; the plan itself recommended 'none', and the existing dogfood — features/ship-gated — emits no per-stage build file). It adds a NEW artifact class plus a SECOND scope phase (new orchestration that must be gotten right and is itself untested). Accepted by the human at GATE 1 — but flagged so the added surface is a conscious cost, and so the Phase-2 re-scope is verified, not assumed."
  evidence: "OQ2 resolved (human, 2026-06-30) → thin BUILD.md ... scoped via a **Phase-2** `--from-frontmatter … --target` re-set after the user-code writes"
- type: FINDING
  rule_id: "P7"
  severity: important
  file: ".dev/features/build-stage/PLAN.md:99"
  problem: "Option A ships /pharn-build with its CENTRAL guarantee (fix #7 on USER code) not demonstrable end-to-end: against a real product /pharn-plan it fails-closed (the producer is non-compliant until the named `plan-files-scope` follow-up). The real-chain dogfood is therefore blocked on that follow-up. Honest and accepted — but the `plan-files-scope` follow-up must be recorded DURABLY (a feature stub / issue / REVIEW carry-forward), or the gap silently rots."
  evidence: "the product `/pharn-plan`'s non-compliance ... is surfaced as a finding + a **named follow-up** `plan-files-scope`, **not** fixed here. `/pharn-build` is correct + fail-closed until that follow-up lands."
```

### P2 — trust propagation (minor)

```yaml
- type: FINDING
  rule_id: "P2"
  severity: minor
  file: ".dev/features/build-stage/PLAN.md:86"
  problem: "The trust-audit 'Outputs' classifies the user's code but omits the new BUILD.md output. Classify it: BUILD.md content is advisory model work, and if it quotes plan/SPEC free-text (e.g. an echoed file list or note) it must render as DATA, never injected downstream — same discipline as /pharn-dev-ship's SHIP.md roll-up."
  evidence: "**Outputs.** The user's code is ADVISORY model work; it is **never** injected downstream as instructions ..."
```

### P5 — determinism / command-body internal consistency (minor)

```yaml
- type: FINDING
  rule_id: "P5"
  severity: minor
  file: ".dev/features/build-stage/PLAN.md:51"
  problem: "The command body references BOTH `## Steps / Files` (Step 3, implementation guidance) and `## Files` (Step 0, the scope source) — but a real product /pharn-plan emits ONLY `## Steps / Files`. State explicitly in the command that the SCOPE source is a `## Files` heading with back-tick paths, and that a plan carrying only `## Steps / Files` fails Step 0 fail-closed (until `plan-files-scope`) — so the two section names are not silently conflated."
  evidence: "Implement what the plan's Approach / `## Steps / Files` describe, writing **ONLY** paths inside the fix #7 scope"
```

---

## Prose summary

The plan is **strong and unusually honest** — the guarantee audit, trust audit, and determinism audit are thorough, the reuse (no new floor primitive) is clean, the spec-hash chain holds, and the §6 `build-summary.json` gap is correctly reported-not-resolved (consistent with the grill-stage/ship-gated precedents). The crux (fix #7 scope source) was correctly surfaced and human-resolved.

The concerns cluster on the **two human-resolved decisions and the fail-closed honesty**:

- **OQ1 (Option A) is honest but ships a stage that cannot run end-to-end** against a real product plan until `plan-files-scope` lands — and the proof of its central guarantee (fix #7 on user code) is deferred with it. Record that follow-up durably (P7).
- **OQ2 (thin BUILD.md) adds surface with no triggering failure** and a second, untested scope phase (P7) — worth a conscious confirm that the Phase-2 re-scope is correct.
- **Fail-closed is advisory, not floor** (the setter's exit is floor; the command's refuse is the model obeying it), and a **stale prior scope** could mask a failed Step-0 setter unless the command hard-stops on exit≠0 (P0/P5).
- The named **fail-closed test is genuinely missing** today (P1) — confirmed live — so it should be a definite deliverable, not a runtime "confirm."
- The declared **`writes:` under-declares** the plan-derived user-code writes (P0/§3.1 honesty).

None of these are blockers; all are within the approved plan's scope to address during `/pharn-dev-build` (the test, the `writes:` wording, the command-body clarifications) or to carry forward (the `plan-files-scope` follow-up record).

## ADVISORY VERDICT

**8 concerns raised (0 blocking-severity, 6 important, 2 minor) — for the human to weigh before/through `/pharn-dev-build`.** The spec→plan content-hash holds (no drift). This grill-log is **advisory**; it does **not** gate `/pharn-dev-build`. The only floor-grade facts in this run are the writes-scope hook (it pinned where this log could be written) and the spec-hash recompute (no drift). "Grill produced a log" never means "the plan is good" (P0).
