import { parseColor, tailwindColor } from '../../shared/color.mjs';

export { textOf, isDescendant, ancestors } from '../extract.mjs';

const RESPONSIVE = /^(sm|md|lg|xl|2xl|3xl|min-\[.*\]|max-\[.*\]|max-(sm|md|lg|xl|2xl))$/;

// 'md:hover:!bg-blue-600/50' -> { variants: ['md','hover'], base: 'bg-blue-600/50' }
export function parseClass(token) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of token) {
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ':' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  let base = cur.replace(/^!|!$/g, '');
  return { variants: parts, base, raw: token };
}

export function splitClasses(value) {
  return String(value || '').split(/\s+/).filter((t) => t && /^[!\w[\-@.:/#%()]/.test(t)).map(parseClass);
}

// Classes that apply at rest in the light theme: no variant, or only breakpoints.
export function restBases(value) {
  return splitClasses(value).filter((c) => c.variants.every((v) => RESPONSIVE.test(v))).map((c) => c.base);
}

export function darkBases(value) {
  const all = splitClasses(value);
  const dark = all.filter((c) => c.variants.includes('dark') && c.variants.every((v) => v === 'dark' || RESPONSIVE.test(v)));
  return dark.map((c) => c.base);
}

// Every base, whatever its variant; used for presence checks like `bg-clip-text`.
export function allBases(value) {
  return splitClasses(value).map((c) => c.base);
}

export const has = (bases, re) => bases.some((b) => (typeof re === 'string' ? b === re : re.test(b)));

// Resolves `text-blue-600`, `bg-[#fff]`, `border-l-rose-500/40` for a prefix.
export function colorFrom(base, prefix) {
  if (!base.startsWith(prefix + '-')) return null;
  return tailwindColor(base.slice(prefix.length + 1));
}

// All resolvable colors for a prefix in a base list.
export function colorsFor(bases, prefix) {
  const out = [];
  for (const b of bases) {
    const c = colorFrom(b, prefix);
    if (c) out.push({ ...c, token: b });
  }
  return out;
}

const SPACING_PX = (n) => n * 4;
// `w-3` -> 12, `size-[10px]` -> 10, `h-2.5` -> 10.
export function sizePx(bases, props = ['w', 'h', 'size']) {
  const out = {};
  for (const b of bases) {
    const m = /^(w|h|size|min-w|min-h)-(\d+(?:\.\d+)?|\[[^\]]+\])$/.exec(b);
    if (!m || !props.includes(m[1])) continue;
    const v = m[2].startsWith('[') ? cssPx(m[2].slice(1, -1)) : SPACING_PX(Number(m[2]));
    if (v != null) out[m[1]] = v;
  }
  if (out.size != null) out.w = out.h = out.size;
  return out;
}

export const TEXT_SIZE_PX = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96, '9xl': 128 };

export function textSizePx(bases) {
  let px = null;
  for (const b of bases) {
    const m = /^text-(xs|sm|base|lg|xl|[2-9]xl)(?:\/.+)?$/.exec(b);
    if (m) px = TEXT_SIZE_PX[m[1]];
    const a = /^text-\[(\d*\.?\d+(?:px|rem|em))\]$/.exec(b);
    if (a) px = cssPx(a[1]);
  }
  return px;
}

export function cssPx(value) {
  const m = /^\s*(-?\d*\.?\d+)(px|rem|em|pt)?\s*$/.exec(String(value));
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!m[2]) return n === 0 ? 0 : null;
  return m[2] === 'px' ? n : m[2] === 'pt' ? (n * 4) / 3 : n * 16;
}

export function declsOf(rule) {
  const map = {};
  for (const d of rule.decls) map[d.prop] = d;
  return map;
}

export const cleanValue = (v) => String(v || '').replace(/\s*!important\s*$/i, '').trim();

// Colors mentioned anywhere in a CSS value (hex, rgb/hsl/oklch functions, a few names).
export function colorsInValue(value) {
  const out = [];
  const re = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch)\([^()]*\)|\b(?:transparent|white|black|red|blue|purple|violet|indigo|fuchsia|magenta|cyan|pink|orange|teal|green|yellow)\b/gi;
  let m;
  while ((m = re.exec(value))) {
    const c = parseColor(m[0]);
    if (c) out.push({ color: c, text: m[0] });
  }
  return out;
}

export const openTags = (ctx) => ctx.tags.filter((t) => !t.close);

export const HEADING_RE = /^h[1-6]$/;

export const ICON_LIB = /^(lucide-react|lucide-vue-next|lucide-svelte|@lucide\/[\w-]+|lucide-preact|@heroicons\/[\w/-]+|react-icons\/\w+|@phosphor-icons\/[\w-]+|phosphor-react|@tabler\/icons(-react|-vue)?|@radix-ui\/react-icons|react-feather|@iconify\/react)$/;

// Component names imported from an icon library in this file.
export function iconImports(ctx) {
  if (ctx._iconImports) return ctx._iconImports;
  const names = new Set();
  for (const m of ctx.masked.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    if (!ICON_LIB.test(m[2])) continue;
    for (const part of m[1].split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop().trim();
      if (local) names.add(local);
    }
  }
  ctx._iconImports = names;
  return names;
}

// Lucide/Heroicons-style components count as icons.
export const isIconTag = (t, ctx) => t.name === 'svg' || t.name === 'i' || /icon$/i.test(t.rawName) || /^(Lucide|Hero|Fa|Md|Io|Ri|Bi|Tb|Fi|Hi)[A-Z]/.test(t.rawName) || (t.name === 'span' && /material-(icons|symbols)/.test(t.classes || '')) || (!!ctx && iconImports(ctx).has(t.rawName));

export function snippetOf(ctx, line) {
  return (ctx.lines[line - 1] || '').trim().slice(0, 200);
}
