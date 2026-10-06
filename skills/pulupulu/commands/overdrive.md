# overdrive

Build one technically ambitious effect (WebGL, canvas, shaders, view transitions, scroll-driven animation, large-data rendering) when the direction calls for it, inside a performance budget, with fallbacks, and with content readable without JavaScript.

## When to use

- The Design Read says ENERGY 3 or MOTION 3 on a Persuade or Experience surface, and an ordinary layout cannot carry the concept.
- A functional surface needs to feel exceptional through technique: a dialog that morphs from its trigger, a table of 100k rows that scrolls smoothly, a chart that transitions between states.

## When not to use

- Fundamentals are weak (hierarchy, type, color, copy). Fix those with other commands first; technique does not hide them.
- Operate or Read surfaces where the effect would slow the task. A particle field on a settings page is a defect.
- MOTION is 1 and the user has not asked to change it.

## Steps

1. **Check the direction.** Quote the dial line and surface mode. If the brief does not call for ambition, say so and stop, or ask once whether the user wants to raise the dials.
2. **Propose before building.** Write two or three directions, each with: what the user sees and feels, the technique, browser support, performance cost, added weight, and the fallback. Ask the user to pick one. Write no code until they answer.
3. **Set the budget** for the chosen direction and write it down:
   - frame rate: 60fps on a mid-range phone; simplify if it drops below 50;
   - main thread: no long task over 50ms caused by the effect;
   - weight: the effect's script, shaders, and assets under a stated size (for example 80KB gzipped for a hero effect), loaded lazily;
   - layout: zero layout shift when the effect starts;
   - energy: rendering pauses when offscreen, when the tab is hidden, and after the focal moment ends.
4. **Pick the lightest technique that delivers it.** In order of preference: CSS (`@starting-style`, `@property`, `animation-timeline: scroll()` / `view()`), View Transitions API, Web Animations API, SVG filters, Canvas 2D, WebGL or WebGL2, WebGPU. Use OffscreenCanvas or a Worker for heavy work. Use virtual scrolling for large lists. Add a library only when the user approves the dependency.
5. **Content first, effect on top.** The page is complete and readable with JavaScript off: headings, copy, images, and controls exist in HTML, visible at rest (R-43, R-47). The effect mounts behind or around that content. Text is never only rendered into a canvas.
6. **Progressive enhancement.** Gate every advanced feature:

   ```css
   @supports (animation-timeline: view()) { .reveal { animation-timeline: view(); } }
   ```

   ```js
   const gl = canvas.getContext('webgl2');
   if (!gl || matchMedia('(prefers-reduced-motion: reduce)').matches) return showStaticFallback();
   ```

   The fallback is designed, not blank: a still frame of the effect, a poster image, or a static composition.
7. **Reduced motion and control.** Under `prefers-reduced-motion: reduce`, show the static fallback or a non-moving version. Any loop longer than five seconds gets a visible pause control. No flashing above three times per second. Sound only after an explicit user action.
8. **Lazy and disposable.** Initialize heavy contexts only near the viewport (IntersectionObserver). Release WebGL contexts, listeners, and animation frames on unmount and route change.
9. **One extraordinary moment.** Do not stack several ambitious effects on one screen. Everything around the moment stays calm so it reads.
10. **Iterate with the browser.** Effects rarely look right on the first run. View the result, adjust, view again, within the bounded verification rule: one full inspection, one batch of fixes, at most one confirming round.
11. **Verify.**
    - `node <skill-dir>/scripts/pulupulu.mjs detect <url>` with the dev server running: no `script-error`, `hidden-content`, or `horizontal-overflow`.
    - Disable JavaScript once: content is all there.
    - Turn on reduced motion: the fallback shows.
    - Throttle CPU 4x in DevTools Performance and record: frame rate and long tasks inside the budget.
    - Check on a phone-sized viewport.

## Output

- The directions offered and the one chosen, with the reason.
- The budget and the measured result against it.
- Technique, fallback, reduced-motion behavior, and any dependency the user approved.
- Files changed and how to turn the effect off if needed.

## Done when

- The effect serves the declared direction and removing it would clearly diminish the surface.
- Budget numbers are met on a throttled run.
- Content is complete without JavaScript and with reduced motion.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
