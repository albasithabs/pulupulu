import { isChromatic, parseColor, toHsl, NEUTRAL_FAMILIES } from '../../shared/color.mjs';
import { allBases, cleanValue, colorFrom, colorsInValue, cssPx, openTags, restBases, splitClasses } from './_util.mjs';

const GRADIENT_RE = /(repeating-)?(linear|radial|conic)-gradient\(/i;
const BG_PROPS = /^(background|background-image)$/;
const AI_FAMILIES = new Set(['purple', 'violet', 'indigo', 'fuchsia']);

export function splitTop(value, sep = ',') {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of String(value)) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim());
}

// Hue bucket for "is this the AI palette" questions.
function bucket(h) {
  if (h >= 245 && h <= 320) return 'purple';
  if (h > 320 && h <= 350) return 'pink';
  if (h >= 200 && h < 245) return 'blue';
  if (h >= 170 && h < 200) return 'cyan';
  return 'other';
}

function aiCombo(buckets) {
  const b = new Set(buckets);
  if (b.has('purple')) return 'purple/violet';
  if (b.has('blue') && b.has('cyan')) return 'blue-to-cyan';
  if (b.has('blue') && b.has('pink')) return 'blue-to-pink';
  if (b.has('cyan') && b.has('pink')) return 'cyan-to-pink';
  return null;
}

const familyBucket = (fam) => (AI_FAMILIES.has(fam) ? 'purple' : ['pink', 'rose'].includes(fam) ? 'pink' : ['blue', 'sky'].includes(fam) ? 'blue' : ['cyan', 'teal'].includes(fam) ? 'cyan' : 'other');

export function parseShadow(layer) {
  const colors = colorsInValue(layer);
  let rest = layer.replace(/inset/gi, ' ');
  for (const c of colors) rest = rest.replace(c.text, ' ');
  const nums = rest.trim().split(/\s+/).filter(Boolean).map((t) => cssPx(t));
  if (nums.length < 2 || nums.some((n) => n == null)) return null;
  const [x, y, blur = 0, spread = 0] = nums;
  return { x, y, blur, spread, color: colors.length ? colors[colors.length - 1].color : null, inset: /inset/i.test(layer) };
}

// Tailwind arbitrary shadows use underscores for spaces.
const arbShadow = (b) => {
  const m = /^shadow-\[(.+)\]$/.exec(b);
  return m ? splitTop(m[1].replace(/_/g, ' ')).map(parseShadow).filter(Boolean) : [];
};

// Each gradient function in a background value, so stacked single-color
// layers are not read as one multi-color gradient.
export function gradientLayers(value) {
  const out = [];
  const re = /(repeating-)?(linear|radial|conic)-gradient\(/gi;
  let m;
  while ((m = re.exec(value))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < value.length && depth > 0) {
      if (value[i] === '(') depth++;
      else if (value[i] === ')') depth--;
      i++;
    }
    out.push({ kind: m[2].toLowerCase(), repeating: !!m[1], body: value.slice(start, i - 1) });
    re.lastIndex = i;
  }
  return out;
}

// `#f00 0 7px, transparent 8px` draws a crisp dot, not a soft glow.
function hardStop(body) {
  for (const m of body.matchAll(/(\d+(?:\.\d+)?)(px|%)\s*,\s*transparent\s+(\d+(?:\.\d+)?)(px|%)/g)) {
    if (m[2] === m[4] && Number(m[3]) - Number(m[1]) <= 2) return true;
  }
  return false;
}

const isFocusSelector = (sel) => /:focus/.test(sel);

const chromaticFamily = (c) => !!c && !!c.family && !NEUTRAL_FAMILIES.has(c.family) && c.family !== 'black' && c.family !== 'white';

export default [
  {
    id: 'ai-gradient',
    name: 'AI palette gradient',
    category: 'slop',
    severity: 'medium',
    ref: 'R-01',
    description: 'Purple/violet/indigo gradients, or blue-to-cyan and blue-to-pink blends: the default generated-site palette.',
    fix: 'Use the brand color flat, or a subtle tonal shift within one hue.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (!BG_PROPS.test(d.prop) && d.prop !== 'border-image') continue;
          for (const layer of gradientLayers(d.value)) {
            if (layer.repeating) continue;
            const chroma = colorsInValue(layer.body).filter((c) => isChromatic(c.color) && c.color.a > 0.15);
            if (chroma.length < 2) continue;
            const combo = aiCombo(chroma.map((c) => bucket(toHsl(c.color).h)));
            if (combo) {
              out.push({ line: d.line, message: `${combo} gradient on "${r.selector}"`, snippet: `${d.prop}: ${d.value}` });
              break;
            }
          }
        }
      }
      for (const cl of ctx.classLists) {
        const bases = allBases(cl.value);
        const stops = bases.filter((b) => /^(from|via|to)-/.test(b));
        if (!stops.length || !bases.some((b) => /^bg-(gradient-to-|linear-|radial|conic)/.test(b))) continue;
        const buckets = [];
        for (const s of stops) {
          const c = colorFrom(s, s.split('-')[0]);
          if (!c) continue;
          if (c.family) buckets.push(familyBucket(c.family));
          else if (isChromatic(c.color)) buckets.push(bucket(toHsl(c.color).h));
        }
        const combo = aiCombo(buckets);
        if (combo) out.push({ line: cl.line, message: `${combo} gradient: ${stops.join(' ')}`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'gradient-text',
    name: 'Gradient text',
    category: 'slop',
    severity: 'medium',
    ref: 'R-01',
    description: 'Text filled with a gradient via background-clip: text.',
    fix: 'Use a solid color. Carry emphasis with weight, size, or placement.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const clip = r.decls.find((d) => /^(-webkit-)?background-clip$/.test(d.prop) && /\btext\b/.test(d.value));
        if (!clip) continue;
        const grad = r.decls.some((d) => BG_PROPS.test(d.prop) && GRADIENT_RE.test(d.value));
        const where = r.inline ? `<${r.selector.slice(1, -1)}>` : `"${r.selector}"`;
        if (grad) out.push({ line: clip.line, message: `Gradient text on ${where}: background-clip: text with a gradient` });
      }
      for (const cl of ctx.classLists) {
        const bases = allBases(cl.value);
        if (!bases.includes('bg-clip-text') || !bases.includes('text-transparent')) continue;
        if (!bases.some((b) => /^(bg-(gradient-to-|linear-|radial|conic)|from-)/.test(b))) continue;
        const where = cl.tag ? `<${ctx.tags[cl.tagIndex].rawName}>` : 'element';
        out.push({ line: cl.line, message: `Gradient text on ${where}: bg-clip-text + text-transparent`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'glow-orb',
    name: 'Glow orb',
    category: 'slop',
    severity: 'medium',
    ref: 'R-01',
    description: 'Blurred colored blobs or radial glows fading to transparent, used as decoration.',
    fix: 'Remove the orb. Let content, photography, or a flat surface carry the section.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (!BG_PROPS.test(d.prop) || !/radial-gradient\(/i.test(d.value) || /repeating-/i.test(d.value)) continue;
          // Dot-grid patterns are small tiles; those belong to grid-background.
          if (r.decls.some((x) => x.prop === 'background-size' && /\d+px/.test(x.value))) continue;
          for (const layer of gradientLayers(d.value)) {
            if (layer.kind !== 'radial' || layer.repeating || hardStop(layer.body)) continue;
            const cs = colorsInValue(layer.body);
            const fades = cs.some((c) => c.color.a === 0) || /transparent/i.test(layer.body);
            const glow = cs.find((c) => isChromatic(c.color) && c.color.a > 0);
            if (fades && glow) {
              out.push({ line: d.line, message: `Radial glow ${glow.text} fading to transparent on "${r.selector}"`, snippet: `${d.prop}: ${d.value}` });
              break;
            }
          }
        }
      }
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const bases = restBases(t.classes);
        if (!bases.includes('rounded-full')) continue;
        const blur = bases.find((b) => /^blur-(2xl|3xl)$/.test(b) || (/^blur-\[(\d+)px\]$/.test(b) && Number(/\d+/.exec(b)[0]) >= 40));
        if (!blur) continue;
        const bg = bases.map((b) => colorFrom(b, 'bg')).find((c) => chromaticFamily(c) && (c.color.a < 1 || bases.some((b) => /^opacity-/.test(b))));
        if (bg) out.push({ line: t.classLine, message: `Blurred glow orb: rounded-full ${blur} with a translucent colored background`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'dark-glow',
    name: 'Colored glow shadow',
    category: 'slop',
    severity: 'medium',
    ref: 'R-13',
    description: 'A zero-offset colored shadow used as a neon glow.',
    fix: 'Use a neutral shadow with a real offset for depth, or none.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        if (isFocusSelector(r.fullSelector)) continue;
        for (const d of r.decls) {
          let layers = [];
          if (d.prop === 'box-shadow' || d.prop === 'text-shadow') layers = splitTop(cleanValue(d.value)).map(parseShadow);
          else if (d.prop === 'filter') layers = [...d.value.matchAll(/drop-shadow\(((?:[^()]|\([^()]*\))*)\)/g)].map((m) => parseShadow(m[1]));
          const glow = layers.find((l) => l && !l.inset && l.x === 0 && l.y === 0 && l.blur >= 8 && l.color && isChromatic(l.color));
          if (glow) out.push({ line: d.line, message: `Colored glow (${d.prop}) on "${r.selector}"`, snippet: `${d.prop}: ${d.value}` });
        }
      }
      for (const cl of ctx.classLists) {
        const classes = splitClasses(cl.value).filter((c) => !c.variants.some((v) => /focus/.test(v)));
        for (const { base } of classes) {
          const colored = colorFrom(base, 'shadow');
          if (chromaticFamily(colored) && classes.some((c) => /^shadow(-(sm|md|lg|xl|2xl))?$/.test(c.base))) {
            out.push({ line: cl.line, message: `Colored glow shadow: ${base}`, snippet: cl.value });
            break;
          }
          const arb = arbShadow(base).find((l) => l.x === 0 && l.y === 0 && l.blur >= 8 && l.color && isChromatic(l.color));
          if (arb) {
            out.push({ line: cl.line, message: `Colored glow shadow: ${base}`, snippet: cl.value });
            break;
          }
        }
      }
      return out;
    },
  },
  {
    id: 'pure-black',
    name: 'Pure black surface',
    category: 'quality',
    severity: 'low',
    ref: 'R-44',
    description: 'Pure #000 as a page or section background, or as body text color.',
    fix: 'Use a tinted near-black (for example #0b0d10 or neutral-950) that fits the palette.',
    check(ctx) {
      const out = [];
      const SURFACE = /^(html|body|main|section|header|footer|:root)$/;
      const isBlack = (v) => {
        const c = parseColor(cleanValue(v));
        return c && c.a === 1 && c.r === 0 && c.g === 0 && c.b === 0;
      };
      for (const r of ctx.css) {
        if (r.atRules.some((a) => /print/.test(a))) continue;
        const subs = r.inline ? [ctx.tags[r.tagIndex]?.name] : String(r.fullSelector).split(',').map((s) => s.trim().toLowerCase());
        const surface = subs.some((s) => SURFACE.test(s || ''));
        const bodyText = subs.some((s) => /^(html|body|:root)$/.test(s || ''));
        for (const d of r.decls) {
          if (surface && /^background(-color)?$/.test(d.prop) && isBlack(d.value)) out.push({ line: d.line, message: `Pure black background on "${r.selector}"` });
          if (bodyText && d.prop === 'color' && isBlack(d.value)) out.push({ line: d.line, message: `Pure black body text on "${r.selector}"` });
        }
      }
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const bases = restBases(t.classes);
        const surface = SURFACE.test(t.name) || bases.some((b) => /^(min-)?h-screen$|^min-h-dvh$/.test(b));
        if (surface && bases.includes('bg-black')) out.push({ line: t.classLine, message: `bg-black on <${t.rawName}> page surface`, snippet: t.classes });
        if (/^(html|body)$/.test(t.name) && bases.includes('text-black')) out.push({ line: t.classLine, message: `text-black as body text on <${t.name}>`, snippet: t.classes });
      }
      return out;
    },
  },
];
