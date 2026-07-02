# GRILL — documentation griller (`.dev/features/documentation-griller/PLAN.md`)

- **Plan under interrogation:** `.dev/features/documentation-griller/PLAN.md` (`trust: untrusted` DATA).
- **Spec-hash check (content-hash primitive, surfaced — not the gate):** `sha256(ARCHITECTURE.md)` = `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` **==** the plan's pinned `spec_content_hash`. **No drift.** (The actual block on drift is `/pharn-dev-build`'s fix #4 floor-gate, not this stage.)
- **Registered grillers (deterministic membership, `count-grillers.mjs .`):** 8 — architecture, error-handling, migrations, observability, performance, privacy, security, testability. The `documentation` griller is correctly **absent** (it cannot grill its own bootstrap plan).
- **Nature:** ADVISORY end-to-end. Nothing below blocks `/pharn-dev-build`.

## Findings (finding-shape; enum-gated / free-text split honored — fix #1)

### Axis: honest scope / no speculation (P7) — inline interrogation

```yaml
- type: FINDING
  rule_id: P7 # enum-gated (my own assertion)
  severity: important # enum-gated value; ASSIGNMENT is advisory (fix #3) — grill gates nothing
  file: ".dev/features/documentation-griller/PLAN.md:4" # enum-gated — the increment/justification line
  problem: "The plan justifies the griller as 'the ninth griller' in an established family but does not name the specific real dogfood/eval failure that surfaced a need for a documentation-axis interrogation (P7: additions are triggered by a real failure, never a hypothetical)."
  evidence: "increment: Add the **ninth** griller … on the 'will the next person understand this' axis — the trigger cited is family-adjacency ('adjacent to PHARN's comprehension thesis'), not a named failing dogfood/eval." # free-text — quoted DATA
```

> For the human to weigh: is the griller-family expansion (each new plan-interrogation axis) itself the accepted P7 justification here — as it appears to have been for the seventh/eighth grillers (performance, migrations) — or should a concrete triggering failure be named before build? Not a defect I can resolve; surfaced per P5/P6.

### Axis: eval coverage / binding correctness (P1, `eval-format.md`) — build-time gotcha

```yaml
- type: FINDING
  rule_id: P1
  severity: minor
  file: ".dev/features/documentation-griller/PLAN.md:39" # enum-gated — the omits-eval assertion line
  problem: "The expected fixtures use placeholder line anchors ('<TITLE line>', '<offending approach line>') for their file_resolves assertions; at build time these MUST be computed from the actually-written case fixtures, or the structural assertion points at the wrong line (the error-handling omits eval is precise: file → title line 6, injected comment → line 15)."
  evidence: 'file_resolves "…/plan-omits-documentation.md:<TITLE line>" (whole-document absence anchor, never the comment''s line)' # free-text — quoted DATA
```

### Axis: guarantee-audit honesty (P0) — carry the deferred-runner note into the capability

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".dev/features/documentation-griller/PLAN.md:28" # enum-gated — the writes: frontmatter note
  problem: 'The griller declares writes: ["features/<name>/findings.json"], an emission path whose live per-griller runner is deferred (P7); documentation.md must carry the same honest ''Machine-readable emission — runner deferred'' note error-handling ships, so the writes: path is never read as an active guarantee that findings.json is produced.'
  evidence: 'writes: ["features/<name>/findings.json"] … the plan states it ''mirrors the floor-passing error-handling griller'' — the mirror must include that honesty note, not only the frontmatter.' # free-text — quoted DATA
```

## Registered-griller pass (Step 2b — procedures applied inline; runner deferred, P7)

Each registered griller's procedure applied to this plan; all ADVISORY, none gate:

- **testability (P1)** → PRESENT, no finding. The plan ships 3 evals with an explicit `structural[]`/`semantic[]` split (not judge-laundered).
- **architecture (P3)** → FITS, no finding. One capability = one axis; shared abstractions via `pharn-contracts` (finding-shape, eval-format) by citation; no sibling import; `count-grillers.mjs` + grill stage untouched.
- **error-handling (P7)** → no finding. No new failure-prone code is added — the reused `count-grillers.mjs` already fail-closes on a missing/non-dir target, and the griller's own procedure ends ambiguity in "emit a finding + ask" (never a silent pass).
- **security (P2)** → no finding. No secret literals; the injection needle is a declared attack fixture (`trust: untrusted`), not a secret.
- **privacy (P2)** → no finding (axis N/A). Example fixtures use currency/locale, no PII.
- **performance (P7)** → no finding (axis N/A). Markdown capability + an O(files) frontmatter walk already in the floor.
- **migrations (P7)** → no finding (axis N/A). No schema/data migration.
- **observability (P6)** → no finding (axis N/A). A griller's output _is_ its finding list; no runtime service to instrument.

## Prose summary

The plan is disciplined and closely mirrors the error-handling presence-check precedent it cites: the guarantee audit is honest (membership + fixture-pinned output = FLOOR; the runtime presence _reading_ and adequacy = ADVISORY; the launderable "mentions docs" keyword scan is named and **rejected**; "ensures documentation" is struck). Trust (P2), determinism (P5), one-axis (P3), and eval coverage (P1) are all addressed. The three concerns above are **advisory**: one genuine P7 question (name the triggering failure, or accept family-expansion as the trigger) for the human, and two build-time reminders (compute real `file_resolves` line anchors; carry error-handling's deferred-runner honesty note into `documentation.md`). None is a defect that should stop the build; all improve fidelity.

## Verdict

**ADVISORY VERDICT: 3 concerns raised (0 blocking-severity, 1 important, 2 minor) — for the human to weigh before `/pharn-dev-build`.** This is not "grill passed" and not a guarantee the plan is sound (P0); it is an interrogation record. The spec→plan hash chain held; the deterministic block on drift remains `/pharn-dev-build`'s floor-gate.
