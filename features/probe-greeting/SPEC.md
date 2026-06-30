---
spec_id: probe-greeting
state: Approved
spec_content_hash: "843b43880ea257c4fcf946ee8ab73fb1d0b4e1032204df24772c53ebec852807"
---

## Intent

Add a single pure function `greet(name)` that returns the string `Hello, <name>!`. This feature exists **only
as a throwaway vehicle** for the product-pipeline integration probe
(`.dev/features/product-pipeline-probe/`) — it gives the four product stages (`/pharn-spec → /pharn-plan →
/pharn-grill → /pharn-build`) something real to specify, plan, grill, and build so the **chain itself** can be
measured end-to-end. The function has no long-term value and may be reverted in a follow-up increment. The
desired outcome is not the function; it is a clean traversal of the product pipeline with a concrete,
checkable acceptance criterion the chain can carry.

## Scope

**In scope:** one pure, deterministic function `greet(name)` in `features/probe-greeting/greet.mjs` that
returns `` `Hello, ${name}!` `` for a string `name`.

**Out of scope:** any real product capability; input validation or edge-case handling (empty string,
non-string, `null`/`undefined` `name` are deliberately unspecified); tests wired into `npm` / CI; localization;
any long-term maintenance commitment.

## Acceptance Criteria

- Calling `greet("World")` returns exactly the string `Hello, World!`.
- `greet.mjs` exports `greet` and is importable as an ES module with zero dependencies.
- The function is pure: same input → same output, no I/O, no side effects.

## Constraints

- Pure and deterministic; zero imports; no I/O, no network, no filesystem access.
- A single `.mjs` file under `features/probe-greeting/` — no changes to any other module, command, floor
  checker, hook, or trusted doc.
- The function makes **no guarantee claim** of its own (P0): it is a vehicle, not a capability, and owes no
  floor reduction.
