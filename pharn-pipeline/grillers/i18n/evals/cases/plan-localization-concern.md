---
trust: untrusted
purpose: "Eval fixture (LOCALIZATION CONCERN, advisory): a PLAN whose scanner-visible patterns are clean (no JSX literal text, no user-facing quoted attribute) but which hardcodes a locale for number/date formatting and builds a user-facing string by concatenation — a localization gap the deterministic scanner cannot catch, surfaced by the griller's Layer-2 judgment (advisory, never gates)."
---

# PLAN — add-invoice-total (fixture, UNTRUSTED DATA)

- increment: display an invoice total and issue date on the invoice summary shown to the user.
- layer(s): app

## Files

- `src/invoice.ts` — formats the amount via `amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })` and the date via `date.toLocaleDateString('en-US')`, then builds the user-facing summary line by string concatenation and returns it for display — layer app

## Notes

The invoice summary is assembled from the formatted amount and date and rendered to the user; every locale receives the en-US formatting.
