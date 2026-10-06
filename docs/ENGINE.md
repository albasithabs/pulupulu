# Pulupulu engine contract

This file is the contract between the detector parts. Read it before touching `skills/pulupulu/scripts/`.

## Ground rules

- **Zero runtime dependencies.** Node 18+ built-ins only (`node:fs`, `node:path`, `node:child_process`, `node:test`, global `WebSocket` on Node 22+, with a fallback note for older Node). No npm packages, not even for tests.
- **ES modules** (`.mjs`), 2-space indent, single quotes, semicolons.
- **Never execute project code.** The static scanner reads text. The browser scanner loads a page the user pointed at.
- **False positives cost more than misses.** A rule fires only on a pattern it can name with confidence. When unsure, lower the severity or skip.
- Comments explain *why* or a non-obvious constraint. No narration of what the next line does.

## Layout

```
skills/pulupulu/scripts/
  pulupulu.mjs              CLI: detect, rules, contrast, hook, install, uninstall, init-config
  lib/shared/findings.mjs   Finding shape, sort, dedupe, text/JSON formatting
  lib/shared/config.mjs     .pulupulu.json loading, inline waivers, globs
  lib/shared/files.mjs      file collection, UI extensions
  lib/shared/color.mjs      color parsing (hex/rgb/hsl/oklch/named), WCAG contrast, hue/chroma helpers, Tailwind palette
  lib/static/index.mjs      scanText(text, {file, ext, config}) -> Finding[]; STATIC_RULES
  lib/static/extract.mjs    turns a file into a ScanContext (css decls, class lists, tags, text nodes)
  lib/static/rules/*.mjs    one module per rule family
  lib/browser/index.mjs     scanPages(targets, opts) -> {findings, screenshots, errors}; BROWSER_RULES; findBrowser()
  lib/browser/cdp.mjs       launch Chrome/Edge headless, minimal CDP client over WebSocket
  lib/browser/page-checks.js  function source evaluated inside the page; returns raw hits
test/
  static/*.test.mjs         node:test
  browser/*.test.mjs        node:test, skipped when no browser is found
  fixtures/                 slop.html, clean.html, Slop.jsx, slop.css, clean.css, ...
```

## Finding

See the header of `lib/shared/findings.mjs`. Severity follows the rule tier in `skills/pulupulu/rules/core.md`: **high** = Hard Gate, **medium** = Purpose Gate, **low** = Quality Lock. A detector heuristic that cannot be certain may report one level lower than its rule tier (for example `fake-stat` reports medium because only a human knows whether the number is real).

Static and browser rules that check the same thing share an id (`low-contrast`, `overused-font`); `source` tells them apart.

## Rule module shape

```js
export default [
  {
    id: 'gradient-text',
    name: 'Gradient text',
    category: 'slop',            // slop | quality | a11y | honesty | mobile
    severity: 'medium',
    ref: 'R-01',
    description: 'Text filled with a gradient via background-clip: text.',
    fix: 'Use a solid color. Carry emphasis with weight, size, or placement.',
    check(ctx) { return [{ line, message, snippet }] },   // partial findings; index.mjs fills the rest
  },
];
```

## ScanContext (built by extract.mjs)

```js
{
  file, ext, text, lines,
  kind: 'css' | 'markup' | 'script',      // markup = html/vue/svelte/astro/php/templates; script = jsx/tsx/js/ts
  hasMarkup: boolean,                     // false for a plain .ts utility file: most rules skip it
  css: [{ selector, decls: [{ prop, value, line }], line, atRule }],  // from .css/.scss, <style>, style="", JSX style={{}}
  classLists: [{ value, line, tag }],     // class="..", className="..", className={`..`}, clsx('..'), :class="'..'"
  tags: [{ name, attrs: {k: v}, line, close: bool, selfClosing: bool, depth }],
  texts: [{ text, line, parentTag }],     // visible text nodes (not script/style/comments/code), plus alt/title/placeholder/aria-label values
  fullDocument: boolean,                  // has <html>
}
```

## R-numbers

R-01 to R-38 keep antislop's numbering so findings stay familiar. Pulupulu adds:

| R | Rule | Tier |
|---|---|---|
| R-39 | Kicker, eyebrow, and section-number labels | Purpose Gate (kicker above a heading is treated as a ban) |
| R-40 | Decorative edge tells: side stripes, hairline border with wide shadow, hard offset shadow outside a neobrutalist world | Purpose Gate |
| R-41 | Container discipline: nested cards, icon tile stacked above a heading, cards as the default container | Quality Lock |
| R-42 | Type floor: size, leading, measure, tracking, justification, all-caps body | Quality Lock |
| R-43 | Motion grammar: ease-out, no bounce or elastic, no layout-property animation, reduced motion, content visible at rest, no decorative marquee, fake cursor, or pulsing dot | Purpose Gate |
| R-44 | Text on color and tinted neutrals: no gray text on colored surfaces, no pure black/white large surfaces without reason | Quality Lock |
| R-45 | Browser surfaces belong to the design: selection, caret, scrollbar, focus ring, underline offset, tabular numerals | Quality Lock |
| R-46 | Surface mode fit (Persuade, Operate, Read, Experience) | Quality Lock |
| R-47 | No broken output: broken images, script errors, content hidden at rest, overflow | Hard Gate |
| R-48 | Semantic structure and accessible names: alt text, named controls, heading order | Hard Gate |

## Static rules

| id | sev | ref | fires on |
|---|---|---|---|
| em-dash | high | R-02 | `—` in visible UI text (text nodes, alt/title/placeholder/aria-label, JSX string children). Never in comments or code. |
| generic-cta | low | R-15 | Button/link text exactly a generic CTA. EN: Get Started, Learn More, Try Now, Explore, Discover, Click Here, Read More, Sign Up Now. ID: Mulai Sekarang, Pelajari Lebih Lanjut, Selengkapnya, Klik di Sini, Coba Sekarang, Jelajahi, Daftar Sekarang. |
| buzzword | low | R-16 | Marketing buzzwords in visible text. EN: AI-powered, next-generation, revolutionary, seamless(ly), cutting-edge, game-changing, supercharge, empower, streamline, world-class, enterprise-grade, effortless(ly), unleash, elevate, best-in-class, state-of-the-art. ID: revolusioner, mutakhir, terdepan, tercanggih, inovatif, solusi terbaik, tanpa batas, kelas dunia. |
| fake-stat | medium | R-17 | Stat-shaped claims in visible text: `10K+`, `99.9%`, `500+ customers`, `4.9/5`, `#1`, `2x faster`, `1jt+ pengguna`. Only when the text node is mostly the number (stat blocks), not prose. |
| placeholder-people | high | R-18 | pravatar.cc, i.pravatar.cc, randomuser.me, thispersondoesnotexist, xsgames.co/randomusers, uifaces. |
| lorem-ipsum | high | R-38 | lorem ipsum, dolor sit amet in visible text. |
| dead-control | high | R-26 | `href="#"`, `href=""`, `href="javascript:..."` on an `<a>` with no click handler (`onClick`, `@click`, `v-on:click`, `x-on:click`, `on:click`, `wire:click`, `onclick`). |
| missing-anchor | high | R-24 | `href="#id"` with no `id="id"` / `name="id"` in the same file. Only for `fullDocument` files. |
| outline-removed | high | R-32 | `outline: none/0` or Tailwind `outline-none` / `focus:outline-none` with no focus replacement in the same rule or class list (`focus:ring`, `focus-visible:*`, `:focus-visible` rule in the file, box-shadow on focus). |
| zoom-disabled | high | R-03 | viewport meta with `user-scalable=no` or `maximum-scale=1`. |
| missing-viewport | high | R-03 | `fullDocument` without a viewport meta. |
| img-no-alt | high | R-48 | `<img>` with no `alt` attribute (empty `alt=""` is valid for decoration). JSX `alt={...}` counts. |
| skipped-heading | medium | R-48 | Heading levels skip downward (h1 then h3) within one file. Only for `fullDocument` files or files with an h1. |
| broken-image | high | R-47 | `<img>` with `src=""`, `src="#"`, missing src (no srcset, no JSX src). |
| placeholder-image | low | R-23 | via.placeholder.com, placehold.co, placehold.it, dummyimage.com, placekitten, picsum.photos in shipping markup. |
| overused-font | medium | R-06 | First family in `font-family` (CSS, Tailwind config, inline style), Google Fonts `<link>`/`@import` family, or `next/font/google` import is one of: Inter, Roboto, Geist, Space Grotesk, Plus Jakarta Sans, Fraunces, DM Sans, Outfit, Poppins, Manrope, Sora, Instrument Sans, Instrument Serif. Skipped for any family in `config.allow.fonts`. |
| mono-costume | low | R-06 | `font-mono` (or a monospace font-family) on h1/h2 or with text-4xl and larger, outside `<code>`/`<pre>`. |
| wide-tracking-label | low | R-06 | `uppercase` with `tracking-widest` / `tracking-[>=0.15em]` or `letter-spacing >= 0.15em` with uppercase. |
| kicker-label | medium | R-39 | A small uppercase or tracked label element (uppercase + text-xs/sm or tracking) whose next sibling tag is h1-h3. |
| eyebrow-pill | medium | R-09 | A `rounded-full` element with border or bg and text-xs/sm, immediately before an h1/h2. |
| ai-badge | medium | R-09 | Pill/badge text that is only "AI Powered", "AI-powered", "Beta", "New", "Baru", "✨ New". |
| section-numbers | low | R-39 | Three or more small labels with text `01`, `02`, `03` (or `/01`, `01.`) in one file. |
| side-stripe | medium | R-40 | `border-left`/`border-right` width >= 2px with a chromatic color; Tailwind `border-l-[2-8]`/`border-r-*` with a chromatic `border-{color}-{n}` on the same element. |
| hairline-wide-shadow | low | R-40 | 1px border plus a shadow with blur >= 24px in the same rule; Tailwind `border` + `shadow-xl`/`shadow-2xl` on the same element. |
| hard-offset-shadow | low | R-40 | box-shadow with offset and 0 blur (`4px 4px 0`), or Tailwind `shadow-[4px_4px_0...]`. |
| icon-tile-heading | low | R-41 | A small square tile (w/h/size 8-14, rounded, bg) containing an svg/icon, immediately followed by h3/h4. |
| nested-cards | low | R-41 | A card-like element (rounded + border or shadow + padding + bg) inside another card-like element. |
| ai-gradient | medium | R-01 | linear/radial/conic gradient whose stops include purple/violet/indigo/fuchsia hues (hue 250-320) or blue-to-cyan/pink combos; Tailwind `from-{purple,violet,indigo,fuchsia}` etc. |
| gradient-text | medium | R-01 | `background-clip: text` with a gradient, or Tailwind `bg-clip-text` + `text-transparent` + `bg-gradient-*`. |
| glow-orb | medium | R-01 | Decorative radial-gradient glows fading to transparent, and the Tailwind orb pattern: `rounded-full` + `blur-2xl/3xl` + chromatic `bg-*-*/{opacity}`. |
| dark-glow | medium | R-13 | Zero-offset colored shadow (`0 0 30px rgba(chromatic)`), `drop-shadow` glow, Tailwind `shadow-{chromatic}-{n}/{opacity}` or `shadow-[0_0_...]`. |
| glass-overuse | medium | R-10 | More than two `backdrop-filter`/`backdrop-blur-*` uses in one file. |
| grid-background | medium | R-07 | Line or dot grid backgrounds: two linear-gradients with 1px lines plus `background-size` in px, `radial-gradient` dot pattern with background-size, `bg-grid*` utilities. |
| repeating-stripes | low | R-07 | `repeating-linear-gradient` used as surface decoration. |
| bounce-easing | medium | R-43 | cubic-bezier with y outside [0, 1], `animate-bounce`, easing names containing bounce/elastic/back. |
| layout-animation | low | R-43 | transition or keyframes on width, height, top, left, margin, padding. |
| no-reduced-motion | low | R-43 | A CSS file or style block with `@keyframes` or infinite animations and no `prefers-reduced-motion` anywhere in the file. |
| marquee | medium | R-43 | `<marquee>`, keyframes named marquee/ticker/scroll with infinite translateX, `animate-marquee`. |
| pulsing-dot | low | R-43 | `animate-ping` or `animate-pulse` on a small `rounded-full` element (w/h/size <= 3). |
| fake-cursor | low | R-43 | keyframes named blink/caret/cursor toggling opacity or border, or a `|`/`▍`/`_` span with a blink animation. |
| image-hover-zoom | low | R-43 | `img:hover`/`.x:hover img` with `transform: scale/rotate`; Tailwind `hover:scale-*`/`group-hover:scale-*` on `<img>`. |
| tiny-text | medium | R-42 | font-size below 12px (`11px`, `0.65rem`, `text-[10px]`) outside sup/sub/small legal text. |
| tight-leading | low | R-42 | line-height below 1.3 on body, p, li, or `leading-none`/`leading-tight` on `<p>`. |
| justified-text | low | R-42 | `text-align: justify` / `text-justify` without `hyphens: auto` / `hyphens-auto`. |
| crushed-tracking | low | R-42 | letter-spacing below -0.04em (or below -2px), Tailwind `tracking-[-0.05em]` and tighter. |
| all-caps-body | low | R-42 | `uppercase` on `<p>` elements, `text-transform: uppercase` on p/body/li. |
| gray-on-color | medium | R-44 | Same element: chromatic background (Tailwind `bg-{color}-{500-950}` or CSS chromatic background-color) and gray text (`text-{gray,slate,zinc,neutral,stone}-{300-600}`, or a CSS gray). |
| low-contrast | high | R-25 | Same element or CSS rule: resolvable text color and background color with WCAG ratio below 4.5 (3 when the element is large: text-2xl+ or font-bold with text-xl+). Uses the Tailwind palette for utilities. |
| pure-black | low | R-44 | `#000`/`black`/`bg-black` as the page or section background or body text color. |
| generic-icons | low | R-04 | Two or more of Sparkles, Wand, Wand2, Zap, Rocket, Bot, Gem, Diamond, Stars, BrainCircuit, Cpu, Magic imported from an icon library in one file. |
| stock-illustration | medium | R-22 | undraw, storyset, humaaans, blush.design, open-peeps, drawkit in an image URL or filename. |
| arrow-everywhere | low | R-08 | Three or more buttons/links in one file whose label ends with `→`, `↗`, `->`, or an ArrowRight/ArrowUpRight icon. |
| emoji-icons | low | R-04 | Three or more emoji used as icons at the start of headings, list items, or card titles in one file. |
| cadence-copy | low | R-16 | Three or more "Not X. Y." / "No X. Just Y." / "X. No Y." aphorism lines, or "theater" framing ("security theater"). |

## Browser rules

The browser scanner opens each target at desktop (1440x900) and mobile (390x844, touch, DPR 2), waits for load plus 1500ms, then runs `page-checks.js`.

| id | sev | ref | check |
|---|---|---|---|
| low-contrast | high | R-25 | Computed text color vs the effective background (walk ancestors for the first opaque background; skip and report `unverifiable` count when a background image or gradient sits behind). 4.5:1, or 3:1 for >= 24px or >= 18.66px bold. |
| tap-target | high | R-03 | Mobile: a, button, input, select, textarea, [role=button], [tabindex] smaller than 44x44 CSS px, excluding links inline inside a paragraph of text. |
| horizontal-overflow | high | R-03 | Mobile: documentElement.scrollWidth > innerWidth + 1. Report the widest offending elements. |
| text-overflow | medium | R-47 | Elements whose scrollWidth exceeds clientWidth with overflow visible, or text extending past the viewport. |
| broken-image | high | R-47 | img complete with naturalWidth 0. |
| script-error | high | R-47 | Uncaught exceptions and console errors during load (Runtime.exceptionThrown, Log.entryAdded level error). |
| hidden-content | high | R-47 | More than 30% of text-bearing elements at opacity 0 or visibility hidden after the wait. |
| line-length | low | R-42 | Paragraphs wider than ~80 characters per line (width / average char width of the computed font). |
| tiny-text | medium | R-42 | Rendered body text below 12px; functional UI text below 11px. |
| skipped-heading | medium | R-48 | Heading level jumps on the rendered page; more than one h1. |
| img-no-alt | high | R-48 | Rendered img without alt. |
| unnamed-control | high | R-48 | button, a[href], input, select without an accessible name (text, aria-label, aria-labelledby, title, label). |
| focus-invisible | high | R-32 | Tab through up to 25 focusables; flag those whose outline, box-shadow, border, and background do not change on focus. |
| missing-anchor | high | R-24 | a[href^="#"] whose target id does not exist. |
| overused-font | medium | R-06 | First rendered family of body and h1 is in the overused list (respect config.allow.fonts). |
| gradient-text | medium | R-01 | Computed background-clip text with a gradient background-image. |
| glass-overuse | medium | R-10 | More than two visible elements with backdrop-filter. |
| nested-cards | low | R-41 | Visible card-like box (radius >= 8px and border or shadow, padding >= 12px) inside another card-like box. |
| gray-on-color | medium | R-44 | Low-chroma text on a high-chroma effective background. |
| body-edge | medium | R-03 | Mobile: paragraph text within 8px of the viewport edge. |
| flat-hierarchy | low | R-42 | h1 font-size less than 1.25x body font-size. |
