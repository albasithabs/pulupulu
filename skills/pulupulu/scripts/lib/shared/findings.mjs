// Finding shape shared by the static scanner, the browser scanner, the hook and the CLI.
//
// {
//   rule:     'gradient-text',          // rule id, kebab-case
//   severity: 'high' | 'medium' | 'low',// high = Hard Gate, medium = Purpose Gate, low = Quality Lock
//   category: 'slop' | 'quality' | 'a11y' | 'honesty' | 'mobile',
//   ref:      'R-01',                   // rule in skills/pulupulu/rules/core.md, or a rules/*.md anchor
//   message:  'Gradient text on a heading',
//   fix:      'Use a solid color; carry emphasis with weight or size.',
//   file:     'src/Hero.jsx',           // path relative to cwd, or the URL for browser findings
//   line:     12,                       // 1-based, 0 when unknown (browser findings)
//   snippet:  'bg-clip-text text-transparent',
//   source:   'static' | 'browser',
//   viewport: 'desktop' | 'mobile',     // browser findings only
// }

export const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
export const SEVERITY_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' };

export function sortFindings(findings) {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      String(a.file).localeCompare(String(b.file)) ||
      (a.line || 0) - (b.line || 0) ||
      a.rule.localeCompare(b.rule),
  );
}

// Same rule on the same line of the same file is one finding. Browser
// findings all sit on line 0, so the snippet tells their elements apart.
export function dedupe(findings) {
  const seen = new Set();
  const out = [];
  for (const f of findings) {
    const key = `${f.file}|${f.line}|${f.rule}|${f.line ? '' : f.snippet || f.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

export function summarize(findings) {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

export function formatText(findings, { color = false } = {}) {
  if (findings.length === 0) return 'pulupulu: no findings.\n';
  const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const tone = { high: '31', medium: '33', low: '36' };
  const lines = [];
  let lastFile = null;
  for (const f of sortFindings(findings)) {
    if (f.file !== lastFile) {
      if (lastFile !== null) lines.push('');
      lines.push(paint('1', f.file));
      lastFile = f.file;
    }
    const where = f.line ? `${f.line}`.padStart(5) : f.viewport ? f.viewport.padStart(7) : '     ';
    const sev = paint(tone[f.severity], SEVERITY_LABEL[f.severity].padEnd(4));
    lines.push(`${where}  ${sev} ${f.rule} (${f.ref})  ${f.message}`);
    if (f.snippet) lines.push(`         ${paint('2', truncate(f.snippet, 110))}`);
    if (f.fix) lines.push(`         fix: ${f.fix}`);
  }
  const c = summarize(findings);
  lines.push('');
  lines.push(`pulupulu: ${findings.length} findings (${c.high} high, ${c.medium} medium, ${c.low} low).`);
  return lines.join('\n') + '\n';
}

export function formatJson(findings, extra = {}) {
  return JSON.stringify({ tool: 'pulupulu', ...extra, summary: summarize(findings), findings: sortFindings(findings) }, null, 2) + '\n';
}

function truncate(s, n) {
  const flat = String(s).replace(/\s+/g, ' ').trim();
  return flat.length > n ? flat.slice(0, n - 1) + '…' : flat;
}
