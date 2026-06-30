# VERIFY — ship-loop

**Question:** did the `--loop` increment get built **correctly** — does it satisfy its own
requirements? **Verdict (FLOOR — `floor/check-verify.mjs`, exit 0):** **`VERIFIED: floor gates PASS`.**

> "verified" means **the named deterministic gates passed — full stop.** The verdict is owned by the
> FLOOR layer (an exit-code threshold, `ARCHITECTURE.md §2` primitive #3); it is **not** a model's
> judgment that `--loop` is good. The ADVISORY verifier layer only annotates — and today it is empty.

## FLOOR layer — the gates (own the verdict)

| gate                                | exit | meaning                                                 |
| ----------------------------------- | ---- | ------------------------------------------------------- |
| `test` (`npm test`)                 | 0    | 111/111 pass — **incl. the 12 new `check-ship` tests**  |
| `validate` (`floor/validate.mjs .`) | 0    | structural floor GREEN — 1 capability (count unchanged) |
| `lint` (`npm run lint`)             | 0    | eslint clean (incl. the new `floor/check-ship.mjs`)     |

- **verdict:** `PASS` (every gate `=== 0`). **failing_gates:** none.
- **No `structural:*` gate** — `ship-loop` ships **no** eval pair (the new `check-ship.test.mjs` is a
  floor-helper hermetic test, not a Capability `expected`↔`findings.json` pair), so by convention (P5,
  membership) there is no feature-specific structural gate — same as the eval-less `ship-gated` and
  `pipeline-integration-probe`. The trust-fence eval pair belongs to **trust-fence**, not this feature.
- **The feature-specific correctness signal IS in the `test` gate.** Unlike a markdown-only increment,
  `ship-loop`'s floor core (`floor/check-ship.mjs`) ships a hermetic test (`floor/check-ship.test.mjs`)
  that `npm test` collects — so the `test` gate **does** exercise this feature's deterministic logic
  (the stop/cap decision table, the off-by-one boundary, fail-closed, and `/review`-independence). The
  12 ★/non-★ cases all pass.

## ADVISORY layer — verifiers

**`node floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — no verifiers registered;
floor gates only.** Membership is a deterministic frontmatter read (P5), never a prose grep. No verifier
is authored speculatively (P7); with zero verifiers, no advisory free-text is produced, and none could
(ever) flip the verdict.

## What this does and does NOT certify (P0/P7 — the honest residual)

- **Certifies:** the named gates (`test`, `validate`, `lint`) passed with the `--loop` increment in the
  repo — deterministically. For the **floor helper** `check-ship.mjs`, this is a genuine
  feature-specific signal: its hermetic test ran and passed, so its **decision logic** (STOP_GREEN /
  CONTINUE / STOP_CAP / fail-closed; `/review`-independence) is verified at the floor.
- **Does NOT certify:** that the `--loop` **orchestration in `ship.md`** is correct. `ship.md` is
  floor-ignored markdown — the gates cannot see its content; whether the loop body actually _invokes_
  `check-ship.mjs` with the right args, obeys its exit code, applies fixes within scope, and re-enters
  the gates correctly is **unmechanized prose** until a **live `--loop` dogfood** runs it (the same A-1
  residual `ship-gated` surfaced, now with _more_ autonomous orchestration). _"verified = the named gates
  passed; this is NOT a guarantee of correctness beyond what those gates check — verifier concerns are
  advisory help, not assurance."_

**Two-clocks:** only the verdict is floor-grade; running the gates and assembling this report is advisory
orchestration.

**Next:** `/review features/ship-loop/PLAN.md` — the advisory lenses over `ship.md`'s `--loop` section
and `check-ship.mjs` (where the orchestration logic and the P0 stop-reduction get scrutinized), then the
human's decision. `/verify` does not invoke `/review`; the exit code `0` decides this stage.
