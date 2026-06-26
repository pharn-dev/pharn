# Changelog

All notable changes to PHARN-OSS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The current version is also recorded in [`SKILLS_VERSION`](./SKILLS_VERSION).

## [Unreleased]

### Added

- **The memory-promote command + provenance checker** (`.claude/commands/memory-promote.md`, `floor/check-provenance.mjs`) — a P2-gated mechanism for promoting one lesson/pattern to the canonical memory-bank. It automates the _mechanics_ (assemble the entry, capture provenance deterministically, validate shape, detect duplicate ids, set the fix #7 writes-scope to the one target canon file) and **HALTS for explicit human accept/deny before any write** — it never self-promotes. `check-provenance.mjs` is the deterministic floor reduction of `ARCHITECTURE.md §5`'s "provenance per entry": it rejects a candidate with missing/malformed provenance, a duplicate id, or a target outside the two prescription files (`lessons-learned.md` / `pattern-library.md`). Stdlib-only; ships a `node --test` suite. The honest split (P0): the floor guarantees valid provenance + a unique id + a write confined to the declared canon file — **not** that the lesson is correct or wise (that is the human's advisory accept/deny).
- **The eval-format contract** (`pharn-contracts/eval-format.md`) — the structural-vs-semantic split for eval assertions: `structural[]` (floor-reducible) versus `semantic[]` (advisory llm-judge), keyed by a `skill_kind` discriminator.
- **The structural checker** (`floor/check-structural.mjs`) — a deterministic, dependency-free floor piece that executes an eval's `structural[]` assertions against a skill's already-produced finding output (`finding_count`, `field_equals`, `file_resolves`, `needle_absent_from_enum_gated`, plus the `skill_kind` rule) and exits non-zero on any RED. Ships with a `node --test` suite; reviewed in `features/structural-checker/REVIEW.md`.
- Repository governance files: `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and `SKILLS_VERSION`.

### Changed

- Reframed the repository from "PHARN bootstrap" to **PHARN-OSS** — the product/methodology itself, self-hosting and early-stage — across all docs and metadata; renamed the package `pharn` → `pharn-oss`. No change to the released surface (the floor, the write-guard hook, `/plan`·`/build`·`/review`, or capabilities).

## [1.0.0] - 2026-06-23

### Added

- **The spec** — the four trusted, human-only documents: `CONSTITUTION.md` (the eight principles, P0–P7), `ARCHITECTURE.md`, `THREAT-MODEL.md`, and `LIMITS.md`.
- **The floor** — `floor/validate.mjs`, the deterministic, dependency-free validator (frontmatter and required fields, evals, the `rule_id`↔eval binding, enums, and the finding shape).
- **The write-guard hook** — `.claude/hooks/protect-trusted-paths.cjs`, a `PreToolUse` hook that denies agent writes to the four trusted docs.
- **The commands** — `/plan`, `/build`, and `/review` (`.claude/commands/`).
- **Dev tooling** — ESLint, Prettier, and markdownlint configuration; the `npm run check` aggregate gate; and a `node --test` suite covering the write-guard hook and the floor.
