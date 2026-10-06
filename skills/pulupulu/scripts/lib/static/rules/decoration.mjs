import { isChromatic, luminance, NEUTRAL_FAMILIES } from '../../shared/color.mjs';
import { cleanValue, colorFrom, colorsInValue, cssPx, openTags, restBases, textOf, textSizePx } from './_util.mjs';
import { parseShadow, splitTop } from './color.mjs';

const SMALL_TEXT = (bases) => {
  const px = textSizePx(bases);
  return px != null && px <= 14;
};
const nextTag = (ctx, t) => (t.nextSibling >= 0 ? ctx.tags[t.nextSibling] : null);
const isHeadingUpTo = (t, max) => !!t && /^h[1-6]$/.test(t.name) && Number(t.name[1]) <= max;

const BADGE_WORDS = new Set(['ai powered', 'ai-powered', 'beta', 'new', 'baru', 'new!']);

// A colored border: chromatic family, or a chromatic arbitrary value.
function chromaticBorder(bases, side) {
  for (const b of bases) {
    const c = colorFrom(b, `border-${side}`) || colorFrom(b, 'border');
    if (!c) continue;
    if (c.family ? !NEUTRAL_FAMILIES.has(c.family) && c.family !== 'white' && c.family !== 'black' : isChromatic(c.color)) return b;
  }
  return null;
}

function stripeWidth(bases, side) {
  for (const b of bases) {
    const m = new RegExp(`^border-${side}-(\\d+|\\[(\\d+)px\\])$`).exec(b);
    if (m) {
      const w = m[2] ? Number(m[2]) : Number(m[1]);
      if (w >= 2) return b;
    }
  }
  return null;
}

function cssBorderStripe(r) {
  for (const d of r.decls) {
    const side = /^border-(left|right|inline-start|inline-end)$/.exec(d.prop);
    if (!side) continue;
    const w = cleanValue(d.value).split(/\s+/).map(cssPx).find((n) => n != null);
    const color = colorsInValue(d.value).find((c) => isChromatic(c.color));
    if (w >= 2 && color) return { d, text: `${d.prop}: ${cleanValue(d.value)}` };
  }
  for (const side of ['left', 'right']) {
    const w = r.decls.find((d) => d.prop === `border-${side}-width`);
    const c = r.decls.find((d) => d.prop === `border-${side}-color`);
    if (w && c && cssPx(cleanValue(w.value)) >= 2 && colorsInValue(c.value).some((x) => isChromatic(x.color))) return { d: w, text: `border-${side} ${cleanValue(w.value)} ${cleanValue(c.value)}` };
  }
  return null;
}

export default [
  {
    id: 'kicker-label',
    name: 'Kicker label above a heading',
    category: 'slop',
    severity: 'medium',
    ref: 'R-39',
    description: 'A small uppercase or tracked label sitting right above a heading.',
    fix: 'Delete the kicker; let the heading say it. Put category info in breadcrumbs or metadata if it matters.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes || /^h[1-6]$/.test(t.name) || t.name === 'a' || t.name === 'button') continue;
        const bases = restBases(t.classes);
        if (bases.includes('rounded-full')) continue;
        const labelish = /\b(eyebrow|kicker|overline|pretitle|subtitle-label)\b/.test(t.classes) || (bases.includes('uppercase') && (SMALL_TEXT(bases) || bases.some((b) => /^tracking-(wide|wider|widest|\[)/.test(b))));
        if (!labelish || !isHeadingUpTo(nextTag(ctx, t), 3)) continue;
        const text = textOf(ctx, t.index);
        if (text.length > 40) continue;
        out.push({ line: t.line, message: `Kicker label${text ? ` "${text}"` : ''} above <${nextTag(ctx, t).name}>`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'eyebrow-pill',
    name: 'Eyebrow pill above a heading',
    category: 'slop',
    severity: 'medium',
    ref: 'R-09',
    description: 'A rounded pill badge stacked right above the hero heading.',
    fix: 'Remove the pill. If the news matters, say it in the heading or a plain line of body text.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const bases = restBases(t.classes);
        if (!bases.includes('rounded-full') || !SMALL_TEXT(bases)) continue;
        if (!bases.some((b) => b === 'border' || /^border-/.test(b) || /^bg-/.test(b))) continue;
        const next = nextTag(ctx, t);
        if (!isHeadingUpTo(next, 2)) continue;
        const text = textOf(ctx, t.index);
        out.push({ line: t.line, message: `Eyebrow pill${text ? ` "${text.slice(0, 40)}"` : ''} above <${next.name}>`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'ai-badge',
    name: 'Filler badge',
    category: 'slop',
    severity: 'medium',
    ref: 'R-09',
    description: 'A pill that only says "AI Powered", "Beta", or "New".',
    fix: 'Drop the badge, or replace it with the specific fact (what changed, since when).',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes || t.children.length > 1) continue;
        const bases = restBases(t.classes);
        const pill = /\b(badge|pill|chip|tag)\b/.test(t.classes) || (bases.some((b) => /^rounded/.test(b)) && bases.some((b) => /^(bg-|border)/.test(b)) && SMALL_TEXT(bases));
        if (!pill) continue;
        const text = textOf(ctx, t.index);
        const norm = text.replace(/[\p{Extended_Pictographic}️]/gu, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (BADGE_WORDS.has(norm)) out.push({ line: t.line, message: `Filler badge "${text}"`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'section-numbers',
    name: 'Section number labels',
    category: 'slop',
    severity: 'low',
    ref: 'R-39',
    description: 'Decorative 01 / 02 / 03 labels numbering sections or features.',
    fix: 'Remove the numbers unless order matters; if it does, use an ordered list.',
    check(ctx) {
      const hits = ctx.texts.filter((t) => !t.attr && /^\/?0\d\.?$/.test(t.text) && !['td', 'option', 'time', 'code', 'th'].includes(t.parentTag));
      if (new Set(hits.map((h) => h.text.replace(/\D/g, ''))).size < 3) return [];
      return hits.map((h) => ({ line: h.line, message: `Section number label "${h.text}" (${hits.length} in file)` }));
    },
  },
  {
    id: 'side-stripe',
    name: 'Colored side stripe',
    category: 'slop',
    severity: 'medium',
    ref: 'R-40',
    description: 'A thick colored border on one side of a card or callout.',
    fix: 'Drop the stripe. Signal state with an icon, a heading, or a full tinted surface.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        if (/blockquote/i.test(r.fullSelector) || (r.inline && ctx.tags[r.tagIndex]?.name === 'blockquote')) continue;
        const hit = cssBorderStripe(r);
        if (hit) out.push({ line: hit.d.line, message: `Colored side stripe on ${r.inline ? r.selector : `"${r.selector}"`}: ${hit.text}` });
      }
      for (const t of openTags(ctx)) {
        if (!t.classes || t.name === 'blockquote') continue;
        const bases = restBases(t.classes);
        for (const side of ['l', 'r', 's', 'e']) {
          const w = stripeWidth(bases, side);
          const c = w && chromaticBorder(bases, side);
          if (c) {
            out.push({ line: t.classLine, message: `Colored side stripe on <${t.rawName}>: ${w} ${c}`, snippet: t.classes });
            break;
          }
        }
      }
      return out;
    },
  },
  {
    id: 'hairline-wide-shadow',
    name: 'Hairline border with a wide shadow',
    category: 'slop',
    severity: 'low',
    ref: 'R-40',
    description: 'A 1px border plus a large soft shadow on the same box: two edges fighting.',
    fix: 'Pick one edge: a border, or a tight shadow.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const border = r.decls.find((d) => (d.prop === 'border' && /(^|\s)1px\s/.test(d.value + ' ')) || (d.prop === 'border-width' && /^1px$/.test(cleanValue(d.value))));
        const shadow = r.decls.find((d) => d.prop === 'box-shadow' && splitTop(cleanValue(d.value)).map(parseShadow).some((l) => l && !l.inset && l.blur >= 24));
        if (border && shadow) out.push({ line: shadow.line, message: `1px border plus a wide shadow on "${r.selector}"` });
      }
      for (const t of openTags(ctx)) {
        const bases = restBases(t.classes);
        const shadow = bases.find((b) => b === 'shadow-xl' || b === 'shadow-2xl');
        if (shadow && bases.includes('border')) out.push({ line: t.classLine, message: `border plus ${shadow} on <${t.rawName}>`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'hard-offset-shadow',
    name: 'Hard offset shadow',
    category: 'slop',
    severity: 'low',
    ref: 'R-40',
    description: 'A zero-blur offset shadow (the neobrutalist sticker look) outside a neobrutalist design.',
    fix: 'Use a soft neutral shadow, or commit to the style across the whole system.',
    check(ctx) {
      const out = [];
      // Big offsets or light colors are shapes drawn with box-shadow (clouds, dots), not a sticker shadow.
      const hard = (l) => {
        if (!l || l.inset || l.blur !== 0 || l.spread !== 0) return false;
        const off = Math.max(Math.abs(l.x), Math.abs(l.y));
        return off >= 3 && off <= 16 && (!l.color || luminance(l.color) < 0.4);
      };
      for (const r of ctx.css) {
        const d = r.decls.find((x) => x.prop === 'box-shadow' && splitTop(cleanValue(x.value)).map(parseShadow).some(hard));
        if (d) out.push({ line: d.line, message: `Hard offset shadow on ${r.inline ? r.selector : `"${r.selector}"`}: ${cleanValue(d.value)}` });
      }
      for (const cl of ctx.classLists) {
        const b = restBases(cl.value).find((x) => {
          const m = /^shadow-\[(.+)\]$/.exec(x);
          return m && splitTop(m[1].replace(/_/g, ' ')).map(parseShadow).some(hard);
        });
        if (b) out.push({ line: cl.line, message: `Hard offset shadow: ${b}`, snippet: cl.value });
      }
      return out;
    },
  },
];
