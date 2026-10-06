import { readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

// Plain .js/.ts are included because React code often lives there; the
// scanner skips files with no markup or styles.
export const UI_EXTENSIONS = new Set([
  '.html', '.htm', '.css', '.scss', '.sass', '.less',
  '.jsx', '.tsx', '.js', '.ts', '.mjs', '.vue', '.svelte', '.astro',
  '.php', '.twig', '.njk', '.hbs', '.ejs', '.liquid', '.erb',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit',
  '.output', 'coverage', 'vendor', '.turbo', '.cache', '.vercel', '.wxt',
  'storage', 'bootstrap', '.pulupulu',
]);

export function isUiFile(file) {
  const lower = file.toLowerCase();
  if (/\.min\.(js|css)$/.test(lower) || /\.(test|spec)\.[jt]sx?$/.test(lower) || lower.endsWith('.d.ts')) return false;
  return UI_EXTENSIONS.has(extname(lower));
}

export function collectFiles(targets, { limit = 5000 } = {}) {
  const out = [];
  const visit = (p, explicit) => {
    if (out.length >= limit) return;
    let st;
    try {
      st = statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) {
        if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
        visit(join(p, name), false);
      }
    } else if (st.isFile() && (explicit || isUiFile(p)) && st.size < 1_500_000) {
      out.push(p);
    }
  };
  for (const t of targets) visit(resolve(t), true);
  return out;
}

export function isUrl(target) {
  return /^(https?|file):\/\//i.test(target);
}
