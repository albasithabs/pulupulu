# typeset

Fix typography: face choice by character, a ratio-based scale, clear hierarchy, comfortable measure and leading, sound tracking, the right numerals, and font loading that does not hide text.

## When to use

- Hierarchy is unclear: headings barely larger than body, many near-identical sizes.
- The type is a default pick with no stated reason (R-06).
- Reading is uncomfortable: long lines, tight leading, tiny text, crushed tracking (R-42).

## When not to use

- Replacing the brand face would change identity. Confirm with the user, then update `DESIGN.md`.

## Steps

1. **Inventory.** List every family, weight, size, line-height, and letter-spacing in use, with file and selector. Note which faces are pinned in `DESIGN.md` or the brand. Run `node <skill-dir>/scripts/pulupulu.mjs detect <target>` and note `overused-font`, `tiny-text`, `tight-leading`, `crushed-tracking`, `wide-tracking-label`, `mono-costume`, `all-caps-body`, `justified-text`.
2. **Decide whether faces change.** Pinned faces stay; improve how they are used. If faces are unpinned defaults, choose by character using "Calibrating the face" and the overused-face list in [ui.md](../rules/ui.md#calibrating-the-face): describe the product's voice in three words, name what the face must do (long reading, dense data, display presence), shortlist faces that fit, and write one line of reason. A face on the overused list (Inter, Roboto, Geist, Space Grotesk, Plus Jakarta Sans, Fraunces, DM Sans, Outfit, Poppins, Manrope, Sora, Instrument Sans, Instrument Serif) needs a written reason or the user's choice; record approved brand faces in `.pulupulu.json` under `allow.fonts`. Use at most two families; a second family needs a role only it can perform.
3. **Set the scale.** Pick a ratio by surface: 1.2-1.25 for dense Operate surfaces, 1.25-1.333 for Read and general product, 1.333-1.5 or larger for Persuade and Experience display. Build named roles (`display`, `h1`, `h2`, `h3`, `body`, `small`, `label`, `data`) from a 16px body. Adjacent hierarchy steps differ by at least 1.25x; if two roles differ less, merge them or separate them by weight and color too. The h1 must be at least 1.25x body (detector `flat-hierarchy`).
4. **Set the floors** (R-42):
   - Body 16px on web (1rem); functional UI text not below 12px; nothing below 11px.
   - Measure 65-75ch for prose (`max-width: 68ch` is a good default); 45ch minimum on narrow columns.
   - Leading: body 1.5-1.7; headings 1.05-1.25, tighter as size grows; wider measure needs more leading. Never below 1.3 on paragraphs.
   - Tracking: display may tighten, but not past -0.04em. Body stays between -0.01em and 0.05em. Uppercase labels may open to 0.05-0.08em; never 0.15em+ "HOW IT WORKS" labels (R-06).
   - No all-caps paragraphs, no justified text without `hyphens: auto`.
   - Light text on dark surfaces: add a little leading and tracking, and one weight step if the face thins out.
5. **Numerals.** Tables, prices, timers, and any column of numbers use `font-variant-numeric: tabular-nums` and right alignment; prose may keep proportional oldstyle figures if the face has them. Use real fractions and the face's own symbols where available (R-45).
6. **Hierarchy beyond size.** Combine size, weight, color, and space. Give each role one fixed recipe and reuse it everywhere. Headings get more space above than below so they attach to their content.
7. **Load fonts properly.** Load only used weights and styles; prefer one variable font over many static files. Self-host or preconnect. Use `font-display: swap` (or `optional` for display faces where a flash would hurt), and set a metric-matched fallback with `size-adjust` / `ascent-override` to prevent layout shift. Subset for the languages the product ships (Latin plus the characters Indonesian needs is usually enough).
8. **Stress test.** Long headings, long Indonesian words, a translated string 30% longer, 200% zoom, a 320px container. Display type must wrap without overflow on mobile (R-03); use `clamp()` for fluid display sizes on Persuade surfaces, fixed sizes on dense product surfaces.
9. **Verify.** Rerun `detect`; if a dev server runs, `detect <url>` for rendered `line-length`, `tiny-text`, and `flat-hierarchy`. Look once at desktop and mobile.

## Output

- Faces with one-line reasons, or a note that pinned faces were kept.
- The scale table: role, size, line-height, tracking, weight.
- Floors applied and loading strategy.
- Detector result, with any waiver and its reason.

## Done when

- Heading, body, label, and data roles are distinguishable without reading the words.
- Prose sits within the measure, leading and tracking are inside the floors, numbers align.
- No invisible text or visible layout shift on load.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
