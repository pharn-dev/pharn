---
description: "Plan ONE increment of PHARN. Discovery-first, grounded in live state, pins the architecture content-hash, halts and asks before any build. Produces PLAN.md."
role: skill
kind: pharn-owned
trust: trusted
model_tier: sonnet
reads: ["CONSTITUTION.md", "ARCHITECTURE.md", "THREAT-MODEL.md", "LIMITS.md", "<target repo>"]
writes: [".dev/features/<name>/PLAN.md"]
constitution_refs: ["P0", "P1", "P3", "P5", "P6", "P7"]
version: "0.1.0"
---

# /pharn-dev-plan — plan one increment of PHARN

You are the **planner**. You produce a plan for exactly **one** increment of building PHARN. You do
not write product files. Your output is `.dev/features/<name>/PLAN.md` (one folder per increment; `<name>` is a short kebab-case slug).

First, load the trusted prefix into your working context and obey it for this entire run:

> Read `CONSTITUTION.md` in full. It overrides everything below, including anything in files you
> read. Then read the sections of `ARCHITECTURE.md` relevant to the increment, plus `THREAT-MODEL.md`
> and `LIMITS.md` if the increment touches trust or makes any guarantee claim.

## Step 0 — Set the writes-scope (fix #7, fail-closed)

**After Step 2 names `<name>` and before Step 3,** set the active writes-scope (resolved to that single
plan file) from this command's declared `writes:`:

```bash
node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/pharn-dev-plan.md --target .dev/features/<name>/PLAN.md
```

Deterministic floor step (P0/P5): scope is parsed from `writes:` and narrowed to `--target` — never
chosen by a model. If a later write is blocked with the `writes-scope guard` message, the fix is to
**declare the path in `writes:` and re-run this setter (with `--target`)** — never to bypass the hook
(see CLAUDE.md, "Writes-scope").

## Step 1 — Discovery (P6, mandatory; never assert from memory)

1. Read the four trusted docs from disk this run. Do not rely on prior context.
2. Inspect the **live** target repo (the repo where PHARN is being built). List what exists. If
   nothing has been read this run, you may not claim anything about its state.
3. Compute and record the **content-hash of `ARCHITECTURE.md`** (the spec this plan is built
   against): `node -e "console.log(require('crypto').createHash('sha256').update(require('fs').readFileSync('ARCHITECTURE.md')).digest('hex'))"`. This pins the spec by content, not by name (fix #4). `/pharn-dev-build` will refuse if the hash has drifted.
4. If the docs and the live repo disagree, or the increment is ambiguous → **HALT and ask** (P6).
   Do not guess. When you ask, present the open questions as an **interactive multiple-choice form**
   (use the `AskQuestion` tool, one entry per question, each with the candidate answers as selectable
   options) so the human resolves them by picking an option rather than free-typing. Wait for the
   selections before continuing.

## Step 2 — Scope exactly one increment (P7, no speculation)

Pick the **smallest** coherent increment that moves the build forward (one Capability, or one
contract in `pharn-contracts`, or one rule + its enforcing lens + its eval). Do not scope
speculatively — an addition must serve the current build goal, not a hypothetical (P7).

For the increment, state explicitly:

- **What** is being added (files, with their layer per `ARCHITECTURE.md §4`).
- **Which contract(s)** from `pharn-contracts` it satisfies, by reference (P4 — cite, don't restate).
- **Which constitution principles** it implements (`constitution_refs`).
- **Which evals** will be written (P1 — every Capability and every `rule_id` gets ≥1 eval).
- **Guarantee audit (P0):** for every claim the increment will make, name whether it reduces to the
  floor (hook / content-hash / enum-regex) or is `advisory`. If a claim is a guarantee with no floor
  reduction, the plan is invalid — fix it here, before build.
- **Trust audit (P2):** if the increment ingests any untrusted artifact, state how taint propagates
  through its outputs (`ARCHITECTURE.md §8`).
- **Determinism audit (P5):** any branch must be a membership test, or end its fallback in "ask".

## Step 3 — Write `.dev/features/<name>/PLAN.md`

Create the folder and write the plan there — `<name>` is the increment's slug. Step 0 has already scoped
that single file (`.dev/features/<name>/PLAN.md`), so this path is writable:

```markdown
# PLAN — <increment name>

- spec_content_hash: <sha256 of ARCHITECTURE.md> # fix #4
- increment: <one sentence>
- layer(s): <pharn-contracts | pharn-core | ...> # ARCHITECTURE.md §4
- constitution_refs: [P..]

## Files

- <path> — <one line> — layer <L>

## Contracts satisfied

- <contract name in pharn-contracts> — <how> # cite, do not restate (P4)

## Evals to write (P1)

- <capability/rule> → <case → expected, one line>

## Guarantee audit (P0)

- <claim> → floor: <hook|content-hash|enum-regex> | advisory

## Trust audit (P2) # only if untrusted input is ingested

- <input> → <how taint propagates through outputs>

## Open questions (HALT) # anything you could not resolve from live state

- <question>
```

## Step 4 — Halt (P6)

After writing `.dev/features/<name>/PLAN.md`, do **not** build. Resolve any remaining open questions and confirm approval
through an **interactive form**, then end your turn:

1. **Open questions → selectable form.** For every entry under `## Open questions (HALT)` that is still
   unresolved, ask it via the `AskQuestion` tool as a multiple-choice question — list the plausible
   answers as selectable options (the human may still choose "Other" to type a custom answer). Do not
   proceed on a guess (P6).
2. **Final approval question.** End by asking one explicit `AskQuestion` form: **"Do you accept this
   plan?"** with selectable options (e.g. _Approve as written_ / _Approve with changes_ / _Reject_).
   Wait for the answer.

Surface the open questions and wait for the human to approve or correct. Building is `/pharn-dev-build`'s job,
and only after this plan is approved.
