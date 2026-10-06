import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BROWSER_RULES, findBrowser, scanPages, toUrl } from '../../skills/pulupulu/scripts/lib/browser/index.mjs';

const fixtures = fileURLToPath(new URL('../fixtures/browser/', import.meta.url));
const slop = join(fixtures, 'slop.html');
const clean = join(fixtures, 'clean.html');
const browser = findBrowser();
const skip = browser ? false : 'no Chrome, Edge, or Chromium found';

describe('browser rule metadata', () => {
  it('covers every rule in the engine contract with complete fields', () => {
    const ids = BROWSER_RULES.map((r) => r.id);
    for (const id of ['low-contrast', 'tap-target', 'horizontal-overflow', 'text-overflow', 'broken-image', 'script-error',
      'hidden-content', 'line-length', 'tiny-text', 'skipped-heading', 'img-no-alt', 'unnamed-control', 'focus-invisible',
      'missing-anchor', 'overused-font', 'gradient-text', 'glass-overuse', 'nested-cards', 'gray-on-color', 'body-edge', 'flat-hierarchy']) {
      assert.ok(ids.includes(id), `missing ${id}`);
    }
    for (const r of BROWSER_RULES) {
      for (const k of ['id', 'name', 'category', 'severity', 'ref', 'description', 'fix']) assert.ok(r[k], `${r.id} lacks ${k}`);
      assert.match(r.severity, /^(high|medium|low)$/);
    }
  });

  it('turns plain paths into file URLs and leaves URLs alone', () => {
    assert.equal(toUrl(slop), pathToFileURL(slop).href);
    assert.equal(toUrl('https://example.com/a'), 'https://example.com/a');
  });
});

describe('scanPages', { skip }, () => {
  let result;
  let shots;

  before(async () => {
    shots = mkdtempSync(join(tmpdir(), 'pulupulu-shots-'));
    result = await scanPages([slop, clean], { screenshotDir: shots, browserPath: browser });
  });

  after(() => {
    if (shots) rmSync(shots, { recursive: true, force: true });
  });

  const of = (file) => result.findings.filter((f) => f.file === pathToFileURL(file).href);

  it('runs without page errors', () => {
    assert.deepEqual(result.errors, []);
    assert.equal(result.meta.pages.length, 4);
  });

  it('flags the slop fixture', () => {
    const rules = new Set(of(slop).map((f) => f.rule));
    for (const id of ['low-contrast', 'tap-target', 'horizontal-overflow', 'broken-image', 'script-error', 'img-no-alt',
      'unnamed-control', 'focus-invisible', 'missing-anchor', 'gradient-text', 'nested-cards', 'gray-on-color', 'skipped-heading']) {
      assert.ok(rules.has(id), `expected ${id}; got ${[...rules].join(', ')}`);
    }
  });

  it('reports mobile-only rules only on mobile', () => {
    for (const f of of(slop)) {
      if (['tap-target', 'horizontal-overflow', 'body-edge'].includes(f.rule)) assert.equal(f.viewport, 'mobile', f.rule);
    }
  });

  it('builds complete browser findings', () => {
    for (const f of result.findings) {
      assert.equal(f.source, 'browser');
      assert.equal(f.line, 0);
      assert.match(f.viewport, /^(desktop|mobile)$/);
      for (const k of ['rule', 'severity', 'category', 'ref', 'message', 'fix', 'file']) assert.ok(f[k], `${f.rule} lacks ${k}`);
    }
  });

  it('stays quiet on the clean fixture', () => {
    const found = of(clean);
    assert.deepEqual(found.map((f) => `${f.viewport} ${f.rule}: ${f.message} ${f.snippet}`), []);
  });

  it('writes one screenshot per page and viewport', () => {
    assert.equal(result.screenshots.length, 4);
    for (const name of ['slop-desktop.png', 'slop-mobile.png', 'clean-desktop.png', 'clean-mobile.png']) {
      const p = join(shots, name);
      assert.ok(existsSync(p), `missing ${name}`);
      assert.ok(statSync(p).size > 1000, `${name} looks empty`);
    }
  });

  it('applies config: ignored rules and severity overrides', async () => {
    const res = await scanPages([slop], {
      viewports: ['desktop'],
      settleMs: 200,
      browserPath: browser,
      config: { ignoreRules: ['low-contrast'], severity: { 'nested-cards': 'high' } },
    });
    assert.ok(!res.findings.some((f) => f.rule === 'low-contrast'));
    const nested = res.findings.find((f) => f.rule === 'nested-cards');
    assert.equal(nested && nested.severity, 'high');
  });
});
