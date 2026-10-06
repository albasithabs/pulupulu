import { doc, runCases } from './_helpers.mjs';

runCases([
  // em-dash
  { rule: 'em-dash', fire: true, name: 'text node', src: '<p>One</p>\n<p>Fast — reliable</p>', line: 2 },
  { rule: 'em-dash', fire: true, name: 'alt attribute', src: '<img src="a.png" alt="Pier — low tide">', line: 1 },
  { rule: 'em-dash', fire: true, name: 'HTML entity', src: '<p>a</p>\n\n<p>Ship &mdash; now</p>', line: 3 },
  { rule: 'em-dash', fire: true, name: 'JSX string child', ext: '.jsx', src: 'const A = () => (\n  <p>{\'Fast — reliable\'}</p>\n);', line: 2 },
  { rule: 'em-dash', fire: false, name: 'HTML/CSS/JS comments and code', src: '<!-- a — b -->\n<style>/* a — b */ .x::after { content: "—"; }</style>\n<script>const s = "a — b";</script>\n<code>a — b</code><pre>c — d</pre>\n<p>Range 1–3</p>' },
  { rule: 'em-dash', fire: false, name: 'JSX comment and string in code', ext: '.jsx', src: '// a — b\nconst s = \'a — b\';\nconst t = `x — ${s}`;\nexport const A = () => <p className="x">{/* c — d */}{t}</p>;' },
  // generic-cta
  { rule: 'generic-cta', fire: true, name: 'button', src: '<div>\n<button type="button">Get started</button>\n</div>', line: 2 },
  { rule: 'generic-cta', fire: true, name: 'Indonesian link', src: '<a href="/blog/1">Selengkapnya →</a>', line: 1 },
  { rule: 'generic-cta', fire: true, name: 'JSX Button component', ext: '.jsx', src: 'export const A = () => <Button onClick={go}>Learn more</Button>;' },
  { rule: 'generic-cta', fire: false, name: 'specific labels', src: '<button>Get started with Postgres</button><a href="/c">Explore the catalog</a><p>Learn more about tides below.</p>' },
  // buzzword
  { rule: 'buzzword', fire: true, name: 'English', src: '<p>A seamless way to plan.</p>' },
  { rule: 'buzzword', fire: true, name: 'Indonesian', src: '<h2>Solusi inovatif untuk UMKM</h2>' },
  { rule: 'buzzword', fire: false, name: 'near words and comments', src: '<!-- seamless revolutionary -->\n<p>Seams and stitches. The elevator is down. Empowerment of the board.</p>' },
  // fake-stat
  { rule: 'fake-stat', fire: true, name: 'stat block', src: '<div>\n  <span>10K+</span>\n</div>', line: 2 },
  { rule: 'fake-stat', fire: true, name: 'count with noun', src: '<strong>500+ customers</strong>' },
  { rule: 'fake-stat', fire: true, name: 'Indonesian count', src: '<span>1jt+ pengguna</span>' },
  { rule: 'fake-stat', fire: true, name: 'rating and multiplier', src: '<span>4.9/5</span><span>2x faster</span>' },
  { rule: 'fake-stat', fire: false, name: 'prose, tables, years, discounts', src: '<p>We have served 500+ customers since 2019 across three cities.</p><table><tr><td>10K+</td></tr></table><span>2024</span><span>20%</span><span>12</span>' },
  // lorem-ipsum
  { rule: 'lorem-ipsum', fire: true, name: 'placeholder Latin', src: '<p>Lorem ipsum dolor sit amet.</p>' },
  { rule: 'lorem-ipsum', fire: true, name: 'placeholder attribute', src: '<input placeholder="Lorem ipsum">' },
  { rule: 'lorem-ipsum', fire: false, name: 'comment only', src: '<!-- lorem ipsum -->\n<p>Real copy.</p>' },
  // cadence-copy
  { rule: 'cadence-copy', fire: true, name: 'three aphorisms', src: '<p>Not a tool. A teammate.</p>\n<p>No meetings. Just shipping.</p>\n<p>Not a dashboard. A workspace.</p>', line: 2 },
  { rule: 'cadence-copy', fire: true, name: 'theater framing', src: '<p>Most reviews are security theater.</p>' },
  { rule: 'cadence-copy', fire: false, name: 'two aphorisms, home theater', src: '<p>Not a tool. A teammate.</p><p>No meetings. Just shipping.</p><p>Book the home theater room.</p>' },
  // honesty
  { rule: 'placeholder-people', fire: true, name: 'randomuser', src: '<p>x</p>\n<img alt="" src="https://randomuser.me/api/portraits/men/1.jpg">', line: 2 },
  { rule: 'placeholder-people', fire: true, name: 'pravatar in a data array', ext: '.jsx', src: "const team = [{ photo: 'https://i.pravatar.cc/100?u=1' }];" },
  { rule: 'placeholder-people', fire: false, name: 'commented out', src: '<!-- <img src="https://i.pravatar.cc/100"> -->\n<img src="/team/rina.jpg" alt="Rina">' },
  { rule: 'placeholder-image', fire: true, name: 'picsum', src: '<img alt="" src="https://picsum.photos/200">' },
  { rule: 'placeholder-image', fire: false, name: 'local file with similar name', src: '<img alt="" src="/img/picsum-photos-guide.png">' },
  { rule: 'stock-illustration', fire: true, name: 'undraw file', src: '<img alt="" src="/img/undraw_mobile.svg">' },
  { rule: 'stock-illustration', fire: false, name: 'underwater', src: '<img alt="" src="/img/underwater.svg">' },
  // dead-control
  { rule: 'dead-control', fire: true, name: 'href #', src: '<p>x</p>\n<a href="#">Pricing</a>', line: 2 },
  { rule: 'dead-control', fire: true, name: 'javascript:', src: '<a href="javascript:void(0)">Open</a>' },
  { rule: 'dead-control', fire: false, name: 'handlers and expressions', ext: '.jsx', src: 'export const A = () => (<nav><a href="#" onClick={go}>a</a><a href={url}>b</a><a href="/x">c</a></nav>);' },
  { rule: 'dead-control', fire: false, name: 'Vue and Alpine handlers', ext: '.vue', src: '<template><a href="#" @click.prevent="go">a</a><a href="#" x-on:click="go">b</a></template>' },
  // missing-anchor
  { rule: 'missing-anchor', fire: true, name: 'unknown id', src: doc('<a href="#pricing">Pricing</a>'), line: 5 },
  { rule: 'missing-anchor', fire: false, name: '#top with id top, existing ids', src: doc('<header id="top"></header><a href="#top">Top</a><a href="#faq">FAQ</a><section id="faq"></section>') },
  { rule: 'missing-anchor', fire: false, name: 'partial file is not judged', src: '<a href="#pricing">Pricing</a>' },
  // outline-removed
  { rule: 'outline-removed', fire: true, name: 'CSS outline none', ext: '.css', src: '.a { color: red; }\nbutton:focus {\n  outline: none;\n}', line: 3 },
  { rule: 'outline-removed', fire: true, name: 'Tailwind focus:outline-none', src: '<button class="focus:outline-none">Go</button>' },
  { rule: 'outline-removed', fire: false, name: 'Tailwind with focus-visible ring', src: '<button class="focus:outline-none focus-visible:ring-2">Go</button>' },
  { rule: 'outline-removed', fire: false, name: 'CSS with :focus-visible in file', ext: '.css', src: 'button:focus { outline: none; }\nbutton:focus-visible { outline: 2px solid; }' },
  { rule: 'outline-removed', fire: false, name: ':focus:not(:focus-visible)', ext: '.css', src: 'a:focus:not(:focus-visible) { outline: none; }' },
  // zoom-disabled
  { rule: 'zoom-disabled', fire: true, name: 'user-scalable=no', src: '<meta name="viewport" content="width=device-width, user-scalable=no">' },
  { rule: 'zoom-disabled', fire: true, name: 'maximum-scale=1', src: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' },
  { rule: 'zoom-disabled', fire: true, name: 'Next.js viewport export', ext: '.tsx', src: 'export const viewport = {\n  width: "device-width",\n  maximumScale: 1,\n};', line: 3 },
  { rule: 'zoom-disabled', fire: false, name: 'zoomable viewport', src: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">' },
  // missing-viewport
  { rule: 'missing-viewport', fire: true, name: 'full doc without viewport', src: '<!doctype html>\n<html>\n<head><title>x</title></head><body></body></html>', line: 3 },
  { rule: 'missing-viewport', fire: false, name: 'with viewport', src: doc('<p>x</p>') },
  { rule: 'missing-viewport', fire: false, name: 'partial template', src: '<div><p>x</p></div>' },
  // img-no-alt
  { rule: 'img-no-alt', fire: true, name: 'no alt', src: '<p>x</p>\n<img src="a.png">', line: 2 },
  { rule: 'img-no-alt', fire: true, name: 'JSX self-closing', ext: '.jsx', src: 'export const A = () => <img src="/a.png" />;' },
  { rule: 'img-no-alt', fire: false, name: 'empty alt, JSX alt, spread, Vue bound alt', ext: '.jsx', src: 'export const A = (p) => (<div><img src="a" alt="" /><img src="b" alt={t("b")} /><img {...p} /></div>);' },
  { rule: 'img-no-alt', fire: false, name: 'Vue :alt', ext: '.vue', src: '<template><img :src="u" :alt="name"></template>' },
  // skipped-heading
  { rule: 'skipped-heading', fire: true, name: 'h1 to h3', src: '<h1>A</h1>\n<h3>B</h3>', line: 2 },
  { rule: 'skipped-heading', fire: false, name: 'ordered, going back up is fine', src: '<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h3>E</h3>' },
  { rule: 'skipped-heading', fire: false, name: 'component without h1', ext: '.jsx', src: 'export const C = () => (<div><h3>a</h3><h5>b</h5></div>);' },
  // broken-image
  { rule: 'broken-image', fire: true, name: 'empty src', src: '<img src="" alt="">' },
  { rule: 'broken-image', fire: true, name: 'missing src', src: '<p></p>\n<img alt="Logo">', line: 2 },
  { rule: 'broken-image', fire: false, name: 'lazy and bound sources', src: '<img data-src="a.png" alt=""><img :src="u" alt=""><img srcset="a.png 1x" alt="">' },
  { rule: 'broken-image', fire: false, name: 'JSX expression src', ext: '.jsx', src: 'export const A = ({ u }) => <img src={u} alt="" />;' },
]);
