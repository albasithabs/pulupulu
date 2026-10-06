import { runCases } from './_helpers.mjs';

const LONG = 'Tide heights change through the month, so check the table before you plan a launch from the north pier.';

runCases([
  // overused-font
  { rule: 'overused-font', fire: true, name: 'CSS font-family', ext: '.css', src: 'h1 { color: red; }\nbody {\n  font-family: "Inter", sans-serif;\n}', line: 3 },
  { rule: 'overused-font', fire: true, name: 'Google Fonts link', src: '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&display=swap" rel="stylesheet">' },
  { rule: 'overused-font', fire: true, name: 'next/font import', ext: '.tsx', src: "import { Geist, Roboto_Mono } from 'next/font/google';" },
  { rule: 'overused-font', fire: true, name: 'Tailwind config', ext: '.js', src: "module.exports = {\n  theme: { extend: { fontFamily: {\n    sans: ['Manrope', 'sans-serif'],\n  } } },\n};", line: 3 },
  { rule: 'overused-font', fire: true, name: 'JSX inline style', ext: '.jsx', src: "export const A = () => <p style={{ fontFamily: 'Poppins, sans-serif' }}>x</p>;" },
  { rule: 'overused-font', fire: false, name: 'allowed by config', ext: '.css', src: 'body { font-family: Inter, sans-serif; }', config: { allow: { fonts: ['Inter'] } } },
  { rule: 'overused-font', fire: false, name: 'not first family, different family', ext: '.css', src: 'body { font-family: system-ui, Inter; }\nh1 { font-family: "Inter Tight", serif; }' },
  // mono-costume
  { rule: 'mono-costume', fire: true, name: 'font-mono h1', src: '<h1 class="font-mono text-3xl">Hello</h1>' },
  { rule: 'mono-costume', fire: true, name: 'font-mono display text', src: '<p class="font-mono text-5xl">404</p>' },
  { rule: 'mono-costume', fire: true, name: 'CSS h2 monospace', ext: '.css', src: 'h2 { font-family: "JetBrains Mono", monospace; }' },
  { rule: 'mono-costume', fire: false, name: 'code and small mono', src: '<code class="font-mono text-sm">npm i</code><span class="font-mono text-xs">v1.2</span><pre><code class="font-mono text-4xl">x</code></pre>' },
  // wide-tracking-label
  { rule: 'wide-tracking-label', fire: true, name: 'Tailwind', src: '<span class="text-xs uppercase tracking-widest">Docs</span>' },
  { rule: 'wide-tracking-label', fire: true, name: 'CSS', ext: '.css', src: '.label { text-transform: uppercase; letter-spacing: 0.2em; }' },
  { rule: 'wide-tracking-label', fire: false, name: 'modest tracking, no uppercase', src: '<span class="uppercase tracking-wide">Docs</span><span class="tracking-widest">x</span>' },
  // tiny-text
  { rule: 'tiny-text', fire: true, name: 'CSS 11px', ext: '.css', src: '.meta {\n  font-size: 11px;\n}', line: 2 },
  { rule: 'tiny-text', fire: true, name: 'Tailwind arbitrary', src: '<p class="text-[10px]">Note</p>' },
  { rule: 'tiny-text', fire: false, name: 'legal, small, text-xs, zero', ext: '.css', src: '.legal { font-size: 10px; }\nsmall { font-size: 11px; }\n.reset { font-size: 0; }\n.x { font-size: 0.75rem; }' },
  { rule: 'tiny-text', fire: false, name: 'text-xs utility and small tag', src: '<p class="text-xs">ok</p><small class="text-[10px]">Terms</small>' },
  // tight-leading
  { rule: 'tight-leading', fire: true, name: 'CSS p', ext: '.css', src: 'p { line-height: 1.1; }' },
  { rule: 'tight-leading', fire: true, name: 'leading-tight on a long paragraph', src: `<p class="leading-tight">${LONG}</p>` },
  { rule: 'tight-leading', fire: false, name: 'headings and short lines', ext: '.html', src: '<style>h1 { line-height: 1.1; } p { line-height: 1.5; }</style><p class="leading-tight">Short caption</p>' },
  // justified-text
  { rule: 'justified-text', fire: true, name: 'CSS justify', ext: '.css', src: '.body { text-align: justify; }' },
  { rule: 'justified-text', fire: true, name: 'Tailwind', src: '<p class="text-justify">x</p>' },
  { rule: 'justified-text', fire: false, name: 'with hyphens', ext: '.css', src: '.body { text-align: justify; hyphens: auto; }' },
  // crushed-tracking
  { rule: 'crushed-tracking', fire: true, name: 'CSS em', ext: '.css', src: 'h1 { letter-spacing: -0.06em; }' },
  { rule: 'crushed-tracking', fire: true, name: 'Tailwind arbitrary', src: '<h1 class="tracking-[-0.05em]">x</h1>' },
  { rule: 'crushed-tracking', fire: false, name: 'mild tightening', ext: '.css', src: 'h1 { letter-spacing: -0.02em; }' },
  // all-caps-body
  { rule: 'all-caps-body', fire: true, name: 'uppercase p', src: '<p class="uppercase">Body copy here runs across several lines of reading</p>' },
  { rule: 'all-caps-body', fire: true, name: 'CSS body', ext: '.css', src: 'body { text-transform: uppercase; }' },
  { rule: 'all-caps-body', fire: false, name: 'labels and nav items', src: '<span class="uppercase">New</span><style>nav li { text-transform: uppercase; }</style>' },
  // ai-gradient
  { rule: 'ai-gradient', fire: true, name: 'CSS purple-pink', ext: '.css', src: '.hero { background: linear-gradient(90deg, #8b5cf6, #ec4899); }' },
  { rule: 'ai-gradient', fire: true, name: 'Tailwind indigo-purple', src: '<div class="bg-gradient-to-r from-indigo-500 to-purple-600">x</div>' },
  { rule: 'ai-gradient', fire: true, name: 'Tailwind blue-cyan', src: '<div class="bg-gradient-to-br from-blue-500 to-cyan-400">x</div>' },
  { rule: 'ai-gradient', fire: false, name: 'warm, neutral, scrim gradients', ext: '.css', src: '.a { background: linear-gradient(#fbbf24, #f97316); }\n.b { background: linear-gradient(#fff, #f3f4f6); }\n.c { background-image: linear-gradient(rgba(0,0,0,.6), transparent); }' },
  { rule: 'ai-gradient', fire: false, name: 'Tailwind amber-orange', src: '<div class="bg-gradient-to-r from-amber-400 to-orange-500">x</div>' },
  // gradient-text
  { rule: 'gradient-text', fire: true, name: 'Tailwind h1', src: '<h1 class="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">x</h1>' },
  { rule: 'gradient-text', fire: true, name: 'CSS', ext: '.css', src: '.t { background: linear-gradient(red, orange); -webkit-background-clip: text; color: transparent; }' },
  { rule: 'gradient-text', fire: false, name: 'clip without transparent text', src: '<h1 class="bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-900">x</h1><style>.p { background-clip: padding-box; }</style>' },
  // glow-orb
  { rule: 'glow-orb', fire: true, name: 'Tailwind orb', src: '<div class="absolute h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl"></div>' },
  { rule: 'glow-orb', fire: true, name: 'CSS radial glow', ext: '.css', src: '.bg { background: radial-gradient(circle at top, rgba(56, 189, 248, 0.35), transparent 60%); }' },
  { rule: 'glow-orb', fire: false, name: 'neutral blur, small blur, vignette', src: '<div class="rounded-full bg-gray-200/50 blur-3xl"></div><div class="rounded-full bg-black/40 blur-3xl"></div><div class="rounded-full bg-blue-500/30 blur-sm"></div><style>.v { background: radial-gradient(transparent, rgba(0,0,0,.5)); }</style>' },
  // dark-glow
  { rule: 'dark-glow', fire: true, name: 'CSS colored glow', ext: '.css', src: '.card { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }' },
  { rule: 'dark-glow', fire: true, name: 'Tailwind colored shadow', src: '<div class="shadow-lg shadow-cyan-500/50">x</div>' },
  { rule: 'dark-glow', fire: false, name: 'neutral shadow, focus ring, black shadow', ext: '.html', src: '<style>.a { box-shadow: 0 4px 12px rgba(0,0,0,.1); } .b { box-shadow: 0 0 0 3px rgba(59,130,246,.5); } input:focus { box-shadow: 0 0 12px #3b82f6; }</style><div class="shadow-lg shadow-black/10">x</div>' },
  // pure-black
  { rule: 'pure-black', fire: true, name: 'CSS body', ext: '.css', src: 'body { background: #000; }' },
  { rule: 'pure-black', fire: true, name: 'Tailwind main', src: '<main class="bg-black text-white">x</main>' },
  { rule: 'pure-black', fire: false, name: 'overlay, small element, icon color', src: '<div class="fixed inset-0 bg-black/50"></div><span class="bg-black">x</span><style>.icon { color: #000; } main { background: #0b0d10; }</style>' },
  // gray-on-color
  { rule: 'gray-on-color', fire: true, name: 'gray text on blue', src: '<p>x</p>\n<div class="bg-blue-600 text-gray-500">x</div>', line: 2 },
  { rule: 'gray-on-color', fire: true, name: 'dark theme pair', src: '<div class="bg-white text-gray-900 dark:bg-indigo-700 dark:text-slate-400">x</div>' },
  { rule: 'gray-on-color', fire: false, name: 'white on blue, gray on gray, gray on tint', src: '<div class="bg-blue-600 text-white">a</div><div class="bg-gray-100 text-gray-600">b</div><div class="bg-blue-50 text-gray-600">c</div>' },
  // low-contrast
  { rule: 'low-contrast', fire: true, name: 'gray-400 on white (~2.5)', src: '<p>x</p>\n<p class="text-gray-400 bg-white">Hint</p>', line: 2 },
  { rule: 'low-contrast', fire: true, name: 'background from ancestor', src: '<div class="bg-white">\n  <p class="text-gray-300">Hint</p>\n</div>', line: 2 },
  { rule: 'low-contrast', fire: true, name: 'CSS rule', ext: '.css', src: '.muted { color: #aaa; background-color: #fff; }' },
  { rule: 'low-contrast', fire: true, name: 'CSS custom properties', ext: '.css', src: ':root { --fg: #bbb; --bg: #fff; }\n.x { color: var(--fg); background: var(--bg); }', line: 2 },
  { rule: 'low-contrast', fire: true, name: 'dark theme only', src: '<p class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-700">x</p>' },
  { rule: 'low-contrast', fire: true, name: 'small text at 3.5:1', src: '<p class="bg-white text-[#888888]">x</p>' },
  { rule: 'low-contrast', fire: false, name: 'white on blue-600', src: '<button class="bg-blue-600 text-white">Save</button>' },
  { rule: 'low-contrast', fire: false, name: 'large text at 3.5:1', src: '<h2 class="bg-white text-3xl text-[#888888]">Big</h2>' },
  { rule: 'low-contrast', fire: false, name: 'themes are not mixed', src: '<div class="bg-white dark:bg-gray-900"><p class="text-gray-900 dark:text-gray-100">x</p></div>' },
  { rule: 'low-contrast', fire: false, name: 'hover, placeholder and ambiguous classes', src: '<input class="bg-white text-gray-900 placeholder:text-gray-400"><a class="bg-white text-gray-900 hover:text-gray-300">x</a><p class="bg-white text-gray-900 text-gray-300">y</p>' },
  { rule: 'low-contrast', fire: false, name: 'translucent or image backgrounds', src: '<div class="bg-white/40"><p class="text-gray-400">x</p></div><div class="bg-white"><div class="bg-[url(/a.jpg)]"><p class="text-gray-400">y</p></div></div>' },
]);
