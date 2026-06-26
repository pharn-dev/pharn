#!/usr/bin/env node
// floor/check-provenance.mjs — the deterministic PROVENANCE + DUPLICATE-ID CHECKER for memory-bank promotion.
//
// Floor primitive #3 (enum / regex / presence; ARCHITECTURE §2), like validate.mjs and check-structural.mjs.
// It is the floor reduction of ARCHITECTURE §5's "Promotion of a lesson/pattern to canon is a gated action
// with provenance PER ENTRY (which run / feature / diff)" — the PROVENANCE half. `/memory-promote` runs it
// before any write; a candidate that fails is REJECTED before it can reach canon. This is domknięcie —
// tightening §5's existing contract to its floor, NOT a new spec claim — exactly as check-structural.mjs did
// for eval-format's structural[]. The GATED-WRITE half of §5 is the fix #7 pre-write hook
// (enforce-writes-scope.cjs); the two compose (THREAT-MODEL §3, memory-poisoning row).
//
// NON-LLM, dependency-free (Node stdlib only). No network, no child_process, no eval, no dynamic import.
//
// Honest scope (P0): it guarantees a candidate carries VALID, well-shaped provenance and a NON-DUPLICATE id,
// and targets one of the two canon PRESCRIPTION files. It does NOT — cannot — judge whether the lesson is
// TRUE, GENERAL, or WORTH canonizing: that is the human's advisory accept/deny in `/memory-promote`. "passed
// check-provenance" must NEVER read as "the lesson is sound" — that conflation is the P0 disease this repo
// exists to prevent.
//
// Trust (P2): the candidate's free-text `title` / `body` originate in `trust: untrusted` input (a lesson is
// typically drawn from a REVIEW.md finding, whose free-text inherited the reviewed code's untrusted tag —
// finding-shape.md, fix #1). They are IGNORED here: the verdict ranges ONLY over the enum-gated /
// floor-verifiable fields (target enum, provenance shape, id set-membership). No guaranteed decision rests
// on a free-text field (mirrors check-structural.mjs).
//
// Usage:  node floor/check-provenance.mjs <candidate.json> <canon-file.md>
//   candidate.json : { target, id, provenance: { feature, commit, source, date } }  (+ title/body — IGNORED)
//   canon-file.md  : the target canon file to check id-uniqueness against
//                    (a not-yet-created file => empty canon, no duplicates — the first promotion case)
//
// Exit: 1 on any RED (prints each), 0 + "GREEN — ..." otherwise.

import { readFileSync, existsSync } from "node:fs";

// Enums / shapes — every branch is a membership / regex / presence test (P5); the terminal fallback on any
// non-member is a loud RED, never a guess. These are the enum-gated / floor-verifiable fields (never body).
const TARGET_ENUM = ["memory-bank/lessons-learned.md", "memory-bank/pattern-library.md"]; // Q1: the two prescription files
const REQUIRED_PROVENANCE = ["feature", "commit", "source", "date"]; // Q2: the mandatory per-entry schema
const COMMIT_RE = /^[0-9a-f]{7,40}$/; // a git SHA (short or full); the real value is captured by the command via `git rev-parse HEAD`
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // ISO calendar date

const reds = [];
function red(kind, detail) {
  reds.push({ kind, detail });
}

function readJson(path, label) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    red("input", `${label} is unreadable (${path}): ${e.message}`);
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    red("input", `${label} is not valid JSON (${path}): ${e.message}`);
    return undefined;
  }
}

function nonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// The set of existing `## <id>` heading ids in the canon file — the first whitespace-delimited token after
// "## " (so "## L1 — title" yields "L1"). A not-yet-created canon file is the legitimate first-promotion
// case (e.g. pattern-library.md before any pattern): treat it as the empty set, never an error.
function existingIds(canonPath) {
  if (!existsSync(canonPath)) return [];
  let text;
  try {
    text = readFileSync(canonPath, "utf8");
  } catch (e) {
    red("canon", `cannot read canon file (${canonPath}): ${e.message}`);
    return [];
  }
  const ids = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^##\s+(\S+)/);
    if (m) ids.push(m[1]);
  }
  return ids;
}

function fail() {
  for (const r of reds) console.log(`RED — ${r.kind} failed: ${r.detail}`);
  console.log(`\nRED — ${reds.length} provenance check(s) failed`);
  return 1;
}

function main() {
  const candidatePath = process.argv[2];
  const canonPath = process.argv[3];

  if (!candidatePath || !canonPath) {
    console.log("RED — usage: node floor/check-provenance.mjs <candidate.json> <canon-file.md>");
    return 1;
  }

  const cand = readJson(candidatePath, "candidate.json");
  if (reds.length) return fail();
  if (!cand || typeof cand !== "object" || Array.isArray(cand)) {
    red("input", "candidate.json must be a JSON object");
    return fail();
  }

  // (1) target ∈ the canon enum — set membership (P5).
  if (!TARGET_ENUM.includes(cand.target)) {
    red("target", `target ${JSON.stringify(cand.target)} not in {${TARGET_ENUM.join(", ")}}`);
  }

  // (2) provenance present + shape — the mandatory per-entry schema (ARCHITECTURE §5; Q2). A candidate
  //     missing or malforming any field is REJECTED deterministically, before any write.
  const p = cand.provenance;
  if (!p || typeof p !== "object" || Array.isArray(p)) {
    red("provenance", `provenance must be an object with {${REQUIRED_PROVENANCE.join(", ")}}, got ${JSON.stringify(p)}`);
  } else {
    for (const field of REQUIRED_PROVENANCE) {
      if (!(field in p)) red("provenance", `missing required provenance field: ${field}`);
    }
    if ("feature" in p && !nonEmptyString(p.feature)) {
      red("provenance", `feature must be a non-empty string, got ${JSON.stringify(p.feature)}`);
    }
    if ("source" in p && !nonEmptyString(p.source)) {
      red("provenance", `source must be a non-empty string, got ${JSON.stringify(p.source)}`);
    }
    if ("commit" in p && !(typeof p.commit === "string" && COMMIT_RE.test(p.commit))) {
      red("provenance", `commit must match ${COMMIT_RE} (a git SHA, 7–40 hex), got ${JSON.stringify(p.commit)}`);
    }
    if ("date" in p && !(typeof p.date === "string" && DATE_RE.test(p.date))) {
      red("provenance", `date must match ${DATE_RE} (YYYY-MM-DD), got ${JSON.stringify(p.date)}`);
    }
  }

  // (3) id present + NON-duplicate — set membership over existing `## <id>` headings (P5). A re-used id
  //     would silently shadow or collide with canon, so it is RED.
  if (!nonEmptyString(cand.id)) {
    red("id", `id must be a non-empty string, got ${JSON.stringify(cand.id)}`);
  } else {
    const id = String(cand.id).trim();
    if (existingIds(canonPath).includes(id)) {
      red("id", `id ${JSON.stringify(id)} already exists as a "## ${id}" heading in ${canonPath} — duplicate`);
    }
  }

  if (reds.length) return fail();
  console.log(`GREEN — provenance valid; id ${JSON.stringify(String(cand.id).trim())} is unique in ${canonPath}`);
  return 0;
}

process.exit(main());
