import { runCases } from './_helpers.mjs';

// False positives found by scanning real projects. Each must stay silent.
runCases([
  { rule: 'low-contrast', fire: false, name: 'custom bg color hides the ancestor surface', ext: '.jsx', src: 'export const A = () => (<section className="bg-white"><button className="bg-primary text-white">Save</button></section>);' },
  { rule: 'nested-cards', fire: false, name: 'form controls are not cards', src: '<section class="rounded-xl border bg-white p-6"><select class="rounded-lg border bg-white p-3"></select><input class="rounded-lg border bg-white p-3"></section>' },
  { rule: 'outline-removed', fire: false, name: 'compiled Tailwind utility definition', ext: '.css', src: '.focus\\:outline-none:focus { outline: 2px solid transparent; outline: none; }' },
  { rule: 'outline-removed', fire: false, name: 'programmatic focus target', src: '<main id="content" tabindex="-1" class="focus:outline-none">x</main>' },
  { rule: 'outline-removed', fire: false, name: 'vendor Tailwind build in a style block', src: '<style>/*! tailwindcss v4.0.7 | MIT License */ .a:focus { outline: none; } .b { text-align: justify; }</style>' },
  { rule: 'glow-orb', fire: false, name: 'hard-stop polka dots', ext: '.css', src: '.b { background-image: radial-gradient(circle at 14% 18%, #FF7AA2 0 7px, transparent 8px), radial-gradient(circle at 84% 12%, #5BC0EB 0 9px, transparent 10px); }' },
  { rule: 'ai-gradient', fire: false, name: 'separate single-color layers', ext: '.css', src: '.b { background-image: radial-gradient(circle, #FF7AA2 0 7px, transparent 8px), radial-gradient(circle, #5BC0EB 0 9px, transparent 10px); }' },
  { rule: 'hard-offset-shadow', fire: false, name: 'cloud drawn with box-shadow', ext: '.css', src: '.cloud::before { box-shadow: 38px -16px 0 0 #fff, -34px 14px 0 0 #fff; }' },
  { rule: 'tight-leading', fire: false, name: 'counter pseudo-element', ext: '.css', src: '.steps li::before { line-height: 1; }' },
  { rule: 'tight-leading', fire: false, name: 'templated display number', src: '<p class="text-4xl leading-none">{{ $day }}</p>' },
  { rule: 'all-caps-body', fire: false, name: 'short uppercase label paragraph', ext: '.jsx', src: 'export const A = () => <p className="text-xs uppercase tracking-wide">Ringkasan</p>;' },
  { rule: 'fake-stat', fire: false, name: 'numbered step', src: '<li><strong>1. Buat pesanan</strong></li><span>2 Bulan</span>' },
  { rule: 'broken-image', fire: false, name: 'lightbox image filled by script', src: '<dialog><img alt=""></dialog><img id="preview" alt=""><img data-photo alt="">' },
  { rule: 'arrow-everywhere', fire: false, name: 'JSX text before a tag is not a comparison', ext: '.jsx', src: 'export const A = () => <p>Read more <b>now</b></p>;' },
  { rule: 'bounce-easing', fire: false, name: 'background in a transition list', ext: '.css', src: '.a { transition: background 200ms ease, backface-visibility 0s; }' },
  { rule: 'missing-anchor', fire: false, name: 'JS-routed tab links', src: '<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body><nav><a href="#kreator" data-tab="kreator">Kreator</a></nav></body></html>' },
  { rule: 'dead-control', fire: false, name: 'link wired up by id', src: '<a id="open-dashboard" href="#">Buka dashboard</a>' },
  { rule: 'pure-black', fire: false, name: 'print stylesheet', ext: '.css', src: '@media print {\n  body { color: #000; background: #fff; }\n}' },
  { rule: 'stock-illustration', fire: true, name: 'underscore after kit name', src: '<img alt="" src="/img/undraw_team_work.svg">' },
]);
