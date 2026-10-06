import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyWaivers, globToRegExp, mergeConfig, parseInlineWaivers, DEFAULT_CONFIG } from '../../skills/pulupulu/scripts/lib/shared/config.mjs';
import { withAgentsBlock, withoutAgentsBlock, withPulupuluHooks, withoutPulupuluHooks } from '../../skills/pulupulu/scripts/lib/install.mjs';
import { subtractBaseline } from '../../skills/pulupulu/scripts/lib/hook.mjs';
import { parseArgs } from '../../skills/pulupulu/scripts/pulupulu.mjs';

test('globs match the way .gitignore users expect', () => {
  assert.ok(globToRegExp('src/legacy/**').test('src/legacy/a/b.css'));
  assert.ok(globToRegExp('**/*.html').test('index.html'));
  assert.ok(globToRegExp('**/*.html').test('a/b/index.html'));
  assert.ok(!globToRegExp('src/*.css').test('src/a/b.css'));
});

test('inline waivers cover file, line, and next line', () => {
  const text = [
    '<!-- pulupulu-disable overused-font: brand face -->',
    '<p>one</p>',
    '<p>two</p> <!-- pulupulu-disable-line em-dash -->',
    '/* pulupulu-disable-next-line low-contrast, tiny-text */',
    '<p class="text-gray-400">four</p>',
  ].join('\n');
  const w = parseInlineWaivers(text);
  const f = (rule, line) => ({ rule, line });
  const kept = applyWaivers([f('overused-font', 9), f('em-dash', 3), f('em-dash', 2), f('low-contrast', 5), f('tiny-text', 5), f('gray-on-color', 5)], w);
  assert.deepEqual(kept.map((x) => `${x.rule}@${x.line}`), ['em-dash@2', 'gray-on-color@5']);
});

test('config merging keeps defaults and unions lists', () => {
  const c = mergeConfig(structuredClone(DEFAULT_CONFIG), { ignoreRules: ['a'], allow: { fonts: ['Inter'] }, hook: { blockOn: 'medium' } });
  const c2 = mergeConfig(c, { ignoreRules: ['b', 'a'], hook: { enabled: false } });
  assert.deepEqual(c2.ignoreRules, ['a', 'b']);
  assert.deepEqual(c2.allow.fonts, ['Inter']);
  assert.deepEqual(c2.hook, { enabled: false, blockOn: 'medium' });
});

test('hook registration is idempotent and preserves foreign hooks', () => {
  const foreign = { type: 'command', command: 'echo other' };
  const settings = { model: 'x', hooks: { PostToolUse: [{ matcher: 'Edit', hooks: [foreign] }] } };
  const cmd = 'node "C:/x y/pulupulu.mjs" hook';
  const once = withPulupuluHooks(settings, cmd);
  const twice = withPulupuluHooks(once, cmd);
  assert.deepEqual(once, twice);
  assert.equal(once.model, 'x');
  assert.equal(once.hooks.PostToolUse.length, 2);
  assert.equal(once.hooks.Stop[0].hooks[0].command, cmd);
  const removed = withoutPulupuluHooks(twice);
  assert.deepEqual(removed, settings);
});

test('AGENTS.md block is replaced, not duplicated, and removable', () => {
  const start = '# Project\n\nNotes.\n';
  const one = withAgentsBlock(start);
  const two = withAgentsBlock(one);
  assert.equal(one, two);
  assert.equal(one.match(/pulupulu:start/g).length, 1);
  assert.equal(withoutAgentsBlock(two).trim(), start.trim());
});

test('hook reports only findings the edit introduced', () => {
  const f = (rule, snippet, line) => ({ rule, snippet, line });
  const baseline = { 'em-dash|a — b': 1, 'low-contrast|text-gray-400': 2 };
  const now = [f('em-dash', 'a — b', 40), f('low-contrast', 'text-gray-400', 3), f('low-contrast', 'text-gray-400', 9), f('low-contrast', 'text-gray-400', 12), f('tiny-text', 'text-[10px]', 5)];
  const introduced = subtractBaseline(now, baseline);
  assert.deepEqual(introduced.map((x) => `${x.rule}@${x.line}`), ['low-contrast@12', 'tiny-text@5']);
});

test('argument parsing handles value flags and booleans', () => {
  const a = parseArgs(['src', '--json', '--min', 'high', '--screenshots=out', '--browser', 'b.html']);
  assert.deepEqual(a._, ['src', 'b.html']);
  assert.deepEqual(a.flags, { json: true, min: 'high', screenshots: 'out', browser: true });
});
