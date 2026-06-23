# PHARN Bootstrap

The **mini-PHARN that writes PHARN.** This package is the minimal methodology Claude Code uses to
plan, build, and review the real PHARN — and it is itself a small instance of PHARN's architecture.
PHARN writes PHARN (self-hosting).

It is deliberately tiny. It must be: per its own governing principle (P0), every guarantee reduces
to a deterministic floor, so the bootstrap cannot be "just prompts" — it carries a real floor
(`floor/validate.mjs` + a write-guard hook). A bootstrap with no floor would violate the very rule
it exists to enforce.

## What's here

```text
CONSTITUTION.md      ← the apex. 8 non-negotiable principles (P0–P7). Read this first.
ARCHITECTURE.md      ← the spec PHARN is built to: floor, primitives, layers, contracts, pipeline.
THREAT-MODEL.md      ← security foundation (threat model B), attack surface, red-team closure status.
LIMITS.md            ← what PHARN does NOT guarantee. The three irreducibles + token cost model.
.claude/
  commands/
    plan.md          ← /plan   — discovery-first planner (one increment, pins spec hash, halts to ask)
    build.md         ← /build  — executes one plan increment, writes evals, runs the floor
    review.md        ← /review — the dogfood reviewer; 4 lenses targeting the 4 unknowns + fix #1
  hooks/
    protect-trusted-paths.cjs  ← pre-write floor: trusted docs are read-only to the agent (fix #2)
    settings.snippet.json      ← wire the hook into .claude/settings.json
floor/
  validate.mjs       ← the deterministic floor: frontmatter, evals, rule_id↔eval, enums, finding-shape
  README.md          ← how to run the floor and wire the hook
```

The four trusted docs are the spec. The three operational pieces (commands, floor, hook) are the
tooling that consumes the spec. The commands are **advisory orchestration**; the **guarantees** are
the floor (`validate.mjs` + the hook). That separation is the bootstrap being honest to P0.

## The loop

```text
        ┌──────────────────────────────────────────────────────────┐
        │  CONSTITUTION + ARCHITECTURE + THREAT-MODEL + LIMITS      │
        │  (injected as the trusted prefix on every command)        │
        └──────────────────────────────────────────────────────────┘
                 │                    │                     │
              /plan  ───────────►  /build  ───────────►  /review
        discovery-first        executes ONE          4 lenses, each
        ONE increment,         increment, writes     citing a principle;
        pins spec_content_hash evals (P1), runs      findings in the
        halts & asks (P6)      floor, halts on RED   enum-gated/free-text
                 ▲                    │              split (fix #1)
                 │                    ▼                     │
                 │              floor/validate.mjs          │
                 │              (deterministic gate)        │
                 └──────────── lessons feed back ───────────┘
```

Run order for each increment: `/plan` → review the PLAN, approve or correct → `/build` →
`floor/validate.mjs` (the build invokes it; you can also run it yourself) → `/review` → fold
lessons → next increment.

## How to use with Claude Code

1. Drop this directory in (or at the root of) the repo where PHARN will be built.
2. Wire the floor hook: copy `.claude/hooks/settings.snippet.json` into `.claude/settings.json`
   (see `floor/README.md`). This makes the four trusted docs read-only to the agent.
3. Invoke `/plan`, `/build`, `/review` as slash commands. Each command injects the constitution
   and the relevant architecture sections itself.
4. The floor runs with `node floor/validate.mjs <target-dir>` — no dependencies, Node stdlib only.

## The experiment agenda (why this exists in this form)

We are in experiment mode: we can rewrite PHARN many times, cheaply, because it is markdown. The
point is that the rewrites **accumulate** instead of thrashing. Two rules make that true:

- **v0.80 (the existing PHARN) is the oracle.** Its hundreds of eval cases (`cases/` + `expected/`)
  are the measuring stick. Each greenfield attempt that satisfies the same subset of evals is
  comparable to the last. "Rewrote it 10 times" becomes "measured 10 variants against one bar."
- **One axis per attempt.** Change one thing per attempt, or you cannot attribute what caused what.

The agenda is the four unknowns no external review would attack:

1. **trust-fence** — does the data-vs-instruction boundary hold under adversarial code? (the residual)
2. **Capability unification** — does collapsing 5 roles into one shape lose role-specific output
   contracts (a griller _asks_, a lens _rules_)?
3. **`pharn-contracts` as a separate bottom** — does it clean the inversion or relocate it?
4. **token fan-out** — does tiered loading + `reads`-as-budget actually scale across 13 lenses?

### Attempt 0

**Attempt 0 targets unknown #1 — taint through the finding object** (`THREAT-MODEL.md §5`,
`ARCHITECTURE.md §8`). Thinnest possible strain: one untrusted artifact (adversarial code with an
injected instruction in a comment) → one Capability (a lens) → one finding → check whether the
untrusted content laundered itself to trusted in the output. One file, one eval.

If the fence holds, half the trust model stands. If it breaks, we know at attempt 0 — an hour of
work — not at attempt 7 after building half the system on it. This is the one fix that cannot be
verified by reasoning; everything else is enum-checks, hooks, and content-hashes, which are either
on the floor or not.
