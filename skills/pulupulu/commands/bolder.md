# bolder

Raise a safe or flat design one step up the ENERGY dial while it stays recognizably the same product. Bold means conviction: scale contrast, a committed color strategy, stronger type, one focal move. It never means more effects.

## When to use

- A shipped or built surface reads timid, flat, or interchangeable, and the user wants more presence.
- One named section sits below the expressive level the rest of the page already reaches.

## When not to use

- A direction is still being chosen. "Make it bolder" during an open direction round asks for a bolder direction, not this command.
- The user wants a different identity. That is a redesign; use `build`.
- The design is loud and noisy. Use `quieter` or `distill`.

## Steps

1. **Fix the scope.** Name the target (whole surface or one section) and write down what stays untouched: everything outside the target, product truth, copy claims, behavior, navigation, brand colors and faces pinned in `DESIGN.md`. If the user did not name a target, ask once.
2. **Read the dials.** Take ENERGY / RHYTHM / MOTION from `DESIGN.md` or the Design Read ([core.md](../rules/core.md#part-3-liveliness)). Bolder moves ENERGY up by one step (1 to 2, or 2 to 3). If ENERGY is already 3, the problem is focus, not volume: make one move clearer and quiet the rest. State the new dial line before editing.
3. **Diagnose why it reads flat.** Check each, with a file and selector for every answer:
   - Scale: is the largest element less than about 2.5x body size? Are adjacent type steps closer than 1.25x?
   - Color: is the accent spread thin across many small elements so no region owns it?
   - Type: is the display role set in the body face at body weight?
   - Focus: can you point to the single most important element on each screen within one second?
   - Rhythm: does every section use the same composition (R-05)?
   - Opt-out: what does the rest of the page do (motif, display weight, density) that this target does not?
4. **Pick at most three moves, and make one of them the focal move.** Choose from:
   - **Scale contrast.** Push the hero or key heading to a decisive display size (often 3x to 6x body on Persuade surfaces) and shrink supporting text so the gap reads.
   - **Committed color.** Move from Restrained to Committed: let the brand color own one large region (a full-bleed band, the hero field, the primary panel) instead of tinting twenty small elements. See [colorize.md](colorize.md).
   - **Stronger type.** Heavier display weight, tighter display tracking (not past -0.04em), a display face with real character if `DESIGN.md` allows one. See [typeset.md](typeset.md).
   - **One focal move.** A cropped oversized image, an asymmetric split, a type-as-image headline, a single authored motion moment. Exactly one per screen.
   - **Rhythm break.** Give the target a density or pace change from its neighbors so it reads as a peak (RHYTHM dial permitting).
5. **Use the system's own vocabulary.** Reuse existing tokens, faces, radii, and motifs at full strength. Do not add a new color, font, radius, shadow style, or primitive. If the system genuinely cannot carry the move, stop, name the exact addition and its job, and ask.
6. **Refuse the slop reflex.** Bolder never adds: gradient text, purple-blue gradients, glow orbs, colored shadows, stacked glass, grid backgrounds, sparkle icons, eyebrow pills, pulsing dots (R-01, R-07, R-09, R-10, R-13, R-39, R-43). If your plan contains one, replace it with a scale, color-field, or type move.
7. **Commit, then quiet the surroundings.** Execute the focal move completely. Then lower competing elements (secondary buttons, decorative borders, extra accents) so the move is legible. If everything got louder, nothing got bolder.
8. **Skeleton test.** Mentally strip the copy. The structure alone should still say what matters most. If it only works with the words, the boldness lives in text size, not design.
9. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>`. Check contrast of any new text-on-color pair with `pulupulu.mjs contrast`. Look at desktop and mobile once: oversized display type must wrap without overflow at 390px (R-03).

## Keep untouched

Content and claims, information order, controls and their behavior, accessibility affordances, pinned brand values, and every section outside the target.

## Output

- The new dial line, for example `ENERGY 1 -> 2 / RHYTHM 2 / MOTION 1`.
- The moves made (at most three), naming the focal move, each with one line of purpose.
- What was quieted to make room.
- Detector result and any contrast checks.

## Done when

- One element per screen is unmistakably first.
- The target reads as the same brand, more sure of itself.
- No new slop pattern appeared and no detector finding is unexplained.
- Nothing outside scope changed.
- Hand off to [polish.md](polish.md) for the final pass, then the [Delivery Gate](../rules/delivery-gate.md).
