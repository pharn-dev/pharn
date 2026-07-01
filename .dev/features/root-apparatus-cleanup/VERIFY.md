# VERIFY — root-apparatus-cleanup

**Question:** was the deletion-only cleanup built correctly — is the repo green with it in?

**Verdict (deterministic, `.dev/floor/check-verify.mjs`): `PASS`** — every floor gate exit 0.

## FLOOR layer — the gates that OWN the verdict (whole-repo, at HEAD)

| gate           | exit | note                                                          |
| -------------- | ---- | ------------------------------------------------------------ |
| `test`         | 0    | `npm test` — **167 pass / 0 fail** (was 179; −12 stale dup)  |
| `validate`     | 0    | `FLOOR: GREEN — 2 capabilities` (unchanged)                  |
| `lint`         | 0    | eslint clean                                                 |
| `format:check` | 0    | prettier clean (see note)                                    |
| `lint:md`      | 0    | markdownlint clean (see note)                                |

No `structural:*` gate — this feature ships **no** eval pair (deletion-only, no `role:` capability).

**Honest note (L9 caught it, as designed).** The first verify pass had `format:check` **1** and
`lint:md` **1** — both **solely** on this increment's own process artifacts
(`.dev/features/root-apparatus-cleanup/GRILL.md` + `PLAN.md`: prettier's `_italic_` normalization, and one
`MD018` from a prose line starting with `#19`). No product/live file was implicated. Fixed in place
(`prettier --write` + a one-line reword) and re-run to the green above. This is the L9 remedy working:
an increment's own markdown style is caught **at verify**, then fixed — not shipped and caught later.

## Additional confirmations (this increment's safety properties)

- **Spec→plan hash chain (4th downstream consumer):** `sha256(ARCHITECTURE.md)` == the plan's pinned
  `spec_content_hash` — **MATCH**, chain holds.
- **No dangling live reference (the grill's P1 concern, now confirmed by grep):** zero live references
  to the removed root `floor/check-ship` remain — every surviving mention is a frozen `.dev/features/*/`
  trace (left verbatim by design, OQ-2) or the live `.dev/floor/check-ship.mjs`. The stale `ship.md` (the
  only live invoker) is gone, so the count is zero by construction.

## ADVISORY layer — verifiers

`node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — **no verifiers registered
— floor gates only.** (Step 2 is a no-op; the verdict is the floor gates alone.)

---

_verified = the named gates passed; this is **not** a guarantee of correctness beyond what those gates
check — verifier concerns would be advisory help, not assurance (P0). Here, with zero verifiers, the
whole signal is the deterministic floor gates above._
