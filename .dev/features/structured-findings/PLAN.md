# PLAN — structured findings output (findings.json emission contract)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read live this run)
- increment: Amend `pharn-contracts/finding-shape.md` so that a Capability which emits findings MUST emit them as a machine-readable `findings.json` — a JSON array of finding-shape objects — alongside any human-facing output (e.g. `REVIEW.md`). Contract/schema change only; ZERO behavior, ZERO new executable code.
- layer(s): pharn-contracts (L-1, the tree root — schemas only, zero behavior) # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P3, P4, P5, P6, P7]

## Why this increment (P7 — real trigger, not speculation)

The triggering failure is real and already in the repo, not hypothetical:

- The deterministic structural checker **exists** (`floor/check-structural.mjs`, built in the
  `structural-checker` increment). Its contract (line 23-24) reads an `actual.json` =
  `[ finding-shape object, … ]` — "the skill's emitted findings."
- **No Capability emits one.** The only Capability today is `trust-fence`
  (`pharn-review/trust-fence/trust-fence.md`), and its frontmatter declares
  `writes: ["features/trust-fence/REVIEW.md"]` — **prose only**. It states it emits findings "in the
  `finding-shape` object" but serializes nothing machine-readable.
- So the checker has an input shape it can never be handed by a real capability run. The
  `eval-format` worked instance confirms the same gap: the trust-fence eval's assertions "currently
  live as **prose** in `expected-injection-comment.md`."

This increment closes that gap **at the contract level**: it makes "emit a machine-readable findings
array" a requirement of the finding artifact itself. It is the **bottom** of a three-step chain and
is explicitly the precondition for the next two — which are **out of scope here** (one axis, P3/P7):

- **3b** (separate increment) — `trust-fence` actually emits `findings.json` (adds it to `writes:`).
- **3c** (separate increment) — `/pharn-eval` runner invokes `check-structural.mjs` over emitted
  output.

Smallest coherent bottom-layer step; no executable code, no new floor primitive, no LLM.

## Discovery result (P6 — verified by live reads this run)

- **Spec hash:** `node -e` sha256 of `ARCHITECTURE.md` = `11cd9ad5…d969` — **identical** to the pin in
  `features/eval-format/PLAN.md:3`. The spec has **not drifted**. `/build` re-checks this (fix #4).
- **`pharn-contracts/`** holds exactly **two** files: `finding-shape.md` and `eval-format.md` — both
  schema-only, **no `role:`**. There is **no** `capability-frontmatter.md` file; the frontmatter
  contract lives **only** in `ARCHITECTURE.md §3.1`.
- **Floor baseline, live:** `node floor/validate.mjs .` → **`GREEN — 1 capabilities checked`** (the
  one capability is `trust-fence`; both contracts are exempt — no `role:`).
- **trust-fence's current writes (live):** `writes: ["features/trust-fence/REVIEW.md"]` only — it
  emits **no** machine-readable findings file. (Confirms the gap; this plan does **not** modify it.)
- **The checker's input shape (live):** `floor/check-structural.mjs` `actual.json` = a JSON array of
  finding-shape objects. The exact concrete shape already exists as a test fixture
  (`floor/test-fixtures/structural/green.actual.json`) — six-field objects, enum-gated + free-text.
  This increment makes that shape a **contract obligation on capabilities**, not just a test input.
- **Write-protection, tested live (decisive for the WHERE decision):**
  - `echo '{"tool_name":"Edit","tool_input":{"file_path":"pharn-contracts/finding-shape.md"}}' |
node .claude/hooks/protect-trusted-paths.cjs` → **exit 0 (allowed)**. `finding-shape.md` is
    editable by the agent (its `trust: trusted` is a _tag_, not the hook's protected-path list).
  - The hook's protected list is `CONSTITUTION/ARCHITECTURE/THREAT-MODEL/LIMITS.md + CODEOWNERS`
    (`protect-trusted-paths.cjs:17`). So `ARCHITECTURE.md §3.1` is **write-protected — exit 2** — the
    agent **cannot** edit the frontmatter contract. This rules out option A2 as executable by `/build`.
- **CHECK 5, live (`floor/validate.mjs:114-127`):** `finding-shape.md` already contains `rule_id:`,
  `problem:`, `enum-gated`/`floor-verifiable`, and `free-text`/`untrusted`, so it **already** trips
  and **already** satisfies CHECK 5. The amendment is **additive** and preserves those tokens.
- No doc-vs-repo mismatch found.

## Files

Written by `/build` (the planner writes only this `PLAN.md`):

- `pharn-contracts/finding-shape.md` — **amend** (add one section: the `findings.json` emission
  contract). Schema only, **no `role:` added** (stays a contract, not a Capability). Layer
  **pharn-contracts**. This is the **only** product file `/build` writes this increment.

Explicitly **not** touched (out of scope — one axis, P3/P7):

- `pharn-review/trust-fence/trust-fence.md` and `features/trust-fence/REVIEW.md` (that is **3b**).
- Anything under `pharn-review/trust-fence/evals/` — fixtures stay **byte-unchanged** (that is 3b/3c).
- `floor/*` — the checker already exists; **no new executable code, no new floor primitive**.
- `ARCHITECTURE.md` — write-protected and human-only; this plan needs **no** edit to it (see WHERE).

## The WHERE decision — finding-shape.md vs the frontmatter contract (the key halt)

**Recommendation: A1 — the requirement lives in `finding-shape.md`, citing (not restating) the
frontmatter contract's `writes:` field (`ARCHITECTURE.md §3.1`).**

| option                                                         | verdict              | why                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** — `finding-shape.md` (cite §3.1 `writes:`)              | **recommended**      | finding-shape is the SoT for "the finding object every Capability emits"; `findings.json` is just **the serialization of that object** (an array of it). Object + on-disk form = **one axis of change**, one file (P3).   |
| A2 — put the requirement text in `ARCHITECTURE.md §3.1`        | **rejected**         | §3.1 is **write-protected (hook exit 2)** — `/build` literally cannot write it. It is also the _elaboration_ doc, not a `pharn-contracts` SoT; restating the artifact there splits one artifact across two files (P3/P4). |
| A3 — extract a new `pharn-contracts/capability-frontmatter.md` | **rejected (scope)** | Extracting the whole frontmatter contract from §3.1 is a separate, larger increment with its own trigger. Not triggered by this failure (P7); violates the one-axis constraint.                                           |

A1 **does** use the frontmatter contract — by **citation, not duplication**: a capability _declares_
its `findings.json` in the existing `writes:` field (§3.1, already hook-enforced), and
`finding-shape.md` states the _requirement_ that the artifact be emitted. So the frontmatter contract
remains the declaration surface; finding-shape owns the artifact. No edit to §3.1 is needed, which is
also why A1 is the only option `/build` can actually execute.

## Contracts satisfied

- `pharn-contracts/finding-shape.md` — this **is** the amended contract; the new section **cites** the
  existing object definition above it (`{type, rule_id, severity, file}` enum-gated +
  `{problem, evidence}` free-text). It says "`findings.json` is a JSON array of **the object defined
  above**" — it does **not** re-define the fields (P4).
- `ARCHITECTURE.md §3.1` (frontmatter contract) — **cited, not restated** (P4): the capability's
  `writes:` field is named as the declaration surface for the emitted file. No edit to §3.1.
- This stays a `pharn-contracts` schema, a peer of `eval-format.md` (sibling schemas at the tree root,
  depended on from above; not a leaf→leaf edge — P3).

## Proposed amendment (concrete, so `/build` does not guess — P6)

A new section added to `finding-shape.md` (illustrative wording; tokens chosen to keep CHECK 5 green):

```markdown
## Emission — findings.json (the machine-readable array)

A Capability that emits findings MUST serialize them as a single **`findings.json`** — a JSON array of
the finding object defined above (zero or more) — **in addition to** any human-facing output
(e.g. `REVIEW.md`). The capability declares this file in its `writes:` frontmatter
(`ARCHITECTURE.md §3.1`, enforced by the pre-write hook — cited, not restated, P4).

- **Shape:** `[ {type, rule_id, severity, file, problem, evidence}, … ]` — each element is exactly the
  object above; no field is redefined here (P4). An empty finding list is the empty array `[]`.
- **The taint split is REAL at the output (P2).** The enum-gated fields (`type`, `rule_id`,
  `severity`, `file`) are the capability's **own** assertion — TRUSTED, produced by its
  enum-check / path-resolution. The free-text fields (`problem`, `evidence`) **inherit the input's
  trust** — UNTRUSTED when the reviewed artifact is untrusted, carried as quoted DATA. Because the
  split is a real JSON field boundary at the capability's output, it is **structural**, not something
  a downstream model re-interprets from prose.
- **Naming/location:** the file is named `findings.json` and is colocated with the capability's
  human-facing output (the same directory it `writes:`). Example: `trust-fence` writes
  `features/trust-fence/REVIEW.md`, so its findings array is `features/trust-fence/findings.json`.
- **Consumer (cited):** this is exactly the `actual.json` that `floor/check-structural.mjs` reads; the
  emission contract is what gives that checker a real capability output to range over.
```

Worked shape uses **placeholders** (`<one sentence>`, `<quote/snippet>`) exactly as the existing
object block does — it introduces **no new untrusted payload** into the file (see Trust audit).

### Naming/location convention — proposed, not assumed (P6)

- **Filename:** `findings.json` (the checker's `actual.json` is only a CLI arg name; the canonical
  emitted filename is `findings.json`).
- **Location:** alongside the capability's human-facing output, in the same directory it declares in
  `writes:` (for `trust-fence` → `features/trust-fence/findings.json`).
- **Collision (named, deferred — P7):** if two capabilities ever write to the **same** directory,
  `findings.json` would collide; namespacing (e.g. `<name>.findings.json`) is **deferred until a real
  multi-capability collision occurs**, since only `trust-fence` exists today. Not solved
  speculatively.

## Evals to write (P1)

- **None required by P1 this increment.** `finding-shape.md` has **no `role:`** → it is a contract,
  not a Capability, so P1 imposes no `evals/` (exactly as it carries none today, and as
  `eval-format.md` carries none). The floor confirms this: capability count stays **`1`**.
- No new `rule_id` is introduced → CHECK 3 (fix #6) gains nothing new to bind.
- **P1 is _served_, not _implemented_, here:** `findings.json` is the artifact the eval machinery
  (3b/3c) will check. That is the downstream payoff, not a deliverable of this contract-only step.

## Guarantee audit (P0)

- **"The enum-gated / free-text split is REAL at a capability's output"** → this is the substantive
  claim, and it is **honest**: the split becomes a real **JSON field boundary** that the capability
  _emits as data_, rather than a structure a model _interprets from prose_ later. **This is precisely
  why A1 (a machine-readable array) is chosen over A2 (leave the requirement soft / in prose):** A2
  would keep the structure as prose to be re-derived; A1 makes it exist at the source. This claim is
  about _what the contract mandates be produced_, and the production mechanism (3b) and the floor
  check over it (3c via `check-structural.mjs`) are downstream.
- **"Capabilities MUST emit findings.json"** → **advisory at the contract level this increment.** No
  floor operation added here forces emission, and `validate.mjs` does **not** check for
  `findings.json`. Stated plainly to avoid the disease ("written in the contract" ≠ "guaranteed").
  - **Named floor backstops downstream (not added now):** (a) the pre-write `writes:` hook enforces
    the _path_ once a capability declares `findings.json` (3b); (b) `floor/check-structural.mjs`
    (an existing floor primitive — enum / regex-substring / path-resolution) verifies the _array's
    shape and the no-laundering trip-wire_ once a runner invokes it on the emitted file (3c). This
    increment is the **precondition** that lets 3b produce checkable output and 3c measure it.
- **"finding-shape.md still passes the floor"** → floor: **enum-regex**, executed **this** increment.
  `/build` runs `node floor/validate.mjs .`, which must stay **`GREEN — 1 capabilities checked`**, and
  the amended file must pass **CHECK 5** (retain the enum-gated/free-text/untrusted tokens). This is
  the **only** guarantee the floor makes about this increment today.

## Trust audit (P2)

- **Inputs:** the four trusted docs and the invoking `/plan` args are `trusted`. The amendment adds a
  section to a `trusted` contract file.
- **No new untrusted ingest.** The proposed worked shape uses **placeholders** for the free-text
  fields (`<one sentence>`, `<quote/snippet>`), exactly as the existing object block in
  `finding-shape.md` already does. It does **not** re-quote the trust-fence `skip authz` /
  `pre-approved` payload. So this increment introduces **no** new tainted free text.
- The point the section _documents_ is itself the P2 mechanism: in an emitted `findings.json`, the
  enum-gated fields are the capability's trusted assertion and the free-text fields inherit the
  input's trust — taint carried **structurally** at the output, never as a downstream instruction.

## Determinism audit (P5)

- **No new branch is introduced** — this is a schema requirement, not runtime logic. The only
  membership rule is structural ("if a capability emits findings, the emitted artifact MUST be a JSON
  array of finding-shape objects") — set membership, not LLM classification.
- The downstream consumer (`check-structural.mjs`) is already pure membership / regex / path
  resolution (verified live); this increment adds nothing that could end a fallback chain in a guess.

## Build constraint (floor CHECK 5 — must not regress)

The amended `finding-shape.md` will still contain a finding shape (`rule_id:` + `problem:` appear), so
CHECK 5 requires the file to also contain `enum-gated` (or `floor-verifiable`) **and** `free-text`
(or `untrusted`). The file **already** carries all of these, and the new section reuses the same
vocabulary, so CHECK 5 stays GREEN by construction — but `/build` must not strip those tokens. After
writing, `/build` runs `node floor/validate.mjs .` and must see **`GREEN — 1 capabilities checked`**,
plus `npm run check` clean.

## Resolutions (approved 2026-06-25)

Both open questions are resolved by the human via the halt form; no `## Open questions (HALT)` block
remains, so the `/build` gate (Step 1.1) passes.

1. **WHERE — A1 (`finding-shape.md`).** The requirement lives in `finding-shape.md` (the finding
   object's SoT), citing the frontmatter contract's `writes:` field (`ARCHITECTURE.md §3.1`) as the
   declaration surface — cited, not restated (P4). A2 was rejected as not executable (§3.1 is
   write-protected, hook exit 2) and as splitting one artifact across two files; A3 (extract a new
   `capability-frontmatter.md`) was rejected as out of scope (P7). `/build` writes **only**
   `pharn-contracts/finding-shape.md`.
2. **Naming/location — `findings.json` colocated with the human-facing output.** The file is named
   `findings.json` and sits in the same directory the capability `writes:` its human-facing artifact
   (for `trust-fence`, `features/trust-fence/findings.json` alongside `REVIEW.md`). Multi-capability
   namespacing (`<name>.findings.json`) is **deferred until a real collision** occurs (P7).

## Approval

**Approved as written — 2026-06-25** (human, via the explicit accept/deny halt form). Both open
questions are resolved above and no `## Open questions (HALT)` block remains, so the `/build` gate
(Step 1.1) is satisfied. `/build` may now execute this plan against
`features/structured-findings/PLAN.md`.
