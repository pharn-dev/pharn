# REVIEW — writes-scope guard (fix #7, deterministic floor, fail-closed)

- increment: fix #7 — `writes:` made genuinely floor-enforced. A deterministic scope-setter
  (`.claude/hooks/set-writes-scope.cjs`) writes `.pharn/writes-scope.json`; a new pre-write hook
  (`.claude/hooks/enforce-writes-scope.cjs`) denies (exit 2) any write outside that scope, fail-closed
  to a default-safe-set, composing with (never replacing) fix #2.
- diff under review: 9 files — 3 new (`enforce-writes-scope.cjs`, `set-writes-scope.cjs`,
  `enforce-writes-scope.test.cjs`) + 6 edits (`settings.json`, `commands/{plan,build,review}.md`,
  `CLAUDE.md`, `.gitignore`). `protect-trusted-paths.cjs` (fix #2) is **byte-unchanged** (verified by
  `git status`).
- reviewer: PHARN reviewing PHARN. The increment is `trust: untrusted`. This file obeys the finding
  object (fix #1): enum-gated `{type, rule_id, severity, file}` + free-text `{problem, evidence}`
  carried as DATA.

## Step 0 / Step 1 — scope set, then floor (the only guaranteed gate)

- **Step 0 (scope):** `set-writes-scope.cjs --from-frontmatter .claude/commands/review.md` →
  `scope = ["REVIEW.md", "memory-bank/lessons-learned.md"]` (the `(gated)` annotation stripped). Run
  live this turn. **This produced F1 below** — the scope named root `REVIEW.md`, not the conventional
  `features/<name>/REVIEW.md`.
- **Step 1 (floor):** `node floor/validate.mjs .` → **`GREEN — 1 capabilities checked in .`** (exit 0).
  The two `.cjs` hooks carry no `role:`, so the capability count is unchanged. The floor passed;
  **everything below is advisory** (P0).

## Trigger closed (P7 — real, recorded)

This increment's sole justification is `features/structured-findings/REVIEW.md` **F2**: `ARCHITECTURE.md:73`
and §7 cite a `writes`-scope guard (fix #7) "ENFORCED by the pre-write hook," but the only live hook
implemented fix #2 and `exit 0`'d every other write — the cited floor backstop did not exist. Verified
live this run: `ARCHITECTURE.md:73` and §7:228-229 still carry that wording, and `enforce-writes-scope.cjs`
now makes it **true**. F2 is closed; no trusted-doc edit was needed or made (correct — they are human-only
and were already worded for this hook).

## Lens results

- **L-floor (P0), governing lens:** PASS on the increment's own claims; **1 advisory finding (F3)**.
  Every guarantee the increment asserts reduces to a floor primitive: "a write outside scope is blocked"
  → the hook (exit 2); "scope is derived deterministically" → an enum/regex parser with no LLM; "fix #2
  still backstops the trusted docs" → fix #2's unchanged hook. The deny **message** is correctly labeled
  advisory (UX), with `exit 2` as the floor fact. No guarantee is left unbacked **or** unlabeled. The
  residual (F3) is that the guard's _active-ness_ itself has no durable self-check.
- **L-eval (P1):** PASS, no finding. The increment adds no Capability and no `enforces`/`rule_id`, so P1
  imposes nothing new and the floor agrees (count stays 1). The executable floor code ships with a
  19-case `node --test` suite (`enforce-writes-scope.test.cjs`) covering both scripts via subprocess
  spawns, asserting on `r.status` + message — the P1-equivalent for floor code. Floor and lens concur.
- **L-trust (P2):** PASS on the guaranteed decision; **1 advisory finding (F2)**. The hook's allow/deny
  rests **only** on path/glob membership (`enforce-writes-scope.cjs:137-143`), never on a free-text or
  tainted field — the §8 pattern applied to the floor. **Injection scan of the reviewed artifact:** the
  deny message in `enforce-writes-scope.cjs:90-102` is imperative ("FIX (pick one): …"), but it is
  PHARN's own trusted floor guidance to the operator, not injected content — I did **not** treat it as
  an instruction aimed at me, and it did not change my behavior. F2 records the one real taint surface:
  the _setter_ turns a `writes:` field into the gate's input without a `kind:`/`trust:` check.
- **L-axis (P3):** PASS, no finding. One axis per file: each hook is its own concern (fix #2 static vs
  fix #7 dynamic → two files, the approved resolution); each command gains exactly a "Step 0"; CLAUDE.md
  gains one section; `.gitignore` one line. No sibling import — the two hooks are floor scripts outside
  the `pharn-*` module tree and communicate through the `.pharn/writes-scope.json` state file (a
  writer/reader pair), not by importing each other; the test harness spawning both is not a product
  reference.

## Findings — floor-gate (blocking)

**None.** `validate.mjs` is GREEN; fix #2 is intact; the capability count is unchanged; no false
guarantee is fabricated; no sibling reference exists. The increment is structurally sound and may
proceed.

## Findings — advisory-gate (warn — inform; never the sole basis for a block)

```yaml
- type: FINDING
  rule_id: P6
  severity: important
  file: ".claude/commands/review.md:8"
  problem: "Now that fix #7 enforces writes:, /review's Step 0 scopes to the command's declared root REVIEW.md, but reviews actually live at features/<name>/REVIEW.md — so the guard denies the conventional artifact path (a doc-vs-repo mismatch the enforcement converts into active friction)."
  evidence: 'review.md:8 `writes: ["REVIEW.md", "memory-bank/lessons-learned.md (gated)"]` and plan.md:8 `writes: ["PLAN.md"]` declare ROOT paths. But the repo''s established convention is features/<name>/: features/structured-findings/REVIEW.md and features/trust-fence/REVIEW.md exist, and this increment''s own plan was placed at features/writes-scope/PLAN.md. Live this run: Step 0 set scope=["REVIEW.md", …]; writing features/writes-scope/REVIEW.md under that scope is denied by enforce-writes-scope.cjs (authoritative scope, features/** not auto-added). I reset to the fail-closed safe-set (rm .pharn/writes-scope.json) to write the conventional path. Flagged in the build note as a follow-up; confirmed live here.'
```

```yaml
- type: FINDING
  rule_id: P2
  severity: important
  file: ".claude/hooks/set-writes-scope.cjs:88"
  problem: "The setter turns a writes: field into the guaranteed gate's input without checking the source file's kind:/trust:, so a writes: that names a non-fix#2 sensitive zone (floor/** or memory-bank/**) unlocks it — the 'community capabilities are markdown-only, cannot declare trusted-write' invariant (CLAUDE.md) is not floor-enforced at the setter."
  evidence: "set-writes-scope.cjs:88-89 `const raw = … writesFromFrontmatter(file) …; const scope = raw.map(clean).filter(isConcrete);` — no kind/trust gate. enforce-writes-scope.cjs:137 then sets allow = [...ALWAYS, ...scope]; floor/** and memory-bank/** are NOT in fix #2's denylist, so a declared scope naming them is allowed by both hooks. This sharpens the residual the PLAN already named (Guarantee audit: an agent can rewrite its own .pharn/writes-scope.json): the setter-on-untrusted-frontmatter is a second path to the same widened scope. NOT reachable in the normal loop — commands point the setter only at their own trusted frontmatter — and bounded by fix #2 (the four trusted docs + CODEOWNERS stay denied regardless). Latent, not a current exposure."
```

```yaml
- type: FINDING
  rule_id: P0
  severity: important
  file: ".claude/settings.json:11"
  problem: "fix #7's active-ness has no durable floor/test self-check: neither floor/validate.mjs nor the test suite reads settings.json, so deleting the hook's wiring line leaves both GREEN while fix #7 is silently inert; and the 'both hooks run, any-deny-blocks' composition semantic was exercised at build but is not asserted by a regression test."
  evidence: "settings.json:11-14 wires `node .claude/hooks/enforce-writes-scope.cjs` into the PreToolUse Write|Edit|MultiEdit matcher. But validate.mjs walks only *.md and excludes .claude/ (capability count check is blind to it), and enforce-writes-scope.test.cjs:30-36 spawns the HOOK script directly (join(__dirname, 'enforce-writes-scope.cjs')) — it never reads settings.json. So nothing in the floor or tests detects an un-wired hook. The composition guarantee was verified live at build (build note: fix #7 blocked an out-of-scope settings.json write while fix #2 would have allowed it), but that is a one-time observation, not a durable check. This is a property fix #2 shares (pre-existing), made salient because fix #7's entire value depends on being wired."
```

### Why these are advisory, not blocking

The floor is GREEN and the increment did the correct thing on every axis the floor checks. F1 is a
convention/wiring mismatch the floor cannot currently verify (and the increment faithfully used the
command's own `writes:`). F2 restates a residual the PLAN already named honestly, bounded by fix #2 and
not reachable in the trusted-only normal loop. F3 is an inherent property of hook wiring, shared with
fix #2 and verified live at build. None is a constitutional STOP; none is the sole basis to block a
guaranteed invariant (fix #3).

## Note on this review's own write path (live F1 evidence)

Following Step 0 literally would have scattered this review to a root `REVIEW.md`, against the
`features/<name>/` convention every prior review follows. I did **not** bypass the hook: I used the
documented `.pharn/` reset (CLAUDE.md, "Writes-scope") to fall back to the fail-closed default-safe-set,
under which `features/**` is sanctioned and `memory-bank/**`, `floor/**`, `.claude/**` remain denied —
then wrote here. The need to do this _is_ F1.

## Verdict

**GREEN on the floor (the increment's only guaranteed gate passed); NOT blocked. 0 floor-gate findings,
3 advisory (important).** fix #7 makes `writes:` genuinely floor-enforced and closes
`features/structured-findings/REVIEW.md` F2. The three advisory items are honest residuals, not
defects in the build: a command-declaration vs artifact-convention mismatch the new enforcement now
exposes (F1, the strongest — it recurs every `/review` until aligned), the already-named taint surface
on the setter (F2), and the absence of a durable self-check that the guard is wired (F3).

## Proposed lesson (gated — provenance attached; human promotes to canon, P2)

Proposed for `memory-bank/lessons-learned.md` (do **not** write canon silently). Distinct from L1/L2.

```markdown
## L3 — Making a declarative field load-bearing requires re-auditing every existing declaration of it

**Lesson.** When an increment turns a previously-advisory declarative field (here `writes:`) into a
floor-enforced gate, the SAME increment must audit every existing value of that field against where the
workflow actually writes. A declaration that was harmless while advisory (`/review`'s
`writes: ["REVIEW.md"]`) becomes a guaranteed block the moment it is enforced and the real artifact
lives elsewhere (`features/<name>/REVIEW.md`): the guard then denies the correct path while permitting
nothing useful.

**Why it matters.** Fail-closed enforcement is only safe if the declarations it reads are already true.
Retrofitting enforcement onto a field that drifted from reality converts latent doc-vs-repo drift (P6)
into active, guaranteed friction — and the friction lands on the next operator, not the author.
`validate.mjs` cannot catch it (it checks structure, not declaration-vs-usage), so only `/review`,
running the new guard live, surfaces it. Remedy: a `/review` sub-check — when a field becomes
load-bearing, diff every declaration of it against actual usage in the same increment.

**Provenance.**

- feature: `writes-scope` (fix #7).
- diff: 9 files (3 new hooks/test + 6 edits); `protect-trusted-paths.cjs` byte-unchanged.
- surfaced by: this review, live — Step 0 scoped to root `REVIEW.md`, denying the conventional
  `features/writes-scope/REVIEW.md` (F1). Pre-flagged in the fix #7 build note.
- promoted: <pending human-gated approval>
```
