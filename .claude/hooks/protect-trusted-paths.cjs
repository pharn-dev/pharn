#!/usr/bin/env node
// .claude/hooks/protect-trusted-paths.cjs — pre-write floor (CONSTITUTION P2, fix #2).
//
// Deterministic, non-LLM. A Claude Code PreToolUse hook that BLOCKS any Write/Edit/MultiEdit to a
// trusted file. Trust-by-location is only real if the location is write-protected at the floor —
// otherwise an injected instruction that gets a Write to CONSTITUTION.md rewrites the trusted layer.
//
// Protected by default: the four trusted spec docs + CODEOWNERS, the GitHub-layer write-guard
// itself. Guarding CODEOWNERS locally is "guarding the guard": if the agent could rewrite it, it
// could delete the human-only review requirement and collapse the GitHub-layer trust control (P2).
// Extend further with the PHARN_PROTECTED env var (comma-separated basenames or path fragments).
//
// Wire it via .claude/hooks/settings.snippet.json (matcher: Write|Edit|MultiEdit).

"use strict";

const DEFAULT_PROTECTED = ["CONSTITUTION.md", "ARCHITECTURE.md", "THREAT-MODEL.md", "LIMITS.md", "CODEOWNERS"];
const extra = (process.env.PHARN_PROTECTED || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const PROTECTED = [...DEFAULT_PROTECTED, ...extra];

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function extractPaths(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return [];
  const paths = [];
  if (typeof toolInput.file_path === "string") paths.push(toolInput.file_path);
  if (typeof toolInput.path === "string") paths.push(toolInput.path);
  // MultiEdit: edits[] each may carry file_path; some shapes nest under .edits
  if (Array.isArray(toolInput.edits)) {
    for (const e of toolInput.edits) if (e && typeof e.file_path === "string") paths.push(e.file_path);
  }
  return paths;
}

function isProtected(p) {
  const norm = String(p).replace(/\\/g, "/");
  return PROTECTED.some((prot) => {
    const x = prot.replace(/\\/g, "/");
    return norm === x || norm.endsWith("/" + x) || norm.includes("/" + x) || norm.split("/").pop() === x;
  });
}

const raw = readStdin();
let payload;
try {
  payload = JSON.parse(raw || "{}");
} catch {
  payload = {};
}

const toolName = payload.tool_name || payload.toolName || "";
const toolInput = payload.tool_input || payload.toolInput || {};
const isWrite = /^(Write|Edit|MultiEdit)$/i.test(toolName) || (!toolName && extractPaths(toolInput).length);

if (isWrite) {
  const hit = extractPaths(toolInput).find(isProtected);
  if (hit) {
    const reason = `BLOCKED by PHARN floor: ${hit} is a trusted file (CONSTITUTION P2 / fix #2). Trusted spec is human-only; the build agent may not write it. If a change is genuinely needed, a human edits it outside the agent loop.`;
    // Current Claude Code form:
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
    // Also emit on stderr and use exit 2 for older versions that block on non-zero exit:
    process.stderr.write(reason + "\n");
    process.exit(2);
  }
}

// allow
process.exit(0);
