import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { applyConfig, DEFAULT_CONFIG } from '../shared/config.mjs';
import { findBrowser, launchBrowser } from './cdp.mjs';

export { findBrowser };

const r = (id, name, category, severity, ref, description, fix) => ({ id, name, category, severity, ref, description, fix });

export const BROWSER_RULES = [
  r('low-contrast', 'Low text contrast', 'a11y', 'high', 'R-25',
    'Rendered text against its effective background is below 4.5:1, or 3:1 for large text.',
    'Darken the text or lighten the surface until it passes; check the real background, not the design token.'),
  r('tap-target', 'Small tap target', 'mobile', 'high', 'R-03',
    'On mobile, a control is smaller than 44x44 CSS px.',
    'Give the control at least 44x44px of hit area with padding or min-height; inline links in prose are exempt.'),
  r('horizontal-overflow', 'Horizontal overflow', 'mobile', 'high', 'R-03',
    'On a 390px screen the page is wider than the viewport and scrolls sideways.',
    'Find the widest element (fixed width, long word, wide table) and let it shrink, wrap, or scroll inside its own box.'),
  r('text-overflow', 'Text overflow', 'quality', 'medium', 'R-47',
    'Text spills outside its box or past the viewport edge.',
    'Allow wrapping (overflow-wrap: anywhere for URLs), remove fixed widths, or truncate on purpose with ellipsis.'),
  r('broken-image', 'Broken image', 'quality', 'high', 'R-47',
    'An image finished loading with no pixels.',
    'Fix the path or remove the image. Do not ship a broken icon.'),
  r('script-error', 'Script error', 'quality', 'high', 'R-47',
    'An uncaught exception or console error happened while the page loaded.',
    'Open the console, fix the error, and reload until it is clean.'),
  r('hidden-content', 'Content hidden at rest', 'quality', 'high', 'R-47',
    'More than 30% of the text is invisible (opacity 0 or visibility hidden) after load.',
    'Content must be visible at rest. Let entrance animations start from a visible state or drop them.'),
  r('line-length', 'Long lines', 'quality', 'low', 'R-42',
    'A paragraph runs past ~85 characters per line.',
    'Cap the measure at 60-75ch with max-width on the text column.'),
  r('tiny-text', 'Tiny text', 'quality', 'medium', 'R-42',
    'Body text below 12px or interface text below 11px.',
    'Raise body text to 14-16px and labels to at least 12px.'),
  r('skipped-heading', 'Heading order', 'a11y', 'medium', 'R-48',
    'Heading levels skip (h1 then h3) or the page has more than one h1.',
    'Use one h1 and step down one level at a time; style with classes, not heading levels.'),
  r('img-no-alt', 'Image without alt', 'a11y', 'high', 'R-48',
    'A rendered image has no alt attribute.',
    'Describe what the image shows, or use alt="" when it is decoration.'),
  r('unnamed-control', 'Control without a name', 'a11y', 'high', 'R-48',
    'A button, link, or field has no accessible name.',
    'Add visible text, a <label>, or aria-label on icon-only controls.'),
  r('focus-invisible', 'Invisible focus', 'a11y', 'high', 'R-32',
    'Keyboard focus lands on a control without any visible change.',
    'Add a :focus-visible style: an outline or ring with at least 3:1 contrast against its surroundings.'),
  r('missing-anchor', 'Missing anchor target', 'quality', 'high', 'R-24',
    'An in-page link points at an id that does not exist.',
    'Add the id to the target section or fix the href.'),
  r('overused-font', 'Overused font', 'slop', 'medium', 'R-06',
    'The rendered body or h1 font is one of the fonts every AI build defaults to.',
    'Pick a face that fits the brand, or record the choice in config.allow.fonts if it is a brand decision.'),
  r('gradient-text', 'Gradient text', 'slop', 'medium', 'R-01',
    'Text filled with a gradient via background-clip: text.',
    'Use a solid color. Carry emphasis with weight, size, or placement.'),
  r('glass-overuse', 'Glass overuse', 'slop', 'medium', 'R-10',
    'More than two visible elements use backdrop-filter.',
    'Keep blur for one surface that floats over content, like a sticky header.'),
  r('nested-cards', 'Nested cards', 'slop', 'low', 'R-41',
    'A bordered or shadowed rounded box sits inside another one.',
    'Flatten the inner level: use spacing, a divider, or a heading instead of another card.'),
  r('gray-on-color', 'Gray on color', 'quality', 'medium', 'R-44',
    'Neutral gray text on a saturated colored surface.',
    'Use a tint or shade of the surface color, or white/near-black, for text on color.'),
  r('body-edge', 'Text touching the edge', 'mobile', 'medium', 'R-03',
    'On mobile, paragraph text sits within 8px of the screen edge.',
    'Give the page at least 16px side padding.'),
  r('flat-hierarchy', 'Flat hierarchy', 'quality', 'low', 'R-42',
    'The h1 is less than 1.25x the body text size.',
    'Make the page title clearly larger than body text, or carry it with weight and space.'),
];

const RULES_BY_ID = new Map(BROWSER_RULES.map((rule) => [rule.id, rule]));

export const OVERUSED_FONTS = [
  'Inter', 'Roboto', 'Geist', 'Space Grotesk', 'Plus Jakarta Sans', 'Fraunces', 'DM Sans', 'Outfit',
  'Poppins', 'Manrope', 'Sora', 'Instrument Sans', 'Instrument Serif',
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

const PAGE_CHECKS_SOURCE = readFileSync(new URL('./page-checks.js', import.meta.url), 'utf8');

// Runs in the page for each focus stop. `window.__pulupuluFocus` keeps the
// list of elements already visited so a wrap back to the start ends the walk.
const FOCUS_PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { done: true };
  const seen = window.__pulupuluFocus || (window.__pulupuluFocus = new Set());
  if (seen.has(el)) return { done: true };
  seen.add(el);
  if (el.tagName === 'IFRAME') return { skip: true };
  const keys = ['boxShadow', 'borderTopColor', 'borderBottomColor',
    'borderLeftColor', 'borderTopWidth', 'borderBottomWidth', 'backgroundColor', 'backgroundImage', 'color', 'textDecorationLine',
    'textDecorationColor', 'opacity', 'transform', 'filter'];
  // An outline only counts when it paints: the UA nudges outline-offset on focus even when outline is none.
  const snap = (node) => { const s = getComputedStyle(node);
    const ring = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? [s.outlineStyle, s.outlineWidth, s.outlineColor, s.outlineOffset].join(' ') : 'none';
    return ring + '|' + keys.map((k) => s[k]).join('|'); };
  const pseudo = (node) => ['::before', '::after'].map((p) => { const s = getComputedStyle(node, p);
    return s.content === 'none' ? '' : [s.outlineStyle, s.boxShadow, s.backgroundColor, s.borderTopColor, s.opacity, s.transform].join('|'); }).join('#');
  const fingerprint = () => {
    const r = el.getBoundingClientRect();
    const kids = Array.from(el.children).slice(0, 3).map(snap).join('~');
    return [snap(el), pseudo(el), kids, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join('/');
  };
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return { skip: true };
  const focused = fingerprint();
  el.blur();
  const rest = fingerprint();
  el.focus({ preventScroll: true });
  let label = el.tagName.toLowerCase();
  if (el.id) label += '#' + el.id;
  else if (typeof el.className === 'string' && el.className.trim()) label += '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.');
  const text = (el.innerText || el.value || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim();
  if (text) label += ' "' + (text.length > 40 ? text.slice(0, 39) + '…' : text) + '"';
  return { same: focused === rest, label };
})()`;

const FREEZE_MOTION = `(() => {
  const s = document.createElement('style');
  s.id = '__pulupulu_freeze';
  s.textContent = '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important}';
  document.documentElement.appendChild(s);
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  window.__pulupuluFocus = new Set();
  window.scrollTo(0, 0);
  return true;
})()`;

const UNFREEZE = `(() => { document.getElementById('__pulupulu_freeze')?.remove(); delete window.__pulupuluFocus;
  if (document.activeElement) document.activeElement.blur(); return true; })()`;

export function toUrl(target) {
  if (/^(https?|file):\/\//i.test(target)) return target;
  if (/^[a-z]+:/i.test(target) && !/^[a-z]:[\\/]/i.test(target)) return target;
  return pathToFileURL(resolve(target)).href;
}

function slugFor(url, used) {
  let base;
  try {
    const u = new URL(url);
    base = u.protocol === 'file:' ? basename(decodeURIComponent(u.pathname), extname(u.pathname)) : u.hostname + u.pathname;
  } catch {
    base = url;
  }
  base = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'page';
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  used.add(slug);
  return slug;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function toFinding(hit, url, viewport) {
  const rule = RULES_BY_ID.get(hit.rule);
  if (!rule) return null;
  return {
    rule: rule.id,
    severity: rule.severity,
    category: rule.category,
    ref: rule.ref,
    message: hit.message,
    fix: rule.fix,
    file: url,
    line: 0,
    snippet: hit.snippet || '',
    source: 'browser',
    viewport,
    ...(hit.count ? { count: hit.count } : {}),
  };
}

// Browser findings sit on line 0, so key on the snippet; the same element at
// both viewports becomes one finding that lists both.
function dedupeBrowser(findings) {
  const byKey = new Map();
  const out = [];
  for (const f of findings) {
    const key = `${f.file}|${f.rule}|${f.snippet}|${f.message}`;
    const sameEl = `${f.file}|${f.rule}|${f.snippet}`;
    if (byKey.has(key)) continue;
    const prior = f.snippet ? byKey.get(sameEl) : null;
    if (prior && prior.viewport !== f.viewport) {
      prior.viewports = [...new Set([...(prior.viewports || [prior.viewport]), f.viewport])];
      continue;
    }
    byKey.set(key, f);
    if (f.snippet && !byKey.has(sameEl)) byKey.set(sameEl, f);
    out.push(f);
  }
  return out;
}

async function checkFocus(page, max = 25) {
  const invisible = [];
  await page.send('Runtime.evaluate', { expression: FREEZE_MOTION, returnByValue: true });
  try {
    for (let i = 0; i < max; i++) {
      const key = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 };
      await page.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...key });
      await page.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
      const { result } = await page.send('Runtime.evaluate', { expression: FOCUS_PROBE, returnByValue: true });
      const v = result && result.value;
      if (!v || v.done) break;
      if (v.skip) continue;
      if (v.same) invisible.push(v.label);
    }
  } finally {
    await page.send('Runtime.evaluate', { expression: UNFREEZE, returnByValue: true }).catch(() => {});
  }
  return invisible;
}

async function scanOne(browser, url, viewport, { timeoutMs, settleMs, screenshotDir, slug, config }) {
  const started = Date.now();
  const page = await browser.newPage();
  const hits = [];
  const scriptErrors = [];
  const pageMeta = { url, viewport, ms: 0 };
  let screenshot = null;
  try {
    page.on('Runtime.exceptionThrown', ({ exceptionDetails: d }) => {
      const desc = d.exception?.description || d.exception?.value || d.text || 'Uncaught exception';
      scriptErrors.push(String(desc).split('\n')[0]);
    });
    page.on('Runtime.consoleAPICalled', ({ type, args }) => {
      if (type !== 'error') return;
      scriptErrors.push('console.error: ' + args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    });
    page.on('Log.entryAdded', ({ entry }) => {
      // Failed requests (a missing favicon, the broken image) are reported by
      // their own checks; only script-side errors count here.
      if (entry.level === 'error' && entry.source !== 'network' && entry.source !== 'violation' && entry.source !== 'intervention') {
        scriptErrors.push(String(entry.text).split('\n')[0]);
      }
    });

    const vp = VIEWPORTS[viewport];
    await page.send('Emulation.setDeviceMetricsOverride', vp);
    if (vp.mobile) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await page.send('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(() => {});
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.send('Log.enable');

    const loaded = page.waitFor('Page.loadEventFired', timeoutMs).then(() => true, () => false);
    const nav = await page.send('Page.navigate', { url }, { timeoutMs });
    if (nav.errorText) throw new Error(`could not open ${url}: ${nav.errorText}`);
    if (!(await loaded)) pageMeta.loadTimeout = true;
    await sleep(settleMs);

    const options = {
      viewport,
      overusedFonts: OVERUSED_FONTS,
      allowFonts: (config.allow && config.allow.fonts) || [],
    };
    const expression = `(() => { ${PAGE_CHECKS_SOURCE}\n; return pulupuluPageChecks(${JSON.stringify(options)}); })()`;
    const res = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, { timeoutMs });
    if (res.exceptionDetails) throw new Error(`page checks failed on ${url}: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`);
    const value = res.result.value || { hits: [], meta: {} };
    hits.push(...value.hits);
    Object.assign(pageMeta, value.meta);

    if (screenshotDir) {
      const metrics = await page.send('Page.getLayoutMetrics');
      const size = metrics.cssContentSize || metrics.contentSize;
      const width = Math.max(1, Math.ceil(Math.min(size.width, vp.width * 3)));
      const height = Math.max(1, Math.ceil(Math.min(size.height, 16384 / vp.deviceScaleFactor)));
      const shot = await page.send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 },
      }, { timeoutMs });
      mkdirSync(screenshotDir, { recursive: true });
      screenshot = join(screenshotDir, `${slug}-${viewport}.png`);
      writeFileSync(screenshot, Buffer.from(shot.data, 'base64'));
    }

    const unfocusable = await checkFocus(page);
    for (const label of unfocusable) hits.push({ rule: 'focus-invisible', message: 'No visible change when focused with Tab', snippet: label });

    const cap = 8;
    const uniqueErrors = [...new Set(scriptErrors)];
    for (const msg of uniqueErrors.slice(0, cap)) hits.push({ rule: 'script-error', message: 'Script error during load', snippet: msg });
    if (uniqueErrors.length > cap) hits.push({ rule: 'script-error', message: `...and ${uniqueErrors.length - cap} more`, snippet: '', count: uniqueErrors.length - cap });
  } finally {
    await page.close();
    pageMeta.ms = Date.now() - started;
  }
  return { findings: hits.map((h) => toFinding(h, url, viewport)).filter(Boolean), screenshot, meta: pageMeta };
}

export async function scanPages(targets, {
  viewports = ['desktop', 'mobile'],
  screenshotDir,
  timeoutMs = 30000,
  settleMs = 1500,
  config = DEFAULT_CONFIG,
  browserPath,
} = {}) {
  config = { ...DEFAULT_CONFIG, ...(config || {}), allow: { ...DEFAULT_CONFIG.allow, ...((config && config.allow) || {}) } };
  const started = Date.now();
  const findings = [];
  const screenshots = [];
  const errors = [];
  const pages = [];
  const urls = (Array.isArray(targets) ? targets : [targets]).map(toUrl);
  const vps = viewports.filter((v) => VIEWPORTS[v]);
  const path = browserPath || findBrowser();
  const meta = { browser: path, pages, unverifiable: 0, ms: 0 };
  if (!path) {
    errors.push({ target: null, message: 'No Chrome, Edge, or Chromium found. Set PULUPULU_BROWSER to the browser executable.' });
    return { findings, screenshots, errors, meta };
  }

  let browser;
  try {
    browser = await launchBrowser({ path });
    const used = new Set();
    for (const url of urls) {
      const slug = slugFor(url, used);
      for (const viewport of vps) {
        try {
          const res = await scanOne(browser, url, viewport, { timeoutMs, settleMs, screenshotDir, slug, config });
          findings.push(...res.findings);
          if (res.screenshot) screenshots.push(res.screenshot);
          pages.push(res.meta);
          meta.unverifiable += res.meta.unverifiable || 0;
        } catch (err) {
          errors.push({ target: url, viewport, message: err.message });
        }
      }
    }
  } catch (err) {
    errors.push({ target: null, message: err.message });
  } finally {
    if (browser) await browser.close();
  }
  meta.ms = Date.now() - started;
  return { findings: dedupeBrowser(applyConfig(findings, config)), screenshots, errors, meta };
}
