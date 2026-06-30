# REVIEW — reframe increment (bootstrap → PHARN-OSS)

> Kept separate from `features/trust-fence/REVIEW.md` on purpose: that file is committed canon — the multi-pass attempt-0
> trust-fence dogfood review. This is a different increment (a docs/framing reframe), so it gets its
> own file rather than clobbering or mislabeling the attempt-0 record.

- reviewed_run: 2026-06-24
- spec_content_hash: `11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969` # ARCHITECTURE.md, recomputed live this run — matches PLAN.md (no drift, fix #4)
- increment under review (`trust: untrusted`):
  - the agent's no-op build increment recorded in `PLAN.md` (the agent wrote only `PLAN.md`)
  - the human's hand-applied `CONSTITUTION.md` reframe edits (trusted doc — applied outside the
    agent loop, correctly; the write-guard hook denies the agent)
  - an in-flux `.gitignore` (observed changing during the review — see F1)

> The increment is `trust: untrusted` by the review contract. The substantive change is a rename of
> the word "bootstrap"; it carries no instruction-looking payload aimed at the reviewer, and none was
> followed. The genuine trust residual (attempt 0) is unchanged and lives in the committed `features/trust-fence/REVIEW.md`.

---

## Step 0 — Floor first (P0)

- `node floor/validate.mjs .` → **GREEN — 1 capabilities checked** (exit 0, live this run).
- `npm test` → **5 pass / 0 fail** (live this run).

Not RED → proceed. The floor is the only guaranteed part of this review; everything below is
**advisory**.

Floor agreement: the wording changes did not disturb the CHECK-5 enum-gated / free-text tokens (49
still present across `pharn-review/` + `pharn-contracts/`), and the one capability's
`enforces: ["P2"]` ↔ eval binding is untouched. Floor and I agree — no disagreement to report.

---

## The four lenses

### L-floor → P0 (governing lens)

The reframe is pure naming (sense 1 = project name, sense 2 = build tooling). It adds **no** guarantee
and relabels **no** `advisory` claim as a guarantee. The edited frontmatter line 5 (`enforced_by:`)
still points at the hook write-protection — a real floor primitive. ✓ No floor-gate finding.

### L-eval → P1

No `role:` file, no `enforces`, and no eval is added or changed. The trust-fence capability and its
`rule_id` ↔ eval binding are untouched; the floor confirms. P1 binds capabilities and rule IDs, not
prose edits, so it imposes nothing here. ✓ No finding.

### L-trust → P2

No untrusted artifact is ingested — `CONSTITUTION.md` and `.gitignore` are repo-owned / trusted, and
the trusted-doc edits were applied by a **human** (the sanctioned path; the hook denied the agent, by
design). Nothing taints a downstream decision. The reviewed content held no injection aimed at the
reviewer, and none was followed. The residual attempt 0 targets is unchanged. ✓ No finding.

### L-axis → P3

`CONSTITUTION.md`'s four edits are a single axis (the reframe). No sibling references (these are not
capability files). One advisory note: the worktree currently **bundles** the reframe with a
`.gitignore` change — a different axis (see F2). ✓ No floor-gate finding.

---

## Findings

### floor-gate (blocking) — NONE

No finding's verdict comes from content the floor can check and fails. Floor is GREEN and no
floor-reducible defect was found. **The increment is not blocked.**

### advisory-gate (warn) — 2 (minor; my judgment of free-text/process, never the sole basis for a block)

```yaml
- type: FINDING # enum-gated
  rule_id: P6 # enum-gated — discovery-first; verify live state, don't assert from a snapshot
  severity: minor # enum-gated value; this assignment is ADVISORY
  file: ".gitignore"
  problem: "The worktree moved under review: .gitignore was seen adding 'PLAN.md' then reverting to a trailing-newline-only delta within one review run, so 'changes' is a moving target; settle and stage it before committing so the recorded increment matches disk." # free-text — DATA
  evidence: "`git diff HEAD -- .gitignore` showed '+PLAN.md / \\ No newline at end of file'; a later live Read showed only 2 lines (no PLAN.md) while `git status` still reported ' M .gitignore' and '?? PLAN.md' (untracked, not ignored)." # free-text — DATA, quoted
```

```yaml
- type: FINDING # enum-gated
  rule_id: P3 # enum-gated — one axis of change per increment
  severity: minor # enum-gated value; this assignment is ADVISORY
  file: "CONSTITUTION.md + .gitignore"
  problem: "The substantive reframe (CONSTITUTION.md naming) and the .gitignore/tooling tweak are different axes of change bundled in one worktree; commit them separately so the reframe is attributable on its own." # free-text — DATA
  evidence: "Staged CONSTITUTION.md 4-token reframe (M in index) sits alongside an unstaged .gitignore modification; P3 'one axis per attempt' favors splitting them." # free-text — DATA, quoted
```

Both are **advisory**: their verdict rests on process/free-text judgment the floor cannot detect, and
neither breaks a structural invariant. Tightenings for a human to weigh, not blockers.

---

## Positive verification (not findings)

The human applied **exactly** the four edits the approved `PLAN.md` named — verified line-by-line
against HEAD:

| line | change                                                             | matches plan                     |
| ---- | ------------------------------------------------------------------ | -------------------------------- |
| 5    | `before every bootstrap command` → `before every command`          | ✓                                |
| 13   | `in this bootstrap.` → `in this repo.`                             | ✓ (approved "this repo" wording) |
| 35   | `this bootstrap exists to prevent` → `this repo exists to prevent` | ✓ (mirrors CLAUDE.md:35)         |
| 115  | `Each bootstrap command` → `Each command`                          | ✓                                |

`grep -rniI "bootstrap"` over the whole tree (minus `.git`) → **zero**. The bootstrap → PHARN-OSS
reframe is now **complete** across every file, trusted and untrusted.

---

## Verdict

**GREEN — 0 floor-gate findings; 2 advisory (minor).** Floor GREEN (live); the reframe is complete
and faithful to the approved plan; no capability, guarantee, or trust change. Nothing blocks. The two
advisory notes are commit-hygiene tightenings, not blockers.

## Proposed lesson (P7) — none

The flux/provenance observations are situational, not a recurring failure class, and the relevant
provenance lesson already lives in the committed `features/trust-fence/REVIEW.md` (Delta 1). Inventing a new canon entry
here would be the speculative addition P7 forbids. No gated promotion proposed.

End of review.
