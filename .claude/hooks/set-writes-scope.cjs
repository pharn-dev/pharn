#!/usr/bin/env node
// .claude/hooks/set-writes-scope.cjs — the writes-scope SETTER (CONSTITUTION P0/P5, fix #7).
//
// Deterministic, non-LLM, stdlib-only. Reads a Capability/command's declared `writes:` (Mode A) or a
// PLAN.md's `## Files` list (Mode B) and writes `.pharn/writes-scope.json` = { scope, set_by, set_at }.
// The companion pre-write hook (enforce-writes-scope.cjs) reads that file and DENIES any write outside
// the scope, fail-closed to a default-safe-set when the file is absent. Scope is parsed deterministically
// from frontmatter / markdown — no model decides scope; that is what makes `writes:` floor-grade (P5).
//
// Usage (run as a command's FIRST step, before any write):
//   node .claude/hooks/set-writes-scope.cjs --from-frontmatter <capability-or-command.md> [--target <path>]
//   node .claude/hooks/set-writes-scope.cjs --from-plan <PLAN.md>
//
// `--target` resolves placeholder/glob `writes:` entries (e.g. features/<name>/PLAN.md) to one concrete
// file before emitting scope — so the hook allowlist is a single artifact path, not a broad directory.
//
// Exits non-zero (and writes nothing) rather than emit an empty/placeholder scope — fail-closed.

"use strict";

const fs = require("fs");
const path = require("path");

function fail(msg) {
  process.stderr.write("set-writes-scope: " + msg + "\n");
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let mode;
  let file;
  let target;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--target") {
      if (!args[i + 1]) fail("--target requires a path");
      target = args[++i];
    } else if (!mode) {
      mode = a;
    } else if (!file) {
      file = a;
    } else {
      fail(`unexpected argument: ${a}`);
    }
  }
  return { mode, file, target };
}

// Strip a trailing " (annotation)" (e.g. " (gated)") and surrounding whitespace.
function clean(entry) {
  return String(entry)
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

// Emit only literal repo-relative paths — no placeholders, globs, or empties.
function isConcrete(entry) {
  return (
    entry.length > 0 &&
    !entry.includes("<") &&
    !entry.includes(">") &&
    !entry.includes("*") &&
    !entry.includes("?")
  );
}

function normalizeRel(p) {
  const rel = path.relative(process.cwd(), path.resolve(process.cwd(), String(p))).replace(/\\/g, "/");
  if (rel === "" || rel === ".." || rel.startsWith("../")) fail(`--target escapes repo root: ${p}`);
  return rel;
}

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

function placeholderToRegExp(entry) {
  let re = "";
  for (let i = 0; i < entry.length; i++) {
    const c = entry[i];
    if (c === "<") {
      const end = entry.indexOf(">", i);
      if (end === -1) return null;
      re += "[^/]+";
      i = end;
    } else if ("\\^$.|?+()[]{}*".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}

// Resolve a declared writes entry to one concrete path. Literals pass through; placeholders/globs need
// --target and must match it — the emitted scope is the target path, not the pattern.
function resolveEntry(entry, target) {
  const e = clean(entry);
  if (isConcrete(e)) return e;
  if (!target) return null;
  const t = normalizeRel(target);
  if (e.includes("<") || e.includes(">")) {
    const re = placeholderToRegExp(e);
    return re && re.test(t) ? t : null;
  }
  if (e.includes("*") || e.includes("?")) {
    return globToRegExp(e).test(t) ? t : null;
  }
  return null;
}

// --- Mode A: read the `writes:` array from a markdown file's YAML frontmatter. ---
function writesFromFrontmatter(file) {
  const fm = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) fail(`no YAML frontmatter in ${file}`);
  const lines = fm[1].split(/\r?\n/);
  const idx = lines.findIndex((l) => /^writes:/.test(l));
  if (idx === -1) fail(`no \`writes:\` key in the frontmatter of ${file}`);
  const head = lines[idx].replace(/^writes:[ \t]*/, "").trim();
  const items = [];
  if (head.startsWith("[")) {
    // Inline flow array: writes: ["a", "b"]. Prefer quoted strings; else comma-split.
    const quoted = head.match(/"([^"]*)"|'([^']*)'/g);
    if (quoted) for (const q of quoted) items.push(q.slice(1, -1));
    else for (const p of head.replace(/^\[|\]$/g, "").split(",")) items.push(p.trim());
  } else {
    // Block list:  writes:\n  - "a"\n  - b
    if (head) items.push(head.replace(/^["']|["']$/g, ""));
    for (let i = idx + 1; i < lines.length; i++) {
      const li = lines[i].match(/^[ \t]+-[ \t]+(.*)$/);
      if (!li) break;
      items.push(li[1].trim().replace(/^["']|["']$/g, ""));
    }
  }
  return items;
}

// --- Mode B: the leading back-tick path of each list item under `## Files`, stopping at the
// "Explicitly not touched" subsection (those files are declared NOT written) or the next heading. ---
function pathsFromPlanFiles(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s+Files\b/.test(l));
  if (start === -1) fail(`no \`## Files\` heading in ${file}`);
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break; // next section ends the Files block
    if (/not\W*touch/i.test(line)) break; // "Explicitly **not** touched" — rest is not-written
    const m = line.match(/^\s*-\s+`([^`]+)`/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

function main() {
  const { mode, file, target } = parseArgs(process.argv);
  if (!mode || !file || (mode !== "--from-frontmatter" && mode !== "--from-plan")) {
    fail("usage: set-writes-scope.cjs (--from-frontmatter <file.md> [--target <path>] | --from-plan <PLAN.md>)");
  }
  if (!fs.existsSync(file)) fail(`file not found: ${file}`);

  const raw = mode === "--from-frontmatter" ? writesFromFrontmatter(file) : pathsFromPlanFiles(file);
  const scope = raw
    .map((entry) => resolveEntry(entry, target))
    .filter((p) => p !== null)
    .filter(isConcrete);
  if (scope.length === 0) {
    if (mode === "--from-frontmatter") {
      fail(
        `no concrete \`writes:\` paths in ${file} (only placeholders/empties${target ? "" : " — pass --target for placeholder/glob entries"}) — use --from-plan`
      );
    }
    fail(`no back-tick paths under \`## Files\` in ${file}`);
  }

  const record = { scope, set_by: file, set_at: new Date().toISOString() };
  const dir = path.resolve(process.cwd(), ".pharn");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "writes-scope.json"), JSON.stringify(record, null, 2) + "\n");
  process.stdout.write(`writes-scope set: ${scope.length} path(s) from ${file} -> .pharn/writes-scope.json\n`);
  process.exit(0);
}

main();
