import { textOf } from './_util.mjs';

const clip = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

const lineIn = (ctx, t, idx) => ctx.lineAt(t.offset + idx);

const CTA_EN = ['get started', 'learn more', 'try now', 'explore', 'discover', 'click here', 'read more', 'sign up now'];
const CTA_ID = ['mulai sekarang', 'pelajari lebih lanjut', 'selengkapnya', 'klik di sini', 'coba sekarang', 'jelajahi', 'daftar sekarang'];
const CTA = new Set([...CTA_EN, ...CTA_ID]);

const BUZZ_RE = new RegExp(
  '\\b(' +
    [
      'ai[- ]powered', 'next[- ]generation', 'revolutionary', 'seamless(?:ly)?', 'cutting[- ]edge', 'game[- ]changing',
      'supercharge[sd]?', 'empower(?:s|ing|ed)?', 'streamlin(?:e|es|ed|ing)', 'world[- ]class', 'enterprise[- ]grade',
      'effortless(?:ly)?', 'unleash(?:es|ed)?', 'elevate[sd]?', 'best[- ]in[- ]class', 'state[- ]of[- ]the[- ]art',
      'revolusioner', 'mutakhir', 'terdepan', 'tercanggih', 'inovatif', 'solusi terbaik', 'tanpa batas', 'kelas dunia',
    ].join('|') +
    ')\\b',
  'gi',
);

// The node is (almost) only the number. A trailing dot means a numbered step
// ("1. Buat pesanan"), and K/M/B must not start a word ("2 Bulan").
const STAT_RES = [
  /^#?\d+(?:[.,]\d+)*\s*(k|m|b|rb|jt|juta|ribu)\+?$/iu,
  /^\d+(?:[.,]\d+)*\s*((k|m|b|rb|jt)(?!\p{L}))?\+\s*[\p{L}-]+(\s[\p{L}-]+){0,2}$/iu,
  /^\d+(?:[.,]\d+)*(k|m|b|rb|jt)(?!\p{L})\+?\s*[\p{L}-]+(\s[\p{L}-]+){0,2}$/iu,
  /^\d+(?:[.,]\d+)*\+$/,
  /^(9\d\.\d+|100)%(\s[\p{L}-]+){0,2}$/u,
  /^[1-5](\.\d)?\s*\/\s*5(\s[\p{L}-]+){0,2}$/u,
  /^[1-5]\.\d\s*(stars?|bintang|rating)$/i,
  /^#1(\s[\p{L}-]+){0,4}$/u,
  /^\d+(\.\d+)?x(\s+(faster|more|better|cheaper|lebih\s+\p{L}+))?$/iu,
];
const STAT_SKIP_PARENTS = new Set(['td', 'th', 'option', 'time', 'data', 'sup', 'sub', 'label', 'input', 'textarea']);

const CADENCE_RES = [
  /(^|[.!?]\s+)Not [^.!?]{1,40}\.\s+[A-Z][^.!?]{0,50}[.!]/,
  /(^|[.!?]\s+)No [^.!?]{1,40}\.\s+Just [^.!?]{1,50}[.!]/i,
  /(^|[.!?]\s+)[A-Z][^.!?]{1,30}\.\s+No [^.!?]{1,30}\.(\s|$)/,
  /(^|[.!?]\s+)Bukan [^.!?]{1,40}\.\s+[A-Z][^.!?]{0,50}[.!]/,
];
const THEATER_RE = /\b(security|privacy|productivity|compliance|innovation|agile|performance|hustle|accessibility|design|safety|growth|engagement|kpi|okr)\s+theat(er|re)\b/i;

export default [
  {
    id: 'em-dash',
    name: 'Em dash in UI text',
    category: 'slop',
    severity: 'high',
    ref: 'R-02',
    description: 'An em dash in visible UI text reads as machine-written copy.',
    fix: 'Rewrite with a period, comma, colon, or parentheses.',
    check(ctx) {
      const out = [];
      for (const t of ctx.texts) {
        const re = /—|&mdash;|&#8212;|&#x2014;/gi;
        let m;
        while ((m = re.exec(t.raw))) {
          const where = t.attr ? `${t.attr}="" on <${t.parentTag}>` : t.parentTag ? `<${t.parentTag}> text` : 'text';
          out.push({ line: lineIn(ctx, t, m.index), message: `Em dash in ${where}: "${clip(t.text)}"` });
        }
      }
      return out;
    },
  },
  {
    id: 'generic-cta',
    name: 'Generic call to action',
    category: 'slop',
    severity: 'low',
    ref: 'R-15',
    description: 'A button or link label that says nothing about what happens next.',
    fix: 'Name the outcome: "Start a free trial", "See pricing", "Download the report".',
    check(ctx) {
      const out = [];
      for (const tag of ctx.tags) {
        if (tag.close) continue;
        const isControl = tag.name === 'a' || tag.name === 'button' || tag.attrs.role === 'button' || /(Button|Link|Cta|CTA)$/.test(tag.rawName);
        let label = '';
        if (isControl) label = textOf(ctx, tag.index);
        else if (tag.name === 'input' && /^(submit|button)$/i.test(String(tag.attrs.type))) label = String(tag.attrs.value || '');
        const norm = label.toLowerCase().replace(/[→↗›»>!.\s-]+$/u, '').replace(/\s+/g, ' ').trim();
        if (norm && CTA.has(norm)) out.push({ line: tag.line, message: `Generic CTA "${label.trim()}" on <${tag.rawName}>` });
      }
      return out;
    },
  },
  {
    id: 'buzzword',
    name: 'Marketing buzzword',
    category: 'slop',
    severity: 'low',
    ref: 'R-16',
    description: 'Empty marketing vocabulary in visible text.',
    fix: 'Replace the buzzword with the concrete thing the product does.',
    check(ctx) {
      const out = [];
      for (const t of ctx.texts) {
        if (t.attr === 'alt') continue;
        BUZZ_RE.lastIndex = 0;
        let m;
        while ((m = BUZZ_RE.exec(t.raw))) out.push({ line: lineIn(ctx, t, m.index), message: `Buzzword "${m[0]}" in "${clip(t.text)}"` });
      }
      return out;
    },
  },
  {
    id: 'fake-stat',
    name: 'Unsourced stat',
    category: 'honesty',
    severity: 'medium',
    ref: 'R-17',
    description: 'A stat-block number (10K+, 99.9%, 4.9/5) that may be invented.',
    fix: 'Use a real, sourced number, or remove the stat block.',
    check(ctx) {
      const out = [];
      for (const t of ctx.texts) {
        if (t.attr || STAT_SKIP_PARENTS.has(t.parentTag) || t.text.length > 40) continue;
        const s = t.text.replace(/\s+/g, ' ').trim();
        if (STAT_RES.some((re) => re.test(s))) out.push({ line: t.line, message: `Stat-shaped claim "${s}": confirm it is real and sourced` });
      }
      return out;
    },
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem ipsum',
    category: 'honesty',
    severity: 'high',
    ref: 'R-38',
    description: 'Placeholder Latin left in visible text.',
    fix: 'Write the real copy, or a plain draft of it.',
    check(ctx) {
      const out = [];
      for (const t of ctx.texts) {
        const m = /lorem ipsum|dolor sit amet/i.exec(t.raw);
        if (m) out.push({ line: lineIn(ctx, t, m.index), message: `Placeholder text "${clip(t.text, 40)}"` });
      }
      return out;
    },
  },
  {
    id: 'cadence-copy',
    name: 'Aphorism cadence copy',
    category: 'slop',
    severity: 'low',
    ref: 'R-16',
    description: 'Repeated "Not X. Y." / "No X. Just Y." lines, or "X theater" framing.',
    fix: 'Say the claim plainly once; drop the punchy contrast formula.',
    check(ctx) {
      const out = [];
      const cadence = [];
      for (const t of ctx.texts) {
        if (t.attr) continue;
        if (CADENCE_RES.some((re) => re.test(t.text))) cadence.push(t);
        const th = THEATER_RE.exec(t.raw);
        if (th) out.push({ line: lineIn(ctx, t, th.index), message: `"${th[0]}" framing in "${clip(t.text)}"` });
      }
      if (cadence.length >= 3) {
        for (const t of cadence) out.push({ line: t.line, message: `Aphorism cadence (${cadence.length} in file): "${clip(t.text)}"` });
      }
      return out;
    },
  },
];
