#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectFiles, isUrl } from './lib/shared/files.mjs';
import { applyConfig, DEFAULT_CONFIG, findProjectRoot, isIgnoredFile, loadConfig } from './lib/shared/config.mjs';
import { dedupe, formatJson, formatText, SEVERITY_ORDER } from './lib/shared/findings.mjs';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const HELP = `pulupulu - design guard for AI coding agents

Usage:
  pulupulu detect [paths|urls...]   Scan markup and styles (default: .)
      --json                        Machine-readable output
      --browser                     Also open local .html files in a headless browser
      --screenshots <dir>           Save desktop and mobile screenshots (browser scans)
      --viewports desktop,mobile    Browser viewports (default both)
      --min high|medium|low         Lowest severity to report (default low)
      --no-config                   Ignore .pulupulu.json
  pulupulu rules [--json]           List every detector rule
  pulupulu contrast <fg> <bg>       WCAG contrast ratio of two colors
  pulupulu install [options]        Install the skill (see: pulupulu install --help)
  pulupulu uninstall [options]      Remove the skill and/or hook
  pulupulu init-config              Write a starter .pulupulu.json
  pulupulu hook                     Hook entry point (reads hook JSON on stdin)
  pulupulu version

Exit codes: 0 clean, 2 findings, 1 a target could not be scanned.
`;

export function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      const takesValue = ['screenshots', 'viewports', 'min', 'scope'].includes(k);
      if (v !== undefined) args.flags[k] = v;
      else if (takesValue && argv[i + 1] && !argv[i + 1].startsWith('--')) args.flags[k] = argv[++i];
      else args.flags[k] = true;
    } else args._.push(a);
  }
  return args;
}

async function cmdDetect(args) {
  const targets = args._.length ? args._ : ['.'];
  const root = findProjectRoot();
  const config = args.flags['no-config'] ? structuredClone(DEFAULT_CONFIG) : loadConfig(root);
  const min = args.flags.min && SEVERITY_ORDER[args.flags.min] !== undefined ? args.flags.min : 'low';
  const errors = [];
  let findings = [];

  const urls = targets.filter(isUrl);
  const paths = targets.filter((t) => !isUrl(t));
  for (const p of paths) {
    if (!existsSync(p)) errors.push(`not found: ${p}`);
  }

  const files = collectFiles(paths.filter((p) => existsSync(p))).filter((f) => !isIgnoredFile(f, config, root));
  if (files.length) {
    const { scanText } = await import('./lib/static/index.mjs');
    for (const file of files) {
      let text;
      try {
        text = readFileSync(file, 'utf8');
      } catch (err) {
        errors.push(`unreadable: ${file}: ${err.message}`);
        continue;
      }
      const rel = relative(process.cwd(), file).split('\\').join('/') || file;
      findings.push(...scanText(text, { file: rel, config }));
    }
  }

  const browserTargets = [...urls];
  if (args.flags.browser) {
    for (const f of files) if (/\.html?$/i.test(f)) browserTargets.push(pathToFileURL(f).href);
  }
  let browserSkipped = false;
  if (browserTargets.length) {
    const browser = await import('./lib/browser/index.mjs');
    const path = browser.findBrowser();
    if (!path) {
      browserSkipped = true;
      errors.push('browser checks skipped: no Chrome, Edge, or Chromium found (set PULUPULU_BROWSER to its path)');
    } else {
      const viewports = String(args.flags.viewports || 'desktop,mobile').split(',').map((s) => s.trim()).filter(Boolean);
      try {
        const res = await browser.scanPages(browserTargets, {
          viewports,
          screenshotDir: typeof args.flags.screenshots === 'string' ? resolve(args.flags.screenshots) : undefined,
          config,
          browserPath: path,
        });
        findings.push(...res.findings);
        errors.push(...(res.errors || []));
        if (res.screenshots?.length && !args.flags.json) {
          process.stderr.write(`screenshots:\n${res.screenshots.map((s) => `  ${relative(process.cwd(), s)}`).join('\n')}\n`);
        }
      } catch (err) {
        errors.push(`browser checks failed: ${err.message}`);
      }
    }
  }

  findings = dedupe(applyConfig(findings, config)).filter((f) => SEVERITY_ORDER[f.severity] <= SEVERITY_ORDER[min]);

  if (args.flags.json) {
    process.stdout.write(formatJson(findings, { scanned: { files: files.length, pages: browserTargets.length }, errors }));
  } else {
    process.stdout.write(formatText(findings, { color: process.stdout.isTTY }));
    process.stdout.write(`scanned ${files.length} file(s)${browserTargets.length ? `, ${browserTargets.length} page(s)` : ''}.\n`);
    for (const e of errors) process.stderr.write(`pulupulu: ${e}\n`);
  }
  // A URL that could not be checked is an operational failure; a local
  // --browser pass that had no browser still leaves a valid static scan.
  const urlsUnchecked = browserSkipped && urls.length > 0;
  const hardErrors = errors.filter((e) => !e.startsWith('browser checks skipped'));
  if (hardErrors.length || urlsUnchecked) return 1;
  return findings.length ? 2 : 0;
}

async function cmdRules(args) {
  const { STATIC_RULES } = await import('./lib/static/index.mjs');
  const { BROWSER_RULES } = await import('./lib/browser/index.mjs');
  const strip = (r, source) => ({ id: r.id, name: r.name, severity: r.severity, ref: r.ref, category: r.category, source, description: r.description, fix: r.fix });
  const rules = [...STATIC_RULES.map((r) => strip(r, 'static')), ...BROWSER_RULES.map((r) => strip(r, 'browser'))];
  if (args.flags.json) {
    process.stdout.write(JSON.stringify(rules, null, 2) + '\n');
    return 0;
  }
  for (const source of ['static', 'browser']) {
    const list = rules
      .filter((r) => r.source === source)
      .sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }) || a.id.localeCompare(b.id));
    process.stdout.write(`\n${source} rules (${list.length})\n`);
    for (const r of list) process.stdout.write(`  ${r.ref.padEnd(5)} ${r.severity.padEnd(6)} ${r.id.padEnd(22)} ${r.name}\n`);
  }
  return 0;
}

async function cmdContrast(args) {
  const [fg, bg] = args._;
  if (!fg || !bg) {
    process.stderr.write('usage: pulupulu contrast <foreground> <background>\n');
    return 1;
  }
  const color = await import('./lib/shared/color.mjs');
  const f = color.parseColor(fg);
  const b = color.parseColor(bg);
  if (!f || !b) {
    process.stderr.write(`pulupulu: cannot parse ${!f ? fg : bg}\n`);
    return 1;
  }
  const ratio = color.contrastRatio(f, b);
  const mark = (ok) => (ok ? 'pass' : 'FAIL');
  process.stdout.write(
    `${fg} on ${bg}: ${ratio.toFixed(2)}:1\n` +
      `  AA  normal text (4.5)   ${mark(ratio >= 4.5)}\n` +
      `  AA  large text (3.0)    ${mark(ratio >= 3)}\n` +
      `  AAA normal text (7.0)   ${mark(ratio >= 7)}\n` +
      `  UI components (3.0)     ${mark(ratio >= 3)}\n`,
  );
  return ratio >= 4.5 ? 0 : 2;
}

function cmdInitConfig() {
  const path = join(findProjectRoot(), '.pulupulu.json');
  if (existsSync(path)) {
    process.stdout.write(`${path} already exists.\n`);
    return 0;
  }
  const starter = {
    ignoreRules: [],
    ignoreFiles: [],
    allow: { fonts: [] },
    severity: {},
    hook: { enabled: true, blockOn: 'high' },
  };
  writeFileSync(path, JSON.stringify(starter, null, 2) + '\n');
  process.stdout.write(`wrote ${path}\n`);
  return 0;
}

function cmdVersion() {
  const file = join(SKILL_DIR, 'VERSION');
  process.stdout.write((existsSync(file) ? readFileSync(file, 'utf8').trim() : 'dev') + '\n');
  return 0;
}

export async function main(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  const args = parseArgs(rest);
  switch (cmd) {
    case 'detect':
      return cmdDetect(args);
    case 'rules':
      return cmdRules(args);
    case 'contrast':
      return cmdContrast(args);
    case 'init-config':
      return cmdInitConfig();
    case 'hook':
      return (await import('./lib/hook.mjs')).runHook();
    case 'install':
      return (await import('./lib/install.mjs')).install(args, SKILL_DIR);
    case 'uninstall':
      return (await import('./lib/install.mjs')).uninstall(args, SKILL_DIR);
    case 'version':
    case '--version':
    case '-v':
      return cmdVersion();
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      process.stdout.write(HELP);
      return 0;
    default:
      process.stderr.write(`pulupulu: unknown command "${cmd}"\n\n${HELP}`);
      return 1;
  }
}

// npm's bin shim and `node pulupulu.mjs` both land here; importing the module from tests does not.
const entry = process.argv[1] ? resolve(process.argv[1]) : '';
const self = fileURLToPath(import.meta.url);
const invokedDirectly = entry === self || entry.toLowerCase() === self.toLowerCase() || /[\\/]pulupulu(\.mjs)?$/i.test(entry);
if (invokedDirectly) {
  main().then(
    (code) => {
      process.exitCode = code ?? 0;
    },
    (err) => {
      process.stderr.write(`pulupulu: ${err.stack || err.message}\n`);
      process.exitCode = 1;
    },
  );
}
