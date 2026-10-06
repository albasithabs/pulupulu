import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const HELP = `pulupulu install [options]

  Copies the pulupulu skill into a Claude Code skills folder.

  --global      Install into ~/.claude (all projects). Default: ./.claude (this project)
  --hook        Also register the edit-time detector hook
                  project: .claude/settings.local.json (machine-local, not committed)
                  global:  ~/.claude/settings.json
  --agents      Also add a pointer block to AGENTS.md for Codex, Cursor, Gemini and others
  --force       Overwrite an existing install; back up a malformed settings file and replace it
  --dry-run     Show what would change, change nothing

pulupulu uninstall [--global] [--hook] [--dry-run]
  --hook        Remove only the hook, keep the skill
`;

const HOOK_MARK = /pulupulu\.mjs"?\s+hook\b/;
const AGENTS_START = '<!-- pulupulu:start -->';
const AGENTS_END = '<!-- pulupulu:end -->';

function paths(args) {
  const base = args.flags.global ? join(homedir(), '.claude') : resolve(process.cwd(), '.claude');
  return {
    base,
    skill: join(base, 'skills', 'pulupulu'),
    settings: args.flags.global ? join(base, 'settings.json') : join(base, 'settings.local.json'),
    agents: resolve(process.cwd(), 'AGENTS.md'),
  };
}

function slash(p) {
  return p.split('\\').join('/');
}

function hookCommand(skillDir) {
  return `node "${slash(join(skillDir, 'scripts', 'pulupulu.mjs'))}" hook`;
}

function readVersion(dir) {
  try {
    return readFileSync(join(dir, 'VERSION'), 'utf8').trim();
  } catch {
    return 'unknown';
  }
}

function readSettings(file, force, log) {
  if (!existsSync(file)) return {};
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    throw new Error('not a JSON object');
  } catch (err) {
    if (!force) throw new Error(`${file} is not valid JSON (${err.message}). Fix it, or rerun with --force to back it up and replace it.`);
    copyFileSync(file, `${file}.bak`);
    log(`backed up malformed ${file} to ${file}.bak`);
    return {};
  }
}

export function withoutPulupuluHooks(settings) {
  const out = structuredClone(settings);
  if (!out.hooks || typeof out.hooks !== 'object') return out;
  for (const event of Object.keys(out.hooks)) {
    if (!Array.isArray(out.hooks[event])) continue;
    out.hooks[event] = out.hooks[event]
      .map((group) => ({ ...group, hooks: (group.hooks || []).filter((h) => !HOOK_MARK.test(String(h.command || ''))) }))
      .filter((group) => group.hooks.length);
    if (!out.hooks[event].length) delete out.hooks[event];
  }
  if (!Object.keys(out.hooks).length) delete out.hooks;
  return out;
}

export function withPulupuluHooks(settings, command) {
  const out = withoutPulupuluHooks(settings);
  out.hooks ||= {};
  const entry = (timeout, statusMessage) => ({ type: 'command', command, timeout, statusMessage });
  const add = (event, group) => {
    out.hooks[event] ||= [];
    out.hooks[event].push(group);
  };
  add('PreToolUse', { matcher: 'Edit|Write|MultiEdit', hooks: [entry(10, 'pulupulu: baseline')] });
  add('PostToolUse', { matcher: 'Edit|Write|MultiEdit', hooks: [entry(15, 'pulupulu: checking UI edit')] });
  add('Stop', { hooks: [entry(30, 'pulupulu: delivery gate')] });
  return out;
}

const AGENTS_BLOCK = `${AGENTS_START}
## pulupulu
For UI, copy, accessibility, responsive layout, or code-comment work, read \`.claude/skills/pulupulu/SKILL.md\` and follow it.
Run the detector before delivering: \`node .claude/skills/pulupulu/scripts/pulupulu.mjs detect <changed files>\`.
${AGENTS_END}`;

export function withAgentsBlock(text) {
  const stripped = withoutAgentsBlock(text).replace(/\s*$/, '');
  return (stripped ? `${stripped}\n\n` : '') + AGENTS_BLOCK + '\n';
}

export function withoutAgentsBlock(text) {
  const re = new RegExp(`\\n*${AGENTS_START}[\\s\\S]*?${AGENTS_END}\\n?`, 'g');
  return text.replace(re, '\n').replace(/\n{3,}/g, '\n\n');
}

export function install(args, sourceDir) {
  if (args.flags.help) {
    process.stdout.write(HELP);
    return 0;
  }
  const dry = !!args.flags['dry-run'];
  const log = (s) => process.stdout.write(`${dry ? '[dry-run] ' : ''}${s}\n`);
  const p = paths(args);
  const scope = args.flags.global ? 'global' : 'project';

  if (resolve(p.skill) === resolve(sourceDir)) {
    log(`skill already lives at ${p.skill}`);
  } else if (existsSync(join(p.skill, 'SKILL.md')) && !args.flags.force) {
    log(`pulupulu ${readVersion(p.skill)} is already installed at ${p.skill}; this package carries ${readVersion(sourceDir)}.`);
    log('rerun with --force to overwrite it.');
  } else {
    if (!dry) {
      rmSync(p.skill, { recursive: true, force: true });
      mkdirSync(dirname(p.skill), { recursive: true });
      cpSync(sourceDir, p.skill, { recursive: true });
    }
    log(`installed pulupulu ${readVersion(sourceDir)} (${scope}) at ${p.skill}`);
  }

  if (args.flags.hook) {
    const settings = readSettings(p.settings, !!args.flags.force, log);
    const next = withPulupuluHooks(settings, hookCommand(p.skill));
    if (!dry) {
      mkdirSync(dirname(p.settings), { recursive: true });
      writeFileSync(p.settings, JSON.stringify(next, null, 2) + '\n');
    }
    log(`registered the edit hook in ${p.settings}`);
    log('hooks run outside model approval; review the entries before an unattended session.');
  }

  if (args.flags.agents) {
    const current = existsSync(p.agents) ? readFileSync(p.agents, 'utf8') : '';
    if (!dry) writeFileSync(p.agents, withAgentsBlock(current));
    log(`added the pulupulu pointer block to ${p.agents}`);
  }

  log('restart Claude Code (or start a new session) so it picks up the skill, then try: /pulupulu');
  return 0;
}

export function uninstall(args) {
  if (args.flags.help) {
    process.stdout.write(HELP);
    return 0;
  }
  const dry = !!args.flags['dry-run'];
  const log = (s) => process.stdout.write(`${dry ? '[dry-run] ' : ''}${s}\n`);
  const p = paths(args);

  if (existsSync(p.settings)) {
    const settings = readSettings(p.settings, false, log);
    const next = withoutPulupuluHooks(settings);
    if (JSON.stringify(next) !== JSON.stringify(settings)) {
      if (!dry) writeFileSync(p.settings, JSON.stringify(next, null, 2) + '\n');
      log(`removed the pulupulu hook from ${p.settings}`);
    }
  }
  // `uninstall --hook` reads naturally as "remove the hook", so it means hook-only too.
  if (args.flags['hook-only'] || args.flags.hook) return 0;

  const skillFile = join(p.skill, 'SKILL.md');
  if (existsSync(skillFile) && /^name:\s*pulupulu\s*$/m.test(readFileSync(skillFile, 'utf8'))) {
    if (!dry) rmSync(p.skill, { recursive: true, force: true });
    log(`removed ${p.skill}`);
  }
  if (!args.flags.global && existsSync(p.agents)) {
    const text = readFileSync(p.agents, 'utf8');
    if (text.includes(AGENTS_START)) {
      if (!dry) writeFileSync(p.agents, withoutAgentsBlock(text));
      log(`removed the pulupulu block from ${p.agents}`);
    }
  }
  return 0;
}
