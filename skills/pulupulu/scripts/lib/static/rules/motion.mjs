import { allBases, cleanValue, openTags, restBases, sizePx, splitClasses, textOf } from './_util.mjs';
import { subjects } from './type.mjs';

const EASING_PROPS = /^(transition|transition-timing-function|animation|animation-timing-function)$/;
const LAYOUT_PROPS = /^(width|height|top|left|right|bottom|margin(-(top|right|bottom|left|inline|block))?|padding(-(top|right|bottom|left|inline|block))?)$/;

function overshoot(value) {
  for (const m of String(value).matchAll(/cubic-bezier\(\s*([^)]*)\)/gi)) {
    const n = m[1].split(/[\s,]+/).map(Number);
    if (n.length === 4 && (n[1] < 0 || n[1] > 1 || n[3] < 0 || n[3] > 1)) return m[0];
  }
  // `back` must end the word part so background/backdrop never match.
  const named = /(?:^|[\s,(])((?:--)?[\w-]*?(?:[Bb]ounce|[Ee]lastic|[Bb]ack)(?![a-z])[\w-]*)/.exec(value);
  if (named) return named[1];
  return null;
}

const keyframeBlocks = (ctx) => {
  const map = new Map();
  for (const r of ctx.css) {
    const at = r.atRules.find((a) => /^@(-webkit-)?keyframes\s/i.test(a));
    if (!at) continue;
    const name = at.replace(/^@(-webkit-)?keyframes\s+/i, '').trim();
    if (!map.has(name)) map.set(name, { name, line: r.line, decls: [] });
    map.get(name).decls.push(...r.decls);
  }
  return [...map.values()];
};

export default [
  {
    id: 'bounce-easing',
    name: 'Bounce or elastic easing',
    category: 'slop',
    severity: 'medium',
    ref: 'R-43',
    description: 'Overshooting easing curves (bounce, elastic, back) that make UI feel toy-like.',
    fix: 'Use an ease-out curve such as cubic-bezier(0.2, 0, 0, 1) with no overshoot.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (!EASING_PROPS.test(d.prop)) continue;
          const hit = overshoot(d.value);
          if (hit) out.push({ line: d.line, message: `Overshooting easing ${hit} on "${r.selector}"` });
        }
      }
      for (const cl of ctx.classLists) {
        const b = allBases(cl.value).find((x) => x === 'animate-bounce' || (/^ease-\[/.test(x) && overshoot(x.replace(/_/g, ' '))));
        if (b) out.push({ line: cl.line, message: `Bounce easing: ${b}`, snippet: cl.value });
      }
      const gsap = /\bease\s*:\s*['"]((?:back|elastic|bounce)(?:\.\w+)?(?:\([^)]*\))?)['"]/g;
      let m;
      while ((m = gsap.exec(ctx.masked))) out.push({ line: ctx.lineAt(m.index), message: `Overshooting easing "${m[1]}"` });
      return out;
    },
  },
  {
    id: 'layout-animation',
    name: 'Animating layout properties',
    category: 'quality',
    severity: 'low',
    ref: 'R-43',
    description: 'Transitions or keyframes on width, height, top, left, margin, or padding force layout every frame.',
    fix: 'Animate transform and opacity instead.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const inKeyframes = r.atRules.some((a) => /keyframes/i.test(a));
        for (const d of r.decls) {
          if (inKeyframes && LAYOUT_PROPS.test(d.prop)) {
            out.push({ line: d.line, message: `Keyframes animate ${d.prop} (${r.atRules.find((a) => /keyframes/i.test(a))})` });
            break;
          }
          if (d.prop === 'transition' || d.prop === 'transition-property') {
            const props = cleanValue(d.value).split(',').map((p) => p.trim().split(/\s+/)[0]);
            const bad = props.find((p) => LAYOUT_PROPS.test(p));
            if (bad) out.push({ line: d.line, message: `Transition on ${bad} in "${r.selector}"` });
          }
        }
      }
      for (const cl of ctx.classLists) {
        const b = allBases(cl.value).find((x) => /^transition-\[(width|height|top|left|right|bottom|margin|padding)/.test(x));
        if (b) out.push({ line: cl.line, message: `Layout transition: ${b}`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'no-reduced-motion',
    name: 'No reduced-motion fallback',
    category: 'a11y',
    severity: 'low',
    ref: 'R-43',
    description: 'Keyframe or infinite animations with no prefers-reduced-motion handling in the file.',
    fix: 'Wrap the animation in @media (prefers-reduced-motion: no-preference), or disable it under reduce.',
    check(ctx) {
      if (/prefers-reduced-motion|motion-reduce:|motion-safe:|useReducedMotion|MotionConfig/.test(ctx.masked)) return [];
      const kf = /@(-webkit-)?keyframes\s+([\w-]+)/.exec(ctx.masked);
      if (kf) return [{ line: ctx.lineAt(kf.index), message: `@keyframes ${kf[2]} with no prefers-reduced-motion handling in this file` }];
      for (const r of ctx.css) {
        const d = r.decls.find((x) => /^animation(-iteration-count)?$/.test(x.prop) && /\binfinite\b/.test(x.value));
        if (d) return [{ line: d.line, message: `Infinite animation on "${r.selector}" with no prefers-reduced-motion handling` }];
      }
      return [];
    },
  },
  {
    id: 'marquee',
    name: 'Marquee scroller',
    category: 'slop',
    severity: 'medium',
    ref: 'R-43',
    description: 'An endlessly scrolling logo or text ticker.',
    fix: 'Show the items in a static row or grid people can actually read.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) if (t.name === 'marquee') out.push({ line: t.line, message: '<marquee> element' });
      for (const k of keyframeBlocks(ctx)) {
        if (!/marquee|ticker|scroll|loop|slide-infinite|infinite-scroll/i.test(k.name)) continue;
        if (k.decls.some((d) => /transform/.test(d.prop) && /translate(x|3d)?\(\s*-?\d/i.test(d.value))) out.push({ line: k.line, message: `Marquee keyframes "${k.name}" translating content endlessly` });
      }
      for (const cl of ctx.classLists) {
        const b = allBases(cl.value).find((x) => /^animate-(marquee|ticker|scroll|infinite-scroll|loop-scroll)/.test(x));
        if (b) out.push({ line: cl.line, message: `Marquee animation: ${b}`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'pulsing-dot',
    name: 'Pulsing status dot',
    category: 'slop',
    severity: 'low',
    ref: 'R-43',
    description: 'A tiny dot with animate-ping or animate-pulse, the fake "live" indicator.',
    fix: 'Show a static dot, or real state text such as "Updated 2 min ago".',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const all = allBases(t.classes);
        const anim = all.find((b) => b === 'animate-ping' || b === 'animate-pulse');
        if (!anim) continue;
        const b = restBases(t.classes);
        const { w, h } = sizePx(b);
        if (b.includes('rounded-full') && w && h && w <= 12 && h <= 12) out.push({ line: t.classLine, message: `Pulsing dot: ${anim} on a ${w}px circle`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'fake-cursor',
    name: 'Fake blinking cursor',
    category: 'slop',
    severity: 'low',
    ref: 'R-43',
    description: 'A blinking caret faked with keyframes or a "|" span, the typewriter-hero tell.',
    fix: 'Show the full text at rest; drop the faux terminal effect.',
    check(ctx) {
      const out = [];
      for (const k of keyframeBlocks(ctx)) {
        if (/blink|caret|cursor/i.test(k.name) && k.decls.some((d) => /^(opacity|border(-\w+)*|visibility|background(-color)?)$/.test(d.prop))) {
          out.push({ line: k.line, message: `Blinking cursor keyframes "${k.name}"` });
        }
      }
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const anim = splitClasses(t.classes).find((c) => /^animate-(pulse|blink|caret|cursor|\[blink)/.test(c.base));
        if (anim && /^[|▍▌█_▏]$/.test(textOf(ctx, t.index))) out.push({ line: t.line, message: `Fake cursor "${textOf(ctx, t.index)}" with ${anim.base}`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'image-hover-zoom',
    name: 'Image zoom on hover',
    category: 'slop',
    severity: 'low',
    ref: 'R-43',
    description: 'Images that scale or rotate on hover, a stock template effect.',
    fix: 'Keep images still; signal interactivity on the card or link instead.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        if (!/:hover/.test(r.fullSelector) || !subjects(r.fullSelector).includes('img')) continue;
        const d = r.decls.find((x) => /^(transform|scale|rotate)$/.test(x.prop) && /scale|rotate|^\d/.test(x.value));
        if (d) out.push({ line: d.line, message: `Image ${cleanValue(d.value)} on hover in "${r.selector}"` });
      }
      for (const t of openTags(ctx)) {
        if (!(t.rawName === 'img' || t.rawName === 'Image') || !t.classes) continue;
        const z = splitClasses(t.classes).find((c) => c.variants.some((v) => /^(group-)?hover$/.test(v)) && /^-?(scale|rotate)-/.test(c.base));
        if (z) out.push({ line: t.classLine, message: `Image ${z.raw} on <${t.rawName}>`, snippet: t.classes });
      }
      return out;
    },
  },
];
