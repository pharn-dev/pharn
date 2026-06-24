<div align="center">

# PHARN

**Ship at 8x speed. Keep the understanding of a 1x craftsman.**

An agent-orchestrated intent layer for Claude Code that prevents comprehension debt.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./CHANGELOG.md)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-green)](./LICENSE)
[![CI](https://github.com/pharn-dev/pharn/actions/workflows/ci.yml/badge.svg)](https://github.com/pharn-dev/pharn/actions/workflows/ci.yml)
[![CodeQL](https://github.com/pharn-dev/pharn/actions/workflows/codeql.yml/badge.svg)](https://github.com/pharn-dev/pharn/actions/workflows/codeql.yml)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-555)](https://claude.com/claude-code)

</div>

> **Status: early, active development.** The architecture is specified and the methodology is being
> built incrementally, in the open, using its own tooling (PHARN builds PHARN). It is **not yet ready
> to adopt** — there is no installable pipeline yet. Star or watch to follow along; see
> [Current state](#current-state) for exactly what exists today.

---

## Contents

- [Why PHARN?](#why-pharn)
- [What makes it different](#what-makes-it-different)
- [The pipeline (designed)](#the-pipeline-designed)
- [The design](#the-design)
- [Principles](#principles)
- [Current state](#current-state)
- [How it's built](#how-its-built)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Why PHARN?

Vibe-coding with an AI agent is fast — until the chat history scrolls away and takes the
_understanding_ with it. Six months later, nobody on the team can say why the code is shaped the way
it is, what the constraints were, or which decisions were deliberate. That gap is **comprehension
debt** — a term coined by Addy Osmani in early 2026 — and it compounds faster than any other kind.

This isn't hypothetical. A 2026 Anthropic RCT measured developers scoring ~17% lower on comprehension
of code they shipped with AI assistance, while industry data shows PR volume nearly doubling — more
code, understood less.

PHARN is the intent layer that closes the gap. It keeps the spec, the constitution, and a
markdown-canonical record in your repo — readable, diffable, and versioned in git. The agent does the
typing; PHARN makes sure a human (and the next agent) can still reason about the result.

> **Your chat history is gone. Your spec isn't.**

PHARN is meant to augment the whole team — the PM becomes a product strategist, the developer an
architect and reviewer, everyone working off the same artifact. It does **not** replace developers.

---

## What makes it different

- **The methodology is the product, and it is readable.** PHARN ships as plain markdown — skills,
  commands, lenses, rules — that you read, diff, and version in git. Nothing is hidden behind a binary
  or an API. You can audit exactly what the discipline does.
- **Guarantees reduce to a deterministic floor, or they are labeled advisory.** PHARN draws a hard
  line between what is _guaranteed_ (enforced by a deterministic check — a hook, a content-hash, an
  enum/regex) and what is _advisory_ (a model's judgment). It does not sell a probabilistic claim as a
  guarantee. (`CONSTITUTION.md`, P0.)
- **Built to resist its own attack surface.** An agent that reviews code, fetches docs, and
  accumulates memory is operating on hostile input. PHARN treats trust as a structural property, not
  the model's judgment — because prompt injection is unsolved. (`THREAT-MODEL.md`.)
- **Audit-grade traceability.** Findings cite stable rule IDs; rules cite principles; the spec is
  pinned by content-hash. The chain from a line of code back to the intent that justified it is
  explicit.

---

## The pipeline (designed)

The target workflow is a spine of typed stages — each emits a versioned artifact that links back to
the spec (`ARCHITECTURE.md §6`):

```text
spec → plan → grill → build → regress → verify → ship
```

Each stage reads the artifacts the previous stage produced, and every downstream artifact carries the
`spec_id` (the plan additionally pins the spec's `spec_content_hash`, so a spec edited after planning
is detectable, not silent).

> **What runs today:** the build _tooling_ — `/plan`, `/build`, `/review` — not the user-facing
> pipeline. The seven-stage spine above is the architecture PHARN is being built _to_, not a shipped
> feature. See [Current state](#current-state).

---

## The design

The architecture is fully specified in four documents — read them in this order:

- [`CONSTITUTION.md`](./CONSTITUTION.md) — the eight non-negotiable principles (P0–P7).
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the floor, the primitives, the layers, the pipeline.
- [`THREAT-MODEL.md`](./THREAT-MODEL.md) — the security foundation and the attack surface.
- [`LIMITS.md`](./LIMITS.md) — what PHARN does **not** guarantee, stated plainly.

These four are **trusted and human-only**: a `PreToolUse` write-guard hook denies any agent edit to
them.

---

## Principles

PHARN ships a **constitution** ([`CONSTITUTION.md`](./CONSTITUTION.md)) — eight principles that
override every command, rule, skill, and agent decision in this repo, including the process of
building PHARN itself. A violation is always blocking and is flagged for a human, never auto-fixed.

| Principle | In one line                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- |
| **P0**    | Floor-or-advisory — every _guarantee_ reduces to a hook, content-hash, or enum/regex check   |
| **P1**    | Evals are the spec — no capability ships without eval cases binding each rule it enforces    |
| **P2**    | Trust is structural, not judged — untrusted input is fenced as data, never as instructions   |
| **P3**    | One axis of change per file; modules form a tree with no sibling imports                     |
| **P4**    | Rules are the single source of truth — enforcers cite rule IDs, never restate them           |
| **P5**    | Determinism over classification — the terminal fallback is to ask the human, never to guess  |
| **P6**    | Discovery-first — read and verify live state; halt and ask on any ambiguity                  |
| **P7**    | Honest scope — limits are labeled as limits; no speculative additions without a real failure |

> The privacy / multi-tenant / accessibility-style principles you may have seen described elsewhere
> are the _app-level_ constitution PHARN intends to ship as selectable templates for the projects it
> builds. Those templates are **not present yet** — the eight principles above are this repo's own
> governing constitution.

---

## Current state

What exists today:

- **The architecture spec** — the four trusted documents above.
- **The build tooling** — three slash commands ([`/plan`](./.claude/commands/plan.md),
  [`/build`](./.claude/commands/build.md), [`/review`](./.claude/commands/review.md)), a deterministic
  validator ([`floor/validate.mjs`](./floor/validate.mjs)), and a write-guard hook
  ([`.claude/hooks/protect-trusted-paths.cjs`](./.claude/hooks/protect-trusted-paths.cjs)) that keeps
  the trusted spec human-only.
- **The first built increment** — a trust-boundary lens (`pharn-review/trust-fence/`) with its
  contract (`pharn-contracts/finding-shape.md`) and a hostile eval, reviewed and recorded in
  [`features/trust-fence/REVIEW.md`](./features/trust-fence/REVIEW.md).

The two module folders that exist (`pharn-contracts`, the schemas-only root; and `pharn-review`) are
the bottom of the layer tree described in `ARCHITECTURE.md §4`. The remaining layers
(`pharn-core`, `pharn-pipeline`, `pharn-audits`, `pharn-skills-*`, `pharn-stack-*`) are **planned**,
not built.

What does **not** exist yet: the user-facing pipeline (`spec → … → ship` as runnable commands), the
methodology modules above, and any installer or wizard. This repository is the foundation and the
tooling, not a finished product. Please do not adopt it yet.

---

## How it's built

PHARN is developed in the open and is **self-hosting**: it is built using its own minimal tooling, one
increment at a time, with a deterministic floor gating every step.

```text
/plan  →  approve/correct PLAN.md  →  /build  →  floor/validate.mjs  →  /review  →  fold lessons  →  next
```

The floor and the write-guard hook carry **zero runtime dependencies** (Node stdlib, Node 24); the
dev tooling (ESLint, Prettier, markdownlint) is dev-only. To understand or contribute to the build
process, start with [`CLAUDE.md`](./CLAUDE.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Contributing

PHARN is small-surface on purpose: a rule or enforcer is added only in response to a real failure,
never a hypothetical (P7). See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the read-first order, the
gates to run before pushing, and the build loop. Conduct expectations live in
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md); release history is in [`CHANGELOG.md`](./CHANGELOG.md).

## Security

Found a vulnerability? Please follow [`SECURITY.md`](./SECURITY.md) rather than opening a public
issue.

## License

[Apache 2.0](./LICENSE).
