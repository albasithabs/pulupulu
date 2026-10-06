// Read as text by index.mjs and evaluated inside the page, so it must stay
// self-contained: no imports, no closures over Node code.
//
// options: { viewport: 'desktop' | 'mobile', overusedFonts: string[], allowFonts: string[], cap?: number }
// returns: { hits: [{ rule, message, snippet, count? }], meta: { unverifiable, textElements, elements } }
async function pulupuluPageChecks(options) {
  const opts = Object.assign({ viewport: 'desktop', overusedFonts: [], allowFonts: [], cap: 8 }, options || {});
  const mobile = opts.viewport === 'mobile';
  const doc = document;
  // Mobile emulation widens innerWidth to fit overflow, hiding it; with a
  // device-width viewport meta the screen width is the honest reference.
  const meta0 = doc.querySelector('meta[name="viewport"]');
  const deviceWidth = !!meta0 && /width\s*=\s*device-width/i.test(meta0.getAttribute('content') || '');
  const vw = mobile && deviceWidth ? Math.min(window.innerWidth, screen.width || window.innerWidth) : window.innerWidth;
  const hitsByRule = new Map();
  const meta = { unverifiable: 0, textElements: 0, elements: 0 };

  const add = (rule, message, el, extraSnippet) => {
    if (!hitsByRule.has(rule)) hitsByRule.set(rule, []);
    hitsByRule.get(rule).push({ rule, message, snippet: extraSnippet != null ? extraSnippet : (el ? describe(el) : '') });
  };

  // Style and geometry helpers
  const styleCache = new Map();
  const cs = (el) => {
    let s = styleCache.get(el);
    if (!s) {
      s = getComputedStyle(el);
      styleCache.set(el, s);
    }
    return s;
  };
  const px = (v) => parseFloat(v) || 0;

  const opacityCache = new Map();
  const opacityOf = (el) => {
    if (!el || el.nodeType !== 1) return 1;
    if (opacityCache.has(el)) return opacityCache.get(el);
    const v = px(cs(el).opacity === '' ? '1' : cs(el).opacity) * opacityOf(el.parentElement);
    opacityCache.set(el, v);
    return v;
  };

  // Present in layout: in the document, not display:none (itself or ancestors).
  const present = (el) => el.isConnected && el.getClientRects().length > 0;
  const visible = (el) => {
    if (!present(el)) return false;
    const s = cs(el);
    if (s.visibility !== 'visible' || s.contentVisibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    return opacityOf(el) > 0.05;
  };
  const ariaHidden = (el) => !!el.closest('[aria-hidden="true"], [inert]');
  const directText = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.data;
    return t.replace(/\s+/g, ' ').trim();
  };
  const textRect = (el) => {
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity, any = false;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.data.trim()) continue;
      const range = doc.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width === 0 && r.height === 0) continue;
        any = true;
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
      }
    }
    return any ? { left, right, top, bottom, width: right - left } : null;
  };

  function describe(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (typeof el.className === 'string' && el.className.trim()) {
      const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      s += '.' + (cls.length > 40 ? cls.slice(0, 39) + '…' : cls);
    }
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) s += ' "' + (text.length > 40 ? text.slice(0, 39) + '…' : text) + '"';
    else if (el.tagName === 'IMG') s += ' src="' + String(el.getAttribute('src') || '').slice(0, 60) + '"';
    return s;
  }

  // Color
  const canvas = doc.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  function parseColor(str) {
    if (!str) return null;
    if (colorCache.has(str)) return colorCache.get(str);
    let c = null;
    const m = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
    if (m) {
      let a = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (m[4] && m[4].endsWith('%')) a /= 100;
      c = { r: +m[1], g: +m[2], b: +m[3], a };
    } else if (str === 'transparent') {
      c = { r: 0, g: 0, b: 0, a: 0 };
    } else if (ctx) {
      // oklch(), color(), lab() and friends: let the canvas convert to sRGB.
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = str;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      c = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    }
    colorCache.set(str, c);
    return c;
  }
  const blend = (top, bottom, a) => ({
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  });
  const lum = (c) => {
    const ch = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  };
  const contrast = (a, b) => {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  const chroma = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
  const lightness = (c) => (Math.max(c.r, c.g, c.b) + Math.min(c.r, c.g, c.b)) / 510;
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  const MEDIA = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'SVG', 'IFRAME', 'OBJECT', 'EMBED']);
  // A positioned box may sit over a sibling image or video that is not one of
  // its ancestors; the ancestor walk cannot see that, so the result is unknown.
  function overlapsMediaSibling(node) {
    const parent = node.parentElement;
    if (!parent) return false;
    const r = node.getBoundingClientRect();
    for (const sib of parent.querySelectorAll('img, video, canvas, picture, svg, iframe, object, embed')) {
      if (sib === node || node.contains(sib)) continue;
      const s = sib.getBoundingClientRect();
      if (s.width && s.height && s.left < r.right && s.right > r.left && s.top < r.bottom && s.bottom > r.top) return true;
    }
    return false;
  }

  // Effective opaque background behind `el`, or null when an image, gradient,
  // filter, or overlapping media makes it unknowable.
  const bgCache = new Map();
  function effectiveBg(el) {
    if (bgCache.has(el)) return bgCache.get(el);
    const layers = [];
    let node = el;
    let result;
    for (;;) {
      if (!node || node.nodeType !== 1) {
        result = layers.reduceRight((acc, c) => blend(c, acc, c.a), { r: 255, g: 255, b: 255, a: 1 });
        break;
      }
      const s = cs(node);
      if (s.backgroundImage && s.backgroundImage !== 'none') { result = null; break; }
      if (MEDIA.has(node.tagName.toUpperCase()) || (s.filter && s.filter !== 'none') || (s.mixBlendMode && s.mixBlendMode !== 'normal')) { result = null; break; }
      const c = parseColor(s.backgroundColor);
      if (c && c.a > 0) layers.push(c);
      if (c && c.a >= 0.999) {
        result = layers.reduceRight((acc, l) => blend(l, acc, l.a), { r: 255, g: 255, b: 255, a: 1 });
        break;
      }
      if ((s.position === 'absolute' || s.position === 'fixed') && overlapsMediaSibling(node)) { result = null; break; }
      node = node.parentElement;
    }
    bgCache.set(el, result);
    return result;
  }

  function textColorOn(el, bg) {
    const s = cs(el);
    let c = parseColor(s.webkitTextFillColor && s.webkitTextFillColor !== s.color ? s.webkitTextFillColor : s.color);
    if (!c || c.a < 0.05) return null;
    if (c.a < 1) c = blend(c, bg, c.a);
    const op = opacityOf(el);
    if (op < 1) c = blend(c, bg, op);
    return c;
  }

  // Collect elements once
  const all = Array.from(doc.body ? doc.body.querySelectorAll('*') : []).slice(0, 8000);
  meta.elements = all.length;
  const SKIP_TEXT = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'OPTION', 'OPTGROUP', 'TEXTAREA', 'SELECT', 'TITLE']);
  const textEls = [];
  for (const el of all) {
    if (SKIP_TEXT.has(el.tagName) || el.closest('svg')) continue;
    if (directText(el).length === 0) continue;
    textEls.push(el);
  }
  const visibleText = textEls.filter((el) => visible(el) && !ariaHidden(el));
  meta.textElements = visibleText.length;

  // Text color: low-contrast, gray-on-color
  for (const el of visibleText) {
    if (el.closest(':disabled, [aria-disabled="true"]')) continue;
    const s = cs(el);
    const fill = parseColor(s.webkitTextFillColor);
    const clip = s.backgroundClip || s.webkitBackgroundClip;
    if ((fill && fill.a < 0.05) || clip === 'text') continue;
    const bg = effectiveBg(el);
    if (!bg) {
      meta.unverifiable++;
      continue;
    }
    const fg = textColorOn(el, bg);
    if (!fg) continue;
    const size = px(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const ratio = Math.round(contrast(fg, bg) * 100) / 100;
    if (ratio < need) {
      add('low-contrast', 'Contrast ' + ratio + ':1 (' + hex(fg) + ' on ' + hex(bg) + '), needs ' + need + ':1', el);
    }
    const textColor = parseColor(s.color);
    if (textColor && textColor.a > 0.5 && chroma(textColor) <= 24) {
      const L = lightness(textColor);
      if (L > 0.25 && L < 0.8 && chroma(bg) >= 90 && lightness(bg) > 0.2 && lightness(bg) < 0.85) {
        add('gray-on-color', 'Gray text ' + hex(textColor) + ' on colored surface ' + hex(bg), el);
      }
    }
  }

  // Gradient-text
  for (const el of visibleText) {
    const s = cs(el);
    const clip = s.backgroundClip || s.webkitBackgroundClip;
    if (clip === 'text' && /gradient\(/.test(s.backgroundImage)) add('gradient-text', 'Text filled with a gradient', el);
  }
  // The gradient often sits on a parent of the text node (h1 > span).
  for (const el of all) {
    if (directText(el)) continue;
    const s = cs(el);
    const clip = s.backgroundClip || s.webkitBackgroundClip;
    if (clip === 'text' && /gradient\(/.test(s.backgroundImage) && visible(el) && (el.textContent || '').trim()) {
      add('gradient-text', 'Text filled with a gradient', el);
    }
  }

  // Tiny-text
  const FUNCTIONAL = 'button, a, label, input, select, textarea, nav, small, figcaption, time, th, caption, legend, [role="button"], [role="tab"], [role="menuitem"], [role="status"], code, kbd';
  for (const el of visibleText) {
    if (el.closest('sup, sub')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    const size = px(cs(el).fontSize);
    const functional = !!el.closest(FUNCTIONAL);
    const floor = functional ? 11 : 12;
    if (size > 0 && size < floor - 0.01) {
      add('tiny-text', (functional ? 'UI text' : 'Body text') + ' at ' + Math.round(size * 10) / 10 + 'px (floor ' + floor + 'px)', el);
    }
  }

  // Line-length
  for (const p of all) {
    if (p.tagName !== 'P' || !visible(p)) continue;
    const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 160) continue;
    const s = cs(p);
    const width = p.clientWidth - px(s.paddingLeft) - px(s.paddingRight);
    if (width <= 0 || !ctx) continue;
    ctx.font = s.fontStyle + ' ' + s.fontWeight + ' ' + s.fontSize + ' ' + s.fontFamily;
    const sample = text.slice(0, 400);
    const avg = ctx.measureText(sample).width / sample.length;
    if (!avg) continue;
    const perLine = Math.round(width / avg);
    // Only multi-line paragraphs: a short paragraph in a wide box is not a measure problem.
    if (perLine > 85 && text.length > perLine * 1.5) add('line-length', '~' + perLine + ' characters per line (aim for 45-75)', p);
  }

  // Text-overflow
  const clipsX = (el) => {
    for (let n = el.parentElement; n && n !== doc.body && n !== doc.documentElement; n = n.parentElement) {
      const o = cs(n).overflowX;
      if (o !== 'visible') return true;
    }
    return false;
  };
  const pageScrollsX = doc.documentElement.scrollWidth > vw + 1;
  for (const el of visibleText) {
    const s = cs(el);
    if (s.display === 'inline' || s.display === 'contents') continue;
    const tr = textRect(el);
    if (!tr || tr.width < 1) continue;
    const r = el.getBoundingClientRect();
    const spillsBox = s.overflowX === 'visible' && (tr.right > r.right + 3 || tr.left < r.left - 3);
    // When the page itself scrolls sideways horizontal-overflow reports it; this
    // catches text cut off by overflow-x: hidden on html or body.
    const pastViewport = !pageScrollsX && tr.right > vw + 1 && tr.left < vw && !clipsX(el);
    if (spillsBox) add('text-overflow', 'Text spills ' + Math.round(Math.max(tr.right - r.right, r.left - tr.left)) + 'px outside its box', el);
    else if (pastViewport) add('text-overflow', 'Text runs ' + Math.round(tr.right - vw) + 'px past the viewport edge', el);
  }

  // Hidden-content
  {
    let total = 0;
    const hidden = [];
    for (const el of textEls) {
      if (!present(el) || ariaHidden(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      total++;
      const s = cs(el);
      const isHidden = s.visibility !== 'visible' || opacityOf(el) < 0.05;
      if (!isHidden) continue;
      // Menus, tooltips and popovers are hidden at rest on purpose.
      let popover = false;
      for (let n = el; n && n !== doc.body; n = n.parentElement) {
        const ns = cs(n);
        if ((ns.position === 'absolute' || ns.position === 'fixed') && (ns.visibility !== 'visible' || px(ns.opacity) < 0.05 || opacityOf(n) < 0.05)) {
          popover = true;
          break;
        }
        if (n.matches('dialog, [popover], [role="tooltip"], [role="menu"], [role="dialog"]')) {
          popover = true;
          break;
        }
      }
      if (!popover) hidden.push(el);
    }
    if (total >= 5 && hidden.length / total > 0.3) {
      add('hidden-content', hidden.length + ' of ' + total + ' text elements are invisible after load', null,
        hidden.slice(0, 3).map(describe).join(' | '));
    }
  }

  // Images
  for (const img of doc.images) {
    if (!img.isConnected || cs(img).display === 'none' || !present(img)) continue;
    const src = img.currentSrc || img.getAttribute('src') || '';
    if (img.complete && img.naturalWidth === 0 && src) add('broken-image', 'Image failed to load', img);
    if (!img.hasAttribute('alt') && !ariaHidden(img) && !/^(presentation|none)$/.test(img.getAttribute('role') || '') &&
        !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
      const r = img.getBoundingClientRect();
      if (r.width > 1 || r.height > 1) add('img-no-alt', 'Image has no alt attribute', img);
    }
  }

  // Accessible names
  function textName(node) {
    let out = '';
    for (const n of node.childNodes) {
      if (n.nodeType === 3) out += n.data;
      else if (n.nodeType === 1) {
        if (n.getAttribute('aria-hidden') === 'true') continue;
        const s = cs(n);
        if (s.display === 'none' || s.visibility === 'hidden') continue;
        if (n.getAttribute('aria-label')) out += ' ' + n.getAttribute('aria-label');
        else if (n.tagName === 'IMG') out += ' ' + (n.getAttribute('alt') || '');
        else if (n.tagName.toLowerCase() === 'svg') {
          const t = n.querySelector('title');
          out += ' ' + (t ? t.textContent : '');
        } else out += ' ' + textName(n);
      }
    }
    return out;
  }
  function accessibleName(el) {
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const t = lb.split(/\s+/).map((id) => doc.getElementById(id)).filter(Boolean).map((n) => n.textContent).join(' ');
      if (t.trim()) return t;
    }
    if ((el.getAttribute('aria-label') || '').trim()) return el.getAttribute('aria-label');
    const tag = el.tagName;
    const type = (el.getAttribute('type') || '').toLowerCase();
    if (tag === 'INPUT') {
      if (type === 'submit' || type === 'reset') return el.value || type;
      if (type === 'button') return el.value || el.title || '';
      if (type === 'image') return el.alt || el.title || el.value || '';
    }
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
      const labels = el.labels ? Array.from(el.labels).map((l) => textName(l)).join(' ') : '';
      if (labels.trim()) return labels;
      return el.title || el.getAttribute('placeholder') || '';
    }
    const content = textName(el);
    if (content.trim()) return content;
    return el.title || '';
  }
  for (const el of doc.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]')) {
    if (!visible(el) || ariaHidden(el)) continue;
    if (!accessibleName(el).trim()) {
      const html = el.outerHTML.replace(/\s+/g, ' ').slice(0, 80);
      add('unnamed-control', '<' + el.tagName.toLowerCase() + '> has no accessible name', el, html);
    }
  }

  // Missing-anchor
  for (const a of doc.querySelectorAll('a[href^="#"]')) {
    const href = a.getAttribute('href');
    if (href.length < 2 || /^#[!/]/.test(href) || href === '#top' || !visible(a)) continue;
    let id;
    try {
      id = decodeURIComponent(href.slice(1));
    } catch {
      id = href.slice(1);
    }
    if (!doc.getElementById(id) && doc.getElementsByName(id).length === 0) add('missing-anchor', 'Link to ' + href + ' but no element has that id', a);
  }

  // Headings
  {
    const heads = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]'))
      .filter((h) => present(h) && cs(h).visibility === 'visible' && !ariaHidden(h));
    const level = (h) => (/^H[1-6]$/.test(h.tagName) ? +h.tagName[1] : parseInt(h.getAttribute('aria-level'), 10) || 2);
    let prev = 0;
    for (const h of heads) {
      const l = level(h);
      if (prev && l > prev + 1) add('skipped-heading', 'Heading jumps from h' + prev + ' to h' + l, h);
      prev = l;
    }
    const h1s = heads.filter((h) => level(h) === 1);
    if (h1s.length > 1) add('skipped-heading', h1s.length + ' h1 elements on one page', null, h1s.slice(0, 3).map(describe).join(' | '));

    const h1 = h1s.find((h) => visible(h));
    if (h1) {
      const para = Array.from(doc.querySelectorAll('p')).find((p) => visible(p) && (p.textContent || '').trim().length >= 40);
      const bodySize = px(cs(para || doc.body).fontSize);
      const h1Size = px(cs(h1).fontSize);
      if (bodySize && h1Size < bodySize * 1.25) {
        add('flat-hierarchy', 'h1 is ' + h1Size + 'px against ' + bodySize + 'px body text (less than 1.25x)', h1);
      }
    }
  }

  // Overused-font
  try {
    await Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 1000))]);
  } catch {
    // fonts API unavailable
  }
  {
    const overused = new Map(opts.overusedFonts.map((f) => [f.toLowerCase(), f]));
    const allowed = new Set(opts.allowFonts.map((f) => f.toLowerCase()));
    const rendered = (family) => {
      if (!ctx) return true;
      const sample = 'mmmmmmmmmmlli1WQ@#';
      return ['monospace', 'serif', 'sans-serif'].some((fb) => {
        ctx.font = '72px ' + fb;
        const base = ctx.measureText(sample).width;
        ctx.font = '72px "' + family + '", ' + fb;
        return Math.abs(ctx.measureText(sample).width - base) > 0.5;
      });
    };
    const seen = new Set();
    const h1 = doc.querySelector('h1');
    for (const el of [doc.body, h1].filter(Boolean)) {
      const first = (cs(el).fontFamily || '').split(',')[0].trim().replace(/^["']|["']$/g, '');
      const key = first.toLowerCase();
      if (!overused.has(key) || allowed.has(key) || seen.has(key)) continue;
      seen.add(key);
      if (rendered(first)) add('overused-font', overused.get(key) + ' is the rendered ' + (el === doc.body ? 'body' : 'h1') + ' font', el, el.tagName.toLowerCase() + ' font-family: ' + first);
    }
  }

  // Glass-overuse
  {
    const glass = all.filter((el) => {
      const s = cs(el);
      const bf = s.backdropFilter || s.webkitBackdropFilter;
      return bf && bf !== 'none' && visible(el);
    });
    if (glass.length > 2) add('glass-overuse', glass.length + ' elements use backdrop-filter', null, glass.slice(0, 3).map(describe).join(' | '));
  }

  // Nested-cards
  {
    const NOT_CARD = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG', 'PRE', 'CODE', 'VIDEO', 'IFRAME', 'HTML', 'BODY', 'FIELDSET']);
    const cardCache = new Map();
    const isCard = (el) => {
      if (cardCache.has(el)) return cardCache.get(el);
      let v = false;
      if (!NOT_CARD.has(el.tagName) && el.namespaceURI === 'http://www.w3.org/1999/xhtml' && el.getAttribute('role') !== 'button') {
        const s = cs(el);
        const r = el.getBoundingClientRect();
        const radius = s.borderTopLeftRadius;
        const rad = radius.endsWith('%') ? 0 : px(radius);
        const borderW = Math.max(px(s.borderTopWidth), px(s.borderLeftWidth));
        const borderC = parseColor(s.borderTopColor) || parseColor(s.borderLeftColor);
        const hasBorder = borderW >= 1 && borderC && borderC.a > 0.1 && s.borderTopStyle !== 'none';
        const hasShadow = s.boxShadow && s.boxShadow !== 'none';
        v = rad >= 8 && rad < Math.min(r.width, r.height) / 2 && (hasBorder || hasShadow) &&
          px(s.paddingTop) >= 12 && px(s.paddingLeft) >= 12 && r.width >= 80 && r.height >= 40;
      }
      cardCache.set(el, v);
      return v;
    };
    for (const el of all) {
      if (!isCard(el) || !visible(el)) continue;
      for (let n = el.parentElement; n && n !== doc.body; n = n.parentElement) {
        if (isCard(n)) {
          add('nested-cards', 'Card inside a card (' + describe(n).split(' ')[0] + ')', el);
          break;
        }
      }
    }
  }

  // Mobile-only
  if (mobile) {
    const TARGETS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex^="-"])';
    for (const el of doc.querySelectorAll(TARGETS)) {
      if (!visible(el) || ariaHidden(el) || el.disabled) continue;
      let r = el.getBoundingClientRect();
      if (r.width <= 2 || r.height <= 2 || r.right <= 0 || r.left >= vw) continue;
      const s = cs(el);
      if (el.tagName === 'A' && s.display === 'inline') {
        const block = el.parentElement;
        const own = (el.textContent || '').trim().length;
        const around = block ? (block.textContent || '').replace(/\s+/g, ' ').trim().length : 0;
        if (around - own >= 20) continue;
      }
      if (el.tagName === 'INPUT' && /^(checkbox|radio)$/i.test(el.type) && el.labels && el.labels.length) {
        for (const l of el.labels) {
          const lr = l.getBoundingClientRect();
          r = { width: Math.max(r.right, lr.right) - Math.min(r.left, lr.left), height: Math.max(r.bottom, lr.bottom) - Math.min(r.top, lr.top) };
        }
      }
      if (Math.round(r.width) < 44 || Math.round(r.height) < 44) {
        add('tap-target', 'Tap target ' + Math.round(r.width) + 'x' + Math.round(r.height) + 'px, needs 44x44', el);
      }
    }

    const sw = doc.documentElement.scrollWidth;
    if (sw > vw + 1) {
      const offenders = [];
      const isOff = (el) => {
        const r = el.getBoundingClientRect();
        return r.right > vw + 1 && r.width > 0;
      };
      for (const el of all) {
        if (!visible(el) || !isOff(el) || clipsX(el)) continue;
        const parent = el.parentElement;
        if (parent && parent !== doc.body && isOff(parent) && !clipsX(parent)) continue;
        offenders.push(el);
      }
      offenders.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
      add('horizontal-overflow', 'Page is ' + sw + 'px wide on a ' + vw + 'px screen', null,
        offenders.slice(0, 3).map((el) => describe(el) + ' (right ' + Math.round(el.getBoundingClientRect().right) + 'px)').join(' | '));
    }

    for (const el of visibleText) {
      if (!el.matches('p, li, blockquote, dd') || clipsX(el)) continue;
      const tr = textRect(el);
      if (!tr) continue;
      if ((tr.left >= 0 && tr.left < 8) || (tr.right > vw - 8 && tr.right <= vw + 1)) {
        add('body-edge', 'Text sits ' + Math.round(Math.min(tr.left, vw - tr.right)) + 'px from the screen edge', el);
      }
    }
  }

  // Cap and summarize
  const hits = [];
  for (const [rule, list] of hitsByRule) {
    hits.push(...list.slice(0, opts.cap));
    if (list.length > opts.cap) hits.push({ rule, message: '...and ' + (list.length - opts.cap) + ' more', snippet: '', count: list.length - opts.cap });
  }
  return { hits, meta };
}
