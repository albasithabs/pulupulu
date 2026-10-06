import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanText } from '../../skills/pulupulu/scripts/lib/static/index.mjs';

export function scan(src, ext = '.html', config) {
  return scanText(src, { file: `case${ext}`, ext, config });
}

export const hitsOf = (src, ext, rule, config) => scan(src, ext, config).filter((f) => f.rule === rule);

// Table-driven cases: { rule, name, src, ext, line?, config?, fire: true|false }
export function runCases(cases) {
  for (const c of cases) {
    const ext = c.ext || '.html';
    const label = `${c.rule} ${c.fire ? 'fires' : 'stays silent'}: ${c.name}`;
    test(label, () => {
      const hits = hitsOf(c.src, ext, c.rule, c.config);
      if (!c.fire) {
        assert.deepEqual(hits.map((h) => `${h.line}: ${h.message}`), [], `${c.rule} should not fire`);
        return;
      }
      assert.ok(hits.length > 0, `${c.rule} should fire on: ${c.src.slice(0, 120)}`);
      if (c.line) assert.ok(hits.some((h) => h.line === c.line), `${c.rule} expected line ${c.line}, got ${hits.map((h) => h.line).join(',')}`);
      for (const h of hits) {
        assert.equal(h.source, 'static');
        assert.ok(h.message && h.fix && h.ref && h.severity && h.category);
      }
    });
  }
}

export const doc = (body, head = '<meta name="viewport" content="width=device-width, initial-scale=1">') =>
  `<!doctype html>\n<html lang="en">\n<head>${head}</head>\n<body>\n${body}\n</body>\n</html>`;
