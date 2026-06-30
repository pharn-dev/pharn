# PLAN — product-pipeline-probe (first end-to-end run of the PRODUCT pipeline)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); identical to .dev/features/pipeline-integration-probe/PLAN.md:3 → no drift since probe #14
- increment: push ONE trivial throwaway feature through the first four PRODUCT stages `/pharn-spec → /pharn-plan → /pharn-grill → /pharn-build`, observing every hand-off — to **measure whether the product chain integrates** (it currently never has run as one chain). The feature is a **vehicle**; the deliverable is a **measured chain run with every hand-off observed + any mismatch surfaced**, not the feature.
- layer(s): the **dev-loop** artifact is `.dev/features/product-pipeline-probe/PROBE.md` (a build-loop audit trail — NOT a Capability, no `role:`; under `.dev/`, which `validate.mjs:30` excludes wholesale). The **product** vehicle (`features/probe-greeting/greet.mjs`, a `.mjs` → `validate.mjs:53` only walks `.md`, so it is floor-invisible) and the product pipeline artifacts are run-time outputs of the `pharn-*` sub-commands, not of this dev-build. # ARCHITECTURE.md §4, §6
- constitution_refs: [P0, P2, P5, P6, P7]

---

## What this increment IS (read this first — it is unusual)

This is the **product-loop analogue of `.dev/features/pipeline-integration-probe/` (dev probe #14)**. #14
pushed a vehicle through the **dev** loop (`/pharn-dev-*`); this pushes a vehicle through the **product**
loop (`/pharn-*`). The four product stages are each built + unit-tested in isolation but have **NEVER run
together as one chain on one feature**. Integration is an **assumption**; this run measures it.

**The structure is NESTED, by construction (invoked via `/pharn-dev-ship`):**

- the **outer** dev loop (`/pharn-dev-plan` → this PLAN → human approves → `/pharn-dev-grill` →
  `/pharn-dev-build` → `/pharn-dev-regress` → `/pharn-dev-verify` → `/pharn-dev-review`) manages the
  increment and gives it an audit trail in `.dev/features/product-pipeline-probe/`;
- the **inner** product loop is the **build WORK** that `/pharn-dev-build` performs: it invokes the real
  `/pharn-spec → /pharn-plan → /pharn-grill → /pharn-build` on the vehicle and records each hand-off into
  `PROBE.md` (the one file dev-build writes directly).

Consequence to expect (see CF-B): the product `/pharn-spec` **halts for a human approval INSIDE
`/pharn-dev-build`** — a human gate the `/pharn-dev-ship` chain does not natively model. So this run pauses
for the human **twice more** after plan approval: once to approve the product SPEC (mid-dev-build), and
finally at the post-review GATE 2.

---

## Step 0 — Discovery results (live this run, P6 — never asserted from memory)

**The gap this run targets, confirmed on disk (not speculation):**

- **The product chain has never run as a chain.** Root `features/` contains only `README.md`, `ship-gated/`,
  `ship-loop/` (the latter two hold **dev**-loop artifacts — see CF-D). There is **no product `SPEC.md`,
  `GRILL.md`, or `BUILD.md` anywhere** — so `/pharn-spec`, `/pharn-grill`, `/pharn-build` have never emitted a
  live product artifact, and the spec→plan→grill→build hash chain has never been traversed end-to-end.

**State that shapes the run (read live):**

- **Floor GREEN — 1 capability** (`node .dev/floor/validate.mjs .` → `FLOOR: GREEN — 1 capabilities checked in .`,
  exit 0). `validate.mjs:30` `EXCLUDE_SEGMENTS` = `.claude/commands/`, **`.dev/`**, `node_modules/`, `.git/`.
  Root `features/` is **NOT** excluded → product artifacts there are **scanned** (this drives CF-A). `walk()`
  (`validate.mjs:53`) collects **only `.md`** → a `.mjs` vehicle is invisible to the floor regardless of location.
- **Spec hash matches** the live recompute and the most-recent pin (`pipeline-integration-probe/PLAN.md:3`) →
  no drift; `/pharn-dev-build` re-verifies (fix #4).
- **Live git state (P6), drives the `/pharn-dev-regress` base rule:** working tree **clean**, on `main`,
  `HEAD = 31fcefb`. `/pharn-dev-regress`'s auto-detect resolves base = `HEAD` only when the tree is **dirty**;
  a clean tree resolves base = `merge-base = HEAD` → empty `inside` (useless). The run therefore uses the
  **dirty-tree dogfood flow** (commit discipline below) — exactly as probe #14 did.
- **Four product commands read live + cross-checked** (`.claude/commands/pharn-{spec,plan,grill,build}.md`):
  their declared `reads:`/`writes:` and floor checkers agree on the hand-off shapes (matrix below). All four
  cite the SAME chain checkers (`check-spec.mjs`, `check-spec-approved.mjs`, `check-plan-spec-agree.mjs`).
- **`.pharn/writes-scope.json` exists** (leftover from a prior command, `set_at` 2026-06-30). Each stage
  re-sets it at its own Step 0 (mutable, not a stack) — drives CF-C.

---

## The feature (a VEHICLE — keep it trivial, P7)

A single pure function, the smallest thing that is real enough to have an Acceptance Criterion the chain can
carry and that `/pharn-build` must actually write:

- **`features/probe-greeting/greet.mjs`** — exports a pure, deterministic `greet(name)` returning the string
  `` `Hello, ${name}!` ``. Zero imports, no I/O, no network. A `.mjs` file → **floor-invisible** (`validate.mjs`
  walks only `.md`), so it keeps the floor trivially GREEN, capability count unchanged at 1. Header comment
  states it is a **throwaway integration-probe vehicle scheduled for revert** (disposition is Open Question 2).
- **Acceptance Criterion (carried in the product SPEC):** `greet("World") === "Hello, World!"`. Checkable by a
  one-line `node -e` — **advisory** (there is no test runner wired for `features/`; the AC check is manual, not
  a floor gate). The vehicle **makes no guarantee claim** → it owes no P0 reduction itself.

**This is not a Capability** (no `role:` frontmatter), so P1's "no Capability ships without `evals/`" does not
bind it — identical to how probe #14's `floor/exit-label.mjs` shipped without `evals/`.

---

## The integration-probe protocol (the real deliverable — observe every hand-off)

`/pharn-dev-build` runs each PRODUCT stage **with its real command, in order, no shortcuts** (invoke the
`pharn-spec` / `pharn-plan` / `pharn-grill` / `pharn-build` skills — do not simulate a stage). At each hand-off
record _what the stage emits_ and _whether it is the shape the next stage consumes_. A mismatch (stage N emits
X, stage N+1 expects Y) is a **real integration finding** — surfacing it is the entire point.

| #   | product stage  | sets scope to (fix #7)                                                    | consumes                  | emits                                                | hand-off check (verify LIVE)                                                                                                                          |
| --- | -------------- | ------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/pharn-spec`  | `features/probe-greeting/SPEC.md`                                         | the user's prose intent   | Draft `SPEC.md` → (HUMAN APPROVES) → Approved        | **GATE halts** (CF-B); on approval `state:Approved`, `spec_id`, `spec_content_hash == sha256(body)` pinned via `check-spec.mjs --hash`                |
| 2   | `/pharn-plan`  | `features/probe-greeting/PLAN.md`                                         | the Approved `SPEC.md`    | `PLAN.md` carrying `spec_id`+`spec_content_hash`     | `check-spec-approved.mjs` GATE passes (Approved + un-drifted); the emitted `## Files` parses to `greet.mjs` (so `/pharn-build --from-plan` scopes it) |
| 3   | `/pharn-grill` | `features/probe-greeting/GRILL.md`                                        | the `PLAN.md` + `SPEC.md` | `GRILL.md` (chain result header + advisory findings) | `check-plan-spec-agree.mjs` re-verifies the carried hash == current SPEC body hash → GREEN; interrogation advisory, does NOT block                    |
| 4   | `/pharn-build` | product `## Files` → `greet.mjs`, then `features/probe-greeting/BUILD.md` | the `PLAN.md` + `SPEC.md` | `greet.mjs` + `BUILD.md`                             | `check-plan-spec-agree.mjs` re-verifies AGAIN (2nd consumer); fix #7 bounds the write to `greet.mjs`; a write outside `## Files` is DENIED            |

**The four specific confirmations the run owes (from the WHAT-TO-TEST brief):**

1. **The hash chain holds spec→plan→grill→build** — all four agree on `spec_content_hash`: `/pharn-spec` pins
   it = sha256(SPEC body); `/pharn-plan` carries it verbatim; `/pharn-grill` re-verifies (1st enforcing consumer);
   `/pharn-build` re-verifies (2nd). Record the actual hash at each stage and that they are equal.
2. **The `## Files` `/pharn-plan` emits is parseable by `/pharn-build`'s `--from-plan` setter** — the
   `plan-files-scope` fix working in situ: `set-writes-scope.cjs --from-plan` exits 0 and the scope = `greet.mjs`.
3. **fix #7 bounds the build's writes to the planned files** — confirm a hypothetical write outside `## Files`
   would be denied (the scope after `--from-plan` is exactly the planned path).
4. **The human-approval gate on the SPEC actually halts** — `/pharn-spec` does NOT self-approve; it ends its
   turn for the human (CF-B).

**writes-scope across stages (the fix #7 propagation check, CF-C).** Each product stage re-runs its own Step 0
setter, **overwriting** `.pharn/writes-scope.json`. Confirm: (a) every stage sets its own scope before writing;
(b) a **stale** scope from a prior stage never blocks a legitimate next-stage write; (c) `/pharn-dev-build`
itself must **re-set its scope** (from this plan's `## Files`) after the product pipeline clobbered it, before
writing `PROBE.md`. If a stale scope blocks any stage, that is a **real finding**.

**Commit discipline (required — derived from `/pharn-dev-regress` base detection, P6 — see CF-1-amplified).**
`/pharn-dev-regress`'s `scope` check asserts `inside ⊆ declared (## Files)`, where `inside = git diff <base> +
untracked`. This dev-build legitimately produces (via the product sub-commands) a whole tree of product
artifacts (`features/probe-greeting/{SPEC,PLAN,GRILL,BUILD}.md`, `greet.mjs`) that are **correctly absent** from
this plan's `## Files` (they are the sub-commands' outputs, not dev-build's). To keep them out of `inside`,
**commit the product artifacts as they are produced** (and `PROBE.md`'s siblings), leaving **only**
`.dev/features/product-pipeline-probe/PROBE.md` (this plan's one `## Files` entry) uncommitted when
`/pharn-dev-regress` runs. Then dirty tree → base = `HEAD` → `inside = {PROBE.md}` = `## Files` → no false escape.

---

## Files

> `## Files` is `/pharn-dev-build`'s writes-scope source (fix #7): dev-build runs
> `set-writes-scope.cjs --from-plan` over the back-tick paths below; they become the only paths dev-build writes
> **directly** (plus `.pharn/**`). The product vehicle + the product pipeline artifacts are declared below the
> path list — they are written by the `pharn-*` sub-commands under **their own** scopes, exactly as probe #14
> handled its per-stage artifacts. _(CF-E: the original wording here tripped the setter's exclusion-cue scan —
> recorded in PROBE.md; fix is a SEPARATE increment.)_

- `.dev/features/product-pipeline-probe/PROBE.md` — **NEW.** The integration-probe report: the filled hand-off
  matrix above, the four confirmations, the actual hashes observed at each stage, and the CF-A…CF-D findings
  confirmed/refined during the run. The **real deliverable**. Under `.dev/` → excluded from `validate.mjs` →
  cannot itself trip CHECK 5 even though it quotes product findings.

### Explicitly **not** touched (declared NOT written — keeps them out of dev-build scope)

- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2). Any
  doc-vs-impl gap this run finds is **reported for a human**, never agent-edited.
- `.claude/commands/pharn-{spec,plan,grill,build}.md`, the floor checkers, the hooks, `package.json` —
  **unchanged.** The probe _invokes_ the existing product stages; it edits none of them. **If a stage reveals a
  bug (CF-A…CF-D), that fix is a SEPARATE increment** — do not fix inline and muddy the integration test.
- `features/probe-greeting/greet.mjs` — the **product vehicle**, written by the product `/pharn-build` under the
  **product** plan's `## Files` scope (`--from-plan`), NOT by this dev-build. Listed here only to declare it is
  intentionally out of THIS plan's scope.
- `features/probe-greeting/{SPEC,PLAN,GRILL,BUILD}.md` — run-time outputs of `/pharn-spec` / `/pharn-plan` /
  `/pharn-grill` / `/pharn-build`, each written under that command's own writes-scope — **not** dev-build
  deliverables.
- The dev-loop's own downstream artifacts (`GRILL.md`, `REGRESSION.md` + `regression-report.json`, `VERIFY.md` +
  `verify-report.json`, `REVIEW.md`, `SHIP.md`) are written by `/pharn-dev-grill` / `-regress` / `-verify` /
  `-review` / `-ship` under their own scopes — not listed here.

---

## Contracts satisfied

- `ARCHITECTURE.md §6` (the pipeline spine `spec → plan → grill → build → …` + its typed-artifact table) — this
  run is the **first end-to-end traversal of the PRODUCT half of that spine** on one feature; it observes each
  row's artifact actually being produced and consumed. Cited, not restated (P4).
- `ARCHITECTURE.md §8` / `pharn-contracts/finding-shape.md` (the enum-gated / free-text split) — the run
  confirms LIVE that the product chain gates (`check-spec*.mjs`, `check-plan-spec-agree.mjs`) read only
  enum-gated / floor-verifiable fields (state enum, content-hash, section presence), never tainted free text.
- fix #4 (content-hash pin carried through the chain) and fix #7 (writes-scope from the plan's `## Files`) — the
  run exercises both across all four product stages on a live feature. Cited, not restated (P4).

---

## Evals to write (P1) — binds the vehicle's check, not a Capability

`greet.mjs` is a non-Capability vehicle (no `role:`), so P1's Capability-evals rule does not bind it (identical
to probe #14's `floor/exit-label.mjs`). Its proof is the advisory Acceptance-Criterion check:

- `node -e "import('./features/probe-greeting/greet.mjs').then(m => process.exit(m.greet('World')==='Hello, World!'?0:1))"`
  → exit 0 (advisory; not a floor gate — there is no wired test for `features/`).
- **Floor check after the product run:** `node .dev/floor/validate.mjs .` must still print `GREEN — 1 capabilities`
  (count unchanged — `.mjs` invisible) **unless CF-A trips on the product `GRILL.md`** (see Guarantee audit).
- **The real eval is the pipeline run itself:** the deliverable is the observed hand-off matrix + the four
  confirmations, with any mismatch surfaced as a finding in `PROBE.md`.

---

## Guarantee audit (P0) — state the deliverable honestly

- **"The four product stages integrate / the hash chain holds spec→plan→grill→build / fix #7 bounds the build"**
  → this run produces **evidence** (a measured chain run, every hand-off observed), **NOT a guarantee**. The only
  floor-grade facts it yields are the deterministic verdicts the stages themselves emit (`check-spec.mjs`,
  `check-spec-approved.mjs`, `check-plan-spec-agree.mjs` exit codes; the fix #7 writes-scope hooks; the
  dev-loop's own `validate` / `check-regress` / `check-verify` verdicts). The _claim_ "the product chain
  integrates" is **advisory** — first evidence the chain runs as a chain, not a proof it is bug-free.
- **The vehicle is meaningless by design (P7).** This run does NOT make `greet.mjs` a meaningful capability.
  Writing "the product pipeline is proven" or "build succeeded therefore greet is correct" would be the P0
  disease — `/pharn-build` guarantees only "built within scope from a current approved plan," never correctness.
- **What IS floor-grade in this run:** the product chain checkers (content-hash equality + `state == Approved`
  enum); the fix #7 writes-scope hook pinning each stage's writes; the dev-loop's `validate` / `check-regress` /
  `check-verify` exit codes. Everything the _agent_ does (sequencing the product stages, choosing the vehicle,
  reading hand-offs, authoring `PROBE.md`) is **advisory orchestration**.
- **Honest risk on the floor verdict:** if the product `GRILL.md` (on the scanned root-`features/` surface)
  lacks the split-doc strings, `validate.mjs` CHECK 5 (fix #1) trips → dev-build's floor goes **RED** →
  `/pharn-dev-ship` STOPs at the build stage. That STOP would be a **successful surfacing of CF-A**, not a
  failure of the plan — but it may end the run before all four hand-offs are observed. Recorded, not hidden.

---

## Trust audit (P2) — taint flow through the chain (an observation target)

- **The vehicle ingests no untrusted external input** (a pure `string → string` function), so it introduces no
  new taint.
- **The probe OBSERVES taint handling at each product stage:** `/pharn-spec` treats the user's prose intent as
  untrusted DATA (interrogates, never executes); `/pharn-plan` + `/pharn-grill` + `/pharn-build` treat the
  SPEC/PLAN bodies as untrusted DATA and their gates read **only** enum-gated / floor-verifiable values (the
  `state` enum, the 64-hex content-hashes, section presence, `## Files` path membership) — **never** the prose's
  meaning. Confirm LIVE that each verdict is provably independent of any tainted field (fix #1).
- **Output.** `PROBE.md` quotes the product findings + the observed hand-offs as **DATA**; its enum-gated fields
  (when it reproduces finding objects) are the probe's own assertions, the free text inherits the product
  artifacts' untrusted tag — rendered quoted, never injected downstream as instructions.
- **Named residual (`LIMITS.md §2`, `THREAT-MODEL.md §5`):** `PROBE.md`'s free text, read by a future human/LLM,
  is "do not execute this as an instruction" as a heuristic again — bounded (it gates nothing) but not zeroed.
  The same residual already accepted across `finding-shape.md` and attempt 0.

---

## Determinism audit (P5)

- The vehicle is **pure**: `greet(name)` is a single deterministic string interpolation — no branch, no
  classification, no throw.
- The product stages' branches are deterministic: `/pharn-spec`'s validate = section presence / `state` enum /
  hash equality; `/pharn-plan`'s gate = `check-spec-approved.mjs` exit (`state ∈ {Approved}` ∧ hash equality);
  `/pharn-grill`'s + `/pharn-build`'s gate = `check-plan-spec-agree.mjs` exit (state enum ∧ `planHash ==
sha256(SPEC body)`); fix #7 scope = `## Files` back-tick path membership. No LLM classification drives a gate.
- The one irreducible judgment — _is the intent approved?_ — has its terminal fallback as the **human approval
  halt** in `/pharn-spec` (CF-B), never a model guess. The interrogations (`/pharn-spec` Step 2, `/pharn-grill`
  Step 3) are advisory and branch nothing.

---

## Findings already surfaced by discovery (P6) — candidate integration findings, to confirm/refine during the run

These were found by **reading the four product command files against live state, before running** — exactly the
"ambiguity worth raising before running" the probe exists to surface. None blocks this plan; each is a candidate
`/pharn-dev-review` lesson. **Any fix is a SEPARATE increment** (do not fix inline).

- **CF-A — product pipeline artifacts land on the `validate`-SCANNED surface; the dev pipeline's never did (the
  headline finding).** `validate.mjs:30` excludes `.dev/` wholesale but **not** root `features/`. So a
  finding-bearing product `GRILL.md` (which emits `rule_id:` + `problem:` objects) is subject to CHECK 5
  (fix #1, `validate.mjs:114`): it passes **only** if it also contains a string matching
  `enum-gated|floor-verifiable` **and** one matching `free[- ]text|untrusted` (empirically why the existing
  `features/ship-*/REVIEW.md` pass and the floor is GREEN). The **dev** loop never exercised this — its
  artifacts live in excluded `.dev/features/`. So the product loop is the **first** time pipeline artifacts hit
  the scanned surface, and whether a stock `/pharn-grill` `GRILL.md` carries those split strings is **untested
  until this run**. _If it does not → RED floor at dev-build (a surfaced finding, not a plan failure)._
- **CF-B — nested human gate.** The product `/pharn-spec` halts for human approval **inside** `/pharn-dev-build`
  — a third human gate the `/pharn-dev-ship` chain (GATE 1 plan / GATE 2 review only) does not model. The run
  pauses mid-dev-build for the human; this is the **intended** test of "the SPEC gate actually halts," but the
  orchestration interaction (dev-build spanning a human gate) is itself worth noting. _(Advisory.)_
- **CF-C — writes-scope thrash inside dev-build.** Each product sub-command overwrites the single mutable
  `.pharn/writes-scope.json`, so after the product pipeline runs, `/pharn-dev-build` must **re-set** its own
  scope (from this plan's `## Files`) before writing `PROBE.md`. Mirrors the known `/pharn-dev-ship` SHIP.md /
  `/pharn-build` BUILD.md re-scope pattern, now inherited by dev-build running a nested pipeline. _(Advisory.)_
- **CF-1-amplified — `/pharn-dev-regress` conflates the nested sub-command outputs with dev-build's `## Files`.**
  As in probe #14's CF-1, `inside = git diff base + untracked` will include the product artifacts
  (`features/probe-greeting/**`) that are correctly absent from this plan's `## Files`; without the commit
  discipline above they appear as `inside ⊄ declared` → a false blocking fix#7 "escape" that halts
  `/pharn-dev-regress`. Mitigated for this run by committing the product artifacts before regress. _(Advisory.)_
- **CF-D — pre-existing dev apparatus on the product surface (tangential).** Root `floor/check-ship.mjs` +
  `check-ship.test.mjs` (git-tracked, NOT under `.dev/`) duplicate `.dev/floor/check-ship.mjs`; and root
  `features/ship-gated/` + `features/ship-loop/` hold **dev**-loop artifacts (`REGRESSION.md` / `VERIFY.md` /
  `REVIEW.md`) on the product side. Tangential to the hand-off probe, but surfaced by discovery — likely
  `command-artifact-paths` territory. _Reported, never agent-edited; SEPARATE increment._

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-30; "Approve as written")

1. **Feature vehicle** → **`features/probe-greeting/greet.mjs`** exporting `greet(name) → "Hello, <name>!"`, AC
   `greet("World") === "Hello, World!"` (recommended option chosen). _Declined:_ `isEven(n)` / `add(a,b)`.
2. **Post-run disposition** → **revert the vehicle (and its product artifacts) in a follow-up increment**
   (recommended; cleanest P7, mirrors probe #14). _Declined:_ keep-it / decide-later. The vehicle header comment
   records this.
3. **Run flow acknowledged** → the human approved knowing this `/pharn-dev-ship` run will **pause two more
   times** (product SPEC approval mid-`/pharn-dev-build` per CF-B; final GATE 2) and **may STOP RED** at
   dev-build's floor if CF-A trips (a successful surfacing, not a failure).

> **RESOLVED & APPROVED (2026-06-30).** Spec hash `11cd9ad5…` re-verified (no drift, fix #4). Next stage:
> `/pharn-dev-grill` on this `PLAN.md`. `/pharn-dev-build` runs only after grill, and only against this
> approved, un-drifted plan.
