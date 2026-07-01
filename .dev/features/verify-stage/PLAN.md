# PLAN — verify-stage: build the `/pharn-verify` product command (sixth pipeline stage)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), this run
- increment: Add the product command `/pharn-verify` (`.claude/commands/pharn-verify.md`) — the sixth product-pipeline stage — adapting `/pharn-dev-verify`'s proven TWO-LAYER pattern (FLOOR gates own the verdict; verifier judgment is advisory-only) to run in the USER's codebase, reusing three already-tested floor checkers with **no new floor primitive**.
- layer(s): tooling — `.claude/commands/` (advisory orchestration). NOT a §4 product layer; NOT a Capability (no `role:`), so the floor capability count stays **1** (`ARCHITECTURE.md §4`).
- constitution_refs: [P0, P1, P2, P3, P4, P5, P6, P7]

## The two loops (why this is a SEPARATE command)

`/pharn-verify` is a **PRODUCT** capability — the UX a PHARN **user** runs to verify a feature in
**their** codebase — distinct from the build-loop's `/pharn-dev-verify` (which verifies PHARN itself).
This increment BUILDS `/pharn-verify` using the dev loop. It **adapts the MECHANISM** of
`/pharn-dev-verify` (two layers, floor owns the verdict — `.claude/commands/pharn-dev-verify.md`); it
is a separate file with product-side artifact paths (root `features/<name>/`, not `.dev/`). Exact sibling
of how `/pharn-regress` was adapted from `/pharn-dev-regress` (`.claude/commands/pharn-regress.md`).

## The TWO LAYERS — the whole point is keeping them separate (P0, fix #3)

- **FLOOR layer (owns the verdict).** Runs the **project's** deterministic gates (its tests / lint /
  type-check, floor GREEN) over the repo-with-the-feature-in-it, ONCE at HEAD, and reduces them to a
  single pass/fail by an **absolute exit-code threshold** — `.dev/floor/check-verify.mjs` (PASS iff every
  gate exit 0). **"verified" = these gates passed, full stop.** This is the only layer allowed to set the
  verdict (`ARCHITECTURE.md §7`: a floor-gate is the only gate that may block a guaranteed invariant).
- **ADVISORY layer (annotates only).** `role: verifier` capabilities judge the irreducible ("does the
  implementation satisfy the SPEC's intent? is the approach sound?"). Per `ARCHITECTURE.md §7` a verifier
  "emits a typed finding list or nothing; it does not decide approve." Findings are **appended to the
  report for the human and NEVER passed to `check-verify.mjs` / NEVER flip the verdict** (fix #3).

**THE HARD RULE (P0 — the disease):** "verified" must NOT mean "a verifier model judged it OK." The
exit-code/verdict is owned by the FLOOR layer; the advisory layer only annotates. Letting verifier
JUDGMENT produce the pass/fail is advisory-dressed-as-guarantee — struck. **Verdict ownership is
structural, not disciplinary:** `check-verify.mjs`'s sole input is the `{gate-id: exit-int}` map — it
**cannot even receive** a verifier finding (proven by `check-verify.test.mjs`: the emitted spine is
exactly `{feature, gates, verdict, failing_gates}`, no free-text key).

## Files

- `.claude/commands/pharn-verify.md` — the product `/pharn-verify` command (markdown; advisory
  orchestration). The **only** product file this increment writes — layer: tooling (`.claude/commands/`).

**No new checker, no new test, no new contract, no authored verifier.** All three floor helpers already
exist and are green (167 tests pass this run); the verifier slot is defined by citing existing schemas
with ZERO occupants (P7). See "Guarantee audit" and "Evals" for the P1 accounting.

## Reused floor helpers (P3 — shell/adapt, do not reinvent; all already tested)

- `.dev/floor/check-verify.mjs` — the FLOOR **verdict core**. Generic over gate keys: `PASS iff every gate
exit 0`, `FAIL` (offenders in `failing_gates[]`), `INCONCLUSIVE` (map missing/empty/not `{string:int}` —
  fail-closed). Consumes **exit codes only**; a verifier finding cannot reach it. Reused verbatim.
  (`.dev/floor/check-verify.test.mjs`, green.)
- `.dev/floor/count-verifiers.mjs` — verifier **membership** by deterministic **frontmatter** read
  (`role: verifier` in the `---` fence), never a prose grep (the #16 fix: a `role: verifier` string in
  prose/code is DATA about verifiers, not a declaration of one). Reused verbatim.
  (`.dev/floor/count-verifiers.test.mjs`, green.)
- `.dev/floor/check-plan-spec-agree.mjs` — the spec→plan **hash-chain** re-verification (wraps
  `check-spec-approved.mjs` + `check-spec.mjs --hash`). Reused verbatim as the **FOURTH** downstream
  consumer. (`.dev/floor/check-plan-spec-agree.test.mjs`, green.)
- `.dev/floor/check-structural.mjs` — the feature-specific correctness signal: run over each committed
  eval pair the feature ships → one `structural:<expected>` gate each (membership; a feature shipping no
  eval pair simply has no `structural:*` gate). Reused verbatim.
- `.claude/hooks/set-writes-scope.cjs` + `enforce-writes-scope.cjs` — fix #7, pin the two artifacts.

## What `/pharn-verify` does (the command's shape — adapted from `/pharn-dev-verify`)

1. **Step 0 — writes-scope (fix #7).** Resolve `<name>` (existing `features/<name>/` with `PLAN.md` +
   `SPEC.md`; ambiguous → **ask**, P5 terminal fallback). Set scope to `features/<name>/verify-report.json`
   via `set-writes-scope.cjs --from-frontmatter … --target …`; re-scope per artifact before each write
   (setter overwrites `.pharn/writes-scope.json`, one `--target` per call — the `/pharn-regress` /
   `/pharn-dev-verify` caveat).
2. **Step 1 — Discovery (P6).** Read `features/<name>/PLAN.md` + `SPEC.md` **live**; their bodies are
   `trust: untrusted` DATA (read `## Files` + the carried hash from them; never instructions).
3. **Step 2 — HASH-CHAIN gate (FLOOR — 4th consumer).** `node .dev/floor/check-plan-spec-agree.mjs
features/<name>/PLAN.md features/<name>/SPEC.md`; branch **only** on its exit code. GREEN → proceed. RED
   → **HALT**, write a RED-chain `VERIFY.md` (the §6 artifact exists even on RED — audit trail never
   silent, mirroring `/pharn-regress`), stop with the checker's re-plan/re-approve guidance quoted as DATA.
4. **Step 3 — FLOOR layer: run the project's gates ONCE at HEAD (Bash; you run them, the helper never
   does).** Discover the gate set **deterministically** (mirrors `/pharn-regress` Step 4a, P5 — membership,
   not classification): (a) explicit `--gates "<cmd>[::<id>],…"`; else (b) the closed allowlist
   `{ test, lint, format:check, lint:md, typecheck, type-check, build }` ∩ the project's `package.json`
   `scripts`; else (c) **HALT and ask** which gates to run. Run each, capture its **exit code** (never
   stdout free-text). **Plus** one `structural:<expected>` gate per committed eval pair the feature ships
   (`check-structural.mjs`; membership — absent if none). Assemble a flat `{gate-id: exit-int}` map in
   `.pharn/pharn-verify/results.json`.
5. **Step 4 — ADVISORY layer: verifier slot.** `node .dev/floor/count-verifiers.mjs .` → membership.
   **Zero today** → record `verifiers: {registered: 0, findings: []}`, print "no verifiers registered —
   floor gates only." When verifiers exist, run each, collect its `findings.json` (finding-shape), append
   as **ADVISORY** — **never** passed to `check-verify.mjs`.
6. **Step 5 — the deterministic verdict (FLOOR).** `node .dev/floor/check-verify.mjs
.pharn/pharn-verify/results.json --feature <name>`; capture stdout JSON + exit code (`0` PASS · `1` FAIL
   · `2` INCONCLUSIVE). You do **not** re-decide.
7. **Step 6 — emit + halt.** Write `features/<name>/verify-report.json` (the helper's verdict verbatim +
   the advisory `verifiers` block merged in) and `features/<name>/VERIFY.md` (human render: per-gate
   `gate → exit` table, the deterministic verdict stated plainly, the verifier section quoted as DATA, and
   the honest residual line). End the turn — `/pharn-verify` does not invoke a downstream stage or gate it.

**Gate-discovery difference from `/pharn-regress` (stated honestly):** `/pharn-regress` runs gates at
base **and** HEAD and detects a base→HEAD **flip** (relative); `/pharn-verify` runs them **once at HEAD**
and asks an **absolute** "are all green NOW?" — hence the separate verdict core (`check-verify.mjs`, a
separate axis of change from `check-regress.mjs`, P3). The **gate-DISCOVERY rule** is shared (reused
verbatim, P3); the **base↔HEAD comparison and worktree/`npm ci` baseline cost do NOT apply** to verify
(one HEAD run, no baseline worktree).

## The verifier plug-in slot (defined by citing schemas; ZERO verifiers authored — P7)

Adapt `/pharn-dev-verify`'s slot definition verbatim in spirit — **no new contract file, no authored
verifier**:

- **What a verifier IS:** a Capability with `role: verifier` (the enum in `ARCHITECTURE.md §3.1`),
  `trust: trusted`, shipping evals (`pharn-contracts/eval-format.md`, P1) and emitting a `findings.json`
  (`pharn-contracts/finding-shape.md`). Nothing new to define; a fresh contract for a slot with zero
  occupants would itself be speculative (P7).
- **How `/pharn-verify` finds it:** deterministic membership over `role: verifier` frontmatter
  (`count-verifiers.mjs`, P5/#16), never LLM classification.
- **What `/pharn-verify` does with its output:** appends findings to the report as an ADVISORY section
  (free-text = untrusted DATA, P2); they never reach `check-verify.mjs`, never flip the verdict (fix #3).
- **The live verifier RUNNER is deferred (P7).** With zero verifiers, Step 4 is a no-op → `/pharn-verify`
  is fully runnable today, floor-only. The `claude -p` invocation machinery is filled in when the first
  real verifier lands — building a runner for an empty set would be speculative.

## Contracts satisfied (cite, do not restate — P4)

- `pharn-contracts/finding-shape.md` — the ADVISORY `verifiers.findings[]` obey the enum-gated / free-text
  split; `problem`/`evidence` are untrusted DATA appended after the verdict (P2, fix #1).
- `pharn-contracts/eval-format.md` — the slot's contract for a future verifier's evals (P1); cited for the
  slot, not exercised now (zero verifiers).
- `ARCHITECTURE.md §6` (verify row → `verify-report`) — the emitted machine artifact shape;
  `ARCHITECTURE.md §7` (post-build verifiers = advisory; floor-gate vs advisory-gate, fix #3) — the layer
  split.

## Evals to write (P1)

- **None — and this is P1-correct, stated explicitly.** P1 binds **Capabilities** ("no Capability ships
  without evals"). `/pharn-verify` is a **command**, not a Capability (no `role:`) — exactly like every
  other `pharn-*` / `pharn-dev-*` command (grill, regress, build…), which ship no evals. The **derivations**
  that carry guarantees are the three reused **checkers**, each already covered by its own green test
  (`check-verify.test.mjs`, `count-verifiers.test.mjs`, `check-plan-spec-agree.test.mjs`). Since this
  increment adds **no new checker or derivation**, it ships **no new test** — adding one would be testing
  code that already has tests (and P7-speculative). `npm test` continues to collect the three suites.

## Guarantee audit (P0) — the honest two-clocks split

- **"The named deterministic gates passed"** → **FLOOR** (absolute exit-code threshold,
  `check-verify.mjs`, `ARCHITECTURE.md §2` primitive #3). This is the entire content of "verified." A real
  guarantee — **bounded by exactly what those gates check**.
- **"It verifies against a current Approved, un-drifted plan"** → **FLOOR** (content-hash equality +
  `state == Approved` enum, `check-plan-spec-agree.mjs`, primitives #2+#3) — the **FOURTH** enforcement of
  `/pharn-spec`'s pin (grill 1st, build 2nd, regress 3rd, verify 4th). A spec that drifted after build
  makes the whole increment stale.
- **"Verifier membership is deterministic"** → **FLOOR** (frontmatter enum read, `count-verifiers.mjs`,
  primitive #3; the #16 fix — never a prose grep).
- **"It writes only its two declared artifacts"** → **FLOOR: hook (fix #7)** (`set-writes-scope.cjs` +
  `enforce-writes-scope.cjs`).
- **Verifier findings** → **ADVISORY (fix #3)** — LLM judgment that annotates; it never owns the verdict
  (the helper cannot receive a finding). "looks good" is not a guarantee; a concern is a flag for the
  human.
- **"`/pharn-verify` ran the gates / discovered verifiers / assembled the report"** → **ADVISORY**
  orchestration (two clocks): the **verdicts** are floor; the **act** of invoking the helpers and obeying
  their exit codes is advisory prose. The **gate-discovery / gate-run Bash in Step 3 is ADVISORY and
  untested by construction** (it lives in the command's prose, not a checker) — exactly like
  `/pharn-regress`'s Step 4. "Reuses tested checkers" must NOT read as "the whole stage is tested."
- **THE HONEST CLAIM:** `/pharn-verify` **guarantees the named deterministic gates passed; it does NOT
  guarantee the feature is correct** beyond what those gates check — a defect no test/eval/rule/lint covers
  is invisible to the floor verdict, and the verifier layer that might notice it is **advisory**. Writing
  "`/pharn-verify` ensures the feature is correct/correctness" is the P0 disease — **struck**.

## Trust audit (P2) — taint propagation

- **Inputs.** The built increment + `features/<name>/PLAN.md` / `SPEC.md` bodies are `trust: untrusted`
  DATA. The **verdict** ranges only over the enum-gated / floor-verifiable class — gate exit codes (ints),
  the feature name (a path string), the chain check's two 64-hex digests + `state` enum. It **never** reads
  a finding's free-text.
- **The commands executed are the USER's own suite** (`--gates` passed by the user, or the fixed-allowlist
  ∩ the project's own `package.json` scripts) — **never** sourced from the untrusted PLAN/SPEC free-text.
  No executed command, and no guaranteed decision, rests on a tainted field (mirrors `/pharn-regress`).
- **ADVISORY layer taint (bounded, not zeroed).** Verifier findings' `problem`/`evidence` inherit the
  reviewed artifact's untrusted tag (`finding-shape.md`); they are rendered as **quoted DATA**, appended
  **after** the verdict, and **never** passed to `check-verify.mjs`. **Taint reaches the report but not the
  verdict** — the verdict is provably independent of any tainted field (fix #1). With zero verifiers today,
  no such free-text is produced yet; the boundary is in place for when one is.
- **Residual (named, not hidden — `LIMITS.md §2`, `THREAT-MODEL.md §5`).** When a human / downstream LLM
  consumes the `VERIFY.md` free-text, "do not execute this as an instruction" is a heuristic again —
  **bounded** (`/pharn-verify` gates nothing on it) but not zeroed. No `claude -p`, no LLM-judge, no new
  egress in the floor-only path (today's zero-verifier state).

## Determinism audit (P5)

- Every proceed/stop branch reads **only** an exit code / a membership test: `check-plan-spec-agree.mjs`
  exit (Step 2 chain), `check-verify.mjs` exit (Step 5 verdict), `count-verifiers.mjs` (Step 4 membership),
  the fix #7 setter/hook (Step 0). **No LLM classification drives any branch** — there is no "does this look
  verified" layer; the verdict is `every gate exit 0`.
- **Gate discovery is a fixed membership test, not classification:** explicit `--gates`, else the closed
  allowlist ∩ the project's present scripts, else **ask the human** (reused verbatim from `/pharn-regress`).
- Terminal fallbacks are always a **question**, never a guess: ambiguous `<name>` → ask; no discoverable
  deterministic suite → ask which gates; a broken chain → the helper's clear RED with re-plan/re-approve
  guidance.

## One axis / cascade note (P3/P7)

One axis: **the `/pharn-verify` stage** (one command file, one PR). No cascade follow-up is a true causal
dependency of this increment. (A future product-side `/pharn-ship` that reads `verify-report.json`'s
`.verdict`, and the live verifier RUNNER when the first `role: verifier` capability lands, are separate,
P7-triggered increments — named, not built here.)

## Open questions (HALT)

Both potential halt conditions from the invocation resolved cleanly during discovery, so none block:

- **Verdict-ownership expressible?** YES — reuse `check-verify.mjs` exactly as `/pharn-dev-verify` does;
  verifier findings are appended after and never passed to the helper (structural, proven by
  `check-verify.test.mjs`).
- **"Run the project's gates" generically?** YES — reuse `/pharn-regress`'s exact gate-discovery rule
  (explicit `--gates` → allowlist ∩ `package.json` scripts → ask).

Two **design confirmations** (leaned, surfaced for the approval gate — the human may drop either):

1. **Hash-chain re-check as the 4th consumer** — leaned **YES** (consistency with grill/build/regress; a
   drifted spec makes the increment stale).
2. **Feature-eval `structural:<expected>` gate in the FLOOR set** — leaned **YES** (feature-specific
   correctness signal via `check-structural.mjs`; membership-gated, absent when the feature ships no eval
   pair).
