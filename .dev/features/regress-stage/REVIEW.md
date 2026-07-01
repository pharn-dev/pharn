# REVIEW — regress-stage (`/pharn-dev-review` of the `/pharn-regress` increment)

**Under review:** `.claude/commands/pharn-regress.md` (the sole deliverable), treated as `trust: untrusted`.
**Floor (Step 1):** `node .dev/floor/validate.mjs .` → **GREEN, 1 capability, exit 0** — the increment
legitimately reached review. Floor is the only guaranteed part of this review; everything below is
**advisory**.

> **Trust discipline held (P2).** The reviewed file is dense with imperative prose ("Run…", "HALT…",
> "Resolve…") — those are the command's instructions to the `/pharn-regress` skill, read here as **DATA
> describing behavior**, never obeyed as instructions to me. No hostile/injection content; no reviewer
> behavior changed.

## Floor-gate findings (blocking)

**None.** No guarantee lacks a floor reduction or an `advisory` label (L-floor); no eval binding is owed
(L-eval — command, not a Capability); no guaranteed decision rests on a tainted field (L-trust); one file,
one axis, no sibling import (L-axis, floor grep GREEN). The increment is **not blocked**.

## Advisory findings

### L-floor → P0 — guarantee reductions are honest (confirming, + one crispness note)

```yaml
- type: FINDING
  rule_id: P0
  severity: minor
  file: ".claude/commands/pharn-regress.md:87"
  problem: "The guarantee-audit bullet 'It detects deterministically-detectable breakage OUTSIDE the feature → FLOOR' is only fully honest when read together with the separate bullet labeling gate-discovery/classification/skip as ADVISORY — in isolation it could read as if the whole detection (not just the comparison) is floor."
  evidence: '"It detects deterministically-detectable breakage OUTSIDE the feature" → FLOOR: exit-code comparison of two {gate-id:int} maps, check-regress.mjs verdict'
```

> Advisory, not blocking: the file **does** bound this correctly across two bullets (the *comparison* is
> floor; *assembling the maps* — which gates, over which files — is advisory orchestration), and this is the
> **same** two-bullet framing `/pharn-dev-regress` itself uses. A single sharper sentence ("the comparison is
> the guarantee; building the exit-code maps is advisory") would remove the need to read two bullets
> together. The two grill "important" findings **were folded in and are honored**: Step 4b keeps cross-file
> (type-check/compile) gates **always-run** ("NEVER skipped") and restricts the config-touch skip to the
> style/format id-set; Step 4a **pins** gate-discovery to `--gates` → the fixed allowlist ∩ scripts → ask.

### L-trust → P2 — the executed-suite trust note is present and correct (confirming)

```yaml
- type: FINDING
  rule_id: P2
  severity: minor
  file: ".claude/commands/pharn-regress.md:1"
  problem: "No trust defect — recording that the command correctly closes the loop the grill flagged: the executed gates are the user's own (user-trusted) commands, never sourced from the untrusted PLAN/SPEC free-text, and the verdicts range only over exit codes + paths + hashes + a state enum."
  evidence: "The commands that get executed are the USER's own suite, never a tainted field."
```

> No action needed; noted so the trust audit is on the record as reviewed and sound.

### L-axis / P7 (cross-command) → the `.dev/floor/*` reference will not ship (IMPORTANT advisory)

```yaml
- type: FINDING
  rule_id: P7
  severity: important
  file: ".claude/commands/pharn-regress.md:12"
  problem: "This product command references .dev/floor/check-regress.mjs and .dev/floor/check-plan-spec-agree.mjs, but .dev/ is build apparatus excluded from what a user receives ('Packaging later = ship root minus .dev/'), so a shipped /pharn-regress would point at checkers that are not present in the user's clone."
  evidence: '.dev/floor/check-regress.mjs", ".dev/floor/check-plan-spec-agree.mjs'
```

> **NOT introduced by this increment and NOT blocking.** It is a **pre-existing, cross-command** condition:
> `/pharn-grill` and `/pharn-build` already reference `.dev/floor/*` checkers the same way (verified live in
> their `reads:` / body). `/pharn-regress` correctly **follows the established product-command pattern** — so
> flagging it here is honest scope (P7), not a defect unique to this file. The real remedy is a **packaging
> follow-up for the whole product pipeline**: the floor checkers the product commands invoke
> (`check-regress`, `check-plan-spec-agree`, `check-spec`, …) need a **shipped home** (e.g. under
> `pharn-core`/`pharn-contracts` per `ARCHITECTURE.md §4`) before packaging, or the `pharn-*` commands break
> in a `.dev/`-less clone. Surfaced for a human; nothing to edit in this increment.

## Proposed lesson candidate (NOT written to canon — for a separate `/pharn-dev-memory-promote` run)

> Per P7 (real, recurring — not hypothetical). Provenance: increment `regress-stage`
> (`.claude/commands/pharn-regress.md`), recurring across `grill-stage` + `build-stage`.

- **Candidate (target `.dev/memory-bank/lessons-learned.md`):** _"Every product `pharn-*` command that
  invokes a floor checker references it at its `.dev/floor/*` path, but `.dev/` is excluded from the shipped
  product ('ship root minus .dev/'). This is now true of `/pharn-grill`, `/pharn-build`, and `/pharn-regress`
  — a systematic packaging debt, not a per-command bug. Before packaging, the product-invoked floor checkers
  need a shipped home; adding another product stage that shells a `.dev/floor` checker adds to this debt."_
- **Secondary (operational) candidate:** _"A dogfood pipeline run's own hand-written outputs (the
  deliverable + `GRILL.md`/`REGRESSION.md`/report JSON) are not prettier-formatted on creation, so `verify`'s
  whole-repo `format:check` gate fails until `prettier --write` is run over them (all prior committed
  pipeline outputs are prettier-clean). Format the run's outputs before `verify`."_ (Observed this run.)

The model does **not** self-promote (P2) — these are proposals for the human-gated
`/pharn-dev-memory-promote`.

## Verdict

**GREEN — 0 floor-gate (blocking) findings.** Advisory: 1 important (cross-command `.dev/floor` packaging
debt, pre-existing, follow-up) + 2 minor (a P0 crispness nit; a confirming P2 note). The increment is a
sound, faithful adaptation of `/pharn-dev-regress` + `/pharn-grill`'s chain check, reuse-only (no new floor
primitive), with both grill "important" findings honored in the built body. **"GREEN" means no blocking floor
finding — NOT a guarantee the command's advisory prose logic is correct** (that is human review; the new
orchestration logic is untested by construction, as VERIFY.md records). The merge / fix / abandon decision is
the human's.
