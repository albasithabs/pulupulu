# Human: accessibility and real-world use

Load with [core.md](core.md) whenever the task builds or edits UI. The interface must work for people with different eyes, hands, devices, languages, and setups. This is part of "works" (C-4), not an extra. Entries cite the governing rule; Hard Gate rules here (R-25, R-27, R-32, R-34, R-47, R-48) fail delivery outright.

Target: WCAG 2.2 AA.

---

## Contrast (R-25)

| Content | Minimum |
|---|---|
| Body text, placeholder text, labels | 4.5:1 |
| Large text (24px+, or 18.66px+ bold) | 3:1 |
| Control boundaries, icons that carry meaning, focus indicators, chart segments | 3:1 against adjacent colors |
| Disabled controls | Exempt, but still recognizable as present |

**Compute, never assert.** The eye overestimates contrast on gray pairs, and agents repeat plausible claims. `#555555` on black is 2.82:1. It fails.

```bash
node <skill-dir>/scripts/pulupulu.mjs contrast "#777777" "#ffffff"
```

The detector checks resolvable pairs in source (`low-contrast`, static) and computed pairs on the rendered page (`low-contrast`, browser). It reports pairs it cannot verify (text over images or gradients) as unverifiable; those are yours.

Without the script, use the WCAG formula: for each channel `c = value / 255`, linearize (`c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4`), luminance `L = 0.2126 R + 0.7152 G + 0.0722 B`, ratio `(L_light + 0.05) / (L_dark + 0.05)`.

| Pair | Ratio | Text | Large |
|---|---|---|---|
| `#777777` on white | 4.48 | Fail | Pass |
| White on `#888888` | 3.54 | Fail | Pass |
| White on `#999999` | 2.85 | Fail | Fail |
| `#555555` on black | 2.82 | Fail | Fail |
| White on `#666666` | 5.74 | Pass | Pass |

Where it goes wrong:

- **Text over photos and gradients.** Contrast is local. Check the lightest point under the text, not the average. Fix with a scrim or a solid block.
- **Interactive states.** Hover, selected, and disabled colors are pairs too.
- **Both themes.** Every pair, again, in dark mode (R-34).
- **Translucent layers.** Alpha overlays change contrast with whatever sits behind; prefer explicit colors.

---

## Keyboard and focus (R-32)

- Every interactive element is reachable with Tab, in an order that follows the visual order. Source order matches visual order; never reorder with CSS alone.
- Enter activates links and buttons; Space activates buttons, checkboxes, and toggles; arrow keys move within tabs, menus, radios, and listboxes.
- Escape closes dialogs, menus, and popovers, and focus returns to the trigger.
- Dialogs move focus inside on open, trap it while open, and restore it on close. `<dialog>` with `showModal()` does most of this.
- A skip link ("Skip to content") on pages with long navigation.
- No `tabindex` greater than 0. `tabindex="-1"` only for programmatic focus targets.
- **Focus visible:** every focusable element shows a `:focus-visible` indicator, at least 2px, 3:1 against adjacent colors, in every theme, themed from the palette (R-45). Never `outline: none` without a replacement.
- No hover-only menus; no drag-only interactions without a keyboard alternative (buttons to reorder, a picker instead of a drag).

The browser detector tabs through up to 25 focusables and flags those with no visible change (`focus-invisible`).

---

## Semantics and names (R-48)

- One `<h1>`; headings descend without skipping. Headings describe structure, not styling; style with CSS.
- Landmarks: `header`, `nav`, `main`, `footer`, and `aside` where real. Multiple `nav` elements get distinct `aria-label`s.
- `<button>` for actions, `<a href>` for navigation. Never a clickable `div`.
- Every control has an accessible name that contains its visible label. Icon-only buttons get `aria-label` ("Close dialog", "Delete invoice INV-204").
- Toggles expose state: `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-current="page"`.
- `<html lang="id">` (or the real language); mark passages in another language with `lang`.

### Alt text

- Informative image: alt says what the image tells the reader, in context ("Invoice list with three overdue rows highlighted"), not "image of".
- Decorative image: `alt=""`, or a CSS background.
- Image of text: the alt repeats the text.
- Linked image: alt describes the destination.
- Charts: a short alt with the takeaway plus the data in a table or text nearby.

---

## Forms

- Every input has a visible `<label>` bound with `for`/`id` or wrapping. Placeholder is never the label.
- Use the right `type` and `autocomplete` (`email`, `tel`, `name`, `street-address`, `one-time-code`) and `inputmode` for numeric fields.
- Hints and errors linked with `aria-describedby`; invalid fields marked `aria-invalid="true"`.
- Errors appear next to the field, in text, and are announced (a live region or focus moved to an error summary on submit).
- Keep the user's input on error. Never clear a form because one field failed.
- Prevent double submission: disable or mark busy while submitting, and say so.
- Time limits are adjustable or absent.

---

## States (R-27)

Every state is perceivable and says something, not only visible to sighted mouse users.

| State | Requirement |
|---|---|
| Empty | Why it is empty and the action that fills it; first run, no results, filtered, and no permission are different messages |
| Loading | Text naming what is loading; `aria-busy` on the region; a polite live region for long waits |
| Error | What failed and how to recover; announced; a retry when retry makes sense |
| Success | Brief confirmation, announced politely; focus not stolen |
| Disabled | Explains why when the reason is not obvious (a tooltip or helper line), still readable |
| Permission | Says what the user cannot do and who can grant it |

Don't block the whole interface because one component failed.

---

## Color is never alone

- Status, validation, required fields, chart series, and links in body text carry a second cue: text, an icon, a pattern, a shape, an underline, or position.
- "Password must be at least 8 characters" in text, not only a red border.
- Check forced-colors mode (Windows High Contrast): borders and focus must survive; use `forced-colors: active` adjustments when custom styles disappear.

---

## Motion and sensory (R-43)

- Every animation has a `prefers-reduced-motion` path that removes or shrinks movement while keeping state feedback.
- Nothing flashes more than three times per second.
- Autoplaying media is muted, short, or pausable; nonessential loops stop offscreen and offer a pause when they run longer than 5 seconds.
- Content does not depend on hover, sound, or motion alone to be understood.

---

## Zoom, text size, and touch

- The page works at 200% browser zoom and with a larger default font size: no clipped text, no overlapping controls, no horizontal scroll at 320px CSS width (reflow).
- Sizes in `rem`; containers grow with text; no `overflow: hidden` on text containers.
- Zoom is never disabled (R-03).
- Touch targets at least 44x44 CSS px with space between them (R-03; detail in [mobile.md](mobile.md)).
- On phones, a focused input scrolls into view above the on-screen keyboard; nothing fixed covers it.

---

## Edge cases that exclude people

- **Long content:** 100+ character names, long translations (German and Indonesian run longer than English), many items. Containers wrap or truncate with the full value available (title, tooltip, or detail view).
- **Short and empty content:** one character, no data, missing optional fields.
- **Scripts and directions:** CJK, Arabic or Hebrew (use logical properties: `margin-inline-start`, `padding-inline`), emoji in names.
- **Slow and offline:** a clear message and retry; never a frozen spinner.
- **Interrupted gestures** on custom sliders or drag surfaces: a cancelled drag (`pointercancel`, lost capture, window blur) clears its state and the next drag works.

---

## Human checklist

All must be **yes**:

- [ ] Every text, placeholder, and control pair computed for contrast, including text over images, every state, and both themes (R-25)
- [ ] Every interactive element reachable and operable by keyboard; Escape closes overlays and returns focus (R-32)
- [ ] Visible, themed `:focus-visible` on every focusable element; no bare `outline: none` (R-32, R-45)
- [ ] One h1, no skipped heading levels, landmarks present, `lang` set (R-48)
- [ ] Every image has correct alt; every control has an accessible name matching its label (R-48)
- [ ] Every input has a visible label, correct type and autocomplete, linked hints and errors
- [ ] Empty, loading, error, success, disabled, and permission states exist and are announced (R-27)
- [ ] No information carried by color alone
- [ ] Reduced-motion path present; nothing flashes; loops pausable (R-43)
- [ ] Works at 200% zoom and 320px width with no clipping; zoom not disabled (R-03)
- [ ] Long, short, translated, and RTL content does not break the layout
