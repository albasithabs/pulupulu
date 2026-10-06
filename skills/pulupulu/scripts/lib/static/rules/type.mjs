import { ancestors, cleanValue, cssPx, openTags, restBases, allBases, textSizePx, textOf } from './_util.mjs';

const OVERUSED = ['Inter', 'Roboto', 'Geist', 'Space Grotesk', 'Plus Jakarta Sans', 'Fraunces', 'DM Sans', 'Outfit', 'Poppins', 'Manrope', 'Sora', 'Instrument Sans', 'Instrument Serif'];
const OVERUSED_KEY = new Map(OVERUSED.map((f) => [f.toLowerCase().replace(/\s+/g, ''), f]));
const MONO_RE = /^(monospace|ui-monospace|sfmono-regular|sf mono|menlo|monaco|consolas|courier( new)?|jetbrains mono|fira (code|mono)|ibm plex mono|space mono|roboto mono|geist mono|source code pro|dm mono|ubuntu mono|cascadia (code|mono))$/i;

const unquote = (s) => s.trim().replace(/^['"]|['"]$/g, '').trim();
export const firstFamily = (value) => unquote(cleanValue(value).split(',')[0] || '');

function overused(name, ctx) {
  const key = name.toLowerCase().replace(/[\s_+-]+/g, '').replace(/variable$/, '');
  const hit = OVERUSED_KEY.get(key);
  if (!hit) return null;
  const allowed = (ctx.config?.allow?.fonts || []).map((f) => f.toLowerCase().replace(/\s+/g, ''));
  return allowed.includes(key) ? null : hit;
}

// The element a selector styles: `.prose p:first-child` -> 'p'.
export function subjects(selector) {
  return String(selector)
    .split(',')
    .map((s) => s.trim().split(/[\s>+~]+/).pop() || '')
    .map((s) => s.replace(/(::?[\w-]+(\([^)]*\))?|\.[\w-]+|#[\w-]+|\[[^\]]*\])/g, '').toLowerCase());
}

const LEGAL_RE = /\b(sup|sub|small|legal|fine-?print|footnote|disclaimer|copyright)\b/i;

function tagIsLegal(ctx, tag) {
  return ['sup', 'sub', 'small'].includes(tag.name) || ancestors(ctx, tag.index).some((a) => ['sup', 'sub', 'small'].includes(a.name)) || LEGAL_RE.test(tag.classes || '');
}

const ruleTag = (ctx, r) => (r.inline ? ctx.tags[r.tagIndex] : null);

function lineHeightRatio(decl, rule) {
  const v = cleanValue(decl.value);
  if (/^\d*\.?\d+$/.test(v)) return Number(v);
  if (/%$/.test(v)) return parseFloat(v) / 100;
  const fs = rule.decls.find((d) => d.prop === 'font-size');
  const lh = cssPx(v);
  const size = fs ? cssPx(cleanValue(fs.value)) : null;
  return lh != null && size ? lh / size : null;
}

function letterSpacingEm(value) {
  const v = cleanValue(value);
  const m = /^(-?\d*\.?\d+)(em|rem|px)?$/.exec(v);
  if (!m) return null;
  if (m[2] === 'px') return { px: Number(m[1]) };
  return { em: Number(m[1]) };
}

const TRACKING_ARB = /^tracking-\[(-?\d*\.?\d+)(em|rem|px)\]$/;

export default [
  {
    id: 'overused-font',
    name: 'Overused font',
    category: 'slop',
    severity: 'medium',
    ref: 'R-06',
    description: 'The primary typeface is one of the fonts every generated site uses.',
    fix: 'Pick a typeface that fits this brand, or add it to allow.fonts in .pulupulu.json if it is a deliberate brand choice.',
    check(ctx) {
      const out = [];
      const report = (name, line, where) => {
        const hit = overused(name, ctx);
        if (hit) out.push({ line, message: `Overused font "${hit}" ${where}` });
      };
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (d.prop === 'font-family' || /^--font(-(sans|serif|display|body|heading|base|primary))?$/.test(d.prop)) report(firstFamily(d.value), d.line, `as primary font-family on "${r.selector}"`);
        }
      }
      const gf = /fonts\.googleapis\.com\/css2?\?[^"'`)\s>]*/g;
      let m;
      while ((m = gf.exec(ctx.masked))) {
        for (const fam of m[0].matchAll(/family=([^:&;"']+)/g)) report(decodeURIComponent(fam[1].replace(/\+/g, ' ')), ctx.lineAt(m.index), 'loaded from Google Fonts');
      }
      const nf = /import\s*\{([^}]*)\}\s*from\s*['"]next\/font\/google['"]/g;
      while ((m = nf.exec(ctx.masked))) {
        for (const name of m[1].split(',')) report(name.split(/\s+as\s+/)[0].trim().replace(/_/g, ' '), ctx.lineAt(m.index), 'imported from next/font/google');
      }
      const fsrc = /['"]@fontsource(?:-variable)?\/([\w-]+)/g;
      while ((m = fsrc.exec(ctx.masked))) report(m[1].replace(/-/g, ' '), ctx.lineAt(m.index), 'imported from @fontsource');
      const ff = /\bfontFamily\s*:\s*\{/g;
      while ((m = ff.exec(ctx.masked))) {
        const block = ctx.masked.slice(m.index, m.index + 2000);
        for (const e of block.matchAll(/\b(sans|serif|display|body|heading|base|primary)\s*:\s*\[\s*['"]([^'"]+)['"]/g)) {
          report(e[2], ctx.lineAt(m.index + e.index), `as the "${e[1]}" family in the Tailwind config`);
        }
      }
      return out;
    },
  },
  {
    id: 'mono-costume',
    name: 'Monospace as costume',
    category: 'slop',
    severity: 'low',
    ref: 'R-06',
    description: 'Monospace used on big headings to look "technical".',
    fix: 'Keep monospace for code and data; set headings in the text face.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        const bases = restBases(t.classes);
        if (!bases.includes('font-mono')) continue;
        const big = /^h[12]$/.test(t.name) || (textSizePx(bases) || 0) >= 36;
        if (!big || ancestors(ctx, t.index).some((a) => a.name === 'code' || a.name === 'pre')) continue;
        out.push({ line: t.classLine, message: `font-mono on <${t.rawName}> display text`, snippet: t.classes });
      }
      for (const r of ctx.css) {
        const fam = r.decls.find((d) => d.prop === 'font-family');
        if (!fam || !MONO_RE.test(firstFamily(fam.value))) continue;
        const tag = ruleTag(ctx, r);
        const isHeading = tag ? /^h[12]$/.test(tag.name) : subjects(r.fullSelector).some((s) => /^h[12]$/.test(s));
        if (isHeading) out.push({ line: fam.line, message: `Monospace font-family on ${tag ? `<${tag.name}>` : `"${r.selector}"`}` });
      }
      return out;
    },
  },
  {
    id: 'wide-tracking-label',
    name: 'Wide-tracked uppercase label',
    category: 'slop',
    severity: 'low',
    ref: 'R-06',
    description: 'Uppercase text with very wide letter-spacing, the stock "label" look.',
    fix: 'Use sentence case at normal tracking, or tracking-wide at most.',
    check(ctx) {
      const out = [];
      for (const cl of ctx.classLists) {
        const bases = restBases(cl.value);
        if (!bases.includes('uppercase')) continue;
        const wide = bases.find((b) => b === 'tracking-widest' || (TRACKING_ARB.test(b) && (() => {
          const [, n, u] = TRACKING_ARB.exec(b);
          return u === 'px' ? Number(n) >= 2 : Number(n) >= 0.15;
        })()));
        if (wide) out.push({ line: cl.line, message: `Uppercase label with wide tracking: uppercase ${wide}`, snippet: cl.value });
      }
      for (const r of ctx.css) {
        const up = r.decls.some((d) => d.prop === 'text-transform' && /uppercase/i.test(d.value));
        const ls = r.decls.find((d) => d.prop === 'letter-spacing');
        if (!up || !ls) continue;
        const v = letterSpacingEm(ls.value);
        if (v && ((v.em != null && v.em >= 0.15) || (v.px != null && v.px >= 2))) out.push({ line: ls.line, message: `Uppercase with letter-spacing ${cleanValue(ls.value)} on "${r.selector}"` });
      }
      return out;
    },
  },
  {
    id: 'tiny-text',
    name: 'Tiny text',
    category: 'quality',
    severity: 'medium',
    ref: 'R-42',
    description: 'Text set below 12px is hard to read on any screen.',
    fix: 'Use 12px as the floor for UI text and 14-16px for body text.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        if (r.atRules.some((a) => /print/.test(a))) continue;
        const tag = ruleTag(ctx, r);
        if (tag ? tagIsLegal(ctx, tag) : LEGAL_RE.test(r.fullSelector)) continue;
        for (const d of r.decls) {
          if (d.prop !== 'font-size') continue;
          const px = cssPx(cleanValue(d.value));
          if (px != null && px > 0 && px < 12) out.push({ line: d.line, message: `font-size ${cleanValue(d.value)} on ${tag ? `<${tag.name}>` : `"${r.selector}"`} (below 12px)` });
        }
      }
      for (const t of openTags(ctx)) {
        if (!t.classes) continue;
        const tiny = allBases(t.classes).find((b) => {
          const m = /^text-\[(\d*\.?\d+(?:px|rem))\]$/.exec(b);
          const px = m ? cssPx(m[1]) : null;
          return px != null && px > 0 && px < 12;
        });
        if (tiny && !tagIsLegal(ctx, t)) out.push({ line: t.classLine, message: `${tiny} on <${t.rawName}> (below 12px)`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'tight-leading',
    name: 'Tight body leading',
    category: 'quality',
    severity: 'low',
    ref: 'R-42',
    description: 'Line-height under 1.3 on running text makes lines collide.',
    fix: 'Use line-height 1.5-1.7 for body text (leading-relaxed).',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const lh = r.decls.find((d) => d.prop === 'line-height');
        if (!lh) continue;
        const tag = ruleTag(ctx, r);
        if (/::?(before|after|marker|first-letter)/.test(r.fullSelector)) continue;
        const body = tag ? ['p', 'li'].includes(tag.name) : subjects(r.fullSelector).some((s) => ['body', 'p', 'li'].includes(s));
        const ratio = lineHeightRatio(lh, r);
        if (body && ratio != null && ratio > 0 && ratio < 1.3) out.push({ line: lh.line, message: `line-height ${cleanValue(lh.value)} on ${tag ? `<${tag.name}>` : `"${r.selector}"`} body text` });
      }
      for (const t of openTags(ctx)) {
        if (t.name !== 'p' || !t.classes) continue;
        const tight = restBases(t.classes).find((b) => b === 'leading-none' || b === 'leading-tight' || /^leading-\[(0?\.\d+|1(\.[0-2]\d*)?)\]$/.test(b));
        if (!tight) continue;
        // Only judge running text we can see; short or templated lines are often display numbers.
        if (textOf(ctx, t.index).length < 60) continue;
        out.push({ line: t.classLine, message: `${tight} on a <p> paragraph`, snippet: t.classes });
      }
      return out;
    },
  },
  {
    id: 'justified-text',
    name: 'Justified text without hyphenation',
    category: 'quality',
    severity: 'low',
    ref: 'R-42',
    description: 'Justified text without hyphenation opens rivers of white space.',
    fix: 'Use text-align: left, or add hyphens: auto with a lang attribute.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        const j = r.decls.find((d) => d.prop === 'text-align' && /justify/i.test(d.value));
        if (j && !r.decls.some((d) => /^(-webkit-)?hyphens$/.test(d.prop) && /auto/.test(d.value))) out.push({ line: j.line, message: `text-align: justify on "${r.selector}" without hyphens: auto` });
      }
      for (const cl of ctx.classLists) {
        const bases = allBases(cl.value);
        if (bases.includes('text-justify') && !bases.includes('hyphens-auto')) out.push({ line: cl.line, message: 'text-justify without hyphens-auto', snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'crushed-tracking',
    name: 'Crushed letter-spacing',
    category: 'quality',
    severity: 'low',
    ref: 'R-42',
    description: 'Letter-spacing tighter than -0.04em makes letters touch.',
    fix: 'Stay at -0.02em to -0.03em for large display text; 0 for body.',
    check(ctx) {
      const out = [];
      for (const r of ctx.css) {
        for (const d of r.decls) {
          if (d.prop !== 'letter-spacing') continue;
          const v = letterSpacingEm(d.value);
          if (v && ((v.em != null && v.em < -0.04) || (v.px != null && v.px < -2))) out.push({ line: d.line, message: `letter-spacing ${cleanValue(d.value)} on "${r.selector}"` });
        }
      }
      for (const cl of ctx.classLists) {
        const b = allBases(cl.value).find((x) => {
          const m = TRACKING_ARB.exec(x);
          return m && (m[2] === 'px' ? Number(m[1]) < -2 : Number(m[1]) < -0.04);
        });
        if (b) out.push({ line: cl.line, message: `${b} crushes the letters`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'all-caps-body',
    name: 'All-caps body text',
    category: 'quality',
    severity: 'low',
    ref: 'R-42',
    description: 'Running text in all caps is slow to read.',
    fix: 'Use sentence case for paragraphs; keep caps for short labels if at all.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        // Short uppercase <p> lines are labels (kicker-label covers those), not body text.
        if (t.name === 'p' && restBases(t.classes).includes('uppercase') && textOf(ctx, t.index).length >= 40) {
          out.push({ line: t.classLine, message: 'uppercase on a <p> paragraph', snippet: t.classes });
        }
      }
      for (const r of ctx.css) {
        const up = r.decls.find((d) => d.prop === 'text-transform' && /uppercase/i.test(d.value));
        if (!up) continue;
        const tag = ruleTag(ctx, r);
        const subs = tag ? [tag.name] : subjects(r.fullSelector);
        const hit = subs.find((s) => s === 'p' || s === 'body' || (s === 'li' && !/nav|menu|breadcrumb|tab/i.test(r.fullSelector)));
        if (hit) out.push({ line: up.line, message: `text-transform: uppercase on ${tag ? `<${tag.name}>` : `"${r.selector}"`}` });
      }
      return out;
    },
  },
];
