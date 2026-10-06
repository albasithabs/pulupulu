# polish

The final pass to shipping quality inside the current system. Polish is refinement, never a concealed redesign: it keeps the visual world, content, behavior, and everything outside scope.

**Mode:** during (implied by the command).

## When to use

- A surface works and looks roughly right, but has inconsistencies, missing states, rough edges, or drift from the system.
- After `audit`, `critique`, `harden`, or `extract`, as the last step before delivery.

## When not to use

- The concept itself is wrong (wrong hierarchy for the job, generic identity, wrong mode). Say so and recommend `build` (redesign), `bolder`, `quieter`, or `distill` instead of smuggling a replacement in.
- The path does not work yet. Finish the function first.

## Steps

1. **Establish the system.** Read `DESIGN.md`, tokens, shared components, and neighboring flows. Without a formal system, use the project's coherent conventions. Read `PRODUCT.md` for voice and claims.

2. **Gather evidence.**
   - Use the feature at desktop and mobile: `node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url-or-file>` plus `detect --json` on the target files.
   - Read the latest `.pulupulu/critique/<slug>-*.md` and `pulupulu/audit-*.md` if present; take their open P0, P1, and HIGH items as inputs, then do your own pass anyway.
   - Note the states, content lengths, roles, and input methods real users will hit, and any deliberately unfinished work.

3. **Classify each drift** before fixing it, and fix at the narrowest correct level:
   - **missing token:** the system needs a reusable value; add it to the token layer.
   - **one-off implementation:** an existing shared component or pattern should replace it.
   - **conceptual mismatch:** the flow, terminology, or hierarchy differs from comparable areas; align it, or ask if the system's principle cannot be inferred.
   - **local defect:** simply incomplete or inconsistent; fix in place.

4. **Triage in this order** and do not perfect one corner while the rest stays below the bar:
   1. **Broken:** blocked tasks, dead controls (R-26), broken output (R-47), misleading state, data loss.
   2. **Missing states:** loading, empty, error, success, disabled, permission (R-27).
   3. **Accessibility:** contrast in every state and theme (R-25), keyboard and focus (R-32), names and headings (R-48), tap targets and overflow (R-03).
   4. **Consistency:** design-system drift, terminology, same-role type, spacing scale, radius language (R-11), icon family and weight.
   5. **Details:** optical alignment, motion timing, copy punctuation, asset quality, code cleanup.

5. **Polish the whole path.**
   - **Flow and hierarchy:** match neighboring patterns for routing, saving, and disclosure; keep the primary action and current state obvious; connect arrival, empty, and recovery paths.
   - **Layout and type:** align to the grid and spacing scale, optically as well as mathematically; group related items tightly; check measure, wrapping, zoom to 200 percent, and font loading (R-42).
   - **Color and imagery:** semantic tokens with stable meanings across themes; no gray text on colored surfaces (R-44); images with set aspect ratios, responsive sources, and real alt text.
   - **Interaction:** every control has default, hover, focus, active, disabled, loading, error, and success behavior where it applies. Motion stays coherent and interruptible (R-43); do not add animation to make polish visible.
   - **Browser surfaces (R-45):** text selection color, caret color, a designed focus ring, scrollbar where the surface owns one, link underline offset and thickness, tabular numerals in tables and prices. These belong to the design, not the browser default.
   - **Copy:** consistent terminology, capitalization, and punctuation per [../rules/copy.md](../rules/copy.md). Ask before changing any claim.
   - **Code:** remove debug output, dead code, unused imports and styles, and duplication the pass created. Promote a value to a token only when it is genuinely reused.

6. **Verify.** Walk the path again with mouse, keyboard, and touch emulation at 360, 390, 768, and 1440 widths, in every shipped theme. Re-run the detector on changed files and the browser pass. Fix real findings; waive only narrow, intentional exceptions with a reason ([detect.md](detect.md)).

7. **Deliver.** Run the Delivery Gate ([../rules/delivery-gate.md](../rules/delivery-gate.md)). Review the source diff and remove accidental churn before reporting.

## Output

- The polished surface, same identity, with the fixes applied.
- A chat summary: drift found by class, what was fixed in triage order, critique or audit items closed, detector before and after counts, and anything left open with the reason.
- The Delivery Gate report with evidence.

## Done when

- [ ] No visual world, content, or out-of-scope area changed.
- [ ] Every drift was classified and fixed at the narrowest correct level.
- [ ] Broken paths and missing states were handled before cosmetic work.
- [ ] Browser surfaces (selection, caret, focus, scrollbar, underline, numerals) are designed.
- [ ] Every shipped theme and the tested widths pass a walk-through.
- [ ] The detector shows no open HIGH findings on changed files.
- [ ] The Delivery Gate passed with evidence and the diff is clean.
