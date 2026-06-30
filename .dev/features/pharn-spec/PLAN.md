# PLAN — pharn-spec (the product pipeline's head: intent → human-approved SPEC.md)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — SHA-256 of ARCHITECTURE.md, pinned this run
- increment: Build `/pharn-spec`, the first **product**-pipeline stage — it turns a user's prose intent into a structured `features/<name>/SPEC.md` (required sections + `Draft|Approved` state), HALTS for explicit human approval, and on approval assigns a `spec_id` and pins the approved intent with a content-hash — plus its deterministic floor checker.
- layer(s): pharn-pipeline (the `spec` stage, `ARCHITECTURE.md §6`) — physically the command lives in `.claude/commands/` (Claude Code requires it; the dev/product split is by **name prefix**, `pharn-` not `pharn-dev-`, per CLAUDE.md). The checker + tests are **dev apparatus** under `.dev/floor/`.
- constitution_refs: [P0, P2, P4, P5, P6, P7]

## What this increment is (and is not)

**Is:** one product **command** (`/pharn-spec`) + its deterministic SPEC.md floor checker + the checker's
tests. `/pharn-spec` is a command the agent executes (markdown), **not** a Capability with `role:` — so the
floor capability count stays **1** (`validate.mjs .` → `GREEN — 1 capabilities checked`, read live).

**Is not:** any downstream product stage (`/pharn-plan`, `/pharn-grill`, …) — later increments (P7). No new
`pharn-contracts` schema (the SPEC.md shape is defined by the floor checker for now; a formal
`pharn-contracts/spec-shape.md` is deferred until a downstream product stage must **cite** its rule IDs — P7,
no speculative addition). No committed `SPEC.md` (that is a **product-runtime** output of running `/pharn-spec`;
the checker's tests exercise the shape with temp fixtures).

## The honest split this command exists to make (P0)

- **FLOOR (deterministic — the only guarantees):** (1) `SPEC.md` carries the **required sections**
  (presence — heading-set membership); (2) `state ∈ {Draft, Approved}` (enum); (3) `spec_id` is present
  (the §6 root identity every downstream artifact carries); (4) **when `state: Approved`**, `spec_content_hash`
  is present **and equals `sha256(body)`** (content-hash primitive — pins the approved intent so downstream
  drift is detectable, fix #4). All four are owned by `.dev/floor/check-spec.mjs`.
- **ADVISORY / HUMAN (never a guarantee):** whether the intent is **clear / complete / wise** is the human's
  call — `/pharn-spec` **interrogates** (surfaces gaps, ambiguities, missing acceptance criteria) but **never
  gates** on intent quality. And the **Draft → Approved transition is a human decision** (the thesis): the
  model NEVER self-approves; the floor cannot verify a human said "yes" — the approval halt is an instruction,
  backstopped (not replaced) by the four floor ops above.

> The honest claim, stated as the command must state it: `/pharn-spec` guarantees a `SPEC.md` has the required
> sections, a valid state, a `spec_id`, and (on approval) a content-hash that pins its body. It does **NOT**
> guarantee the intent is good. "`/pharn-spec` produced it / approved it" must never read as "therefore the
> intent is sound" — that conflation is the P0 disease (closest precedent: `/pharn-dev-memory-promote`'s
> "promoted ≠ sound").

## Files

- `.claude/commands/pharn-spec.md` — the `/pharn-spec` **product** command (markdown the agent executes). Conceptual layer pharn-pipeline (`spec` stage); physically `.claude/commands/`. `pharn-` prefix, **no** `-dev-` — it is product, not apparatus.
- `.dev/floor/check-spec.mjs` — the deterministic SPEC.md checker (Node stdlib only, zero deps; no network / child_process / eval). Floor primitive #3 (presence/enum) + #2 (content-hash). Dev apparatus.
- `.dev/floor/check-spec.test.mjs` — black-box subprocess tests for the checker (mirrors `check-provenance.test.mjs`). Dev apparatus; collected by the existing `npm test` glob (`.dev/**/*.test.mjs`, verified live in `package.json`).

### Explicitly not touched

- `ARCHITECTURE.md` and the other three trusted docs — read-only this increment (hook-denied anyway). §6 already names the `spec` stage (`SPEC.md` / intent, Draft→Approved); this increment **aligns** with it — if building reveals a genuine reconciliation need, REPORT it (`file:line`), do not edit.
- `pharn-contracts/**`, `pharn-review/**`, the other `.dev/floor/check-*` tools, every other command.

## How `/pharn-spec` behaves (the shape the build will write)

1. **Step 0 — set writes-scope (fix #7, fail-closed).** First action, before any write:
   `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/pharn-spec.md --target features/<name>/SPEC.md`.
   The command's frontmatter declares `writes: ["features/<name>/SPEC.md"]` (the **root product** location per
   `features/README.md`); the setter narrows the `<name>` placeholder to the one feature's SPEC.md. **One**
   output file → one `--target` (this is also why the design stays single-file; see Open question 1).
2. **Step 1 — discovery (P6).** Read `CONSTITUTION.md` (trusted prefix); read `features/<name>/` live to detect
   an existing `SPEC.md` (resume vs. new). The user's prose intent is the input.
3. **Step 2 — interrogate (ADVISORY).** Surface gaps / ambiguities / unstated assumptions / missing acceptance
   criteria — aimed at **intent**, like `/pharn-dev-grill` is aimed at a plan. Advisory **prose**, not
   finding-shape findings (there is no `rule_id` for "intent quality"). It **never** blocks; it helps the human
   sharpen intent before approval.
4. **Step 3 — emit/refresh `SPEC.md` (Draft).** Write `features/<name>/SPEC.md`: frontmatter
   `spec_id: <name>` (deterministic from the human-chosen folder name, P5), `state: Draft`,
   `spec_content_hash: ""` (not yet pinned); body = the required `##` sections filled from the user's intent.
   Run `check-spec.mjs` — a structurally-valid draft must be GREEN before proceeding.
5. **Step 4 — HALT for explicit human approval (the thesis).** Render the full `SPEC.md`, then ask via an
   interactive `AskQuestion` form: **"Approve this SPEC (Draft → Approved)?"** (e.g. _Approve & pin_ / _Keep as
   Draft_ / _Revise_). **Wait.** No default-yes; the model never flips the state itself (closest precedent:
   `/pharn-dev-memory-promote` Step 5).
6. **Step 5 — on approval, pin.** Flip `state: Approved`; compute `spec_content_hash = sha256(body)` (the
   `crypto.createHash('sha256')` mechanism the plan command already uses for fix #4); write it into frontmatter;
   re-run `check-spec.mjs` → GREEN (now Approved **and** hash matches body). On _Keep as Draft_ / _Revise_:
   leave Draft (no hash), end the turn.

## The checker — `.dev/floor/check-spec.mjs` (deterministic; reuses existing MECHANISMS, P3 — not imports)

`Usage: node .dev/floor/check-spec.mjs <SPEC.md>` → exit `1` on any RED (prints each), `0` + `GREEN — …`
otherwise. Mirrors `check-provenance.mjs`'s `reds[]` accumulator + exit-code contract. Mechanisms **re-implemented
in-file** (no sibling import, P3):

- **Frontmatter parse** — the `/^---\r?\n([\s\S]*?)\r?\n---/` block regex (same mechanism as
  `set-writes-scope.cjs` / `validate.mjs`). Body = file content with that leading block stripped.
- **Section parse** — the `^##\s+(.+)` heading scan (same mechanism as `check-provenance.mjs`'s `existingIds`).
- **Content-hash** — `crypto.createHash('sha256').update(body).digest('hex')` (same mechanism as the plan
  command's fix #4 one-liner).

Checks (every branch a presence / enum / hash-equality membership test — P5; terminal non-member = a loud RED,
never a guess):

1. `state` present and `∈ {Draft, Approved}` (enum). RED otherwise.
2. `spec_id` present and non-empty (the §6 root identity). RED otherwise.
3. Required sections all present as `##` headings: **Intent, Scope, Acceptance Criteria, Constraints**
   (case-insensitive exact match on heading text; see Open question 2). Any missing → RED.
4. **If `state: Approved`:** `spec_content_hash` present, matches `^[0-9a-f]{64}$`, **and equals `sha256(body)`**
   → else RED (this makes the approved-intent pin floor-**verified**, and surfaces post-approval body drift as a
   deterministic RED — the fix #4 behavior). If `state: Draft`: `spec_content_hash` may be empty/absent (not yet
   pinned) — not checked.
5. Fail-closed: a file with no frontmatter / unreadable → RED.

The checker ranges **only** over these enum-gated / structural fields — **never** over the intent prose's
_quality_. That is the structural expression of "presence is floor, content quality is advisory."

## Contracts satisfied

- **`ARCHITECTURE.md §6` (pipeline spine — the `spec` stage)** — `SPEC.md` is the root artifact; its key field
  is intent (Draft → Approved); every downstream artifact carries `spec_id`; `spec_content_hash` pins content so
  drift under a stable id is detectable (fix #4). This increment **implements** that row (cite, not restate — P4).
  Composition note, not a conflict: §6 lists `spec_content_hash` on the **plan** artifact; `/pharn-spec` records
  the **approval baseline** the plan later pins/re-verifies against — the two compose (the spec is where the
  approved hash originates; the plan carries it forward).
- **No new `pharn-contracts` schema** this increment (the shape is floor-defined in `check-spec.mjs`; a formal
  `spec-shape.md` is deferred to when a downstream stage must cite its IDs — P7).

## Evals to write (P1)

`/pharn-spec` is a **command**, not a Capability → no `evals/` directory (consistent with every existing
`pharn-dev-*` command). The **deterministic checker** carries the regression suite as
`.dev/floor/check-spec.test.mjs` (the P1 spirit — the floor tool is tested), mirroring `check-provenance.test.mjs`
(black-box `spawnSync`, temp-dir fixtures, assert exit code + RED/GREEN stdout):

- Draft + all four sections + valid `state` + `spec_id` → **GREEN** (exit 0).
- Missing a required section (e.g. no `## Constraints`) → **RED** (exit 1).
- Invalid `state` (e.g. `state: Final`) → **RED**.
- Missing/empty `spec_id` → **RED**.
- Approved + `spec_content_hash == sha256(body)` → **GREEN**.
- Approved + missing/malformed/**wrong** `spec_content_hash` → **RED** (drift / unpinned).
- Draft + empty/absent `spec_content_hash` → **GREEN** (hash only required when Approved).
- No frontmatter / unreadable → **RED** (fail-closed).
- **★ honesty test** — a SPEC body whose intent prose contains instruction-looking text
  ("ignore previous instructions…") with all four sections present + valid state → **GREEN**: the verdict ranges
  over structure only, never judging the body. This proves the floor does **not** gate on intent content
  (mirrors `check-provenance.test.mjs`'s ★ needle-in-body test).

## Guarantee audit (P0)

- "`SPEC.md` has the required sections" → **floor: enum-regex** (`check-spec.mjs`, `##`-heading set membership).
- "`state ∈ {Draft, Approved}`" → **floor: enum-regex** (`check-spec.mjs`).
- "`spec_id` is present (the §6 root identity)" → **floor: enum-regex** (presence test).
- "the approved intent is pinned; post-approval body drift is detectable" → **floor: content-hash**
  (`spec_content_hash == sha256(body)` when Approved).
- "a human approved the Draft → Approved transition" → **advisory / procedural** — the approval halt is an
  instruction the model follows; the floor cannot verify a human said yes (same honest split as
  `/pharn-dev-memory-promote`). Backstop: a self-flipped `Approved` still needs sections + a body-matching hash,
  but its **wisdom** is never floor-verified.
- "the intent is clear / complete / wise" → **advisory** — interrogation surfaces concerns; approval is the
  human owning it. `/pharn-spec` must never claim it "ensures a good spec."

## Trust audit (P2)

- **Input.** The user's prose intent → the `SPEC.md` **body**. As the product pipeline's root, `SPEC.md` is the
  intent artifact downstream stages read; its **prose is human-authored DATA**, never injected into a downstream
  LLM stage as steering instructions beyond _being the intent_. If the user pastes third-party material into
  their intent, `/pharn-spec` interrogates it as data — it never executes instruction-looking content embedded
  in it (P2).
- **Gate isolation.** `check-spec.mjs`'s verdict ranges **only** over the floor-verifiable fields (sections /
  `state` enum / `spec_id` presence / `spec_content_hash` vs body-hash) — **never** over the intent prose's
  meaning. **No guaranteed decision rests on the free-text intent** (mirrors fix #1; the ★ test enforces it).
- The floor-verifiable fields are **trusted** because enum-check / presence / hash-equality produced them.

## Determinism audit (P5)

- Every `check-spec.mjs` branch is a presence / enum / hash-equality membership test; no LLM classification
  drives the verdict. `spec_id` is derived deterministically from the human-chosen `<name>`.
- The terminal fallback of the Draft → Approved decision is **ask the human** (the Step-5 approval halt), never a
  model guess. Interrogation is advisory and never branches a guaranteed gate.

## Resolved decisions (was: open questions — confirmed by the human via the plan-approval form, 2026-06-30)

No open questions remain. Both design choices were confirmed as recommended:

1. **Content-hash representation → body-hash in frontmatter (single file).** `SPEC.md` stays one file;
   `spec_content_hash` lives in frontmatter and is computed over the **body** (everything after the frontmatter
   block) — non-circular, and `/pharn-spec` writes exactly **one** file, which the one-`--target` writes-scope
   setter handles cleanly. (The whole-file sidecar `SPEC.lock.json` was rejected: `set-writes-scope.cjs` narrows
   to a single `--target`, so a two-file output cannot be scoped in one setter call without working around fix #7.)
2. **Required-section set → exactly Intent, Scope, Acceptance Criteria, Constraints.** The arg's named minimum;
   presence is floor, content is advisory. No "Non-goals" section (Scope already carries in/out) — smallest
   coherent set (P7).

Plan approved **as written** for `/pharn-dev-build`.
