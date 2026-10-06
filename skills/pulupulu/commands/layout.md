# layout

Fix structure: spacing system, grouping, rhythm, grid, and alignment, so reading order follows product priority instead of a template.

## When to use

- Everything has the same spacing, so nothing groups and nothing separates.
- Sections all share one composition (centered title, subtitle, card grid) regardless of content (R-05).
- Alignment drifts, the grid is improvised, or cards are nested in cards (R-41).

## When not to use

- The fix is removing content. Run `distill` first, then `layout`.
- Phone-specific reflow, tap targets, and input methods are the main issue. Use `adapt` and [mobile.md](../rules/mobile.md).

## Steps

1. **Squint test.** Look at representative screens blurred (or describe the box structure). Write the order in which the eye lands: first, second, the major groups. Compare with the product priority from `PRODUCT.md`. Every mismatch is a finding.
2. **Read the RHYTHM dial** ([core.md](../rules/core.md#part-3-liveliness)). RHYTHM 1: a uniform, predictable grid, chosen on purpose. RHYTHM 2: a consistent system with a few deliberate breaks. RHYTHM 3: sections visibly vary in composition, density, and alignment. State it.
3. **Set a spacing scale.** Use the existing one if present; otherwise a 4px base with named steps, for example `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Every margin, padding, and gap uses a step. Remove one-off values.
4. **Group by proximity.** Inside a group (label and input, heading and its paragraph, items in a list) use tight steps (4-16). Between groups use generous steps (32-64). Between sections use the largest steps (64-128 on desktop, roughly 60% of that on mobile). The gap between groups should be at least twice the gap within them, or they read as one block.
5. **Attach headings to their content.** Space above a heading is clearly larger than space below it (often 2:1 or more), so the heading belongs to what follows.
6. **Grid and alignment.** Choose one grid per surface (for example 12 columns with a fixed gutter, or a content column plus a wide column for media). Align text edges to shared lines; pick left alignment for reading content and use centering only for short, isolated statements. Fix optical misalignment (icons, quotes, large display type) after viewing the render.
7. **Break the template rhythm.** If every section is centered title plus subtitle plus identical grid, recompose by content: a split with media, a full-bleed band, a single wide statement, a dense list, a table. Section order follows the product's narrative, not the hero, features, testimonials, FAQ, CTA default (R-05, C-3). The number of variations matches the RHYTHM dial; variation without a content reason is noise.
8. **Fewer containers.** Use spacing, alignment, and dividers before boxes. A card is for an object the user can act on or compare, not a wrapper for every paragraph. Never put a card inside a card; flatten the inner one to spacing or a divider (R-41). No icon tile stacked above every heading.
9. **Density by mode.** Operate surfaces (dashboards, tools) are denser and predictable; Read surfaces get a single comfortable column at 65-75ch; Persuade and Experience may go asymmetric when the direction earns it ([modes.md](../rules/modes.md)).
10. **Responsive structure.** Decide what reorders, collapses, or wraps at each width. Use `gap` for sibling rhythm, container queries for components that appear in different widths, and keep DOM order equal to visual order so keyboard and screen reader order match.
11. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>` and clear `nested-cards`, `icon-tile-heading`. If a dev server runs, `detect <url>` for `horizontal-overflow`, `text-overflow`, `body-edge`. Test long content, empty states, and 200% zoom once.

## Output

- Dial line and the spacing scale.
- The squint order before and after.
- Section-by-section composition list showing where rhythm changes and why.
- Containers removed or flattened.
- Detector result.

## Done when

- The squint test shows the primary element, then secondary, then groups, in product priority order.
- Every value sits on the spacing scale; groups are tight, separations generous, headings attached.
- Section rhythm matches the RHYTHM dial and no card sits inside a card.
- Desktop and mobile hold without overflow.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
