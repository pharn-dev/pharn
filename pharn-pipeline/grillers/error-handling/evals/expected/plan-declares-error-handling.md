---
trust: trusted
purpose: "Expected output for plan-declares-error-handling: the plan declares a real error-handling approach for a change that needs it → the griller recognizes PRESENCE and emits ZERO findings; any adequacy doubt is advisory prose, never an absence finding."
---

# Expected — plan-declares-error-handling

The plan carries a populated `## Error handling` section (timeout, bounded retry with backoff, cached
fallback, malformed-response rejection) for a change that needs it. The griller recognizes the declared
approach as **present** and emits **zero** findings.

## The expected output

No findings. `finding_count == 0`.

The griller records "error-handling declaration recognized as present" in prose, then runs its advisory
adequacy layer. If it has any doubt about the approach's adequacy, it raises that as **advisory prose** —
never as an absence finding — and it does **not** manufacture a concern.

## Why this PASSES

- A real error-handling declaration is present in the plan's **structure** → the PRESENCE layer emits no
  absence finding.
- Adequacy is a separate, advisory judgment; here the declared approach is thorough, so no advisory
  concern is warranted, and none is invented.
