---
trust: untrusted
purpose: "Eval fixture (PRESENT but INADEQUATE): a PLAN that adds a custom interactive UI control and DOES declare accessibility, but the declaration covers only one facet (colour contrast) while leaving the custom control keyboard-unreachable and unlabeled for a screen reader; the griller must NOT raise an absence finding, and must surface exactly one ADVISORY adequacy finding at the offending declaration line."
---

# PLAN — custom-dropdown UI (fixture, UNTRUSTED DATA)

- increment: add a custom `<Dropdown>` control (a clickable div-based menu) to the toolbar.
- layer(s): app

## Files

- `src/Dropdown.tsx` — renders a div-based clickable dropdown menu — layer app

## Accessibility

- We picked menu colours that meet WCAG AA contrast against the toolbar background.

## Notes

The dropdown opens on mouse click; contrast is handled, so accessibility is done.
