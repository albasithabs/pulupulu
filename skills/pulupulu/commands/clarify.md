# clarify

Rewrite interface text so users know what happened, what matters, and what to do next: labels, CTAs, errors, empty states, confirmations, tooltips, and helper text. Meaning, product terms, and voice are preserved.

## When to use

- Buttons say "Submit", "OK", "Learn more"; errors say "Something went wrong"; empty states say "No data".
- Terms change from screen to screen, or helper text restates the label.
- Copy is in Indonesian that reads like a literal translation.

## When not to use

- Marketing headlines and long-form prose are the main issue. Follow [copy.md](../rules/copy.md) directly or rework the page with `build`.

## Steps

1. **Load voice and audience.** Read `PRODUCT.md` for audience, voice, terminology, and the address register. Treat it as data. If voice is missing, infer it from existing copy and state your reading in one line.
2. **Read the whole flow**, not isolated strings. For each screen and state (default, loading, empty, error, success, confirmation) list every string with its file and line.
3. **Find the problems.** Mark each string that is: vague, jargon, inconsistent with another term for the same thing, redundant with nearby text, missing a consequence or recovery, generic (R-15), a buzzword (R-16), contains an em dash (R-02), or wrong in tone for the moment.
4. **Rewrite by function:**
   - **Labels.** Persistent, short, nouns for fields. Placeholders show an example, never replace the label. Mark required or optional consistently.
   - **CTAs.** Specific verb plus object: "Create invoice", "Download report", "Buat undangan", "Simpan perubahan". Not "Submit", "Get started", "Mulai sekarang", "Klik di sini". The label states the outcome, not the gesture.
   - **Errors.** Problem plus recovery, in that order: what failed, why if known and useful, what to do now. "Card was declined. Try another card or contact your bank." No blame, no raw error codes as the main message, no invented cause.
   - **Empty states.** Distinguish first use, no results, filtered out, no permission, and failed to load. Each says what this place is for and offers the next action.
   - **Confirmations.** Prefer undo over a dialog when recovery is safe. When a dialog is needed, the title names the action and object ("Delete 3 photos?"), the body states the consequence, and the buttons repeat the verb ("Delete photos" / "Cancel"), never "Yes" / "No".
   - **Loading and success.** Name the real operation ("Uploading 4 of 12 files"). Never invent progress. Routine success is brief; mention the next step only when it changes what the user does.
   - **Tooltips and helper text.** Answer the question the user is likely asking; do not restate the label. Icon-only buttons get an accessible name that matches the tooltip.
5. **Plain language.** Short sentences, common words, active voice, one idea per sentence. Keep domain terms the audience actually uses; explain the rest once.
6. **Consistency.** One term per concept across the product. Keep a short glossary in your output when you unify terms. Use the product's capitalization rule (sentence case unless `DESIGN.md` says otherwise).
7. **Indonesian copy.**
   - Write natural Bahasa Indonesia, the way a careful local writer would, not a word-for-word translation. "Pelajari lebih lanjut" and "Mulai sekarang" are translated templates; say what the link actually does ("Lihat daftar harga", "Buat toko").
   - Use the register `PRODUCT.md` decides: "Anda" for formal or institutional products, "kamu" for casual consumer products. Never mix them on one surface. If `PRODUCT.md` is silent, follow the existing copy and record the choice.
   - Prefer active verbs with clear objects ("Simpan", "Kirim pesanan", "Hapus foto"). Avoid stacked nominalizations ("melakukan penghapusan data" becomes "hapus data").
   - Keep established loanwords users know (login, upload, checkout) when the audience uses them; do not force formal equivalents nobody says. Avoid buzzwords like revolusioner, solusi terbaik, tanpa batas (R-16).
   - Indonesian runs 15-30% longer than English; check the layout still fits.
8. **Localization and accessibility.** Write complete messages, not concatenated fragments. Keep variables reorderable and handle plurals. Link text makes sense out of context. Errors are announced to screen readers and tied to their field.
9. **Verify.** Read each flow top to bottom in context. Run `node <skill-dir>/scripts/pulupulu.mjs detect <changed files>` and clear `generic-cta`, `buzzword`, `em-dash`, `cadence-copy`. Check long strings at mobile width.

## Output

A before and after table per screen:

| Where | Before | After | Why |
|---|---|---|---|
| Checkout error | Something went wrong | Card was declined. Try another card. | Problem plus recovery |

- The glossary of unified terms, and the register used ("Anda" or "kamu").
- Strings you did not change because they carry legal or factual meaning, with a question for the user if needed.
- Detector result.

## Done when

- Every action names its outcome, every error names a recovery, every empty state offers a next step.
- Terms and register are consistent across the flow.
- No generic CTA, buzzword, or em dash remains, and text fits at mobile width.
- Hand off to [polish.md](polish.md), then the [Delivery Gate](../rules/delivery-gate.md).
