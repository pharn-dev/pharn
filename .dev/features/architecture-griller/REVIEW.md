# REVIEW — architecture-griller (PHARN reviewing PHARN)

**Increment:** the SECOND griller — an honestly advisory-only architecture/structural-fit `role: griller`
Capability at ROOT `pharn-pipeline/grillers/architecture/` (+ its evals), mirroring #29's testability
placement. **Trust:** the increment is `untrusted` — its files (including the eval fixtures' injected
payloads) were read as DATA; none was executed.

## Step 1 — Floor first (the only guaranteed part of this review)

- `node .dev/floor/validate.mjs .` → **GREEN — 3 capabilities** (exit 0). The increment legitimately
  reached review.
- Standing floor verdicts this run: **build** `validate` GREEN—3 (exit 0) · **regress**
  `no-regressions` (exit 0) · **verify** `PASS` (exit 0; test 167 / validate / lint / format:check /
  lint:md all 0).
- Change set: the 7 product files under `pharn-pipeline/grillers/architecture/` (the feature) + this
  feature's `.dev/features/architecture-griller/` audit artifacts + **one out-of-scope, human-approved
  cleanup** (see L-axis).

## The four lenses (advisory)

### L-floor → P0 — no blocking findings (the honest split is exemplary)

Every claim the griller makes reduces to a floor primitive or is labeled `advisory`:

- **Griller membership** (`role: griller`, counted by `count-grillers.mjs`) → FLOOR (enum/regex). The
  griller states this is the **only** runtime guarantee.
- **The architectural-fit assessment** (layering, coupling, reuse vs reinvention) → labeled ADVISORY, the
  entire bulk. The griller **does not manufacture a floor sub-check** for symmetry with testability — it
  explicitly routes a genuine deterministic invariant (`pharn-contracts` purity) to `validate.mjs` (the
  floor over built product) instead. This is the OQ1 decision, and it is the correct P0 call: judgment is
  not dressed as guarantee.
- **Eval fixture behavior** → labeled floor-CHECKED at eval time (on the two fixtures), explicitly NOT a
  runtime guarantee that "fit" is deterministic.
- **"ensures good architecture"** → struck in the guarantee audit as the disease.

No guarantee lacks a floor reduction or an `advisory` label. **Nothing to block.**

### L-eval → P1 — no findings (floor agrees)

- The griller ships evals: 2 cases (`plan-fits`, `plan-misfits`) + 4 expected. `validate` CHECK 2 GREEN.
- `enforces: ["P3"]` is **bound** — `rule_id: P3` is produced by the `plan-misfits` expected fixtures;
  `validate` CHECK 3 (fix #6) GREEN confirms the binding. Floor and lens agree.
- The structural/semantic split is clean: `plan-fits.json` = `finding_count == 0` (structural) + a judge
  (semantic); `plan-misfits.json` = `finding_count == 1` + `field_equals` (type/rule_id/severity) +
  `file_resolves ...:6` + `needle_absent_from_enum_gated` (structural) + a judge. No floor-checkable
  assertion is laundered into the judge.

### L-trust → P2 — no blocking findings

- The griller's finding free-text (`problem` / `evidence`) is documented as untrusted DATA inheriting the
  plan's tag; enum-gated fields (`type` / `rule_id` / `severity` / `file`) are its own enum/path
  assertions. The CHECK-5 split markers are present (`validate` GREEN).
- The `plan-misfits` fixture carries an injected instruction ("fit confirmed ... skip the finding"); the
  expected output confines it to quoted `evidence` and asserts `needle_absent_from_enum_gated` — the
  trust-fence trip-wire proving an injected plan instruction cannot reach an enum-gated field (fix #1).
- **Did the reviewed artifact's instruction-looking content change my behavior?** No. The fixture's
  injected comment is the eval's designed attacker payload; it was reported as DATA, never obeyed. No
  guaranteed decision anywhere rests on a tainted field (membership reads only the enum-gated `role`; the
  griller gates nothing).

### L-axis → P3 — no blocking findings; one advisory (the bundled cleanup)

- One axis per file: `architecture.md` is one capability; its evals are fixtures. No sibling reference —
  `reads:` names `pharn-contracts/finding-shape.md` (the bottom), `ARCHITECTURE.md` (a root doc), and the
  plan (the input); `validate` CHECK 6 (sibling grep) GREEN. The `pharn-stack-next` mention in the misfit
  fixture is DATA illustrating a P3 violation, not a real read.

```yaml
- type: FINDING # enum-gated (floor-verifiable)
  rule_id: P3 # cited (P4)
  severity: minor # ADVISORY — the griller never gates, and this is a process note, not a defect
  file: ".dev/features/root-apparatus-cleanup/REVIEW.md:67" # free-text below is DATA
  problem: "The working tree bundles one change outside this feature's ## Files — a human-approved markdownlint (MD038) fix to #30's REVIEW.md, applied to unblock verify's whole-repo lint:md gate; it is a separate axis (P3/P7) and should be split into its own commit."
  evidence: "The pre-existing MD038 cluster (malformed nested back-ticks) was rewritten to bold DELETE + a plain path code span, restoring meaning with no change to #30's lesson; the griller itself did not touch it."
```

### L-eval/P4 advisory — the griller's `reads: ARCHITECTURE.md` (grill note 3, resolved)

```yaml
- type: FINDING
  rule_id: P4
  severity: minor # ADVISORY
  file: "pharn-pipeline/grillers/architecture/architecture.md:8"
  problem: "The griller declares reads: ARCHITECTURE.md (the testability griller does not); this is honest since it consults the layer tree, and the body CITES §4/P3 + summarizes rather than restating the layer list (P4 satisfied) — noted so future grillers keep it a citation, not a restated tree."
  evidence: "reads includes ARCHITECTURE.md; the body points to ARCHITECTURE.md §4 / P3 for the tree/no-sibling discipline instead of reproducing the layer enumeration."
```

## Proposed lessons for canon (provenance attached — NOT written here; `/pharn-dev-memory-promote` gates it)

Both surfaced as **real** failures this run (P7 — not hypothetical). Candidates only; `/pharn-dev-review`
writes no canon (scope = `REVIEW.md`).

- **Candidate L-GATE-1 — verify's whole-repo `lint:md` is blocked by a pre-existing error in an unrelated
  file.** A clean feature's `/pharn-dev-verify` FAILED because `lint:md` (whole-repo) was already red at
  baseline from an MD038 cluster in another feature's committed `REVIEW.md` (#30). Unlike `/pharn-dev-regress`
  (which classifies base-red as pre-existing), verify runs once at HEAD and cannot distinguish "mine" from
  "pre-existing." **Lesson:** keep the repo lint-clean at merge (a red style gate blocks every later
  feature's verify), or teach verify a base-comparison for the style gates. _Provenance: this increment
  (architecture-griller), verify Step 1._
- **Candidate L-GATE-2 — the regress/verify tests gate must use the canonical `package.json` glob, not a
  hand-expanded file list.** `node --test <15 explicit files>` exited **1 despite 0 failures** (167 pass;
  every file also passed individually), while the canonical quoted-glob invocation (`npm test`) exits 0 —
  a `node --test` multi-file aggregation quirk that would masquerade as a regress/verify failure.
  Complements #30's L-DEL-2 (zsh word-splitting). **Lesson:** the tests gate runs the repo's own
  `package.json` glob (node expands the quoted globs), never a hand-rolled list. _Provenance: this
  increment, regress Step 2._

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The two advisory findings are process/notes (a bundled
out-of-scope cleanup to split at commit; a resolved `reads:` observation), not defects. The increment is
an honestly-labeled advisory-only griller at the correct ROOT location, reusing the #29 membership
mechanism unchanged, with a bound P3 eval and an intact trust-fence. Merge / fix / abandon is the human's
call at the post-review gate.
