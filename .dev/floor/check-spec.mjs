#!/usr/bin/env node
// .dev/floor/check-spec.mjs — the deterministic SPEC.md SHAPE + STATE + APPROVED-PIN checker for /pharn-spec.
//
// Floor primitives (ARCHITECTURE §2): #3 (enum / presence) for required-section presence, the state enum, and
// spec_id presence; #2 (content-hash) for the approved-intent pin. It is the floor reduction of ARCHITECTURE
// §6's spec stage — "SPEC.md | intent (Draft → Approved)", the root artifact carrying spec_id, with
// spec_content_hash pinning content so drift under a stable id is detectable (fix #4) — cited, not restated
// (P4). /pharn-spec runs it after emitting a Draft, and again after the human-approved pin; a SPEC that fails
// is REJECTED. This is domknięcie — tightening §6's existing contract to its floor — exactly as
// check-provenance.mjs did for §5's promotion contract, NOT a new spec claim.
//
// NON-LLM, dependency-free (Node stdlib only). No network, no child_process, no eval, no dynamic import.
//
// Honest scope (P0): it guarantees a SPEC.md carries the REQUIRED SECTIONS, a VALID state enum, a present
// spec_id, and — when Approved — a spec_content_hash that EQUALS sha256(body). It does NOT — cannot — judge
// whether the INTENT is clear, complete, or wise: that is the human's advisory call, owned by the approval
// halt in /pharn-spec. "passed check-spec" must NEVER read as "the intent is sound" — that conflation is the
// P0 disease this repo exists to prevent.
//
// Trust (P2): the SPEC body is human-authored intent (free-text DATA). The verdict ranges ONLY over the
// enum-gated / floor-verifiable fields (section presence, state enum, spec_id presence, body-hash equality) —
// NEVER over the intent's meaning. No guaranteed decision rests on the free-text intent (mirrors fix #1).
//
// Usage:
//   node .dev/floor/check-spec.mjs <SPEC.md>           validate → exit 1 on any RED (prints each), else 0 + GREEN
//   node .dev/floor/check-spec.mjs --hash <SPEC.md>    print sha256(body) to stdout — the value /pharn-spec pins
//                                                      into spec_content_hash on approval. SINGLE source of
//                                                      body-extraction, so the pin and the validate-time
//                                                      recompute can never disagree.
//
// Exit: 1 on any RED (validate) / on unreadable | no-frontmatter (--hash); 0 otherwise.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Enums / shapes — every branch is a presence / enum / hash-equality membership test (P5); the terminal
// fallback on any non-member is a loud RED, never a guess. These are the enum-gated / floor-verifiable fields.
const REQUIRED_SECTIONS = ["intent", "scope", "acceptance criteria", "constraints"]; // §6 SPEC presence set
const STATE_ENUM = ["Draft", "Approved"]; // the spec lifecycle (ARCHITECTURE §6)
const HASH_RE = /^[0-9a-f]{64}$/; // a SHA-256 hex digest
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/; // the leading YAML frontmatter block (same mechanism as set-writes-scope.cjs / validate.mjs)

const reds = [];
function red(kind, detail) {
  reds.push({ kind, detail });
}

function stripQuotes(v) {
  return v.replace(/^["']|["']$/g, "");
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Split a SPEC file into { fm: {key:value}, body }. `body` is everything AFTER the frontmatter block — the
// SINGLE definition of "the SPEC body", reused by both validate and --hash, so the approved-pin and its
// recompute never disagree. Returns null when there is no frontmatter block at all (fail-closed). The body is
// frontmatter-independent, so flipping `state` / writing `spec_content_hash` on approval does NOT move its hash.
function parseSpec(text) {
  const m = text.match(FM_RE);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/);
    if (kv) fm[kv[1]] = stripQuotes(kv[2].trim());
  }
  return { fm, body: text.slice(m[0].length) };
}

function bodyHash(body) {
  return createHash("sha256").update(body).digest("hex");
}

// The lowercased text of each `## ` (exactly h2) heading in the body — the first-match parse mechanism from
// check-provenance.mjs's existingIds, re-implemented in-file (no sibling import, P3). `### foo` (h3) does not
// match (the `\s+` after `##` rejects a third `#`).
function headingsOf(body) {
  const out = [];
  for (const line of body.split(/\r?\n/)) {
    const hm = line.match(/^##\s+(.+?)\s*$/);
    if (hm) out.push(hm[1].toLowerCase());
  }
  return out;
}

function readText(path, label) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    red("input", `${label} is unreadable (${path}): ${e.message}`);
    return undefined;
  }
}

function fail() {
  for (const r of reds) console.log(`RED — ${r.kind} failed: ${r.detail}`);
  console.log(`\nRED — ${reds.length} spec check(s) failed`);
  return 1;
}

// --- --hash mode: emit sha256(body), the value /pharn-spec writes into spec_content_hash on approval. ---
function emitHash(specPath) {
  const text = readText(specPath, "SPEC.md");
  if (text === undefined) return 1;
  const parsed = parseSpec(text);
  if (!parsed) {
    console.error(`check-spec: no YAML frontmatter in ${specPath} — cannot locate the body to hash`);
    return 1;
  }
  process.stdout.write(bodyHash(parsed.body) + "\n");
  return 0;
}

// --- default mode: validate the SPEC's shape, state, identity, and (if Approved) its pin. ---
function validate(specPath) {
  const text = readText(specPath, "SPEC.md");
  if (reds.length) return fail();

  const parsed = parseSpec(text);
  if (!parsed) {
    red("frontmatter", `no YAML frontmatter block (\`---\` … \`---\`) in ${specPath}`);
    return fail();
  }
  const { fm, body } = parsed;

  // (1) state present + ∈ enum (P5).
  if (!("state" in fm) || fm.state.length === 0) {
    red("state", `missing \`state\` (must be one of {${STATE_ENUM.join(", ")}})`);
  } else if (!STATE_ENUM.includes(fm.state)) {
    red("state", `state ${JSON.stringify(fm.state)} not in {${STATE_ENUM.join(", ")}}`);
  }

  // (2) spec_id present + non-empty — the §6 root identity every downstream artifact carries.
  if (!("spec_id" in fm) || fm.spec_id.length === 0) {
    red("spec_id", "missing or empty `spec_id` (the root identity downstream artifacts carry)");
  }

  // (3) required sections present as `##` headings — set membership (P5). Presence only; the intent's
  //     CONTENT/quality is advisory and is never judged here.
  const headings = headingsOf(body);
  for (const want of REQUIRED_SECTIONS) {
    if (!headings.includes(want)) red("section", `missing required \`## ${titleCase(want)}\` section`);
  }

  // (4) when Approved: spec_content_hash present, well-formed, AND equals sha256(body) — the content-hash pin
  //     (fix #4). A Draft is not yet pinned, so its hash is not checked. A post-approval body edit that does
  //     not re-pin makes the recompute diverge → a deterministic RED (drift is loud, not silent).
  if (fm.state === "Approved") {
    const h = fm.spec_content_hash || "";
    if (!HASH_RE.test(h)) {
      red("pin", `an Approved spec needs spec_content_hash matching ${HASH_RE} (a sha256), got ${JSON.stringify(h)}`);
    } else if (h !== bodyHash(body)) {
      red("pin", "spec_content_hash does not equal sha256(body) — the approved intent drifted (re-approve to re-pin)");
    }
  }

  if (reds.length) return fail();
  const pinned = fm.state === "Approved" ? "; intent pinned" : "";
  console.log(`GREEN — spec valid; state ${JSON.stringify(fm.state)}; ${REQUIRED_SECTIONS.length} required sections present${pinned}`);
  return 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--hash") {
    if (!args[1]) {
      console.error("check-spec: usage: node .dev/floor/check-spec.mjs --hash <SPEC.md>");
      return 1;
    }
    return emitHash(args[1]);
  }
  if (!args[0]) {
    console.log("RED — usage: node .dev/floor/check-spec.mjs <SPEC.md>  (or --hash <SPEC.md>)");
    return 1;
  }
  return validate(args[0]);
}

process.exit(main());
