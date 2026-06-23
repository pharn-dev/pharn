---
file: "ARCHITECTURE.md"
trust: trusted
editable_by: "human only"
purpose: "The canonical architecture PHARN is built to. The build agent treats this as the spec; the plan agent pins its content-hash; the review agent checks output against it. Elaborates CONSTITUTION.md — never contradicts it."
---

# PHARN — Architecture

> Read `CONSTITUTION.md` first. This document elaborates it. Principle references (P0–P7) point
> there and are not restated here (P4).

---

## 1. Thesis and the central problem

PHARN is **context engineering as a versioned, auditable artifact** — compiler discipline (rules →
enforcement → traceability) expressed in prompts (markdown + a few deterministic `.cjs`/`.mjs`
helpers consumed by Claude Code), not in application code. The product is the methodology;
**transparency is the moat** — the client is fully readable, the paid layer is gated by an API
key, never by obfuscation.

Every architectural decision serves one pressure: **cover N frameworks × M vendors × K concerns
without combinatorial explosion, while staying 100% readable.** The central move is to identify
**axes of change** and never let two of them share a file (P3).

There are two threat models (`THREAT-MODEL.md`): **A** — does the app PHARN _builds_ defend itself
(OWASP LLM Top 10); **B** — is PHARN _itself_ injectable as an agent reading hostile context.
A is methodology delivered to the user. **B is architecture, and this document bakes it into the
foundation.**

---

## 2. The floor (the only thing that is actually guaranteed)

Per P0, every guarantee reduces to one of exactly three deterministic primitives. The floor is
small, explicit, and non-LLM. Nothing else is a guarantee.

1. **Hooks** — non-LLM programs run by Claude Code at tool boundaries.
   - `pre-write` — blocks a write to a protected path (e.g. trusted files; out-of-`writes`-scope paths).
   - `pre-egress` — blocks a network call to a domain not on a hardcoded allowlist.
2. **Content-hash** — identity of _content_, not identity of _id_. Detects silent mutation of a
   pinned artifact (spec, seam resolution, fetched doc).
3. **Enum / regex check** — set membership or pattern match, in `validate` and at gates
   (`coupling ∈ {...}`, `rule_id ∈ roster`, regex for a hardcoded secret).

**Rule of reduction:** any sentence in this architecture that says "guaranteed" must trace to one
of these three. If it cannot, it is `advisory` and is labeled so (P0). The honest consequence:
the LLM layer is never injection-proof; only the floor is (`LIMITS.md`).

---

## 3. Primitives

### 3.1 Capability — the unified LLM-invoked family

A skill, lens, validator, verifier, griller, and auditor are **not six kinds** — they are one kind
with a `role` discriminator. Each is a scoped LLM instruction + evals + typed findings. Unifying
them gives one eval runner, one template, one mental model, one community contribution format.

Frontmatter contract (every Capability):

```yaml
---
name: "<id>"
role: skill | lens | validator | verifier | griller | auditor
kind: pharn-owned | vendor-official | community   # also a privilege level — see §5
trust: trusted                                     # the Capability itself is trusted; its INPUT may not be
coupling: agnostic | framework-seam | framework-specific   # only on framework-touching capabilities/rules
model_tier: haiku | sonnet | opus
est_tokens: <int>                                  # ADVISORY estimate — see LIMITS.md (cannot be static over variable input)
reads: ["<path-or-artifact>"]                      # declared inputs — ENFORCED only at the write side by the floor
writes: ["<path>"]                                 # declared outputs — ENFORCED by the pre-write hook (§5, fix #7)
constitution_refs: ["P0".."P7"]
enforces: ["<rule_id>"]                            # rule IDs this enforces — each MUST have an eval (P1)
related: ["<other capability names>"]
version: "<semver>"
seal: "PHARN ✓ reviewed"                           # ONLY on kind: pharn-owned
---
```

### 3.2 Coupling — classify by axis-of-change, not by domain noun

`coupling` is the seam classification. It is **metadata** (advisory; not floor-validated for
correctness — only its enum membership is). Decide it with this top-down procedure, **first match
wins**. The question is never "what _is_ auth" — it is "what forces this content to change":

- **Q1** — Does the content stay byte-identical when you swap the framework (Next → Remix →
  SvelteKit) **and** across SSR/Backend/SPA archetypes? → `agnostic`.
- **Q2** — (else) Does it describe how a **cross-framework capability** (auth, jobs, fetching, the
  Server/Client boundary) _wires into_ this framework's request lifecycle — the capability exists
  everywhere, only the wiring differs? → `framework-seam`.
- **Q3** — (else) Is it a **primitive that exists only in this framework** (nothing to wire
  elsewhere — Server Actions, App Router, RSC)? → `framework-specific`.

The reframe is the point: "auth" is nothing by itself — its secrets-handling part is `agnostic`
(`SEC`), its session-wiring part is `framework-seam` (`AUTH`). A half-and-half rule takes the
**dominant axis** (`framework-seam`) and stays whole. Worked examples that the procedure must
reproduce: `database.md` → Q1 → agnostic; `auth.md` → Q2 → framework-seam; `server-actions.md`
→ Q3 → framework-specific.

### 3.3 Hook — a separate, privileged, deterministic class

Hooks are **not** Capabilities. No `model_tier`, not LLM-invoked. They are the floor (§2). They
must stay a separate class precisely because they are the one layer prompt injection cannot reach
— collapsing them into Capability would erase the most important line in the system.

---

## 4. Layers (the tree)

Dependency-ordered, single root, **no sibling imports** (P3). Sharing flows only through the
bottom (`pharn-contracts`).

```text
pharn-contracts        L-1  schemas only, ZERO behavior: capability-frontmatter, rule,
                            finding-shape, severity enum, seam-record, eval-format, trust-fence,
                            archetype enum, manifest. Everything depends on this.
  └─ pharn-core (req)  L0–L2 constitution (engine + variants per archetype), agnostic rules,
                            seam-resolver (the MECHANISM, agnostic), memory-bank, base commands,
                            universal hooks. A frameworkless lib runs on core alone.
       ├─ pharn-pipeline    spec→plan→grill→build→regress→verify→ship
       ├─ pharn-review      lenses + ledger + cross-model (the GitHub-Action wedge)
       ├─ pharn-audits      deep on-demand audits
       ├─ pharn-skills-*    vendor bridges (db / orm / auth / payments / email)        L4
       └─ pharn-stack-<fw>  framework rules (L3) + seam ANSWERS (ai_docs, phase-variants,
                            grill-banks, combinations)
```

- `pharn-contracts` is a separate **bottom**, not a leaf. This fixes the v1 inversion where the
  most foundational contract (the rule schema) was owned by a leaf module. The rule schema, the
  finding shape, the severity enum, the trust-fence format **live here**.
- **Tree, with one escape hatch:** the tree is the default, not an absolute. A genuinely shared
  abstraction may create a cross-edge — but that edge goes **through `pharn-contracts`** (the
  bottom), never leaf→leaf. This keeps P3 intact and avoids multiplying adapters.
- **Seam split:** the _mechanism_ (resolver) is in core and knows nothing about any framework;
  the _answers_ (how Drizzle wires under edge runtime in Next) live in the stack pack and know
  nothing about the process.

> Caveat the build agent must respect: in markdown there is no `import` statement to lint, so "no
> sibling imports" is partly a **convention** — a sibling reference is a path in `reads:` or a
> mention in prose. `floor/validate.mjs` greps for forbidden cross-references; beyond that, the
> review agent enforces it (P3). This is a labeled limit, not a silent guarantee.

---

## 5. Inter-layer contracts

Layers meet on named contracts, never ad hoc.

**Constitution injection.** The constitution text is an immutable prefix on every LLM prompt
(`[CONSTITUTION] / [TASK] / [RULES]`). It is the `trusted` channel by definition.

**Rule-as-SoT + finding shape.** Rules are the single source of truth (P4). A finding chains
`finding → rule_id → constitution_ref`, giving audit-grade traceability — but only if the
`rule_id` is real **and eval-bound** (P1; enforced by `validate`, fix #6). See §8 for the finding
object, which is central to the trust model.

**Trust-fence + taint propagation (fix #1, the most important structural fix).** Trust is a tag on
the source artifact (P2). Crucially, **taint propagates through transformation**: when a Capability
processes untrusted input, the _free-text_ fields of its output (`problem`, `evidence`) **inherit
the untrusted tag**. Those fields are never injected as instructions into a downstream stage and
render as quoted/escaped data in PRs and the ledger. The floor-verifiable fields (`rule_id`,
`severity`, `file:line`) are trusted because enum-check / path-resolution produced them. **No
guaranteed decision ever rests on a tainted field** — it rests on the enum-gated fields (§8). This
is what stops an injected code comment from flipping a guaranteed block.

**Seam + seam-record + content-hash.** A seam = `{name, framework, runtime, packages[],
resolution, resolved_via, pinned_at, content_hash}`. The agnostic resolver resolves each needed
seam once through a confidence-gated chain (official skill → pinned ai*docs → model → fetch+pin →
ask; terminal fallback is **ask**, P5) and pins it to `seam-record.json` by commit hash **and
content hash**. Re-resolve only on a MAJOR bump of a pinned package. A re-fetch that changes
content **requires re-review (a diff a human sees)** — it never silently replaces. The seam-record
is the **only** place wiring facts live; a phase says "set the auth session at the seam," the
record says \_where, for this project*. **Seam answers are the single most expensive thing to
maintain** (they age with every framework release) — `LIMITS.md` and the pipeline treat seam
staleness as a first-class, loud signal, not a quiet check.

**Archetype + map-consistency (fix #5).** `archetype ∈ {ssr, backend, spa, lib}` (extensible),
detected deterministically (membership over `package.json`). It drives **four** independent maps:
constitution variant, which phases run, which grillers run, which plan sections exist. Nothing
ties those four together by default — and in v1 this drifted (a 12-phase plan vs a 10-phase build).
`validate` therefore checks that all four maps agree on the archetype set.

**Eval.** `{case, expected}`, one runner, deterministic-vs-judge per Capability. Evals are
regression suite and spec (P1). `validate` enforces presence and the `rule_id` binding.

**State.** Memory-bank = four canonical markdown files (`architecture-context`, `feature-catalog`,
`lessons-learned`, `pattern-library`), git-committed. Promotion of a lesson/pattern to canon is a
**gated** action with provenance per entry (which run / feature / diff) — memory poisoning is
silent and cumulative, so the floor gates the write (P2). Optional gitignored vector index over
lessons + catalog only. `seam-record.json` and `review-ledger` are the other durable files. All
state is human-readable canonical markdown.

---

## 6. The pipeline spine

`spec → plan → grill → build → regress → verify → ship`. Each stage emits a **typed artifact**
linking back to the spec:

| stage   | artifact             | key field                                    |
| ------- | -------------------- | -------------------------------------------- |
| spec    | `SPEC.md`            | intent (Draft → Approved)                    |
| plan    | `PLAN.md`            | `spec_id` **+ `spec_content_hash`** (fix #4) |
| grill   | grill-log            | findings vs plan                             |
| build   | `build-summary.json` | per-phase results                            |
| regress | regression-report    | regressions outside the feature              |
| verify  | verify-report        | compliance per verifier                      |
| ship    | ship-report          | decision + `PHARN ✓ reviewed` seal           |

**Keystone:** `SPEC.md` is the root artifact and every downstream artifact carries `spec_id`.
But **`spec_id` binds identity, not content** — so the plan also pins `spec_content_hash` (fix #4,
reusing the seam-record content-hash mechanism). If the spec is edited after the plan, the hash
diverges and it is **detectable, not silent**. This is what makes the intent → diff → finding →
decision chain actually audit-grade — and it is the foundation under the 2.0 moat ("the spec is
the one thing only you have"). An audit whose spec content floats under a stable id is **not**
audit-grade.

---

## 7. Enforcement — three moments, two gate kinds

Three moments, all reading **typed fields** (never model prose):

- **pre-write** — hooks; block before a bad edit lands. Hosts the **pre-egress allowlist** (a
  network call to a non-allowlisted domain does not execute, regardless of whether the model was
  fooled) and the **constitution/trusted-file write-guard** (fix #2) and the **`writes`-scope
  guard** (fix #7).
- **in-build** — validators; per-phase, gate a wave.
- **post-build** — lenses (at review), verifiers (at verify), auditors (on-demand). A lens cannot
  "decide approve" — it emits a typed finding list or nothing.

**Two gate kinds (fix #3) — do not conflate them:**

- **floor-gate** — computes a verdict from actual content (regex for a hardcoded secret,
  content-hash mismatch, an enum-roster `rule_id`). This is the **only** gate allowed to block a
  _guaranteed_ invariant.
- **advisory-gate** — reads LLM-assigned `severity`. It may escalate or warn; it is **never** the
  sole basis for a guaranteed/constitutional block.

The v1 "deterministic threshold gate over LLM severity" was advisory dressed as deterministic — it
is now labeled correctly (`LIMITS.md`).

`floor/validate.mjs` (the `validate` step) enforces, deterministically: capability frontmatter
present; evals present (P1); **every `enforces` rule_id produced by ≥1 eval** (P1, fix #6);
`coupling` enum membership; the four archetype maps agree (fix #5); finding templates separate
enum-gated from free-text fields (fix #1); no forbidden sibling reference (P3, best-effort grep).

---

## 8. The finding object (central to the trust model)

Every finding from any Capability has this exact shape. The split between **floor-verifiable** and
**tainted free-text** fields is the structural expression of fix #1:

```yaml
finding:
  # --- floor-verifiable (trusted: produced by enum-check / path-resolution) ---
  type: "<enum>" # FINDING | CONSTITUTION_VIOLATION | ...
  rule_id: "<file.md ID>" # MUST exist in the roster AND have an eval (P1, P4)
  severity: blocking | important | minor # enum; advisory when LLM-assigned (see fix #3)
  file: "<path:line>" # resolves to a real location
  # --- tainted free-text (inherits trust of the INPUT; rendered as DATA, never executed) ---
  problem: "<one sentence>" # P2: fenced; never injected downstream as instruction
  evidence: "<quote/snippet>" # P2: quoted/escaped in PR + ledger
```

A guaranteed decision (a constitutional block) is computed from the **floor-verifiable** fields
only. The free-text fields are for humans and are treated as untrusted data per P2. An injected
comment in reviewed code can at most influence an **advisory** judgment via the free-text fields —
it can never flip a floor-gated block.

**Residual (named, not hidden — `LIMITS.md`):** when a _downstream LLM stage_ consumes the
free-text of a finding, "do not execute this as an instruction" becomes a heuristic again. Fix #1
bounds the blast radius (free text never alone gates a guaranteed decision) but does not zero it.
This is the one place the trust model is not provable on paper — and is why bootstrap **attempt 0**
targets it (`README.md`).
