# adapt

Make a web interface work from a small phone to a wide desktop, for touch, mouse, and keyboard. Layout follows the content, not a device list. Web only; native iOS and Android are out of scope.

**Mode:** during (implied by the command). Read [../rules/mobile.md](../rules/mobile.md) first.

## When to use

- A surface built for one width breaks or feels cramped at another.
- The detector reports `horizontal-overflow`, `tap-target`, `body-edge`, or `text-overflow` (R-03, R-47).
- Touch or keyboard users cannot complete a task that works with a mouse.

## When not to use

- The design itself needs rethinking at every size: `build`.
- Native apps, print, or email templates.

## Steps

1. **Capture the current state.**
   ```bash
   node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots/adapt-before <url-or-file>
   ```
   Then look at the page at 360, 390, 768, 1024, 1280, and 1440 widths (browser device emulation or a resized window). At each width note overflow, clipped or colliding content, unreadable measure, unreachable controls, and wasted space.

2. **Find the content's breakpoints.** Start from the narrowest width and widen until the layout stops working (a line runs past about 75 characters, a row of cards gets cramped, a sidebar starves the main column). Put a breakpoint there. Name breakpoints by what they fix, not by device. Write mobile-first: base styles for the small screen, `min-width` queries to add.

3. **Use intrinsic layout first.**
   - Fluid grids: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`, flex with `flex-wrap`, `min-width: 0` on shrinking children.
   - Fluid type and space with `clamp()`, bounded so body text never drops below 16px on phones (R-42).
   - Measure: `max-width` around 65 to 75ch for reading text.
   - Container queries (`container-type: inline-size` and `@container`) for components that appear in columns of different widths, so a card adapts to its slot instead of the viewport.

4. **Restructure where reflow is not enough.**
   - Navigation: a real disclosure menu or a bottom bar for a few primary destinations on phones; it opens, closes, traps focus while open, and closes on Escape (R-26, R-32).
   - Tables: scroll inside their own container with a visible cue, or reflow rows into labeled stacks when users compare few columns.
   - Side panels and filters: become a sheet or a disclosure on narrow screens.
   - Priority: keep the primary task and its action in the first screen on mobile; move secondary content later, never delete what desktop users rely on without asking.
   - Wide screens: use the space for the content (a second column, a larger image, side-by-side comparison), not stretched lines.

5. **Adapt to the input method, not just the width.**
   - `@media (hover: hover) and (pointer: fine)` for hover-only affordances; every hover reveal needs a touch and keyboard path too.
   - `@media (pointer: coarse)`: tap targets at least 44 by 44 CSS px with spacing between neighbors (R-03).
   - Custom drags and sliders use pointer events with `touch-action` set, and clear state on `pointercancel` and `lostpointercapture`.
   - Inputs use the right `type`, `inputmode`, and `autocomplete` so phone keyboards fit the field.
   - Keyboard order follows the visual order at every width; reordering with CSS `order` or grid placement must not scramble Tab.

6. **Respect the device edges.** `viewport-fit=cover` with `env(safe-area-inset-*)` padding for fixed bars; `100dvh` instead of `100vh` for full-height areas; never disable zoom (R-03, `zoom-disabled`). Images use `srcset` and `sizes` so phones do not download desktop files.

7. **Verify.**
   - Re-run the browser detector into `adapt-after`; `horizontal-overflow`, `tap-target`, and `body-edge` must be clear on the mobile viewport.
   - Check 360, 390, 768, 1024, 1280, and 1440 again, plus 200 percent zoom at 1280, and landscape at 390.
   - Complete the primary task once with touch emulation and once with keyboard only.
   - Say what produced the evidence (emulated viewport, synthesized touch, a physical device) and what stayed untested.
   - Run the Delivery Gate items touched ([../rules/delivery-gate.md](../rules/delivery-gate.md)).

## Output

- The adapted layout and interactions.
- Before and after screenshots in `.pulupulu/shots/adapt-before` and `adapt-after`.
- A chat summary: breakpoints chosen and why, structural changes per width, input-method fixes, detector before and after, and untested conditions.

## Done when

- [ ] No horizontal page scroll and no clipped or colliding content at any tested width.
- [ ] Breakpoints sit where the content broke, written mobile-first.
- [ ] Components in variable columns use container queries or intrinsic layout.
- [ ] Tap targets meet 44px on coarse pointers; hover-only actions have touch and keyboard paths.
- [ ] Navigation works on phones with keyboard and Escape.
- [ ] Zoom is enabled and 200 percent zoom does not break the layout.
- [ ] The primary task completes with touch and with keyboard only.
