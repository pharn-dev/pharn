---
spec_id: probe-greeting
spec_content_hash: "843b43880ea257c4fcf946ee8ab73fb1d0b4e1032204df24772c53ebec852807"
---

## Approach

Implement `greet(name)` as a single pure ES-module function that returns the template string
`` `Hello, ${name}!` ``. No imports, no I/O, no side effects — a named export from one `.mjs` file. This is the
smallest implementation that satisfies the SPEC's Acceptance Criteria; it is **advisory** model work, checked
downstream (a manual AC run, and the integration probe wrapping this pipeline).

## Steps

- Create `features/probe-greeting/greet.mjs` exporting `function greet(name)` that returns
  `` `Hello, ${name}!` ``.
- Verify the acceptance criterion manually: `greet("World")` returns exactly `Hello, World!` (a `node -e`
  one-liner — advisory, no wired test per the SPEC's Out-of-scope).

## Files

- `features/probe-greeting/greet.mjs` — the pure `greet(name)` function (named export, zero imports)

### Explicitly not touched

- _(nothing reused or excluded — this feature adds one new file and edits no existing module, command, floor
  checker, hook, or trusted doc.)_

## Acceptance mapping

- `greet("World")` returns exactly `Hello, World!` → the template string `` `Hello, ${name}!` `` returns
  `Hello, World!` for `name === "World"`.
- `greet.mjs` exports `greet`, importable as a zero-dependency ES module → a named `export function greet`, no
  `import` statements.
- The function is pure → a single `return` of a template string; no I/O, no mutation, no side effects.

## Risks & open questions

- Edge inputs (empty string, non-string, `null`/`undefined` `name`) are unspecified by the SPEC and deliberately
  out of scope — `greet(undefined)` would return `"Hello, undefined!"`; acceptable for a throwaway vehicle.
- The acceptance check is manual (no `npm`-wired test), so "done" rests on the one-liner above, not a floor gate.
