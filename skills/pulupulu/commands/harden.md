# harden

Make the interface survive real use: errors, every data state, long and missing content, other languages and locales, bad networks, repeated clicks, invalid input, and overflow. Designs that only work with perfect data are not finished.

**Mode:** during (implied by the command).

## When to use

- A surface works on the happy path and must now hold up in production.
- An audit or critique found missing states (R-27), overflow (R-03, R-47), or weak error handling.
- Before launch in a second locale or language.

## When not to use

- The visual direction is the problem: `critique`, then `build` or a refine command.
- First-run and activation design: `onboard` (harden makes empty states correct; onboard makes them useful for a new user).

## Steps

1. **Map the surface.** List every view that shows data or accepts input, every network call, every form, and every action that changes data. Read `PRODUCT.md` for locales and constraints.

2. **Stress it before changing anything.** Record what breaks:
   - **Content:** a 100-character name, a one-character name, an empty field, emoji, accented and CJK text, a 12-digit amount, 0 items, 1 item, 1,000 items, 50 options in a select.
   - **Network:** offline, slow (throttle to a slow 3G profile), timeout, 400, 401, 403, 404, 409, 429, 500.
   - **Behavior:** double click on submit, back button mid-flow, refresh mid-flow, two tabs open, session expiry, an interrupted drag (second pointer, scroll cancel, release outside, window blur).
   - **Locale:** text 30 to 40 percent longer, right-to-left, the product's own locale formats.

3. **Complete the states** for each data view (R-27):
   - **Loading:** say what is loading; reserve its space to avoid layout shift; skeletons shaped like the real content, not decoration.
   - **Empty:** what will be here, why it is empty, the one action that fills it. Distinguish "nothing yet" from "no results for this filter" (with a clear-filter action).
   - **Error:** what happened in plain words, what the user can do, a retry, and the user's work preserved. Never a raw code or stack trace.
   - **Partial:** some items failed or some data is missing; show what loaded and mark what did not.
   - **Success:** confirm the action where the user is looking; announce it to assistive tech.
   - **No permission:** what is restricted, why, and who can grant access. Read-only is a designed state, not disabled controls with no explanation.

4. **Handle errors by cause:**
   - 400 and validation: inline, next to the field, specific ("Phone number needs 10 to 13 digits"), input kept.
   - 401: send to sign-in and return the user where they were.
   - 403: permission state as above. 404: a not-found state with a way back.
   - 409: show the conflict and let the user choose. 429: say when to try again.
   - 500 and network: plain message, retry, and a support route when one exists. One failing component never blanks the whole page.

5. **Prevent double submit and races.** Disable or mark a control busy while its request runs, keep the label readable, make submits idempotent where the backend allows, roll back optimistic updates on failure, and confirm destructive actions or offer undo.

6. **Validate input.** Constraints at the input (type, `inputmode`, `autocomplete`, `maxlength`, pickers for dates), messages written per [../rules/copy.md](../rules/copy.md), errors tied to fields with `aria-describedby` and announced, required fields marked. Client validation is a convenience; the server is the authority.

7. **Contain overflow.**
   - Every text container has `min-width: 0` in flex and grid where it can shrink, plus `overflow-wrap: anywhere` or a deliberate truncation with the full value reachable (title, tooltip, or expansion).
   - Clamp long titles with a line clamp and a way to read the rest.
   - Tables scroll inside their own container on small screens; the page never scrolls sideways (R-03).
   - Large lists paginate or virtualize; never render 10,000 rows at once.

8. **Internationalize.**
   - Give text room: no fixed widths on labels and buttons; test with strings 40 percent longer.
   - Use logical properties (`margin-inline-start`, `inset-inline-end`) so RTL works; set `dir` and `lang`; mirror direction-bearing icons only.
   - Format with `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.RelativeTimeFormat` using the user's locale, never string concatenation.
   - Indonesian (`id-ID`): currency `Rp 1.250.000` (period groups thousands, no decimals for rupiah in UI), decimals with a comma (`4,5`), short dates `6 Okt 2026`, long dates `6 Oktober 2026`, 24-hour time `14.30`. Phone numbers accept `08...` and `+62...`.
   - Plurals through the i18n library's plural rules, not `count + "s"`.

9. **Keep accessibility under stress.** Error and loading changes announced (`aria-live` or `role="status"`/`"alert"`), focus moved to the first error on submit, focus returned after a dialog closes, nothing conveyed by color alone (R-25, R-32, R-48).

10. **Verify.** Re-run the stress list from step 2 and record each result. Run `node <skill-dir>/scripts/pulupulu.mjs detect --json <changed files>` and the browser pass at mobile and desktop. Say what produced the evidence (real network throttle, mocked responses, emulated touch) and what stayed untested. Run the Delivery Gate items touched ([../rules/delivery-gate.md](../rules/delivery-gate.md)).

## Output

- The hardened surface with complete states, error handling, overflow containment, and locale formatting.
- A chat report: the stress list with before and after results, what produced the evidence, and what is untested.
- Recommend `polish` as the final pass.

## Done when

- [ ] Every data view has loading, empty, error, success, and where relevant partial and no-permission states.
- [ ] Each error class has a specific message, a recovery, and preserved input.
- [ ] Double submit is impossible and destructive actions confirm or undo.
- [ ] 100-character strings, 0 items, and 1,000 items render without breaking layout at 360px.
- [ ] Numbers, currency, and dates use `Intl` with the product's locale.
- [ ] RTL and 40 percent longer text were checked where the product ships them.
- [ ] State changes are announced to assistive tech.
- [ ] The stress results and evidence sources are reported.
