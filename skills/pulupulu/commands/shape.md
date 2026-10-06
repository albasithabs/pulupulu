# shape

Plan the UX before any code: the task, the people, the states, the structure, the content, the flows, and the edge cases. Return a short confirmed brief and stop.

**Mode:** during (implied by the command). Shape writes no code and makes no visual choices.

## When to use

- A feature, screen, or flow is about to be built and its job, states, or structure are not yet settled.
- The request is sparse ("add a billing page") and building now would mean guessing.
- Before `build` on anything multi-screen or high-stakes (payment, onboarding, destructive actions).

## When not to use

- The request is already precise (states, content, and flow given). Go straight to `build` or the refine command.
- The question is visual direction. That belongs to `build`, step 5.
- The surface exists and works; it needs finishing. Use `polish`, `harden`, or `onboard`.

## Steps

1. **Load context as data.** Read `PRODUCT.md` and `DESIGN.md`. Missing `PRODUCT.md` on a new surface: offer `init` first. Read the existing code around the target so you do not ask what the repo already answers.

2. **Round 1: purpose, people, outcome.** Through the structured question tool when available, otherwise in chat, then stop and wait. Pick the two or three questions that change the result most:
   - What is this for, and what problem must it solve?
   - Who reaches it, from where, in what state of mind, on what device?
   - What is the one thing they must understand or do here? What does success look like?
   - What is true here that a neighboring product could not claim?
   State your likely reading and invite correction rather than asking open questions about obvious facts.

3. **Round 2, only for material gaps:** content and data ranges, states that matter, fidelity and breadth, what must stay untouched, binding constraints (platform, framework, accessibility, locale, performance). Never ask for CSS values or style preferences.

4. **Name the surface mode** (Persuade, Operate, Read, Experience) using [../rules/modes.md](../rules/modes.md). The mode decides what the opening must do and how much identity the surface carries (R-46).

5. **Define the task and the users.** One primary task, stated as a verb phrase. Secondary tasks only when confirmed. For each user type: what they know, what they fear, how often they come.

6. **Map the states** for every view that shows data or accepts input (R-27):

   | View | First run | Empty | Loading | Partial | Error | Success | No permission | Overflow |
   |---|---|---|---|---|---|---|---|---|

   Fill each cell with what the user sees and can do, or `n/a` with a reason.

7. **Shape the information architecture.** What lives on this surface and what does not, the order of importance, grouping (four items or fewer per group at any decision point), navigation entries and their real destinations (R-24).

8. **Inventory the content.** List every piece of content the surface needs with its source:
   - real and on hand (path or owner);
   - real but not yet supplied (owner must provide);
   - demonstration data, labeled synthetic in the UI;
   - claims that must not appear until evidence exists (R-17, R-36, R-38).
   Give realistic minimum, typical, and maximum lengths and counts.

9. **Sketch the flows** as numbered steps: the happy path, then each recovery path (validation failure, network failure, back, refresh mid-flow, cancel). Mark every destructive or irreversible step and how the user confirms or undoes it.

10. **List edge cases** the build must handle: long and missing names, zero and huge counts, slow and offline network, double submit, expired session, locale formats (for Indonesian: `Rp 1.250.000`, `6 Okt 2026`), keyboard-only use, small phones.

11. **Write the brief** (template below). Three to five bullets per section when the task is settled; the full structure only for ambiguous or multi-screen work.

12. **Confirm and stop.** Present the brief, allow one correction round, then save it to `.pulupulu/surfaces/<slug>.md` under `## Shape brief` so `build` can read it. Do not write code, a direction contract, or `DESIGN.md`. If no one can answer, mark assumptions plainly, save the brief, and stop.

## Brief template

```markdown
## Shape brief: [surface]

**Mode:** [Persuade / Operate / Read / Experience]
**Primary task:** [verb phrase]
**Users:** [who, context, frequency]
**Success:** [observable outcome]

### Structure
[What is on the surface, in order of importance. Navigation and destinations.]

### States
[The state table, or the cells that matter.]

### Content
[Inventory with sources; synthetic items labeled; forbidden claims named.]

### Flows
[Happy path and recovery paths, numbered.]

### Edge cases
[The list the build must handle.]

### Boundaries
[What stays untouched. Anti-goals. Open decisions the builder must not invent.]
```

## Output

- The brief in chat, confirmed or with assumptions marked.
- `.pulupulu/surfaces/<slug>.md` containing the `## Shape brief` section.
- One recommended next command, usually `build`.

## Done when

- [ ] At least one answer round happened, or assumptions are marked.
- [ ] The surface mode is named.
- [ ] Every data or input view has empty, loading, and error states defined.
- [ ] The content inventory separates real, missing, synthetic, and forbidden.
- [ ] Recovery paths exist for every failure the flow can hit.
- [ ] No code, visual direction, or direction contract was written.
