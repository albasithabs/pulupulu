# Surface modes

Load when choosing what a surface is for and how far identity may reach. Governing rule: R-46 (Quality Lock). Dials are defined in [core.md](core.md#part-3-liveliness).

The mode names what the visitor's success looks like on this surface. It decides what the visual world may own and what must stay standard.

| Mode | The visitor | Examples |
|---|---|---|
| **Persuade** | Decides and acts | Landing pages, marketing, campaigns, pricing, product pages |
| **Operate** | Completes a task | App UI, dashboards, editors, admin, settings, tools, checkout |
| **Read** | Understands something | Docs, articles, guides, help centers, changelogs, policies |
| **Experience** | Is inside the work itself | Portfolios, galleries, showcases, interactive stories |

---

## Choosing the mode

- **Choose from the surface, not the product.** A developer tool's landing page is Persuade, its docs are Read, its app is Operate. A fashion house's documentation is still Read. A docs index is Read, not Persuade.
- **One mode per surface.** A surface that seems to need two is usually two surfaces (a pricing page that is also a calculator: Persuade page, Operate component inside it, the component following Operate rules).
- **Declare it** in the Design Read and record it in the surface's notes or `DESIGN.md` when durable.
- **Inherit, don't reinvent.** A new section inside an existing surface takes that surface's mode and world.

## The world's reach

| | Persuade | Operate | Read | Experience |
|---|---|---|---|---|
| World may own | The whole page: ground, major surfaces, display type, composition | Type, palette, density, one signature move | The frame: masthead, rail, ground, title and section openers, how code and tables are set | Everything; the work leads |
| Must stay standard | A legible offer, a visible primary action, a readable order | Layout model, navigation, controls, states | The reading column, reading order, navigation | Wayfinding and a way out |
| Typical dials (E / R / M) | 2-3 / 2-3 / 1-3 | 1-2 / 1 / 1 | 1-2 / 1-2 / 1 | 2-3 / 2-3 / 2-3 |
| Color strategy | Committed, Full, or Drenched when the brief allows | Restrained floor; one screen can earn Committed | Restrained column, committed frame | Whatever the work needs |
| Faces | A face with a point of view | System stack or workhorse UI face; one family is often right | A reading face for the column; the frame may carry display type | As the work needs |

A dial outside the typical range needs a one-line reason in the Design Read.

---

## Persuade

**Success:** within seconds a first-time visitor knows what this is, why it matters to them, and what to do, and does it.

- **First viewport:** makes the offer intelligible and desirable, shows the primary action in its working form, and demonstrates something only this product can prove. The action is the one visitors came for: a search form for a travel site, open slots for a clinic, add to cart for a store. A link pointing to it elsewhere does not count.
- **The world carries the page, never paints over it.** Navigation still reads as links, copy as set text, the action as plainly clickable, the next section starts as a section. A page painted whole as a poster with no working parts is a picture of the world, not a website.
- **Prove, don't claim.** Show the product doing its job. Labeled demonstration data is fine; claims stay real (R-17, R-36).
- **Commit color at page scale.** A neutral template with one accent is the category default.
- **Failures:**
  - The template skeleton in a new skin: split hero (copy left, product right, badge row under), or a centered headline over a row of equal cards.
  - A committed world that hides the offer or the action.
  - The hero-metric template; fake logo bars; three pricing columns by reflex (R-05).
  - The restrained gray default that reads like an admin panel.

## Operate

**Success:** a person who uses tools like this knows where everything is before noticing the world, and finishes the task without pausing at a subtly-off component.

- **The bar is earned familiarity.** Product UI fails by strangeness without purpose more often than by flatness.
- **First viewport:** the shell first: navigation, the work areas and what each is for, the data the user reads first, its states. Then where the signature move lives.
- **The world lends four things only:** type, palette, density, and one signature move named concretely (service health drawn as a transit map; a schedule set in a timetable's column rhythm). It never supplies layout, navigation model, or controls.
- **Color does jobs:** a committed shell (colored rail or header, tinted ground), state colors, data series, selection. A gray screen with one accent is the default without the polish. Accent goes to primary actions, current selection, and state, never decoration.
- **Type:** fixed rem scale, ratio 1.125-1.2; one family is often enough; no display faces in labels, buttons, or data; `tabular-nums` in tables.
- **Components:** every one ships default, hover, focus, active, disabled, loading, error. Skeletons shaped like the real content for loading; empty states that teach the interface. Same action, same component, on every screen.
- **Motion:** state and feedback only, 150-250ms, no page-load choreography.
- **Permissions:** system fonts, standard navigation (top bar plus side nav, tabs, breadcrumbs, command palette), density, consistency over surprise.
- **Failures:**
  - A costume of the audience's tool: a terminal prompt bar, an instrument bezel, ledger paper standing in for a table.
  - Invented affordances: custom form controls, non-standard modals, reinvented scroll behavior.
  - Decorative motion; heavy saturated color on inactive states.
  - A modal as the first answer.
  - The default dashboard shell built before the screen's job was named (R-05).

## Read

**Success:** the reader finds the answer fast, understands it, and knows where to go next; the reading experience is worth staying in.

- **First viewport:** where the reader stands in the navigation, the title, an opening that answers or frames their question, the reading column, and the way forward (contents, headings, next and previous).
- **The world owns the frame, the column stays calm.** The masthead, rail, ground, openers, and the setting of code, tables, and callouts carry the palette, type, and signature move fully. The column keeps a reading face, real contrast, 65-75 character measure, body near 16-18px.
- **Standard forms for standard content:** code blocks, tables, notes, and figures look like what readers expect, set in the world's type and palette.
- **Wayfinding:** a visible table of contents on long pages, anchored headings, current-location highlighting, search for docs.
- **Failures:**
  - World material inside the column (textures, display type, decoration behind text).
  - Monospace running text or headings; mono is for code and parameters.
  - A document that reads as a poster, a magazine cover, or a book photographed open.
  - A frame so neutral it could be any product's docs.

## Experience

**Success:** the visitor is absorbed in the work, and the interface gets out of the way without leaving them lost.

- **First viewport:** the work itself leads, at full scale. No hero copy block in front of it.
- **Interface recedes:** minimal chrome, but navigation, a way back, and controls for any media stay findable and keyboard reachable.
- **Motion and transitions** are often the medium; they still follow R-43 (reduced-motion path, visible at rest, no bounce by reflex).
- **Performance is part of the experience:** large media is sized, lazy-loaded, and degrades gracefully.
- **Failures:**
  - Wrapping the work in a landing-page template (headline, subhead, CTA, cards).
  - Interface chrome louder than the work.
  - Effects that hide the work or block reading of captions and credits.

---

## When modes collide with the brief

- A brief that pins a look is honored within the mode's limits: a playful brand on an Operate surface gets its palette, type, and signature move, not a playful layout or invented controls.
- If the brief explicitly asks for a mode-breaking pattern (a cinematic intro on a dashboard), name the conflict with R-46, ask once, and record the answer (R-37).
