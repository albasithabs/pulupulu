# build

Build a new surface, or replace a surface's visual world, from first question to delivered page. Decide what already exists, ask what changes the work, commit to one direction, build it fully, inspect once, and deliver through the gate.

**Mode:** during (implied by the command).

## When to use

- A new page, screen, or flow with no existing implementation.
- A redesign that replaces the look while keeping product truth, content, and function.
- A new project that needs its first visual world.

## When not to use

- Finishing or correcting an existing surface inside its current look: `polish`, `harden`, `adapt`, or an enhance command.
- Planning only: `shape`.
- Recording an existing system: `document`.

## Steps

### 1. Load context

1. Read `PRODUCT.md`. Missing: run [init.md](init.md) first, then resume here.
2. Read `DESIGN.md`, representative code, tokens, shared components, and assets. A missing `DESIGN.md` does not make the project greenfield.
3. Read `.pulupulu/surfaces/<slug>.md` if `shape` left a brief there.
4. Read [../rules/core.md](../rules/core.md), [../rules/ui.md](../rules/ui.md), [../rules/copy.md](../rules/copy.md), [../rules/human.md](../rules/human.md), [../rules/mobile.md](../rules/mobile.md), and [../rules/modes.md](../rules/modes.md).

### 2. Decide what is already true

Classify the visual authority before anything else:

- **Redesign:** keep product truth, content, function, constraints, and explicit brand commitments. Replace the old visual world rather than polishing it. The old look is evidence of what the subject is, not authority over what it becomes.
- **Established world:** inherit it. A coherent identity in code counts even without `DESIGN.md`; run [document.md](document.md) if the user wants it recorded, never invent a replacement.
- **Incomplete brand:** keep confirmed assets and recognizable traits (logo, a fixed color, a font), then expand the system with the user for this surface.
- **No visual authority:** create a new world with the user.

A section, component, or state inside an established surface inherits that surface. Never turn a local addition into an identity exercise.

### 3. Ask what will change the work

Ask two or three related questions through the structured question tool when available; otherwise ask in chat and stop. A precise request needs only a compact confirmation. Skip settled facts, never the confirmation: `DESIGN.md` settles the look, not this surface's purpose. Pick by surface mode ([../rules/modes.md](../rules/modes.md)):

- **Persuade:** who must act, what they must believe, which real proof or assets earn that belief.
- **Operate:** the task, the information it needs, the important states, how often it is used.
- **Read:** the reader's question, the source material, structure and wayfinding.
- **Experience:** what leads, how exploration unfolds, which interaction or transition matters.

Across modes, also ask what success looks like, what must stay untouched, and what would make a polished result feel wrong. Never ask for CSS values or canned style lanes.

### 4. Choose the amount of invention

- **Extend an existing surface:** inherit its world and composition. Resolve only the new purpose, content, hierarchy, states, and how the addition joins its neighbors. No direction round. No `DESIGN.md` change unless the user approves a system change.
- **Whole surface inside an established world:** keep the visual system fixed. Derive three to five materially different structures from the content, the task, and user behavior. Present the strongest as the lead and up to two alternates, one line each on what the structure does better. The user picks; then go to step 6.
- **New or replacement world:** step 5.

### 5. New world: find the direction

1. Write four lines: the product's unique mechanism in one sentence; the audience's real scene (who, where, under what light); their cultural home; what this first surface must prove.
2. Name the rut: the page this category always ships, and its predictable opposite. Both stay off the candidate list. If the brief paints its own literal picture (a product name, a metaphor), spend at most one candidate on that literal reading.
3. List five to seven candidates from the audience's cultural world: visual systems, publications, places, rituals, artifacts, notations, signage, identity programs, or interfaces they know by heart. One line each on why it resonates and how it can carry the mechanism. Order by resonance.
   - On Operate and Read surfaces, never take the tools the audience operates (a terminal, a control panel) as a candidate; that returns a costume of the tool.
   - On Persuade and Experience surfaces, the tools count toward the rut: at most one.
   - Ask what the thing would look like as a physical object and what its world looked like before the web.
   - Near-duplicates count once. If more than three share one material family, dig until the list spans at least three families.
4. Turn the strongest candidates into complete directions. Each joins a reusable visual world to a concrete first viewport.
5. **Present one direction, fully committed**, plus up to two alternates and the standing exit. Each card has the same anatomy: thesis, palette, type character, materials, first viewport, signature interaction, honest risk. Through the structured question tool, the options are: the lead, the alternates, and last, quietly, **the category standard, played straight**.
6. The standing exit is the user's door, never yours: never recommend it or let it soften the lead. When the user takes it, ask once for two or three products this should sit alongside, make their craft level the bar, and execute the convention at full fidelity without irony. Record a standing preference under Brand Commitments in `PRODUCT.md`.
7. If the user rejects every card, produce a fresh set that excludes everything shown. After two rejected sets, ask what quality is missing instead of guessing again.
8. A direction the user or brief pins beats this whole process. Preserve every pinned constraint field by field.

Every direction must be viable before it is shown: every claim it visualizes is true, it has a real palette and component family, and it can be built with the assets, tools, and performance budget at hand. Demonstration material may be authored at full fidelity when labeled synthetic; prices, customers, benchmarks, and capabilities stay uninventable (R-17, R-36, R-38). Refusing a bold direction because its demo data does not exist yet is timidity, not honesty.

### 6. Record the direction contract

Before code, write the contract under `## Direction contract` in `.pulupulu/surfaces/<slug>.md`. Create the file if needed; keep any `## Shape brief` already there. Six short blocks, roughly 150 words:

```markdown
## Direction contract

THESIS: [the one idea this surface owns, and the category-default arrangement it refuses]
OWN-WORLD: [palette and component language, recognizable with all content removed]
STORY: [what the visitor understands, believes, and does, in order]
FIRST VIEWPORT: [exact composition: what is where, at what scale, where the primary action sits]
FORM: [the chosen form, its rank on the candidate list, alternates declined]
FINISH: unreviewed and undocumented is unfinished; this build ends with the inspection round, the Delivery Gate, and DESIGN.md.
```

If a block reads like a mood ("warm and inviting"), the direction is not decided yet. The contract is development material: never copy it into source, comments, hidden DOM, `data-*` attributes, metadata, bundles, or any file served with the page. Reviewers receive it from the brief file.

### 7. Commit color and type

Follow [../rules/ui.md](../rules/ui.md). In short:

- **Pick a color strategy before picking colors:** Restrained (tinted neutrals plus one accent), Committed (one saturated color carries 30 to 60 percent of the surface), Full palette (three or four named roles), or Drenched (the surface is the color). Persuade and Experience surfaces may take the bolder strategies when the brief allows. Commit color at page scale, as fields that own regions, not accents scattered on a neutral ground (R-29).
- **Light or dark is never a default:** write one sentence of physical scene and let it decide (R-21). Every shipped theme must work (R-34).
- **Choose faces like objects from the subject's world**, with a one-line reason (R-06). Operate and Read surfaces are well served by system stacks and workhorse UI faces. A face on the detector's overused list needs a reason no other face could satisfy; a subject association ("books want a serif") is not one.
- **Calibrate:** generated interfaces cluster around a few looks (cream ground with high-contrast serif and a terracotta accent; near-black with one neon accent and glow; editorial hairlines with italic serif and tracked mono labels; flat saturated ink with hard offset shadows). Each is legitimate when the brief asks for it. When the brief leaves the aesthetic free and someone could guess yours from the category alone, rework it.

### 8. Build with full commitment

Build the chosen direction, not a safer version of it. The form supplies structure, reading order, component conventions, and native motion; the product supplies every fact.

- **Commit every atom.** Nav, buttons, inputs, and links are rebuilt in the direction's vocabulary. A stock component inside a committed world is a lapse.
- **The first viewport is a thesis, not a header.** Show the mechanism at once. Memory test: if someone left after one viewport, what would they describe an hour later? If the answer is a mood, the concept has not landed.
- **Prove, don't claim.** Show the product doing its job with specifics a competitor could not paste in. Label demonstration data synthetic; hand the user a list of what to replace with real material.
- **Author the assets.** Names, entries, copy, thumbnails, textures. Gradients, glass, and generic icon tiles where an authored asset belongs are a gap wearing chrome (R-01, R-10, R-41). Ask before creating a logo, people, or statistics (R-23).
- **Build the technique itself.** If the world names canvas, view transitions, or generative motion, build that, not a static imitation.
- **Pace the page.** Vary density, scale, image, and quiet inside one grammar, matched to the declared RHYTHM dial (R-05). One spacing rhythm; more space above a heading than below it. End on a real close.
- **Motion as material.** One orchestrated motion system matching the MOTION dial, content visible at rest, reduced motion handled (R-43).
- **Working, not pictured.** Every control does something real (R-26), every data view has empty, loading, and error states (R-27), every nav item has a destination (R-24), keyboard and focus work (R-32).

Keep semantics, accessibility, performance, project conventions, and existing behavior intact.

### 9. Inspect once, fix in one batch

1. Settle or disable entrance motion so nothing reads as missing in a capture.
2. Run the detector on what you built:
   ```bash
   node <skill-dir>/scripts/pulupulu.mjs detect --json <changed files>
   node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url-or-file>
   ```
   No Chrome or Edge: say so, keep the static scan, and inspect the code instead.
3. Open every screenshot (desktop and mobile) and confirm it shows what its name claims: no blank regions, no half-loaded state. A bad capture is recaptured, not reviewed.
4. Critique the render against the request and the contract, block by block: does the first viewport match FIRST VIEWPORT, is OWN-WORLD recognizable, does STORY read in order. Add the detector findings, HIGH first.
5. **Use a fresh reviewer when the harness has subagents.** Spawn one with no conversation history and pass it the original request, `PRODUCT.md`, the direction contract, the screenshot paths, and the detector JSON. A reviewer that inherits your transcript inherits your optimism. Without subagents, step out of the build frame and review from the contract and screenshots alone.
6. Fix everything material in one batch. Confirm with one more capture round. Two rounds is the ceiling; stop the moment a round resolves nothing, and report what remains instead of hunting further.

### 10. Deliver and document

1. Run the Delivery Gate in [../rules/delivery-gate.md](../rules/delivery-gate.md). Every PASS carries evidence; any FAIL is fixed before delivery.
2. **New or replacement world:** write `DESIGN.md` now, from the built code, with [document.md](document.md). A rulebook written before the build gets defended against reality instead of describing it. A new world shipped without `DESIGN.md` is unfinished.
3. **Extension:** do not rewrite `DESIGN.md`. Compare the build to it and report any drift you introduced or found.
4. Confirm the FINISH line in the contract is discharged.

## Output

- The built surface, working at desktop and mobile in every shipped theme.
- `.pulupulu/surfaces/<slug>.md` with the direction contract.
- Screenshots in `.pulupulu/shots/`.
- The Delivery Gate report with evidence.
- `DESIGN.md` written (new world) or a drift note (extension).
- A list of synthetic content the user must replace with real material.

## Done when

- [ ] Visual authority was classified and the amount of invention matches it.
- [ ] One answer round happened, or assumptions were stated.
- [ ] A new world went through the candidate list and a committed lead with the standing exit offered.
- [ ] The direction contract has all six blocks and appears nowhere in shipped files.
- [ ] Desktop and mobile were inspected from valid screenshots, with at most two rounds.
- [ ] The Delivery Gate passed with evidence for every item.
- [ ] `DESIGN.md` reflects the built world, or the extension's drift is reported.
