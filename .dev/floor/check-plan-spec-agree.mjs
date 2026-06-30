#!/usr/bin/env node
// .dev/floor/check-plan-spec-agree.mjs — the deterministic spec→plan HASH-CHAIN re-verification for /pharn-grill.
//
// Floor primitives (ARCHITECTURE §2): #3 (enum) for the SPEC's state === "Approved", and #2 (content-hash)
// for the chain equality — the PLAN's carried spec_content_hash MUST equal the SPEC's CURRENT body hash. It
// is the floor reduction of the §6 grill stage's first responsibility downstream of /pharn-plan: a PLAN may
// proceed only if it was made against the CURRENT Approved, un-drifted SPEC (the §6 Keystone — "if the spec
// is edited after the plan, the hash diverges and it is detectable, not silent" — fix #4). /pharn-grill is
// the FIRST consumer that ENFORCES /pharn-spec's pin downstream of /pharn-plan; the pin is NOT decorative.
// Cited, not restated (P4).
//
// WHY a wrapper over the existing gates (the reuse, P3): the SPEC's Approved-and-un-drifted check ALREADY
// exists as check-spec-approved.mjs (which itself wraps check-spec.mjs), and the canonical body hash is
// ALREADY emitted by check-spec.mjs --hash. This file shells BOTH as CLIs (NOT sibling imports, P3 — the
// same separation check-spec-approved / check-regress / check-verify use to re-run other floor gates) and
// adds exactly ONE new assertion on top: planHash === specHash. So the state-enum and the body-hash logic
// live in exactly ONE place (check-spec.mjs) and can never drift between the spec checker and this one.
//
// NON-LLM. Node stdlib only (child_process to invoke the sibling CLIs; no network, no eval, no deps).
//
// Honest scope (P0): it guarantees the PLAN was made against the CURRENT Approved, un-drifted SPEC — the
// spec→plan hash chain holds at grill time. It does NOT — cannot — judge whether the PLAN is good, complete,
// or sound; /pharn-grill's interrogation surfaces that (advisory) and NEVER gates. "passed
// check-plan-spec-agree" means ONLY "the plan was made against the current approved spec", NEVER "the plan
// is good" — that conflation is the P0 disease this repo exists to prevent. Two clocks: this checker's
// VERDICT is floor; /pharn-grill's ACT of invoking it and obeying the exit code is ADVISORY command
// orchestration (exactly as /pharn-plan reads check-spec-approved, and /pharn-dev-ship reads a sub-stage verdict).
//
// Trust (P2): the PLAN and SPEC bodies are untrusted DATA. The verdict ranges ONLY over the enum-gated /
// floor-verifiable values — the gate's exit code (state enum + body-hash equality, inside check-spec) and
// the two 64-hex digests — NEVER over either file's prose meaning. The carried planHash is regex-gated to
// 64-hex (HASH_RE) BEFORE the compare, so an instruction-looking needle in that field is rejected as
// not-a-hash (the ★ tests prove a needle in plan/spec prose does not move the verdict).
//
// Usage:
//   node .dev/floor/check-plan-spec-agree.mjs <PLAN.md> <SPEC.md>
//       exit 0 iff the SPEC is Approved+un-drifted AND the PLAN's carried spec_content_hash equals the
//       SPEC's current body hash (GREEN); exit 1 otherwise (spec Draft / drift / malformed, or a stale /
//       broken chain, or a missing / malformed carried hash), printing a clear RED.
//
// Exit: 0 only when the chain holds; 1 on every refusal (fail-closed).

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Resolve the sibling CLIs RELATIVE TO THIS FILE (import.meta.url), never the cwd — so the chain check
// behaves identically no matter where /pharn-grill is invoked from (mirrors check-spec-approved.mjs:47-48).
const here = dirname(fileURLToPath(import.meta.url));
const CHECK_SPEC_APPROVED = join(here, "check-spec-approved.mjs");
const CHECK_SPEC = join(here, "check-spec.mjs");

// The leading YAML frontmatter block — the same FM_RE mechanism as check-spec.mjs / check-spec-approved.mjs,
// re-implemented IN-FILE (no sibling import, P3). We need exactly one field from the PLAN: spec_content_hash.
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const HASH_RE = /^[0-9a-f]{64}$/; // a SHA-256 hex digest — the enum-gate applied to BOTH hashes (P2/P5)

function stripQuotes(v) {
  return v.replace(/^["']|["']$/g, "");
}

// Extract the PLAN's frontmatter spec_content_hash (or undefined when there is no frontmatter / no such
// line), using check-spec.mjs's exact key/value parse so the two never disagree on what the field is.
// Deterministic; no LLM.
function readCarriedHash(text) {
  const m = text.match(FM_RE);
  if (!m) return undefined;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/);
    if (kv && kv[1] === "spec_content_hash") return stripQuotes(kv[2].trim());
  }
  return undefined;
}

function red(msg) {
  console.log(`RED — ${msg}`);
  return 1;
}

function gate(planPath, specPath) {
  // (1) REUSE check-spec-approved.mjs: the SPEC must be Approved + un-drifted + well-shaped. This is the
  //     first link — a plan made against a Draft / drifted / malformed spec cannot have a valid chain.
  //     Shelling keeps the state-enum + body-hash logic in ONE place (P3/P4).
  const g = spawnSync(process.execPath, [CHECK_SPEC_APPROVED, specPath], { encoding: "utf8" });
  if (g.error) {
    return red(`could not run check-spec-approved.mjs (${CHECK_SPEC_APPROVED}): ${g.error.message}`);
  }
  if (g.status !== 0) {
    // Surface its OWN message verbatim, so a Draft vs drift vs malformed refusal stays distinguishable
    // (the user learns whether to approve, re-approve, or fix the spec — P5: a clear message, not a guess).
    const out = (g.stdout || "") + (g.stderr || "");
    if (out.trim()) process.stdout.write(out.endsWith("\n") ? out : out + "\n");
    return red(`SPEC is not Approved+un-drifted (${specPath}) — cannot verify the spec→plan chain; approve/re-approve via /pharn-spec`);
  }

  // (2) REUSE check-spec.mjs --hash: the SPEC's CURRENT body hash (the single source of body-extraction, so
  //     this can never disagree with what check-spec verified in step 1). Trim the trailing newline it
  //     prints (check-spec.mjs writes `hash + "\n"`), then enum-gate to 64-hex — fail-closed otherwise.
  const h = spawnSync(process.execPath, [CHECK_SPEC, "--hash", specPath], { encoding: "utf8" });
  if (h.error) {
    return red(`could not run check-spec.mjs --hash (${CHECK_SPEC}): ${h.error.message}`);
  }
  if (h.status !== 0) {
    const out = (h.stdout || "") + (h.stderr || "");
    if (out.trim()) process.stdout.write(out.endsWith("\n") ? out : out + "\n");
    return red(`check-spec.mjs --hash failed for ${specPath} — cannot recompute the spec body hash`);
  }
  const specHash = (h.stdout || "").trim();
  if (!HASH_RE.test(specHash)) {
    return red(`check-spec.mjs --hash did not return a sha256 for ${specPath} (got ${JSON.stringify(specHash)})`);
  }

  // (3) Read the PLAN's CARRIED spec_content_hash and enum-gate it to 64-hex BEFORE the compare, so a needle
  //     in that field is rejected as not-a-hash (P2 — the verdict ranges only over hashes, never prose).
  let planText;
  try {
    planText = readFileSync(planPath, "utf8");
  } catch (e) {
    return red(`PLAN.md is unreadable (${planPath}): ${e.message}`);
  }
  const planHash = readCarriedHash(planText);
  if (planHash === undefined) {
    return red(
      `PLAN.md carries no spec_content_hash in its frontmatter (${planPath}) — re-plan via /pharn-plan ` +
        `(the carried pin is what the chain check reads)`
    );
  }
  if (!HASH_RE.test(planHash)) {
    return red(`PLAN.md spec_content_hash is not a sha256 (${planPath}): ${JSON.stringify(planHash)} — re-plan via /pharn-plan`);
  }

  // (4) The chain assertion — the ONE new branch this checker adds on top of the reused gates: the plan's
  //     carried hash MUST equal the spec's current body hash. Equal → the plan was made against the current
  //     approved spec (GREEN). Unequal → the spec changed after the plan was made → the plan is STALE (RED,
  //     fail-closed).
  if (planHash !== specHash) {
    return red(
      `spec→plan chain BROKEN: PLAN's carried spec_content_hash (${planHash}) != the SPEC's current body hash (${specHash}) — ` +
        `the spec changed after the plan was made; re-plan via /pharn-plan (or, if the spec change is intended, re-approve via /pharn-spec then re-plan)`
    );
  }

  console.log(
    `GREEN — spec→plan hash chain holds; the plan was made against the current Approved, un-drifted spec (${planPath} ↔ ${specPath})`
  );
  return 0;
}

function main() {
  const planPath = process.argv[2];
  const specPath = process.argv[3];
  if (!planPath || !specPath) {
    console.log("RED — usage: node .dev/floor/check-plan-spec-agree.mjs <PLAN.md> <SPEC.md>");
    return 1;
  }
  return gate(planPath, specPath);
}

process.exit(main());
