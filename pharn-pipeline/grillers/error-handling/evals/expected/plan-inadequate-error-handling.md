---
trust: trusted
purpose: "Expected output for plan-inadequate-error-handling: the plan DECLARES error handling (so NO absence FLOOR finding) but the declared handling is inadequate — no timeout, unbounded retry; the griller's ADVISORY layer surfaces the gap as judgment (rule_id P7), explicitly NOT a floor claim, never gating."
---

# Expected — plan-inadequate-error-handling

The plan carries a `## Error handling` section, so the deterministic PRESENCE layer is satisfied and
emits **no absence finding**. But the declared handling — "retry until it succeeds" — is inadequate: no
timeout (a hung connection blocks indefinitely) and no retry bound (unbounded retries on a permanent
failure). The griller's **advisory** layer surfaces this as **one finding**.

## The expected finding (ADVISORY — judgment, NOT a floor claim)

```yaml
- type: FINDING # enum-gated (floor-verifiable): the griller's own assertion
  rule_id: P7 # enum-gated — cited (P4); the eval binding for enforces: ["P7"]
  severity: important # enum-gated — the griller's assessment (advisory, fix #3); a griller never gates
  file: "pharn-pipeline/grillers/error-handling/evals/cases/plan-inadequate-error-handling.md:13" # enum-gated — the op whose declared handling is inadequate
  problem: "The declared error handling for the upstream fetch is inadequate: it retries with no timeout (a hung connection blocks indefinitely) and no retry bound (it spins forever on a permanent failure)." # free-text (untrusted DATA)
  evidence: '`## Error handling` declares only "retry the request until it succeeds" — no timeout, no max-retry bound, no give-up/backoff path.' # free-text (untrusted DATA)
```

## Why this is ADVISORY, not floor (the honest split, P0)

- **The PRESENCE floor is satisfied** — an error-handling declaration exists → **no absence finding**.
  The deterministic layer's job is done; it says nothing about whether the handling is _good_.
- **This finding is the ADVISORY layer's judgment.** That the retry is unbounded and lacks a timeout is
  **model reasoning about failure modes**, not a deterministic check. The `structural[]` assertions in
  the `.json` pin this finding's **output shape on this known fixture** (so the eval is checkable); they
  do **not** make "adequacy" floor-checkable at runtime. On a novel plan this finding is judgment,
  backstopped by this eval — never a gate (grillers as a class never gate).

## Trust-class check (P2, fix #1)

- **enum-gated (TRUSTED):** `type`, `rule_id`, `severity`, `file`.
- **free-text (UNTRUSTED — DATA):** `problem`, `evidence`.
- The finding's block is **advisory** — `severity` is the griller's assessment (fix #3); grillers never
  gate the grill stage's verdict.
