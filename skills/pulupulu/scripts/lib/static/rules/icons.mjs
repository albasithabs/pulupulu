import { ICON_LIB, isDescendant, openTags, textOf } from './_util.mjs';

const GENERIC = new Set(['sparkles', 'sparkle', 'wand', 'wand2', 'wandsparkles', 'magicwand', 'zap', 'bolt', 'rocket', 'rocketlaunch', 'bot', 'gem', 'diamond', 'stars', 'braincircuit', 'cpu', 'cpuchip', 'magic']);

function normalizeIcon(name) {
  return name
    .replace(/^(Lu|Hi2|Hi|Fa6|Fa|Md|Io5|Io|Ri|Bi|Tb|Fi|Bs|Pi|Gi|Icon)(?=[A-Z0-9])/, '')
    .replace(/(Icon|Outline|Solid|Fill|Filled|Bold|Duotone|Light|Thin|Regular|Mini|Micro)+$/, '')
    .toLowerCase();
}

const ARROW_TEXT = /(→|↗|->|⟶|›|»)\s*$/u;
const ARROW_ICON = /Arrow(Up)?Right|ArrowTopRight|ArrowLongRight|ArrowNarrowRight|ArrowForward|MoveRight/;
const EMOJI_START = /^(?![©®™])[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u;
const EMOJI_PARENTS = /^(h[1-6]|li|dt|summary|strong|b)$/;

const isControl = (t) => t.name === 'a' || t.name === 'button' || /(Button|Link)$/.test(t.rawName);

export default [
  {
    id: 'generic-icons',
    name: 'Generic AI icons',
    category: 'slop',
    severity: 'low',
    ref: 'R-04',
    description: 'Sparkles, wands, rockets, and bolts: the stock icons of generated landing pages.',
    fix: 'Use icons that show the actual feature, or no icon at all.',
    check(ctx) {
      const found = [];
      const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
      let m;
      while ((m = re.exec(ctx.masked))) {
        if (!ICON_LIB.test(m[2])) continue;
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/)[0].trim();
          if (name && GENERIC.has(normalizeIcon(name))) found.push({ name, line: ctx.lineAt(m.index) });
        }
      }
      for (const t of openTags(ctx)) {
        const ref = t.attrs['data-lucide'] || t.attrs['data-feather'] || t.attrs.icon;
        if (typeof ref !== 'string') continue;
        const name = ref.replace(/^[\w-]+:/, '').replace(/-/g, '');
        if (GENERIC.has(name.toLowerCase())) found.push({ name: ref, line: t.line });
      }
      const names = [...new Set(found.map((f) => f.name))];
      if (names.length < 2) return [];
      return [{ line: found[0].line, message: `Generic AI icons: ${names.join(', ')}` }];
    },
  },
  {
    id: 'arrow-everywhere',
    name: 'Arrow on every CTA',
    category: 'slop',
    severity: 'low',
    ref: 'R-08',
    description: 'Three or more buttons or links ending in an arrow.',
    fix: 'Keep an arrow only where it means "goes somewhere else"; drop the rest.',
    check(ctx) {
      const hits = [];
      const tags = openTags(ctx);
      for (const t of tags) {
        if (!isControl(t)) continue;
        const label = textOf(ctx, t.index);
        const icon = tags.find((x) => x.index > t.index && x.index <= t.last && ARROW_ICON.test(x.rawName) && isDescendant(ctx, x.index, t.index));
        if (ARROW_TEXT.test(label) || icon) hits.push({ t, label: icon ? `${label} <${icon.rawName}>`.trim() : label });
      }
      if (hits.length < 3) return [];
      return hits.map(({ t, label }) => ({ line: t.line, message: `Arrow CTA "${label.slice(0, 40)}" (${hits.length} in file)` }));
    },
  },
  {
    id: 'emoji-icons',
    name: 'Emoji as icons',
    category: 'slop',
    severity: 'low',
    ref: 'R-04',
    description: 'Emoji used as bullet or heading icons across a page.',
    fix: 'Use a consistent icon set, or plain text without decoration.',
    check(ctx) {
      const inIconSpot = (t) => {
        if (EMOJI_PARENTS.test(t.parentTag || '')) return true;
        const own = ctx.tags[t.tagIndex];
        const up = own && own.parent >= 0 ? ctx.tags[own.parent] : null;
        return own && own.name === 'span' && up && EMOJI_PARENTS.test(up.name);
      };
      const hits = ctx.texts.filter((t) => !t.attr && EMOJI_START.test(t.text) && inIconSpot(t));
      if (hits.length < 3) return [];
      return hits.map((h) => ({ line: h.line, message: `Emoji icon in <${h.parentTag}>: "${h.text.slice(0, 40)}" (${hits.length} in file)` }));
    },
  },
];
