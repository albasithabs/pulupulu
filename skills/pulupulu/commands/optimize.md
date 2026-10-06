# optimize

Make the interface load and respond faster without changing how it looks: the largest image, fonts, layout shift, animation cost, bundle size, and images. Measure before and after; an unmeasured optimization is a guess.

**Mode:** during (implied by the command).

## When to use

- Pages load slowly, jump while loading, or stutter on scroll or animation.
- An audit flagged performance, or a launch needs Core Web Vitals in range.

## When not to use

- Backend or database latency with no front-end cause. Report it and stop.
- The fix would change the design (dropping the hero image, removing a motion system). Propose it and let the user decide.

## Steps

1. **Measure first.** Pick two or three representative routes. Record, at mobile with CPU and network throttling and at desktop:
   - LCP (target under 2.5 s), CLS (under 0.1), INP (under 200 ms), total transfer size, JavaScript size, number of font files, the LCP element.
   - Tools: the browser's Lighthouse or Performance panel, `PerformanceObserver` for `largest-contentful-paint` and `layout-shift`, and the build's bundle report. State which tool produced each number.
   Also run `node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots/optimize-before <url>` so you can prove the look did not change.

2. **Fix the LCP element.**
   - If it is an image: serve it at the rendered size, in AVIF or WebP with a fallback, with `fetchpriority="high"`, never `loading="lazy"`, and preload it when it is discovered late (CSS background, JS-injected).
   - If it is text: make sure the font does not block it (step 3).
   - Remove render-blocking scripts and styles in front of it; defer non-critical JavaScript.

3. **Load fonts deliberately.**
   - Self-host WOFF2 files instead of a third-party stylesheet when the license allows; it removes a connection and a render block.
   - `font-display: swap` for body text, `optional` for decorative faces where a fallback is acceptable.
   - Subset to the scripts the product uses (Latin plus Latin Extended covers Indonesian); drop unused weights and styles; prefer one variable font over many static files.
   - Preload only the one or two files used above the fold.
   - Reduce swap shift with a matched fallback (`size-adjust`, `ascent-override`, `descent-override` on a local fallback face).

4. **Remove layout shift.** Width and height or `aspect-ratio` on every image, video, iframe, and ad slot; reserved space for content that loads late (banners, embeds, async lists); no content inserted above what the user is reading; skeletons the size of the real content.

5. **Make animation cheap.**
   - Animate `transform` and `opacity` only; never width, height, top, left, margin, or padding (R-43, `layout-animation`).
   - Bound expensive effects: large `backdrop-filter`, big blurs, and large animated shadows cost every frame; limit their area and count.
   - `will-change` only on elements about to animate, removed after; never as a global default.
   - Pause offscreen and infinite animations; respect `prefers-reduced-motion`.
   - Avoid layout thrash: batch DOM reads before writes; use `IntersectionObserver` instead of scroll handlers that read layout.

6. **Shrink and split JavaScript.**
   - Split by route; load heavy components (editors, charts, maps, carousels) on demand.
   - Replace large dependencies used for one function with platform APIs or a small import; remove unused ones.
   - In frameworks: avoid needless re-renders (stable props, memoized expensive work, state kept close to where it is used); stream or server-render content the user sees first.

7. **Serve images properly.** Responsive `srcset` with width descriptors and an accurate `sizes`; `<picture>` for art direction; AVIF or WebP; `loading="lazy"` and `decoding="async"` below the fold; compress to the quality the design needs, not the camera's.

8. **Trim the network.** Cache static assets with long lifetimes and hashed names, compress text responses, `preconnect` only to origins used on first paint, and drop unused third-party scripts (tag managers, widgets) after confirming with the user.

9. **Measure again** with the same routes, tools, and throttling. Capture `optimize-after` screenshots and compare: the page must look the same. Run the detector on changed files. Report every metric before and after; drop any change that did not move a number and added complexity.

## Output

- The optimized code.
- A before and after table per route: LCP, CLS, INP, transfer size, JS size, font files, with the tool used.
- Matching before and after screenshots.
- Proposals that would change the design, listed for the user to decide.

## Done when

- [ ] Metrics were recorded before any change, with the tool named.
- [ ] The LCP element is prioritized and correctly sized.
- [ ] Fonts are self-hosted where licensed, subset, and loaded with a stated `font-display`.
- [ ] Every media element reserves its space; CLS is under 0.1 or the remaining cause is named.
- [ ] Animations use only transform and opacity, with reduced motion handled.
- [ ] Heavy code is split or loaded on demand.
- [ ] After-metrics are reported and screenshots show no visual change.
