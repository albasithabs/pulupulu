// Turns file text into a ScanContext (see docs/ENGINE.md). Never throws:
// every stage is guarded so a parse failure yields a partial context.

const CSS_EXT = new Set(['.css', '.scss', '.sass', '.less']);
const SCRIPT_EXT = new Set(['.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
const RAW_TAGS = new Set(['script', 'style']);
const NO_TEXT_TAGS = new Set(['script', 'style', 'code', 'pre', 'kbd', 'samp', 'svg', 'math']);
const TEXT_ATTRS = new Set(['alt', 'title', 'placeholder', 'aria-label']);
const CLASS_CALL_RE = /\b(?:clsx|cn|classnames|classNames|twMerge|twJoin|cva|tw)\s*\(/g;

export function kindOf(ext) {
  const e = String(ext || '').toLowerCase();
  if (CSS_EXT.has(e)) return 'css';
  if (SCRIPT_EXT.has(e)) return 'script';
  return 'markup';
}

export function makeLineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

const blank = (s) => s.replace(/[^\n\r]/g, ' ');

// Index just past the quoted string at i. Plain strings stop at a newline so a
// stray apostrophe in JSX text cannot swallow the rest of the file.
export function skipString(text, i) {
  const q = text[i];
  if (q === '`') return skipTemplate(text, i);
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === '\\') j += 2;
    else if (c === q) return j + 1;
    else if (c === '\n') return j;
    else j++;
  }
  return j;
}

function skipTemplate(text, i) {
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === '\\') j += 2;
    else if (c === '`') return j + 1;
    else if (c === '$' && text[j + 1] === '{') j = skipBalanced(text, j + 1, '{', '}');
    else j++;
  }
  return j;
}

// Index just past the bracket matching the one at i, skipping strings.
export function skipBalanced(text, i, open, close) {
  let depth = 0;
  let j = i;
  while (j < text.length) {
    const c = text[j];
    if (c === '"' || c === "'" || c === '`') {
      j = skipString(text, j);
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return j + 1;
    }
    j++;
  }
  return j;
}

// Blanks comments (and other non-visible regions) while keeping offsets and newlines.
export function maskComments(text, kind) {
  let out = text;
  const blankRange = (re) => {
    out = out.replace(re, (m) => blank(m));
  };
  if (kind === 'css') {
    blankRange(/\/\*[\s\S]*?(?:\*\/|$)/g);
    blankRange(/(^|[^:"'\\])\/\/[^\n]*/g);
    return out;
  }
  if (kind === 'markup') {
    blankRange(/<!--[\s\S]*?(?:-->|$)/g);
    blankRange(/\{\{--[\s\S]*?--\}\}/g);
    blankRange(/<\?(?:php|=)?[\s\S]*?(?:\?>|$)/g);
    blankRange(/@php\b[\s\S]*?@endphp/g);
    if (/^\s*---\r?\n/.test(out)) blankRange(/^\s*---\r?\n[\s\S]*?\r?\n---/);
    return out;
  }
  const chars = out.split('');
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      i = skipString(text, i);
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      for (let k = i; k < stop; k++) if (chars[k] !== '\n' && chars[k] !== '\r') chars[k] = ' ';
      i = stop;
    } else if (c === '/' && text[i + 1] === '/' && text[i - 1] !== ':') {
      let k = i;
      while (k < text.length && text[k] !== '\n') chars[k++] = ' ';
      i = k;
    } else i++;
  }
  return chars.join('');
}

// String literals inside a JS/Vue expression, with template `${}` parts
// replaced by a space and searched recursively.
export function stringLiterals(expr, base = 0) {
  const out = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === '"' || c === "'") {
      const end = skipString(expr, i);
      out.push({ value: expr.slice(i + 1, end - 1), offset: base + i + 1 });
      i = end;
    } else if (c === '`') {
      const end = skipTemplate(expr, i);
      const body = expr.slice(i + 1, end - 1);
      let flat = '';
      let k = 0;
      while (k < body.length) {
        if (body[k] === '$' && body[k + 1] === '{') {
          const close = skipBalanced(body, k + 1, '{', '}');
          out.push(...stringLiterals(body.slice(k + 2, close - 1), base + i + 1 + k + 2));
          flat += ' ';
          k = close;
        } else flat += body[k++];
      }
      out.push({ value: flat, offset: base + i + 1 });
      i = end;
    } else i++;
  }
  return out;
}

// CSS (also SCSS/LESS nesting) into rules: { selector, fullSelector, decls, line, atRule, atRules }.
export function parseCss(src, base, lineAt, sink = {}) {
  const text = maskComments(src, 'css');
  const rules = [];
  const stack = [];
  let start = 0;
  let paren = 0;
  const addDecl = (segStart, segEnd) => {
    const seg = text.slice(segStart, segEnd);
    const lead = seg.length - seg.trimStart().length;
    const trimmed = seg.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('@')) {
      const at = { value: trimmed, line: lineAt(base + segStart + lead) };
      if (/^@import\b/i.test(trimmed) && sink.imports) sink.imports.push(at);
      if (/^@apply\s/i.test(trimmed) && sink.applies) sink.applies.push({ ...at, selector: stack.length ? stack[stack.length - 1].prelude : '' });
      return;
    }
    const colon = trimmed.indexOf(':');
    if (colon <= 0 || !stack.length) return;
    const prop = trimmed.slice(0, colon).trim().toLowerCase();
    if (!/^(--[\w-]+|-?[a-z][a-z-]*)$/.test(prop)) return;
    const frame = stack[stack.length - 1];
    if (!frame.rule) {
      const sels = stack.filter((f) => !f.at).map((f) => f.prelude);
      const ats = stack.filter((f) => f.at).map((f) => f.prelude);
      frame.rule = {
        selector: frame.prelude,
        fullSelector: sels.join(' ') || frame.prelude,
        decls: [],
        line: frame.line,
        atRule: ats.length ? ats[ats.length - 1] : null,
        atRules: ats,
      };
      rules.push(frame.rule);
    }
    frame.rule.decls.push({ prop, value: trimmed.slice(colon + 1).trim(), line: lineAt(base + segStart + lead) });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      i = skipString(text, i) - 1;
      continue;
    }
    if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    if (paren > 0) continue;
    if (c === '{') {
      const raw = text.slice(start, i);
      const lead = raw.length - raw.trimStart().length;
      const prelude = raw.trim().replace(/\s+/g, ' ');
      stack.push({ prelude, at: prelude.startsWith('@'), line: lineAt(base + start + lead), rule: null });
      start = i + 1;
    } else if (c === ';') {
      addDecl(start, i);
      start = i + 1;
    } else if (c === '}') {
      addDecl(start, i);
      stack.pop();
      start = i + 1;
    }
  }
  if (start < text.length && !stack.length) addDecl(start, text.length);
  return rules;
}

const UNITLESS = new Set(['line-height', 'font-weight', 'opacity', 'z-index', 'flex', 'flex-grow', 'flex-shrink', 'order', 'scale', 'zoom']);

// JSX style={{ fontSize: 11, color: 'red' }} -> decls.
export function parseStyleObject(expr, base, lineAt) {
  const decls = [];
  const re = /([A-Za-z$_][\w$]*|'[^'\n]*'|"[^"\n]*")\s*:\s*('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`[^`]*`|-?\d*\.?\d+(?![\w.])|[^,}\n]+)/g;
  let m;
  while ((m = re.exec(expr))) {
    const key = m[1].replace(/^['"]|['"]$/g, '');
    const prop = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (ch) => '-' + ch.toLowerCase()).replace(/^(webkit|moz|ms)-/, '-$1-');
    let value = m[2].trim();
    if (/^['"`]/.test(value)) value = value.slice(1, -1);
    else if (/^-?\d*\.?\d+$/.test(value) && !UNITLESS.has(prop) && Number(value) !== 0) value += 'px';
    decls.push({ prop, value, line: lineAt(base + m.index) });
  }
  return decls;
}

// A pasted framework build (Tailwind output, normalize) is not the author's design.
export const isVendorCss = (src) => /\/\*!\s*(tailwindcss|normalize\.css|bootstrap) v?\d/i.test(src.slice(0, 2000));

const KEYWORDS_BEFORE_JSX = new Set(['return', 'case', 'default', 'yield', 'await', 'in', 'of', 'else', 'do']);

function isTagStart(s, lt, kind, inElement) {
  const next = s[lt + 1];
  if (!next) return false;
  if (next === '/') return /[A-Za-z>]/.test(s[lt + 2] || '');
  if (next === '!') return kind !== 'script';
  if (!/[A-Za-z>]/.test(next)) return false;
  if (kind !== 'script' || inElement) return true;
  let p = lt - 1;
  while (p >= 0 && /\s/.test(s[p])) p--;
  if (p < 0) return true;
  const c = s[p];
  // `a<b`, `fn()<x`, `Array<string>` are comparisons or generics, not JSX.
  if (/[\w$]/.test(c)) {
    let w = p;
    while (w >= 0 && /[\w$]/.test(s[w])) w--;
    return KEYWORDS_BEFORE_JSX.has(s.slice(w + 1, p + 1));
  }
  return !/[)\]]/.test(c);
}

function parseAttrs(s, j) {
  const attrs = {};
  const attrPos = {};
  const n = s.length;
  let guard = 0;
  while (j < n && guard++ < 500) {
    while (j < n && /\s/.test(s[j])) j++;
    if (s[j] === '>') return { attrs, attrPos, end: j + 1, selfClosing: false };
    if (s[j] === '/' && s[j + 1] === '>') return { attrs, attrPos, end: j + 2, selfClosing: true };
    if (s[j] === '{') {
      attrs['...'] = true;
      j = skipBalanced(s, j, '{', '}');
      continue;
    }
    const m = /^[^\s=>/"'{]+/.exec(s.slice(j, j + 200));
    if (!m) {
      j++;
      continue;
    }
    const name = m[0].toLowerCase();
    j += m[0].length;
    let k = j;
    while (k < n && /\s/.test(s[k])) k++;
    if (s[k] !== '=') {
      attrs[name] = true;
      attrPos[name] = j - m[0].length;
      continue;
    }
    k++;
    while (k < n && /\s/.test(s[k])) k++;
    const q = s[k];
    if (q === '"' || q === "'") {
      const close = s.indexOf(q, k + 1);
      const end = close === -1 ? n : close;
      attrs[name] = s.slice(k + 1, end);
      attrPos[name] = k + 1;
      j = end + 1;
    } else if (q === '{') {
      const end = skipBalanced(s, k, '{', '}');
      attrs[name] = s.slice(k, end);
      attrPos[name] = k;
      j = end;
    } else {
      const v = /^[^\s>]*/.exec(s.slice(k, k + 500))[0].replace(/\/$/, '');
      attrs[name] = v;
      attrPos[name] = k;
      j = k + Math.max(v.length, 1);
    }
  }
  return { attrs, attrPos, end: n, selfClosing: false };
}

// Text with `{...}` / `{{...}}` expressions blanked, keeping offsets. A pure
// string-literal child like {'Hello'} stays visible.
function stripExpressions(raw) {
  const chars = raw.split('');
  const blankTo = (a, b) => {
    for (let k = a; k < b; k++) if (chars[k] !== '\n') chars[k] = ' ';
  };
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '}') {
      blankTo(0, i + 1);
      i++;
    } else if (raw[i] === '{') {
      const end = skipBalanced(raw, i, '{', '}');
      const inner = raw.slice(i + 1, end - 1);
      const lit = raw[end - 1] === '}' ? /^\s*(['"`])([^'"`$]*)\1\s*$/.exec(inner) : null;
      if (lit) {
        const litStart = i + 1 + inner.indexOf(lit[1]) + 1;
        blankTo(i, litStart);
        blankTo(litStart + lit[2].length, end);
      } else blankTo(i, end);
      i = end;
    } else i++;
  }
  return chars.join('');
}

const ENTITIES = {
  '&mdash;': '—', '&#8212;': '—', '&#x2014;': '—', '&ndash;': '–', '&amp;': '&', '&nbsp;': ' ', '&rarr;': '→', '&#8594;': '→',
  '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&hellip;': '…',
};
export const decodeEntities = (s) => s.replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);

const looksLikeCode = (t) => /=>|;\s*$|^\s*(const|let|var|import|export|function|return|if)\b|\)\s*\{|\}\s*\)/.test(t);

function classTokensFromAttr(name, value, offset) {
  if (value === true || value == null) return [];
  const v = String(value);
  const isBinding = name.startsWith(':') || name.startsWith('v-bind:') || name.startsWith('x-bind:') || name.startsWith('[');
  if (v.startsWith('{') || isBinding) return stringLiterals(v, offset).map((l) => l.value);
  const out = [];
  const flat = v.replace(/\{\{[\s\S]*?\}\}|\{[^{}]*\}|\$\{[^}]*\}/g, (m) => {
    out.push(...stringLiterals(m).map((l) => l.value));
    return ' ';
  });
  return [flat, ...out];
}

const CLASS_ATTR_RE = /^(class|classname|:class|v-bind:class|x-bind:class|\[class\]|\[ngclass\]|tw)$/;

function collectTagClasses(ctx, tag, covered) {
  const parts = [];
  let line = 0;
  for (const [name, value] of Object.entries(tag.attrs)) {
    if (CLASS_ATTR_RE.test(name)) {
      parts.push(...classTokensFromAttr(name, value, tag.attrPos[name]));
      if (!line) line = ctx.lineAt(tag.attrPos[name]);
      if (typeof value === 'string') covered.push([tag.attrPos[name], tag.attrPos[name] + value.length]);
    } else if (name.startsWith('class:')) {
      parts.push(name.slice(6));
      if (!line) line = ctx.lineAt(tag.attrPos[name]);
    }
  }
  const value = parts.join(' ').replace(/\s+/g, ' ').trim();
  tag.classes = value;
  tag.classLine = line || tag.line;
  if (value) ctx.classLists.push({ value, line: tag.classLine, tag: tag.name, tagIndex: tag.index });
}

function collectTagStyle(ctx, tag) {
  const decls = [];
  for (const name of ['style', ':style', 'v-bind:style']) {
    const v = tag.attrs[name];
    if (typeof v !== 'string') continue;
    const pos = tag.attrPos[name];
    const objStart = v.indexOf('{');
    if (v.startsWith('{') || name !== 'style') {
      if (objStart !== -1) decls.push(...parseStyleObject(v.slice(objStart), pos + objStart, ctx.lineAt));
    } else {
      const rules = parseCss('{' + v + '}', pos - 1, ctx.lineAt);
      for (const r of rules) decls.push(...r.decls);
    }
  }
  tag.style = decls;
  if (decls.length) {
    ctx.css.push({ selector: `<${tag.name}>`, fullSelector: `<${tag.name}>`, decls, line: tag.line, atRule: null, atRules: [], inline: true, tagIndex: tag.index });
  }
}

function collectAttrTexts(ctx, tag) {
  for (const name of TEXT_ATTRS) {
    let v = tag.attrs[name];
    if (typeof v !== 'string') continue;
    let pos = tag.attrPos[name];
    if (v.startsWith('{')) {
      const lit = /^\{\s*(['"`])([^'"`$]*)\1\s*\}$/.exec(v);
      if (!lit) continue;
      pos += v.indexOf(lit[1]) + 1;
      v = lit[2];
    }
    const text = decodeEntities(v.replace(/\{\{[\s\S]*?\}\}/g, ' ').replace(/\s+/g, ' ').trim());
    if (text) ctx.texts.push({ text, raw: v, offset: pos, line: ctx.lineAt(pos), parentTag: tag.name, tagIndex: tag.index, attr: name });
  }
}

function collectClassCalls(ctx, masked, covered) {
  CLASS_CALL_RE.lastIndex = 0;
  let m;
  while ((m = CLASS_CALL_RE.exec(masked))) {
    const open = m.index + m[0].length - 1;
    if (covered.some(([a, b]) => open >= a && open < b)) continue;
    const end = skipBalanced(masked, open, '(', ')');
    const lits = stringLiterals(masked.slice(open, end), open);
    const value = lits.map((l) => l.value).join(' ').replace(/\s+/g, ' ').trim();
    if (value) ctx.classLists.push({ value, line: ctx.lineAt(m.index), tag: null, tagIndex: -1 });
  }
}

function tokenize(ctx, masked) {
  const { tags, texts, css, lineAt, kind } = ctx;
  const n = masked.length;
  const stack = [];
  const covered = [];
  const caseless = kind === 'markup';
  let i = 0;
  let textStart = 0;

  const insideNoText = () => stack.some((k) => NO_TEXT_TAGS.has(tags[k].name));
  const pushText = (start, end) => {
    if (end <= start || insideNoText()) return;
    if (kind === 'script' && !stack.length) return;
    const raw = stripExpressions(masked.slice(start, end));
    const norm = decodeEntities(raw.replace(/\s+/g, ' ').trim());
    if (!norm || (kind === 'script' && looksLikeCode(norm))) return;
    const lead = raw.length - raw.trimStart().length;
    const parent = stack.length ? stack[stack.length - 1] : -1;
    texts.push({ text: norm, raw, offset: start, line: lineAt(start + lead), parentTag: parent >= 0 ? tags[parent].name : null, tagIndex: parent });
  };

  while (i < n) {
    const lt = masked.indexOf('<', i);
    if (lt === -1) break;
    if (!isTagStart(masked, lt, kind, stack.length > 0)) {
      i = lt + 1;
      continue;
    }
    if (masked[lt + 1] === '!') {
      pushText(textStart, lt);
      const gt = masked.indexOf('>', lt);
      i = textStart = gt === -1 ? n : gt + 1;
      continue;
    }
    if (masked[lt + 1] === '/') {
      const m = /^<\/\s*([A-Za-z][\w.:-]*)?\s*>/.exec(masked.slice(lt, lt + 200));
      if (!m) {
        i = lt + 1;
        continue;
      }
      pushText(textStart, lt);
      const rawName = m[1] || '#fragment';
      const lname = rawName.toLowerCase();
      const names = stack.map((k) => (caseless ? tags[k].name : tags[k].rawName));
      const pos = names.lastIndexOf(caseless ? lname : rawName);
      const closeIndex = tags.length;
      if (pos !== -1) {
        while (stack.length > pos) {
          const k = stack.pop();
          tags[k].last = closeIndex;
          tags[k].end = lt + m[0].length;
        }
      }
      tags.push({ name: lname, rawName, attrs: {}, attrPos: {}, line: lineAt(lt), close: true, selfClosing: false, depth: stack.length, index: closeIndex, parent: -1, start: lt, classes: '' });
      i = textStart = lt + m[0].length;
      continue;
    }
    const nm = /^<([A-Za-z][\w.:-]*)?/.exec(masked.slice(lt, lt + 120));
    const rawName = nm[1] || '#fragment';
    const lname = rawName.toLowerCase();
    pushText(textStart, lt);
    const { attrs, attrPos, end, selfClosing } = parseAttrs(masked, lt + nm[0].length);
    const index = tags.length;
    const htmlName = caseless || rawName === lname;
    const tag = {
      name: lname, rawName, attrs, attrPos, line: lineAt(lt), close: false, selfClosing,
      depth: stack.length, index, parent: stack.length ? stack[stack.length - 1] : -1, start: lt, end, last: index, classes: '',
    };
    tags.push(tag);
    collectTagClasses(ctx, tag, covered);
    collectTagStyle(ctx, tag);
    collectAttrTexts(ctx, tag);
    i = textStart = end;
    if (RAW_TAGS.has(lname) && !selfClosing && htmlName) {
      const closeRe = new RegExp(`</${lname}\\s*>`, 'ig');
      closeRe.lastIndex = end;
      const cm = closeRe.exec(masked);
      const stop = cm ? cm.index : n;
      if (lname === 'style') {
        let body = ctx.text.slice(end, stop);
        let base = end;
        const tpl = /^(\s*\{\s*`)([\s\S]*)`\s*\}\s*$/.exec(body);
        if (tpl) {
          base += tpl[1].length;
          body = tpl[2];
        }
        if (!isVendorCss(body)) css.push(...parseCss(body, base, lineAt, ctx.sink));
      }
      i = textStart = cm ? cm.index + cm[0].length : n;
      continue;
    }
    if (!selfClosing && !(VOID_TAGS.has(lname) && htmlName)) stack.push(index);
  }
  pushText(textStart, n);
  collectClassCalls(ctx, masked, covered);
}

// styled.div`...`, css`...`, createGlobalStyle`...`, keyframes`...`
function collectCssInJs(ctx, masked) {
  const re = /\b(styled(?:\.[A-Za-z]+|\([^()]*\))(?:\.attrs\([^)]*\))?|css|createGlobalStyle|injectGlobal|keyframes)\s*`/g;
  let m;
  while ((m = re.exec(masked))) {
    const tick = m.index + m[0].length - 1;
    const end = skipString(masked, tick);
    let body = ctx.text.slice(tick + 1, end - 1);
    body = body.replace(/\$\{[^{}]*\}/g, (s) => ' '.repeat(s.length));
    const head = m[1] === 'keyframes' ? '@keyframes styled{' : m[1] === 'createGlobalStyle' || m[1] === 'injectGlobal' ? '' : '&{';
    const wrapped = head + body + (head ? '}' : '');
    ctx.css.push(...parseCss(wrapped, tick + 1 - head.length, ctx.lineAt, ctx.sink));
    re.lastIndex = end;
  }
}

function linkSiblings(tags) {
  const lastChild = new Map();
  for (const t of tags) {
    t.prevSibling = -1;
    t.nextSibling = -1;
    t.children = [];
  }
  for (const t of tags) {
    if (t.close) continue;
    if (t.parent >= 0) tags[t.parent].children.push(t.index);
    const prev = lastChild.get(t.parent);
    if (prev !== undefined) {
      t.prevSibling = prev;
      tags[prev].nextSibling = t.index;
    }
    lastChild.set(t.parent, t.index);
  }
}

export function buildContext(text, { file = '', ext = '' } = {}) {
  const src = typeof text === 'string' ? text : String(text ?? '');
  const kind = kindOf(ext);
  const lineAt = makeLineIndex(src);
  const ctx = {
    file, ext: String(ext).toLowerCase(), text: src, lines: src.split(/\r?\n/), kind,
    hasMarkup: false, css: [], classLists: [], tags: [], texts: [], fullDocument: false,
    masked: src, lineAt, cssImports: [], errors: [],
  };
  ctx.sink = { imports: ctx.cssImports, applies: [] };
  const guard = (stage, fn) => {
    try {
      fn();
    } catch (err) {
      ctx.errors.push(`${stage}: ${err && err.message}`);
    }
  };
  guard('mask', () => {
    ctx.masked = maskComments(src, kind);
  });
  if (kind === 'css') {
    guard('css', () => {
      if (!isVendorCss(src)) ctx.css = parseCss(src, 0, lineAt, ctx.sink);
    });
  } else {
    guard('tokenize', () => tokenize(ctx, ctx.masked));
    guard('siblings', () => linkSiblings(ctx.tags));
    if (kind === 'script') guard('css-in-js', () => collectCssInJs(ctx, ctx.masked));
  }
  for (const a of ctx.sink.applies) {
    ctx.classLists.push({ value: a.value.replace(/^@apply\s+/i, '').replace(/\s*!important\s*$/, ''), line: a.line, tag: null, tagIndex: -1, selector: a.selector });
  }
  ctx.fullDocument = /<html[\s>]/i.test(ctx.masked);
  ctx.hasMarkup = kind === 'markup' || (kind === 'script' && ctx.tags.some((t) => !t.close && t.name !== '#fragment'));
  return ctx;
}

// Visible text inside a tag and its descendants.
export function textOf(ctx, tagIndex) {
  const t = ctx.tags[tagIndex];
  if (!t) return '';
  return ctx.texts
    .filter((x) => !x.attr && x.tagIndex >= tagIndex && x.tagIndex <= t.last && (x.tagIndex === tagIndex || isDescendant(ctx, x.tagIndex, tagIndex)))
    .map((x) => x.text)
    .join(' ')
    .trim();
}

export function isDescendant(ctx, index, ancestor) {
  let p = ctx.tags[index] ? ctx.tags[index].parent : -1;
  let guard = 0;
  while (p >= 0 && guard++ < 500) {
    if (p === ancestor) return true;
    p = ctx.tags[p].parent;
  }
  return false;
}

export function ancestors(ctx, index) {
  const out = [];
  let p = ctx.tags[index] ? ctx.tags[index].parent : -1;
  while (p >= 0 && out.length < 500) {
    out.push(ctx.tags[p]);
    p = ctx.tags[p].parent;
  }
  return out;
}
