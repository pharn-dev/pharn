# PLAN — scope-setter-tighten (writes-scope extractor tightness, fix #7 across the chain)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches features/pipeline-integration-probe/PLAN.md:3 → no drift
- increment: harden `set-writes-scope.cjs`'s `## Files` (Mode B) extractor so the writes-scope it pins contains **only** a plan's authorized paths and **never** an excluded-section path, regardless of exclusion wording — and ship the tests proving it; resolve the overwrite hand-off semantics (DEFECT A) as **per-stage overwrite is correct, no audit stack** (P7).
- layer(s): tooling — `.claude/hooks/` (the floor hooks; `pharn-core` universal-hooks per `ARCHITECTURE.md §4`). NOT a Capability (no `role:`); `floor/validate.mjs` path-ignores `.claude/`, so the capability count is unchanged. # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P5, P6, P7]

---

## Step 0 — Discovery results (live this run, P6 — never asserted from memory)

**The defect framing vs. what the live evidence actually shows (a doc-vs-repo nuance — P6).** The probe
recorded **two** writes-scope hand-off defects (`features/pipeline-integration-probe/REVIEW.md`,
`REGRESSION.md`). Reading the live code corrects where each lives:

- **DEFECT B (loose extraction) — real, but latent in the SETTER.** `set-writes-scope.cjs:159` already
  guards against the probe's own exclusion section with `if (/not\W*touch/i.test(line)) break;`. On the
  probe's `PLAN.md` (whose exclusion heading is `### Explicitly **not** touched`, line 68) the setter
  **does not leak today** — the `not\W*touch` heuristic catches it. The leak the probe **observed live**
  was in **`/regress`'s separate ad-hoc re-parse** of `## Files` (REVIEW.md finding at `regress.md:81`;
  REGRESSION.md obs #1 — "a naive extraction also pulled the 'Explicitly **not** touched' subsection's
  paths in"), **not** the setter. BUT the setter's boundary **is** fragile: it depends on the exact word
  "touch". I **proved this live** (scratchpad prototype, this run): the current setter **LEAKS**
  `floor/validate.mjs` into scope on `### Out of scope`, `### Excluded paths`, and prose "Files NOT
  written" — any exclusion phrasing that isn't "touch". That fragility **is** the dangerous-direction
  defect the increment closes (a too-permissive scope weakens fix #7).
- **DEFECT A (overwrite) — resolved as correct, not a bug (see Guarantee audit).** Each later stage's
  Step 0 overwrites `.pharn/writes-scope.json`. This is **per-stage by design** and needs **no** audit
  stack (P7) — reasoned below.

**State read live this run (P6):**

- **`set-writes-scope.cjs` Mode B** (`pathsFromPlanFiles`, lines 151–164): scans list items under
  `## Files`, breaking on `/^##\s/` (H2 only — **misses `###`**) or `/not\W*touch/i` (a prose heuristic
  matching **one** phrasing). Captures `/^\s*-\s+`([^`]+)`/` (path must be the **first** token of the
  item — this anchor correctly ignores paths merely mentioned in a description).
- **`enforce-writes-scope.cjs` (the GUARD) is correct and untouched.** Its allow/deny rests only on
  path/glob membership (P2); it fails closed to a default-safe-set; `floor/**`, `.claude/**`,
  `memory-bank/**`, root files are denied without an explicit scope. The probe confirmed the guard
  works; only the SETTER feeds it. **This increment does not touch the guard.**
- **`## Files` format varies across the 15 live PLANs** (read all this run): the **majority**
  (`grill-command`, `memory-promote`, `pharn-eval`, `pipeline-integration-probe`, `regress`) mark
  exclusions with a **`### Explicitly **not** touched` heading**; **`command-artifact-paths`** uses a
  **prose** line (no heading); **`structural-checker`** uses a trailing prose "is **not touched**".
  Authorized paths are always the **first** list block under `## Files`, before any exclusion marker.
- **Non-regression PROVEN live (P6).** A scratchpad prototype of the proposed parser produced
  **byte-identical** authorized-path lists to the current parser on **all 15 PLANs** (0 differences),
  while **excluding** the excluded path in all four adversarial cases the current parser leaks on.
- **Tests:** there is **no** `set-writes-scope.test.cjs`; the setter is already driven as a subprocess
  inside `.claude/hooks/enforce-writes-scope.test.cjs` (its header declares it tests **both** scripts;
  **27** `test()` cases live). Its one Mode-B test (line 227) covers only the **prose** "not touched"
  case — the `###`-heading and differently-worded cases are **untested**. The `npm test` glob
  (`package.json`) collects `.claude/**/*.test.cjs`, so extending that file needs no wiring.
- **Spec hash** `11cd9ad5…` matches the live recompute and the most-recent pin (no drift; `/build`
  re-verifies, fix #4).

---

## The fix (concrete, so `/build` does not guess — P6)

**One axis: the `## Files` → authorized-paths extractor (Mode B of the setter).** Mode A
(`--from-frontmatter`, a structured YAML `writes:` array) has no exclusion subsection and is **not
touched**.

Replace the two break conditions in `pathsFromPlanFiles` with a **deterministic, wording-independent**
boundary (P5):

```js
// Boundary 1 — STRUCTURAL: any markdown heading of ANY level ends the authorized list. An exclusion
// subsection (`### Explicitly not touched`, `### Out of scope`, `### Excluded`, …) is its own heading,
// so its paths are NEVER scanned — independent of its wording. Fixes the latent `/^##\s/` gap (`###`).
if (/^\s{0,3}#{1,6}\s/.test(line)) break;

// Boundary 2 — CUE fallback for a head-less prose exclusion intro, anchored to a NON-path line so an
// authorized item's own description (e.g. "… the public API is not touched") never trips it. Broadened
// from the original single `not\W*touch` to the realistic synonyms of "do not write this file":
const isPathItem = /^\s*-\s+`[^`]+`/.test(line);
if (!isPathItem && /\bnot\W*(touch|writ|modif|edit|chang)|\bexplicitly\W*excluded|\bout\W*of\W*scope|\boff\W*limits/i.test(line)) break;
```

(The `\W*` — not `\s+` — tolerates markdown markup, e.g. `**not** touched`, exactly as the proven
original did.) The path-capture regex `/^\s*-\s+`([^`]+)`/` is **unchanged** — only the loop's
termination is hardened, so which in-bounds lines are captured does not change (verified: 0 diffs).

**DEFECT A — overwrite stays as-is.** No code change for the hand-off; the per-stage overwrite is
correct (Guarantee audit). The new tests assert the **specified** behavior (a later setter call
**replaces**, never merges/appends, the scope).

## Files

> `## Files` is `/build`'s writes-scope source (fix #7): `/build` runs `set-writes-scope.cjs --from-plan` over the back-tick paths below; `.claude/**` is **not** in the fail-closed default-safe-set, so each path must be listed here to be writable. Every path is a concrete literal.

- `.claude/hooks/set-writes-scope.cjs` — **EDIT.** Harden `pathsFromPlanFiles` (Mode B) termination as specified above. One axis: the `## Files` extractor's tightness. No change to Mode A, to the path-capture regex, to `resolveEntry`/`isConcrete`, or to the record shape. — layer tooling (`.claude/` hooks)
- `.claude/hooks/enforce-writes-scope.test.cjs` — **EDIT.** Append the exclusion-boundary + overwrite-semantics tests (P1 — the setter ships its proof here, the established convention; same axis as the file's existing setter tests). Spawn the real setter in a fresh temp cwd and assert `r.status` + the parsed scope, mirroring the existing `setter()`-helper tests. — layer tooling (`.claude/` hooks)

### Explicitly not touched (declared NOT written — keeps them out of build scope)

- `.claude/hooks/enforce-writes-scope.cjs` — the GUARD is correct (probe-confirmed); **byte-unchanged**. This increment fixes the SETTER feeding it, never the guard.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md`, `CODEOWNERS` — human-only (hook-denied, fix #2). §7 reconciliation is **not** needed (see "Spec alignment") — nothing to edit, nothing to report.
- `.claude/commands/regress.md` (and any other command) — the `/regress` consumer re-parse (`regress.md:81`) is a **separable follow-up**, NOT this increment unless Open-Q1 chooses otherwise (it is advisory-layer; the `/regress` verdict is floor via exit codes regardless — see Guarantee audit). Touching it for the **unrelated** word-split finding (`regress.md:116`) is explicitly **out of scope** (a different axis).
- `floor/validate.mjs`, `floor/check-*.mjs`, `package.json`, `pharn-*/**` — unchanged; no new floor check, no new capability, no wiring edit (the `npm test` glob already collects the test file).
- `CLAUDE.md` / `CHANGELOG.md` — meta-doc sweep is a **separate axis** (P3); CLAUDE.md's test-count is explicitly "read live, never assert from this doc" so no correctness edit is owed. (Foldable in at approval if desired — Open-Q1.)

## Contracts satisfied (cite, do not restate — P4)

- `ARCHITECTURE.md §7` (fix #7 — the `writes`-scope guard / pre-write enforcement). The setter pins the
  allowlist the guard enforces; tightening the setter's `## Files` parse makes that allowlist contain
  only authorized paths. The guard is unchanged. Cited, not restated.
- `ARCHITECTURE.md §2`, primitive #3 (**enum / regex check**). The boundary is a deterministic regex
  section-scan — the floor primitive this guarantee reduces to.
- `CLAUDE.md` "Writes-scope" — "scope is **parsed deterministically** (P0/P5) — no model picks it." The
  contract is unchanged; this increment makes the parse robust to exclusion wording.

## Evals to write (P1) — the setter is a hook, so it ships its proof as `*.test.cjs` (not an `evals/` dir)

Appended to `.claude/hooks/enforce-writes-scope.test.cjs` (spawn the real setter, assert `r.status` +
parsed scope):

- **`###`-heading exclusion, wording WITHOUT "touch"** (`### Out of scope`) → scope = authorized only;
  the excluded path is **ABSENT** (the case the current parser LEAKS — the deliverable's core proof).
- **`###`-heading exclusion `### Excluded paths`** → excluded path **ABSENT** (wording-independence).
- **real-corpus `### Explicitly **not** touched`** → excluded path **ABSENT** (regression-lock on the
  format 5 live PLANs use).
- **head-less prose exclusion "Files NOT written:"** → excluded path **ABSENT** (broadened-cue proof).
- **flat `## Files`, no exclusion** → **all** authorized paths captured (proves no over-stop / early
  break on a benign description).
- **overwrite semantics (DEFECT A)** → setter call #1 (`--from-plan`) then call #2
  (`--from-frontmatter … --target X`): the final `.pharn/writes-scope.json` scope = `[X]` **only** — it
  **replaced**, did not merge, call #1's paths.
- **Mode A unaffected** — the existing 27 cases (incl. the line-227 prose Mode-B test) stay **green**
  (re-run `npm test`; the prose case still excludes via the broadened cue — verified 0-diff).

## Guarantee audit (P0)

- **"After this, the writes-scope a stage is pinned to (`.pharn/writes-scope.json`) contains ONLY the
  plan's authorized paths — an excluded-section path can never enter it, regardless of exclusion
  wording."** → floor: **enum/regex check** (`ARCHITECTURE.md §2` #3). The setter's parse is a
  deterministic regex section-scan; its output is the allowlist the **floor hook** (`enforce-writes-
  scope.cjs`) enforces on every write. **Proven** by the new tests **and** the live run this session (0
  diffs on 15 PLANs; excluded path absent in all 4 adversarial cases). This **restores fix #7's write-
  gate guarantee for every stage that calls the setter** — i.e. across the chain, because one setter
  serves all stages.
- **"Per-stage overwrite of `.pharn/writes-scope.json` is the correct hand-off; no audit stack is
  needed."** → this is a **decided argument**, not a new guarantee. Reasoning (P7 — do not add a stack
  speculatively):
  1. The guard gates the **currently-executing** stage's writes against the **current** scope. Each
     stage sets its own scope in its Step 0 **before** it writes; there is no moment when stage N's
     writes are checked against stage N+1's scope. A later overwrite is therefore correct — the prior
     stage's scope is already spent.
  2. `.pharn/` is gitignored **ephemeral runtime state**, not an audit log. `set_by` / `set_at` already
     record which command pinned the **active** scope and when — sufficient runtime provenance.
  3. The **audit-grade** record of "what `/build` was authorized to write" is the **committed
     `PLAN.md` `## Files`** (immutable; the plan pins `spec_content_hash`). Any stage needing to audit
     `/build`'s scope (e.g. `/regress`'s escape check) re-derives it from `PLAN.md` via the **same
     canonical (now-hardened) parser** — not from the volatile runtime file. The static plan is the
     source of truth; the runtime file is a derived cache.
  4. ∴ a scope stack would solve a non-problem (no consumer needs a **prior** stage's *runtime* scope;
     they need the durable *declared* one, already in `PLAN.md`). Adding it is exactly the speculative
     addition P7 forbids. The recorded failure (`regress.md:81`) is fixed by re-deriving **correctly**
     (the hardened parser), not by recording history.
- **The per-write enforcement guarantee (a write must be ⊆ the active scope)** is **unchanged** and
  stays floor-backed by `enforce-writes-scope.cjs` — this increment does not weaken or re-implement it.
- **Honest scope of the floor reduction (P0).** The setter is a Bash-run helper, not the `PreToolUse`
  hook; but its **output** is consumed by the hook, which **is** the guarantee, and the setter itself
  is a pure deterministic regex computation. Tightening the setter tightens what the floor enforces. No
  guarantee is claimed for the orchestration that *calls* the setter (advisory) — only for the parse +
  the hook.

## Trust audit (P2) — the setter ingests an untrusted PLAN.md

- A `PLAN.md` is **untrusted** data (it can carry injected prose). The setter extracts **only path
  strings** via regex (the enum/path-membership class) and **never** interprets free-text as
  instructions. The scope decision rests **only** on heading/path/cue **membership** — never on a
  tainted free-text field. An injected instruction in a plan's prose cannot widen scope: it is not a
  `- `path`` item, and path-shaped text not at a list item's start is ignored by the unchanged capture
  anchor. **Taint does not propagate into the write-gate** (the guard reads paths, not prose). The
  broadened cue can only ever **shrink** the captured set (fail-safe), never enlarge it.

## Determinism audit (P5)

- Every branch is a **regex membership test** (heading-of-any-level, exclusion-cue on a non-path line,
  path-item capture). Zero LLM, zero classification. The terminal behavior when **no** authorized path
  is found is **fail-closed** (exit 1, write nothing) — never a guess. The cue's anchoring to non-path
  lines is a deterministic predicate, not a judgment.

## Spec alignment (reported, not edited — per the task's "REPORT it (file:line)")

- `ARCHITECTURE.md §7` describes the **guard** ("the `writes`-scope guard (fix #7)") and per-write
  enforcement; it does **not** specify the setter's `## Files` parse rule **nor** any scope stack/hand-
  off record. The hardened extraction and the per-stage-overwrite semantics are **consistent** with §7
  (the guard is unchanged; nothing in §7 promises a cross-stage scope record). **No trusted-doc edit is
  needed and nothing requires reporting** — recorded here so the absence is explicit (P6).

## Known residuals (named, bounded — P7)

- **Head-less, inline-marked exclusion** — an exclusion expressed **inside** an authorized-style path
  item (`- `floor/validate.mjs` — NOT touched`) is **not** detected (the cue is anchored to non-path
  lines to avoid dropping legitimate items whose description mentions "not touched"). This format is
  **not observed** in any of the 15 PLANs; the convention is a sub-heading or a non-path intro line.
  Bounded and fail-safe-adjacent; left unhandled (P7 — no real triggering case).
- **`/regress`'s consumer re-parse (`regress.md:81`)** remains naive **unless** Open-Q1 folds it in.
  This is **advisory-layer** (the `/regress` verdict is floor via exit codes; a widened `declared` only
  weakens advisory escape-**detection**, never a guaranteed block), so it is cleanly separable and does
  not affect the P0 write-gate guarantee restored above.

## Open questions (HALT) — RESOLVED (human-approved 2026-06-27; "Approve as written")

1. **Scope boundary** → **(a) Setter-only** (recommended option chosen). This increment is the **2
   files** above: harden `set-writes-scope.cjs` (Mode B) + extend `enforce-writes-scope.test.cjs`. It
   restores the named fix-#7 write-gate guarantee; smallest coherent increment (P7); provably non-
   regressive (0 diffs on 15 PLANs, live). _Declined:_ (b) setter + `/regress` consumer (`--print` mode
   + `regress.md` Step 1.3) — the `/regress` consumer fix (`regress.md:81`) is the **immediate,
   separable follow-up** (advisory-layer; does not affect this increment's P0 write-gate guarantee).
2. **DEFECT A (overwrite hand-off)** → **per-stage overwrite is correct; no audit stack** (P7), as
   reasoned in the Guarantee audit. **Confirmed** at approval; not revisited.

> **RESOLVED & APPROVED (2026-06-27).** Spec hash `11cd9ad5…` re-verified (no drift, fix #4). Next
> stage: `/grill features/scope-setter-tighten/PLAN.md`. `/build` runs only after `/grill`, and only
> against this approved, un-drifted plan.
