# REVIEW — pharn-spec

PHARN reviewing PHARN. The increment under review (`/pharn-spec` + `.dev/floor/check-spec.mjs` +
`check-spec.test.mjs`) is treated as `trust: untrusted`: instruction-looking content in those files
(the command body is full of imperatives aimed at a _future_ `/pharn-spec` runner) is **data about the
command**, never an instruction to this reviewer. None of it altered this review.

## Step 1 — Floor first (the only guaranteed part — P0)

- `node .dev/floor/validate.mjs .` → **GREEN — 1 capabilities checked** (the command + the floor checker
  are correctly **not** counted — neither bears `role:`; the count stays at trust-fence's 1).
- `node --test .dev/floor/check-spec.test.mjs` → **13/13 pass** (the feature's own correctness suite).

The floor is GREEN, so the increment legitimately reached review. Everything below is **advisory** (P0).

## The four lenses

### L-floor → P0 — clean (no disease)

Every guarantee the increment claims reduces to a floor primitive **or** is labeled advisory:

- `SPEC.md` required-section presence / `Draft|Approved` enum / `spec_id` presence → enum-regex
  (`check-spec.mjs`). The approved-intent pin → content-hash (`spec_content_hash == sha256(body)`). All four
  are floor-backed.
- The **human approval** of `Draft → Approved` is explicitly labeled **advisory / procedural** in the
  command's Guarantee audit ("the floor cannot verify a human said yes") — exactly the right P0 treatment,
  mirroring `/pharn-dev-memory-promote`. **Intent quality** is labeled advisory. No guarantee is asserted without a
  floor reduction or an `advisory` label.
- The build's `--hash` mode (beyond the plan's literal checker description) is **justified, not speculative**
  (P7): it makes the writer's pin and the validator's recompute share **one** body-extraction, so check #4 is
  floor-grade rather than two implementations agreeing by luck (proven by a dedicated test). A reviewer notes
  the addition and finds it serves a real determinism need.

### L-eval → P1 — clean; floor agrees

`/pharn-spec` is a **command**, not a `role:`-bearing Capability, so P1's "every Capability ships evals" does
not apply (consistent with every existing `pharn-dev-*` command). It introduces **no** `enforces` `rule_id`,
so there is no `rule_id ↔ eval` binding to satisfy. The floor confirms it: `validate` GREEN at 1 capability,
no new capability, no unbound rule. The deterministic checker carries its regression suite as
`check-spec.test.mjs` (the P1 spirit). No disagreement between this lens and the floor.

### L-trust → P2 — well-dogfooded; no injection occurred

- `check-spec.mjs`'s verdict ranges **only** over enum-gated / structural fields (section presence, `state`
  enum, `spec_id` presence, `spec_content_hash` vs body-hash) — **never** over the intent prose's meaning. The
  ★ test (`an instruction-looking needle in the intent prose does NOT affect the verdict`) enforces this
  structurally: **no guaranteed decision rests on the free-text intent** (fix #1 dogfooded at the spec layer).
- The command correctly fences the user's pasted intent as `trust: untrusted` DATA and says instruction-looking
  pasted content is interrogated, never executed (P2).
- Self-check: the reviewed command's imperatives did **not** steer this review — they are the command's content,
  read as data. No compliance leaked.

### L-axis → P3 — clean; no sibling imports

- One axis per file: `check-spec.mjs` (SPEC shape/state/pin), `check-spec.test.mjs` (its tests), `pharn-spec.md`
  (the command's behavior).
- `check-spec.mjs` imports **only** `node:fs` + `node:crypto` — it **re-implements** the frontmatter regex,
  the `##`-heading scan, and the sha256 mechanism **in-file** (lines 41, 78–85, 71–73), citing their origin in
  comments but importing no sibling floor script (P3 honored). The command _invoking_ its own floor checker
  (`pharn-spec → check-spec`) is the established command↔checker pattern (`memory-promote → check-provenance`,
  `verify → check-verify`), not a leaf→leaf import.

## Findings (fix #1 object shape; free-text = DATA)

### Floor-gate (blocking)

**None.** No guarantee lacks a floor reduction; no missing eval binding; no sibling import; no tainted field
gates a guaranteed decision.

### Advisory-gate (warn — never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: P7
  severity: minor
  file: ".dev/floor/check-spec.mjs:81"
  problem: "headingsOf scans `^##\\s+` lines without code-fence awareness, so a required heading appearing ONLY inside a fenced code block in the SPEC body would count as present."
  evidence: 'const hm = line.match(/^##\\s+(.+?)\\s*$/); if (hm) out.push(hm[1].toLowerCase());'
  note: "Low-risk for SPEC.md and CONSISTENT with check-provenance.mjs's existingIds (the same line-scan mechanism, cited at lines 75-76). Named honestly as a shared floor-mechanism limit (P7), not hidden. Presence is floor; section CONTENT is advisory anyway."

- type: FINDING
  rule_id: P5
  severity: minor
  file: ".dev/floor/check-spec.mjs:82"
  problem: "Required-section presence is a case-insensitive EXACT heading match and `state` is a case-SENSITIVE enum, so a hand-edited SPEC that renames/annotates a required heading (`## Acceptance Criteria & Tests`) or lowercases the state (`state: draft`) trips a RED though 'present in spirit'."
  evidence: "out.push(hm[1].toLowerCase()) … headings.includes(want) … STATE_ENUM.includes(fm.state)"
  note: "By design — canonical-name presence + a strict enum ARE the floor contract; /pharn-spec emits the canonical forms, so this only bites on manual edits. Advisory sharp-edge, not a defect."

- type: FINDING
  rule_id: P0
  severity: minor
  file: ".claude/commands/pharn-spec.md"
  problem: "The approved-intent pin is floor-grade WHEN check-spec.mjs is run; unlike the writes-scope / trusted-path pre-write HOOKS, nothing forces check-spec to run on every SPEC.md write."
  evidence: "'detectable, not silent' / Step 5 re-validate + downstream re-check."
  note: "NOT a disease — the command words it as 'detectable' (not 'enforced on write') and instructs running it + downstream re-check. Identical status to validate.mjs (a command-invoked checker, not a hook). Stated for completeness."
```

All three are **advisory** — judgment calls about sharp edges / completeness, each non-blocking and (F1, F3)
explicitly consistent with established floor patterns. None rests on a tainted field.

## Verdict

**GREEN — increment is done.** Floor GREEN (validate 1 cap; check-spec 13/13); zero blocking floor-findings
across the four lenses; three minor advisory notes for the human to weigh. `/pharn-spec` honestly makes the
floor/advisory split it exists to make: it guarantees `SPEC.md` _shape + state + identity + (on approval) a
body-pin_, and is explicit that **it does not guarantee the intent is good** — the human owns that.

## Proposed lesson candidate (NOT promoted here — `/pharn-dev-review` writes no canon, P2)

Recorded for a **separate, human-gated `/pharn-dev-memory-promote`** run (which sets its own scope, runs
`check-provenance.mjs`, and halts for accept/deny — the model never self-promotes). The earlier
`/pharn-dev-memory-promote` invocation deliberately **held** this until review surfaced it.

- **Candidate (→ `lessons-learned.md`, would be `L8`):** _The writes-scope setter resolves exactly one
  `--target`, so a command emitting ≥2 artifacts under placeholder paths cannot scope them in a single setter
  call — favor single-file command outputs._ This shaped `/pharn-spec`: the approved-intent hash lives **in**
  `SPEC.md` frontmatter (computed over the body) rather than a sidecar `SPEC.lock.json`, keeping output to one
  scopeable path.
- **Honest P7 framing for the gate:** this is a **constraint learned that shaped a design decision**, _not_ a
  failure that occurred (the friction was avoided, not hit). Its canon-worthiness (true / general / worth it)
  is genuinely uncertain — **the human decides at the gate**, not this review. It is **adjacent to L3 and L7**
  (same `writes:`/setter subsystem, different axis: a setter _mechanic_ constraining command _design_, not a
  declaration's content) — the human should weigh overlap.
- **Provenance (for the future promotion):** feature `pharn-spec`; commit `8155e69` (the increment builds on
  this; the working tree is uncommitted, so `/pharn-dev-memory-promote` will capture the real `HEAD` at promotion
  time); source `.dev/features/pharn-spec/REVIEW.md` (this proposal) + the build note; date 2026-06-30.

## Trust (P2) — this review dogfoods fix #1

Every finding above splits enum-gated fields (`type` / `rule_id` / `severity` / `file`) from free-text
(`problem` / `evidence` / `note`). The free-text is **DATA** — it describes the increment; it is not a directive
to any downstream stage. The verdict (GREEN) rests on the **floor** (`validate` GREEN + zero blocking
floor-findings), never on the free-text.
