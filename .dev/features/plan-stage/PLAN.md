# PLAN — plan-stage (build /pharn-plan: the product pipeline's plan stage)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches features/ship-gated/PLAN.md:2 → no drift
- increment: add the **product** command `/pharn-plan` (`.claude/commands/pharn-plan.md`) — it consumes an **Approved** `features/<name>/SPEC.md`, **deterministically refuses** to plan from a Draft or a drifted spec (the Approved-input gate), and emits an advisory `features/<name>/PLAN.md` that **carries the spec's content-hash forward** (`ARCHITECTURE.md §6`).
- layer(s): the command lives in `.claude/commands/` (advisory orchestration; `.dev/floor/validate.mjs` `EXCLUDE_SEGMENTS` path-ignores `.claude/`, so the **floor capability count stays 1** — exactly like `/pharn-spec`, the product command it mirrors). The one new **floor** artifact is `.dev/floor/check-spec-approved.mjs` (the gate) + its test, in the build apparatus (`.dev/`, also excluded from the product scan). It adds **no** `pharn-*` library file. # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P4, P5, P6, P7]

> **Two loops — do not conflate.** This is the **build loop** (`pharn-dev-*`) building a **product**
> capability (`/pharn-plan`, the UX a PHARN user runs). The artifact under construction is a `pharn-`
> command (NO `-dev-`), the second stage of the product spine after `/pharn-spec`. Its **own** runtime
> input is an Approved product `SPEC.md`; that is unrelated to **this** dev-loop plan's
> `spec_content_hash` (which pins `ARCHITECTURE.md`, the spec PHARN-the-methodology is built to).

---

## Step 0 — Discovery results (live this run, P6 — never asserted from memory)

- **`ARCHITECTURE.md §6`** (`ARCHITECTURE.md:197`–`218`) — the pipeline spine `spec → plan → grill → build → regress → verify → ship`. The **plan** artifact's key field is **`spec_id` + `spec_content_hash` (fix #4)** (`ARCHITECTURE.md:205`). The keystone para (`:212`–`218`): `SPEC.md` is the root, every downstream artifact carries `spec_id`, but **`spec_id` binds identity, not content** — so the plan **pins `spec_content_hash`** and post-plan spec edits become "**detectable, not silent**". **§6 puts only the *spec* through `Draft → Approved` (`:204`); the plan is NOT human-approved** — so `/pharn-plan` needs **no** plan-approval gate. (Resolved; **no §6 conflict to report**.)
- **`/pharn-spec`** (`.claude/commands/pharn-spec.md`) — the stage that produces the input. It emits `features/<name>/SPEC.md` with frontmatter `spec_id` / `state ∈ {Draft, Approved}` / `spec_content_hash`, four required `##` sections, and on **explicit human approval** flips `Draft → Approved` and pins `spec_content_hash = sha256(body)` via `check-spec.mjs --hash`. It **does not chain** to `/pharn-plan` (`pharn-spec.md:172`).
- **`.dev/floor/check-spec.mjs`** — the existing deterministic SPEC checker the gate **reuses** (a CLI to shell to; P3-clean — NOT a sibling import). Verified behavior (read live):
  - `check-spec.mjs <SPEC>` → **GREEN/exit 0** for a valid **Draft** (`:149` only checks the pin when `state === "Approved"`), **GREEN/0** for an **Approved + matching** hash, **RED/exit 1** for an **Approved + drifted** hash (`:153`–`155`), and **RED/1** for malformed / missing-section / no-frontmatter.
  - `check-spec.mjs --hash <SPEC>` → prints `sha256(body)` — the **single source of body-extraction**, so a pin and its recompute can never disagree.
  - **The gap the gate must close:** a Draft is **GREEN**. So `check-spec.mjs` GREEN **alone** is not the Approved-gate; it must be paired with a `state === "Approved"` assertion (the Draft is the only GREEN-but-unwanted case; drift + malformed are already RED).
- **`features/`** (`features/README.md`) — the **product-loop** home; each user increment gets `features/<name>/` holding `SPEC.md` + downstream artifacts, "**plan**" explicitly named (`:8`). **Confirmed: `features/<name>/PLAN.md` is the correct product home** for `/pharn-plan`'s output. (Pre-existing `features/ship-gated/` & `features/ship-loop/` are build-loop artifacts that landed under `features/` — a prior-increment placement, **out of scope** here, noted not chased.)
- **Live state:** no `.claude/commands/pharn-plan.md` (clean slate); `.dev/floor/` follows `check-<x>.mjs` + `check-<x>.test.mjs`; `check-spec.test.mjs` is the black-box `spawnSync` subprocess style to mirror (fresh temp dir, assert exit code + RED/GREEN stdout, incl. a ★ needle-in-data test). `/pharn-spec` carries **no** `role:` in frontmatter — the **product-command template** `/pharn-plan` mirrors (a command, not a `role:` Capability → floor count stays 1).

---

## Files

- `.claude/commands/pharn-plan.md` — the **product** `/pharn-plan` command (mirror `/pharn-spec`'s frontmatter shape — no `role:`); discovery-first, halt-and-ask, runs the Approved-input gate, then emits the advisory `PLAN.md` carrying the spec hash forward — layer: `.claude/commands/` (advisory; floor-excluded)
- `.dev/floor/check-spec-approved.mjs` — the **Approved-input gate** (the one new floor artifact): shells to `check-spec.mjs <SPEC>` (reuse its exact shape+state+spec_id+**hash** verification) **and** asserts `state === "Approved"`; exit 0 **iff** Approved + un-drifted + well-shaped, else exit 1 — layer: `.dev/floor/` (build apparatus; floor-excluded)
- `.dev/floor/check-spec-approved.test.mjs` — black-box subprocess tests mirroring `check-spec.test.mjs` (P1) — layer: `.dev/floor/`

> **No PLAN.md checker is built this increment (P7).** The floor deliverable is the **input** gate
> (Approved + un-drifted SPEC). `/pharn-plan` carrying `spec_content_hash` forward is a **deterministic
> copy** of an enum-gated value (the spec's own pinned hash) into the new `PLAN.md` frontmatter — not a
> judgment. A checker that *re-verifies* "plan's hash still equals the spec's" belongs to the **next
> stage's consumer** (`/pharn-grill` / `/pharn-build`), which does not exist yet — building it now would
> be speculative (P7). Deferred, named, not hidden.

## Contracts satisfied

- **`ARCHITECTURE.md §6` — the plan stage** (`:205`, `:212`–`218`) — `/pharn-plan` realizes the `plan` row: input `spec_id`-bearing `SPEC.md`, output `PLAN.md` carrying `spec_id` **+ `spec_content_hash`** forward (fix #4). Cited, not restated (P4).
- **`check-spec.mjs` — reused, not duplicated** — the gate shells to it for the shape+state+`spec_id`+hash verification (the §6 spec-stage floor reduction `/pharn-spec` already relies on); `check-spec-approved.mjs` adds **only** the `state === "Approved"` assertion `check-spec.mjs` deliberately omits (it must also validate Drafts for `/pharn-spec`). No content-hash logic is re-implemented (P4 — cite the mechanism, don't restate it).

## Evals to write (P1)

`/pharn-plan` is a **command**, not a `role:` Capability, so it ships no `evals/` tree — but the new
**floor checker** ships tests (the floor's equivalent of evals), and the gate's three required cases
(per the brief) are covered:

- `check-spec-approved` → **Draft SPEC** → exit **1** (the gate refuses; intent not yet human-approved).
- `check-spec-approved` → **Approved SPEC, `spec_content_hash == sha256(body)`** → exit **0** (gate passes).
- `check-spec-approved` → **Approved SPEC, body drifted (hash mismatch)** → exit **1** (gate refuses; stale intent — re-approve via `/pharn-spec`).
- `check-spec-approved` → **malformed / no-frontmatter / missing section** → exit **1** (fail-closed; propagated from `check-spec.mjs`).
- ★ `check-spec-approved` → **Approved + matching, with an instruction-looking needle in the intent prose** → exit **0** (verdict ranges only over `state` + body-hash + section presence, **never** the intent's meaning — the P2 thesis enforced, mirroring `check-spec.test.mjs`'s ★).

## Guarantee audit (P0)

- **"`/pharn-plan` only plans from an Approved, un-drifted SPEC"** → **FLOOR**: enum (`state === "Approved"`) **+ content-hash** (`spec_content_hash == sha256(body)`), via `check-spec-approved.mjs` (which reuses `check-spec.mjs`). This is the increment's core guarantee — and the first downstream **enforcement** of `/pharn-spec`'s pin, so the pin is **not decorative** (the disease P0 exists to prevent).
- **"fix #7 — `/pharn-plan` writes only `features/<name>/PLAN.md`"** → **FLOOR: hook** (`set-writes-scope.cjs` + `enforce-writes-scope.cjs` pin the one declared path).
- **"The plan carries `spec_content_hash` forward"** → **deterministic copy** of an enum-gated value (the spec's pinned hash) into `PLAN.md` frontmatter — checkable in principle; **not** independently floor-checked **this** increment (no downstream consumer yet, P7). Honest label: deterministic, not yet re-verified.
- **"The plan's CONTENT (the implementation approach) is correct / complete"** → **ADVISORY**. Model judgment; downstream grill / build / verify check it. `/pharn-plan` helps produce a plan; it does **NOT** guarantee the plan is good. Claiming `/pharn-plan` "ensures a correct plan" would be the disease — struck.

> **Honest headline:** `/pharn-plan` **guarantees** it only plans from approved, unchanged intent (the
> deterministic gate) and carries the hash forward; it does **NOT** guarantee the plan is good.

## Trust audit (P2)

- **Input** — `features/<name>/SPEC.md`. Its **body** is untrusted human intent (DATA). The gate
  (`check-spec-approved.mjs`, reusing `check-spec.mjs`) ranges **only** over the **enum-gated /
  floor-verifiable** fields: `state` enum, `spec_content_hash` vs `sha256(body)`, section presence —
  **never** over the intent's meaning. **No guaranteed decision rests on the free-text intent** (mirrors
  fix #1; the ★ test proves it). The `spec_content_hash` carried into `PLAN.md` is a **hash-equality-
  verified** value, trusted because a content-hash check produced it.
- **Output** — the `PLAN.md` **body** (the implementation approach) is **advisory** model work derived
  from the (approved) intent; it is for humans + the next stage, never injected downstream as steering
  instructions, and never gates a guaranteed decision.

## Determinism audit (P5)

- `/pharn-plan`'s proceed/refuse branch reads **only** `check-spec-approved.mjs`'s **exit code** — a
  membership test (`state ∈ {Approved}` ∧ hash-equality), not LLM classification.
- Terminal fallback: a missing / Draft / drifted / ambiguous SPEC → **refuse with a clear message**
  (run / re-run `/pharn-spec`), or **ask the human** if `<name>` is ambiguous — never a guess. The plan
  CONTENT is model judgment (advisory), not a guaranteed branch.

## Open questions (HALT)

1. **How should the Approved-input gate be structured?** — **RESOLVED at GATE 1: Option A** (human
   approved 2026-06-30). A dedicated thin floor checker `.dev/floor/check-spec-approved.mjs`
   **shells to `check-spec.mjs`** (reuse the exact hash+shape verification, no duplication) **and**
   adds the `state === "Approved"` assertion; `/pharn-plan` branches on its **one** exit code; ships
   with tests (Draft→1, Approved+match→0, drift→1, malformed→1, ★needle→0). Floor-grade, single tested
   unit, one membership branch. (Rejected: **B** — inline `state==Approved` one-liner, not an
   independently tested unit, weaker P0 story; **C** — a `--require-approved` flag on `check-spec.mjs`,
   which adds a second consumer's axis to `/pharn-spec`'s tool and edits a shared already-green
   artifact, P3 / one-axis tension.)

   **Plan approved as written** (GATE 1, 2026-06-30) — no open questions remain.
