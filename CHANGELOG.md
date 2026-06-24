# Changelog

All notable changes to the PHARN OSS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The current version is also recorded in [`SKILLS_VERSION`](./SKILLS_VERSION).

## [Unreleased]

### Added

- Repository governance files: `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and `SKILLS_VERSION`.

## [1.0.0] - 2026-06-23

### Added

- **The spec** — the four trusted, human-only documents: `CONSTITUTION.md` (the eight principles, P0–P7), `ARCHITECTURE.md`, `THREAT-MODEL.md`, and `LIMITS.md`.
- **The floor** — `floor/validate.mjs`, the deterministic, dependency-free validator (frontmatter and required fields, evals, the `rule_id`↔eval binding, enums, and the finding shape).
- **The write-guard hook** — `.claude/hooks/protect-trusted-paths.cjs`, a `PreToolUse` hook that denies agent writes to the four trusted docs.
- **The commands** — `/plan`, `/build`, and `/review` (`.claude/commands/`).
- **Dev tooling** — ESLint, Prettier, and markdownlint configuration; the `npm run check` aggregate gate; and a `node --test` suite covering the write-guard hook and the floor.
