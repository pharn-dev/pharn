# PLAN — revert-exit-label

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read this run)
- increment: Revert the spent pipeline-integration-probe vehicle — remove `floor/exit-label.mjs` + `floor/exit-label.test.mjs` — now that the probe is committed and the helper has zero importers (its own human-approved revert disposition, 2026-06-26).
- layer(s): floor (deterministic tooling — `floor/`; not a pharn-\* layer, not a Capability)
- constitution_refs: [P0, P6, P7]

## Why (a real, recorded disposition — P7, not hypothetical)

`floor/exit-label.mjs` self-documents (lines 9–13): _"THROWAWAY INTEGRATION-PROBE VEHICLE … meaningless by design and is SCHEDULED FOR REVERT in a follow-up increment (human-approved disposition, 2026-06-26; see features/pipeline-integration-probe/PLAN.md)."_ It existed only to give the first full pipeline run one trivial real increment to carry end-to-end (closing GAP 1 + GAP 2). That probe is **committed** (`f061577`, #14) and its deliverable — the measured chain run — is recorded. The vehicle's purpose is spent; keeping it is dead weight that inflates the floor/test surface with a file whose own header says delete me.

Discovery this run (`git grep "exit-label\|exitLabel"`): **zero active dependents.** References exist only in `features/pipeline-integration-probe/*` (historical records of the increment that created it) and one `features/frontmatter-parse-parity/PLAN.md` mention noting it as out-of-scope. No code import, no command, no `CLAUDE.md`, no `CHANGELOG` references it. Removal is clean.

## Scope — one axis (remove the spent probe vehicle)

Delete the two files; nothing else.

Out of scope (do NOT touch):

- The historical probe docs (`features/pipeline-integration-probe/*`) — append-only records that correctly describe what was done; the revert does not falsify them, so they stay.
- The broader gap this surfaces — **PHARN's `/build` has no deletion primitive** (see Execution). Adding one is a separate increment, not triggered by a real failure here (P7).
- Any trusted doc; the open probe findings #1 / #3 / #4 (each its own increment).

## Files (these are DELETIONS, not writes)

- `floor/exit-label.mjs` — **DELETE** — the throwaway helper — layer: floor tooling.
- `floor/exit-label.test.mjs` — **DELETE** — its colocated hermetic test — layer: floor tooling.

## Execution (honest: `/build` does not delete)

`/build` _"writes only the files the plan names"_ and its scope-setter scopes paths for **writing** — it has **no deletion step**. So this increment is **not** executed by `/build`. Its action is a direct removal:

```bash
git rm floor/exit-label.mjs floor/exit-label.test.mjs
```

Deterministic verification gate (the floor of this increment):

- `node floor/validate.mjs .` → stays **GREEN — 1 capability** (exit-label is in `floor/`, path-excluded; the capability count is unaffected by its presence or absence).
- `npm test` → stays green; the total drops by `exit-label.test.mjs`'s 3 cases (read live — no test asserts the suite total; `CLAUDE.md`'s count is read-live per P6).

Then `/review` verifies the increment. (The "no deletion primitive" point is a real, minor PHARN observation, recorded here — not fixed here, P7.)

## Contracts satisfied

- None. This removes floor/eval infrastructure; it adds no Capability, contract, or rule. It cites the probe's `PLAN.md` revert disposition (P4 — cite, don't restate).

## Evals to write (P1)

- None added. `exit-label.mjs` is floor infrastructure (no `role:`), not a Capability — P1's Capability-evals rule never bound it; its colocated `*.test.mjs` is removed **with** it. No `enforces` `rule_id` is added or orphaned.

## Guarantee audit (P0)

- The increment makes **no** guarantee claim. It removes a helper that itself made none — the probe's own `REVIEW.md` (L-floor) recorded _"it is a label lookup, not a gate … nothing in the floor reduces through it."_ Removing it therefore changes **zero** guarantees and no floor reduction depends on it.
- "The removal is clean (nothing breaks)." → **floor: enum/regex + test** — `validate.mjs` stays GREEN (capability count unchanged) and `npm test` stays green. Deterministic, verified at execution and again at `/review`.

## Trust audit (P2)

- N/A — the increment ingests no untrusted artifact (it is a deletion). No canon is written (no memory-bank promotion).

## Determinism audit (P5)

- N/A — no branch, no classification. The action is a fixed deletion; the verification is deterministic (floor + test exit codes).

## Open questions (HALT)

- None blocking. Discovery resolved everything from live state this run: the disposition is human-approved (in-file, 2026-06-26); the probe is committed (`f061577`); zero active dependents (`git grep` this run); spec hash unchanged (`11cd9ad5…`). The one wrinkle — `/build` has no deletion step — is **resolved** (execute via `git rm`), not a blocker; it is surfaced as an out-of-scope observation.
