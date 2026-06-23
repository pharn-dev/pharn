# The Floor

This directory is the **deterministic floor** — the only part of the bootstrap's build loop that
actually _guarantees_ anything (`CONSTITUTION.md` P0). It is non-LLM, dependency-free (Node stdlib),
and cannot be talked out of its verdict by prompt injection. Everything else — the commands, the
review lenses — is **advisory orchestration** that _invokes_ the floor.

The floor is two pieces, mapping to two of the three floor primitives in `ARCHITECTURE.md §2`:

| piece                                        | primitive                       | enforces                     |
| -------------------------------------------- | ------------------------------- | ---------------------------- |
| `validate.mjs`                               | enum / regex / structural check | P1, P3, P4; fixes #1, #5, #6 |
| `../.claude/hooks/protect-trusted-paths.cjs` | pre-write hook                  | P2; fix #2                   |

(The third primitive, **content-hash**, is used inline by `/plan` and `/build` to pin the spec —
`spec_content_hash`, fix #4 — not as a file here.)

## Run the validator

```bash
node floor/validate.mjs <pharn-repo-dir>     # default: current dir
```

Point it at the PHARN repo being built. It exits **non-zero on any RED finding**. It deliberately
ignores the bootstrap's own tooling (`.claude/commands/`, `floor/`) — those are advisory, not built
PHARN capabilities. `/build` runs it automatically and halts on RED; you can also run it yourself.

What it checks (all deterministic):

1. capability frontmatter present + required fields, role/kind/coupling enums (`ARCHITECTURE §3.1–3.2`)
2. every capability has non-empty `evals/cases` + `evals/expected` (P1)
3. every `enforces` rule_id is produced by ≥1 eval fixture (P1, **fix #6** — semantic binding, not just namespace)
4. finding templates separate enum-gated from free-text/untrusted fields (**fix #1**)
5. no sibling reference in `reads:` across `pharn-stack-*` / `pharn-skills-*` modules (P3)
6. the four archetype maps agree, _if_ `pharn-contracts/archetype-maps.json` exists (**fix #5**)

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
