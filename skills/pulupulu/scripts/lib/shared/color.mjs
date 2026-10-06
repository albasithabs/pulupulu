// Pure color helpers shared by the static scanner and the browser scanner.
// A parsed color is { r, g, b, a } with r/g/b in 0..255 and a in 0..1.

const NAMED_SRC =
  'aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 ' +
  'black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 ' +
  'chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff ' +
  'darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgreen:006400 darkgrey:a9a9a9 ' +
  'darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 ' +
  'darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f ' +
  'darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 ' +
  'dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ' +
  'ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 grey:808080 green:008000 greenyellow:adff2f ' +
  'honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa ' +
  'lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff ' +
  'lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgreen:90ee90 lightgrey:d3d3d3 lightpink:ffb6c1 ' +
  'lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 ' +
  'lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 ' +
  'mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 ' +
  'mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 ' +
  'midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 ' +
  'oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 palegoldenrod:eee8aa ' +
  'palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 peachpuff:ffdab9 peru:cd853f ' +
  'pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 red:ff0000 rosybrown:bc8f8f ' +
  'royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 seagreen:2e8b57 seashell:fff5ee ' +
  'sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 slategrey:708090 snow:fffafa ' +
  'springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 tomato:ff6347 turquoise:40e0d0 ' +
  'violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 yellowgreen:9acd32';

export const NAMED_COLORS = Object.fromEntries(NAMED_SRC.split(' ').map((p) => p.split(':')).map(([k, v]) => [k, '#' + v]));

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PALETTE_SRC = {
  slate: 'f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8 64748b 475569 334155 1e293b 0f172a 020617',
  gray: 'f9fafb f3f4f6 e5e7eb d1d5db 9ca3af 6b7280 4b5563 374151 1f2937 111827 030712',
  zinc: 'fafafa f4f4f5 e4e4e7 d4d4d8 a1a1aa 71717a 52525b 3f3f46 27272a 18181b 09090b',
  neutral: 'fafafa f5f5f5 e5e5e5 d4d4d4 a3a3a3 737373 525252 404040 262626 171717 0a0a0a',
  stone: 'fafaf9 f5f5f4 e7e5e4 d6d3d1 a8a29e 78716c 57534e 44403c 292524 1c1917 0c0a09',
  red: 'fef2f2 fee2e2 fecaca fca5a5 f87171 ef4444 dc2626 b91c1c 991b1b 7f1d1d 450a0a',
  orange: 'fff7ed ffedd5 fed7aa fdba74 fb923c f97316 ea580c c2410c 9a3412 7c2d12 431407',
  amber: 'fffbeb fef3c7 fde68a fcd34d fbbf24 f59e0b d97706 b45309 92400e 78350f 451a03',
  yellow: 'fefce8 fef9c3 fef08a fde047 facc15 eab308 ca8a04 a16207 854d0e 713f12 422006',
  lime: 'f7fee7 ecfccb d9f99d bef264 a3e635 84cc16 65a30d 4d7c0f 3f6212 365314 1a2e05',
  green: 'f0fdf4 dcfce7 bbf7d0 86efac 4ade80 22c55e 16a34a 15803d 166534 14532d 052e16',
  emerald: 'ecfdf5 d1fae5 a7f3d0 6ee7b7 34d399 10b981 059669 047857 065f46 064e3b 022c22',
  teal: 'f0fdfa ccfbf1 99f6e4 5eead4 2dd4bf 14b8a6 0d9488 0f766e 115e59 134e4a 042f2e',
  cyan: 'ecfeff cffafe a5f3fc 67e8f9 22d3ee 06b6d4 0891b2 0e7490 155e75 164e63 083344',
  sky: 'f0f9ff e0f2fe bae6fd 7dd3fc 38bdf8 0ea5e9 0284c7 0369a1 075985 0c4a6e 082f49',
  blue: 'eff6ff dbeafe bfdbfe 93c5fd 60a5fa 3b82f6 2563eb 1d4ed8 1e40af 1e3a8a 172554',
  indigo: 'eef2ff e0e7ff c7d2fe a5b4fc 818cf8 6366f1 4f46e5 4338ca 3730a3 312e81 1e1b4b',
  violet: 'f5f3ff ede9fe ddd6fe c4b5fd a78bfa 8b5cf6 7c3aed 6d28d9 5b21b6 4c1d95 2e1065',
  purple: 'faf5ff f3e8ff e9d5ff d8b4fe c084fc a855f7 9333ea 7e22ce 6b21a8 581c87 3b0764',
  fuchsia: 'fdf4ff fae8ff f5d0fe f0abfc e879f9 d946ef c026d3 a21caf 86198f 701a75 4a044e',
  pink: 'fdf2f8 fce7f3 fbcfe8 f9a8d4 f472b6 ec4899 db2777 be185d 9d174d 831843 500724',
  rose: 'fff1f2 ffe4e6 fecdd3 fda4af fb7185 f43f5e e11d48 be123c 9f1239 881337 4c0519',
};

export const TAILWIND_PALETTE = { black: '#000000', white: '#ffffff' };
for (const [family, list] of Object.entries(PALETTE_SRC)) {
  list.split(' ').forEach((hex, i) => {
    TAILWIND_PALETTE[`${family}-${SHADES[i]}`] = '#' + hex;
  });
}

export const TAILWIND_FAMILIES = Object.keys(PALETTE_SRC);
export const NEUTRAL_FAMILIES = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone']);

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function num(token, scale) {
  const t = String(token).trim();
  if (t === 'none') return 0;
  const v = parseFloat(t);
  if (Number.isNaN(v)) return NaN;
  return t.endsWith('%') ? (v / 100) * scale : v;
}

function splitArgs(inner) {
  const [main, alpha] = inner.split('/');
  const parts = main.trim().split(/[\s,]+/).filter(Boolean);
  if (alpha !== undefined) parts[3] = alpha.trim();
  return parts;
}

function parseHue(token) {
  const t = String(token).trim();
  const v = parseFloat(t);
  if (Number.isNaN(v)) return NaN;
  if (t.endsWith('turn')) return v * 360;
  if (t.endsWith('rad')) return (v * 180) / Math.PI;
  if (t.endsWith('grad')) return v * 0.9;
  return v;
}

export function hslToRgb(h, s, l) {
  h = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255 };
}

function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const [r, g, bl] = lin.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055;
    return clamp(v, 0, 1) * 255;
  });
  return { r, g, b: bl };
}

// Returns null for anything it cannot resolve (var(), currentColor, gradients).
export function parseColor(input) {
  if (input == null) return null;
  const s = String(input).trim().toLowerCase().replace(/\s*!important$/, '');
  if (!s) return null;
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (NAMED_COLORS[s]) return parseColor(NAMED_COLORS[s]);
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) {
      const [r, g, b, a] = [...h].map((c) => parseInt(c + c, 16));
      return { r, g, b, a: h.length === 4 ? a / 255 : 1 };
    }
    if (h.length === 6 || h.length === 8) {
      const v = (i) => parseInt(h.slice(i, i + 2), 16);
      return { r: v(0), g: v(2), b: v(4), a: h.length === 8 ? v(6) / 255 : 1 };
    }
    return null;
  }
  m = s.match(/^(rgba?|hsla?|oklch)\(([^()]*)\)$/);
  if (!m) return null;
  const p = splitArgs(m[2]);
  if (p.length < 3) return null;
  const alpha = p[3] === undefined ? 1 : clamp(num(p[3], 1), 0, 1);
  let rgb;
  if (m[1].startsWith('rgb')) rgb = { r: num(p[0], 255), g: num(p[1], 255), b: num(p[2], 255) };
  else if (m[1].startsWith('hsl')) rgb = hslToRgb(parseHue(p[0]), clamp(num(p[1], 1) / (p[1].endsWith('%') ? 1 : 100), 0, 1), clamp(num(p[2], 1) / (p[2].endsWith('%') ? 1 : 100), 0, 1));
  else rgb = oklchToRgb(clamp(num(p[0], 1), 0, 1), num(p[1], 0.4), parseHue(p[2]));
  if ([rgb.r, rgb.g, rgb.b, alpha].some((v) => Number.isNaN(v))) return null;
  return { r: clamp(rgb.r, 0, 255), g: clamp(rgb.g, 0, 255), b: clamp(rgb.b, 0, 255), a: alpha };
}

export function toHex(c) {
  const h = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a * 255) : ''}`;
}

export function composite(fg, bg = { r: 255, g: 255, b: 255, a: 1 }) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

export function luminance(c) {
  const ch = (v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

// Translucent text is composited over the background, a translucent
// background over white (the usual page color when nothing else is known).
export function contrastRatio(fg, bg) {
  const fc = typeof fg === 'string' ? parseColor(fg) : fg;
  const bc0 = typeof bg === 'string' ? parseColor(bg) : bg;
  if (!fc || !bc0) return null;
  const bc = bc0.a < 1 ? composite(bc0) : bc0;
  const tc = fc.a < 1 ? composite(fc, bc) : fc;
  const [l1, l2] = [luminance(tc), luminance(bc)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function toHsl(c) {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l, chroma: 0 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l, chroma: d };
}

export function hue(c) {
  const p = typeof c === 'string' ? parseColor(c) : c;
  return p ? toHsl(p).h : null;
}

export function isChromatic(c) {
  const p = typeof c === 'string' ? parseColor(c) : c;
  if (!p || p.a === 0) return false;
  const { s, chroma } = toHsl(p);
  return chroma >= 0.18 && s >= 0.3;
}

export function isGrayish(c) {
  const p = typeof c === 'string' ? parseColor(c) : c;
  if (!p || p.a === 0) return false;
  return toHsl(p).chroma < 0.16;
}

// 'slate-500', 'blue-600/50', '[#1e293b]', 'white', 'black/40'.
// Returns { color, family, shade } or null.
export function tailwindColor(token) {
  if (!token) return null;
  let t = String(token).trim();
  let alpha = 1;
  const slash = t.match(/^(.*)\/(\[[^\]]+\]|\d+(?:\.\d+)?)$/);
  if (slash) {
    t = slash[1];
    const raw = slash[2].replace(/[[\]]/g, '');
    const v = parseFloat(raw);
    if (!Number.isNaN(v)) alpha = raw.endsWith('%') || v > 1 ? v / 100 : v;
  }
  let color;
  let family = null;
  let shade = null;
  const arb = t.match(/^\[(.+)\]$/);
  if (arb) {
    color = parseColor(arb[1].replace(/_/g, ' ').replace(/^color:/, ''));
  } else if (TAILWIND_PALETTE[t]) {
    color = parseColor(TAILWIND_PALETTE[t]);
    const m = t.match(/^([a-z]+)-(\d+)$/);
    if (m) [family, shade] = [m[1], Number(m[2])];
    else family = t;
  } else return null;
  if (!color) return null;
  return { color: { ...color, a: color.a * clamp(alpha, 0, 1) }, family, shade };
}
