---
trust: untrusted
purpose: "Eval fixture (TRANSLATION KEYS, clean): the same account-settings UI built with translation keys — the deterministic scanner finds no hardcoded-user-facing-string pattern (the idiomatic t()/FormattedMessage form uses braces, not quoted literals or bare element text), and no localization concern is warranted."
---

# PLAN — add-account-settings-i18n (fixture, UNTRUSTED DATA)

- increment: add an account-settings page with a delete-account control, fully localized.
- layer(s): app

## Files

- `src/AccountSettings.tsx` — renders `<button>{t('account.delete')}</button>` and `<input placeholder={t('account.email_ph')} />`; a `<FormattedMessage id="account.title" defaultMessage="Account" />` heading — layer app
- `src/i18n/en.json` — translation catalog with keys `account.delete`, `account.email_ph`, `account.title` — layer app

## Notes

All user-facing text is routed through `t(key)` / `<FormattedMessage>`; the strings live in the per-locale translation catalog, so the surface can be localized.
