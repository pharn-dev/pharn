# PLAN — Reframe residual "bootstrap" language to PHARN-OSS (report-only)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read this run)
- increment: Finish the `bootstrap → PHARN-OSS` reframe; discovery shows it is already complete in every agent-editable file, leaving only 4 human-only edits in `CONSTITUTION.md`.
- layer(s): n/a — repository docs/meta, not a `pharn-*` capability layer (ARCHITECTURE.md §4)
- constitution_refs: [P0, P2, P6, P7]

## Discovery result (P6 — verified by live reads this run)

The task was written against a pre-reframe mental model. Live state disagrees: the recent
`Rename bootstrap branding to PHARN OSS` commit already scrubbed the word and the misframing from
every file the agent may edit. **There is no agent-writable reframe work left.** The only residue is
in the human-only `CONSTITUTION.md`.

Grounding:

- `grep -rniI "bootstrap"` over the whole tree (minus `.git`) → matches **only** `CONSTITUTION.md`
  (lines 5, 13, 35, 115).
- Framing-phrase sweep (`real pharn|mini-pharn|scaffold|lives elsewhere|build the real|writes pharn|
the real thing|separate experiment|tool to build|scaffolding for|…`) → only `CLAUDE.md:8`
  (a negation: "**not** scaffolding for a 'real PHARN'…") and `LIMITS.md:95/109/112`
  (legitimate technical usage). No misframing.
- Repo URLs (`pharn-dev/…`) → already `pharn-dev/pharn-oss` in `CONTRIBUTING.md:22`, `SECURITY.md:26`,
  `.github/ISSUE_TEMPLATE/config.yml:4,7`. **Zero** old `pharn-dev/pharn` references remain.
- `package.json` → `"name": "pharn-oss"`, description already product-framed.
- `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md` openers → all already
  state "this repository **is PHARN-OSS**" with the self-hosting fact stated once. No change needed.
- Baseline before any edit: `node floor/validate.mjs .` → `GREEN — 1 capabilities checked`;
  `npm test` → 5 pass / 0 fail.

## Audit table (every real occurrence, classified)

### Human-only — `CONSTITUTION.md` (write-protected trusted doc; REPORT, do not edit)

| file:line           | sense       | current                                                                                                 | proposed                                                                        |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| CONSTITUTION.md:5   | 2 (tooling) | `…injected as system-level prefix before every bootstrap command (plan/build/review); write-protected…` | drop "bootstrap": `…before every command (plan/build/review); write-protected…` |
| CONSTITUTION.md:13  | 1 (name)    | `…every command, plan, design law, and agent decision in this bootstrap.`                               | `…in PHARN-OSS.` (or "in this repo")                                            |
| CONSTITUTION.md:35  | framing     | `The disease this bootstrap exists to prevent is…`                                                      | `The disease this repo exists to prevent is…` (mirrors CLAUDE.md:35)            |
| CONSTITUTION.md:115 | 2 (tooling) | `Each bootstrap command (/plan, /build, /review) injects this file's contents…`                         | drop "bootstrap": `Each command (/plan, /build, /review) injects…`              |

### Verified clean — no change (recorded so the sweep is provably complete)

| file:line                         | why it stays                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| CLAUDE.md:8                       | negation — already correct PHARN-OSS framing ("**not** scaffolding for a real PHARN")                                   |
| LIMITS.md:95                      | "Fencing scaffolding" = the prose wrapping untrusted blocks (a cost), not a repo-as-scaffolding claim                   |
| LIMITS.md:109, 112; CLAUDE.md:138 | "the experiment / experiment agenda" = the rewrite-and-measure agenda, a real concept, not "repo is just an experiment" |

## Files

- `PLAN.md` — this plan (the only file written this run; not a protected path).
- **No product/repo files are written by the agent.** The 4 edits above are human-only
  (`CONSTITUTION.md` is denied by `.claude/hooks/protect-trusted-paths.cjs`, exit 2 — correct).

## Contracts satisfied

- n/a — this is a docs/framing reframe, not a `pharn-contracts` consumer or a new capability.

## Evals to write (P1)

- n/a — no capability is added or changed, so P1 imposes no eval. (P1 binds capabilities and
  `rule_id`s, not prose edits.)

## Guarantee audit (P0)

- "the reframe preserves the floor" → floor: enum-regex — `node floor/validate.mjs .` ran GREEN
  before, and re-runs GREEN after writing `PLAN.md`; `npm test` 5/5.
- The reframe introduces **no new guarantee** and must not relabel any `advisory` as a guarantee. The
  4 `CONSTITUTION.md` edits are pure naming/framing (senses 1–2); none touch a P0 floor-reduction,
  a trust tag, or the finding shape. → advisory wording only, no guarantee claim.

## Trust audit (P2)

- No untrusted artifact is ingested. Inputs read this run are repo-owned files (trusted spec +
  repo-owned dev/meta) and the user's `/plan` instruction (trusted). Nothing taints a downstream
  decision; the occurrence classification is surfaced for human approval, not executed.

## Determinism audit (P5)

- Sense-1/2/framing classification is editorial judgment, not a floor branch. It is not wired into
  `validate.mjs`; its terminal fallback is **this halt** — the human approves/corrects the table and
  applies the `CONSTITUTION.md` edits. No guess is committed.

## Resolutions (approved 2026-06-24)

The open questions are resolved by the human; this plan is **approved**. No
`## Open questions (HALT)` block remains, so the `/build` gate (Step 1.1) passes.

1. **`CONSTITUTION.md` (4 edits):** wording **approved** — use "this repo" for line 13. The human will
   hand-apply the 4 edits (lines 5, 13, 35, 115); the agent is correctly denied (hook, exit 2). This is
   the only remaining reframe work, and it is human-only.
2. **URLs / package name:** **confirmed** — already `pharn-dev/pharn-oss` and `name: pharn-oss`;
   nothing to flip.
3. **Scope:** **confirmed** — the plan ends here. It names no agent-writable files, so `/build` is a
   verified no-op (the floor must stay GREEN); the reframe completes when the human applies the 4 edits.

### Out of scope (noted, not part of this increment — P7)

- `CONTRIBUTING.md:55` has a pre-existing sentence-case typo ("…non-trivial change. this repo is
  small-surface…"). Unrelated to the reframe; flag only — fix it in a separate `docs/` change if you want.

## Build note (2026-06-24)

`/build` ran against this approved plan. Spec hash `11cd9ad5…d969` re-verified — no drift (fix #4).
The plan names no agent-writable files, so **the agent wrote nothing** beyond this record. Floor
`node floor/validate.mjs .` → `GREEN — 1 capabilities checked`; `npm test` → 5 pass / 0 fail. The
increment is a **verified no-op**: the bootstrap→PHARN-OSS reframe is already complete in every
agent-editable file, and the only remaining work — the 4 human-only `CONSTITUTION.md` edits (lines 5,
13, 35, 115) — stays pending until a human applies them. No memory-bank/canon writes were made (P2).
Not self-reviewed; `/review` is a separate run.
