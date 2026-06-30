# PLAN — plan-files-scope (make `/pharn-plan` emit a parseable `## Files` scope `/pharn-build` can read)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches build-stage/grill-stage/plan-stage pins → no drift
- increment: align the **product** `/pharn-plan` template (`.claude/commands/pharn-plan.md`) so its emitted `features/<name>/PLAN.md` carries a **parseable `## Files`** scope section (a `## Files` heading whose list items lead with a back-tick path) that `/pharn-build`'s fix #7 setter (`set-writes-scope.cjs --from-plan`) can read — closing the named `plan-files-scope` follow-up so the product chain `spec → plan → grill → build` can derive a writes-scope and BUILD end-to-end. Adds **NO new floor primitive** — it makes the **existing** fix #7 reachable by product plans + adds one regression test.
- layer(s): `.claude/commands/` (the product command — advisory orchestration; floor-ignored, like `/pharn-build` `/pharn-grill` `/pharn-spec`) + `.claude/hooks/` (the floor apparatus — a test edit only; the parser itself is untouched). No `pharn-*` library file, no new `.dev/floor/` checker. **Floor capability count stays 1** (`trust-fence`). # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P3, P4, P5, P6, P7]

---

## Step 0 — Discovery results (live this run; P6, never from memory)

- **Floor is GREEN — 1 capability** (`trust-fence`), unchanged by this increment: both edited files live in `.claude/` (path-ignored by `validate.mjs`); no product-surface file added ⇒ count stays **1** (re-confirm live in build).
- **The exact parser contract** (`set-writes-scope.cjs` `pathsFromPlanFiles`, `set-writes-scope.cjs:155-177` — read live, the MANDATORY discovery): scope = the leading back-tick path of each list item under a `## Files` heading. Three byte-level facts the emitted shape must honor:
  1. **Heading** must match `/^##\s+Files\b/` (`set-writes-scope.cjs:157`) — exactly `## Files` at column 0. The current `## Steps / Files` does **not** match (it is `## Steps …`, not `## Files …`).
  2. **Path item** — each authorized path is a list item whose **leading token is a back-tick-delimited path**, extracted by `set-writes-scope.cjs:169,173` (a hyphen bullet followed by a back-tick path). The current free-form bullets (`- <a concrete step or file to change>`) have **no back-ticks** ⇒ extract nothing.
  3. **Exclusions** are honored only as a **section-level** form: any markdown heading of any level ends the authorized list (`set-writes-scope.cjs:165`), so an `### Explicitly not touched` subsection's paths are **never scanned**; a **head-less prose cue** on a non-path line (`/\bnot\W*(touch|writ|modif|edit|chang)|…\bout\W*of\W*scope|…/i`, `set-writes-scope.cjs:170`) also ends it. **Residual the template must avoid (`set-writes-scope.cjs:152-154`):** an **inline-marked** path item (``- `path` — not touched``) IS a path-item, so the cue does **not** fire and the path **enters scope**. ⇒ The template MUST steer exclusions to a **subsection heading**, never an inline `— not touched` marker on a path line.
- **The gap is real and named** (`.dev/features/build-stage/PLAN.md:15,100,106` — #22's OQ1 resolution): `/pharn-plan`'s template emits `## Steps / Files` free-form (`pharn-plan.md:136-139`), so `set-writes-scope.cjs --from-plan` over a real product PLAN **fails (exit 1)** → `/pharn-build` fails-closed (`pharn-build.md:94-99`, `:104-107` caveat). #22 deferred the producer fix to a **named follow-up `plan-files-scope`** — THIS increment.
- **`pharn-plan.md` has exactly ONE `## Steps / Files`** (`pharn-plan.md:136`, the Step-4 template) — a single, clean edit point.
- **`pharn-build.md:144`** instructs the builder to "implement what the plan's **Approach** / **Steps** require" — so retaining a `## Steps` advisory section (vs. folding it away) keeps that cross-file reference valid **without** editing `pharn-build.md` (out of this one axis).
- **No root `features/**/SPEC.md` exists yet** (`find features -name SPEC.md`→ none) — so the closing-the-loop test uses a **synthetic`/pharn-plan`-shaped fixture**, exactly as the #22 fail-closed test does (`set-writes-scope.test.cjs:56-66`).
- **Independent of `/pharn-grill`'s hash chain (confirmed).** `check-plan-spec-agree.mjs` reads the PLAN's **frontmatter** `spec_content_hash`; `## Files` is **body**. Restructuring the body's `## Steps / Files` → `## Steps` + `## Files` does not touch the frontmatter the chain hashes. `pathsFromPlanFiles` `findIndex` over `## Files` never matches a frontmatter line, so frontmatter does not interfere with parsing either.

## The two layers (stated explicitly — P0)

- **FLOOR — what becomes deterministically true, all REUSED (no new primitive):**
  1. **A correctly-shaped product PLAN.md parses** — `set-writes-scope.cjs --from-plan` over a PLAN in the new emitted shape exits **0** with `scope` = exactly the `## Files` back-tick paths. This is **enum-regex** (the deterministic parser); the new regression test pins it (the **inverse** of #22's fail-closed test).
  2. **Exclusion-subsection paths never enter scope** — the #15-hardened extractor (`set-writes-scope.cjs:165`) holds for product plans too. **enum-regex**; pinned by the same test.
  3. **fix #7 then HOLDS the build to exactly those paths** — `set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs` (a **hook**), **reused as-is**, now reachable by the product chain. A build write outside `## Files` is denied at the floor.
- **ADVISORY — never a guarantee.** Whether a given `/pharn-plan` run **emits** the parseable shape, and whether the `## Files` list is the **right set** of files, is **model judgment** (the model follows the template). Backstop: if a run emits an unparseable `## Files`, `/pharn-build` **fails-closed** (#22) — no unplanned write slips through either way. Whether the declared scope is correct is the **human's / `/pharn-grill`'s** concern.
- **Two clocks (be honest):** the parser's **verdict** (exit code) is FLOOR; `/pharn-plan`'s **act** of following the template is ADVISORY model work. This increment makes the existing fix #7 **reachable**, not newly guaranteed.

> **The honest claim (P0).** After this, a product PLAN.md in the documented shape is **parseable by `set-writes-scope.cjs --from-plan` (deterministic)** → the product chain `spec → plan → grill → build` can derive a writes-scope and BUILD (no longer fail-closed on the scope gap). It does **NOT** change that the plan's CONTENT — including _which_ files `## Files` lists — is **advisory**; fix #7 enforces the build stays **within** the list, never that the list is the "right" set. **"`/pharn-plan` emitted `## Files`" must never read as "therefore the scope is correct."**

## Files

> THIS dev increment's own fix #7 scope (via `/pharn-dev-build`'s `set-writes-scope.cjs --from-plan` over this section). Both are concrete literals in floor-ignored `.claude/` dirs.

- `.claude/commands/pharn-plan.md` — **EDIT (one axis).** In the Step-4 PLAN.md template (`pharn-plan.md:136-139`), **split** `## Steps / Files` into (a) an advisory `## Steps` prose section and (b) a clean, parseable `## Files` section whose items lead with a **back-tick path** (``- `path` — what changes``), with an optional `### Explicitly not touched` exclusion subsection. Add a short guidance note that `## Files` is what `/pharn-build` parses as the writes-scope — **cite** `set-writes-scope.cjs --from-plan`'s contract + `ARCHITECTURE.md §6`, do not restate (P4) — and that exclusions go in a **subsection heading**, never an inline `— not touched` marker (the `set-writes-scope.cjs:152-154` residual). — layer `.claude/commands/` (floor-ignored).
- `.claude/hooks/set-writes-scope.test.cjs` — **EDIT (add one test).** The closing-the-loop / P1 test: feed a **synthetic `/pharn-plan`-shaped** PLAN.md (frontmatter + `## Approach` + `## Steps` + `## Files` with back-tick paths + an `### Explicitly not touched` subsection) to `set-writes-scope.cjs --from-plan`; assert `status === 0`, `scope` deep-equals exactly the authorized `## Files` paths, and the exclusion-subsection path is **ABSENT**. The **inverse** of the existing fail-closed test (`set-writes-scope.test.cjs:56-66`); same black-box style (spawn, cwd = temp dir, assert EXIT CODE + scope contents; no `head`, correct arg order). — layer `.claude/hooks/` (declared here so fix #7 authorizes the write).

### Explicitly **not** written (declared NOT touched)

- `.claude/hooks/set-writes-scope.cjs` — the **PARSER**; reused as-is, **never edited** (the producer matches the contract, not the reverse — same discipline as #2 review-scope; modifying the shared setter would risk every stage).
- `.claude/commands/pharn-build.md` — reads `--from-plan` correctly already (#22); **NOT touched** (one axis). Its scope-source caveat (`pharn-build.md:104-107`) goes stale after this lands — a **separate follow-up doc-sync**, surfaced in Risks, not done here (P3/P7).
- `.dev/features/build-stage/*` and other `.dev/features/**` audit trails — read for diagnosis, never edited.
- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied, fix #2).

## Contracts satisfied (cite, don't restate — P4)

- **`set-writes-scope.cjs --from-plan` (`pathsFromPlanFiles`, `set-writes-scope.cjs:155-177`)** — the fix #7 scope-source contract: `## Files` heading + leading back-tick path per item + section-level exclusion. The product `/pharn-plan` template is **tightened to PRODUCE** exactly this shape; the parser is **reused unchanged**.
- **`ARCHITECTURE.md §6`** — the pipeline spine `spec → plan → grill → build → …`; the plan artifact's body must carry the scope the build stage consumes. This increment closes the producer↔consumer seam between the **plan** and **build** rows so the chain is buildable end-to-end. (Cited, not restated.)
- **`.dev/features/build-stage/PLAN.md` (#22, OQ1)** — the named `plan-files-scope` follow-up this increment discharges.

## Evals to write (P1)

- **The closing-the-loop test** (`set-writes-scope.test.cjs`): a `/pharn-plan`-shaped PLAN.md → `set-writes-scope.cjs --from-plan` → **exit 0**, `scope` = exactly the `## Files` back-tick paths, exclusion-subsection path **absent**. Proves the chain `spec → plan → build` can now set scope (inverse of `set-writes-scope.test.cjs:56-66`).
- **Robustness assertion (same test):** a back-tick path appearing in `## Steps`/`## Approach` prose **before** `## Files` is **absent** from scope (the parser starts at `## Files`) — guards against prose paths leaking into scope.
- `/pharn-plan` is a **command, not a Capability** (no `role:`, floor-ignored dir) — exactly like `/pharn-build` `/pharn-grill` `/pharn-spec`; **P1's Capability-evals rule does not bind it**, and it adds no new checker ⇒ no new `evals/` dir. The proof is the regression test over the reused parser + (later) a live product-chain dogfood.
- **Floor check after build:** `node .dev/floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged — both edits are in path-ignored `.claude/`).

## Guarantee audit (P0)

- A correctly-shaped product PLAN.md is **parseable** by `set-writes-scope.cjs --from-plan` (exit 0, scope = declared paths) → **floor: enum-regex** (the deterministic parser; the new test pins it — inverse of #22's fail-closed test).
- Exclusion-subsection paths **never** enter scope → **floor: enum-regex** (the #15-hardened extractor; same test pins it for product plans too).
- fix #7 HOLDS the build to exactly the `## Files` paths → **floor: hook** (`set-writes-scope.cjs --from-plan` + `enforce-writes-scope.cjs`) — **REUSED, no new primitive**; this increment makes it **reachable** by the product chain.
- `/pharn-plan` **emits** the parseable shape on a given run → **advisory** (model follows the template). Backstop: an unparseable emission → `/pharn-build` **fails-closed** (#22) — no unplanned write either way.
- The `## Files` list is the **right set** of files → **advisory** (model judgment; the human / `/pharn-grill` review the declared scope). fix #7 enforces _within_ the list, never that the list is correct.
- This increment adds a **new floor primitive** → **NO** — pure reuse of the parser + hook; one regression test + one template edit.

## Trust audit (P2) — taint propagation

- **Input (at product runtime).** `/pharn-plan` reads `features/<name>/SPEC.md` body = untrusted DATA. The `## Files` paths the model derives become fix #7 scope, parsed by `set-writes-scope.cjs` as **path membership only** (deterministic, never a free-text field). A hostile SPEC could steer the model's (advisory) choice of _which_ paths to list — **bounded**: at build time `enforce-writes-scope.cjs` only ever **allows** the listed paths (it cannot write _outside_ them); a malicious extra path merely authorizes that one path, which the human / `/pharn-grill` review. No guaranteed decision rests on the SPEC's free-text meaning (mirrors `/pharn-build`'s trust audit).
- **This increment's own inputs** (`pharn-plan.md`, `set-writes-scope.test.cjs`) are trusted repo files; the edit ingests no untrusted artifact.
- **Residual (named — `LIMITS.md §2`, `THREAT-MODEL.md §5`).** A hostile SPEC could bias the advisory `## Files` list — bounded by fix #7 (the build cannot escape the listed paths) but not zeroed (the same residual already accepted across `/pharn-build` / `finding-shape.md` / attempt 0).

## Determinism audit (P5)

- The parse is a deterministic regex/membership scan (`set-writes-scope.cjs`), no LLM. No branch in this increment rests on LLM classification.
- The template-following (which paths to list) is **advisory** model work, never a guaranteed branch; the build-time enforcement is deterministic path-membership.
- Terminal fallback: an unparseable emitted `## Files` → `/pharn-build` **refuses** (fail-closed, #22), never a guess.

## Risks & follow-ups (surface for the human / next stage)

- **Stale caveat in `pharn-build.md:104-107`** (and the prose at `:96`) says "/pharn-plan **currently** emits a free-text `## Steps / Files` … until the `plan-files-scope` follow-up." Once THIS lands, that is done — but `pharn-build.md` is **out of this one axis** (and I must not modify it). **Follow-up:** a separate doc-sync increment updates that caveat. Not a floor issue (the caveat is advisory; the fail-closed behavior is unchanged).
- **`/pharn-plan.md`'s Trust/Guarantee/Determinism audit prose** may reference "Steps / Files" indirectly; the build will update any such reference for internal consistency (within `pharn-plan.md` only).
- **The real end-to-end proof** is a live `/pharn-spec → /pharn-plan → /pharn-grill → /pharn-build` dogfood on a throwaway increment (observing the chain gate + fix #7 on real product PLAN scope) — a natural follow-up (P7), now unblocked by this increment; not part of this authoring increment.

## Open questions (HALT) — RESOLVED (human-approved 2026-06-30; "Approve as written")

- **OQ1 → Option B (SPLIT).** Retain an advisory `## Steps` prose section **+** add a clean parseable `## Files` (leading back-tick paths) with an optional `### Explicitly not touched` exclusion subsection. Human-selected (2026-06-30): (a) matches the intent's "keep steps as advisory prose if useful"; (b) keeps `pharn-build.md:144`'s "Approach / **Steps**" reference valid **without** touching that file (out of this one axis); (c) is a clean literal split of the conflated section into its two real parts. _Declined: Option A (fold the steps into `## Approach`, no `## Steps` section)._

> **Build-ready — no open questions remain.** Spec hash `11cd9ad5…` re-verified live this run (no drift, fix #4). Next in the `/pharn-dev-ship` chain: `/pharn-dev-grill` (re-interrogate this plan), then `/pharn-dev-build` (writes `.claude/commands/pharn-plan.md` + `.claude/hooks/set-writes-scope.test.cjs`, re-checks the spec hash, runs the floor).
