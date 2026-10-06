# Mobile: responsive layout, phone to desktop

Load with [core.md](core.md) for any layout that must hold across screen sizes. Governing rule: R-03 (Hard Gate). Web only; native iOS and Android conventions are out of scope.

**Principle:** a phone layout is a different layout, not the desktop at a smaller size. Adapting means rethinking for the context (narrow screen, thumb, on the move, maybe a slow connection), not scaling pixels. Never hide core functionality on mobile; if it matters, make it work there.

Test widths: **360, 390, 768, 1280, 1440**, plus a drag through the whole range, plus the user's actual viewport when known. The browser detector checks 1440x900 and 390x844 (touch, DPR 2) for overflow, tap size, and edge spacing.

---

## Breakpoints

### Content decides, not devices

- **Tell:** breakpoints at 375, 414, 768 because "that is the iPhone size".
- **Fix:** start narrow, widen until the layout stops working, put a breakpoint there. Three or four content-driven breakpoints usually suffice.

### Mobile first

- **Tell:** a long desktop stylesheet with a small `max-width` query patching the phone.
- **Fix:** base styles for the narrow screen, `min-width` queries add complexity. Mobile is a designed state, verified as a whole, not a patch list.

### Two-state layout

- **Tell:** one column below 768px, a four-column grid above it, nothing between. At 900px the phone stack stretches absurdly or the grid crams.
- **Fix:** as many states as the content needs: typically one column, then two, then the full grid when it genuinely fits. Drag through 600-1024px.

### Container queries

- Components that appear in different contexts (a card in a sidebar and in a main column) respond to their container (`@container`), not the viewport.

### Input method, not just width

- `@media (hover: hover)` for hover enhancements; `@media (pointer: coarse)` for larger hit areas. A touchscreen laptop and a tablet with a keyboard both exist.
- Hover never carries function. Everything reachable by hover is reachable by tap and by keyboard.

---

## Fluid scale

- **Type:** fluid display sizes with `clamp()` on Persuade and Experience surfaces (`font-size: clamp(2.25rem, 1.5rem + 3vw, 4.5rem)`); a fixed rem scale in product UI, stepping down at a breakpoint if needed. Body stays at least 16px; inputs at least 16px so iOS does not zoom on focus.
- **Spacing:** section padding and gaps scale with the viewport (`clamp()` or a smaller step at the breakpoint). Desktop padding of 96-128px on a phone becomes deserts of empty scroll; roughly halve it.
- **Heights:** no `100vh` heroes. Size to content, or use `100dvh` / `100svh` where a full-height section is intended.
- **Images:** `max-width: 100%; height: auto`; `srcset` and `sizes` for resolution; `<picture>` for art direction (a different crop on phones); `loading="lazy"` below the fold; explicit `width` and `height` to prevent layout shift.

---

## No horizontal overflow

- **Tell:** the page scrolls sideways at 360px because of a table, a code block, a long URL, an image, or a fixed-width child.
- **Fix:** find the widest offender (the browser detector reports them), then contain or reflow it:
  - Grid tracks with `minmax(0, 1fr)`, `repeat(auto-fit, minmax(16rem, 1fr))`; never fixed px tracks that cannot shrink.
  - Flex and grid children get `min-width: 0` so they can shrink.
  - Long strings: `overflow-wrap: anywhere` on user content and URLs.
  - Code blocks scroll inside their own container.
- **Never** fix overflow with `overflow-x: hidden` on `body`; that hides the bug and can clip content and focus rings.
- `overflow: hidden` only where cropping is intended (a thumbnail), never on text containers.

---

## Touch targets

- At least **44x44 CSS px** per target, using padding or a larger hit area when the visible mark is smaller.
- At least 8px between adjacent targets; two touching targets behave like one unreliable target.
- Inline links inside a paragraph are exempt from size but need comfortable line-height.
- Visible `:active` feedback so a tap registers.
- Primary actions within thumb reach (lower half of the screen) on long mobile flows.
- Custom sliders, carousels, and drag surfaces: test the drag with touch, test that a swipe across them still scrolls the page, set `touch-action` on pointer-event drag surfaces, clear drag state on `pointercancel` and lost capture.

---

## Navigation on phones

| Situation | Pattern |
|---|---|
| 3-5 primary destinations in an app | Bottom navigation with icons and text labels |
| A site with a handful of pages | A labeled "Menu" button opening a full-height panel; keep the single most important action visible outside it |
| Deep hierarchy | Drawer plus breadcrumbs or a back control showing where the user is |
| Tablet | Compact horizontal nav or a collapsible side rail |
| Desktop | Full nav with labels, persistent side nav in apps |

- **Bare hamburger:** an unlabeled icon hiding everything. Label it "Menu", and keep primary destinations visible when there are few.
- **Fixed bars eat content:** reserve their height with padding and `scroll-padding`, include safe-area insets, verify the last item and the last button are reachable.
- **Sticky chrome steals the screen:** keep fixed headers compact (under ~64px on phones); shrink or hide on scroll down, show on scroll up.
- The menu panel traps focus while open, closes with Escape and a visible close control, and locks background scroll.
- Same information architecture on every width; only presentation changes.

---

## Tables on small screens

Pick by what the user does with the table:

- **Scan and compare across rows:** keep the table, put it in a horizontal scroll container (`overflow-x: auto`, a visible edge or shadow hinting more, the first column sticky), and announce it as a region with a label.
- **Read one record at a time:** reflow rows into stacked blocks, each value labeled (`data-label` with `display: block` on small screens), the deciding field first.
- **Too many columns to matter on a phone:** show the 2-3 deciding columns and link to a detail view.
- Numbers right-aligned with `tabular-nums` in every variant (R-45).

---

## Safe areas and viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
.bottom-bar { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
.page { padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right)); }
```

- Never `user-scalable=no` or `maximum-scale=1` (R-03).
- Body text sits at least 8px from the viewport edge; a 16px side gutter is a good default.
- Landscape on phones still works: check a fixed header plus keyboard in landscape.

---

## Inputs on phones

| Field | Markup |
|---|---|
| Email | `type="email" autocomplete="email"` |
| Phone | `type="tel" autocomplete="tel"` |
| Numeric code, PIN | `inputmode="numeric" autocomplete="one-time-code"` |
| Amount | `inputmode="decimal"` |
| Search | `type="search" enterkeyhint="search"` |
| URL | `type="url"` |
| Date | `type="date"` unless the design system has a tested picker |

- A focused field scrolls above the on-screen keyboard; nothing fixed covers it.
- Multi-step forms keep progress and data when the user leaves and returns.

---

## Performance on phones

- Assume a mid-range Android on a slow connection, not the developer's laptop.
- Lazy-load offscreen images; do not ship desktop-only images to phones (`display: none` still downloads).
- Bound blur, shadow, and canvas effects; they cost more on phones.

---

## Mobile checklist

All must be **yes**:

- [ ] No horizontal scroll at 360px; nothing clipped or colliding (R-03, R-47)
- [ ] Verified at 360, 390, 768, 1280, 1440 and dragged through the range; no two-state gap
- [ ] Breakpoints set where the content breaks; mobile-first styles
- [ ] Type and spacing scale down with intent; no `100vh` slabs; body and inputs at least 16px
- [ ] Every target at least 44x44 with spacing; hover-only interactions have tap and keyboard equivalents
- [ ] Navigation reflows into a labeled phone pattern; fixed bars never cover content and respect safe areas
- [ ] Tables use a scroll container, stacked records, or a reduced column set chosen by task
- [ ] Inputs use the right type, `inputmode`, and `autocomplete`; focused fields stay visible above the keyboard
- [ ] Zoom enabled; body text at least 8px from the viewport edge
- [ ] Custom drag and swipe controls tested with touch, with the evidence source named
