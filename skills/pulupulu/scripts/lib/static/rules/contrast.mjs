import { contrastRatio, isChromatic, isGrayish, NEUTRAL_FAMILIES, parseColor, toHsl } from '../../shared/color.mjs';
import { ancestors, cleanValue, colorsFor, cssPx, darkBases, isIconTag, openTags, restBases, textSizePx } from './_util.mjs';

const TEXTY = new Set(['p', 'span', 'a', 'button', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'small', 'strong', 'em', 'b', 'td', 'th', 'dt', 'dd', 'blockquote', 'figcaption', 'caption', 'summary', 'legend', 'q', 'cite']);
const BG_STOP = /^(bg-(gradient-to-|linear-|radial|conic|\[url)|bg-cover|bg-contain|backdrop-)/;
const BG_NON_COLOR = /^bg-(transparent|clip-|origin-|repeat|no-repeat|fixed|local|scroll|center|top|bottom|left|right|auto|blend-|none|opacity-|size-|position-|attachment-)/;

// One unambiguous color for a prefix, or null when none/ambiguous.
function single(bases, prefix) {
  const cs = colorsFor(bases, prefix);
  const uniq = [...new Set(cs.map((c) => c.token))];
  return uniq.length === 1 ? cs[cs.length - 1] : null;
}

const basesFor = (tag, mode) => (mode === 'dark' ? darkBases(tag.classes) : restBases(tag.classes));

function inlineBackground(tag) {
  return (tag.style || []).some((d) => /^background/.test(d.prop));
}

// Nearest background on the element or its ancestors in this file.
function findBg(ctx, tag, mode) {
  for (const t of [tag, ...ancestors(ctx, tag.index)]) {
    if (inlineBackground(t)) return null;
    const rest = restBases(t.classes);
    if (rest.some((b) => BG_STOP.test(b))) return null;
    const modeBases = basesFor(t, mode);
    const own = colorsFor(modeBases, 'bg');
    if (own.length) return new Set(own.map((c) => c.token)).size === 1 ? { ...own[own.length - 1], tag: t } : null;
    // A custom color (bg-primary, bg-brand-500) hides whatever is behind it.
    if (modeBases.some((b) => /^bg-/.test(b) && !BG_NON_COLOR.test(b))) return null;
    // In dark mode a light-only background means the dark surface is set elsewhere.
    if (mode === 'dark' && rest.some((b) => /^bg-/.test(b) && !BG_NON_COLOR.test(b))) return null;
  }
  return null;
}

function isLarge(bases) {
  const px = textSizePx(bases) || 16;
  const bold = bases.some((b) => /^font-(bold|extrabold|black)$/.test(b));
  return px >= 24 || (bold && px >= 18.66);
}

const hasDirectText = (ctx, tag) => ctx.texts.some((x) => x.tagIndex === tag.index && !x.attr);

function cssVars(ctx) {
  const seen = new Map();
  for (const r of ctx.css) {
    for (const d of r.decls) {
      if (!d.prop.startsWith('--')) continue;
      seen.set(d.prop, seen.has(d.prop) ? null : d.value);
    }
  }
  return seen;
}

function resolveCss(value, vars, allowShorthand) {
  let v = cleanValue(value);
  const m = /^var\((--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
  if (m) v = vars.get(m[1]) || m[2] || '';
  if (!v || /gradient|url\(/i.test(v)) return null;
  const c = parseColor(v);
  if (c || !allowShorthand) return c;
  const last = v.split(/\s+/).pop();
  return parseColor(last);
}

function cssPair(rule, vars) {
  const color = rule.decls.filter((d) => d.prop === 'color').pop();
  const bg = rule.decls.filter((d) => d.prop === 'background-color' || d.prop === 'background').pop();
  if (!color || !bg) return null;
  const fg = resolveCss(color.value, vars, false);
  const bc = resolveCss(bg.value, vars, bg.prop === 'background');
  if (!fg || !bc || bc.a < 0.9) return null;
  const size = rule.decls.find((d) => d.prop === 'font-size');
  const weight = rule.decls.find((d) => d.prop === 'font-weight');
  const px = size ? cssPx(cleanValue(size.value)) || 16 : 16;
  const bold = weight && /bold|[7-9]00/.test(weight.value);
  return { fg, bg: bc, line: color.line, large: px >= 24 || (bold && px >= 18.66), fgText: cleanValue(color.value), bgText: cleanValue(bg.value) };
}

const fmt = (n) => (Math.floor(n * 100) / 100).toFixed(2);

export default [
  {
    id: 'gray-on-color',
    name: 'Gray text on a colored surface',
    category: 'quality',
    severity: 'medium',
    ref: 'R-44',
    description: 'Neutral gray text on a saturated background looks dirty and usually fails contrast.',
    fix: 'Use white, or a light tint of the background hue, for text on colored surfaces.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        for (const mode of ['light', 'dark']) {
          const bases = basesFor(t, mode);
          const text = single(bases, 'text');
          const bg = single(bases, 'bg');
          if (!text || !bg || !text.family || !NEUTRAL_FAMILIES.has(text.family) || text.shade < 300 || text.shade > 600) continue;
          const coloredBg = bg.family ? !NEUTRAL_FAMILIES.has(bg.family) && bg.shade >= 500 && bg.family !== 'white' && bg.family !== 'black' : isChromatic(bg.color);
          if (!coloredBg || bg.color.a < 0.9) continue;
          const pre = mode === 'dark' ? 'dark mode: ' : '';
          out.push({ line: t.classLine, message: `${pre}gray text on a colored surface: ${text.token} on ${bg.token}`, snippet: t.classes });
        }
      }
      for (const r of ctx.css) {
        const p = cssPair(r, cssVars(ctx));
        if (!p || !isChromatic(p.bg) || !isGrayish(p.fg)) continue;
        const l = toHsl(p.fg).l;
        if (l > 0.3 && l < 0.8) out.push({ line: p.line, message: `Gray text ${p.fgText} on colored background ${p.bgText} in "${r.selector}"` });
      }
      return out;
    },
  },
  {
    id: 'low-contrast',
    name: 'Low text contrast',
    category: 'a11y',
    severity: 'high',
    ref: 'R-25',
    description: 'Text and background colors below WCAG AA (4.5:1, or 3:1 for large text).',
    fix: 'Darken the text or lighten the background until the pair reaches 4.5:1 (check with `pulupulu contrast`).',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!t.classes || isIconTag(t, ctx)) continue;
        for (const mode of ['light', 'dark']) {
          const bases = basesFor(t, mode);
          const text = single(bases, 'text');
          if (!text) continue;
          const bg = findBg(ctx, t, mode);
          if (!bg || bg.color.a < 0.9) continue;
          if (bg.tag !== t && !(TEXTY.has(t.name) || hasDirectText(ctx, t))) continue;
          const large = isLarge(restBases(t.classes));
          const need = large ? 3 : 4.5;
          const ratio = contrastRatio(text.color, bg.color);
          if (ratio == null || ratio >= need) continue;
          const pre = mode === 'dark' ? 'dark mode: ' : '';
          const on = bg.tag === t ? bg.token : `${bg.token} (from <${bg.tag.rawName}>)`;
          out.push({ line: t.classLine, message: `${pre}Low contrast ${fmt(ratio)}:1 on <${t.rawName}>: ${text.token} on ${on} (needs ${need}:1)`, snippet: t.classes });
        }
      }
      const vars = cssVars(ctx);
      for (const r of ctx.css) {
        const p = cssPair(r, vars);
        if (!p) continue;
        const need = p.large ? 3 : 4.5;
        const ratio = contrastRatio(p.fg, p.bg);
        if (ratio != null && ratio < need) out.push({ line: p.line, message: `Low contrast ${fmt(ratio)}:1 in "${r.selector}": ${p.fgText} on ${p.bgText} (needs ${need}:1)` });
      }
      return out;
    },
  },
];
