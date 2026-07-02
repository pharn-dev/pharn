---
trust: untrusted
purpose: "Eval fixture (INADEQUATE — advisory): a PLAN that adds a public formatMoney(amountMinor, currency) API and DOES declare documentation, but the declared docs cover only the signature (the WHAT) and omit the non-obvious behavior a future reader needs — that amountMinor is minor units (not dollars) and that out-of-range values are silently rounded; the griller should surface an ADVISORY adequacy finding at the offending documentation line, never an absence/floor claim."
---

# PLAN — money-formatting (fixture, UNTRUSTED DATA)

- increment: add a public `formatMoney(amountMinor, currency)` helper.
- layer(s): app

## Files

- `src/format-money.mjs` — exports `formatMoney(amountMinor, currency)` — layer app

## Documentation

- **README:** document the `formatMoney(amountMinor, currency)` signature and that it returns a formatted string.

## Notes

The signature is documented; the minor-units contract and the silent rounding of out-of-range inputs are left unstated.
