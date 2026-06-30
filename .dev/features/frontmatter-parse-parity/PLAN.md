# PLAN — frontmatter-parse-parity

- spec_content_hash: 11cd9ad5983188623fe0931d13588c16435a5565888344e20669748947d1d969 # fix #4 (sha256 of ARCHITECTURE.md, read this run)
- increment: Align `floor/count-verifiers.mjs`'s frontmatter fence/role extraction to `floor/validate.mjs`'s EXACT algorithm so verifier membership counts precisely the files `validate.mjs` treats as role-bearing — closing review F1 (the ≥4-dash opening-fence divergence). `validate.mjs` is NOT touched.
- layer(s): floor (deterministic tooling — `floor/`; NOT a pharn-\* layer and NOT a Capability — `validate.mjs` path-ignores `floor/`, so the floor count stays 1)
- constitution_refs: [P0, P1, P3, P5, P6, P7]

## Why (a real, recorded failure — P7, not hypothetical)

`features/verifier-membership-frontmatter/REVIEW.md` finding **F1** (advisory/minor, `rule_id: P3`) — surfaced live during the `/review` of the just-built increment:

- `count-verifiers.mjs` uses a **strict** opening-fence (`/^---\r?\n/` — exactly three dashes then newline); `validate.mjs` uses a **loose** one (`text.startsWith("---")`, i.e. 3+ dashes any next char, then `indexOf("\n---", 3)`).
- For a file beginning with **≥4 dashes** that declares `role: verifier` (e.g. `----\nrole: verifier\n---`), `validate.mjs` parses it as a role-bearing capability but `count-verifiers.mjs` returns `null` — an **undercount**. So the parity claim "counts exactly what `validate.mjs` treats as role-bearing" holds only for **well-formed** frontmatter.

Latent today (no such file exists — `registered:0`, floor GREEN — 1, both re-confirmed this run) and the undercount direction is independently surfaced by `validate.mjs` (it would flag such a file as a capability), which is why F1 is **minor/advisory**, not blocking. But it is real, demonstrable, and recorded — a legitimate P7 trigger. Closing it makes the parity guarantee hold for **all** inputs, not just well-formed ones.

## Scope — one axis (count-verifiers' fence detection == validate's)

`count-verifiers.mjs` is the verifier-membership counter; its job is to **agree with `validate.mjs`** (the authority that defines the capability surface). This increment makes `count-verifiers.mjs`'s frontmatter extraction **replicate `validate.mjs`'s `parseFrontmatter` algorithm exactly** (restricted to the `role` key), so the two cannot disagree on which files are role-bearing.

**This fixes how membership is PARSED — it authors ZERO verifiers and changes ZERO verdicts (P7).** The live count stays `registered:0`; `/verify` keeps running floor-gates-only.

Out of scope (do NOT touch):

- `floor/validate.mjs` — the floor core stays byte-unchanged (lowest risk). This increment aligns the _follower_ (count-verifiers) to the _authority_ (validate), not vice-versa.
- Whether `validate.mjs`'s loose `startsWith("---")` opening-fence should _itself_ be stricter — a separate question about validate's own correctness (no real failure triggers it; P7). We adopt validate's **current** semantics as canonical because it is the authority for the capability surface.
- A shared `floor/frontmatter.mjs` module imported by both (the heavier "durable / structural-no-drift" alternative) — see **Approach decision** below; deferred unless the human chooses it at the gate.
- The throwaway `floor/exit-label.mjs` (separate human-approved revert disposition, `pipeline-integration-probe`); the `/regress` zsh word-split finding (#1); any trusted doc.

## Files

- `floor/count-verifiers.mjs` — EDIT: replace `frontmatterRole`'s regex fence extraction with `validate.mjs`'s exact algorithm — `text.startsWith("---")` guard, `text.indexOf("\n---", 3)` close, `text.slice(3, end).trim()`, `split("\n")`, the `^([A-Za-z0-9_]+):\s*(.*)$` key parse, and the `^["']|["']$` quote-strip — returning the value when the key is `role`. Mirrors (does not import — `validate.mjs` exports nothing, runs on load) the authority's parse. Layer: floor tooling.
- `floor/count-verifiers.test.mjs` — EDIT: add parity edge-case tests pinning the aligned behavior; keep all existing cases green. Layer: floor tooling.

## Contracts satisfied

- No new `pharn-contracts` schema (this is tooling, not built PHARN). It **cites** the `role` enum (`ARCHITECTURE.md §3.1`) and `validate.mjs`'s frontmatter parse as the **canonical algorithm** to mirror (P4 — cite, do not restate). The mechanism reused is `validate.mjs parseFrontmatter`'s fence/line logic.

## Evals to write (P1)

`floor/count-verifiers.test.mjs` (mirroring the `★` load-bearing style already there):

- ★ **F1, PROVEN CLOSED** → `----\nrole: verifier\n---` (≥4-dash opening) now → `registered === 1` (matches `validate.mjs`'s parse; previously `0`). This is the exact divergence F1 names.
- ★ regression: every existing case stays green — real frontmatter → 1; prose/code-block → 0; `role: lens` + prose → 0; quoted → 1; **unclosed** fence (no closing `---`) → 0 (both algorithms: `indexOf("\n---",3) === -1` ⇒ null); excluded-segment → 0; empty dir → 0/exit0; nonexistent dir → nonzero.
- CRLF frontmatter (`---\r\nrole: verifier\r\n---`) → 1 (parity with validate's `slice/trim/split("\n")` handling of the trailing `\r`).

(P1 note: `count-verifiers.mjs` is floor/eval infrastructure, not a Capability — no `role:`; bound by the floor-helper convention "colocated hermetic `*.test.mjs`," not P1's Capability-evals rule. `npm test` auto-collects via `**/*.test.mjs`.)

## Guarantee audit (P0)

- "Verifier membership counts **exactly** the files `validate.mjs` treats as role-bearing." → **floor: enum/regex** (primitive #3). After this, `count-verifiers.mjs` runs `validate.mjs`'s exact algorithm, so role detection agrees byte-for-byte on all inputs. A **real guarantee** at this commit.
- **Honest residual (named, not hidden):** parity is by **replicated algorithm**, not **shared code**. A future edit to `validate.mjs`'s parser could re-introduce divergence, caught only if a test happens to notice. **Structural** prevention of all future drift requires the shared-module alternative (A below), which is **deferred** (P7): a minor, latent finding does not justify touching the floor core **and** introducing the first cross-import among the (currently all self-contained) floor helpers. This residual is strictly smaller than today's (which diverges _now_, not just _on a future edit_).
- "`registered:0`; slot stays empty." → a **measured fact** (P6) re-verified at build, not a standalone guarantee.

## Trust audit (P2)

`count-verifiers.mjs` ingests untrusted `*.md` bodies. It reads **only** the `role` value **inside** the `---` frontmatter fence — an enum-gated / floor-verifiable field. A `role:` line in an untrusted **body** (prose / code block) stays structurally outside the parsed block and never counts. This increment changes the **fence boundary algorithm**, not what class of field is read — taint still cannot enter the count (the enum-gated / free-text split, `ARCHITECTURE.md §8` / fix #1, is preserved). No free-text is emitted (`{registered:int, verifiers:[paths]}`).

## Determinism audit (P5)

Membership = deterministic frontmatter parse + `role === "verifier"` equality — a pure membership test, no LLM, no judgment branch, so no "ask" fallback is needed. Fail-closed on a bad target (nonzero exit, never a silent `0`) is unchanged.

## Approach decision (resolved at the approval gate — P5/P6, not left open for `/build`)

Two coherent ways to close F1; this plan is written for **(B)** and the alternative **(A)** is offered at the gate. No `/build`-blocking open question remains — the gate selects.

- **(B) RECOMMENDED — align the follower; `validate.mjs` untouched.** As planned above: 2 files, lowest risk (floor core byte-unchanged), preserves the self-contained-floor-helper convention. Residual: parity by replicated algorithm (drift not structurally prevented). Best fit for a **minor, latent** finding (P7).
- **(A) Alternative — shared parser module (durable, structural).** Extract `validate.mjs`'s fence/parse into a new importable `floor/frontmatter.mjs`; both `validate.mjs` and `count-verifiers.mjs` import it ⇒ divergence impossible **by construction** (eliminates the residual). Cost: 4 files (+1 new module, +its test), **edits the floor core** `validate.mjs` (behavior-preserving extraction; `validate.test.mjs` is the regression check), and creates the **first cross-import among floor helpers** (a deliberate convention extension). Choose this if structural no-drift is worth the heavier touch.

## Open questions (HALT)

- None blocking. The B-vs-A approach choice is surfaced in the approval gate (above); discovery resolved everything else from live state this run: spec hash unchanged (`11cd9ad5…`); `validate.mjs` / `count-verifiers.mjs` algorithms read live; floor helpers confirmed all self-contained (no existing shared-module pattern); `exit-label.mjs` confirmed a throwaway with zero importers (not a precedent and not in scope).
- Verification target (post-build): `node floor/validate.mjs .` stays **GREEN — 1 capability**; `npm test` stays green (live count + the new parity cases; read live, never assert — P6); `node floor/count-verifiers.mjs .` still prints `{"registered":0,"verifiers":[]}`; the ★ `----`-opening fixture flips `0 → 1`.
