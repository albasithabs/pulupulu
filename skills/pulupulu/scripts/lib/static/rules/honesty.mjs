// URL-based tells. They match the comment-masked source, so a URL in a
// data array or a src attribute counts, one in a comment does not.

function urlHits(ctx, re, label) {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(ctx.masked))) out.push({ line: ctx.lineAt(m.index), message: `${label}: ${m[0]}` });
  return out;
}

const PEOPLE_RE = /\b(?:i\.)?pravatar\.cc\b[^\s"'`)]*|\brandomuser\.me\b[^\s"'`)]*|\bthispersondoesnotexist\.com\b|\bxsgames\.co\/randomusers\b[^\s"'`)]*|\buifaces\.(?:co|com)\b[^\s"'`)]*/gi;
const PLACEHOLDER_IMG_RE = /\b(?:via\.placeholder\.com|placehold\.co|placehold\.it|dummyimage\.com|placekitten\.com|picsum\.photos)\b[^\s"'`)]*/gi;
const STOCK_RE = /[^\s"'`(]*(?<![a-z])(?:undraw|storyset|humaaans|blush\.design|open-peeps|openpeeps|drawkit)(?![a-z])[^\s"'`)]*/gi;

export default [
  {
    id: 'placeholder-people',
    name: 'Placeholder people',
    category: 'honesty',
    severity: 'high',
    ref: 'R-18',
    description: 'Random stock faces presented as real users or team members.',
    fix: 'Use real, consented photos, or drop the face and keep the name and role.',
    check: (ctx) => urlHits(ctx, PEOPLE_RE, 'Fake person photo from a random-face service'),
  },
  {
    id: 'placeholder-image',
    name: 'Placeholder image service',
    category: 'honesty',
    severity: 'low',
    ref: 'R-23',
    description: 'A placeholder image service left in markup.',
    fix: 'Ship the real image, or a sized empty frame until it exists.',
    check: (ctx) => urlHits(ctx, PLACEHOLDER_IMG_RE, 'Placeholder image'),
  },
  {
    id: 'stock-illustration',
    name: 'Stock illustration kit',
    category: 'slop',
    severity: 'medium',
    ref: 'R-22',
    description: 'Generic illustration kits (unDraw, Storyset, Humaaans) recognizable on sight.',
    fix: 'Use product screenshots, real photos, or an illustration made for this brand.',
    check: (ctx) => urlHits(ctx, STOCK_RE, 'Stock illustration'),
  },
];
