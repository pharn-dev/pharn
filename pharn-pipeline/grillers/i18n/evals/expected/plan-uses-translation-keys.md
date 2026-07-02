---
trust: trusted
purpose: "Expected output for plan-uses-translation-keys: the deterministic scanner reports found:false (the idiomatic t()/FormattedMessage form is not a hardcoded literal), and Layer-2 judgment finds no localization concern → the griller emits ZERO findings."
---

# Expected — plan-uses-translation-keys

The griller runs `.dev/floor/scan-plan-i18n.mjs` over the plan; it reports `{"found":false,"hits":[]}`.
The clean, translation-key path is **not flagged**: the griller emits the empty finding array `[]`.

## The expected output

```json
[]
```

## Why this PASSES — the clean path is not a hardcoded string

- `<button>{t('account.delete')}</button>` — the element's text content is an **expression** `{…}`, not a
  literal, so the `jsx-text-literal` pattern (which requires a letter immediately after `>`) does **not** fire.
- `placeholder={t('account.email_ph')}` — the attribute value is a **brace expression**, not a quoted
  literal, so the `user-facing-attribute-literal` pattern (which requires `="…"`) does **not** fire.
- `<FormattedMessage id="account.title" defaultMessage="Account" />` — `id` and `defaultMessage` are the
  **correct i18n mechanism** and are deliberately **excluded** from the scanner's attribute set; the catalog
  keys (`account.delete`, …) are keys, not user-facing text, and are not in a scanner-visible position.

## FAILING outputs (the eval FAILS on any of these)

- **Any finding emitted** — the griller manufactured a concern on a correctly-localized plan. **FAIL.**
- Treating a translation **key** (`'account.delete'`) or the `defaultMessage`/`id` mechanism as a hardcoded
  user-facing string. **FAIL** (over-triggering; the honest bound is a detector, not a witch-hunt).

## Note (P0)

`found:false` / zero findings means **"no hardcoded-user-facing-string pattern was detected and no concern
was warranted"** — it does **not** mean "the plan is fully localized" (that is not a floor claim). The
scanner is a detector, not a proof of localization.
