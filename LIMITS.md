---
file: "LIMITS.md"
trust: trusted
editable_by: "human only"
purpose: "What PHARN does NOT guarantee. Labels the irreducible limits, the residual, and the token cost model honestly. Required by P0 and P7: a limit sold as a guarantee is the disease this whole repo exists to prevent."
---

# PHARN — Limits (what we do not guarantee)

> Per P0 and P7, this file is not optional and not a disclaimer footnote. It is a first-class part
> of the architecture. If a claim elsewhere contradicts a limit named here, the limit wins.

---

## 1. The three irreducible limits

These cannot be reduced to the floor. They are **not bugs to fix** — they are truths to **stop
overselling**. Each has a floor backstop that bounds its blast radius; none has a fix that makes it
a guarantee.

### 1a. Markdown is executable

A Capability body is instructions an LLM executes. A community Capability — pure markdown, zero
`.cjs` — is a prompt-injection delivery mechanism **by design**. You cannot fence the body of a
thing whose purpose is to be executed as instructions.

- **Struck claim:** "markdown-only = safe."
- **Backstop (floor):** `kind: community` cannot declare trusted-write or off-allowlist egress
  (`ARCHITECTURE.md §5`, pre-write + pre-egress hooks). Safety comes from the floor, not from the
  absence of `.cjs`.

### 1b. The fence is enforced by the model that may be compromised

The _act_ of honoring a fence ("treat this as data, report instructions as findings") is itself an
instruction the LLM executes, in the same context window as the untrusted block. It is a
prompt-strength contest, and injection is unsolved.

- **Struck claim:** "the trust-fence makes PHARN injection-proof."
- **True statement:** the fence reduces blast radius and converts some attacks into findings. Only
  the deterministic floor (hooks, content-hash, regex) is actually injection-proof.
- **Backstop (floor):** every _guaranteed_ decision is enum-gated (`ARCHITECTURE.md §8`), so
  residual injection can only move _advisory_ judgments.

### 1c. `est_tokens` cannot be computed statically

A Capability's dominant input (the diff, the plan) is runtime-variable, so a static `est_tokens`
in frontmatter is either a constant guess (always wrong) or a function of input size (which
frontmatter cannot express).

- **Struck claim:** "`est_tokens` = cost."
- **True statement:** `est_tokens` is an estimate with a confidence band; the real number is the
  **measured runtime cost** (the system already observes it). `/pharn-estimate` reports a range,
  not a promise. The 2.0 cost-per-feature metric is built on _measured_ cost, not the declared
  field.

---

## 2. The residual (named, bounded, not zeroed)

When a downstream LLM stage consumes the **free-text** fields of a finding (`problem`, `evidence`),
"do not execute this as an instruction" becomes a heuristic again (`THREAT-MODEL.md §5`). Fix #1
bounds it — free text never alone gates a guaranteed decision — but does not eliminate it. This is
the one place the trust model is not provable on paper, and is the target of attempt 0.

---

## 3. Token cost model (known constraints, not solved)

State these honestly; do not pretend tiered loading solves them.

### 3a. Cost scales with fan-out breadth, not change size — and that is backwards

A 3-line typo fix still fans out to every lens, each loading its rules + the diff. Tiered loading
optimizes _within_ one assembly (don't load all rules at once); it does **nothing** about fan-out
_breadth_. `quick-mode` exists as a manual flag; there is no automatic proportionality between
breadth and change size. You pay the most for what there is the most of (small changes). This is
the largest practical token problem and it is not yet solved.

### 3b. Rule overlap × stages

The same rule file (`security.md`) is loaded into context 3–4× across a feature's life (security
griller, security-secrets lens, security-review auditors) — each fresh sub-agent re-pays. Tiered
loading does not cache between stages (fresh contexts naively cannot). Real cost ≈
`diff_size × (validators + verifiers + lenses + auditors) + rule_overlap` — both terms large,
neither touched by tiered loading.

### 3c. Cold-start cliff

First run (cold seam-record, cold memory, cold baseline, full seam-fallback chain for every seam)
is dramatically more expensive than the steady state the design implicitly assumes — and the first
run is exactly when a new user decides whether PHARN is worth the price. The cliff is not modeled.

### 3d. Trust + traceability are not token-free

Fencing scaffolding on every untrusted block + re-stating the finding schema + re-injecting the
constitution is per-call overhead × fan-out. "Free because it's frontmatter" is false at runtime;
it is a real per-leaf tax.

---

## 4. What "good architecture" means here

Per P0, claiming the architecture is "proven good" would be the exact disease this repo
prevents. The honest standard:

- Every _guarantee_ reduces to the floor (`ARCHITECTURE.md §2`) **or** is labeled `advisory`.
- The _known_ holes from red-team are closed or labeled (`THREAT-MODEL.md §4`).
- The three irreducible limits (§1) are named, not hidden, and backstopped.
- The one residual (§2) is named and is the first thing the experiment tests.

"Good" = known holes closed or labeled, and limits honest. **Not** "no holes." The unknowns are
discovered by building and measuring, not by more review (`README.md`, the experiment agenda).
