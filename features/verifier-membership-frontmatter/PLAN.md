# PLAN — verifier-membership-frontmatter

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read this run)
- increment: Replace `/verify`'s loose `grep -rl 'role: verifier'` verifier-membership shorthand with a deterministic frontmatter-membership counter (`floor/count-verifiers.mjs`), so a `role: verifier` string in PROSE/code can never falsely register a verifier — membership is read only from the `---`-fenced YAML frontmatter.
- layer(s): floor (deterministic tooling — `floor/`; NOT a pharn-\* layer and NOT a Capability — `validate.mjs` path-ignores `floor/`, so the floor count stays 1) + command (advisory orchestration — `.claude/commands/`)
- constitution_refs: [P0, P1, P2, P3, P5, P6, P7]

## Why (a real, recorded failure — P7, not hypothetical)

The first full pipeline run measured this live and recorded it in three places (read this run):

- `features/pipeline-integration-probe/VERIFY.md` (integration note): the live content grep `grep -rn 'role: verifier'` matched **8 files, all prose** (PLAN/GRILL/REVIEW/VERIFY text + `verify.md` itself) — and the match count had **grown** from a predicted 3 to 8 as the repo's own prose about verifiers expanded ("monotonically unstable").
- `features/pipeline-integration-probe/REVIEW.md:80` (finding #3, `rule_id: P5`, `verify.md:118`): "the shorthand must parse frontmatter, never grep file contents."
- `features/verify/REVIEW.md` (lines 38–47) flagged the same imprecision at build time; `features/scope-setter-tighten/REVIEW.md:103` cross-references it.

A substring grep over file contents is **not a membership test**: a prose sentence saying "`role: verifier`" is DATA _about_ verifiers, not a declaration _of_ one. The same enum-gated / free-text discipline as the scope-setter (fix #15): a structural fact ("does this capability declare `role: verifier`?") must be read from the STRUCTURED location (YAML frontmatter), never pattern-matched in free text.

## Scope — one axis (verifier membership = frontmatter only)

A capability is a verifier **iff** its `---`-fenced YAML frontmatter has `role: verifier`. A `role: verifier` string anywhere OUTSIDE that frontmatter block (prose, a fenced code block, a plan, a malformed/unfenced header) MUST NOT count.

**This increment fixes how the slot is COUNTED — it authors ZERO verifiers (P7).** The slot stays empty by design; the corrected count returns `registered: 0` on the live repo, so `/verify` continues to run **floor-gates-only** — now grounded in real declarations, not a grep that hits documentation.

Out of scope (do NOT touch): the review-scope finding (#2, separate increment in flight); the `/regress` zsh word-split finding (#1, separate); `ARCHITECTURE.md` or any trusted doc; the verdict core `floor/check-verify.mjs` (it computes the verdict from gate exit codes and never receives a verifier finding — membership detection is a different axis of change, so it lives in a different file, P3).

## Files

- `floor/count-verifiers.mjs` — deterministic verifier-membership counter — layer: floor tooling.
  Usage `node floor/count-verifiers.mjs [targetDir]` (default `.`). Walks `*.md` (mirroring `validate.mjs`'s `walk` + `EXCLUDE_SEGMENTS`: `.claude/commands/`, `floor/`, `node_modules`, `.git` — so it sees exactly the capability surface `validate.mjs` does), extracts each file's YAML frontmatter via the established `^---\r?\n([\s\S]*?)\r?\n---` fence (the mechanism `set-writes-scope.cjs` `writesFromFrontmatter` and `validate.mjs` `parseFrontmatter` already use), reads only the `role:` line **inside that block**, and counts files where the value `=== "verifier"`. Emits `{"registered":<int>,"verifiers":[<repo-rel path>,...]}` to stdout, exit 0 on success; fail-closed nonzero if `targetDir` does not exist (never a silent `0` from looking in the wrong place, P5). Self-contained, stdlib-only — see "Reuse" below.
- `floor/count-verifiers.test.mjs` — hermetic spawn/parse tests (P1) — layer: floor tooling. Mirrors `floor/check-verify.test.mjs` (node:test + `spawnSync` + `mkdtemp` scratch dir, parse stdout JSON, assert).
- `.claude/commands/verify.md` — Step 2 edit (line 118) — layer: command. Replace the illustrative `grep -rl 'role: verifier'` with `node floor/count-verifiers.mjs .` (which emits `{"registered":0,"verifiers":[]}` on this repo), and add one note: the grep shorthand was replaced because it matched prose, not frontmatter (fix #3 probe finding). The intent prose already says "frontmatter declares `role: verifier`" (lines 116–117, 188, 192) and is correct — leave it; only the shorthand command changes.

## Reuse (P3, P5 — mechanism, not a sibling import)

The existing frontmatter readers are NOT importable libraries: `set-writes-scope.cjs` and `floor/validate.mjs` both execute their `main()`/top-level code on load and export nothing. So `count-verifiers.mjs` **reuses the established `^---...---` extraction MECHANISM**, self-contained (exactly as every floor helper — `check-verify.mjs`, `check-regress.mjs`, `check-structural.mjs` — is self-contained, stdlib-only). Its header cites both precedents it mirrors (P4). It is a **new file**, not an addition to `set-writes-scope.cjs` (whose single axis is producing `writes-scope.json`) nor to `check-verify.mjs` (whose single axis is the exit-code verdict) — two reasons to change ⇒ two files (P3).

## Contracts satisfied

- No new `pharn-contracts` schema (this is tooling, not built PHARN). It **cites** the `role` enum (`ARCHITECTURE.md §3.1`) — the same enum `validate.mjs` validates as `ROLE_ENUM` — and the membership discipline of `validate.mjs` (frontmatter `role` parse). Cite, do not restate (P4).

## Evals to write (P1)

`floor/count-verifiers.test.mjs`, mirroring the `★`-marked load-bearing style of `check-verify.test.mjs`:

- ★ THE BUG, PROVEN CLOSED → a `.md` whose frontmatter has NO `role` but whose **body/prose** contains `role: verifier`, plus a second whose `role: verifier` sits inside a fenced \`\`\`code block\`\`\` → `registered === 0`, `verifiers: []`. (This is the exact prose-matching defect finding #3 names.)
- ★ a `.md` WITH `role: verifier` in **real frontmatter** → `registered === 1`, and `verifiers` contains that file.
- mixed repo → one real frontmatter verifier + several prose mentions + a non-verifier capability (`role: lens`) → `registered === 1` (only the real declaration).
- a `.md` with frontmatter where `role:` is a different value (`role: lens`) AND prose `role: verifier` in the body → `registered === 0`.
- a `.md` with a malformed frontmatter fence (no closing `---`) containing `role: verifier` → `registered === 0` (only a properly-fenced declaration counts).
- empty dir / no `.md` → `registered === 0`, `verifiers: []`, exit 0.
- nonexistent target dir → exit nonzero (fail-closed, P5).

(P1 note: `count-verifiers.mjs` is floor/eval infrastructure, not a Capability — no `role:`; like its `floor/` siblings it is bound by the floor-helper convention "colocated hermetic `*.test.mjs`," not by P1's Capability-evals rule. `npm test` auto-collects the new test via its `**/*.test.mjs` glob.)

## Guarantee audit (P0)

- "Verifier membership is counted from frontmatter declarations only — a prose / code-block mention of `role: verifier` can never register a verifier." → **floor: enum/regex** (primitive #3). Deterministic frontmatter extraction + `role === "verifier"` equality; pure Node, no LLM. The helper's computation is floor-grade. A **real guarantee**.
- "`registered: 0` on this repo; the slot stays empty (P7)." → a **measured fact** verified by running the helper live this build (P6), not a standalone guarantee claim — the expected post-fix state.
- "`/verify` therefore runs floor-gates-only." → the membership **number** is now floor-grade (above); the command **acting** on it (branch to floor-only) is **advisory orchestration** — the same "two clocks" `/verify` already labels (its Bash orchestration is advisory; only the verdict is floor). The fix upgrades the membership INPUT from a prose-grep (garbage) to a deterministic frontmatter count, closing the probe's L5 "a floor/advisory step is only as good as its input capture" gap for this input. Stated honestly, not oversold.
- Honest non-claim: the count does **not** feed the verdict — `check-verify.mjs` never receives it (fix #3: the verdict is exit-codes-only). So even a wrong count could never flip a guaranteed decision; this fix improves the **advisory** layer's honesty, it does not touch the verdict.

## Trust audit (P2)

`count-verifiers.mjs` ingests `*.md` whose bodies are **untrusted** (capability bodies, plans, reviews). It reads **only** the `role:` field **inside the `---` frontmatter fence** — an enum-gated / floor-verifiable field (deterministic parse + set-membership equality). It never reads body free-text as a value that counts. A `role: verifier` in an untrusted **body** (prose or code block) is DATA and is structurally excluded from the count — this is the enum-gated / free-text split (fix #1, `ARCHITECTURE.md §8`) applied to membership detection, exactly the principle this increment is about. Taint cannot propagate into the count.

Residual (named, bounded): a hostile capability could put `role: verifier` in its **real** frontmatter to register as a verifier — but that is a legitimate self-declaration; the resulting findings are ADVISORY only (never gate the verdict, fix #3), and the capability is still subject to the rest of the floor (`validate.mjs` evals/enum checks). A hostile "verifier" can at most add advisory free-text, never flip the verdict — unchanged from today's posture.

## Determinism audit (P5)

Membership = deterministic frontmatter parse + `role === "verifier"` equality — a pure membership test, never LLM classification and never a content grep over free text. No branch rests on judgment, so no "ask" fallback is needed (the strongest P5 outcome). Fail-closed on a bad target (nonzero exit, never a silent `0`).

## Open questions (HALT) — resolved during discovery (P6); none blocking

- _Where does the membership detection live (command vs helper)?_ → **Resolved by live read.** The loose grep lives ONLY at `.claude/commands/verify.md:118`; `floor/check-verify.mjs` does NO membership (it computes the verdict from a gate→exit-code map and cannot even receive a verifier finding); there is **no** existing helper that counts verifiers. ⇒ introduce `floor/count-verifiers.mjs` (a spawn/parse-testable helper, required by the P1 TESTS) and point `verify.md` Step 2 at it. Unambiguous.
- _Can frontmatter-only parsing be cleanly reused from the existing reader?_ → **Resolved.** Neither `writesFromFrontmatter` (in `set-writes-scope.cjs`) nor `parseFrontmatter` (in `validate.mjs`) is exported — both files run on import. So the helper reuses the established `^---...---` extraction **mechanism**, self-contained, matching the floor-helper convention (and keeping P3 clean — no sibling import).
- Verification target (post-build): `node floor/validate.mjs .` stays **GREEN — 1 capability**; `npm test` stays green at **91** (the live 90 + the new `count-verifiers.test.mjs` cases; read the count live, never assert from this doc — P6); `node floor/count-verifiers.mjs .` prints `{"registered":0,"verifiers":[]}`.
