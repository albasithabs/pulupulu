import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildContext, textOf } from '../../skills/pulupulu/scripts/lib/static/extract.mjs';

const JSX = `import { Sparkles } from 'lucide-react';
// comment with <b>tags</b> and text
export default function Hero({ items }) {
  const less = a<b;
  return (
    <section className="bg-white p-8">
      {/* jsx comment */}
      <h1 className={cn('text-4xl', active && 'font-bold')}>Ship faster</h1>
      <img src="/a.png" alt="A cat sleeping" />
      <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
      <p style={{ fontSize: 11, lineHeight: 1.1 }}>{'Literal child'} and https://x.com</p>
    </section>
  );
}
const btn = clsx('rounded-full', \`px-\${n} py-2\`);
`;

test('JSX: tags, depth, parent, class lists with accurate lines', () => {
  const c = buildContext(JSX, { file: 'a.jsx', ext: '.jsx' });
  assert.equal(c.kind, 'script');
  assert.equal(c.hasMarkup, true);
  const open = c.tags.filter((t) => !t.close);
  assert.deepEqual(open.map((t) => `${t.name}@${t.line}/${t.depth}`), ['section@6/0', 'h1@8/1', 'img@9/1', 'ul@10/1', 'li@10/2', 'p@11/1']);
  assert.equal(open[1].classes, 'text-4xl font-bold');
  assert.ok(c.classLists.some((l) => l.value === 'rounded-full px- py-2' && l.line === 15), 'clsx call outside markup');
});

test('JSX: visible texts exclude comments, code and expressions', () => {
  const c = buildContext(JSX, { file: 'a.jsx', ext: '.jsx' });
  const texts = c.texts.map((t) => `${t.line}|${t.parentTag}|${t.text}`);
  assert.deepEqual(texts, ['8|h1|Ship faster', '9|img|A cat sleeping', '11|p|Literal child and https://x.com']);
  assert.equal(textOf(c, c.tags.find((t) => t.name === 'section').index), 'Ship faster Literal child and https://x.com');
});

test('JSX style objects become CSS decls with px units', () => {
  const c = buildContext(JSX, { file: 'a.jsx', ext: '.jsx' });
  const inline = c.css.find((r) => r.inline);
  assert.deepEqual(inline.decls.map((d) => `${d.prop}:${d.value}@${d.line}`), ['font-size:11px@11', 'line-height:1.1@11']);
});

const HTML = `<!doctype html>
<html><head><meta name="viewport" content="width=device-width">
<style>
/* note */
.a { color: #999; background: white }
@media (prefers-reduced-motion: reduce) { .b { animation: none } }
</style></head>
<body>
<!-- <p>hidden</p> -->
<p class="text-gray-400 {{ $x }}">Hello &mdash; world {{ $name }}</p>
<script>const s = "<p>not markup</p>";</script>
<img src=x.png>
<code>a b</code>
<p
  class="multi"
  title="Tip">Multi-line tag</p>
</body></html>`;

test('HTML: style blocks, at-rules, comments, script skipped', () => {
  const c = buildContext(HTML, { file: 'a.html', ext: '.html' });
  assert.equal(c.fullDocument, true);
  assert.deepEqual(c.css.map((r) => `${r.selector}@${r.line}:${r.atRule}`), ['.a@5:null', '.b@6:@media (prefers-reduced-motion: reduce)']);
  assert.deepEqual(c.css[0].decls.map((d) => d.line), [5, 5]);
  const texts = c.texts.map((t) => `${t.line}|${t.parentTag}|${t.text}`);
  assert.deepEqual(texts, ['10|p|Hello — world', '16|p|Tip', '16|p|Multi-line tag']);
  assert.equal(c.classLists.find((l) => l.tag === 'p').value, 'text-gray-400');
  assert.ok(!c.tags.some((t) => t.name === 'p' && t.line === 9), 'commented-out tag ignored');
});

test('Vue and Svelte class bindings', () => {
  const vue = buildContext(`<template>\n  <div :class="[active ? 'bg-blue-600' : '', 'p-4']" class="rounded">{{ msg }}</div>\n</template>\n<script setup>\nconst msg = 'hi'\n</script>`, { ext: '.vue' });
  assert.equal(vue.classLists[0].value, 'bg-blue-600 p-4 rounded');
  assert.equal(vue.texts.length, 0);
  const svelte = buildContext(`<button class="btn" class:active={on}>Go</button>`, { ext: '.svelte' });
  assert.equal(svelte.classLists[0].value, 'btn active');
});

test('CSS files, SCSS nesting and @apply', () => {
  const c = buildContext(`.card {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}\n// scss comment: x\n.b { @apply uppercase tracking-widest; }`, { ext: '.scss' });
  assert.deepEqual(c.css.map((r) => `${r.fullSelector}@${r.line}`), ['.card@1', '.card &:hover@3']);
  assert.ok(c.classLists.some((l) => l.value === 'uppercase tracking-widest' && l.line === 8));
});

test('never throws on malformed input', () => {
  const junk = ['<div class="a', '<<<>>>{{{', '<a href=', '`${', '<style>.a{color:', '<p>{', '\u0000￿', '</div></div>', '<x-y z=1/>'];
  for (const src of junk) {
    for (const ext of ['.html', '.jsx', '.css', '.vue']) assert.doesNotThrow(() => buildContext(src, { ext }));
  }
  assert.doesNotThrow(() => buildContext(undefined, {}));
});
