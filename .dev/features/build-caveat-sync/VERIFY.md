# VERIFY — build-caveat-sync (`/pharn-dev-verify` of the caveat doc-sync)

- **Feature:** `build-caveat-sync` — pure prose doc-sync of the stale scope-source caveat in `.claude/commands/pharn-build.md` (no behavioral change, no test).
- **Verifiers:** `node .dev/floor/count-verifiers.mjs .` → `{"registered":0,"verifiers":[]}` — no verifiers registered, floor gates only (P7).

## FLOOR gates (the verdict — `.dev/floor/check-verify.mjs`, exit 0)

| gate                     | exit | meaning                                          |
| ------------------------ | ---- | ------------------------------------------------ |
| `test`                   | 0    | `npm test` GREEN — 165 tests (unchanged)         |
| `validate`               | 0    | `validate.mjs` GREEN — 1 capability              |
| `lint`                   | 0    | `npm run lint` (eslint) clean                    |
| `format:check`           | 0    | `npm run format:check` (prettier) clean          |
| `lint:md`                | 0    | `npm run lint:md` (markdownlint) clean           |
| `structural:trust-fence` | 0    | `check-structural.mjs` over the eval pair, clean |

**VERIFIED: floor gates PASS.** All six gates exit 0 (the full `npm run check` aggregate + `validate` + `structural`, per the verify-style-gates gate set). The verdict is `check-verify.mjs`'s exit-code threshold (`every gate === 0`).

## Verdict (FLOOR — `check-verify.mjs`, exit 0)

**VERIFIED: floor gates PASS** (all six deterministic gates exit 0). No verifier findings (zero registered).

**Honest residual (P0/P7):** verified = **the named gates passed** — NOT a guarantee of correctness beyond what those gates check. For a pure doc-sync this is narrow by nature: the gates confirm the repo is green with the edit in it (markdown style, tests, floor), not that the caveat's new wording is the "right" description — that is the human's call at the post-review gate. Verifier concerns would be advisory help, not assurance, and none exist today.
