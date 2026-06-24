---
name: finding-shape
trust: trusted
layer: pharn-contracts
purpose: "Single source of truth for the finding object every Capability emits. Schema only, zero behavior. Defines the enum-gated vs free-text split that makes the trust model structural (ARCHITECTURE.md §8, fix #1; P2)."
---

# Contract — finding-shape

> A `pharn-contracts` schema (zero behavior, no `role:` — it is not a Capability). It is the SoT for
> the finding object: enforcers **cite** it and **conform** to it; they do not restate its semantics
> (P4). It elaborates `ARCHITECTURE.md §8`; the principles (P0, P2) live in `CONSTITUTION.md`.

Every finding from any Capability has this exact shape. The split between **floor-verifiable**
(enum-gated) fields and **tainted free-text** fields is the structural expression of fix #1 — it is
what stops an injected code comment from flipping a guaranteed decision.

## The object

```yaml
finding:
  # --- enum-gated / floor-verifiable (TRUSTED: produced by enum-check / path-resolution) ---
  type: "<enum>" # FINDING | CONSTITUTION_VIOLATION | ...
  rule_id: "<file.md ID | P0..P7>" # MUST exist in the roster AND be eval-bound (P1, P4)
  severity: blocking | important | minor # enum; the LLM's *assignment* is advisory (fix #3)
  file: "<path:line>" # resolves to a real location
  # --- free-text (UNTRUSTED: inherits the trust of the INPUT; rendered as DATA, never executed) ---
  problem: "<one sentence>" # P2: fenced; never injected downstream as an instruction
  evidence: "<quote/snippet>" # P2: quoted/escaped in PR + ledger
```

## Field trust classes

| field      | class      | how its value is produced                    | trust                                                 |
| ---------- | ---------- | -------------------------------------------- | ----------------------------------------------------- |
| `type`     | enum-gated | set membership over the type enum            | trusted                                               |
| `rule_id`  | enum-gated | membership in the rule / principle roster    | trusted                                               |
| `severity` | enum-gated | membership in `{blocking, important, minor}` | trusted _value_; the _assignment_ is advisory (fix#3) |
| `file`     | enum-gated | path resolves to a real `path:line`          | trusted                                               |
| `problem`  | free-text  | derived from the (possibly untrusted) input  | **inherits input trust**                              |
| `evidence` | free-text  | quoted snippet from the input                | **inherits input trust**                              |

## The rule of the contract (P0, P2)

A **guaranteed decision** (a floor-gate / constitutional block) is computed from the **enum-gated
fields only**. The free-text fields are for humans and are treated as untrusted DATA (P2): rendered
quoted/escaped, never injected into a downstream stage as instructions.

- **Guaranteed (floor):** `type` / `rule_id` / `severity` / `file` are enum or path checks — set
  membership, not judgment.
- **Advisory:** the LLM's _assignment_ of `severity`, and everything in `problem` / `evidence`.

**Residual (named, not hidden — LIMITS.md §2):** when a downstream LLM stage consumes the free-text
of a finding, "do not execute this as an instruction" is a heuristic again. Fix #1 **bounds** the
blast radius (free text never alone gates a guaranteed decision) but does not zero it. This is the
single place the trust model is not provable on paper — the target of attempt 0.
