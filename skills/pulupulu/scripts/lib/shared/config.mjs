import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Project config lives in `.pulupulu.json` (shared, committed) and
// `.pulupulu.local.json` (per machine, gitignored). Local wins field by field.
//
// {
//   "ignoreRules": ["overused-font"],
//   "ignoreFiles": ["src/legacy/**"],
//   "allow": { "fonts": ["Inter"] },        // brand decisions that silence a rule for that value
//   "severity": { "pure-black": "medium" },  // per-rule severity override
//   "hook": { "enabled": true, "blockOn": "high" }
// }

export const DEFAULT_CONFIG = {
  ignoreRules: [],
  ignoreFiles: [],
  allow: { fonts: [], colors: [] },
  severity: {},
  hook: { enabled: true, blockOn: 'high' },
};

export function findProjectRoot(start = process.cwd()) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, '.pulupulu.json')) || existsSync(join(dir, '.git')) || existsSync(join(dir, 'package.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(start);
    dir = parent;
  }
}

export function loadConfig(root = findProjectRoot()) {
  const shared = readJson(join(root, '.pulupulu.json'));
  const local = readJson(join(root, '.pulupulu.local.json'));
  return mergeConfig(mergeConfig(structuredClone(DEFAULT_CONFIG), shared), local);
}

export function mergeConfig(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  for (const key of ['ignoreRules', 'ignoreFiles']) {
    if (Array.isArray(extra[key])) base[key] = [...new Set([...base[key], ...extra[key].map(String)])];
  }
  if (extra.allow && typeof extra.allow === 'object') {
    for (const [k, v] of Object.entries(extra.allow)) {
      if (Array.isArray(v)) base.allow[k] = [...new Set([...(base.allow[k] || []), ...v.map(String)])];
    }
  }
  if (extra.severity && typeof extra.severity === 'object') Object.assign(base.severity, extra.severity);
  if (extra.hook && typeof extra.hook === 'object') Object.assign(base.hook, extra.hook);
  return base;
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    process.stderr.write(`pulupulu: ignoring ${path}: ${err.message}\n`);
    return null;
  }
}

export function globToRegExp(glob) {
  let re = '';
  const g = glob.replace(/\\/g, '/');
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        re += g[i + 2] === '/' ? '(?:.*/)?' : '.*';
        i += g[i + 2] === '/' ? 2 : 1;
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else if ('.+^${}()|[]'.includes(c)) re += '\\' + c;
    else re += c;
  }
  return new RegExp(`^${re}$`);
}

export function isIgnoredFile(file, config, root = process.cwd()) {
  if (!config.ignoreFiles.length) return false;
  const rel = relative(root, resolve(file)).split(sep).join('/');
  return config.ignoreFiles.some((g) => globToRegExp(g).test(rel));
}

// Inline waivers, in any comment syntax:
//   pulupulu-disable rule-a, rule-b: reason        whole file
//   pulupulu-disable-line rule-a                    that line
//   pulupulu-disable-next-line rule-a               the following line
// A bare `pulupulu-disable` with no rule ids waives every rule.
export function parseInlineWaivers(text) {
  const fileRules = new Set();
  const lineRules = new Map();
  const add = (line, ids) => {
    if (!lineRules.has(line)) lineRules.set(line, new Set());
    for (const id of ids) lineRules.get(line).add(id);
  };
  const lines = text.split(/\r?\n/);
  const re = /pulupulu-disable(-next-line|-line)?\b([^:\n*]*?)(?::|\*\/|-->|$)/;
  lines.forEach((line, i) => {
    const m = line.match(re);
    if (!m) return;
    const ids = m[2].split(/[\s,]+/).map((s) => s.trim()).filter((s) => /^[a-z0-9-]+$/.test(s));
    const list = ids.length ? ids : ['*'];
    if (m[1] === '-line') add(i + 1, list);
    else if (m[1] === '-next-line') add(i + 2, list);
    else for (const id of list) fileRules.add(id);
  });
  return { fileRules, lineRules };
}

export function applyWaivers(findings, waivers) {
  return findings.filter((f) => {
    if (waivers.fileRules.has('*') || waivers.fileRules.has(f.rule)) return false;
    const onLine = waivers.lineRules.get(f.line);
    return !(onLine && (onLine.has('*') || onLine.has(f.rule)));
  });
}

export function applyConfig(findings, config) {
  return findings
    .filter((f) => !config.ignoreRules.includes(f.rule))
    .map((f) => (config.severity[f.rule] ? { ...f, severity: config.severity[f.rule] } : f));
}
