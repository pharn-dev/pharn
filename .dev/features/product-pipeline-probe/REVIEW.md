# REVIEW — product-pipeline-probe

**Increment reviewed:** the product-pipeline-probe — a measured end-to-end run of `/pharn-spec → /pharn-plan →
/pharn-grill → /pharn-build` on a throwaway vehicle (`features/probe-greeting/greet.mjs`), delivering
`.dev/features/product-pipeline-probe/PROBE.md`. Reviewed as `trust: untrusted` (P2).

**Step 1 — Floor:** `.dev/floor/validate.mjs .` → **GREEN, 1 capability** (exit 0). The increment legitimately
reached review. Everything below the floor line is **advisory**.

---

## The four lenses

### L-floor → P0 — no blocking finding

Every guarantee the increment claims is correctly reduced or labeled. `PROBE.md` and `PLAN.md` label the
integration claim as **evidence / advisory** ("the chain runs as a chain — not a proof it is bug-free"), name
the floor-grade facts (the chain checkers, the fix #7 hook deny, `validate`/`check-regress`/`check-verify`
verdicts), and state the vehicle "makes no guarantee claim." No guarantee appears without a floor reduction or
an `advisory` label. The probe is, if anything, **more** P0-disciplined than average because its whole subject
is the floor/advisory split. **Clean.**

### L-eval → P1 — no blocking finding

The increment adds **no Capability** (`greet.mjs` has no `role:` frontmatter; it is a non-Capability vehicle),
so P1's "every Capability ships evals" does not bind it — identical to probe #14's `floor/exit-label.mjs`. The
floor agrees (`validate` GREEN, capability count unchanged at 1). No `enforces` rule_id is introduced, so no
eval binding is owed. The acceptance criterion was nonetheless exercised (advisory `node -e` → pass). **Clean,
and the floor + this lens agree.**

### L-trust → P2 — no blocking finding

- The free-text fields in every finding the increment emits (`PROBE.md`, both `GRILL.md`s) are explicitly
  handled under the `finding-shape.md` enum-gated / free-text split and rendered as quoted DATA.
- **No instruction-looking content in the reviewed artifacts changed reviewer behavior** — the vehicle and its
  prose are benign (a pure `greet`; a header comment that is plainly descriptive). No injection was present to
  resist; none was followed.
- **No guaranteed decision rests on a tainted field:** every gate the probe drove (`check-spec`,
  `check-spec-approved`, `check-plan-spec-agree`, the fix #7 hook, `validate`, `check-regress`, `check-verify`)
  reads only enum/exit-code/path inputs. The probe explicitly verified the fix #7 deny by **observation** (exit
  2), strengthening rather than asserting the bound. **Clean.**

### L-axis → P3 — no blocking finding

One coherent axis (the integration probe). `greet.mjs` is import-free → no sibling reference. The dev plan's
`## Files` declares one file (`PROBE.md`); the product artifacts are each their own command's output. No file
carries two reasons to change. The two slugs (`product-pipeline-probe` dev increment + `probe-greeting` product
vehicle) are inherent to the nesting, not a bundling smell. **Clean.**

---

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** The increment is done in the floor sense: the floor is GREEN, no
guarantee is unlabeled, no Capability lacks evals, no tainted field gates a decision, no sibling reference. The
substantive **output** of this increment is the measurement + findings in `PROBE.md`, not new product surface.

## Advisory observations (not blocking — for the human / separate increments)

- The increment **edited its own approved PLAN.md mid-build** (the CF-E conformance reword) to get past the
  `--from-plan` setter. Recorded transparently and intent/scope/hash were unchanged, but "editing an approved
  plan during build" is a process smell worth noting — the cleaner path (a parser fix so the reword is
  unnecessary) is CF-E's separate increment.
- The probe required **human-authorized commit discipline mid-run** (the CF-1-amplified false escape) and a
  **prettier pass on its own artifacts** (G3) to complete the dev loop — both are real interactions a
  nested-pipeline increment forces, both resolved, both candidates for separate fixes.

## Proposed lessons for canon (PROPOSED only — `/pharn-dev-memory-promote` writes canon, behind its own gate + human accept; never here)

> Provenance for both: increment `product-pipeline-probe`, branch `product-pipeline-probe`, commit `a730f28`
> (+ uncommitted run artifacts), `.dev/features/product-pipeline-probe/PROBE.md`. Each is a **real** failure
> surfaced this run (P7), not hypothetical.

- **Candidate L-?: Pipeline artifacts on the validate-scanned surface inherit the floor + style gates that
  `.dev/`-excluded dev artifacts never faced.** A finding-bearing product `GRILL.md` must carry the
  enum-gated/free-text split-doc strings (or it trips `validate` CHECK 5 — CF-A) **and** be prettier/markdownlint
  clean (or it REDs `/pharn-dev-verify` — G3). The dev pipeline never exercised either because its artifacts live
  in excluded `.dev/features/`. _Why it matters:_ the first real product-pipeline run can RED the floor/verify
  for reasons unrelated to the user's code. _How to apply:_ either exclude product pipeline artifacts from
  `validate` + the style globs (mirroring `.dev/`), or make the `pharn-*` commands emit split-documented,
  style-clean markdown by construction.
- **Candidate L-?: The `--from-plan` writes-scope setter truncates `## Files` at a pre-path prose
  exclusion-cue (CF-E).** Explanatory prose under `## Files` that mentions `not touched` / `out of scope` / etc.
  ABOVE the back-tick path items zeroes the scope → fail-closed exit 1, blocking the build. _Why it matters:_ a
  perfectly valid plan with an explanatory blockquote is rejected, and the failure message ("no back-tick paths
  under `## Files`") does not point at the cue as the cause. _How to apply:_ anchor the exclusion-cue boundary to
  a heading/list-lead (not mid-blockquote prose), or only honor the cue at/after the first path item.

These are **proposals**. No canon is written by `/pharn-dev-review` (scope is `REVIEW.md` only); promotion is a
separate human-gated `/pharn-dev-memory-promote` run.
