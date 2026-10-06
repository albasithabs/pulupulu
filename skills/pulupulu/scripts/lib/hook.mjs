import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyConfig, findProjectRoot, isIgnoredFile, loadConfig } from './shared/config.mjs';
import { isUiFile } from './shared/files.mjs';
import { SEVERITY_LABEL, SEVERITY_ORDER, sortFindings } from './shared/findings.mjs';

// Claude Code hook entry point.
//
//   PreToolUse  (Edit|Write|MultiEdit)  records the findings a file already has, once per session
//   PostToolUse (Edit|Write|MultiEdit)  reports findings the edit introduced
//   Stop                                blocks finishing once while introduced findings at or above
//                                       hook.blockOn remain in any file edited this session
//
// Only findings an edit introduced are reported, so legacy files stay quiet.
// A hook must never break the session: every failure exits 0 silently.

const STATE_DIR = join(tmpdir(), 'pulupulu-hook');
const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'pulupulu.mjs').split('\\').join('/');
const MAX_LISTED = 12;

export async function runHook() {
  try {
    const raw = await readStdin();
    if (!raw.trim()) return 0;
    const input = JSON.parse(raw);
    const event = input.hook_event_name || (input.tool_name ? 'PostToolUse' : 'Stop');
    const root = findProjectRoot(input.cwd || process.cwd());
    const config = loadConfig(root);
    if (config.hook.enabled === false) return 0;
    const ctx = { input, root, config, session: sessionKey(input) };
    if (event === 'PreToolUse') return await preToolUse(ctx);
    if (event === 'PostToolUse') return await postToolUse(ctx);
    if (event === 'Stop' || event === 'SubagentStop') return await stop(ctx);
    return 0;
  } catch (err) {
    if (process.env.PULUPULU_DEBUG) process.stderr.write(`pulupulu hook: ${err.stack || err.message}\n`);
    return 0;
  }
}

async function preToolUse({ input, root, config, session }) {
  const file = targetFile(input, root);
  if (!file || !isUiFile(file) || isIgnoredFile(file, config, root)) return 0;
  const state = loadState(session);
  if (state.files[file]) return 0;
  state.files[file] = { baseline: existsSync(file) ? keyCounts(await scan(file, root, config)) : {} };
  saveState(session, state);
  return 0;
}

async function postToolUse({ input, root, config, session }) {
  const file = targetFile(input, root);
  if (!file || !isUiFile(file) || isIgnoredFile(file, config, root) || !existsSync(file)) return 0;
  const state = loadState(session);
  // No PreToolUse record (hook installed mid-session): only a Write that
  // created the file can be fully attributed to this session.
  if (!state.files[file]) {
    state.files[file] = { baseline: input.tool_name === 'Write' ? {} : null };
    saveState(session, state);
  }
  const findings = await scan(file, root, config);
  const baseline = state.files[file].baseline;
  const introduced = baseline ? subtractBaseline(findings, baseline) : findings;
  const shown = introduced.filter((f) => f.severity !== 'low' || introduced.length <= 3);
  if (!shown.length) return 0;

  const rel = relPath(file, root);
  const blocking = shown.filter((f) => isBlocking(f, config));
  const text = describe(shown, {
    heading: `pulupulu: ${shown.length} finding(s) introduced in ${rel}`,
    footer:
      `Fix at the edit site, or waive with a reason: \`pulupulu-disable-next-line <rule-id>: <why>\`. ` +
      `Full scan: \`node "${SCRIPT}" detect "${rel}"\`.`,
  });
  if (blocking.length) emit({ decision: 'block', reason: text });
  else emit({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } });
  return 0;
}

async function stop({ input, root, config, session }) {
  if (input.stop_hook_active) return 0;
  const state = loadState(session);
  const remaining = [];
  for (const [file, entry] of Object.entries(state.files)) {
    if (!existsSync(file) || isIgnoredFile(file, config, root)) continue;
    const findings = await scan(file, root, config);
    const introduced = entry.baseline ? subtractBaseline(findings, entry.baseline) : findings;
    remaining.push(...introduced.filter((f) => isBlocking(f, config)));
  }
  pruneOldState();
  if (!remaining.length) return 0;
  emit({
    decision: 'block',
    reason: describe(remaining, {
      heading: `pulupulu delivery gate: ${remaining.length} finding(s) introduced this session are still open`,
      footer:
        'Fix them, or waive each with a written reason (`pulupulu-disable-next-line <rule-id>: <why>`), ' +
        'then finish. This check runs once per stop.',
    }),
  });
  return 0;
}

function isBlocking(f, config) {
  const level = config.hook.blockOn;
  if (level === 'never' || level === false) return false;
  return SEVERITY_ORDER[f.severity] <= (SEVERITY_ORDER[level] ?? SEVERITY_ORDER.high);
}

async function scan(file, root, config) {
  const { scanText } = await import('./static/index.mjs');
  const text = readFileSync(file, 'utf8');
  return applyConfig(scanText(text, { file: relPath(file, root), config }), config);
}

// Line numbers move with every edit, so findings are matched on what they
// are (rule + snippet), counted as a multiset.
function findingKey(f) {
  return `${f.rule}|${String(f.snippet || f.message).replace(/\s+/g, ' ').trim()}`;
}

function keyCounts(findings) {
  const counts = {};
  for (const f of findings) counts[findingKey(f)] = (counts[findingKey(f)] || 0) + 1;
  return counts;
}

export function subtractBaseline(findings, baseline) {
  const left = { ...baseline };
  const out = [];
  for (const f of findings) {
    const k = findingKey(f);
    if (left[k] > 0) left[k]--;
    else out.push(f);
  }
  return out;
}

function describe(findings, { heading, footer }) {
  const sorted = sortFindings(findings);
  const lines = [heading];
  for (const f of sorted.slice(0, MAX_LISTED)) {
    const where = f.line ? `${f.file}:${f.line}` : f.file;
    lines.push(`- ${SEVERITY_LABEL[f.severity]} ${f.rule} (${f.ref}) ${where}: ${f.message}${f.fix ? ` Fix: ${f.fix}` : ''}`);
  }
  if (sorted.length > MAX_LISTED) lines.push(`- ...and ${sorted.length - MAX_LISTED} more`);
  lines.push(footer);
  return lines.join('\n');
}

function targetFile(input, root) {
  const p = input.tool_input?.file_path || input.tool_input?.path || input.tool_input?.notebook_path;
  return p ? resolve(input.cwd || root, p) : null;
}

function relPath(file, root) {
  return relative(root, file).split('\\').join('/') || file;
}

function sessionKey(input) {
  return String(input.session_id || 'default').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'default';
}

function loadState(session) {
  try {
    const s = JSON.parse(readFileSync(join(STATE_DIR, `${session}.json`), 'utf8'));
    if (s && typeof s.files === 'object') return s;
  } catch {}
  return { files: {} };
}

function saveState(session, state) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(join(STATE_DIR, `${session}.json`), JSON.stringify(state));
}

function pruneOldState() {
  try {
    const cutoff = Date.now() - 3 * 24 * 3600 * 1000;
    for (const name of readdirSync(STATE_DIR)) {
      const p = join(STATE_DIR, name);
      if (statSync(p).mtimeMs < cutoff) rmSync(p, { force: true });
    }
  } catch {}
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function readStdin() {
  return new Promise((resolveRead) => {
    if (process.stdin.isTTY) return resolveRead('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolveRead(data));
    process.stdin.on('error', () => resolveRead(data));
  });
}
