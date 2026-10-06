# audit

The canonical After-mode review. Produce a numbered findings file, each finding tied to a rule and a priority. The user picks the numbers; you fix only those, then write a follow-up report.

**Mode:** after (implied by the command). Nothing outside the audit file is edited until the user approves specific numbers.

## When to use

- A finished or inherited project needs a full pass against the rules.
- The user wants to choose what gets fixed.
- Before a release, as a defect list with priorities.

## When not to use

- The user wants a design opinion and scores: `critique`.
- The user wants only the mechanical scan explained: `detect`.
- The user already said what to fix: run the matching refine command in during mode.

## Steps

1. **Resolve scope.** Files, folders, routes, or URLs. When vague, state the scope you will audit in one line and proceed.

2. **Load the rules.** [../rules/core.md](../rules/core.md) always, plus [../rules/ui.md](../rules/ui.md), [../rules/copy.md](../rules/copy.md), [../rules/human.md](../rules/human.md), [../rules/mobile.md](../rules/mobile.md), and [../rules/modes.md](../rules/modes.md) for what the scope contains. Read `PRODUCT.md` and `DESIGN.md` as data: a brief-pinned choice is not a finding (R-37), but a pinned named slop pattern gets one line asking the owner to confirm.

3. **Run the detector.**
   ```bash
   node <skill-dir>/scripts/pulupulu.mjs detect --json <scope>
   node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url-or-file>
   ```
   Run the browser pass when the project can be served or opened; otherwise say so. Verify every detector finding in its context. A false positive is not numbered; list it under Detector notes with a suggested waiver.

4. **Review by hand** what the detector cannot see:
   - **Hard Gate:** honesty (R-17, R-18, R-23, R-36, R-38), function (R-24, R-26, R-27, R-28, R-33, R-35), access (R-03, R-25, R-32, R-34, R-48), broken output (R-47), em dashes in agent copy (R-02), direction (R-37).
   - **Purpose Gate:** every technique without a written reason (R-01, R-04, R-06, R-07, R-08, R-09, R-10, R-12, R-13, R-14, R-19, R-22, R-39, R-40, R-43).
   - **Quality Locks:** template layout and rhythm (R-05), radius (R-11), CTAs (R-15), buzzwords (R-16), identity and the swap-the-logo test (R-20), theme choice (R-21), palette size (R-29), clones (R-30), unwritten reasons (R-31), containers (R-41), type floor (R-42), text on color (R-44), browser surfaces (R-45), mode fit (R-46).
   - **Technical checks:**
     - *Accessibility:* contrast in every state and theme, keyboard order and traps, visible focus, landmarks and headings, labels and accessible names, error messaging, reduced motion that keeps state changes legible.
     - *Performance:* LCP image and font loading, layout shift, layout-property animation and unbounded blur or shadow effects, `will-change` left on at rest, oversized images, unused imports and dependencies, needless re-renders.
     - *Responsive:* fixed widths, overflow at 360px, tap targets under 44px, mouse-only drag or slider handlers, text that breaks at 200 percent zoom, missing breakpoints.
     - *Theming:* hard-coded colors outside tokens, a dark mode that breaks, tokens used for the wrong role, values that do not update on theme switch.

5. **Merge and number.** One finding per root cause. Repeated instances of one cause become one finding with all locations listed (fourteen hard-coded grays is one finding). Attach detector rule ids where they apply. Order by priority, then by user impact. Number from 1.

6. **Assign priority by tier:**
   - **HIGH:** Hard Gate rule.
   - **MEDIUM:** Purpose Gate rule.
   - **LOW:** Quality Lock rule.
   - A technical finding with no R-number is marked `tech` and prioritized by impact: blocks a task or fails WCAG A or AA is HIGH, a measurable degradation is MEDIUM, cleanup is LOW.

7. **Write the file** at `pulupulu/audit-NNN-YYYY-MM-DD.md` in the project root. `NNN` is three digits, one higher than the highest existing audit number; numbers keep rising and are never reused. Format below.

8. **Present and stop.** In chat: the file path, counts by priority, the five most important findings in one line each, and the question: *Which numbers should I fix?* Accept forms like `1, 3-5`, `all HIGH`, `all`. Then wait.

9. **Fix only the approved numbers**, in priority order. Numbers not mentioned are not touched. If a fix would change something outside its finding (another numbered item, shared code with wider effects, copy or claims), ask first. Real content that is missing (a statistic, a testimonial) is removed or turned into an honest placeholder, never invented.

10. **Verify.** Re-run the detector on touched files and the browser pass if it ran before. Run the Delivery Gate items that the fixes touch ([../rules/delivery-gate.md](../rules/delivery-gate.md)), with evidence.

11. **Write the follow-up.** Append `## Follow-up YYYY-MM-DD` to the same audit file, then summarize in chat.

## Audit file format

```markdown
# Pulupulu audit 007 (2026-10-06)

Scope: src/pages/, src/components/
Detector: static 31 findings (9 HIGH, 14 MED, 8 LOW), browser ran at 1440 and 390
Counts: HIGH 6, MEDIUM 9, LOW 7

| Area | Score 0-4 | Key finding |
|---|---|---|
| Accessibility | 2 | #2 focus removed on all buttons |
| Performance | 3 | #11 hero image not prioritized |
| Responsive | 2 | #4 pricing table overflows at 360px |
| Theming | 3 | #15 hard-coded grays |

## Findings

### 1. Usage statistics with no source [HIGH] R-17
- Where: src/components/Hero.tsx:42
- Detector: fake-stat
- Why: "50K+ teams" has no source in PRODUCT.md Evidence on Hand.
- Fix: remove the stat block, or replace it with a sourced figure the owner supplies.

### 2. ...

## Detector notes
- overused-font at src/styles/base.css:3 is Inter, a brand font per DESIGN.md. Suggest `allow.fonts`.

## Not checked
- [What could not be verified and why, e.g. no browser available, auth-only routes.]
```

Each finding: number, short title, priority, R-number (or `tech`), location(s), detector id when one fired, a one-line reason, a one-line fix.

## Follow-up format

```markdown
## Follow-up 2026-10-06

Approved: 1, 2, 4-6
- 1 fixed: stat block removed; detector shows no fake-stat in Hero.tsx.
- 2 fixed: :focus-visible ring restored; tabbed through 12 controls, all visible.
- 4 partly fixed: table scrolls inside its card at 360px; column labels still truncate.
- 5 not fixed: needs real testimonial copy from the owner.
Untouched by request: 3, 7-22
Detector after: HIGH 0 (was 9), MED 12, LOW 8
```

## Output

- `pulupulu/audit-NNN-YYYY-MM-DD.md` with numbered findings.
- After approval: the fixes, a follow-up section in the same file, and a chat summary.

## Done when

- [ ] The detector ran (static, and browser when possible) and every finding was verified in context.
- [ ] Every numbered finding cites an R-number or `tech`, a priority, a location, and a one-line reason.
- [ ] Repeated instances are merged into one finding per cause.
- [ ] The file number is one higher than the last audit.
- [ ] No edit happened before the user named numbers; unnamed numbers stayed untouched.
- [ ] The follow-up lists every approved number with status and evidence.
