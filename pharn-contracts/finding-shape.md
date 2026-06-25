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

## Emission — findings.json (the machine-readable array)

A Capability that emits findings MUST serialize them as a single **`findings.json`** — a JSON array of
the finding object defined above (zero or more) — **in addition to** any human-facing output
(e.g. `REVIEW.md`). The capability declares this file in its `writes:` frontmatter
(`ARCHITECTURE.md §3.1`, enforced by the pre-write hook — cited, not restated, P4).

- **Shape:** `[ {type, rule_id, severity, file, problem, evidence}, … ]` — each element is exactly the
  object above; no field is redefined here (P4). An empty finding list is the empty array `[]`.
- **The taint split is REAL at the output (P2).** The enum-gated fields (`type`, `rule_id`,
  `severity`, `file`) are the capability's **own** assertion — TRUSTED, produced by its
  enum-check / path-resolution. The free-text fields (`problem`, `evidence`) **inherit the input's
  trust** — UNTRUSTED when the reviewed artifact is untrusted, carried as quoted DATA. Because the
  split is a real JSON field boundary at the capability's output, it is **structural**, not something
  a downstream model re-interprets from prose.
- **Naming/location:** the file is named `findings.json` and is colocated with the capability's
  human-facing output (the same directory it `writes:`). Example: `trust-fence` writes
  `features/trust-fence/REVIEW.md`, so its findings array is `features/trust-fence/findings.json`.
- **Consumer (cited):** this is exactly the `actual.json` that `floor/check-structural.mjs` reads; the
  emission contract is what gives that checker a real capability output to range over.

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
