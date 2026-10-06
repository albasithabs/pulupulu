import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { listStaticRules, scanFile, scanText, STATIC_RULES } from '../../skills/pulupulu/scripts/lib/static/index.mjs';

const fixture = (name) => fileURLToPath(new URL(`../fixtures/static/${name}`, import.meta.url));
const rulesOf = (findings) => new Set(findings.map((f) => f.rule));

for (const name of ['clean.html', 'clean.jsx']) {
  test(`${name} produces zero findings`, () => {
    const findings = scanFile(fixture(name), {});
    assert.deepEqual(findings.map((f) => `${f.line} ${f.rule}: ${f.message}`), []);
  });
}

test('slop.html trips the expected rules', () => {
  const got = rulesOf(scanFile(fixture('slop.html'), {}));
  for (const id of ['missing-viewport', 'overused-font', 'gradient-text', 'ai-gradient', 'dark-glow', 'side-stripe', 'em-dash', 'lorem-ipsum', 'dead-control', 'missing-anchor', 'img-no-alt', 'broken-image', 'placeholder-people', 'placeholder-image', 'stock-illustration', 'fake-stat', 'skipped-heading', 'emoji-icons', 'cadence-copy', 'section-numbers', 'marquee', 'low-contrast', 'outline-removed', 'bounce-easing', 'no-reduced-motion', 'eyebrow-pill', 'arrow-everywhere']) {
    assert.ok(got.has(id), `expected ${id}`);
  }
});

test('Slop.jsx trips the expected rules', () => {
  const findings = scanFile(fixture('Slop.jsx'), {});
  const got = rulesOf(findings);
  for (const id of ['generic-icons', 'overused-font', 'glow-orb', 'grid-background', 'gradient-text', 'kicker-label', 'gray-on-color', 'low-contrast', 'pulsing-dot', 'fake-cursor', 'image-hover-zoom', 'nested-cards', 'icon-tile-heading', 'hard-offset-shadow', 'glass-overuse', 'ai-badge', 'tiny-text', 'crushed-tracking', 'arrow-everywhere', 'pure-black']) {
    assert.ok(got.has(id), `expected ${id}`);
  }
  const gradient = findings.find((f) => f.rule === 'gradient-text');
  assert.equal(gradient.line, 12);
  assert.match(gradient.message, /<h1>.*bg-clip-text \+ text-transparent/);
});

test('slop.css trips the expected rules', () => {
  const got = rulesOf(scanFile(fixture('slop.css'), {}));
  for (const id of ['overused-font', 'ai-gradient', 'mono-costume', 'crushed-tracking', 'tiny-text', 'grid-background', 'glass-overuse', 'dark-glow', 'image-hover-zoom', 'layout-animation', 'marquee', 'fake-cursor', 'bounce-easing', 'tight-leading', 'pure-black', 'all-caps-body']) {
    assert.ok(got.has(id), `expected ${id}`);
  }
});

test('every rule has complete metadata and a unique id', () => {
  const ids = new Set();
  for (const r of STATIC_RULES) {
    assert.ok(!ids.has(r.id), `duplicate ${r.id}`);
    ids.add(r.id);
    assert.match(r.ref, /^R-\d\d$/);
    assert.ok(['high', 'medium', 'low'].includes(r.severity));
    assert.ok(['slop', 'quality', 'a11y', 'honesty', 'mobile'].includes(r.category));
    assert.ok(r.name && r.description && r.fix && typeof r.check === 'function');
  }
  assert.equal(listStaticRules().every((r) => !('check' in r)), true);
});

test('rule ids, severities and refs match the ENGINE.md table', () => {
  const engine = readFileSync(fileURLToPath(new URL('../../docs/ENGINE.md', import.meta.url)), 'utf8');
  const section = engine.split('## Static rules')[1].split('## Browser rules')[0];
  const table = [...section.matchAll(/^\| ([a-z-]+) \| (\w+) \| (R-\d+) \|/gm)].map((m) => `${m[1]} ${m[2]} ${m[3]}`);
  const ours = STATIC_RULES.map((r) => `${r.id} ${r.severity} ${r.ref}`);
  assert.deepEqual([...ours].sort(), [...table].sort());
});

test('inline waivers and config', () => {
  const src = '<p>A — b</p>\n<!-- pulupulu-disable-next-line em-dash -->\n<p>C — d</p>\n<p>E — f</p> <!-- pulupulu-disable-line -->';
  assert.deepEqual(scanText(src, { file: 'a.html' }).filter((f) => f.rule === 'em-dash').map((f) => f.line), [1]);
  assert.equal(scanText(`<!-- pulupulu-disable em-dash: brand voice -->\n${src}`, { file: 'a.html' }).filter((f) => f.rule === 'em-dash').length, 0);
  const cfg = { ignoreRules: ['em-dash'], severity: { 'img-no-alt': 'low' } };
  const out = scanText('<p>A — b</p><img src="a.png">', { file: 'a.html', config: cfg });
  assert.equal(out.some((f) => f.rule === 'em-dash'), false);
  assert.equal(out.find((f) => f.rule === 'img-no-alt').severity, 'low');
});

test('findings are deduped per rule and line, and filled completely', () => {
  const out = scanText('<p>a — b — c</p>', { file: 'x.html' });
  assert.equal(out.filter((f) => f.rule === 'em-dash').length, 1);
  const f = out[0];
  for (const key of ['rule', 'severity', 'category', 'ref', 'message', 'fix', 'file', 'line', 'snippet', 'source']) assert.ok(key in f, key);
  assert.equal(f.snippet, '<p>a — b — c</p>');
});

test('a throwing rule does not kill the scan', () => {
  const bad = { id: 'boom', name: 'Boom', category: 'slop', severity: 'low', ref: 'R-00', fix: 'x', check() { throw new Error('boom'); } };
  STATIC_RULES.unshift(bad);
  try {
    const out = scanText('<img src="a.png">', { file: 'a.html' });
    assert.ok(out.some((f) => f.rule === 'img-no-alt'));
  } finally {
    STATIC_RULES.shift();
  }
});

test('handles empty, binary-ish and huge input', () => {
  assert.deepEqual(scanText('', { file: 'a.html' }), []);
  assert.doesNotThrow(() => scanText('\u0000<<div class="\u0001', { file: 'a.tsx' }));
  assert.deepEqual(scanFile(fixture('does-not-exist.html'), {}), []);
});

// Guards against catastrophic regex backtracking (seconds), not micro-timing:
// a shared CI runner or a parallel browser test easily doubles a 60ms scan.
test('2000-line file scans without pathological slowdown', () => {
  const html = readFileSync(fixture('slop.html'), 'utf8');
  const jsx = readFileSync(fixture('Slop.jsx'), 'utf8');
  const bigHtml = Array.from({ length: Math.ceil(2000 / html.split('\n').length) }, () => html).join('\n');
  const bigJsx = Array.from({ length: Math.ceil(2000 / jsx.split('\n').length) }, () => jsx).join('\n');
  for (const [src, ext] of [[bigHtml, '.html'], [bigJsx, '.jsx']]) {
    scanText(src, { file: `big${ext}` });
    const t0 = performance.now();
    scanText(src, { file: `big${ext}` });
    const ms = performance.now() - t0;
    assert.ok(ms < 500, `${ext} took ${ms.toFixed(1)}ms`);
  }
});
