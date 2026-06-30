# PLAN — verify-style-gates (add `format:check` + `lint:md` to /pharn-dev-verify's canonical gate map)

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 — sha256(ARCHITECTURE.md), computed LIVE this run (P6); matches plan-files-scope/build-stage pins → no drift
- increment: implement L9's remedy — add `format:check` + `lint:md` to `/pharn-dev-verify`'s canonical FLOOR gate set (its Step-1 gate runs + the assembled results map + the verify-report.json example + the guarantee/granularity notes), so the deterministic verdict (`check-verify.mjs`, every-gate-exit-0) tracks the full `npm run check` and closes the L9 coverage hole AT VERIFY. **`check-verify.mjs` is UNCHANGED** (confirmed generic over gate keys) — **NO new floor primitive**.
- layer(s): `.claude/commands/` (the command — advisory orchestration; floor-ignored by `validate.mjs`, like every `pharn-dev-*` command). No `pharn-*` file, no `.dev/floor/` change. **Floor capability count stays 1** (`trust-fence`). # ARCHITECTURE.md §4
- constitution_refs: [P0, P4, P5, P6, P7]

---

## Step 0 — Discovery results (live this run; P6, never from memory)

- **`check-verify.mjs` is GENERIC over gate keys** (`.dev/floor/check-verify.mjs:108-118`, read live — the MANDATORY discovery): it iterates `Object.keys(results)`, sets `verdict = PASS iff every code === 0` else `FAIL` with offenders in `failing_gates[]`, and hard-codes **no** gate-name allowlist. The existing test even feeds an arbitrary key `structural:a/expected.json` (`check-verify.test.mjs:44,51`). ⇒ adding `format:check` + `lint:md` needs **NO change to `check-verify.mjs`** — only the two gate KEYS added to the map the command assembles. The HALT condition (a hard-coded allowlist) did **not** trigger.
- **L9 is the prescription** (`.dev/memory-bank/lessons-learned.md` L9, promoted commit `931e20c`): the gate-coverage hole — `/pharn-dev-regress` skips style gates absent a shared-config change, `/pharn-dev-verify`'s canonical set OMITS them — so an increment's own markdown can redden `npm run check` yet pass both. L9's remedy: add `format:check` + `lint:md` to `/pharn-dev-verify`'s gate map (verify runs at HEAD with devDeps present → cheap, no `npm ci`).
- **Current `/pharn-dev-verify` gate set** (`.claude/commands/pharn-dev-verify.md` Step 1): `npm test` / `validate` / `npm run lint` / `structural:<expected>` — assembled into a `{gate: exit}` results map, then `check-verify.mjs` over it. The `format:check` and `lint:md` gates (both part of the repo's `npm run check`) are absent. This run's own plan-files-scope verify already added them ad hoc to the results map — this increment **codifies** that in the command.
- **`/pharn-dev-regress` is NOT touched (confirmed).** Its deterministic style-gate skip (run style gates only when `inside` touches a shared style config) is **sound** — over outside files byte-identical at base/head a style result cannot flip — and is a separate axis. L9 places the remedy at verify (an ABSOLUTE "is it all green now?" check), not regress (a RELATIVE base→head flip check). Leaving regress unchanged is correct.
- **Floor is GREEN — 1 capability** (`trust-fence`); the edited file is floor-ignored `.claude/`, so the count is unchanged (re-confirm live in build).

## The two layers (stated explicitly — P0)

- **FLOOR — the verdict, REUSED unchanged.** `check-verify.mjs` computes `PASS iff every gate exit 0` over the assembled `{gate: exit}` map (`ARCHITECTURE.md §2` primitive #3 — an exit-code threshold). It is **generic over keys**, so once the command assembles a map that includes `format:check` + `lint:md`, the floor verdict mechanically covers them — a red style gate becomes a deterministic `FAIL` with the gate named in `failing_gates[]`. **No `check-verify.mjs` change, no new primitive.**
- **ADVISORY — the orchestration that widens the gate set.** WHETHER `/pharn-dev-verify` runs `format:check` + `lint:md` and includes them in the map is **command orchestration** (the prose I follow) — the same "two clocks" split as every existing verify gate. This increment edits that advisory prose to add the two gates; the floor verdict layer is untouched.
- **L9 alignment.** L9 itself says "the remedy lives in the orchestration layer (`/pharn-dev-verify`'s gate map), not the floor checker." This increment does exactly that: a command-prose widening, with the unchanged floor verdict covering the result.

> **The honest claim (P0).** After this, `/pharn-dev-verify`'s deterministic verdict ranges over `format:check` + `lint:md` too, so a style regression in an increment's own files is a `FAIL` at verify (no longer invisible until the full `npm run check` / CI) — closing L9's hole AT VERIFY. It does **NOT** add a floor primitive (the verdict mechanism is unchanged), and it does **NOT** change `/pharn-dev-regress` (whose style-gate skip is sound). "verify ran the style gates" is **advisory orchestration**; "every gate in the map exits 0" is the **floor** verdict.

## Files

- `.claude/commands/pharn-dev-verify.md` — **EDIT (one axis).** Add `format:check` (`npm run format:check`) and `lint:md` (`npm run lint:md`) to the canonical FLOOR gate set: (1) Step 1's gate runs + the `printf` results map; (2) the "the gates are the existing checks" enumeration; (3) the `verify-report.json` `gates` example; (4) the guarantee-audit + granularity + live-integration notes (the style gates need devDeps, present at HEAD — no `npm ci`; the verdict now tracks the full `npm run check`). Cite L9 + `check-verify.mjs`'s generic contract; do not restate (P4). — layer `.claude/commands/` (floor-ignored).

### Explicitly **not** touched

- `.dev/floor/check-verify.mjs` — **reused unchanged** (generic over gate keys; modifying it is unnecessary and would be a second axis). `.dev/floor/check-verify.test.mjs` — see Open question OQ1.
- `.claude/commands/pharn-dev-regress.md` — **NOT touched** (its style-gate skip is sound and a separate axis; L9 places the remedy at verify).
- `ARCHITECTURE.md` / `CONSTITUTION.md` / `THREAT-MODEL.md` / `LIMITS.md` — human-only (hook-denied, fix #2).

## Contracts satisfied (cite, don't restate — P4)

- **`.dev/memory-bank/lessons-learned.md` L9** — the prescription this increment implements (add the style gates to verify's gate map).
- **`.dev/floor/check-verify.mjs`** — the verdict core, **reused as-is** (generic `{gate: exit}` → `PASS iff all 0`); the command assembles a wider map, the checker is unchanged.
- **`ARCHITECTURE.md §7`** (fix #3) — verify's FLOOR layer owns the verdict; this widens the FLOOR gate set, not the advisory verifier layer.

## Evals to write (P1)

- `/pharn-dev-verify` is a **command, not a Capability** (no `role:`, floor-ignored), so P1's Capability-evals rule does not bind it — and `check-verify.mjs` is **unchanged**, so no new checker behavior ships. See **OQ1** for whether a `check-verify.test.mjs` fixture adds real coverage (recommendation: **no** — P7).
- **The proof is the dogfood:** this increment's OWN `/pharn-dev-verify` run (in this very `/pharn-dev-ship` chain) will run `format:check` + `lint:md` as canonical gates and include them in the verdict map — demonstrating the widened set end-to-end on a real increment.
- **Floor check after build:** `node .dev/floor/validate.mjs .` must still print `GREEN — 1 capability`; `npm run check` green.

## Guarantee audit (P0)

- verify's deterministic verdict now ranges over `format:check` + `lint:md` → **floor: enum-regex** (`check-verify.mjs`'s every-gate-exit-0 threshold over the assembled map) — **REUSED unchanged**, no new primitive.
- WHETHER verify runs + includes the two style gates → **advisory** (command orchestration; the two-clocks split, identical to every existing verify gate).
- closes L9's coverage hole AT VERIFY → **advisory** orchestration backed by the **floor** verdict (exactly what L9 prescribes: the remedy is in the orchestration layer).
- does NOT change `/pharn-dev-regress` → out of scope; regress's style-gate skip stays sound.
- this increment adds a new floor primitive → **NO**.

## Trust audit (P2)

- This increment ingests **no untrusted artifact** — it edits a trusted command (`pharn-dev-verify.md`). At verify runtime the added gates emit **exit codes (ints)** only, never free-text; the verdict (`check-verify.mjs`) ranges over the int map, never a tainted field (mirrors the existing verify gates). No new taint path.

## Determinism audit (P5)

- The verdict is `check-verify.mjs`'s exit-code threshold (membership: every code === 0) over the assembled map — no LLM. The gate set is a fixed enumeration in the command prose, not a classification.
- Terminal fallback: a malformed results map → `INCONCLUSIVE` (fail-closed, `check-verify.mjs:101-106`), unchanged.

## Open questions (HALT) — RESOLVED (human-approved 2026-06-30; "Approve as written")

- **OQ1 — add a `check-verify.test.mjs` fixture for the expanded gate set, or not?** **Recommendation: NO (P7).** `check-verify.mjs` is provably generic over gate keys (it iterates `Object.keys`, no allowlist) and the existing tests already exercise an arbitrary key (`structural:a/expected.json`) plus PASS/FAIL/`failing_gates`/INCONCLUSIVE — so a fixture with `format:check`/`lint:md` keys would re-test the **same** generic mechanism with different strings (no new behavior covered). The real risk this increment introduces — the **command prose** dropping the gates — is **not** unit-testable without grepping prose, which L6 explicitly forbids (membership from a structured location, never a free-text grep). So the honest proof is the existing generic tests + this increment's **dogfood** verify run. **Alternative:** add a small documentary fixture anyway as cheap regression insurance (a map with `format:check` + `lint:md` both 0 → PASS; one non-zero → FAIL, named). **Resolved (2026-06-30): NO test** — per P7: `check-verify.mjs` is generic and already tested (incl. an arbitrary key), and the real risk (the command prose dropping the gates) is not unit-testable without an L6-forbidden prose grep; the proof is the existing generic tests + this increment's dogfood verify run.

> **Build-ready — no open questions remain.** Spec hash `11cd9ad5…` re-verified live this run (no drift, fix #4). Next in the chain: `/pharn-dev-grill` → `/pharn-dev-build` (edits `.claude/commands/pharn-dev-verify.md`).
