#!/usr/bin/env node
// .claude/hooks/enforce-writes-scope.cjs — pre-write floor (CONSTITUTION P0/P2/P5, fix #7).
//
// Deterministic, non-LLM, stdlib-only. A Claude Code PreToolUse hook (Write|Edit|MultiEdit) that
// DENIES (exit 2) any write whose path is outside the ACTIVE writes-scope. The active scope is the
// `scope[]` in .pharn/writes-scope.json (written by set-writes-scope.cjs from a declared `writes:`).
// FAIL-CLOSED: if that file is absent/invalid, only a default-safe-set is writable; everything else
// is denied. This makes ARCHITECTURE §3.1/§7's "`writes:` ENFORCED by the pre-write hook" TRUE.
//
// ADDITIVE to fix #2 (protect-trusted-paths.cjs): both hooks run on every write; a deny from EITHER
// blocks. fix #7 is scope-only and does NOT re-implement the trusted-doc denylist — fix #2 remains the
// hard backstop for CONSTITUTION/ARCHITECTURE/THREAT-MODEL/LIMITS + CODEOWNERS, regardless of scope.
// The allow/deny decision rests ONLY on path/glob membership (P2: never on a free-text/tainted field).

"use strict";

const fs = require("fs");
const path = require("path");

// Always writable (bootstrap): the setter must be able to write its own state with or without a scope
// file. Kept tight to `.pharn/**` so it cannot be used to reach product paths.
const ALWAYS = [".pharn/**"];

// Fail-closed allow-list used when no scope file is set. Module dirs + process scratch only; the
// sensitive zones (memory-bank/, floor/, .claude/, root files) are intentionally absent — reaching
// them requires an explicit `writes:` declaration.
const DEFAULT_SAFE_SET = ["features/**", "pharn-*/**"];

const SCOPE_FILE = ".pharn/writes-scope.json";

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function extractPaths(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return [];
  const paths = [];
  if (typeof toolInput.file_path === "string") paths.push(toolInput.file_path);
  if (typeof toolInput.path === "string") paths.push(toolInput.path);
  if (Array.isArray(toolInput.edits)) {
    for (const e of toolInput.edits) if (e && typeof e.file_path === "string") paths.push(e.file_path);
  }
  return paths;
}

// Tiny stdlib glob -> anchored RegExp. `**` spans segments (incl. `/`); `*` matches within one segment
// (no `/`); everything else literal. A bare path matches only itself.
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
      } else {
        re += "[^/]*";
      }
    } else if ("\\^$.|?+()[]{}".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}

// Repo-root-relative, forward-slash path. Returns null if the path escapes the repo root.
function toRel(p) {
  const rel = path.relative(process.cwd(), path.resolve(process.cwd(), String(p))).replace(/\\/g, "/");
  if (rel === "" || rel === ".." || rel.startsWith("../")) return null;
  return rel;
}

// scope[] from .pharn/writes-scope.json, or null (absent/unparseable -> fail-closed to safe-set).
function loadScope() {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), SCOPE_FILE), "utf8"));
    if (parsed && Array.isArray(parsed.scope)) return parsed.scope.filter((s) => typeof s === "string");
  } catch {
    // absent or unparseable -> fail-closed to the default-safe-set
  }
  return null;
}

function denyMessage(blockedPath, scope) {
  const active = scope ? scope.join(", ") : "(none set — fail-closed default-safe-set active)";
  return (
    "PHARN floor — write blocked (writes-scope guard, fix #7)\n" +
    `  Blocked path : ${blockedPath}\n` +
    `  Active scope : ${active}\n` +
    "WHY: a Capability/command may only write paths it declared in `writes:` (P0 floor, ARCHITECTURE §7 — not advisory).\n" +
    "FIX (pick one):\n" +
    "  • If this path SHOULD be written by the current work: add it to the active Capability's `writes:`, then re-run the scope-setter so .pharn/writes-scope.json reflects it.\n" +
    '  • If running a command (/build, /review, …): scope is set in the command\'s FIRST step. If "(none set)", that step did not run — restart the command from the top; do not write ad hoc.\n' +
    "  • If this is a one-off outside any Capability: it is intentionally blocked (fail-closed). Declare a scope, or do the write by hand outside the agent.\n" +
    "Scope file: .pharn/writes-scope.json (set by a command's first step; delete to reset; absence = fail-closed default-safe-set)."
  );
}

function deny(blockedPath, scope) {
  const reason = denyMessage(blockedPath, scope);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
      decision: "block",
      reason,
    })
  );
  process.stderr.write(reason + "\n");
  process.exit(2);
}

const payload = (() => {
  try {
    return JSON.parse(readStdin() || "{}");
  } catch {
    return {};
  }
})();

const toolName = payload.tool_name || payload.toolName || "";
const toolInput = payload.tool_input || payload.toolInput || {};
const writePaths = extractPaths(toolInput);
const isWrite = /^(Write|Edit|MultiEdit)$/i.test(toolName) || (!toolName && writePaths.length);

if (isWrite) {
  const scope = loadScope();
  const allow = [...ALWAYS, ...(scope || DEFAULT_SAFE_SET)].map(globToRegExp);
  for (const p of writePaths) {
    const rel = toRel(p);
    if (rel === null || !allow.some((re) => re.test(rel))) {
      deny(rel === null ? String(p) : rel, scope);
    }
  }
}

// allow
process.exit(0);
