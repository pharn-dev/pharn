# VERIFY — ship-gated

**Question:** did `.claude/commands/ship.md` get built **correctly** — does it satisfy its own
requirements? **Verdict (FLOOR — `floor/check-verify.mjs`, exit 0):** **`VERIFIED: floor gates PASS`.**

> "verified" means **the named deterministic gates passed — full stop.** The verdict is owned by the
> FLOOR layer (an exit-code threshold, `ARCHITECTURE.md §2` primitive #3); it is **not** a model's
> judgment that the command is good. The ADVISORY verifier layer only annotates — and today it is empty.

## FLOOR layer — the gates (own the verdict)

| gate                                | exit | meaning                                                 |
| ----------------------------------- | ---- | ------------------------------------------------------- |
| `test` (`npm test`)                 | 0    | the hermetic suite is green with `ship.md` present      |
| `validate` (`floor/validate.mjs .`) | 0    | structural floor GREEN — 1 capability (count unchanged) |
| `lint` (`npm run lint`)             | 0    | eslint clean                                            |

- **verdict:** `PASS` (every gate `=== 0`). **failing_gates:** none.
- **No `structural:*` gate** — `ship-gated` ships **no** eval pair (it is a command-only increment with
  no `evals/` and no `findings.json`), so by convention (P5, membership) there is no feature-specific
  structural gate, exactly as the `pipeline-integration-probe` (also eval-less) verified on
  `{lint, test, validate}`. The trust-fence eval pair belongs to **trust-fence**, not to this feature.
- **Gates are the existing checks — `/verify` invents none.** They are whole-repo (`test` / `validate` /
  `lint` re-run with the feature present — the honest "is it green with this in it").

## ADVISORY layer — verifiers

**`node floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — no verifiers registered;
floor gates only.** Membership is a deterministic frontmatter read (P5), never a prose grep. No verifier
is authored speculatively (P7); the plug-in slot stays empty until a real one is triggered. With zero
verifiers, no advisory free-text is produced — nothing to quote as DATA, nothing that could (and it
never could) flip the verdict.

## What this does and does NOT certify (P0/P7 — the honest residual)

- **Certifies:** the named gates (`test`, `validate`, `lint`) passed with `ship.md` in the repo —
  deterministically. That is the entire content of "verified."
- **Does NOT certify:** that `ship.md` is **correct** in any sense the suite does not encode.
  `ship.md` is **floor-ignored markdown** (`validate` does not parse `.claude/commands/`), so the floor
  gates **cannot see its content at all** — they confirm only that _adding it broke none of the existing
  deterministic checks_. Whether the orchestrator's **logic** is sound (does it read the right verdict
  fields? are the two human gates correctly placed? is the P0 "no new floor primitive" framing honest?)
  is **not** a floor signal here — it is exactly what the **advisory `/review` lenses** judge, and
  ultimately the human at the post-review gate. _"verified = the named gates passed; this is NOT a
  guarantee of correctness beyond what those gates check — verifier concerns are advisory help, not
  assurance."_

**Two-clocks:** only the verdict is floor-grade; everything the agent did (running the gates,
assembling the map, writing this report) is advisory orchestration.

**Next:** `/review features/ship-gated/PLAN.md` — the advisory lenses over the built `ship.md` (where
its actual orchestration logic gets scrutinized), then the human's merge/fix/abandon decision.
`/verify` does not invoke `/review`; the exit code `0` decides this stage.
