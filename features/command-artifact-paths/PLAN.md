# PLAN — command artifact paths → `features/<name>/` (fix F1)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read live this run)
- increment: Align `/plan` and `/review` (plus one `build.md` prose line) so their declared `writes:`
  and write-step name the `features/<name>/` artifact path the workflow actually uses — so fix #7's
  now-enforced scope permits the real path instead of denying it. Command-doc alignment only; **no code
  change**.
- layer(s): `.claude/commands/` — advisory orchestration (ARCHITECTURE §7; excluded from
  `floor/validate.mjs` by design)
- constitution_refs: [P0, P3, P5, P6, P7]

## Why this increment (P7 — real trigger, recorded)

`features/writes-scope/REVIEW.md` **F1** (advisory, important), demonstrated **live** during that
review: fix #7 made `writes:` floor-enforced, but `/plan` and `/review` still declare **root** artifact
paths (`writes: ["PLAN.md"]`; `writes: ["REVIEW.md", …]`) while every artifact lives in
`features/<name>/` (`features/structured-findings/REVIEW.md`, `features/trust-fence/REVIEW.md`,
`features/writes-scope/{PLAN,REVIEW}.md`). So `/review`'s Step 0 scoped to root `REVIEW.md` and the
guard **denied** the conventional `features/writes-scope/REVIEW.md` — the reviewer had to reset to the
safe-set to write the review. It recurs every `/plan` and `/review` until the declarations match
reality. Human decision 2026-06-25: standardize on writing directly into `features/<name>/`. This is
L3's prescription ("a declarative field made load-bearing must be re-audited against actual usage")
applied.

## Discovery result (P6 — verified by live reads/tests this run)

- **Spec hash** `11cd9ad5…d969` — identical to `features/writes-scope/PLAN.md`'s pin; the spec has
  **not** drifted. `/build` re-checks this (fix #4).
- **The glob works with NO code change — verified empirically** (temp-dir spawn of the live hook, not
  reasoning). With scope `["features/**/PLAN.md", "features/**/REVIEW.md", "memory-bank/lessons-learned.md"]`:
  - `features/foo/PLAN.md`, `features/writes-scope/REVIEW.md`, `features/a/b/PLAN.md` (nested) →
    **allow** (exit 0).
  - root `PLAN.md`, root `REVIEW.md` → **deny** (exit 2) — root is no longer declared.
  - `memory-bank/lessons-learned.md` → **allow**; `memory-bank/other.md` → **deny** (tight).
  - `features/foo/scratch.md` → **deny** — the glob admits only `PLAN.md`/`REVIEW.md` under
    `features/`, i.e. **tighter** than the default-safe-set's `features/**`.
  - `set-writes-scope.cjs` Mode A keeps `features/**/PLAN.md` verbatim (`isConcrete`: no `<`/`>`;
    `clean()` leaves the glob). So the existing `globToRegExp` (`**`→`.*`) + setter already handle it.
- **`floor/validate.mjs` excludes `.claude/commands/`** (`EXCLUDE_SEGMENTS`, line 30). Command `.md`
  files are not walked → not floor-checked capabilities → **no `evals/cases` required**, and the
  capability count stays **1** (`trust-fence`). Confirmed by reading `validate.mjs` live.
- **No trusted-doc conflict.** `ARCHITECTURE.md:205` names the plan-stage artifact `PLAN.md` (a name +
  what it carries: `spec_id` + `spec_content_hash`) — **not** a directory; the file is still `PLAN.md`,
  now under `features/<name>/`. It remains true → **no edit, no report**. CONSTITUTION / THREAT-MODEL /
  LIMITS carry no `PLAN.md`/`REVIEW.md` location claim.
- **`build.md:32-33`** is the only other spot naming the artifact location: "root `PLAN.md`, or an
  archived `features/<name>/PLAN.md`". Its `writes:` is a placeholder (Mode B — scope from the plan's
  `## Files`), so behavior is unaffected; only the prose should drop the "root `PLAN.md`, or" now that
  plans live in `features/<name>/`. Same axis.
- **`CLAUDE.md` / `README.md`** mention `PLAN.md` only generically (flow diagrams, the `--from-plan`
  example) — no root-location claim. Left unchanged (editing them would be churn beyond this axis, P7).

## Files

Written by `/build` (the planner writes only this `PLAN.md`):

- `.claude/commands/plan.md` — **EDIT.** Frontmatter `writes: ["PLAN.md"]` → `["features/**/PLAN.md"]`;
  the "Your output is `PLAN.md`" line and the Step 3 "Write `PLAN.md`" instruction → write to
  `features/<name>/PLAN.md` (the increment's own folder; the planner picks `<name>`). Step 0 already
  reads this frontmatter, so it now auto-scopes `features/**/PLAN.md` and the planner writes there
  directly — no reset. Advisory command (floor-excluded).
- `.claude/commands/review.md` — **EDIT.** Frontmatter
  `writes: ["REVIEW.md", "memory-bank/lessons-learned.md (gated)"]` →
  `["features/**/REVIEW.md", "memory-bank/lessons-learned.md (gated)"]`; the "Write `REVIEW.md`" step →
  `features/<name>/REVIEW.md` (the increment under review). The gated `memory-bank` entry is unchanged.
- `.claude/commands/build.md` — **EDIT (prose only, same axis).** Simplify the Step 0 note "root
  `PLAN.md`, or an archived `features/<name>/PLAN.md`" → "`features/<name>/PLAN.md` (the plan named in
  the `/build` invocation)". No frontmatter/behavior change — Mode B still reads the plan's `## Files`.

Explicitly **not** touched (P3 one axis / P7 no speculation):

- All hooks + floor code (`enforce-writes-scope.cjs`, `set-writes-scope.cjs`, `validate.mjs`) —
  byte-unchanged; the glob already works (verified). A code change would be a second axis (an args HALT
  trigger — not fired; no gap found).
- The four trusted docs — no location-claim conflict (`ARCHITECTURE.md:205` stays true); human-only
  regardless.
- `enforce-writes-scope.test.cjs` — see the regression-test option at approval. Default: not in this
  increment.
- `CLAUDE.md` / `README.md` — generic `PLAN.md` mentions only; no edit.
- **F2** (setter `kind:`/`trust:` check) and **F3** (no wiring self-check) from the writes-scope
  review — deliberately deferred (P7: no real triggering failure; recorded residuals).

## Contracts satisfied (P4 — cite, do not restate)

- **ARCHITECTURE §7** (pre-write hosts the `writes`-scope guard, fix #7) — unchanged and still
  enforcing; this increment only corrects the advisory `writes:` declarations it reads, so the guard
  permits the path the workflow uses.
- **ARCHITECTURE §3.1** (`writes:` declared outputs) — the declaration now names the real output path.
- No `pharn-contracts` schema involved (command docs, not capabilities).

## Evals to write (P1)

- **None required.** `.claude/commands/` is excluded from `floor/validate.mjs` (verified live, line
  30), so command `.md` files are not floor-checked capabilities and carry no `evals/cases`. The
  behavior this increment depends on (the `features/**/<artifact>` glob) was verified empirically in
  discovery (8/8 hook cases + setter Mode A). Locking it with a regression test is offered as a scope
  option at approval (option B).

## Guarantee audit (P0)

- "Commands write into `features/<name>/`" → **advisory** (command orchestration; commands are advisory
  by ARCHITECTURE §7 and floor-excluded). No new guarantee.
- "A write outside the (now features-scoped) declaration is blocked" → floor: **the existing fix #7
  hook** (unchanged). This increment neither adds nor modifies the guarantee; it corrects the
  declaration the unchanged hook consumes. The scope actually becomes **tighter** (`features/**/PLAN.md`
  admits only `PLAN.md` under `features/`, vs the safe-set's `features/**`).
- No claim in this increment lacks a floor reduction or an `advisory` label.

## Trust audit (P2)

- **No new untrusted input.** The setter still reads only trusted command frontmatter (Mode A). The
  decision remains pure path/glob membership (no free text). **F2** — the setter's lack of a
  `kind:`/`trust:` gate — is **not** addressed here; it is a deferred residual with no real trigger
  (P7).

## Determinism audit (P5)

- The new `writes:` values are parsed deterministically (the glob is data; `globToRegExp` is a pure
  function). The planner/reviewer chooses the `<name>` folder, but the scope admits any
  `features/<name>/<artifact>` by membership — no LLM classification drives the gate. Terminal fallback
  unchanged (fail-closed DENY).

## Open questions (HALT)

**None.** Discovery resolved every fork: the glob is verified to work with no code change, commands are
floor-excluded (no evals), and no trusted-doc wording conflicts. One **scope option** (whether to also
land a glob regression test) is offered at approval rather than left unresolved.

## Note — where this PLAN.md was written

Written to `features/command-artifact-paths/PLAN.md` via the safe-set reset (the same F1 workaround the
reviewer used). After this increment lands, `/plan` writes `features/<name>/PLAN.md` **directly** (its
Step 0 scope becomes `features/**/PLAN.md`) — this is the last manual reset before the fix takes
effect.
