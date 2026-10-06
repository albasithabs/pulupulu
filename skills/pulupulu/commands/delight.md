# delight

Add one or two moments of personality that belong to this product: a micro-interaction, a line of copy, an empty state, or a small discovery. They never slow the task and never fake anything.

## When to use

- The product works and reads clearly, but it feels anonymous.
- A specific moment deserves a response: first use, a completed milestone, recovery from an error, a wait.

## When not to use

- Core flows are broken, unclear, or inaccessible. Fix those first (`harden`, `clarify`, `layout`).
- The moment involves money loss, deletion, privacy, health, or blocked work. Warmth is fine there; jokes are not.

## Budget

One or two delight moments per surface. A third one dilutes the first two. Celebration size matches consequence and frequency: a routine save gets a crisp confirmation, a first published project may get more.

## Steps

1. **Find the product's character.** From `PRODUCT.md` and `DESIGN.md`, write three words for the voice and one sentence for what users should feel at the chosen moment. If the brand's emotional range is unknown and the stakes are high, ask once.
2. **List candidate moments**, with how often each happens:
   - a meaningful completion (first project created, order shipped, form submitted after effort);
   - a wait that can show real progress or useful context;
   - an empty or first-use state that can orient and invite the first action;
   - an error that can lead with recovery in a humane voice;
   - an interaction whose physical response can express the brand (a toggle, a drag, a press);
   - a small discovery: a keyboard shortcut hint, or a harmless easter egg tied to the product.
3. **Pick one or two.** Prefer moments with high emotional weight and moderate frequency. Reject anything that happens hundreds of times a day unless the response is tiny and stays satisfying.
4. **Derive the treatment from the product.** The detail should be impossible to move to a neighboring product unchanged. A bakery app's empty cart is not a generic "Nothing here yet" illustration; a logistics tool's success state names the actual shipment. Kinds of treatment that work:
   - copy in the product's own language at a real moment (see [clarify.md](clarify.md) and [copy.md](../rules/copy.md));
   - a micro-interaction with material behavior that matches the visual world (see [animate.md](animate.md) for timing and easing);
   - an empty state that shows what the filled state will look like, using the user's real context, and offers the first action;
   - an illustration, sound, or haptic grounded in the product's subject, not stock art (R-22).
5. **Protect the task.** Delight must not:
   - delay, block, or cover the primary action, or add a step;
   - fake data, progress, activity, counts, or social proof (R-17, R-36). A wait shows real progress or nothing;
   - play sound without opt-in, or ignore mute and reduced-motion settings;
   - be required, unskippable, or tiring on repeat;
   - add a dependency or asset weight out of proportion to the moment.
6. **Accessibility.** Announce meaningful state changes to screen readers with the same content as the visual. Keyboard and touch paths get the same moment. Reduced motion keeps the message without the movement. Easter eggs never hide required functionality.
7. **Verify.** Use the moment ten times in a row: still pleasant? Use it with reduced motion and with a screen reader: is the meaning intact? Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>`; new motion must pass the R-43 checks.

## Output

- The voice in three words and the one-sentence feeling.
- The chosen moment(s): where, trigger, what happens, why it belongs to this product.
- Candidates considered and rejected, one line each.
- Detector result.

## Done when

- At most two moments were added, each specific to this product.
- The primary task is exactly as fast and clear as before.
- Nothing shown is invented, and muted, keyboard, touch, and reduced-motion paths work.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
