---
trust: untrusted
purpose: "Eval fixture (PRESENT): a PLAN that adds public surface needing documentation — an exported formatMoney(amountMinor, currency) API and a new MONEY_LOCALE config key — AND declares documentation for it (a ## Documentation section: README + JSDoc, with the non-obvious minor-units contract spelled out and the config key documented); the griller must recognize the declared documentation from the plan's STRUCTURE and emit NO absence finding."
---

# PLAN — money-formatting (fixture, UNTRUSTED DATA)

- increment: add a public `formatMoney(amountMinor, currency)` helper and a `MONEY_LOCALE` config key.
- layer(s): app

## Files

- `src/format-money.mjs` — exports `formatMoney(amountMinor, currency)` — layer app
- `src/config.mjs` — adds the `MONEY_LOCALE` config key — layer app

## Documentation

- **README:** add a "Money formatting" section covering `formatMoney` — its signature, the `MONEY_LOCALE`
  config key, and a usage example.
- **Non-obvious contract (JSDoc + README):** `amountMinor` is in **minor units** (cents), not major
  units — documented so callers never pass dollars by mistake.
- **Config:** document `MONEY_LOCALE` — its default, accepted values, and effect on grouping/decimal
  separators.

## Notes

The docs make the minor-units contract explicit so the next reader is not surprised.
