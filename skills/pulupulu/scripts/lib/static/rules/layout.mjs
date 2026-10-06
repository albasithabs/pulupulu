import { ancestors, isDescendant, isIconTag, openTags, restBases, sizePx } from './_util.mjs';

const ROUNDED = /^rounded(-(sm|md|lg|xl|2xl|3xl|\[[^\]]+\]))?$/;
const PADDED = /^p[xy]?-(\d+(\.\d+)?|\[[^\]]+\])$/;

const CONTAINERS = new Set(['div', 'section', 'article', 'aside', 'li', 'a', 'figure', 'form', 'details', 'fieldset', 'header', 'footer', 'blockquote']);

function isCardLike(tag) {
  if (!CONTAINERS.has(tag.rawName)) return false;
  const b = restBases(tag.classes);
  if (!b.some((x) => ROUNDED.test(x))) return false;
  if (!b.some((x) => x === 'border' || /^shadow(-(sm|md|lg|xl|2xl))?$/.test(x))) return false;
  if (!b.some((x) => /^bg-/.test(x) && !/^bg-(transparent|none|gradient|clip|cover|center|no-repeat)/.test(x))) return false;
  return b.some((x) => {
    const m = PADDED.exec(x);
    return m && (m[1].startsWith('[') || Number(m[1]) >= 3);
  });
}

export default [
  {
    id: 'icon-tile-heading',
    name: 'Icon tile above a heading',
    category: 'slop',
    severity: 'low',
    ref: 'R-41',
    description: 'A small rounded square holding an icon, stacked above a feature heading.',
    fix: 'Put the icon inline with the heading, or drop it. Not every feature needs a tile.',
    check(ctx) {
      const out = [];
      const tags = openTags(ctx);
      for (const t of tags) {
        if (!t.classes || t.nextSibling < 0) continue;
        const next = ctx.tags[t.nextSibling];
        if (!/^h[34]$/.test(next.name)) continue;
        const b = restBases(t.classes);
        const { w, h } = sizePx(b);
        if (!w || w !== h || w < 32 || w > 56) continue;
        if (!b.some((x) => /^rounded/.test(x) && x !== 'rounded-full') || !b.some((x) => /^bg-/.test(x))) continue;
        const icon = tags.some((x) => x.index > t.index && x.index <= t.last && isIconTag(x, ctx) && isDescendant(ctx, x.index, t.index));
        if (icon) out.push({ line: t.line, message: `Icon tile (${w}px rounded square) stacked above <${next.name}>`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'nested-cards',
    name: 'Nested cards',
    category: 'quality',
    severity: 'low',
    ref: 'R-41',
    description: 'A bordered, rounded, padded card inside another card.',
    fix: 'Flatten the inner box: separate with spacing or a divider instead of another card.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes || !isCardLike(t)) continue;
        const outer = ancestors(ctx, t.index).find((a) => a.classes && isCardLike(a));
        if (outer) out.push({ line: t.line, message: `Card <${t.rawName}> nested inside card <${outer.rawName}> (line ${outer.line})`, snippet: t.classes });
      }
      return out;
    },
  },
];
