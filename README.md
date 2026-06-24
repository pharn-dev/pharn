# PHARN-OSS

Audit-grade methodology for AI-native development. PHARN-OSS is a set of skills, commands, lenses,
and rules for agentic coding tools (Claude Code first) that turn AI coding sessions into versioned,
reviewable artifacts — so a codebase stays legible past month six, even when an agent is writing
most of it.

> **Status: early, active development.** The architecture is specified and the methodology is being
> built incrementally, in the open, using its own tooling (PHARN builds PHARN). It is **not yet ready
> to adopt** — there is no installable pipeline yet. Star or watch to follow along; see
> [Current state](#current-state) for exactly what exists today.

## The problem

AI agents write code faster than a team can keep up with *why*. The code lands; the reasoning behind
it — which constraints applied, where a feature begins and ends, what was traded off — does not. The
result is **comprehension debt**: a codebase that runs but that no one fully understands, and that
gets harder to change the faster it is generated. Autocomplete and ad-hoc chat make this worse, not
better — they leave no durable record.

PHARN-OSS treats *intent* as the artifact. Every change runs through a pipeline —
`spec → plan → grill → build → regress → verify → ship` — and each stage leaves a typed, versioned
record that links back to the spec. Your chat history disappears; your spec, plan, and review do not.

It is a discipline layer over agentic coding, not a replacement for engineers. It is meant to augment
the whole team.

## What makes it different

- **The methodology is the product, and it is readable.** PHARN-OSS ships as plain markdown — skills,
  commands, lenses, rules — that you read, diff, and version in git. Nothing is hidden behind a binary
  or an API. You can audit exactly what the discipline does.
- **Guarantees reduce to a deterministic floor, or they are labeled advisory.** PHARN-OSS draws a hard
  line between what is *guaranteed* (enforced by a deterministic check — a hook, a content-hash, an
  enum/regex) and what is *advisory* (a model's judgment). It does not sell a probabilistic claim as a
  guarantee. (`CONSTITUTION.md`, P0.)
- **Built to resist its own attack surface.** An agent that reviews code, fetches docs, and
  accumulates memory is operating on hostile input. PHARN-OSS treats trust as a structural property,
  not the model's judgment — because prompt injection is unsolved. (`THREAT-MODEL.md`.)
- **Audit-grade traceability.** Findings cite stable rule IDs; rules cite principles; the spec is
  pinned by content-hash. The chain from a line of code back to the intent that justified it is
  explicit.

## The design

The architecture is fully specified in four documents — read them in this order:

- [`CONSTITUTION.md`](./CONSTITUTION.md) — the eight non-negotiable principles (P0–P7).
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the floor, the primitives, the layers, the pipeline.
- [`THREAT-MODEL.md`](./THREAT-MODEL.md) — the security foundation and the attack surface.
- [`LIMITS.md`](./LIMITS.md) — what PHARN-OSS does **not** guarantee, stated plainly.

## How it is built

PHARN-OSS is developed in the open and is **self-hosting**: it is built using its own minimal tooling,
one increment at a time, with a deterministic floor gating every step. To contribute or to understand
the build process, start with [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CLAUDE.md`](./CLAUDE.md).

## Current state

What exists today:

- **The architecture spec** — the four documents above.
- **The build tooling** — three slash commands (`/plan`, `/build`, `/review`), a deterministic
  validator (`floor/validate.mjs`), and a write-guard hook that keeps the trusted spec human-only.
- **The first built increment** — a trust-boundary lens (`pharn-review/trust-fence/`) with its
  contract (`pharn-contracts/finding-shape.md`) and a hostile eval, reviewed and recorded in
  `features/trust-fence/REVIEW.md`.

What does **not** exist yet: the user-facing pipeline (`/pharn-spec`, `/pharn-plan`, … `/pharn-ship`)
and the methodology modules. This repository is the foundation and the tooling, not a finished
product. Please do not adopt it yet.

## Contributing

PHARN-OSS is small-surface on purpose: a rule or enforcer is added only in response to a real failure,
never a hypothetical. See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Found a vulnerability? Please follow
[`SECURITY.md`](./SECURITY.md) rather than opening a public issue.

## License

[Apache 2.0](./LICENSE).
