# distill

Strip a surface to what its content and task need. Remove sections, elements, copy, and containers that do not earn a place, and merge what is said twice.

## When to use

- The page carries template sections that exist because "every landing page has one" (C-3).
- A screen offers many competing actions, repeated information, or wrappers inside wrappers.
- Copy runs long, repeats the heading, or explains what the UI already shows.

## When not to use

- The design has the right parts but is visually loud. Use `quieter`.
- The task is complex and the density is real (a trading screen, an editor). Distill the chrome, not the capability.

## Steps

1. **Name the one job.** From `PRODUCT.md` and the surface, write one sentence: what must a visitor understand or do here? If you cannot infer it, ask once before cutting anything.
2. **Inventory every section and element.** For each, write what it serves in a few words. Mark each one:
   - **Keep**: directly serves the job.
   - **Merge**: says something already said elsewhere, or splits one idea across two places.
   - **Defer**: needed by some users, not at first glance (move behind disclosure, a details element, a secondary page).
   - **Cut**: serves nothing but the template. Typical cuts: a "Trusted by" bar with no real logos, a three-step "How it works" that restates the features, a stats band with invented numbers (R-17), a closing CTA section that repeats the hero, testimonials that do not exist (R-18), decorative illustrations (R-22).
3. **Check before cutting.** Never cut required functionality, legal or safety information, information a user needs for a decision, accessible names, or real evidence. If a cut changes product scope (removes a feature or an option), list it and ask.
4. **Merge duplicates.** One primary action per screen; collapse repeated CTAs into it. Combine sections that share a subject. Remove intros that restate their heading. Keep one term per concept.
5. **Cut copy.** For each paragraph: remove filler openers, hedges, and restated headings; keep the specific fact. Aim to halve length without losing meaning. Follow [copy.md](../rules/copy.md): no buzzwords (R-16), no generic CTAs (R-15), no em dashes (R-02).
6. **Remove containers.** Cards are not the default container (R-41). Replace cards that hold a single heading and paragraph with spacing and alignment. Never leave a card inside a card. Remove icon tiles stacked above headings when the icon adds no meaning. Remove borders and backgrounds that do not separate or signal state.
7. **Reduce variation.** Collapse near-duplicate sizes, colors, radii, and spacing values onto the existing scale. Do not introduce new tokens.
8. **Re-flow.** After cuts, the remaining sections must still follow the product's narrative order, not the template order. Check that section rhythm still matches the RHYTHM dial; distilling a RHYTHM 3 page must not leave five identical blocks (R-05).
9. **Clean the code you made orphaned.** Remove components, styles, and assets used only by cut elements. Do not refactor unrelated code.
10. **Verify.** Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>`. Click every remaining control (R-26). Check that no anchor now points to a removed section (R-24). View desktop and mobile once.

## Never

- Remove functionality to make a screen look minimal.
- Hide required information so deep that users cannot find it.
- Flatten hierarchy until nothing stands out.
- Leave a void and fill it with a generic placeholder; a shorter page is the result.

## Output

A table of what changed, then the summary:

| Element | Decision | Reason |
|---|---|---|
| Logo bar | Cut | No real customer logos (R-18, C-3) |
| Features + How it works | Merged | Same three points said twice |

- Count of sections before and after, and approximate copy length before and after.
- Anything deferred and where it now lives.
- Scope questions for the user (cuts that would remove a feature).
- Detector result.

## Done when

- Every remaining section answers "what does this serve?" with a content reason.
- Each screen has one obvious primary action.
- No nested cards, no orphaned code, no dead anchors.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
