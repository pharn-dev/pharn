#!/usr/bin/env node
// .dev/floor/validate.mjs — the deterministic floor for PHARN.
//
// This is the only GUARANTEED part of this repo's build loop (CONSTITUTION P0).
// It is non-LLM, dependency-free (Node stdlib only), and exits non-zero on any RED finding.
//
// It checks structural invariants of the PHARN repo being BUILT:
//   1. capability frontmatter present + required fields           (ARCHITECTURE §3.1)
//   2. every capability has non-empty evals/cases + evals/expected (P1)
//   3. every `enforces` rule_id is produced by >=1 eval case        (P1, fix #6)
//   4. `coupling` is a valid enum value where present               (enum check, §3.2)
//   5. finding templates separate enum-gated from free-text fields  (fix #1, best-effort)
//   6. no forbidden sibling reference                               (P3, best-effort)
//   7. archetype maps agree, if an archetype-maps manifest exists   (fix #5, conditional)
//
// Usage:  node .dev/floor/validate.mjs [targetDir]      (default: cwd)
// Honest scope: checks 5 and 6 are BEST-EFFORT — markdown has no import statement to lint, so they
// reduce a class of mistakes, they do not eliminate it (see ARCHITECTURE §4 caveat, LIMITS).
//
// It deliberately does NOT validate this repo's own tooling (.claude/commands, .dev/) — those
// are advisory orchestration, not built PHARN capabilities. Point this at the PHARN repo.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const TARGET = process.argv[2] || ".";
const COUPLING_ENUM = ["agnostic", "framework-seam", "framework-specific"];
const ROLE_ENUM = ["skill", "lens", "validator", "verifier", "griller", "auditor"];
const KIND_ENUM = ["pharn-owned", "vendor-official", "community"];
const EXCLUDE_SEGMENTS = [`${sep}.claude${sep}commands${sep}`, `${sep}.dev${sep}`, `${sep}node_modules${sep}`, `${sep}.git${sep}`];

const findings = [];
function finding(severity, rule_id, file, problem) {
  findings.push({ type: "FINDING", rule_id, severity, file, problem });
}

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

// --- tiny dependency-free frontmatter parser (handles the subset PHARN uses) ---
function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { fm: null, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { fm: null, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4);
  const fm = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      val = val.replace(/^["']|["']$/g, "");
    }
    fm[key] = val;
  }
  return { fm, body };
}

function isExcluded(file) {
  const norm = sep + relative(TARGET, file);
  return EXCLUDE_SEGMENTS.some((seg) => norm.includes(seg));
}

function nonEmptyDir(dir) {
  return existsSync(dir) && statSync(dir).isDirectory() && readdirSync(dir).filter((f) => !f.startsWith(".")).length > 0;
}

function capabilityDir(file) {
  // a capability file lives at <capDir>/<NAME>.md ; evals are at <capDir>/evals/
  return file.slice(0, file.lastIndexOf(sep));
}

// ---------------------------------------------------------------------------

const allMd = walk(TARGET);
const capabilities = [];

for (const file of allMd) {
  if (isExcluded(file)) continue;
  const text = readFileSync(file, "utf8");
  const { fm, body } = parseFrontmatter(text);

  // a "capability" = a role-bearing markdown file (ARCHITECTURE §3.1)
  if (fm && fm.role) {
    capabilities.push({ file, fm, body });
  }

  // CHECK 5 (best-effort): finding-template files must show the enum-gated / free-text split (fix #1)
  const hasFindingTemplate = /rule_id:/.test(text) && /problem:/.test(text);
  if (hasFindingTemplate) {
    const showsEnumGated = /enum-gated|floor-verifiable/i.test(text);
    const showsFreeText = /free[- ]text|untrusted/i.test(text);
    if (!(showsEnumGated && showsFreeText)) {
      finding(
        "blocking",
        "P0/fix#1",
        relative(TARGET, file),
        "finding template does not document the enum-gated vs free-text (untrusted) split — a guaranteed decision could rest on a tainted field"
      );
    }
  }
}

for (const cap of capabilities) {
  const rel = relative(TARGET, cap.file);
  const fm = cap.fm;

  // CHECK 1: required frontmatter fields
  for (const req of ["name", "role", "kind", "version"]) {
    if (!fm[req]) finding("blocking", "P1/ARCH§3.1", rel, `missing required frontmatter field: ${req}`);
  }
  if (fm.role && !ROLE_ENUM.includes(fm.role)) finding("blocking", "ARCH§3.1", rel, `role not in enum: ${fm.role}`);
  if (fm.kind && !KIND_ENUM.includes(fm.kind)) finding("blocking", "ARCH§3.1", rel, `kind not in enum: ${fm.kind}`);
  if (fm.seal && fm.kind !== "pharn-owned") finding("blocking", "ARCH§3.1", rel, "seal present on a non-pharn-owned capability");

  // CHECK 4: coupling enum (only when present)
  if (fm.coupling && !COUPLING_ENUM.includes(fm.coupling)) {
    finding("blocking", "ARCH§3.2", rel, `coupling not in enum: ${fm.coupling}`);
  }

  // CHECK 2: evals present
  const evalsDir = join(capabilityDir(cap.file), "evals");
  const casesDir = join(evalsDir, "cases");
  const expectedDir = join(evalsDir, "expected");
  const hasCases = nonEmptyDir(casesDir);
  const hasExpected = nonEmptyDir(expectedDir);
  if (!hasCases || !hasExpected) {
    finding(
      "blocking",
      "P1",
      rel,
      `capability has no evals (need non-empty evals/cases + evals/expected) [cases:${hasCases} expected:${hasExpected}]`
    );
  }

  // CHECK 3: every enforces rule_id is produced by >=1 eval case (fix #6)
  const enforces = Array.isArray(fm.enforces) ? fm.enforces : fm.enforces ? [fm.enforces] : [];
  if (enforces.length && hasExpected) {
    const expectedText = readdirSync(expectedDir)
      .map((f) => {
        try {
          return readFileSync(join(expectedDir, f), "utf8");
        } catch {
          return "";
        }
      })
      .join("\n");
    for (const id of enforces) {
      // a rule_id is "produced" if it appears in any expected fixture (id is file-qualified or bare)
      const bare = String(id).split(/\s+/).pop(); // "security.md SEC-1" -> "SEC-1"
      if (!expectedText.includes(id) && !expectedText.includes(bare)) {
        finding("blocking", "P1/fix#6", rel, `enforces rule_id "${id}" has no eval case that produces it`);
      }
    }
  } else if (enforces.length && !hasExpected) {
    finding("blocking", "P1/fix#6", rel, `declares enforces ${JSON.stringify(enforces)} but has no expected fixtures to bind them`);
  }

  // CHECK 6 (best-effort): no sibling reference (P3)
  // a reads: path pointing into a DIFFERENT pharn-stack-* / pharn-skills-* module is a sibling ref,
  // unless this capability lives in pharn-contracts or pharn-core (allowed to be depended on).
  const ownModule = (rel.split(sep).find((s) => s.startsWith("pharn-")) || "").trim();
  const reads = Array.isArray(fm.reads) ? fm.reads : fm.reads ? [fm.reads] : [];
  if (ownModule && ownModule !== "pharn-contracts" && ownModule !== "pharn-core") {
    for (const r of reads) {
      const m = String(r).match(/(pharn-(?:stack|skills)-[A-Za-z0-9-]+)/);
      if (m && m[1] !== ownModule) {
        finding(
          "blocking",
          "P3",
          rel,
          `sibling reference in reads: "${r}" points at module ${m[1]} — route shared things through pharn-contracts`
        );
      }
    }
  }
}

// CHECK 7 (conditional): archetype maps agree, if a manifest declares them (fix #5)
const archManifest = join(TARGET, "pharn-contracts", "archetype-maps.json");
if (existsSync(archManifest)) {
  try {
    const maps = JSON.parse(readFileSync(archManifest, "utf8"));
    const mapNames = ["constitution", "phases", "grillers", "planSections"];
    const present = mapNames.filter((k) => maps[k]);
    if (present.length) {
      const archetypeSets = present.map((k) => new Set(Object.keys(maps[k])));
      const union = new Set(archetypeSets.flatMap((s) => [...s]));
      for (const k of present) {
        for (const a of union) {
          if (!maps[k][a])
            finding(
              "blocking",
              "fix#5",
              "pharn-contracts/archetype-maps.json",
              `archetype "${a}" missing from map "${k}" — the four archetype maps disagree`
            );
        }
      }
    }
  } catch (e) {
    finding("blocking", "fix#5", "pharn-contracts/archetype-maps.json", `archetype-maps.json is unparseable: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Report — findings in the canonical shape (ARCHITECTURE §8)
const blocking = findings.filter((f) => f.severity === "blocking");
if (findings.length === 0) {
  console.log(`FLOOR: GREEN — ${capabilities.length} capabilities checked in ${TARGET}`);
  process.exit(0);
}
console.log(
  `FLOOR: ${blocking.length ? "RED" : "GREEN-with-warnings"} — ${findings.length} finding(s), ${capabilities.length} capabilities checked\n`
);
for (const f of findings) {
  console.log(`- [${f.severity}] ${f.rule_id}  ${f.file}`);
  console.log(`    ${f.problem}`);
}
process.exit(blocking.length ? 1 : 0);
