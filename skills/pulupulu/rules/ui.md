# UI: color, type, layout, decoration, motion

Load with [core.md](core.md) for any interface work. Core holds the rules; this file holds the depth. Entries use **Tell** (the pattern), **Why** (why it reads as slop), **Fix** (what to do), citing the governing rule.

The mechanical checks below are also run by the detector. When findings arrive from the hook, fix them at the edit site instead of re-auditing.

---

## Before choosing anything

1. **Decide what is already true.** Read `DESIGN.md`, tokens, components, and representative screens. An established world in code is inherited even without `DESIGN.md`. A section or component inside an established surface inherits that surface; never turn a local addition into a new identity exercise.
2. **Name the mode** (R-46, [modes.md](modes.md)). It decides how far identity may reach.
3. **Write the scene sentence** (R-21): who uses this, where, under what light. It picks light or dark.
4. **Pick a color strategy** (R-29) before picking colors.
5. **Choose faces like objects from the product's world**, in the mode's register (R-06).
6. **Declare the Design Read** with dials (core Part 3).

---

## Color

### Strategy first

| Strategy | What it looks like | Typical mode |
|---|---|---|
| Restrained | Neutrals tinted from the world, one accent; color does jobs (state, selection, data) | Operate, Read |
| Committed | One saturated color carries 30-60% of the surface | Persuade, Experience; a single Operate screen can earn it |
| Full palette | 3-4 named roles, each with a job | Persuade, Experience, data-heavy Operate |
| Drenched | The surface is the color | Persuade, Experience |

- Color commits at page scale: a field that owns a region, a colored rail or header, a tinted ground. Small accents scattered over a neutral page are the category default with a sticker on it.
- Build roles: canvas, raised surface, text primary and secondary, action, focus, selection, border, success, warning, error, info, data series. Theme changes remap roles; they do not invert values.
- New web palettes in OKLCH: vary lightness, reduce chroma near white and black.
- Pick hue from the product's meaning and world, never from a category association (finance is not automatically navy).

### The rendition prior

Warm, bookish, family, food, and child-facing subjects come out of a model as cream ground, serif display with italic accents, and a terracotta accent, even when nobody asked. Treat that first palette as already spent. Before writing code, reread your own palette line: if it says cream, paper, parchment, ivory, beige, or lamplight for a Persuade surface the brief did not pin, rework it from the subject's saturated materials first (book cloth, thread, jackets, endpapers, market awnings, enamel, batik dyes). The same check applies to near-black plus neon for anything "AI" or "tech". A brief that pins a world pins the world, not its softest rendition.

### Default gradient family

- **Tell:** blue to purple, blue to cyan, purple to pink as the primary treatment; full-page glow; blurred orbs behind the hero.
- **Why:** the most over-represented color treatment in training data. It reads as "no brand", not "our palette".
- **Fix:** palette from `DESIGN.md` or the product's world. Keep a gradient only where it separates hierarchy levels or is brand, reason written (R-01).

### Gradient text

- **Tell:** a headline filled with a gradient via `background-clip: text`.
- **Why:** emphasis by effect instead of by type; contrast varies along the word.
- **Fix:** solid color. Carry emphasis with weight, size, or placement (R-01).

### Gray on color

- **Tell:** `text-gray-500` on a colored band or button.
- **Why:** neutral gray on a hue looks dirty and usually fails contrast.
- **Fix:** derive secondary text from the surface hue or the foreground as an explicit color, then compute contrast (R-44, R-25).

### Accent everywhere

- **Tell:** the accent on buttons, icons, links, borders, badges, and glows at once.
- **Why:** an accent everywhere is just another color; nothing is focal.
- **Fix:** spend it on the primary action, current selection, and the one key moment (R-29, core Part 3).

### Scattered palette

- **Tell:** five to seven unrelated colors with no roles.
- **Fix:** pick a strategy, map colors to roles, cut the rest (R-29).

### Sterile default

- **Tell:** near-white ground, thin gray borders, small radius, default sans, no texture, no motif.
- **Why:** the safe result of filtering without direction. Not slop, not design.
- **Fix:** a direction problem. Resolve the Design Read, raise the dials, commit a strategy (R-20, R-37).

### Dark by category

- **Tell:** dark because the product is "tech" or "premium".
- **Fix:** the scene sentence picks the theme. Dark mode gets its own elevation and contrast design, never a mechanical inversion (R-21, R-34).

### Pure black and white

- **Tell:** `#000` page background or body text; pure white slabs in a world with a hue.
- **Fix:** near-black and near-white tinted slightly toward the palette, unless the world requires pure values (R-44).

---

## Typography

### Calibrating the face

- Overused faces are listed in R-06. On Persuade and Experience surfaces, picking one needs a reason no other face could satisfy, and a subject association is never that reason.
- Operate and Read surfaces are well served by system stacks and workhorse UI faces. One well-tuned family often carries headings, labels, body, and data.
- Search outside the default roster: foundry and open-source faces with a character that fits the world. Self-host what you choose; load only the weights you use, with metric-compatible fallbacks and `font-display` that never hides text.
- A second family needs a job only it can do.

### Numbers to verify (R-42)

| Check | Target |
|---|---|
| Body size | 16px or more on web; secondary text 14px minimum; nothing below 12px |
| Body leading | 1.4-1.7; tune up for wider measures and light-on-dark |
| Measure | 65-75 characters for prose; never past ~80 |
| Display size | Up to ~6rem; responsive on Persuade (`clamp()`), fixed rem scale in product UI |
| Tracking | Never tighter than -0.04em on display; none added to lowercase body |
| Scale steps | About 1.2+ between roles on brand surfaces; 1.125-1.2 in product UI |
| H1 vs body | At least 1.25x |
| Heading spacing | More space above a heading than below it |
| Wrapping | `text-wrap: balance` on headings, `pretty` on paragraphs |

Run the real copy, including the longest translation, at every breakpoint.

### Default face

- **Tell:** Inter or Space Grotesk on a landing page because it came first.
- **Fix:** choose from the world, write the reason, or record a workhorse choice in `DESIGN.md` and `allow.fonts` (R-06).

### Mono costume

- **Tell:** monospace headings or body for a "technical" feel.
- **Fix:** mono for code, data, and measurement only (R-06).

### Kicker above the heading

- **Tell:** `FEATURES` or `OUR PROCESS` in small tracked caps above every H2.
- **Why:** it duplicates the heading and lands in the same spot on every generated page.
- **Fix:** delete it. Fold any real fact into the heading (R-39).

### System display face

- **Tell:** Impact, Arial Black, or the platform sans as the display voice of a page with its own world.
- **Fix:** source and self-host a face whose character matches (R-06).

### Flat hierarchy

- **Tell:** H1 at 28px over 16px body; labels and body the same weight.
- **Fix:** obvious steps in size and weight; squint test still finds the primary element (R-42).

---

## Layout and components

Diagnose structure before moving boxes: the primary path, what belongs together, what leads, the density, and how it changes across widths. Group by proximity before adding containers. Use a spacing scale (a 4px base gives the useful middle steps) and `gap` for sibling rhythm.

### Template page

- **Tell:** hero, subtitle, two CTAs, screenshot, feature grid, testimonials, FAQ, CTA, four-column footer, in that order.
- **Why:** the order is the training default, not the product's story.
- **Fix:** sections come from content (C-3, R-05). No real testimonials, no testimonials section. The footer holds the links that exist; one column can beat four half-empty ones.

### Hero-metric template

- **Tell:** a big number, a small label, three supporting stats, an accent.
- **Fix:** if the numbers are real, put the one that matters in a sentence with its source. If not, show the product working instead (R-05, R-17).

### Identical feature cards and icon tiles

- **Tell:** six equal cards, each a rounded icon square above a heading above two lines.
- **Fix:** weight follows importance. The flagship gets space and a real visual; the rest become a list or a table (R-14, R-41).

### Nested cards and boxes by default

- **Tell:** a bordered panel holding bordered cards holding bordered rows.
- **Fix:** one container level. Inside it, group with space, dividers, and subheadings (R-41).

### Bento and fake terminal

- **Tell:** a mixed-size mosaic as the default section; a traffic-light terminal typing commands as the hero.
- **Fix:** bento only when items genuinely differ in size; a real screenshot instead of a costume (R-05).

### Uniform rhythm and spacing

- **Tell:** every section centered title + subtitle + grid, same padding, background alternating.
- **Fix:** vary composition and density per the RHYTHM dial; tight within groups, generous between (R-05, core Part 3).

### Pricing and process shapes

- **Tell:** three tiers with "Most popular" in the middle; "How it works" in three round steps.
- **Fix:** as many tiers and steps as are real; highlight the tier that serves the product, or none, and write why (R-05, R-31).

### Demo without a product

- **Tell:** a product sold but never shown working; no Terms or Privacy on a signup page.
- **Fix:** show it working or say it is not live; legal pages exist before collecting data (R-38).

### Modal reflex

- **Tell:** editing a field opens a modal.
- **Fix:** inline edit, a side panel, or progressive disclosure; modals for interruption or protected focus only (R-41). Overlays escape clipping ancestors via `<dialog>`, the popover API, or a portal.

### App and dashboard

| Tell | Fix |
|---|---|
| Default shell: sidebar, top bar, four stat cards, chart, table | Name the screen's job and the one decision made on it; build around that (R-05, R-46) |
| Stat cards with invented values and "+12%" deltas | Real numbers or labeled sample data; a delta only with a named real period (R-17, R-38) |
| Activity feed of invented people | Real events or an empty state that says what to do first (R-18, R-27) |
| Chart titled "Overview" | Title is the question it answers: "Failed jobs per hour, last 24h"; a sentence if a sentence answers better |
| Name / Status / Date / Actions columns for any data | Columns from the user's decision; the deciding field early; row menus hold only real actions (R-26) |
| John Doe and `johndoe@example.com` in fields | Empty, or honest placeholders (R-38) |
| "No data available" | Why it is empty and the one action that fills it (R-27) |

Every interactive component ships default, hover, focus, active, disabled, loading, and error. Same action, same look, everywhere.

---

## Decoration and surface

| Tell | Why | Fix |
|---|---|---|
| Glass on nav, cards, modals, sidebar | Every surface in one frosted layer; nothing is foreground | 1-2 elements with a job (R-10) |
| Pill radius on everything | Erases the difference between input, card, and button | A 2-3 step radius scale applied by role (R-11) |
| Large soft shadow on every box | When everything floats, elevation says nothing | Shadow for real elevation only; offset plus soft blur (R-12) |
| Zero-offset colored halos | Attention amplifier aimed at everything | Glow on 1-2 focal elements, or none (R-13) |
| Graph-paper, dot, or blueprint backgrounds | Texture without intent | A motif from the world, or nothing (R-07) |
| Sparkle, rocket, robot icons; emoji bullets | Generic "AI product" vocabulary | Relevant icons from one drawn system, or a label alone (R-04) |
| Arrow on every button | A pattern, not a signal | Arrows only where direction means something (R-08) |
| "AI Powered" / "New" capsules; pill above the H1 | Self-referential noise; duplicates the headline | Badges for real states only; fold facts into the heading (R-09, R-39) |
| Colored left stripe on cards and alerts | Color without meaning | Stripe only for a real current state, never the only cue (R-40) |
| 1px border plus wide blurred shadow | Two edge systems on one box | Pick one (R-40) |
| `4px 4px 0` block shadows | Neobrutalist costume | Only in a world that chose it (R-40) |
| Decorative pulsing dot | Live-indicator language for nothing | A dot marks a real state, no glow, no endless pulse (R-43) |
| Undraw-style people, 3D blobs | Decorated, not designed | Real screenshots or photos of the subject, or nothing (R-22) |
| Circle or polygon clip around a photographed subject | Cheap approximation of a cutout | A real alpha cutout, or omit (R-22) |
| Sparklines and rings standing in for content | Chrome filling a gap | Real content or an honest placeholder (R-38) |

---

## Motion

Write a short motion thesis before animating: the one focal moment (if any), the continuity changes that need explaining, the feedback each control owes, and the budget for expensive effects. A generic fade-and-rise is not a thesis.

- Choose material by meaning: continuity (FLIP, view transitions, shared elements), focus and depth (bounded blur, shadow, backdrop), reveal (clip-path, masks), state (the smallest change that makes cause and effect clear).
- Easing, durations, reduced motion, loops, and visible-at-rest are fixed by R-43.
- One authored moment beats scattered effects. Not every section enters; the hero speaks, the rest stays still.
- Operate surfaces: motion conveys state, 150-250ms, no page-load choreography.
- Stop nonessential loops offscreen; apply `will-change` only during a known animation.

---

## Browser surfaces (R-45)

```css
:root {
  accent-color: var(--color-action);
  caret-color: var(--color-action);
}
::selection { background: var(--color-selection-bg); color: var(--color-selection-fg); }
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
a { text-underline-offset: 0.2em; text-decoration-thickness: 0.08em; }
.scroll-region { scrollbar-color: var(--color-border-strong) transparent; scrollbar-width: thin; }
table, .price, .timer, .stat { font-variant-numeric: tabular-nums; }
```

Values come from the palette tokens; check selection and focus contrast in both themes. Never hide a scrollbar on a region that scrolls.

---

## Verify on the render

Run these on the built result, in the one batched inspection round (desktop and mobile together).

- **Contrast:** body and placeholder text 4.5:1, large text 3:1, controls and focus 3:1, every state and theme. Secondary text on color is tinted, never gray.
- **Depth:** shadows have offset and soft blur; no zero-offset colored halos without a reason.
- **Spacing:** tight groups, generous separation, more space above headings than below. Read the computed values.
- **Type:** the R-42 numbers above, with real copy at every breakpoint.
- **Motion:** one authored moment, ease-out from an already-visible default, reduced-motion path present.
- **States:** hover, focus, active, disabled, loading, error, empty; working controls; keyboard focus visible.
- **Browser surfaces:** selection, caret, focus ring, underlines, scrollbars, tabular numerals themed.
- **Coverage:** every brief requirement present and findable within seconds.

## Refuse when the axis is free

These are category defaults. The brief's own words can earn any of them except the kicker; reaching for one unprompted means you were not deciding, and the fix is rewriting the element, not softening it.

- Same-size icon + heading + text cards as page structure; nested cards (never).
- The hero-metric template.
- A kicker or eyebrow above a heading (never).
- Section numbers that carry no information.
- A modal for a task that needs no interruption.
- Gradient text; glass as decoration; colored side stripes on cards and alerts.
- Hard offset shadows outside a neobrutalist world.
- Sparklines, rings, and rounded rectangles standing in for content.
- Monospace as a costume; a system display face as an own-world display voice.
- Emoji or Unicode glyphs as an icon system.
- Geometric masks for organic contours.
- Light or dark picked by category.

---

## UI checklist

All must be **yes**:

- [ ] Mode, scene sentence, color strategy, and dials declared before building (R-46, R-21, R-29, core Part 3)
- [ ] Palette from `DESIGN.md` or the product's world; not a reflex world, not the rendition prior (R-01, R-20)
- [ ] One accent, spent at key moments; secondary text on color is tinted (R-29, R-44)
- [ ] Faces chosen with a written reason; overused faces justified or allowed in config (R-06)
- [ ] R-42 type numbers verified on the render with real copy
- [ ] No kicker labels; section numbers only where order is information (R-39)
- [ ] Section composition matches the RHYTHM dial; no template page or default dashboard shell (R-05)
- [ ] No nested cards; cards only for discrete objects; no modal reflex (R-41)
- [ ] Glass, glow, shadow, radius within dose caps; no side stripes or edge tells without a state (R-10 to R-13, R-40)
- [ ] Icons relevant, one system, no emoji icons (R-04)
- [ ] Motion has a written job and follows R-43: ease-out, no bounce, no layout animation, reduced-motion path, visible at rest
- [ ] Selection, caret, focus, underlines, scrollbars, and numerals themed (R-45)
- [ ] Every number, feed entry, and table row real or labeled (R-17, R-38)
- [ ] Every state designed and saying something (R-27)
