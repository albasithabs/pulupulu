import { runCases } from './_helpers.mjs';

const LOGOS = '<a href="/a">Docs</a>';

runCases([
  // kicker-label
  { rule: 'kicker-label', fire: true, name: 'uppercase label above h2', src: '<section>\n  <p class="text-sm font-medium uppercase text-blue-600">Features</p>\n  <h2>Built for crews</h2>\n</section>', line: 2 },
  { rule: 'kicker-label', fire: true, name: 'eyebrow class name', src: '<span class="eyebrow">Pricing</span><h1>Plans</h1>' },
  { rule: 'kicker-label', fire: false, name: 'label above a paragraph, plain small text', src: '<p class="text-sm uppercase">Note</p><p>Body</p><p class="text-sm text-gray-600">Updated today</p><h2>Next</h2>' },
  // eyebrow-pill
  { rule: 'eyebrow-pill', fire: true, name: 'pill above h1', src: '<a class="rounded-full border px-3 py-1 text-sm" href="/changelog">Version 2 is out</a>\n<h1>Plan tides</h1>', line: 1 },
  { rule: 'eyebrow-pill', fire: false, name: 'pill above paragraph, avatar above h1', src: '<span class="rounded-full bg-gray-100 px-2 text-xs">Draft</span><p>x</p><img class="h-10 w-10 rounded-full" src="a.png" alt=""><h1>Rina</h1>' },
  // ai-badge
  { rule: 'ai-badge', fire: true, name: 'New pill', src: '<span class="rounded-full bg-blue-50 px-2 text-xs">New</span>' },
  { rule: 'ai-badge', fire: true, name: 'AI Powered with sparkle', src: '<span class="badge">✨ AI Powered</span>' },
  { rule: 'ai-badge', fire: false, name: 'specific badge, plain word', src: '<span class="rounded-full bg-blue-50 px-2 text-xs">3 new messages</span><p>New</p>' },
  // section-numbers
  { rule: 'section-numbers', fire: true, name: 'three numbers', src: '<span>01</span>\n<span>02</span>\n<span>03</span>', line: 2 },
  { rule: 'section-numbers', fire: false, name: 'two numbers, table cells', src: '<span>01</span><span>02</span><table><tr><td>01</td><td>02</td><td>03</td></tr></table>' },
  // side-stripe
  { rule: 'side-stripe', fire: true, name: 'Tailwind', src: '<div class="border-l-4 border-indigo-500 pl-4">Tip</div>' },
  { rule: 'side-stripe', fire: true, name: 'CSS', ext: '.css', src: '.callout {\n  border-left: 4px solid #f59e0b;\n}', line: 2 },
  { rule: 'side-stripe', fire: false, name: 'gray dividers and quotes', src: '<div class="border-l border-gray-200">a</div><div class="border-l-4 border-gray-300">b</div><blockquote class="border-l-4 border-blue-500">c</blockquote><style>.d { border-left: 1px solid #3b82f6; } blockquote { border-left: 4px solid #6366f1; }</style>' },
  // hairline-wide-shadow
  { rule: 'hairline-wide-shadow', fire: true, name: 'Tailwind', src: '<div class="rounded-xl border shadow-2xl">x</div>' },
  { rule: 'hairline-wide-shadow', fire: true, name: 'CSS', ext: '.css', src: '.c { border: 1px solid #eee; box-shadow: 0 24px 48px rgba(0,0,0,.12); }' },
  { rule: 'hairline-wide-shadow', fire: false, name: 'tight shadow or no border', src: '<div class="border shadow-sm">a</div><div class="shadow-xl">b</div>' },
  // hard-offset-shadow
  { rule: 'hard-offset-shadow', fire: true, name: 'CSS', ext: '.css', src: '.s { box-shadow: 4px 4px 0 #000; }' },
  { rule: 'hard-offset-shadow', fire: true, name: 'Tailwind arbitrary', src: '<div class="shadow-[6px_6px_0_0_#111]">x</div>' },
  { rule: 'hard-offset-shadow', fire: false, name: 'hairline and soft shadows', ext: '.css', src: '.a { box-shadow: 0 1px 0 rgba(0,0,0,.1); }\n.b { box-shadow: 0 4px 12px rgba(0,0,0,.1); }\n.c { box-shadow: inset 4px 4px 0 #000; }' },
  // glass-overuse
  { rule: 'glass-overuse', fire: true, name: 'three blurs', src: '<div class="backdrop-blur">a</div>\n<div class="backdrop-blur-md">b</div>\n<div class="backdrop-blur-lg">c</div>', line: 3 },
  { rule: 'glass-overuse', fire: false, name: 'two blurs', src: '<header class="backdrop-blur">a</header><div class="backdrop-blur-md">b</div><div class="backdrop-blur-none">c</div>' },
  // grid-background
  { rule: 'grid-background', fire: true, name: 'CSS line grid', ext: '.css', src: '.g { background-image: linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px); background-size: 24px 24px; }' },
  { rule: 'grid-background', fire: true, name: 'Tailwind utility', src: '<div class="bg-grid-slate-100">x</div>' },
  { rule: 'grid-background', fire: false, name: 'plain gradient, cover image', ext: '.css', src: '.a { background: linear-gradient(#fff, #f5f5f5); }\n.b { background-image: url(a.jpg); background-size: cover; }' },
  // repeating-stripes
  { rule: 'repeating-stripes', fire: true, name: 'decorative stripes', ext: '.css', src: '.hero { background: repeating-linear-gradient(45deg, #fafafa 0 10px, #f0f0f0 10px 20px); }' },
  { rule: 'repeating-stripes', fire: false, name: 'progress bar stripes', ext: '.css', src: '.progress-bar { background: repeating-linear-gradient(45deg, #3b82f6 0 10px, #60a5fa 10px 20px); }' },
  // generic-icons
  { rule: 'generic-icons', fire: true, name: 'two generic icons', ext: '.jsx', src: "import { Sparkles, Rocket, Mail } from 'lucide-react';", line: 1 },
  { rule: 'generic-icons', fire: true, name: 'heroicons suffixes', ext: '.jsx', src: "import { SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';" },
  { rule: 'generic-icons', fire: false, name: 'one generic icon, non-icon module', ext: '.jsx', src: "import { Sparkles, Mail, Calendar } from 'lucide-react';\nimport { Rocket, Zap } from './my-components';" },
  // arrow-everywhere
  { rule: 'arrow-everywhere', fire: true, name: 'three arrow links', src: '<a href="/a">Docs →</a>\n<a href="/b">Pricing →</a>\n<a href="/c">Blog ↗</a>', line: 3 },
  { rule: 'arrow-everywhere', fire: true, name: 'arrow icons in JSX', ext: '.jsx', src: 'export const A = () => (<div><a href="/a">A <ArrowRight /></a><a href="/b">B <ArrowRight /></a><Button>C <ArrowUpRight /></Button></div>);' },
  { rule: 'arrow-everywhere', fire: false, name: 'two arrows', src: `<a href="/a">Docs →</a><a href="/b">Pricing →</a>${LOGOS}` },
  // emoji-icons
  { rule: 'emoji-icons', fire: true, name: 'emoji bullets', src: '<ul>\n<li>🚀 Fast</li>\n<li>🔒 Safe</li>\n<li>⚡ Live</li>\n</ul>', line: 2 },
  { rule: 'emoji-icons', fire: true, name: 'emoji spans in headings', src: '<h3><span>🎯</span> Goals</h3><h3><span>📈</span> Growth</h3><h3><span>🧭</span> Plan</h3>' },
  { rule: 'emoji-icons', fire: false, name: 'two bullets, emoji in prose, copyright', src: '<li>🚀 Fast</li><li>🔒 Safe</li><p>🎉 Thanks!</p><p>🎉 Again</p><p>🎉 More</p><li>© 2026 Harbor</li>' },
  // icon-tile-heading
  { rule: 'icon-tile-heading', fire: true, name: 'tile above h3', src: '<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">\n  <svg viewBox="0 0 24 24"></svg>\n</div>\n<h3>Sync</h3>', line: 1 },
  { rule: 'icon-tile-heading', fire: false, name: 'tile above paragraph, round avatar, no icon', src: '<div class="h-10 w-10 rounded-lg bg-blue-100"><svg></svg></div><p>x</p><div class="h-10 w-10 rounded-full bg-blue-100"><svg></svg></div><h3>a</h3><div class="h-10 w-10 rounded-lg bg-blue-100">AB</div><h3>b</h3>' },
  // nested-cards
  { rule: 'nested-cards', fire: true, name: 'card in card', src: '<div class="rounded-xl border bg-white p-6">\n  <div class="rounded-lg border bg-gray-50 p-4">Inner</div>\n</div>', line: 2 },
  { rule: 'nested-cards', fire: false, name: 'sibling cards, plain inner box', src: '<div class="grid"><div class="rounded-xl border bg-white p-6">a</div><div class="rounded-xl border bg-white p-6"><div class="p-4">b</div></div></div>' },
  // bounce-easing
  { rule: 'bounce-easing', fire: true, name: 'overshoot cubic-bezier', ext: '.css', src: '.a {\n  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);\n}', line: 2 },
  { rule: 'bounce-easing', fire: true, name: 'animate-bounce', src: '<div class="animate-bounce">↓</div>' },
  { rule: 'bounce-easing', fire: true, name: 'GSAP back ease', ext: '.js', src: "gsap.to('.x', { y: 0, ease: 'back.out(1.7)' });" },
  { rule: 'bounce-easing', fire: false, name: 'ease-out and background transitions', ext: '.css', src: '.a { transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1); }\n.b { transition: backdrop-filter 200ms ease-out; }' },
  // layout-animation
  { rule: 'layout-animation', fire: true, name: 'transition width', ext: '.css', src: '.bar { transition: width 300ms ease; }' },
  { rule: 'layout-animation', fire: true, name: 'keyframes height', ext: '.css', src: '@keyframes grow {\n  from { height: 0; }\n  to { height: 200px; }\n}', line: 2 },
  { rule: 'layout-animation', fire: true, name: 'Tailwind arbitrary', src: '<div class="transition-[width] duration-300">x</div>' },
  { rule: 'layout-animation', fire: false, name: 'transform and opacity', ext: '.css', src: '.a { transition: transform 200ms, opacity 200ms; }\n.b { transition: all 200ms; }' },
  // no-reduced-motion
  { rule: 'no-reduced-motion', fire: true, name: 'keyframes without media query', ext: '.css', src: '.a { color: red; }\n@keyframes spin { to { transform: rotate(360deg); } }', line: 2 },
  { rule: 'no-reduced-motion', fire: false, name: 'with media query', ext: '.css', src: '@keyframes spin { to { transform: rotate(1turn); } }\n@media (prefers-reduced-motion: reduce) { * { animation: none; } }' },
  // marquee
  { rule: 'marquee', fire: true, name: 'element', src: '<marquee>Hi</marquee>' },
  { rule: 'marquee', fire: true, name: 'keyframes', ext: '.css', src: '@keyframes marquee {\n  to { transform: translateX(-50%); }\n}' },
  { rule: 'marquee', fire: true, name: 'Tailwind', src: '<div class="flex animate-marquee">x</div>' },
  { rule: 'marquee', fire: false, name: 'slide-in keyframes', ext: '.css', src: '@keyframes slide-in { from { transform: translateX(-8px); } }\n@keyframes scroll-hint { to { opacity: 0; } }' },
  // pulsing-dot
  { rule: 'pulsing-dot', fire: true, name: 'ping dot', src: '<span class="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>' },
  { rule: 'pulsing-dot', fire: false, name: 'skeleton avatar', src: '<div class="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>' },
  // fake-cursor
  { rule: 'fake-cursor', fire: true, name: 'blink keyframes', ext: '.css', src: '@keyframes blink { 50% { opacity: 0; } }' },
  { rule: 'fake-cursor', fire: true, name: 'caret span', src: '<span class="animate-pulse">|</span>' },
  { rule: 'fake-cursor', fire: false, name: 'blink name without toggling, pulsing text', ext: '.html', src: '<style>@keyframes blink { to { transform: scale(1.1); } }</style><span class="animate-pulse">Loading</span>' },
  // image-hover-zoom
  { rule: 'image-hover-zoom', fire: true, name: 'CSS', ext: '.css', src: '.card:hover img { transform: scale(1.05); }' },
  { rule: 'image-hover-zoom', fire: true, name: 'Tailwind group-hover', src: '<img class="transition group-hover:scale-105" src="a.jpg" alt="">' },
  { rule: 'image-hover-zoom', fire: false, name: 'card lift, non-image scale', src: '<style>.card:hover { transform: translateY(-2px); }</style><div class="hover:scale-105">x</div><img class="scale-105" src="a.jpg" alt="">' },
]);
