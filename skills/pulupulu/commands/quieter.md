# quieter

Lower a loud, busy, or overstimulating design one step down the ENERGY dial (and MOTION when motion is the noise) without losing its identity. Quiet is precise, not blank.

## When to use

- Too many accents, saturated colors, heavy weights, or effects compete for attention.
- Motion runs everywhere, loops forever, or delays the task.
- An Operate or Read surface feels like a landing page.

## When not to use

- The design is cluttered with too many elements or sections. Use `distill` (fewer things) rather than `quieter` (softer things); they combine well, `distill` first.
- The user wants a new, calmer identity. That is a redesign; use `build`.

## Steps

1. **Fix the scope and the keep list.** Name the target. Write down what stays: the brand hue, the display face, the identity motif, the one focal element, content, and behavior. Quieter never removes the thing that makes the product recognizable.
2. **Read the dials** ([core.md](../rules/core.md#part-3-liveliness)). Move ENERGY down one step. If motion is a noise source, move MOTION down one step too. State the new dial line before editing.
3. **Inventory the noise sources**, with a file and selector for each:
   - accent colors in use and how many places each appears;
   - saturated fills on large areas that carry no role;
   - weights 700+ used outside headings and the primary action;
   - decorative layers: gradients, glows, glass, patterns, multiple shadows, borders on every box (R-01, R-07, R-10, R-12, R-13, R-40);
   - animations, and which ones loop or run without a trigger (R-43);
   - scale: are there too many large elements competing?
4. **Keep one accent.** Choose the single accent that marks the primary action or the key state. Every other accent becomes a neutral or a tint of the brand hue. Zero accents is sterile; one is the target.
5. **Consolidate color.** Map remaining colors to roles (surface, text, muted text, border, action, status). Reduce saturation of large fields (roughly 70-85% of the original chroma) rather than turning them gray. Use neutrals tinted toward the brand hue. Never put gray text on a colored surface; derive muted text from the surface hue instead (R-44). Re-check contrast with `node <skill-dir>/scripts/pulupulu.mjs contrast <fg> <bg>`.
6. **Reduce weight, keep hierarchy.** Step weights down (900 to 600, 700 to 500) outside the focal heading. Keep a clear size ratio between levels (at least 1.25x between adjacent roles). Quiet is not flat: one anchor per screen stays strong.
7. **Remove decoration that has no job.** Delete gradients, glows, patterns, extra shadows, and borders that do not separate or signal state. Use spacing instead of borders to group. Flatten nested containers (R-41).
8. **Reduce motion.** Remove loops with no trigger, scroll reveals on every section, hover lifts on static cards. Keep feedback, state change, and continuity motion, made shorter (10-20px travel, 150-250ms). Ease-out only, no bounce. Keep a `prefers-reduced-motion` path. See [animate.md](animate.md).
9. **Even out the outliers.** Bring rogue spacing and alignment back onto the scale. Give text more air (leading, margins) where density was the noise.
10. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>`. View desktop and mobile once. Ask: can a first-time viewer still name the product from a screenshot? Is the primary action still the easiest thing to find?

## Never

- Make everything the same size and weight.
- Turn the palette grayscale. Quiet is not colorless.
- Remove affordances: buttons still look like buttons, links still look like links, focus stays visible.
- Strip the identity motif to reach "clean". Clean without identity is the sterile default.

## Output

- New dial line, for example `ENERGY 3 -> 2 / RHYTHM 3 / MOTION 3 -> 2`.
- The kept accent and its role.
- Removed or softened items, grouped by color, weight, decoration, motion.
- What was deliberately kept for identity.
- Detector and contrast results.

## Done when

- One accent, one focal element per screen, and a clear hierarchy remain.
- Large surfaces are calmer but still in the brand's hue family.
- No motion runs without a trigger or purpose.
- The product is still recognizable and nothing outside scope changed.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
