import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { DEFAULT_CONFIG, applyConfig, applyWaivers, parseInlineWaivers } from '../shared/config.mjs';
import { dedupe } from '../shared/findings.mjs';
import { buildContext } from './extract.mjs';
import a11y from './rules/a11y.mjs';
import color from './rules/color.mjs';
import contrast from './rules/contrast.mjs';
import copy from './rules/copy.mjs';
import decoration from './rules/decoration.mjs';
import honesty from './rules/honesty.mjs';
import icons from './rules/icons.mjs';
import layout from './rules/layout.mjs';
import motion from './rules/motion.mjs';
import surface from './rules/surface.mjs';
import type from './rules/type.mjs';

export const STATIC_RULES = [...copy, ...honesty, ...a11y, ...type, ...color, ...contrast, ...decoration, ...surface, ...icons, ...layout, ...motion];

export function listStaticRules() {
  return STATIC_RULES.map(({ check, ...meta }) => meta);
}

function normalizeConfig(config) {
  const c = config && typeof config === 'object' ? config : {};
  return {
    ...DEFAULT_CONFIG,
    ...c,
    ignoreRules: Array.isArray(c.ignoreRules) ? c.ignoreRules : [],
    allow: { ...DEFAULT_CONFIG.allow, ...(c.allow || {}) },
    severity: c.severity || {},
  };
}

export function scanText(text, { file = '', ext, config } = {}) {
  const cfg = normalizeConfig(config);
  const src = typeof text === 'string' ? text : String(text ?? '');
  const ctx = buildContext(src, { file, ext: ext || extname(file || '') });
  ctx.config = cfg;
  const debug = [...ctx.errors];
  const findings = [];
  for (const rule of STATIC_RULES) {
    if (cfg.ignoreRules.includes(rule.id)) continue;
    let hits;
    try {
      hits = rule.check(ctx) || [];
    } catch (err) {
      debug.push(`${rule.id}: ${err && err.stack ? err.stack.split('\n').slice(0, 2).join(' ') : err}`);
      continue;
    }
    for (const h of hits) {
      const line = h.line || 0;
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        category: rule.category,
        ref: rule.ref,
        message: h.message || rule.name,
        fix: h.fix || rule.fix,
        file,
        line,
        snippet: String(h.snippet ?? (ctx.lines[line - 1] || '').trim()).slice(0, 200),
        source: 'static',
      });
    }
  }
  findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
  const out = dedupe(applyConfig(applyWaivers(findings, parseInlineWaivers(src)), cfg));
  if (process.env.PULUPULU_DEBUG) Object.defineProperty(out, 'debug', { value: debug, enumerable: false });
  return out;
}

export function scanFile(path, config) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return [];
  }
  return scanText(text, { file: path, ext: extname(path), config });
}
