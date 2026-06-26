# PLAN — /verify stage (hard floor gates own the verdict; verifier judgment annotates, advisory)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches the regress/grill/pharn-eval pins (no drift)
- increment: build the `/verify` pipeline stage — `.claude/commands/verify.md` (advisory orchestration + the verifier plug-in **slot**) + `floor/check-verify.mjs` (the deterministic core: computes the pass/fail verdict from a gate→exit-code results map and emits the machine `verify-report`) + `floor/check-verify.test.mjs` (its hermetic proof). After `/build` (and after `/regress`), `/verify` answers "was the feature built **correctly**?" through **two cleanly-separated layers**: a **FLOOR layer** (the deterministic gates `npm test` / `node floor/validate.mjs .` / `node floor/check-structural.mjs` over the feature's committed evals / `npm run lint` — which **own the verdict**) and an **ADVISORY layer** (`role: verifier` capabilities — LLM judgment that **annotates only, never owns the verdict**, fix #3). Today **zero verifiers exist** (P7), so `/verify` runs the floor gates and reports "no verifiers registered." It emits a machine `verify-report.json` + a human `VERIFY.md`. **The verdict is a deterministic exit-code threshold (`check-verify.mjs`) — verifier JUDGMENT never flips it.**
- layer(s): `.claude/commands/` (advisory orchestration, like `/plan` `/build` `/review` `/grill` `/regress` `/pharn-eval`) **+** `floor/` (the guarantee — `check-verify.mjs` is floor/eval **infrastructure**, NOT a Capability, exactly like `floor/check-regress.mjs` / `floor/check-variance.mjs`). The floor (`floor/validate.mjs`) path-ignores **both** dirs, so the capability count stays **1**. # ARCHITECTURE.md §4
- constitution_refs: [P0, P1, P2, P3, P5, P6, P7]

---

## Step 0 — Discovery results (stated in the plan, as required; P6, live this run)

- **Floor is GREEN — 1 capability** (`node floor/validate.mjs .` → `FLOOR: GREEN — 1 capabilities checked in .`, run live). The 1 is `trust-fence`. A command under `.claude/commands/` **and** a helper under `floor/` are **both** path-ignored (`EXCLUDE_SEGMENTS` at `floor/validate.mjs:30` lists `${sep}.claude${sep}commands${sep}` and `${sep}floor${sep}`; the six existing commands carry no floor-counted `role:` and the count is 1; `check-structural.mjs` / `check-regress.mjs` / `check-variance.mjs` live in `floor/` and are uncounted) ⇒ building `/verify` keeps the count at **1**.
- **Spec hash matches** the live recompute and the most recent pins (`features/regress/PLAN.md:3`) → no drift; `/build` will re-verify (fix #4).
- **`verify` already lives in the spec** (so this implements a named stage, not invents one):
  - `ARCHITECTURE.md:199` + `:122` — pipeline spine `spec → plan → grill → build → regress → verify → ship` (also `README.md`, `CLAUDE.md`).
  - `ARCHITECTURE.md:209` — the stage's typed-artifact row: `| verify | verify-report | compliance per verifier |`. This plan's `verify-report.json` (machine) + `VERIFY.md` (human) **are** that verify-report (see "Spec alignment").
  - `ARCHITECTURE.md:231–233` (§7 post-build) — "verifiers (at verify)"; "A lens cannot 'decide approve' — it emits a typed finding list or nothing." A **verifier is the same**: it emits findings, it never decides the verdict. This is the spec basis for the advisory layer.
  - `ARCHITECTURE.md:234–241` (§7 fix #3) — **floor-gate** (verdict from actual content — the ONLY gate allowed to block a guaranteed invariant) vs **advisory-gate** (reads LLM judgment, never the sole basis). `/verify` **is** this split made into a stage.
- **`/regress` is the structural precedent** (now merged, `HEAD = 0b55f20`, "#11"). `/verify`'s FLOOR layer mirrors `/regress`'s deterministic core (run existing gates → capture exit codes → a tested Node helper computes the verdict → emit a machine report + human render). **`/verify` ADDS the advisory verifier layer `/regress` deliberately lacks** — that layer is what makes verify a distinct stage, and keeping it strictly subordinate to the floor verdict is the whole design.
- **Live grounding (P6):** working tree clean, on `main`, `HEAD = 0b55f20`; the **one committed eval-pair** the structural gate can re-check is `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔ `features/trust-fence/findings.json` (both verified present); npm scripts present (`test`, `lint`, `lint:md`, `format:check`, `check`); `check-structural` CLI = `node floor/check-structural.mjs <expected.json> <actual.json> [repoDir]`.
- **No `verify.md`, no `floor/check-verify*.mjs`, no `features/verify/` (beyond this plan), and zero `role: verifier` capabilities existed before this run** (clean slate; `grep -rl 'role: verifier'` → none).

---

## The design in one line (the split IS the increment — do not blur it)

> **"verified" = the named deterministic gates passed, full stop — NOT "a verifier model judged it OK."** The pass/fail exit code is owned by the **FLOOR layer** (`check-verify.mjs`, an exit-code threshold). The **ADVISORY layer** (verifiers) only *annotates* the report with concerns for the human; a verifier saying "looks good" is **not** a guarantee and a verifier raising a concern is a **flag, not a deterministic block** (fix #3, `ARCHITECTURE.md:234–241`). A plan that let verifier JUDGMENT produce the verdict would be **advisory-dressed-as-guarantee — the exact disease (P0)**. It does not.

---

## Files

> `## Files` is the build's writes-scope source (fix #7): `/build` runs `set-writes-scope.cjs --from-plan` over the back-tick paths below; they become the only writable paths (plus `.pharn/**`). `.claude/**` and `floor/**` are NOT in the fail-closed default-safe-set, so each must be listed here to be writable. Every path is a concrete literal.

- `floor/check-verify.mjs` — **NEW (the deterministic core — the FLOOR layer's verdict + the machine report emitter).** A non-LLM, stdlib-only program modeled on `floor/check-regress.mjs`'s `verdict` ("Floor/eval infrastructure — NOT a Capability; the floor capability count stays 1"). **Single mode** (verify has no inside/outside partition — it is an *absolute* "are all gates green now?", not a *relative* flip-detection like regress, so it is `regress.verdict` **minus** the base/head comparison; a separate file = a separate axis of change, P3):
  - **CLI:** `node floor/check-verify.mjs <results.json> --feature <name>`. `results.json` is a flat map `{ "<gate-id>": <exit-code int>, … }` the command assembles by running each FLOOR gate and recording `$?` (gate-ids: `"test"`, `"validate"`, `"lint"`, `"structural:<expected-path>"` per committed eval pair).
  - **Verdict (the floor reduction — `ARCHITECTURE.md §2` primitive #3, exit-code/enum threshold):** `PASS` **iff every** gate exit code `=== 0`; `FAIL` if **any** gate `!== 0` (the failing gate-ids are named in `failing_gates[]`). Pure integer equality over a `{string:int}` map — **no comparison to a baseline, no LLM**.
  - **Emits** the machine **verify-report spine** to stdout verbatim: `{ feature, gates: {<id>: <exit-int>}, verdict: "PASS"|"FAIL"|"INCONCLUSIVE", failing_gates: [<id>…] }`. **Exit:** `0` PASS · `1` FAIL · `2` **INCONCLUSIVE** (results map missing / empty / not a `{string:int}` map) — **fail-closed (P5), never a silent pass**, distinguishing "a gate failed" (exit 1) from "a gate did not run / malformed input" (exit 2) — which a bare shell `&&` chain cannot.
  - **It NEVER reads any verifier free-text.** The helper's input is **only** the gate→exit-code map (ints) + the feature name (a path string). The verdict is therefore **provably independent of any tainted field** (P2). The command appends the advisory `verifiers` block to the report *after* the helper has emitted the verdict — see `verify.md` Step 4.
  - **Trust (P2):** gate-ids, exit codes, and the feature name are produced by deterministic tools / path strings; read as string/int operands only — never eval'd, executed, or spawned. **No guaranteed decision rests on a tainted field.**
- `floor/check-verify.test.mjs` — **NEW (the hermetic proof — the "evals" of the helper).** `node --test` fixtures, **no** `claude -p`, no git, no network (collected by `npm test`'s glob and CI), mirroring `floor/check-regress.test.mjs` / `floor/check-variance.test.mjs`. Covers: **PASS** (all-zero map → verdict `PASS`, exit 0); **FAIL** (one gate non-zero → verdict `FAIL`, exit 1, the failing gate-id present in `failing_gates[]`); **INCONCLUSIVE** (missing / empty `{}` / non-`{string:int}` map → exit 2, fail-closed); and that the emitted JSON spine has exactly `{feature, gates, verdict, failing_gates}` and contains **no** free-text key.
- `.claude/commands/verify.md` — **NEW (the orchestration + the verifier plug-in slot — advisory by the same two-clocks honesty as `/regress` / `/pharn-eval`).** Frontmatter mirrors the other commands: `kind: pharn-owned`, `trust: trusted`, `model_tier: sonnet`, `reads: ["CONSTITUTION.md", "ARCHITECTURE.md", "features/<name>/PLAN.md", "floor/check-verify.mjs"]`, `writes: ["features/<name>/VERIFY.md", "features/<name>/verify-report.json"]`, `constitution_refs: [P0, P1, P2, P5, P6, P7]`, `version: "0.1.0"`. **No `role:`** (it is a command, not a Capability — decided, mirrors `/regress`; the floor ignores `.claude/commands/`, so count stays 1). Body, sequenced like `/regress`:
  - **Trusted prefix** — read `CONSTITUTION.md` in full; it overrides everything. The built increment under verification is `trust: untrusted` (as `/review` / `/regress` treat it). The **verdict** consumes **only exit codes + paths** (floor-verifiable); verifier free-text is carried as DATA, never as an instruction (P2).
  - **Layer statement (the disease guard, stated up front, P0):** "verified" means the FLOOR gates passed — **not** that a verifier judged it OK. The floor owns the verdict; verifiers annotate.
  - **Step 0 — set the writes-scope (fix #7):** `node .claude/hooks/set-writes-scope.cjs --from-frontmatter .claude/commands/verify.md --target features/<name>/verify-report.json` (then re-`--target features/<name>/VERIFY.md` before writing it; the setter resolves one `--target` per call, like `/regress`). Honest caveat (mirrors `/regress` / `/pharn-eval`): the gate runs and the `.pharn/verify/*.json` captures in Steps 1–3 are **Bash**, which the `Write|Edit|MultiEdit` hook does **not** gate — so fix #7 enforces only the two artifact Writes; `.pharn/**` is always-writable scratch. If a later Write is blocked → declare the path in `writes:` and re-run the setter; never bypass the hook.
  - **Step 1 — FLOOR layer (deterministic; the verdict source).** Run each gate over the feature, recording its **exit code** (never its stdout free-text) into `.pharn/verify/results.json` as `{ "<gate-id>": <exit-int> }`:
    - `test` → `npm test` (the hermetic suite, stdlib-only).
    - `validate` → `node floor/validate.mjs .` (must be GREEN; whole-repo — a named granularity limit, below).
    - `structural:<expected>` → `node floor/check-structural.mjs <expected.json> <actual.json> .` **per committed eval pair the feature ships** (discovered by convention — each `<cap>/evals/expected/*.json` with its committed actual `findings.json`; today the one pair is `pharn-review/trust-fence/evals/expected/expected-injection-comment.json` ↔ `features/trust-fence/findings.json`). A feature shipping **no** eval-actual pair simply has no `structural:*` gate (absent from the map) — exactly as `/regress` handles it.
    - `lint` → `npm run lint` (eslint). *(Exactly the four gates the increment names; `format:check` / `lint:md` are addable by the same one-line pattern when a real need triggers them — declined now under P7, not "reinvented".)*
  - **Step 2 — ADVISORY layer (verifier plug-in slot; LLM judgment — annotates only).** Discover verifier capabilities by **deterministic membership (P5)**: capabilities whose frontmatter declares `role: verifier` (the enum already in `ARCHITECTURE.md §3.1`). **Today the set is empty** ⇒ record `verifiers: { registered: 0, findings: [] }` and print **"no verifiers registered — floor gates only."** *(The slot is defined; **zero verifiers are authored (P7)** — see "The verifier plug-in slot".)* When verifiers exist, each is run over the feature artifacts and emits a `findings.json` (the `finding-shape.md` array) that is collected as **ADVISORY** — its findings are **appended to the report for the human, and NEVER passed to `check-verify.mjs` / NEVER allowed to flip the verdict** (fix #3; `ARCHITECTURE.md:232` — a verifier "emits a typed finding list or nothing," it does not "decide approve").
  - **Step 3 — the deterministic verdict (FLOOR; no LLM):** `node floor/check-verify.mjs .pharn/verify/results.json --feature <name>` — capture its **stdout JSON** and read its **exit code** (`0` PASS · `1` FAIL · `2` INCONCLUSIVE). The agent does **not** re-decide — a failed gate **is** a fail (the helper says so), and **no verifier finding changes this number**.
  - **Step 4 — emit both artifacts + halt.** Write `features/<name>/verify-report.json` = the helper's verdict JSON **with the advisory `verifiers` block merged in** (`{…helper spine…, verifiers: { registered: N, findings: [ …finding-shape… ] }}`) — the verdict field is the helper's verbatim, the `verifiers.findings[]` free-text is quoted DATA (P2), clearly an advisory section. Then re-scope and write `features/<name>/VERIFY.md` = a human render: the per-gate `gate → exit-code` table, the **deterministic verdict** stated plainly (`VERIFIED: floor gates PASS` / `VERIFY FAILS: gates {…} red` / `INCONCLUSIVE`), the verifier section (each finding quoted as DATA, or "no verifiers registered"), and the **honest residual line** — *"verified = the named gates passed; this is NOT a guarantee of correctness beyond what those gates check — verifier concerns are advisory help, not assurance."* **Never** write "verify ensures the feature is correct" (that is the disease, P0). Then **end the turn**; `/verify` does not invoke `/ship`.
- _(Runtime-only, not built here:)_ `features/<name>/VERIFY.md` and `features/<name>/verify-report.json` are `/verify`'s **outputs at run time**, declared in `verify.md`'s `writes:`; they are **not** `/build` deliverables (not listed above, so not in this increment's build scope).

### Explicitly **not** touched (declared NOT written — keeps them out of build scope)

- `ARCHITECTURE.md`, `CONSTITUTION.md`, `THREAT-MODEL.md`, `LIMITS.md` — human-only (hook-denied). No reconciliation needed (see "Spec alignment").
- `floor/validate.mjs`, `floor/check-structural.mjs`, `floor/check-regress.mjs`, `floor/check-variance.mjs`, the hooks, `package.json`, `eslint.config.mjs` / `.prettierrc.json` / `.markdownlint-cli2.jsonc`, `.github/workflows/*` — **unchanged**. `/verify` **reuses** every gate by invocation (`npm test`, `validate`, `check-structural`, `npm run lint`); it invents **no new check** and adds **no flag** to any existing checker (declined under P7).
- `.claude/commands/{plan,build,review,grill,regress,pharn-eval}.md` — **unchanged**.
- `pharn-contracts/*` — **cited, never edited** (P4). **No new contract file** is authored: a verifier is just a Capability with `role: verifier` (`ARCHITECTURE.md §3.1`) emitting `finding-shape.md` findings and shipping `eval-format.md` evals — defining a fresh contract for a slot with **zero occupants** would itself be speculative (P7).
- **No verifier capability is authored** (`pharn-*/**`) — the slot is defined; occupants are deferred to a real triggering need (P7).

---

## The verifier plug-in slot (defined now; ZERO verifiers authored — P7)

The slot is the **contract for how a verifier plugs in**, expressed by citing existing schemas (P4 — cite, don't restate), with **no new file** and **no authored verifier**:

- **What a verifier IS:** a Capability with `role: verifier` (the enum in `ARCHITECTURE.md §3.1`), `trust: trusted`, shipping evals (`eval-format.md`, P1) and emitting a `findings.json` (`finding-shape.md` — the enum-gated / free-text split). Nothing new to define.
- **How `/verify` finds it:** deterministic **membership** over `role: verifier` frontmatter (P5) — never LLM classification. (The concrete home — likely under `pharn-review/` or `pharn-pipeline/` per `ARCHITECTURE.md §4` — **settles when the first real verifier is triggered**; pinning a directory for zero occupants now is the speculation P7 forbids.)
- **What `/verify` does with its output:** appends the verifier's findings to `verify-report.json` / `VERIFY.md` as an **ADVISORY** section (free-text = untrusted DATA, P2). The findings **never** reach `check-verify.mjs` and **never** flip the verdict (fix #3; `ARCHITECTURE.md:232`).
- **The live verifier RUNNER is deferred (P7).** With zero verifiers, the command's Step 2 is a no-op (membership returns ∅ → "no verifiers registered"), so `/verify` is **fully runnable today, floor-only**. The detailed live-invocation machinery (a `claude -p` framing like `/pharn-eval`'s) is filled in **when the first verifier lands** — building an invocation runner for an empty set would be speculative.

---

## Contracts satisfied

- `ARCHITECTURE.md §2:36–45` (the floor — primitive #3, enum/regex/exit-code membership) — `check-verify.mjs`'s verdict is a **deterministic exit-code threshold** (`every gate === 0`), the canonical floor primitive. Cited, not restated (P4).
- `ARCHITECTURE.md §6:209` (the `verify | verify-report | compliance per verifier` row) — `verify-report.json` **is** that verify-report (machine), `VERIFY.md` its human render. No new artifact type invented; `.json` matches the machine siblings (`build-summary.json`, `regression-report.json`).
- `ARCHITECTURE.md §7:231–233` (post-build verifiers; "emits a typed finding list or nothing") — the verifier layer emits findings and **never decides the verdict**; the floor does.
- `ARCHITECTURE.md §7:234–241` (fix #3, the two gate kinds) — `/verify`'s verdict is a **floor-gate** (verdict from actual content — gate exit codes, not LLM judgment); the verifier layer is the **advisory-gate** (LLM judgment, never the sole basis for a guaranteed block). This stage **is** the fix-#3 split.
- `pharn-contracts/finding-shape.md` — verifier findings (when any exist) conform to the enum-gated / free-text object; the verdict reads **only** enum-gated/floor-verifiable inputs (exit codes), never the free-text (P2). Cited, never restated (P4).
- `pharn-contracts/eval-format.md` — a verifier ships evals in the `{case, expected}` `structural[] / semantic[]` shape; `check-verify.mjs` ships its proof as a hermetic `*.test.mjs` (the floor-helper analog, like `check-regress`). Cited, not restated (P4).
- `floor/check-regress.mjs` (precedent, by **pattern**, not import) — same class: floor/eval infrastructure, NOT a Capability, deterministic over a captured results map, exit `0/1/2`, hermetic `*.test.mjs`. `/verify`'s helper is its `verdict` **minus** the base/head comparison. (Pattern reuse, no `reads:` edge; P3.)

---

## Evals to write (P1) — binds the helper's test, not a Capability

`/verify` is a **command** and `check-verify.mjs` a **floor helper** — neither is a Capability (no floor-counted `role:`; both in floor-ignored dirs), so P1's "no Capability ships without evals" does not bind them *as Capabilities* (as `/plan` … `/regress` ship no eval dirs and `check-structural` / `check-regress` / `check-variance` ship a `*.test.mjs`). The testable surface is the helper, and it ships its proof in the same step (the spirit of P1):

- `floor/check-verify.test.mjs` (hermetic) → `node --test` proves the verdict: **PASS** all-zero→0; **FAIL** one gate non-zero→1 with the failing gate-id in `failing_gates[]`; **INCONCLUSIVE** missing/empty/malformed→2; and the emitted spine carries **no** free-text key (the verdict is structurally exit-codes-only).
- **Floor check after build:** `node floor/validate.mjs .` must still print `GREEN — 1 capabilities` (count unchanged — both new files are floor-ignored).
- **Dogfood verification:** after `/build`, run `/verify` on a real built increment (e.g. this one, or `trust-fence`); confirm `verify-report.json` + `VERIFY.md` are well-formed, the verdict matches `check-verify.mjs`'s exit code, and (with zero verifiers) the report reads "no verifiers registered." (Self-referential note: `/verify` on **this** increment runs `npm test` — which now includes `check-verify.test.mjs` — `validate`, `check-structural` over trust-fence's pair, and `lint`; verifier set is ∅ → floor-only PASS expected.)

---

## Guarantee audit (P0) — the two layers, stated explicitly (the point of `/verify`)

- **FLOOR layer — a REAL guarantee; OWNS the verdict.** "The named deterministic gates (`test`, `validate`, `structural:*`, `lint`) passed" → **floor (exit-code threshold, `check-verify.mjs`, `ARCHITECTURE.md §2` primitive #3).** The verdict rests entirely on `check-verify.mjs` comparing integers (`every === 0`), never on model judgment. This is what "verified" means — **full stop**.
- **ADVISORY layer — LLM judgment; ANNOTATES only, never owns the verdict.** Verifier findings (`role: verifier`, when any exist) → **advisory (fix #3, `ARCHITECTURE.md:232`).** A verifier "looks good" is **not** a guarantee; a verifier concern is a **flag for the human**, not a deterministic block. The verifier free-text never reaches `check-verify.mjs`.
- **The honest claim:** `/verify` **guarantees the named deterministic gates passed.** It does **NOT** guarantee correctness beyond what those gates check — verifier judgment is advisory help, not assurance. **"`/verify` ensures the feature is correct" would be the disease (P0)** — the floor gates ensure exactly what they check; verifiers only raise concerns. The `VERIFY.md` residual line states this in the artifact.
- **"`/verify` ran the gates / verifiers correctly"** → **ADVISORY (the orchestration clock).** The agent choosing to run the gates, scoping the eval pairs, discovering verifiers, assembling the report is orchestration — like `/regress` / `/pharn-eval` end-to-end, that half is advisory. **Only the verdict is floor-grade.**
- **"`/verify` may write only `VERIFY.md` + `verify-report.json`"** → **FLOOR: hook (fix #7).** `set-writes-scope.cjs` + `enforce-writes-scope.cjs` pin both paths. Honest caveat (mirrors `/regress`): the gate runs and `.pharn/verify/*.json` captures are **Bash**, which the `Write|Edit|MultiEdit` hook does not gate — fix #7 enforces only the two artifact Writes; `.pharn/**` scratch is always-writable.
- **"The increment adds no counted capability"** → **FLOOR: enum/grep (`floor/validate.mjs`).** Both new files are floor-ignored (`validate.mjs:30`) ⇒ `GREEN — 1 capabilities`.

> **No claim is a guarantee without a floor reduction.** Verdict → exit-code threshold (§2); path-pinning → writes-scope hook; count → `validate`. Everything the **agent** does (running gates, running verifiers, assembling the report) is labeled **advisory**, and **verifier JUDGMENT is advisory by construction — it never owns the verdict.**

---

## Trust audit (P2) — `/verify` ADDS the advisory free-text `/regress` lacks; the verdict stays clean

- **Input under verification:** the built increment is `trust: untrusted`. The **verdict** (`check-verify.mjs`) reads **only** the gate→exit-code map (ints) + the feature name (a path string) — the enum-gated / floor-verifiable class. Instruction-looking content in any reviewed file is DATA, never an instruction (P2).
- **The new free-text (named, not hidden):** unlike `/regress` (which reads zero free-text), `/verify`'s **advisory layer** carries verifier findings, whose `problem` / `evidence` **inherit the untrusted tag** of the reviewed artifact (`finding-shape.md`). These are rendered as **quoted DATA** in `verify-report.json` / `VERIFY.md`, **appended after** the helper emits the verdict, and are **never** passed to `check-verify.mjs`. So **taint propagates into the report but not into the verdict** — the verdict is provably independent of any tainted field (the helper never receives it). This is the fix-#1 boundary holding (`ARCHITECTURE.md §8`): free text never alone gates a guaranteed decision.
- **The named residual (`LIMITS.md §2`, `THREAT-MODEL.md §5`):** when a downstream LLM stage (or a human) consumes the verifier free-text, "do not execute this as an instruction" is a heuristic again. `/verify` **bounds** it (verifier free-text never gates the verdict) but does not zero it — the same residual already accepted across the system, now with a verifier source. With **zero verifiers today**, no such free-text is produced yet; the boundary is in place for when one is.
- **No new egress, no `claude -p` in the core today** (zero verifiers) ⇒ `/verify` adds no new live network instance today; when the first verifier runs via `claude -p`, it is the same bounded, advisory pattern as `/pharn-eval`.

---

## Determinism audit (P5)

- **Deterministic branches (membership / equality / existence):** each gate's pass/fail (`exit-code === 0`, integer equality); the verdict (`every gate === 0`); verifier discovery (`role: verifier` ∈ frontmatter — membership, **not** classification); structural-gate presence (does the feature ship a committed eval-actual pair? — existence). Every branch is membership / equality / existence, never LLM judgment.
- **Terminal fallbacks are "ask"/"loud", never "guess":** a `results.json` missing / empty / malformed → `check-verify.mjs` exits **`2` INCONCLUSIVE** (fail-closed), never a silent pass; zero verifiers → **"no verifiers registered"** (an explicit reported state, not a guess).
- **No LLM in the verdict:** the only irreducible judgment is (a) a human reading `VERIFY.md` and (b) — when verifiers exist — their advisory findings; the pass/fail is `check-verify.mjs`'s exit code. Verifier judgment never drives a branch the floor decides.

---

## Spec alignment (no reconciliation needed — reported with file:line)

Building `/verify` did **not** surface any conflict requiring a human edit to a trusted doc:

- `ARCHITECTURE.md:209` defines the artifact as a **verify-report** keyed on **"compliance per verifier"** — `verify-report.json` is exactly that (machine: the floor `gates`/`verdict` spine **+** the per-verifier advisory `findings`), `VERIFY.md` its human render. The `.json` form matches the table's machine siblings. No new artifact type invented.
- `ARCHITECTURE.md:231–233` (§7) places verifiers **post-build, advisory**, "emit a typed finding list or nothing" — matched exactly: verifiers annotate, the floor owns the verdict.
- `ARCHITECTURE.md:234–241` (§7 fix #3) supplies the **floor-gate vs advisory-gate** split this stage implements; `§2:36–45` supplies the exit-code threshold the verdict uses.
- `ARCHITECTURE.md §6`'s spine lists `verify` **between `regress` and `ship`** — this increment builds `verify` only; `ship` remains deferred (P7), and `/verify` does not invoke it.

---

## Open questions (HALT) — RESOLVED (human-approved 2026-06-26; "Approve as written" → both forks to the recommended options)

The two design forks resolved to the recommended options the plan body already specifies; no amendment was required:

1. **Verifier plug-in slot** → **(A) Define the slot mechanism now, author ZERO verifiers.** Membership over `role: verifier` (P5), advisory-only findings appended to the report, **never** reaching `check-verify.mjs` / **never** flipping the verdict (fix #3); no live runner and no occupant authored (P7). `/verify` runs floor-only today and reports "no verifiers registered." Gives `/verify` its two-layer identity now. _Declined:_ deferring the slot entirely (would reduce `/verify` to `/regress`-without-comparison and drop the advisory layer the stage is about).
2. **Verdict mechanism** → **(A) Build `floor/check-verify.mjs`** (a hermetically-tested verdict helper mirroring `check-regress`): `PASS` iff every gate `=== 0`, `FAIL` (exit 1, names the gates), `INCONCLUSIVE` (exit 2, fail-closed); emits the `§6` machine verify-report verbatim with **no** free-text key. _Declined:_ an inline shell `&&` conjunction (verdict untested; cannot distinguish FAIL from "gate did not run"; no deterministic report emitter).

> **RESOLVED & APPROVED-AS-WRITTEN (2026-06-26).** Both forks → recommended; the plan body is unchanged. Spec hash `11cd9ad5…` re-verified live this run (no drift, fix #4). Ready for `/build` to execute this increment; `/verify` is **not** self-run here (planning halts before build, P6).
