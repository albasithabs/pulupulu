# detect

Run the detector, read its findings correctly, and explain what they mean and what to do. The detector finds what can be found mechanically so your attention goes to what cannot.

**Mode:** after (implied by the command). Report and explain; edit only if the user then asks.

## When to use

- A quick mechanical check of files, a folder, or a running page.
- Before `audit` or `critique`, or as part of `build` and `polish` verification.
- To learn which rule a finding belongs to and how to waive one that is wrong.

## When not to use

- As the whole review. A clean run is evidence, not proof; it does not replace looking at the rendered page.
- On backend-only code. The scanner reads markup, styles, and components.

## Commands

```bash
node <skill-dir>/scripts/pulupulu.mjs detect src/                     # static scan
node <skill-dir>/scripts/pulupulu.mjs detect --json src/              # machine-readable
node <skill-dir>/scripts/pulupulu.mjs detect http://localhost:5173     # browser checks on a URL
node <skill-dir>/scripts/pulupulu.mjs detect --browser index.html      # browser checks on a local file
node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url-or-file>
node <skill-dir>/scripts/pulupulu.mjs rules                           # every rule id with its R-number
node <skill-dir>/scripts/pulupulu.mjs contrast "#6b7280" "#ffffff"     # WCAG ratio for one pair
```

- **Static** reads text: CSS, HTML, JSX/TSX, Vue, Svelte, Astro, templates. It never runs project code.
- **Browser** opens each target at desktop (1440x900) and mobile (390x844, touch) in an installed Chrome or Edge and checks rendered contrast, tap targets, overflow, focus visibility, broken images, script errors, hidden content, headings, and accessible names. Without a browser, say so and fall back to static plus code inspection.
- **Screenshots** land in the folder you pass, per target and viewport. Open them; they are evidence for you and for any reviewer.
- **Exit codes:** `0` clean, `2` findings, `1` a target could not be scanned (report which and why; it is not a clean result).

## Reading a finding

Each finding carries: `rule` (id), `severity` (`high`, `medium`, `low`), `ref` (the R-number), `category`, `message`, `fix`, `file`, `line` (0 for browser findings), `snippet`, `source` (`static` or `browser`), and `viewport` for browser findings.

- Severity follows the rule tier: **high** is Hard Gate, **medium** is Purpose Gate, **low** is Quality Lock. A heuristic that cannot be certain may report one level lower (`fake-stat` is medium because only a human knows if the number is real).
- Static and browser rules that check the same thing share an id (`low-contrast`). A browser hit is stronger evidence than a static one.
- Look up any rule with `rules` or in `docs/ENGINE.md`; read the matching R-number in [../rules/core.md](../rules/core.md) for the full rule.

## Steps

1. **Pick targets.** Changed files for a quick check; the UI source folder for a full scan; the served page for rendered checks. Narrow scope or ask when a tree holds more than about 500 scannable files.
2. **Run** static with `--json`, and browser with `--screenshots` when the page can be served or opened.
3. **Triage in this order:**
   1. Exit code `1` targets: fix the path or explain why it cannot be scanned.
   2. HIGH findings, grouped by rule. These are honesty, function, and access failures.
   3. MEDIUM findings: each technique needs a written purpose or it goes.
   4. LOW findings, last.
   Never spend effort on LOW findings while a HIGH one is open.
4. **Verify each finding in context.** Open the line, or the screenshot for browser findings. Classify it: real, real but pinned by the brief (R-37: name it, ask once, record the answer), or false positive.
5. **Group by cause.** Twenty `low-contrast` hits from one muted-text token are one problem with one fix.
6. **Report:** counts by severity, the confirmed findings grouped by cause with R-numbers and locations, false positives with suggested waivers, and what the scan could not check (no browser, auth-only routes, dynamic content). Recommend `audit` for a full numbered review or the refine command that fits.

## Waiving a finding

A finding you disagree with gets a waiver with a reason, never a silent ignore.

**Inline**, in any comment syntax:

```
/* pulupulu-disable-next-line overused-font: brand font per DESIGN.md */
<!-- pulupulu-disable-line hard-offset-shadow: neobrutalist world, see surface brief -->
// pulupulu-disable side-stripe: status rail in data table, file-wide
```

`pulupulu-disable-next-line` waives the following line, `pulupulu-disable-line` the same line, `pulupulu-disable` the whole file. A bare `pulupulu-disable` with no rule id waives every rule in the file; do not use it.

**Project config** in `.pulupulu.json` (committed) or `.pulupulu.local.json` (per machine, gitignored; wins field by field). Create one with `node <skill-dir>/scripts/pulupulu.mjs init-config`.

```json
{
  "ignoreRules": ["section-numbers"],
  "ignoreFiles": ["src/legacy/**", "**/*.stories.tsx"],
  "allow": { "fonts": ["Inter"] },
  "severity": { "pure-black": "medium" },
  "hook": { "enabled": true, "blockOn": "high" }
}
```

- `allow.fonts`: brand fonts recorded in `DESIGN.md`; silences `overused-font` for those families only.
- `ignoreRules`: a rule that does not apply to this project at all. Record why in `DESIGN.md`.
- `ignoreFiles`: vendored, generated, or legacy code outside scope.
- `severity`: raise or lower one rule for this project.

Never waive a Hard Gate finding (contrast, dead controls, fake content, missing alt, focus removal) to make a run pass. Fix it, or report it as open.

## Output

- A chat report: counts, confirmed findings grouped by cause with R-numbers and locations, false positives with waiver suggestions, what was not checked, and the recommended next command.
- Screenshots in the folder passed to `--screenshots`, when used.

## Done when

- [ ] Static ran, and browser ran or its absence is stated.
- [ ] Exit code `1` targets are explained.
- [ ] HIGH findings were triaged before any LOW one.
- [ ] Every reported finding was verified in context.
- [ ] Every proposed waiver carries a reason; no Hard Gate finding is waived to pass.
- [ ] The report says plainly that a clean run is evidence, not proof.
