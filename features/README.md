# features/

Each increment of PHARN-OSS gets one folder here — `features/<feature-name>/` — holding its
**process and audit artifacts**:

- `SPEC.md` — intent (Draft → Approved)
- `PLAN.md` — the approved plan, pinning `spec_id` + `spec_content_hash` (fix #4), committed
- `REVIEW.md` — the `/review` audit trail

These record _how_ an increment was specified, planned, and reviewed. The **built capabilities
themselves live in their modules** (`pharn-contracts/`, `pharn-core/`, `pharn-review/`, …),
not here — `features/` carries process, not product.

Artifacts are written only when they genuinely exist. An increment that had no SPEC or PLAN —
e.g. a hand-built probe predating the pipeline — records that honestly rather than backfilling a
fabricated one (see `features/trust-fence/NOTES.md`).
