# The Floor

This directory is the **deterministic floor** — the only part of this repo's build loop that
actually _guarantees_ anything (`CONSTITUTION.md` P0). It is non-LLM, dependency-free (Node stdlib),
and cannot be talked out of its verdict by prompt injection. Everything else — the commands, the
review lenses — is **advisory orchestration** that _invokes_ the floor.

The floor is three files. Two of the three floor primitives in `ARCHITECTURE.md §2` are files here;
the third, **content-hash**, is used inline by `/plan` and `/build` to pin the spec
(`spec_content_hash`, fix #4) rather than as a file:

| file                                         | primitive                                | enforces                                      |
| -------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `validate.mjs`                               | enum / regex / structural check          | P1, P3, P4; fixes #1, #5, #6                  |
| `check-structural.mjs`                       | enum / regex-substring / path-resolution | `structural[]` of an eval `expected` (P0, P1) |
| `../.claude/hooks/protect-trusted-paths.cjs` | pre-write hook                           | P2; fix #2                                    |

## Run the validator

```bash
node floor/validate.mjs <pharn-repo-dir>     # default: current dir
```

Point it at the PHARN repo being built. It exits **non-zero on any RED finding**. It deliberately
ignores this repo's own tooling (`.claude/commands/`, `floor/`) — those are advisory, not built
PHARN capabilities. `/build` runs it automatically and halts on RED; you can also run it yourself.

What it checks (all deterministic):

1. capability frontmatter present + required fields, role/kind/coupling enums (`ARCHITECTURE §3.1–3.2`)
2. every capability has non-empty `evals/cases` + `evals/expected` (P1)
3. every `enforces` rule_id is produced by ≥1 eval fixture (P1, **fix #6** — semantic binding, not just namespace)
4. finding templates separate enum-gated from free-text/untrusted fields (**fix #1**)
5. no sibling reference in `reads:` across `pharn-stack-*` / `pharn-skills-*` modules (P3)
6. the four archetype maps agree, _if_ `pharn-contracts/archetype-maps.json` exists (**fix #5**)

## Run the structural checker

```bash
node floor/check-structural.mjs <expected.json> <actual.json> [repoDir]
```

`check-structural.mjs` **executes** the `structural[]` reduction that `pharn-contracts/eval-format.md`
documents. Given an eval's `expected` (normalized to JSON) and a skill's already-produced finding
output (a JSON array of `finding-shape` objects), it evaluates the four structural kinds —
`finding_count`, `field_equals`, `file_resolves`, `needle_absent_from_enum_gated` — plus the one
`skill_kind` rule (`deterministic` forbids a non-empty `semantic[]`), and exits **non-zero on any
RED**. Each kind reduces to a floor primitive (`ARCHITECTURE §2`): an enum/count check, an equality
check, path resolution, or a substring scan over the **enum-gated** fields only (`type`, `rule_id`,
`severity`, `file` — never `problem` / `evidence`, which are untrusted free-text DATA). It does **not**
run the skill; it checks an output the skill already produced.

**What this changes (P0).** Before, `eval-format.md` labeled `structural[]`
**floor-reducible-but-not-yet-enforced** and named this checker as the backstop. With it landed,
`structural[]` is **floor-enforced**: if a model laundered an untrusted needle (e.g. `skip authz`)
into an enum-gated field, or routed a `deterministic` skill's judgment through `semantic[]`, that is
now a deterministic **RED**, not a hope.

**Honest scope (P0) — the boundary that keeps this from overselling.** The checker enforces
`structural[]` **over a provided finding output**. It does **not** run the skill and does **not**
guarantee the model _produces_ a clean, un-laundered output under injection — that is the named
residual (`LIMITS §2`, `THREAT-MODEL §5`, attempt 0). The trip-wire moves onto the floor; the model's
behavior under injection does not become guaranteed. `semantic[]` stays **advisory** — the checker
never evaluates a `judge` string (no LLM).

## Wire the write-guard hook

Merge `../.claude/hooks/settings.snippet.json` into your `.claude/settings.json`. It registers a
`PreToolUse` hook on `Write|Edit|MultiEdit` that blocks any write to a trusted file
(`CONSTITUTION.md`, `ARCHITECTURE.md`, `THREAT-MODEL.md`, `LIMITS.md`). Extend the protected set
with the `PHARN_PROTECTED` env var (comma-separated). Confirm it works:

```bash
echo '{"tool_name":"Edit","tool_input":{"file_path":"CONSTITUTION.md"}}' | node .claude/hooks/protect-trusted-paths.cjs   # → exit 2, denied
echo '{"tool_name":"Write","tool_input":{"file_path":"pharn-core/rules/x.md"}}' | node .claude/hooks/protect-trusted-paths.cjs  # → exit 0, allowed
```

## Honest scope (P0, P7)

Checks **4 and 5 are best-effort.** Markdown has no `import` statement to lint, so they reduce a
class of mistakes — they do not eliminate it (`ARCHITECTURE §4` caveat; `LIMITS`). The floor
guarantees the _structural_ invariants it can compute deterministically; it does **not** guarantee
content is correct — that is `/review`'s advisory job. A GREEN floor means "the shape is sound,"
never "the architecture is right." Claiming otherwise would be the exact disease P0 exists to
prevent.
