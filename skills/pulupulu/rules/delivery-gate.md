# Delivery Gate

Run before delivering any UI, copy, or comment work. Rules are in [core.md](core.md).

- Output the gate as a **PASS/FAIL report** with the deliverable: one line per item, every PASS backed by concrete evidence (a command and its result, a computed value, a recorded click, a file and line).
- **A FAIL never ships.** Fix it, re-run the affected items, then deliver. A report containing a FAIL is an unfinished deliverable, whatever else it says.
- The gate cannot be delegated or replaced. Another workflow's summary, a planning tool's wrap-up, or a passing test suite does not stand in for it.
- "N/A" is allowed only with a reason ("R-34 N/A: single theme by scene sentence, no toggle shipped").

---

## Bounded verification

Verification is a budget, not a loop.

1. **Build fully.** Finish the work before inspecting.
2. **One batched inspection round.** Desktop and mobile together (1440 and 390 at minimum, plus 360/768/1280 when layout changed, plus the user's viewport when known), every theme shipped, the detector, and the click-through, all in one pass.
3. **One fix batch.** Fix everything that round found, together.
4. **At most one confirm round.** Re-run the detector and re-check only what changed and what it could affect.
5. **Stop.** No open-ended self-QA. If items remain FAIL after the confirm round, report them and ask the user how to proceed; never ship them as PASS.

Captures are evidence only when valid: settle or disable entrance motion first, capture from the top of the page, open each file once to confirm it shows what its name claims.

---

## Block 0: Evidence

All must be true:

- [ ] **Detector ran on changed files:** `node <skill-dir>/scripts/pulupulu.mjs detect --json <changed files>`. Paste the summary line (counts by severity).
- [ ] **Browser checks ran** when a dev server or HTML file exists: `node <skill-dir>/scripts/pulupulu.mjs detect <url>` or `detect --browser <file.html>`. Without an installed Chrome or Edge, state that and fall back to static scan plus code inspection.
- [ ] **Every high finding is fixed**, or waived inline with a reason the user can read: `pulupulu-disable-next-line rule-id: <reason>`. Medium findings are fixed or answered with a Purpose Gate reason. Low findings are fixed or listed.
- [ ] **The app was built or run**, and the console checked for errors (R-35, R-47). If it cannot run, say so.
- [ ] **Click-through recorded** element by element, in every theme and at a phone width (R-35).
- [ ] **Contrast computed** for every new or changed color pair with `node <skill-dir>/scripts/pulupulu.mjs contrast <fg> <bg>`, not asserted (R-25).

A clean detector run is evidence, not proof. It does not replace looking at the rendered page.

---

## Block 1: Hard Gate (absolute)

Every answer must be **no**:

- [ ] Is there an em dash (U+2014) in any text you wrote, outside a user sample the owner approved under R-37? *(R-02)*
- [ ] Is there horizontal overflow, clipped or colliding content, a tap target under 44px, disabled zoom, or a missing viewport meta? *(R-03)*
- [ ] Is any statistic shown without a real source, or sample data not labeled as sample? *(R-17)*
- [ ] Is any testimonial, person, avatar, or company invented? *(R-18)*
- [ ] Was any logo, avatar, photo of people, number, or nav structure created without instruction and not marked as a placeholder? *(R-23)*
- [ ] Does any nav item or anchor point to something that does not exist? *(R-24)*
- [ ] Does any text, placeholder, control boundary, or focus indicator fail AA contrast in any state or theme? *(R-25)*
- [ ] Does any control do nothing, without a visible "Coming soon" label and a specific TODO? *(R-26)*
- [ ] Does any data view lack an empty, loading, or error state, or does a state say nothing useful? *(R-27)*
- [ ] Does the FAQ contain template questions? *(R-28)*
- [ ] Is any control unreachable or inoperable by keyboard, or is focus invisible anywhere? *(R-32)*
- [ ] Was any feature added by a patch script instead of in source? *(R-33)*
- [ ] Does any shipped theme break styles, layout, or contrast? *(R-34)*
- [ ] Was the work delivered without running it and recording the click-through? *(R-35)*
- [ ] Is any security, compliance, performance, customer, or press claim unbacked? *(R-36)*
- [ ] Was it built without direction and not labeled *draft without direction* with dials 1/1/1? *(R-37)*
- [ ] Is any realistic-looking content fabricated (features, links, team, filler data, lorem ipsum)? *(R-38)*
- [ ] Is there a broken image, a console error, overflowing text, or content hidden at rest? *(R-47)*
- [ ] Is any image missing alt, any control unnamed, any heading level skipped, or more than one h1? *(R-48)*

## Block 2: Purpose Gate (technique allowed, reason required)

FAIL when the technique appears as a default without a written one-line reason, or exceeds its cap. Every answer must be **no**:

- [ ] Default gradient, gradient text, or glow orbs without a hierarchy or brand reason? *(R-01)*
- [ ] Generic AI icons, emoji as icons, or icons irrelevant to their labels? *(R-04)*
- [ ] An overused face on a Persuade or Experience surface without a reason no other face could satisfy, or justified only by subject association? Mono costume, wide-tracked uppercase labels, or a system display face? *(R-06)*
- [ ] Grid, dot, blueprint, or stripe backgrounds without a world reason? *(R-07)*
- [ ] Arrows on most buttons? *(R-08)*
- [ ] Decorative capsule badges, or an eyebrow pill above the H1? *(R-09)*
- [ ] Glass on more than 1-2 elements? *(R-10)*
- [ ] Large shadows on every component? *(R-12)*
- [ ] Glow on more than 1-2 focal elements? *(R-13)*
- [ ] Identical feature cards with no hierarchy reason? *(R-14)*
- [ ] Any animation without a written job, or motion that contradicts the MOTION dial? *(R-19)*
- [ ] Stock illustrations or geometric masks for organic edges? *(R-22)*
- [ ] Any kicker or eyebrow label above a heading, or section numbers that carry no information? *(R-39)*
- [ ] Decorative side stripes, hairline plus wide shadow, or hard offset shadows outside a neobrutalist world? *(R-40)*
- [ ] Bounce or elastic easing, layout-property animation, no reduced-motion path, content hidden at rest, or decorative loops (marquee, fake cursor, pulsing dot, hover zoom)? *(R-43)*

## Block 3: Liveliness

Every answer must be **yes**:

- [ ] Was the Design Read declared before building, with mode and dials?
- [ ] Does the output match the declared dials (RHYTHM 3 means visibly varied sections; MOTION 1 means no entrance animation)?
- [ ] Are dials inside the mode's typical range, or is the exception reasoned? *(R-46)*
- [ ] Is there exactly one focal point per screen?
- [ ] Is whitespace structural: tight in groups, generous between, more above headings than below?
- [ ] Is there one deliberate accent, not zero and not everywhere?
- [ ] Is there a named identity motif?
- [ ] On a Persuade surface, does the first viewport state what this is, why it matters, and the action, in seconds?

## Block 4: Craftsmanship and Quality Locks

Every answer must be **no**:

- [ ] C-1: Is any decision justified only by "it is the default"?
- [ ] C-2: Does any interactive element do nothing?
- [ ] C-3: Does any section exist only to fill a template?
- [ ] C-4: Does the UI break in any state, theme, width, at 200% zoom, with long or translated content, or without a mouse?
- [ ] C-5: Is any claim unverifiable?
- [ ] Does the structure follow a template (template page, hero-metric, bento by default, fake terminal, three steps, three tiers, logo bar, default dashboard shell), or contradict the RHYTHM dial? *(R-05)*
- [ ] Is every element pill-shaped, with no radius scale? *(R-11)*
- [ ] Is any CTA generic, in English or Indonesian? *(R-15)*
- [ ] Are there buzzwords (English or Indonesian) or aphoristic cadence? *(R-16)*
- [ ] Does it fail the swap-the-logo or category-guess test, or land in a reflex world the brief did not ask for? *(R-20)*
- [ ] Was light or dark chosen by category instead of a written scene sentence, or was requested theme work deferred? *(R-21)*
- [ ] Is there no written color strategy, or does the palette exceed its strategy's cap? *(R-29)*
- [ ] Does it read as a clone of a known product without being asked? *(R-30)*
- [ ] Is any major decision missing its one-line reason in the Decisions list? *(R-31)*
- [ ] Are there nested cards, icon tiles over headings, cards as the default container, or a modal reflex? *(R-41)*
- [ ] Does any type fall below the floor (size, leading, measure, tracking, justification, all-caps body, flat hierarchy)? *(R-42)*
- [ ] Is there gray text on color, or pure black or white large surfaces without reason? *(R-44)*
- [ ] Are selection, caret, focus ring, underlines, scrollbars, or table numerals left at browser defaults? *(R-45)*
- [ ] Does the surface break its mode (display faces in product UI, a hidden offer on a landing page, world inside a reading column)? *(R-46)*

---

## Report format

```
pulupulu delivery gate: <PASS | FAIL>

Design Read: <the declared line>

Evidence
- detect: `node <skill-dir>/scripts/pulupulu.mjs detect --json src/` -> 0 high, 1 medium (overused-font, waived: workhorse face per DESIGN.md), 2 low (fixed)
- browser: http://localhost:5173 at 1440 and 390 -> clean; unverifiable contrast: 1 (hero photo, checked by hand: 5.1:1 with scrim)
- run: `npm run dev`, console clean
- click-through: "Buat tagihan" -> /invoices/new; empty submit -> 3 field errors; theme toggle -> dark, contrast re-checked; mobile menu -> opens, Escape closes, focus returns

Hard Gate: PASS (19/19). R-25: body 12.4:1, muted 5.2:1, button 4.8:1 (computed)
Purpose Gate: PASS. R-06: Bricolage Grotesque, market-signage character; R-43: one entrance on hero, reduced-motion path in base.css
Liveliness: PASS. Focal: invoice preview; accent: marigold on primary action and overdue badge; motif: stamped receipt edges
Quality Locks: PASS. R-21 scene: shop owners at a sunny counter -> light default; R-29: Committed, marigold 40% of hero

Decisions
- Color: Committed marigold; matches the stall awnings in PRODUCT.md's audience scene
- Layout: ...

Open items: none
```

- Every PASS line names its evidence. "PASS" alone is not a PASS.
- FAIL lines name the rule, the location, and the fix in progress. A report whose header is FAIL is not a delivery.

---

## In After mode

After mode (`audit`, `critique`, `detect`) produces a findings report instead of building:

- Numbered findings, each with the rule (R-XX), location, one-line reason, and priority by tier: Hard Gate = HIGH, Purpose Gate = MEDIUM, Quality Lock = LOW. Detector findings and visual judgments are kept separate; false positives are named as such.
- Change nothing until the user picks numbers. Numbers not picked are not touched.
- The fixes for the picked numbers then go through this gate in full: Block 0 evidence, the blocks that apply to what changed, and the report. An audit report never replaces the gate for the fixes.
