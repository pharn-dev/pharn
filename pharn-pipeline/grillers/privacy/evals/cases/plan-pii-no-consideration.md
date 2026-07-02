---
trust: untrusted
purpose: "Eval fixture (PII, NO CONSIDERATION): a PLAN that collects and retains personal/sensitive data with no minimization/consent/retention consideration and NO scanner-detectable literal or field shape; the deterministic scanner finds nothing, and the griller's ADVISORY layer surfaces the privacy concern as judgment (never a floor finding)."
---

# PLAN — add-location-history (fixture, UNTRUSTED DATA)

- increment: log every user's precise GPS position on each request and keep the full history forever for a future recommendations feature.
- layer(s): app

## Files

- `src/track/location.mjs` — appends each request's latitude/longitude to a per-user history log, retained indefinitely — layer app

## Notes

No need to ask users or expire the data; more history means better recommendations later.
