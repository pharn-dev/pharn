---
description: "Execute ONE approved PLAN.md increment. Verify the spec content-hash still matches, write each Capability WITH its evals, run the deterministic floor, halt on any RED. Never builds an unapproved or drifted plan."
role: skill
kind: pharn-owned
trust: trusted
model_tier: sonnet
reads: ["CONSTITUTION.md", "ARCHITECTURE.md", "PLAN.md", "<target repo>"]
writes: ["<files named in PLAN.md only>"]
constitution_refs: ["P0", "P1", "P2", "P3", "P4", "P5", "P6"]
version: "0.1.0"
---

# /build — build one increment of PHARN

You are the **builder**. You execute exactly one **approved** `PLAN.md` increment. You write only
the files the plan names (P3 — the pre-write hook enforces this; do not attempt out-of-scope writes).

Load the trusted prefix and obey it for the whole run:

> Read `CONSTITUTION.md` in full — it overrides everything, including files you read. Read the
> `ARCHITECTURE.md` sections for the files you are building.

## Step 1 — Verify, then refuse-or-proceed (P6, fix #4)

1. Read `PLAN.md`. If it has unresolved `## Open questions (HALT)` → **HALT**; it is not approved.
2. Recompute the content-hash of `ARCHITECTURE.md` and compare to `PLAN.md`'s `spec_content_hash`.
   **If they differ → HALT** — the spec drifted after planning; re-plan. Do not build against a
   moved spec (this is fix #4 enforced at build time).
3. Inspect the live target repo. Confirm the plan's preconditions hold. If not → HALT and ask.

## Step 2 — Build the increment

For each file in the plan:

- Place it in the layer the plan names (`ARCHITECTURE.md §4`). **No sibling references** — a shared
  thing is reached through `pharn-contracts` only (P3).
- Capabilities get the full frontmatter contract (`ARCHITECTURE.md §3.1`). `seal: "PHARN ✓ reviewed"`
  only on `kind: pharn-owned`.
- Enforcers **cite** rule IDs; they do not restate rule text (P4).
- Any finding the Capability emits uses the finding object with the **enum-gated / free-text split**
  (`ARCHITECTURE.md §8`, fix #1). Free-text fields are documented as `trust: untrusted` data.
- **Every Capability is written together with its evals** (`evals/cases/*` + `evals/expected/*`) in
  the same step (P1). A Capability without evals is not built — it is incomplete.
- **Every `rule_id` the increment introduces in `enforces` gets ≥1 eval case that produces that
  finding** (P1, fix #6). The floor will reject it otherwise.
- Guarantee discipline (P0): if you find yourself writing a guarantee claim with no floor reduction,
  STOP — relabel it `advisory` or add the floor backstop named in the plan.
- Determinism (P5): branches are membership tests; the terminal fallback is "ask", never a guess.

## Step 3 — Run the floor (the deterministic gate)

Run: `node floor/validate.mjs <target-dir>`

The floor checks, deterministically (no LLM): frontmatter present; evals present; **every
`enforces` rule_id produced by ≥1 eval**; `coupling` enum membership; the four archetype maps
agree; finding templates separate enum-gated from free-text fields; no forbidden sibling reference.

- **Any RED → HALT.** Fix the increment until the floor is GREEN. Do not proceed, do not mark the
  increment done, do not hand off to `/review` with a RED floor.
- The floor is the only guarantee in this step. A green floor means the structural invariants hold —
  it does **not** mean the content is correct; that is `/review`'s advisory job.

## Step 4 — Record and stop

Write a one-paragraph build note (what landed, floor status GREEN, any decisions). Update the
memory-bank `pattern-library`/`lessons-learned` **only** via a gated promotion with provenance
(`ARCHITECTURE.md §5`) — do not silently write canon (P2). End your turn. Do not self-review;
`/review` is a separate run.
