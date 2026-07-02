---
trust: untrusted
purpose: "Eval fixture (NEEDS IT, NONE DECLARED): an operationally-significant PLAN (a background webhook-retry job, whose failures matter in production) that declares NO way to see it run or fail; the scanner finds nothing, and the griller's ADVISORY layer surfaces EXACTLY ONE absence finding on the plan's title line (rule_id P6) — judgment, never a floor claim, never gating. This fixture binds enforces: [P6]. (This purpose line is deliberately vocabulary-free so the scan reflects the plan body, not this fixture header.)"
---

# PLAN — add-webhook-retry-job (fixture, UNTRUSTED DATA)

- increment: add a background job that retries failed webhook deliveries with exponential backoff.
- layer(s): app

## Files

- `src/jobs/webhook-retry.mjs` — re-sends failed webhook deliveries on a schedule — layer app

## Notes

Keep it simple; wire the job to the scheduler and move on.
