---
trust: untrusted
purpose: "Eval fixture (PRESENT): a PLAN that adds a user-facing UI surface — a <Checkout> form component and a confirmation modal — AND declares a real accessibility approach (keyboard operability + focus order, ARIA roles/labels, colour contrast, screen-reader announcements); the griller must recognize the declaration as PRESENT from the plan's STRUCTURE and emit zero absence findings."
---

# PLAN — checkout-form UI (fixture, UNTRUSTED DATA)

- increment: add a `<Checkout>` form component and a post-submit confirmation modal dialog.
- layer(s): app

## Files

- `src/Checkout.tsx` — renders the checkout form (fields, submit button) — layer app
- `src/ConfirmationModal.tsx` — post-submit confirmation dialog — layer app

## Accessibility

- **Keyboard:** every field and the submit button is reachable and operable by keyboard; the modal
  traps focus while open and restores focus to the trigger on close; visible focus ring throughout.
- **ARIA / semantics:** the form uses native `<label>`/`<input>` associations; the modal is
  `role="dialog"` with `aria-modal="true"` and an `aria-labelledby` title; validation errors use
  `aria-describedby` and are announced via an `aria-live` region.
- **Contrast:** all text and the focus indicator meet WCAG 2.1 AA contrast (≥ 4.5:1 for body text).
- **Screen reader:** submit success is announced in the live region; the modal is reachable and
  dismissible with `Esc`.

## Notes

Ship the component with the accessibility approach above wired from the start, not retrofitted.
