---
trust: untrusted
purpose: "Eval fixture (PRESENT): a PLAN that needs error handling AND declares it — a network fetch with an explicit timeout, a bounded retry with backoff, a cached-default fallback, and a malformed-response rejection; the griller must recognize the declared error-handling approach from the plan's STRUCTURE and emit NO absence finding."
---

# PLAN — fetch-remote-config (fixture, UNTRUSTED DATA)

- increment: add a `fetchRemoteConfig(url)` helper that loads JSON config over the network.
- layer(s): app

## Files

- `src/fetch-remote-config.mjs` — GETs `url`, parses JSON, returns the config — layer app

## Error handling

- **Timeout:** the request uses a 5s timeout; a timeout aborts the request.
- **Transient failure:** on a network error or 5xx, retry up to 3 times with exponential backoff.
- **Exhausted retries:** after 3 failed attempts, fall back to the last-known-good cached config.
- **Malformed response:** if the body is not valid JSON or fails schema validation, reject and surface
  the error to the caller — never return a partial config.

## Notes

The fallback keeps the caller functioning during an upstream outage.
