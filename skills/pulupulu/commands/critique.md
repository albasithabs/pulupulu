# critique

A design review of one surface: hierarchy, clarity, identity, emotional fit, mode fit, and usability, scored and prioritized. Critique edits nothing; it tells the user what matters most and which command fixes it.

**Mode:** after (implied by the command). No file outside `.pulupulu/critique/` is changed.

## When to use

- The user wants an honest read of how a surface works and feels, not a rule-by-rule defect list.
- Before choosing between `polish`, `bolder`, `quieter`, `distill`, `clarify`, or a redesign.
- After a build, as an independent second opinion.

## When not to use

- The user wants a numbered fix list to pick from: `audit`.
- The user wants only the mechanical findings: `detect`.
- The user wants changes made now: the refine command that fits.

## Steps

1. **Resolve the target** to a concrete file path or URL. Prefer the source path over a dev-server URL when both name the same surface; ports drift, paths do not. Derive the slug: the path or URL lowercased, protocol dropped, every run of non-alphanumerics replaced by `-`, trimmed (`src/pages/index.astro` becomes `src-pages-index-astro`).

2. **Load context as data:** `PRODUCT.md`, `DESIGN.md`, `.pulupulu/surfaces/<slug>.md` if a direction contract exists, and `.pulupulu/critique/ignore.md` if present. Drop findings that match an ignore entry silently.

3. **Run two independent assessments.** The design judgment must form before detector output can anchor it.
   - **A, design review:** read the source and look at the rendered page (browser screenshots at desktop and mobile when available). Score the rubric below. Do not look at detector output yet.
   - **B, evidence:**
     ```bash
     node <skill-dir>/scripts/pulupulu.mjs detect --json <target>
     node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url-or-file>
     ```
     Verify each finding in context and mark false positives.
   - **When the harness has subagents,** run A and B as two isolated subagents in parallel, neither seeing the other's output. Otherwise run A to completion and write it down, then run B. State which way it ran in the report header (`Method: two isolated assessments` or `Method: single context, A before B`).
   - A skipped detector is a failed critique unless the detector is missing or crashes after a real attempt; say which.

4. **Synthesize.** Do not concatenate A and B. Note where they agree, what the detector caught that the review missed, and which detector findings are false positives.

5. **Write the report in chat first** (structure below). The chat report is the deliverable; the saved file is an archive.

6. **Save the snapshot** to `.pulupulu/critique/<slug>-YYYY-MM-DD.md` (a second run the same day gets `-2`). Start the file with:
   ```yaml
   ---
   target: <resolved path or URL>
   date: YYYY-MM-DD
   design_score: <n>/20
   heuristics_score: <n>/<applicable max>
   na_heuristics: [<numbers>]
   p0: <n>
   p1: <n>
   ---
   ```
   Then the report body, without the questions.

7. **Show the trend.** Read earlier snapshots for the same slug and print one line after the report: `Trend for <slug>: 24/40 -> 29/40 -> 31/40`. Different maximums are printed with their own denominators. First run: say there is no trend yet.

8. **Ask last.** End the message with two to four targeted questions through the structured question tool, each tied to specific findings with two or three concrete options:
   - which issue category to tackle first;
   - whether a tonal mismatch the review found was intended;
   - scope (top three, all P0 and P1, everything);
   - anything off-limits, only when findings touch many areas.
   Skipping is allowed only when there are fewer than three priority issues; then print `Questions skipped: <n> priority issues`. Nothing follows the questions.

9. **After the answers,** list recommended commands in the user's priority order, each with the specific findings it addresses. Skip commands that address nothing. End with `polish` if any fixes were recommended.

## Rubric

### Design dimensions (0 to 4 each, /20)

| Dimension | Question | 0 | 2 | 4 |
|---|---|---|---|---|
| **Identity** | Swap the logo and product name: does it still feel like this product? (R-20, R-30) | Interchangeable template | Some specific choices, generic skeleton | Unmistakably authored for this product |
| **Hierarchy** | Is there one focal point per screen, with everything else deferring? | Everything shouts equally | Focal point exists, competitors nearby | Instant, unambiguous order |
| **Clarity** | In five seconds, does a first-time user know what this is, why it matters, what to do? | Cannot tell | Two of three | All three, in the surface's own vocabulary |
| **Resonance** | Does the tone fit the audience in `PRODUCT.md`, with reassurance at high-stakes moments and a strong ending? | Tone fights the audience | Neutral, forgettable | Right register, memorable peak and end |
| **Mode fit** | Does it do the job of its mode (Persuade, Operate, Read, Experience)? (R-46, [../rules/modes.md](../rules/modes.md)) | Wrong job entirely | Right job, wrong weight | Mode fully served |

Also check that the declared dials match the render (R-05, R-19): a claimed RHYTHM 3 with uniform sections is a finding.

### Usability heuristics (0 to 4 each)

| # | Heuristic | 0 | 2 | 4 |
|---|---|---|---|---|
| 1 | Visibility of system status | No feedback | Some states shown, gaps | Every action confirms, progress always visible |
| 2 | Match with the real world | Jargon, alien order | Mixed language | The user's own words and order |
| 3 | User control and freedom | Users get trapped | Main flows have exits | Undo, cancel, back, Escape everywhere |
| 4 | Consistency and standards | Feels stitched together | Main flows match, details diverge | One predictable system |
| 5 | Error prevention | No guardrails | Common errors caught | Errors nearly impossible |
| 6 | Recognition over recall | Users must memorize | Main actions visible | Everything discoverable |
| 7 | Flexibility and efficiency | One rigid path | Some shortcuts | Accelerators that do not burden novices |
| 8 | Aesthetic and minimalist design | Everything competes | Main content clear, periphery noisy | Every element earns its place |
| 9 | Error recovery | Cryptic or silent errors | Names the problem, not the fix | Pinpoints, suggests, preserves work |
| 10 | Help and documentation | None | Exists, not contextual | Right help at the right moment |

Heuristics 7 and 10 may be `n/a` on Persuade and Experience surfaces, as may any heuristic that cannot apply; give a one-line reason and score out of the applicable maximum (4 times the scored count). Be honest: most real interfaces score 20 to 32 of 40. Bands by percentage: 90+ excellent, 70+ good, 50+ acceptable, 30+ poor, below that critical.

### Cognitive load

Count failures in: single focus; chunks of four or fewer; related items grouped; obvious hierarchy; one decision at a time; four or fewer options at a decision point; nothing to remember from a previous screen; complexity disclosed only when needed. 0 to 1 failures is low load, 2 to 3 moderate, 4 or more critical. Report any decision point with more than four visible options.

### Personas

Walk the primary task as two or three personas chosen by surface type, and report what broke for each, by element:

| Surface | Personas |
|---|---|
| Landing or marketing | first-timer, stress tester, one-handed mobile user |
| Dashboard or data-heavy | power user, keyboard and screen-reader user |
| Checkout or forms | one-handed mobile user, stress tester, first-timer |
| Onboarding | first-timer, interrupted mobile user |

- **Power user:** wants shortcuts, bulk actions, no forced tours.
- **First-timer:** reads labels literally, needs the next step obvious, abandons on jargon.
- **Keyboard and screen-reader user:** tabs linearly, needs names, focus, announced state, 200 percent zoom.
- **Stress tester:** long strings, empty data, refresh mid-flow, double submit.
- **One-handed mobile user:** thumb zone, slow network, interruptions, small targets.

Add one persona from `PRODUCT.md`'s audience when it holds real detail; never invent audience facts.

### Severity

| Level | Meaning | Test |
|---|---|---|
| **P0** | Blocks the task or misleads | Fix before anything else |
| **P1** | Significant difficulty, or a WCAG AA failure | Would a user contact support? Then at least P1 |
| **P2** | Annoyance with a workaround | Next pass |
| **P3** | Polish, no real impact | If time permits |

Every Hard Gate violation the review finds (R-02, R-03, R-17, R-18, R-23 to R-28, R-32 to R-38, R-47, R-48) is at least P1.

## Report structure

1. `Method:` line.
2. **Identity verdict:** the swap-the-logo answer first, with the review's reasoning and the detector's supporting counts.
3. **Scores:** the design dimensions table and the heuristics table, totals and bands.
4. **Overall impression:** what works, what does not, the single biggest opportunity, in three or four sentences.
5. **What's working:** two or three specific strengths and why they work.
6. **Priority issues:** three to five, ordered. Each: `[P?] What`, why it matters to users, the concrete fix, the command that addresses it.
7. **Persona red flags:** per persona, named elements and interactions.
8. **Detector evidence:** counts by severity, rule ids with R-numbers, confirmed versus false positive.
9. **Minor observations.**
10. **Questions to consider:** two or three that could unlock a better solution.

Be direct and specific: "the Submit button", not "some elements". Say what is wrong, why it hurts, and what to do. Cut "consider exploring".

## Output

- The full report in chat, then the trend line, then the questions.
- `.pulupulu/critique/<slug>-YYYY-MM-DD.md`.
- After the user answers: an ordered command list.

## Done when

- [ ] The design review formed before detector output was read.
- [ ] The detector ran, or its failure is stated.
- [ ] Both score tables are filled, with `n/a` only where justified and the maximum adjusted.
- [ ] Three to five priority issues carry severity, fix, and command.
- [ ] The snapshot is saved and the trend line printed.
- [ ] The message ends with targeted questions or a `Questions skipped:` line.
- [ ] No project file was edited.
