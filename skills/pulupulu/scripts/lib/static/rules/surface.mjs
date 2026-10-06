import { allBases, cleanValue, splitClasses } from './_util.mjs';

const BG_PROPS = /^(background|background-image)$/;
const STRIPE_OK = /progress|skeleton|loading|striped|hatch|disabled/i;

function gridLike(r) {
  const bg = r.decls.find((d) => BG_PROPS.test(d.prop) && /gradient\(/i.test(d.value));
  if (!bg) return null;
  const size = r.decls.find((d) => d.prop === 'background-size' && /\d+(\.\d+)?px/.test(d.value));
  if (!size) return null;
  const lines = (bg.value.match(/linear-gradient\(/gi) || []).length;
  if (lines >= 2 && /\b1px\b/.test(bg.value)) return { d: bg, kind: 'line grid' };
  if (/radial-gradient\(/i.test(bg.value)) {
    const px = Math.max(...(size.value.match(/\d+(\.\d+)?(?=px)/g) || ['0']).map(Number));
    if (px > 0 && px <= 64) return { d: bg, kind: 'dot grid' };
  }
  return null;
}

export default [
  {
    id: 'glass-overuse',
    name: 'Glass effect overuse',
    category: 'slop',
    severity: 'medium',
    ref: 'R-10',
    description: 'backdrop-filter blur on more than two surfaces in one file.',
    fix: 'Keep blur for one overlay (a sticky header or modal) and use solid surfaces elsewhere.',
    check(ctx) {
      const uses = [];
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (/^(-webkit-)?backdrop-filter$/.test(d.prop) && /blur\(/.test(d.value) && !/blur\(0/.test(d.value)) uses.push({ line: d.line, what: `backdrop-filter on "${r.selector}"` });
        }
      }
      for (const cl of ctx.classLists) {
        const b = splitClasses(cl.value).find((c) => /^backdrop-blur(-|$)/.test(c.base) && c.base !== 'backdrop-blur-none');
        if (b) uses.push({ line: cl.line, what: b.raw, snippet: cl.value });
      }
      if (uses.length <= 2) return [];
      uses.sort((a, b) => a.line - b.line);
      const third = uses[2];
      return [{ line: third.line, message: `Backdrop blur used ${uses.length} times in this file (latest: ${third.what})`, snippet: third.snippet }];
    },
  },
  {
    id: 'grid-background',
    name: 'Grid background',
    category: 'slop',
    severity: 'medium',
    ref: 'R-07',
    description: 'Decorative line-grid or dot-grid backgrounds.',
    fix: 'Remove the grid. Use spacing and real content to structure the section.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const g = gridLike(r);
        if (g) out.push({ line: g.d.line, message: `Decorative ${g.kind} background on ${r.inline ? r.selector : `"${r.selector}"`}` });
      }
      for (const cl of ctx.classLists) {
        const bases = allBases(cl.value);
        const util = bases.find((b) => /^bg-(grid|dot|dots)(-|$)/.test(b));
        const arb = bases.find((b) => /^bg-\[(linear|radial)-gradient\(.*1px/.test(b));
        const sized = bases.some((b) => /^bg-\[(size:|length:)?\d+px_\d+px\]$/.test(b) || /^bg-size-/.test(b));
        if (util) out.push({ line: cl.line, message: `Decorative grid background: ${util}`, snippet: cl.value });
        else if (arb && sized) out.push({ line: cl.line, message: 'Decorative grid background drawn with 1px gradients', snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'repeating-stripes',
    name: 'Repeating stripes',
    category: 'slop',
    severity: 'low',
    ref: 'R-07',
    description: 'repeating-linear-gradient stripes used as surface decoration.',
    fix: 'Use a flat surface; keep stripes for meaning (progress, disabled, hazard).',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        if (STRIPE_OK.test(r.fullSelector)) continue;
        const d = r.decls.find((x) => BG_PROPS.test(x.prop) && /repeating-linear-gradient\(/i.test(x.value));
        if (d) out.push({ line: d.line, message: `Decorative stripes on ${r.inline ? r.selector : `"${r.selector}"`}: ${cleanValue(d.value).slice(0, 60)}` });
      }
      for (const cl of ctx.classLists) {
        if (STRIPE_OK.test(cl.value)) continue;
        if (allBases(cl.value).some((b) => /^bg-\[repeating-linear-gradient/.test(b))) out.push({ line: cl.line, message: 'Decorative stripes: bg-[repeating-linear-gradient(...)]', snippet: cl.value });
      }
      return out;
    },
  },
];
