# PLAN — writes-scope guard (fix #7, deterministic floor, fail-closed)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read live this run)
- increment: Make `writes:` genuinely floor-enforced — a deterministic scope-setter writes `.pharn/writes-scope.json` from a Capability/command's declared `writes:`, and a new pre-write hook denies (exit 2) any write outside that scope, fail-closed to a default-safe-set when no scope is set, composing with (never replacing) the fix #2 protected-paths hook.
- layer(s): floor / hooks (ARCHITECTURE.md §2 primitive #1, §3.3 — hooks are a separate privileged class, NOT Capabilities) + the three orchestration commands (advisory) # ARCHITECTURE.md §4
- constitution_refs: [P0, P2, P3, P5, P6, P7]

## Why this increment (P7 — real trigger, not speculation)

The triggering failure is real, recorded, and already in the repo:

- `features/structured-findings/REVIEW.md` finding **F2** (lines 56-62, 82-87): `ARCHITECTURE.md:73`
  and §7 state `writes:` is "ENFORCED by the pre-write hook (§5, fix #7)", but the **sole** live
  PreToolUse hook (`.claude/hooks/protect-trusted-paths.cjs`) implements **only** fix #2 (static
  protected paths) and `exit 0`s every other write — it never reads a `writes:` field. The cited floor
  backstop **does not exist**: the P0 disease ("written in the contract" ≠ "guaranteed") inside PHARN's
  own spec.
- The same review's F1/F2 chain notes the `findings.json` emission contract (increment 3a) leans on
  this backstop: its named floor reduction (a) is "the pre-write `writes:` hook enforces the path,"
  which is presumed, not real.

This increment makes the backstop real. It is the **smallest coherent step** that does so: the hook
(the guarantee) plus the scope-setter that feeds it (you cannot ship one without the other — a hook
with no state to read, or state nothing reads, is a non-functional half), plus the integration that
keeps the normal loop friction-free (command wiring, CLAUDE.md, `.gitignore`) and its tests (P1).

## Discovery result (P6 — verified by live reads this run)

- **Spec hash** `11cd9ad5…d969` is identical to the pin in `features/structured-findings/PLAN.md:3`.
  The spec has **not** drifted; `/build` re-checks this (fix #4).
- **The git-status snapshot at session start was stale.** `enforce-writes-scope.cjs`, its test, a root
  `PLAN.md`, and `features/writes-scope/` content **no longer exist** (a prior attempt was reverted;
  only an empty `features/writes-scope/` directory remains). This increment is greenfield.
- **fix #2 hook (`protect-trusted-paths.cjs`), live:** `DEFAULT_PROTECTED = [CONSTITUTION, ARCHITECTURE,
THREAT-MODEL, LIMITS].md + CODEOWNERS` (+ `PHARN_PROTECTED` extras). On a hit it dual-emits — a
  `hookSpecificOutput` deny JSON **and** the reason on stderr **and** `process.exit(2)`. It does not
  read any scope. **It must stay byte-unchanged** (fix #7 is additive).
- **Wiring (`.claude/settings.json`), live:** one PreToolUse entry, matcher `Write|Edit|MultiEdit`,
  one hook `node .claude/hooks/protect-trusted-paths.cjs`. fix #7 wires a **second** hook command into
  the **same** matcher's `hooks[]` so both run on every write.
- **Commands, live:** exactly three (`plan.md`, `build.md`, `review.md`); **no** separate "bootstrap"
  set — the args' "bootstrap /plan-/build-/review" maps to these same three. Their `writes:`:
  `plan → ["PLAN.md"]`; `build → ["<files named in PLAN.md only>"]` (a **placeholder**, not a path);
  `review → ["REVIEW.md", "memory-bank/lessons-learned.md (gated)"]` (note the `(gated)` suffix).
- **`floor/validate.mjs`, live:** walks only `*.md`, excludes `.claude/commands/` and `floor/`. A new
  `.cjs` hook/setter/test is **invisible** to it — **capability count stays `1`** (`trust-fence`).
  Confirmed: `pharn-contracts` (finding-shape, eval-format — no `role:`) + `pharn-review/trust-fence`
  are all that exist.
- **`package.json` test script, live:** `node --test "**/*.test.mjs" "**/*.test.cjs" ".claude/**/*.test.mjs" ".claude/**/*.test.cjs"`
  — already globs `.claude/**/*.test.cjs`, so the new test is auto-discovered. **No package.json edit.**
- **`.gitignore`, live:** `node_modules/` + `.claude/settings.local.json` only. **`.pharn/` is absent —
  must be added** (runtime state, not committed).
- **`.prettierignore`, live:** covers `.claude/settings.json` (the JSON edit is not format-gated) and
  `floor/test-fixtures`; the new `.cjs` files **are** prettier/eslint-checked (`/build` writes them
  clean).
- **Safe-set globs map cleanly to live state:** `pharn-*/**` covers the two present modules and any
  future one; `features/`, `memory-bank/`, `floor/`, `.claude/`, `.pharn/` all resolve as intended.
  **No repo-specific glob adjustment is needed** (one of the args' HALT triggers — resolved by
  discovery, no halt).
- **No reason the scope-setter cannot be a command's first step** (another HALT trigger — not fired):
  each command has a clear first action; the setter is a plain `node` invocation (run via Bash, not the
  Write tool, so the PreToolUse Write-matcher never intercepts it); other `.pharn/**` (not
  `writes-scope.json`) is the bootstrap exception for the Write tool. No chicken-and-egg.

## The mechanism (the crux)

A stateless PreToolUse hook cannot know which Capability is active, so the active scope is written to a
file the hook reads:

1. **Scope-setter** (`.claude/hooks/set-writes-scope.cjs`, deterministic, stdlib): reads a declared
   `writes:` and writes `.pharn/writes-scope.json` =
   `{ "scope": ["<path-or-glob>", …], "set_by": "<name>", "set_at": "<iso8601>" }`.
   - **Mode A** `--from-frontmatter <file.md>`: scope = that file's `writes:` array, with placeholder
     entries (any containing `<`/`>`) dropped and a trailing `(…)` annotation (e.g. `(gated)`)
     stripped. Used by `/plan` and `/review`. If the result is **empty** after filtering, it exits
     non-zero with "no concrete `writes:` paths — use `--from-plan`" (never silently writes an empty,
     deny-almost-everything scope).
   - **Mode B** `--from-plan <PLAN.md>`: scope = the back-tick-quoted paths under the `## Files`
     heading. Used by `/build`, whose `writes:` is the placeholder `<files named in PLAN.md only>`.
2. **Hook** (`.claude/hooks/enforce-writes-scope.cjs`, PreToolUse, deterministic, stdlib): for each
   write path it normalizes to a repo-root-relative path (`path.relative(cwd, resolve(cwd, p))`; a path
   escaping the root → DENY) and decides by **glob membership only** (no LLM, no free text):
   - `.pharn/**` (except `.pharn/writes-scope.json`) → **ALLOW unconditionally** (bootstrap for other
     runtime files under `.pharn/`).
   - `.pharn/writes-scope.json` → **DENY on the Write tool** (exit 2) always — scope state is
     **setter-only**: `set-writes-scope.cjs` runs via Bash/fs (not PreToolUse), so Step 0 can still
     write it while the active writer cannot self-escalate by editing the gate's input.
   - else read `.pharn/writes-scope.json`: **present & valid** → allow-set = `scope[]` (authoritative —
     module dirs are **not** auto-added); **absent or unparseable** → allow-set = the **default-safe-set**.
   - path matches any glob in the allow-set → ALLOW (exit 0); otherwise DENY (exit 2) with the
     instruction-shaped message below. fix #2 paths are **not** special-cased here — the fix #2 hook
     denies them in parallel (see Composition).
3. **Glob semantics** (tiny stdlib glob→regex): `**` spans any segments (incl. `/`), `*` matches within
   one segment (no `/`), everything else literal. A bare file path (`PLAN.md`,
   `memory-bank/lessons-learned.md`) matches only itself.

### Default-safe-set (fail-closed allow-list when no scope file exists)

An **allow-list** — anything not on it is denied (fail-closed), so the sensitive zones need no explicit
blocklist:

- `.pharn/**` except `.pharn/writes-scope.json` (bootstrap for other runtime files; scope state is
  setter-only — see Hook above)
- `features/**` (process artifacts / scratch)
- `pharn-*/**` (capability modules — `pharn-contracts/core/pipeline/review/audits/stack-*/skills-*`;
  99% of loop writes)

Notable zones **denied** by default (not on the allow-list — blocking them is the point; an explicit
`writes:` declaration unlocks them): `memory-bank/**` (P2-gated lesson/pattern promotion;
poisoning is silent + cumulative — ARCHITECTURE §5), `floor/**` (the deterministic floor itself), and
`.claude/**` (commands **and** hooks — a capability writing here could disable fix #7). Plus everything
else not listed (root files, `.github/**`, …).

When a scope file **is** present, the scope it declares is **authoritative** for the non-`.pharn`
zones: `writes: ["memory-bank/lessons-learned.md"]` unlocks exactly that file (the explicit declaration
the block exists to force), while `writes: ["features/foo/**"]` denies `pharn-core/x.md` (proving a set
scope replaces, not merely augments, the safe-set).

### Composition with fix #2 (additive, never replacing)

Both hooks run on every `Write|Edit|MultiEdit` (same matcher `hooks[]`). A write is allowed only if
**both** pass; a deny from **either** blocks. fix #7 is scope-only and deliberately does **not**
re-implement the trusted-doc denylist — so even if a (poisoned) scope declared `["ARCHITECTURE.md"]`,
fix #7 would allow it but **fix #2 still denies it**. The trusted docs + CODEOWNERS therefore stay
denied **regardless of scope**. This makes fix #2 the hard backstop fix #7 cannot weaken.

> **Composition dependency to verify at build (P0/P6):** this rests on Claude Code running **all**
> hooks in a matcher's `hooks[]` and blocking the tool call if **any** denies. That is the documented
> PreToolUse behavior, but `/build` must confirm it before claiming the composition guarantee. If it
> were ever "first hook only," ordering would matter and fix #7 would need to also carry the fix #2
> denylist. Named here, not presumed.

### The hook's deny message (instruction, not just "denied")

The message is the only thing the agent sees on a blocked write, so it must say what is missing and how
to fix it. Emitted on stderr **and** as a `hookSpecificOutput` deny JSON (mirroring
`protect-trusted-paths.cjs`), with `exit 2`. Exact text `/build` writes (must contain the strings
`writes-scope guard` and `FIX` for the test):

```text
PHARN floor — write blocked (writes-scope guard, fix #7)
  Blocked path : <path>
  Active scope : <scope list from .pharn/writes-scope.json, or "(none set — fail-closed default-safe-set active)">
WHY: a Capability/command may only write paths it declared in `writes:` (P0 floor, ARCHITECTURE §7 — not advisory).
FIX (pick one):
  • If this path SHOULD be written by the current work: add it to the active Capability's `writes:`, then re-run the scope-setter so .pharn/writes-scope.json reflects it.
  • If running a command (/build, /review, …): scope is set in the command's FIRST step. If "(none set)", that step did not run — restart the command from the top; do not write ad hoc.
  • If this is a one-off outside any Capability: it is intentionally blocked (fail-closed). Declare a scope, or do the write by hand outside the agent.
Scope file: .pharn/writes-scope.json (set by a command's first step; delete to reset; absence = fail-closed default-safe-set).
```

## Files

Written by `/build` (the planner writes only this `PLAN.md`):

- `.claude/hooks/enforce-writes-scope.cjs` — **NEW.** The fix #7 pre-write hook (above). Floor/hooks
  layer (ARCHITECTURE §2/§3.3); **no `role:`** → not a Capability.
- `.claude/hooks/set-writes-scope.cjs` — **NEW.** The deterministic scope-setter (Modes A/B above).
  Floor/hooks; **no `role:`**.
- `.claude/hooks/enforce-writes-scope.test.cjs` — **NEW.** `node --test` suite covering hook **and**
  setter via subprocess spawns (assert `r.status` + message), auto-discovered by the package.json glob.
  Mirrors `protect-trusted-paths.test.cjs` / `check-structural.test.mjs`. (P1.)
- `.claude/settings.json` — **EDIT.** Append the second hook command to the existing PreToolUse
  `Write|Edit|MultiEdit` matcher's `hooks[]`. (Prettier-ignored — no format gate.)
- `.claude/commands/plan.md` — **EDIT.** Add a "Step 0 — set the writes-scope (fix #7)":
  `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/plan.md` before any write.
- `.claude/commands/build.md` — **EDIT.** Add "Step 0":
  `node .claude/hooks/set-writes-scope.cjs --from-plan <active PLAN.md>` before any write — the path of
  the plan being built (root `PLAN.md`, or its archived `features/<name>/PLAN.md`). **This increment's
  plan lives at `features/writes-scope/PLAN.md`.**
- `.claude/commands/review.md` — **EDIT.** Add "Step 0":
  `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/review.md` before any write.
- `CLAUDE.md` — **EDIT.** Add `## Writes-scope (fix #7 — fail-closed)` (set scope BEFORE writing; a
  block is fixed by **declaring** the path in `writes:` and re-running the setter — **never** by
  bypassing the hook). CLAUDE.md is agent-editable (not in the protected list).
- `.gitignore` — **EDIT.** Add `.pharn/`.

Explicitly **not** touched (one axis, P3/P7):

- `.claude/hooks/protect-trusted-paths.cjs` + its test — **byte-unchanged** (fix #2 intact).
- The four trusted docs — human-only, hook-protected; **no edit needed** (see "Doc report" — the hook
  makes their existing wording true).
- `floor/validate.mjs` — unchanged; the new `.cjs` files are invisible to it; capability count stays 1.
- `pharn-contracts/` — **no new schema.** `.pharn/writes-scope.json` is floor-internal **ephemeral**
  state (gitignored), not a declared ARCHITECTURE §4 contract; its shape is documented inline in the
  setter (writer) and hook (reader), the matched fix #7 pair. Adding a contract schema would be a
  speculative addition (P7) and is deferred until a second consumer exists.
- `package.json` — unchanged (the test glob already covers `.claude/**/*.test.cjs`).

## Contracts satisfied (P4 — cite, do not restate)

- **ARCHITECTURE §3.1** (`writes:` "ENFORCED by the pre-write hook (§5, fix #7)") — this increment makes
  that clause **true**. Cited as the declaration surface; the hook is the enforcement.
- **ARCHITECTURE §7** (pre-write hosts the "`writes`-scope guard (fix #7)") + **§2** (floor primitive
  #1: "pre-write blocks … out-of-`writes`-scope paths") — this **is** that primitive.
- **ARCHITECTURE §5** (memory-bank promotion is a "gated write"; "the floor gates the write") — fix #7
  is the mechanism that makes `memory-bank/**` blocked-by-default, requiring an explicit declaration.
- **THREAT-MODEL §3 / §4 item 7** (`reads`/`writes` "declared not enforced" → "`writes` is enforced by
  the pre-write hook … Closed for writes") — closed here for writes; `reads` stays a declaration (its
  teeth are on the write side), unchanged.

## Evals to write (P1)

This is executable floor code, so P1 is satisfied by a `node --test` suite (not capability
`evals/cases`). Each case spawns the script as a subprocess and asserts on exit status + message:

- **Hook, no scope file:** `pharn-review/foo.md` → exit 0 (safe-set module); `features/foo/bar.md` →
  exit 0; `memory-bank/x.md` → exit 2; `floor/x.mjs` → exit 2; `.claude/x` → exit 2;
  `.pharn/writes-scope.json` → exit 2 (setter-only; not bootstrap via Write); `.pharn/other` → exit 0.
- **Hook, root-normalization (out-of-repo):** `../outside.md` → exit 2; `../../outside.md` → exit 2;
  `/tmp/outside.md` (absolute, outside cwd) → exit 2 — `toRel()` returns null; deny carries
  `writes-scope guard` and the original blocked path (not a scope miss).
- **Hook, scope present (authoritative):** `scope:["features/foo/**"]` → inside → exit 0; `pharn-core/x.md`
  (outside) → exit 2 (proves authoritative, not additive).
- **Hook, explicit unlock of a sensitive zone:** `scope:["memory-bank/lessons-learned.md"]` →
  `memory-bank/lessons-learned.md` → exit 0; `memory-bank/other.md` → exit 2 (declaration is tight).
- **Hook, scope-state not self-writable:** any scope (including one naming `.pharn/writes-scope.json`) +
  `.pharn/writes-scope.json` via Write → exit 2; `.pharn/other` → exit 0 (other bootstrap paths intact).
- **Composition with fix #2:** `protect-trusted-paths.cjs` + `ARCHITECTURE.md` → exit 2 (fix #2 intact,
  scope-independent); and `enforce-writes-scope.cjs` + `scope:["ARCHITECTURE.md"]` + `ARCHITECTURE.md`
  → exit 0 — documenting that fix #7 is scope-only and **fix #2 is the trusted-doc backstop** (hence
  both are wired). The composed deny is provided by fix #2.
- **Deny message:** a denied case's stderr contains `writes-scope guard` **and** `FIX`, plus the blocked
  path and the active-scope line.
- **Setter Mode A:** a fixture md with `writes: ["REVIEW.md", "memory-bank/lessons-learned.md (gated)"]`
  → `.pharn/writes-scope.json` scope = `["REVIEW.md","memory-bank/lessons-learned.md"]` (`(gated)`
  stripped), with `set_by`/`set_at` present.
- **Setter Mode A, placeholder-only:** `writes: ["<files named in PLAN.md only>"]` → exits non-zero
  with a "use --from-plan" message (never writes an empty authoritative scope).
- **Setter Mode B:** a fixture `PLAN.md` with a `## Files` block → scope = the back-tick-quoted paths.
- **Integration:** setter Mode A sets `scope:["memory-bank/lessons-learned.md"]`, then the hook allows
  that path and denies `pharn-core/x.md` (setter + hook end-to-end, in a temp cwd).

Tests run the scripts with `cwd` = a per-test temp dir (so the real `.pharn/` is never touched) and
assert on `r.status` (not stdout-grep alone), mirroring `check-structural.test.mjs`.

## Guarantee audit (P0)

- **"A write outside the active scope is blocked"** → floor: **hook** (`enforce-writes-scope.cjs`,
  exit 2). GUARANTEED.
- **"With no scope set, the sensitive zones (`memory-bank`/`floor`/`.claude`) are denied"** → floor:
  **hook** (fail-closed allow-list; deny on miss). GUARANTEED.
- **"Scope is derived deterministically from `writes:` / `## Files` — no model picks it"** → floor:
  **enum/regex parse** (the setter is a pure parser; no LLM, no network). GUARANTEED deterministic.
- **"fix #7 composes with fix #2; trusted docs stay denied regardless of scope"** → floor: **two hooks,
  any-deny-blocks** — GUARANTEED **conditional on** the Claude Code multi-hook semantics flagged above
  (verify at build). The fix #2 half is independently guaranteed (its hook is unchanged).
- **The deny message's helpfulness** → **advisory** (UX/instruction quality). The `exit 2` is the floor
  fact; the wording is not a guarantee.
- **Transition this lands:** after this increment, `writes:` is genuinely floor-enforced — the
  ARCHITECTURE §3.1/§7/§2 "enforced by the pre-write hook" wording becomes **true**, and the 3a emission
  backstop (a) ("the pre-write `writes:` hook enforces the path") becomes **real**, not presumed.
- **Residual, named honestly (P0/P7):** fix #7 blocks **ad-hoc / injected one-off** writes outside the
  declared scope and forces an explicit declaration to reach a sensitive zone. Write-tool
  self-escalation via `.pharn/writes-scope.json` is **closed** (that path is setter-only). The remaining
  widen path is the setter reading an untrusted `writes:` / `PLAN.md` — bounded by fix #2 (the trusted
  docs + CODEOWNERS remain denied no matter what scope is set) and by the normal loop pointing the
  setter only at command frontmatter / an approved plan. It is **safe-by-default**, not open: a command
  that forgets Step 0 falls back to the default-safe-set, which still denies the sensitive zones.

## Trust audit (P2)

- **Inputs:** the command files and the four trusted docs are `trusted`. `PLAN.md` (read by setter
  Mode B) and `.pharn/writes-scope.json` (read by the hook) are agent-produced; treat them as
  **untrusted state**.
- **Taint cannot steer the guaranteed decision.** The hook's allow/deny rests **only** on
  path/glob **membership** (enum/regex) — never on any free text. A poisoned scope file can at most
  **widen** scope **within the non-protected zones**; it can never unlock the trusted docs/CODEOWNERS
  (fix #2 composes) and cannot inject an instruction (the hook reads `scope[]` as data, matches, and
  exits). This is the §8 pattern applied to the floor: the guaranteed decision is computed from
  enum-gated/path data, not from a tainted field.
- `.pharn/` is gitignored runtime state — **not** a cross-clone persistence vector (unlike memory-bank,
  whose poisoning is exactly why fix #7 makes it blocked-by-default).

## Determinism audit (P5)

- Every branch is a **membership test**: the hook on path-glob membership; the setter on
  frontmatter/`## Files` parsing. **No LLM classification** anywhere.
- The terminal behavior is **DENY (fail-closed)** — the safe membership outcome — and the deny message
  tells the human/agent to **declare the path and re-run the setter** (i.e. "ask"/act), never to guess
  or bypass. No fallback chain ends in a guess.

## Doc report (trusted docs are human-only — reported, never edited)

After implementing fix #7, **no trusted-doc wording needs changing** — the existing claims become
**true**: `ARCHITECTURE.md:73` (`writes:` enforced by the pre-write hook), §2:40-41 (pre-write blocks
out-of-`writes`-scope paths), §7:228-229 (the writes-scope guard, fix #7), and `THREAT-MODEL.md` §4
item 7 (writes "Closed"). If the human disagrees, the alternative F2 resolution (soften §3.1 to
"spec'd-but-unimplemented") is moot once the hook lands. **Memory hygiene (post-build, not a product
file):** the memory note `writes-scope-guard-fix7-unimplemented.md` ("treat writes:-scope as advisory")
becomes stale and should be updated/retired once this lands.

## Resolutions (approved 2026-06-25, human via the halt form)

Both design forks are resolved to the recommended options — already reflected in the Files and
Mechanism sections above, so no substantive change to the plan. No `## Open questions` block remains,
so the `/build` gate (Step 1.1) is satisfied.

1. **Hook structure → sibling hook.** A new `.claude/hooks/enforce-writes-scope.cjs` wired into the
   same PreToolUse matrix; `protect-trusted-paths.cjs` stays byte-unchanged. fix #2 (static protected
   paths) and fix #7 (dynamic scope) change for different reasons → two files (P3, one axis); both run,
   a write must pass both. Extending the fix #2 hook was rejected (two axes in one file; mutates a live
   guarantee's hook + tests).
2. **`/build` scope source → parse `PLAN.md` `## Files` (Mode B).** `/build`'s `writes:` is a
   placeholder, so only a PLAN-derived scope can (a) let `/build` build **sensitive-zone** increments
   under the hook (this very increment writes `.claude/**` + root files, which the default-safe-set
   denies) and (b) make `build.md`'s existing "writes only the files the plan names" claim **true**.
   Default-safe-set-only was rejected (cannot reach sensitive zones; leaves the specific-file claim
   unbacked).

## Approval

**Approved as written — 2026-06-25** (human, via the explicit accept/deny halt form). Both forks are
resolved above; no unresolved open-questions / HALT block remains. `/build` may now execute this plan
(it re-checks `spec_content_hash` against `ARCHITECTURE.md` and refuses on drift, fix #4).
