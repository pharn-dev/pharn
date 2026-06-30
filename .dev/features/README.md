# .dev/features/ — build-loop artifacts (building PHARN itself)

Each increment of **building PHARN-OSS** gets one folder here — `.dev/features/<feature-name>/` —
holding its **process and audit artifacts** from the build loop (the `pharn-dev-*` commands):

- `PLAN.md` — the approved plan, pinning `spec_content_hash` (fix #4), committed
- `GRILL.md` / `REVIEW.md` / `REGRESSION.md` / `VERIFY.md` / `SHIP.md` — the grill / review / regress /
  verify / ship audit trails, written only when that stage actually ran

These record _how_ an increment of PHARN was specified, planned, grilled, built, and reviewed. This is
the **developer / contributor** side of the dev/product boundary — the apparatus a PHARN contributor
uses, **not** what a PHARN user receives. The built capabilities themselves live in their modules at the
repo root (`pharn-contracts/`, `pharn-review/`, …); the PRODUCT pipeline's artifacts live in the
**root-level `features/`** (see `../../features/README.md`).

Artifacts are written only when they genuinely exist. An increment that had no SPEC or PLAN — e.g. a
hand-built probe predating the pipeline — records that honestly rather than backfilling a fabricated one
(see `.dev/features/trust-fence/NOTES.md`).
