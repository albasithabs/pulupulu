import { ancestors, openTags, splitClasses } from './_util.mjs';

const HANDLER_RE = /^(on[a-z]+|@|v-on:|x-on:|on:|wire:|hx-|data-bs-|data-toggle|\(click\)|ng-click|\.\.\.$)/;
// An id or data-* attribute on a link is how vanilla JS wires it up (tabs, toggles).
const hasHandler = (tag) => Object.keys(tag.attrs).some((k) => HANDLER_RE.test(k) || k === 'id' || k.startsWith('data-') || k === 'aria-controls');

const isExpr = (v) => typeof v === 'string' && /^\{|\{\{|\$\{/.test(v);

const isImg = (t) => t.name === 'img' && (t.rawName === 'img' || t.rawName === 'IMG');

function headingLevel(t) {
  const m = /^h([1-6])$/.exec(t.name);
  return m && t.rawName === t.rawName.toLowerCase() ? Number(m[1]) : null;
}

function hasFocusVisibleCss(ctx) {
  return ctx.css.some((r) => /:focus-visible|:focus-within/.test(r.fullSelector)) || /:focus-visible/.test(ctx.masked);
}

const FOCUS_VARIANT = /^(focus|focus-visible|focus-within|group-focus|group-focus-visible|peer-focus|peer-focus-visible)$/;

export default [
  {
    id: 'dead-control',
    name: 'Dead link',
    category: 'a11y',
    severity: 'high',
    ref: 'R-26',
    description: 'A link that goes nowhere: href="#", empty, or javascript:.',
    fix: 'Point the link at a real URL, or make it a <button> with a handler.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (t.name !== 'a' || !('href' in t.attrs) || hasHandler(t)) continue;
        const href = t.attrs.href === true ? '' : String(t.attrs.href).trim();
        if (isExpr(href)) continue;
        if (href === '#' || href === '' || /^javascript:/i.test(href)) {
          out.push({ line: t.line, message: `<a href="${href}"> goes nowhere and has no click handler` });
        }
      }
      return out;
    },
  },
  {
    id: 'missing-anchor',
    name: 'Missing anchor target',
    category: 'a11y',
    severity: 'high',
    ref: 'R-24',
    description: 'An in-page link whose target id does not exist in the document.',
    fix: 'Add the matching id to the target section, or fix the href.',
    check(ctx) {
      if (!ctx.fullDocument) return [];
      const ids = new Set();
      for (const t of openTags(ctx)) {
        for (const k of ['id', 'name']) if (typeof t.attrs[k] === 'string') ids.add(t.attrs[k]);
      }
      const out = [];
      for (const t of openTags(ctx)) {
        if (t.name !== 'a' || typeof t.attrs.href !== 'string') continue;
        const href = t.attrs.href.trim();
        if (!/^#[^!]/.test(href) || isExpr(href) || hasHandler(t) || t.attrs.role === 'tab') continue;
        const id = decodeURIComponent(href.slice(1));
        // "#top" scrolls to the top of the page by spec even with no element.
        if (ids.has(id) || id.toLowerCase() === 'top') continue;
        out.push({ line: t.line, message: `Link to "${href}" but no element has id="${id}"` });
      }
      return out;
    },
  },
  {
    id: 'outline-removed',
    name: 'Focus outline removed',
    category: 'a11y',
    severity: 'high',
    ref: 'R-32',
    description: 'The focus outline is removed with nothing visible replacing it.',
    fix: 'Keep the outline, or replace it with :focus-visible / focus-visible:ring-2 styles.',
    check(ctx) {
      const out = [];
      const fileHasFocusVisible = hasFocusVisibleCss(ctx);
      for (const r of ctx.css) {
        // `.focus\:outline-none:focus` is a compiled utility definition, judged where it is used.
        if (r.inline || /:not\(:focus-visible\)|\\:/.test(r.fullSelector)) continue;
        const kill = r.decls.find((d) => (d.prop === 'outline' && /^(none|0(px)?)(\s|$|!)/i.test(d.value)) || (d.prop === 'outline-style' && /^none/i.test(d.value)));
        if (!kill) continue;
        const replaced = r.decls.some((d) => d.prop === 'box-shadow' && !/^none/.test(d.value)) || (/:focus/.test(r.fullSelector) && r.decls.some((d) => /^(border|border-color|background|background-color)$/.test(d.prop)));
        if (replaced || fileHasFocusVisible) continue;
        out.push({ line: kill.line, message: `outline: ${kill.value} on "${r.selector}" with no focus replacement` });
      }
      for (const cl of ctx.classLists) {
        const classes = splitClasses(cl.value);
        const kill = classes.find((c) => /^outline-(none|hidden|0)$/.test(c.base));
        if (!kill) continue;
        const replaced = classes.some((c) => c !== kill && c.variants.some((v) => FOCUS_VARIANT.test(v)));
        // tabindex="-1" marks a programmatic focus target (skip-link landing), never reached by Tab.
        const programmatic = cl.tagIndex >= 0 && String(ctx.tags[cl.tagIndex].attrs.tabindex).replace(/[{}]/g, '') === '-1';
        if (replaced || programmatic || fileHasFocusVisible) continue;
        out.push({ line: cl.line, message: `${kill.raw} with no focus:/focus-visible: replacement`, snippet: cl.value });
      }
      return out;
    },
  },
  {
    id: 'zoom-disabled',
    name: 'Zoom disabled',
    category: 'mobile',
    severity: 'high',
    ref: 'R-03',
    description: 'The viewport meta blocks pinch zoom.',
    fix: 'Use content="width=device-width, initial-scale=1" without user-scalable or maximum-scale.',
    check(ctx) {
      const out = [];
      const bad = /user-scalable\s*=\s*(no|0)\b|maximum-scale\s*=\s*(0(\.\d+)?|1(\.0+)?)(?![\d.])/i;
      for (const t of openTags(ctx)) {
        if (t.name !== 'meta' || String(t.attrs.name).toLowerCase() !== 'viewport') continue;
        const m = bad.exec(String(t.attrs.content || ''));
        if (m) out.push({ line: t.line, message: `Viewport meta blocks zoom: ${m[0]}` });
      }
      const re = /\b(maximumScale\s*:\s*1(?![\d.])|userScalable\s*:\s*false)/g;
      let m;
      while ((m = re.exec(ctx.masked))) out.push({ line: ctx.lineAt(m.index), message: `Viewport export blocks zoom: ${m[0]}` });
      return out;
    },
  },
  {
    id: 'missing-viewport',
    name: 'Missing viewport meta',
    category: 'mobile',
    severity: 'high',
    ref: 'R-03',
    description: 'A full HTML document without a viewport meta renders zoomed out on phones.',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>.',
    check(ctx) {
      if (!ctx.fullDocument) return [];
      const tags = openTags(ctx);
      if (tags.some((t) => t.name === 'meta' && String(t.attrs.name).toLowerCase() === 'viewport')) return [];
      const anchor = tags.find((t) => t.name === 'head') || tags.find((t) => t.name === 'html');
      return [{ line: anchor ? anchor.line : 1, message: 'Full HTML document has no <meta name="viewport">' }];
    },
  },
  {
    id: 'img-no-alt',
    name: 'Image without alt',
    category: 'a11y',
    severity: 'high',
    ref: 'R-48',
    description: 'An <img> with no alt attribute. Screen readers read the file name instead.',
    fix: 'Describe the image in alt, or use alt="" when it is decorative.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!isImg(t) && t.rawName !== 'Image') continue;
        if (t.attrs['...']) continue;
        const keys = Object.keys(t.attrs);
        if (keys.some((k) => /^(alt|:alt|v-bind:alt|x-bind:alt|\[alt\]|\[attr\.alt\])$/.test(k))) continue;
        const src = typeof t.attrs.src === 'string' ? ` src="${t.attrs.src.slice(0, 60)}"` : '';
        out.push({ line: t.line, message: `<${t.rawName}${src}> has no alt attribute` });
      }
      return out;
    },
  },
  {
    id: 'skipped-heading',
    name: 'Skipped heading level',
    category: 'a11y',
    severity: 'medium',
    ref: 'R-48',
    description: 'Heading levels jump downward (h1 then h3), which breaks the document outline.',
    fix: 'Use the next level down, and style it to the size you want.',
    check(ctx) {
      const heads = openTags(ctx).map((t) => ({ t, level: headingLevel(t) })).filter((h) => h.level);
      if (!ctx.fullDocument && !heads.some((h) => h.level === 1)) return [];
      const out = [];
      let prev = null;
      for (const h of heads) {
        if (prev !== null && h.level > prev + 1) out.push({ line: h.t.line, message: `Heading jumps from <h${prev}> to <h${h.level}>` });
        prev = h.level;
      }
      return out;
    },
  },
  {
    id: 'broken-image',
    name: 'Broken image source',
    category: 'quality',
    severity: 'high',
    ref: 'R-47',
    description: 'An <img> with an empty, "#", or missing src.',
    fix: 'Point src at a real file, or remove the image.',
    check(ctx) {
      const out = [];
      for (const t of openTags(ctx)) {
        if (!isImg(t) || t.attrs['...']) continue;
        const keys = Object.keys(t.attrs);
        if (keys.some((k) => /(^|:|\[)(src|srcset|data-src|data-srcset|ng-src)\]?$/.test(k) && k !== 'src')) continue;
        if (!('src' in t.attrs)) {
          // An <img> with JS hooks (id, data-*, x-*) or inside a dialog/template gets its src at runtime.
          const scripted = keys.some((k) => k === 'id' || /^(data-|x-|v-|ref$|wire:)/.test(k)) || ancestors(ctx, t.index).some((a) => a.name === 'dialog' || a.name === 'template');
          if (!scripted) out.push({ line: t.line, message: '<img> has no src' });
          continue;
        }
        const src = t.attrs.src === true ? '' : String(t.attrs.src).trim();
        if (src === '' || src === '#') out.push({ line: t.line, message: `<img src="${src}"> points at nothing` });
      }
      return out;
    },
  },
];

