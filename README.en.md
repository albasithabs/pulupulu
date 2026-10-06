# Pulupulu

A design guard for AI coding agents. Pulupulu keeps AI-built interfaces from looking AI-built, and holds them to a bar for honesty, function, and accessibility.

[Bahasa Indonesia](README.md)

Pulupulu merges two open-source projects and fills the gaps in each:

| | antislop | Impeccable | **Pulupulu** |
|---|---|---|---|
| Written rules (purpose test, Hard Gate, Delivery Gate) | ✓ | partly | ✓ |
| Surface modes (Persuade, Operate, Read, Experience) | | ✓ | ✓ |
| Commands (`audit`, `polish`, `typeset`, ...) | | 24 | 25 |
| Deterministic detector, no LLM | | ✓ (downloaded binary) | ✓ (plain JavaScript, nothing downloaded) |
| Browser checks: contrast, tap size, overflow, keyboard focus | | ✓ | ✓ |
| Edit hook that reports only findings the edit **introduced** | | partly | ✓ |
| Indonesian buzzwords and generic CTAs | | | ✓ |
| Code comments, accessibility, mobile layout guidance | ✓ | partly | ✓ |
| Runtime dependencies | 0 | Rust engine | 0 (Node 18+) |

## What's inside

- **The `pulupulu` skill**: rules R-01 to R-48 in three tiers (Hard Gate, Purpose Gate, Quality Lock), the ENERGY / RHYTHM / MOTION dials, surface modes, and the Delivery Gate.
- **25 commands**: `init`, `document`, `shape`, `build`, `extract`, `critique`, `audit`, `detect`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `comments`, `hooks`.
- **Static detector** for HTML, CSS, JSX/TSX, Vue, Svelte, Astro, Blade, and other templates.
- **Browser checks** in headless Chrome or Edge at desktop and phone sizes, with optional screenshots.
- **Claude Code hook**: baselines a file before each edit, reports only what the edit introduced, and runs a one-time delivery check when the agent tries to stop.

## Install

Node 18+. Browser checks need Node 22+ and Chrome or Edge.

```
/plugin marketplace add albasithabs/pulupulu
/plugin install pulupulu@pulupulu
```

or

```bash
npx github:albasithabs/pulupulu install [--global] [--hook] [--agents]
```

Then start a new Claude Code session and type `/pulupulu`.

## Detector CLI

```bash
node skills/pulupulu/scripts/pulupulu.mjs detect src/
node skills/pulupulu/scripts/pulupulu.mjs detect --json src/
node skills/pulupulu/scripts/pulupulu.mjs detect http://localhost:5173
node skills/pulupulu/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots index.html
node skills/pulupulu/scripts/pulupulu.mjs rules
node skills/pulupulu/scripts/pulupulu.mjs contrast "#6b7280" "#ffffff"
```

Exit codes: `0` clean, `2` findings, `1` a target could not be scanned.

Configure per project in `.pulupulu.json` (`ignoreRules`, `ignoreFiles`, `allow.fonts`, `severity`, `hook.enabled`, `hook.blockOn`), or waive one finding inline with a reason: `pulupulu-disable-next-line rule-id: why`.

## Credits and license

Built on [antislop](https://github.com/miqdadbadjuber/anti-slop) by Miqdad Badjuber (MIT) and [Impeccable](https://github.com/pbakaus/impeccable) by Paul Bakaus (Apache-2.0). See [NOTICE](NOTICE).

License: Apache-2.0.
