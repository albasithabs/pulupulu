# colorize

Give a gray or timid interface a deliberate color strategy: roles before hues, one strategy chosen up front, contrast verified by number.

## When to use

- The UI is all neutral and hierarchy, state, or brand get lost.
- Color is present but random: many hues, no roles, accents sprinkled everywhere.
- A dark or light theme needs to be composed rather than inverted.

## When not to use

- The user wants a new brand identity. Use `build` or ask for direction first.
- The design is too colorful already. Use `quieter`.

## Steps

1. **Read what is pinned.** From `DESIGN.md`, tokens, logo, and assets, list confirmed brand colors and semantic conventions (success, error). These stay. Ask once only if a binding brand decision cannot be inferred.
2. **Choose the strategy first**, by surface mode and ENERGY dial, and state it in one line:
   - **Restrained**: tinted neutrals carry the page; one accent marks action and key state. Default for Operate and Read, ENERGY 1.
   - **Committed**: the brand color owns one or two large regions (hero field, a full-bleed band, the nav, the primary panel) plus the action role. ENERGY 2.
   - **Full palette**: several hues with distinct roles (categories, data, sections), each assigned on purpose. Data-heavy or editorial surfaces.
   - **Drenched**: one color owns most of the canvas, text and surfaces are derived from it. ENERGY 3, Persuade or Experience.
3. **Pick hue from meaning.** Derive the hue from the product, its material, its audience, and its place, not from "tech". Purple-to-blue, blue-to-cyan, and purple-to-pink as the default treatment are banned without a written reason (R-01). Neon on black is not a strategy.
4. **Build roles, not swatches.** Define tokens by job: `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border`, `--accent`, `--accent-text` (text on accent), `--focus`, `--success`, `--warning`, `--danger`, `--info`, plus data scales if needed. Use the project's color space; for a new palette prefer OKLCH and reduce chroma near white and black.
5. **Tint the neutrals.** Shift grays slightly toward the brand hue (OKLCH chroma around 0.005-0.02) so neutrals belong to the palette. Avoid pure `#000` and `#fff` as large surfaces without reason (R-44).
6. **Text on color is tinted, never gray.** On a colored surface, derive body and muted text from the surface hue (a much darker or lighter step of it, or the foreground at reduced alpha on a solid fill), never `gray-400` on blue (R-44).
7. **Apply at page scale.** Let the strongest color own a region, not twenty small elements. Keep the accent rare enough that the primary action is the easiest thing to find. Do not spend the action color on decoration.
8. **Decide dark or light from the use scene.** Where and when is this used (a bright shop floor, a late-night reading app, a dashboard on an office monitor)? Choose the default theme from that, not from "dark looks premium" (R-21). Each theme you ship is composed on its own: elevation in dark mode comes from lighter surfaces, not shadows; accents usually lose a little chroma.
9. **Never color-only.** Status, categories, and errors also carry text, icon, shape, or position.
10. **Check contrast by number.** For each new pair, run:

    ```bash
    node <skill-dir>/scripts/pulupulu.mjs contrast "<fg>" "<bg>"
    ```

    Body text 4.5:1, large text (24px, or 18.66px bold) 3:1, controls, icons, and focus indicators 3:1 against adjacent colors. Check hover, disabled, selected, error, and both themes. Prefer solid colors over stacked translucent overlays whose contrast depends on what is behind.
11. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>` and clear `ai-gradient`, `gradient-text`, `glow-orb`, `dark-glow`, `gray-on-color`, `low-contrast`, `pure-black`. If a dev server is running, run `detect <url>` for computed contrast. View both themes on desktop and mobile once.

## Output

- Strategy line, for example `Committed: clay red owns the hero field and primary action; neutrals tinted warm`.
- The token table: role, light value, dark value.
- Contrast results for every new pair.
- What was replaced (random hues, gray-on-color, default gradients).

## Done when

- Every color has a role, and the strategy can be named in one line.
- Attention lands on the primary action and key states.
- All pairs pass contrast in every shipped theme and state; detector color findings are cleared or waived with a reason.
- The result reads as this product, not a generic colorful treatment.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
