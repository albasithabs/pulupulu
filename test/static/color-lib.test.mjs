import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  composite, contrastRatio, hue, isChromatic, isGrayish, parseColor, tailwindColor, TAILWIND_PALETTE, toHex,
} from '../../skills/pulupulu/scripts/lib/shared/color.mjs';

const near = (a, b, eps = 0.02) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);

test('parses hex in every length', () => {
  assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.equal(parseColor('#0008').a.toFixed(2), '0.53');
  assert.equal(toHex(parseColor('#1E293B')), '#1e293b');
  assert.equal(parseColor('#11223380').a.toFixed(2), '0.50');
  assert.equal(parseColor('#12345'), null);
});

test('parses rgb, hsl, oklch, named, transparent', () => {
  assert.deepEqual(parseColor('rgb(10, 20, 30)'), { r: 10, g: 20, b: 30, a: 1 });
  assert.equal(parseColor('rgba(10 20 30 / 50%)').a, 0.5);
  const h = parseColor('hsl(0 100% 50%)');
  assert.deepEqual([Math.round(h.r), Math.round(h.g), Math.round(h.b)], [255, 0, 0]);
  const ok = parseColor('oklch(0.623 0.214 259.8)');
  assert.ok(ok.b > 240 && ok.r < 80, 'oklch blue-500 resolves to a blue');
  assert.deepEqual(parseColor('rebeccapurple'), { r: 102, g: 51, b: 153, a: 1 });
  assert.equal(parseColor('transparent').a, 0);
  assert.equal(parseColor('var(--x)'), null);
  assert.equal(parseColor('linear-gradient(red, blue)'), null);
});

test('WCAG contrast ratio', () => {
  near(contrastRatio('#000', '#fff'), 21);
  near(contrastRatio('#9ca3af', '#ffffff'), 2.54);
  near(contrastRatio('#ffffff', '#2563eb'), 5.17);
  assert.equal(contrastRatio('nope', '#fff'), null);
});

test('alpha compositing', () => {
  const c = composite({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
  near(c.r, 127.5, 0.01);
  assert.ok(contrastRatio('rgba(0,0,0,0.5)', '#fff') < contrastRatio('#000', '#fff'));
});

test('chromatic and grayish helpers', () => {
  assert.equal(isChromatic('#3b82f6'), true);
  assert.equal(isChromatic('#64748b'), false, 'slate-500 is a tinted neutral');
  assert.equal(isChromatic('transparent'), false);
  assert.equal(isGrayish('#6b7280'), true);
  assert.equal(isGrayish('#ef4444'), false);
  near(hue('#ff0000'), 0, 0.001);
  near(hue('#0000ff'), 240, 0.001);
});

test('Tailwind palette has 22 families x 11 shades plus black and white', () => {
  assert.equal(Object.keys(TAILWIND_PALETTE).length, 22 * 11 + 2);
  assert.equal(TAILWIND_PALETTE['slate-500'], '#64748b');
  assert.equal(TAILWIND_PALETTE['rose-950'], '#4c0519');
});

test('tailwindColor resolves shades, opacity, arbitrary values', () => {
  const blue = tailwindColor('blue-600/50');
  assert.equal(blue.family, 'blue');
  assert.equal(blue.shade, 600);
  assert.equal(blue.color.a, 0.5);
  assert.equal(tailwindColor('white').color.r, 255);
  assert.equal(tailwindColor('black/40').color.a, 0.4);
  assert.equal(tailwindColor('[#1e293b]').color.g, 41);
  assert.equal(tailwindColor('[rgb(0,0,0)]').color.r, 0);
  assert.equal(tailwindColor('xl'), null);
  assert.equal(tailwindColor('[14px]'), null);
});
