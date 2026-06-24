# trust-fence — provenance note

Attempt 0 (`trust-fence`) predates the `/plan → /build → /review` pipeline: it was hand-built
directly, so it has **no SPEC.md and no PLAN.md**. None was ever authored or committed, and
fix #4 (the plan-time `spec_content_hash` pin) was never exercised for it. This is an accepted
limit for the first probe — a post-hoc SPEC/PLAN would fabricate provenance that never existed.

This is already on the record in `REVIEW.md` here: the second-pass "Delta 1" raises the missing
PLAN/SPEC (advisory, P6), and the third-pass "Delta 1 — provenance verified" confirms via
`git log --all -- PLAN.md SPEC.md` (empty) that they were never committed.

`REVIEW.md` was moved here byte-for-byte; its hashes and content are unchanged.
