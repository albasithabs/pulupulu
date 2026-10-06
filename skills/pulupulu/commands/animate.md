# animate

Add one authored motion system where every motion has a job: feedback, state, continuity, attention, or one earned focal moment. The amount follows the MOTION dial.

## When to use

- Interactions feel dead: no feedback on press, state changes snap, overlays appear from nowhere.
- A surface set to MOTION 2 or 3 does not move as declared.
- Existing motion is scattered, generic, or bouncy and needs one coherent grammar.

## When not to use

- MOTION is 1 and nothing is broken: add hover and focus states only, nothing else.
- The request is a technically ambitious effect (WebGL, shaders, scroll-scrubbed scenes). Use `overdrive`.

## Steps

1. **Read the dial** ([core.md](../rules/core.md#part-3-liveliness)). MOTION 1: hover, focus, and press states only. MOTION 2: plus state transitions, overlays, and restrained entrances. MOTION 3: plus one choreographed focal sequence (pin, scrub, shared element). State it before editing.
2. **Inventory existing motion.** List every transition, keyframe, and animation library call. Flag: bounce or elastic easing, layout-property animation, loops without a trigger, marquees, pulsing dots, fake cursors, identical fade-ups on every section, missing reduced-motion path (R-43).
3. **Write the motion thesis** in four lines:
   - **Focal moment** (MOTION 3 only, or none): one sequence that comes from this product, not a generic fade-and-rise.
   - **Continuity**: which state, layout, or navigation changes need explaining.
   - **Feedback**: which controls need acknowledgment.
   - **Budget**: what may be expensive and how often it runs.
4. **Define tokens once** and use only these:

   ```css
   :root {
     --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* expo-out: arrivals, entrances */
     --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1); /* routine state changes */
     --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* elements moving between two on-screen positions */
     --ease-in: cubic-bezier(0.7, 0, 0.84, 0);        /* exits only */
     --dur-1: 120ms; --dur-2: 200ms; --dur-3: 320ms; --dur-4: 560ms;
   }
   ```

   No cubic-bezier with a y value outside 0..1, no bounce, elastic, or back easing (R-43). Physical subjects that literally bounce are the only exception, with a waiver comment.
5. **Size duration by distance and size.** Press and hover feedback 100-150ms. Small state changes (toggle, tab, chip) 150-250ms. Overlays, drawers, layout shifts 250-400ms. A focal entrance 450-700ms. Larger travel and larger elements get longer durations within the band. Exits run about 70% of the entrance.
6. **Choose properties by meaning.** Default to `transform` and `opacity`. Use `clip-path`, `mask`, or `filter` (bounded blur) when a reveal or depth change is the point and it stays smooth on the target device. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`; use FLIP or transforms. Keep travel short: 8-24px for entrances, never across the screen without reason.
7. **Content is visible at rest.** The default CSS state is the final, readable state. Entrance motion is added on top only when the element is already in the DOM and visible: animate from a class added by script, or use `@starting-style`. If the script fails, nothing stays at `opacity: 0` (R-43, R-47). Never hide above-the-fold content waiting for a scroll observer.
8. **No scattered identical reveals.** Do not give every section the same fade-up. Stagger only a list that appears as a list, cap total stagger at about 300ms, and prefer one entrance moment per screen.
9. **Reduced motion.** Every animation file gets a `@media (prefers-reduced-motion: reduce)` block that removes travel, scale, and parallax while keeping opacity and color changes that carry state. Loops stop entirely. Feedback still confirms the action.
10. **Control cost.** Nonessential loops pause when offscreen or when the tab is hidden. Apply `will-change` only during an animation. Use the existing stack (CSS, Web Animations API, the project's motion library); do not add a dependency for what CSS can do.
11. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>` and clear `bounce-easing`, `layout-animation`, `no-reduced-motion`, `marquee`, `pulsing-dot`, `fake-cursor`. Load the page with scripts disabled or before hydration: all content must be visible. Interrupt animations by clicking quickly; nothing should stick half-way. Check with reduced motion on.

## Output

- Dial line and the four-line motion thesis.
- The token block added or reused.
- A list of motions: element, trigger, purpose, duration, easing.
- What was removed (loops, bounces, duplicate reveals).

## Done when

- Removing any motion would lose meaning or the declared focal moment.
- Motion matches the MOTION dial: a "static" page does not move, a "cinematic" one does.
- Content is visible at rest and with reduced motion, and no detector motion finding is unexplained.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
