# onboard

Design the first run: the path from arrival to the first real result. Empty states become activation, complexity arrives when it is needed, and nothing shown to a new user is fake.

**Mode:** during (implied by the command).

## When to use

- New users arrive at an empty product and stall.
- A first-run flow, setup wizard, welcome screen, or feature introduction is being built or reworked.
- Empty states exist but only say "No data".

## When not to use

- Error and edge handling in general: `harden`.
- Marketing pages that persuade before signup: `build` or `clarify`.

## Steps

1. **Define activation.** From `PRODUCT.md` and the user, name the first moment of real value as an observable event ("first invoice sent", "first project with one task"). Everything in onboarding is judged by how quickly and reliably it gets a new user there. Ask if it is not clear; do not guess.

2. **Walk the current first run** as a new user at mobile and desktop, from signup or first open to activation. Count steps, required fields, screens with no clear next action, and places where the user must know something not yet shown. Capture with `node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots <url>`.

3. **Cut before adding.** Remove every step that is not needed for activation: defer profile details, preferences, invitations, and integrations until after the first result. Ask only for what the first result needs. Prefer sensible defaults the user can change later.

4. **Teach through the work, not before it.**
   - Show, don't tell: the first screen lets the user do the core action, with inline hints at the point of use.
   - Tours and coach marks only when a step genuinely cannot be inferred; at most three, always skippable, never blocking, never repeated after dismissal.
   - No welcome carousel of feature claims.
   - Keep everything optional for returning or expert users, with a visible skip and a way back to the guidance later.

5. **Turn empty states into activation.** Every empty view answers three things in the product's voice ([../rules/copy.md](../rules/copy.md)):
   - what will be here;
   - why it matters to this user;
   - the one action that fills it, as a specific CTA ("Create your first invoice"), not a generic one (R-15).
   Separate first-use empty from "no results" and "all done" states; each needs different words. Illustration is optional and must relate to the product (R-22).

6. **Disclose progressively.** Show the controls the current task needs; reveal advanced options when the user reaches for them (an "Advanced" disclosure, contextual menus, a second step). Keep four or fewer choices at each first-run decision point.

7. **Be honest with sample data.**
   - Sample or demo content is allowed when it helps the user see the product working. Label it in the UI as sample data ("Sample project, delete anytime"), make it easy to remove in one action, and never mix it into real totals or reports.
   - No fake social proof: no invented counts ("Join 10,000 teams"), testimonials, user avatars, or activity feeds (R-17, R-18, R-36, R-38). Show real proof from `PRODUCT.md` Evidence on Hand, or none.
   - No fake progress or urgency: a progress bar measures real steps; no countdowns or "only 2 spots left" without a real constraint.

8. **Remember progress.** A user interrupted mid-setup returns to where they were. Checklists reflect real completion and disappear or collapse once done.

9. **Make it accessible.** Every step reachable and operable by keyboard, focus moved to the new step's heading, progress announced, tours dismissible with Escape, nothing timed (R-32, R-48).

10. **Verify.** Walk the new first run again at 390 and 1440 widths, keyboard only once, and count steps to activation before and after. Run the detector on changed files and the Delivery Gate items touched ([../rules/delivery-gate.md](../rules/delivery-gate.md)).

## Output

- The reworked first run, empty states, and any guidance.
- A chat summary: the activation event, steps to activation before and after, what was deferred, where sample data appears and how it is labeled and removed.

## Done when

- [ ] Activation is named as an observable event.
- [ ] Steps to activation went down, or the reason they could not is stated.
- [ ] Every first-use empty state says what, why, and the one action, with a specific CTA.
- [ ] Guidance is skippable, non-blocking, and does not repeat after dismissal.
- [ ] Sample data is labeled, removable in one action, and excluded from real totals.
- [ ] No invented numbers, testimonials, avatars, activity, or urgency appear.
- [ ] Interrupted setup resumes where it stopped.
