#!/usr/bin/env node
// .dev/floor/check-spec-approved.mjs — the deterministic APPROVED-INPUT GATE for /pharn-plan.
//
// Floor primitives (ARCHITECTURE §2): #3 (enum) for `state === "Approved"`, and — REUSED, not
// re-implemented — #3 (presence/enum) + #2 (content-hash) via check-spec.mjs for shape, the state
// enum, spec_id, and the Approved-pin (spec_content_hash == sha256(body)). It is the floor reduction of
// the §6 plan-stage PRECONDITION: a PLAN may be produced only from an Approved, un-drifted SPEC
// (fix #4). /pharn-plan is the FIRST downstream consumer that ENFORCES /pharn-spec's pin, so the pin is
// NOT decorative. Cited, not restated (P4).
//
// WHY a wrapper over check-spec.mjs (the reuse): check-spec.mjs returns GREEN for a valid DRAFT — a
// Draft is a legal spec state, and /pharn-spec must validate Drafts too — so `check-spec GREEN` ALONE
// is not the gate. This file adds the ONE assertion check-spec deliberately omits — `state ===
// "Approved"` — on TOP of check-spec's exact verification. It shells to check-spec.mjs as a CLI (NOT a
// sibling import, P3 — the same separation check-regress / check-verify use to re-run other floor
// gates), so the content-hash logic lives in exactly ONE place and can never drift between the two.
//
// NON-LLM. Node stdlib only (child_process to invoke the sibling CLI; no network, no eval, no deps).
//
// Honest scope (P0): it guarantees a SPEC is Approved + un-drifted + well-shaped — the deterministic
// PRECONDITION of planning. It does NOT — cannot — judge whether the resulting PLAN is correct, or the
// intent wise. "passed check-spec-approved" means ONLY "the input spec is approved and unchanged",
// NEVER "the plan will be good" — that conflation is the P0 disease this repo exists to prevent. And
// note the two clocks: this checker's VERDICT is floor; /pharn-plan's ACT of invoking it and obeying
// the exit code is ADVISORY command orchestration (exactly as /pharn-dev-ship reads a sub-stage verdict).
//
// Trust (P2): the SPEC body is untrusted human intent (DATA). The verdict ranges ONLY over the
// enum-gated / floor-verifiable fields (the `state` enum + check-spec's section-presence + body-hash
// equality) — NEVER over the intent's meaning. No guaranteed decision rests on the free-text intent
// (mirrors fix #1; the ★ test proves an instruction-looking needle in the intent does not move it).
//
// Usage:
//   node .dev/floor/check-spec-approved.mjs <SPEC.md>   exit 0 iff Approved + un-drifted + well-shaped
//                                                        (GREEN); exit 1 otherwise (Draft / drift /
//                                                        malformed / unreadable), printing a clear RED.
//
// Exit: 0 only for an Approved, un-drifted, well-shaped SPEC; 1 on every refusal (fail-closed).

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Resolve check-spec.mjs RELATIVE TO THIS FILE (import.meta.url), never the cwd — so the gate behaves
// identically no matter where /pharn-plan is invoked from (mirrors how check-spec.test.mjs locates the
// checker under test). A cwd-relative path would silently break the reuse off the repo root.
const here = dirname(fileURLToPath(import.meta.url));
const CHECK_SPEC = join(here, "check-spec.mjs");

// The leading YAML frontmatter block — the same FM_RE mechanism as check-spec.mjs / set-writes-scope.cjs,
// re-implemented IN-FILE (no sibling import, P3). We need exactly one field from it: `state`.
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const STATE_APPROVED = "Approved"; // the one member of the {Draft, Approved} state enum a plan may come from

function stripQuotes(v) {
  return v.replace(/^["']|["']$/g, "");
}

// Extract the frontmatter `state` value (or undefined when there is no frontmatter / no state line),
// using check-spec.mjs's exact key/value parse so the two never disagree on what the field is.
// Deterministic; no LLM.
function readState(text) {
  const m = text.match(FM_RE);
  if (!m) return undefined;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/);
    if (kv && kv[1] === "state") return stripQuotes(kv[2].trim());
  }
  return undefined;
}

function red(msg) {
  console.log(`RED — ${msg}`);
  return 1;
}

function gate(specPath) {
  // (1) REUSE check-spec.mjs's EXACT verification (shape + state-enum + spec_id + Approved-pin/hash):
  //     a Draft → GREEN(0); an Approved+matching → GREEN(0); an Approved+drift / malformed / missing
  //     section / unreadable → RED(1). Shelling keeps the content-hash logic in ONE place (P4).
  const r = spawnSync(process.execPath, [CHECK_SPEC, specPath], { encoding: "utf8" });
  if (r.error) {
    return red(`could not run check-spec.mjs (${CHECK_SPEC}): ${r.error.message}`);
  }
  if (r.status !== 0) {
    // Surface check-spec's OWN message verbatim, so a DRIFT ("…drifted; re-approve…"), a MALFORMED, or
    // a missing-section refusal is distinguishable from the Draft refusal below — the user learns
    // whether to re-approve, fix the spec, or first approve it, never a generic fail (P5: the terminal
    // fallback is a CLEAR message, not a guess).
    const out = (r.stdout || "") + (r.stderr || "");
    if (out.trim()) process.stdout.write(out.endsWith("\n") ? out : out + "\n");
    return red(`check-spec.mjs rejected ${specPath} (see its output above) — cannot plan from an invalid or drifted spec`);
  }

  // (2) check-spec said GREEN ⇒ state ∈ {Draft, Approved} and (if Approved) the pin matches. Add the
  //     ONE assertion check-spec omits: the spec MUST be Approved. A Draft is intent NOT yet
  //     human-approved — planning from it would let unapproved intent flow downstream.
  let text;
  try {
    text = readFileSync(specPath, "utf8");
  } catch (e) {
    return red(`SPEC.md became unreadable (${specPath}): ${e.message}`);
  }
  const state = readState(text);
  if (state !== STATE_APPROVED) {
    return red(
      `spec state ${JSON.stringify(state ?? "(none)")} is not ${JSON.stringify(STATE_APPROVED)} — ` +
        `approve the intent via /pharn-spec before planning (a Draft is not yet human-approved)`
    );
  }

  console.log(`GREEN — spec Approved and un-drifted; safe to plan (${specPath})`);
  return 0;
}

function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    console.log("RED — usage: node .dev/floor/check-spec-approved.mjs <SPEC.md>");
    return 1;
  }
  return gate(specPath);
}

process.exit(main());
