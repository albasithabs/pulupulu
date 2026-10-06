# Copy: headlines, CTAs, labels, errors, prose

Load with [core.md](core.md) whenever the task writes or edits text people read: marketing copy, product UI strings, errors, empty states, docs. Core holds the hard bans (R-02, R-15, R-16, R-17, R-18, R-36, R-38); this file holds the depth.

## Two rules over everything

- **Never invent facts.** A rewrite adds no number, name, date, quote, customer, or citation that is not in the source or supplied by the user. Specificity comes from the source, not the rewrite. If a sentence needs a real detail to work, ask for it or write the plain version without it.
- **Do not over-sterilize.** Copy with no voice is as machine-made as copy full of tells. Keep a voice the user supplied; otherwise choose one and hold it.

## Write in the product's own language

- The product's own nouns and verbs, used the same way every time. Keep a short glossary when the product has many terms; never swap synonyms for variety in an interface.
- Plain words the audience uses. Keep domain terms the audience genuinely knows; explain the rest once.
- Say each idea once. If the heading explains the state, the line under it adds a new fact or disappears.

---

## Headlines

- **Tell:** "The future of invoicing", "Work smarter, not harder", "Your all-in-one platform".
- **Why:** it fits any product; it says what the copy wants to feel, not what the product does.
- **Fix:** name the mechanism or the outcome for this audience: "Invoices that chase late payers for you". The swap-the-logo test applies to words: if a competitor could run your headline unchanged, rewrite it.
- The subheadline adds the second fact (who it is for, how it works, what it costs), not a restatement.

## Calls to action (R-15)

- **Tell:** Get Started, Learn More, Try Now, Explore, Discover, Click Here, Read More, Sign Up Now. Indonesian: Mulai Sekarang, Pelajari Lebih Lanjut, Selengkapnya, Klik di Sini, Coba Sekarang, Jelajahi, Daftar Sekarang.
- **Fix:** a specific verb plus the object or outcome. The label says what happens, not the gesture.

| Generic | Specific |
|---|---|
| Get Started | Create your first invoice |
| Learn More | See how reminders work |
| Sign Up Now | Start a 14-day trial (only if the trial is real) |
| Mulai Sekarang | Buat tagihan pertama |
| Selengkapnya | Lihat semua 12 resep |
| Klik di Sini | Unduh katalog (PDF, 2 MB) |

- Destructive actions name the object and consequence: "Delete 3 files", not "Confirm". Confirmation dialogs repeat the action on the button; never Yes / No / OK / Submit.
- Prefer undo over confirmation when recovery is safe.
- Link text makes sense out of context; never "here".

## Buzzwords (R-16)

- English: AI-powered, next-generation, revolutionary, seamless, cutting-edge, game-changing, supercharge, empower, streamline, world-class, enterprise-grade, effortless, unleash, elevate, best-in-class, state-of-the-art, robust, intelligent, ultimate, powerful, unlock, delve, journey, landscape, testament.
- Indonesian: revolusioner, mutakhir, terdepan, tercanggih, inovatif, solusi terbaik, kelas dunia, tanpa batas, terpercaya (without evidence), all-in-one, satu-satunya, nomor satu.
- **Fix:** replace each with what the product actually does. "Seamless sync" becomes "Changes on your phone show on the laptop within a second" only if that is true.

## Em dashes (R-02)

- **Pattern:** the em dash (U+2014) as a connector or aside; also spaced double hyphens and spaced en dashes doing the same job.
- **Fix, in order of preference:** a period (new sentence), a comma (tight aside), a colon (introduces an explanation), parentheses (a true aside), or restructure.
  - Before: "The policy (U+2014) announced without warning (U+2014) affects thousands."
  - After: "The policy, announced without warning, affects thousands."
- An em dash alone does not prove AI writing, but R-02 still bans it in agent-written output. A user's sample that uses them goes through the R-37 protocol: name it, name the rule, ask. Match its frequency only if the owner keeps it.
- Final check before delivery: search the output for U+2014. A hit means not done.

## Aphoristic cadence (R-16)

| Pattern | Example | Fix |
|---|---|---|
| "Not X. Y." / "No X. Just Y." | "No meetings. Just shipping." | State the fact: "Status updates post to the channel, so the standup is optional." |
| Negative parallelism | "It's not just a dashboard, it's a command center." | "The dashboard shows the data you select." |
| Staccato drama | "No templates. No defaults. No safety." | One sentence with the actual point. |
| Aphorism formula | "Symmetry is the language of trust." | "Symmetric layouts feel predictable." |
| Theater framing | "Security theater", "productivity theater" | Name the actual problem. |
| Forced triplets | "Innovation, inspiration, and insights" | As many items as are real. |
| False ranges | "From first click to final invoice" | "Handles quotes, invoices, and reminders." |

One short emphatic sentence is fine. The tell is the formula repeated.

---

## Interface text

For each state decide, in order: the one fact the user needs now, the next action, context that changes the decision, and the tone for this moment.

### Labels and forms

- Persistent visible labels; placeholders are examples, never labels.
- Format and eligibility rules before submission ("8 or more characters, one number"), next to the field, linked with `aria-describedby`.
- Required and optional marked the same way everywhere.
- Explain why you ask for data only when it is not obvious ("We use your phone number only for delivery updates").
- Validation names what needs attention and how to fix it, without blame, and keeps the user's input.

### Error messages

Every actionable error answers three questions:

1. What failed.
2. Why, when known and useful.
3. How to recover, or what alternative remains.

| Weak | Strong |
|---|---|
| "Error occurred." | "Couldn't save the invoice. The connection dropped. Your changes are kept; try again." |
| "Invalid input." | "Enter a date after today. Due dates can't be in the past." |
| "403 Forbidden" | "You can view this project but not edit it. Ask the owner for editor access." |
| "Terjadi kesalahan." | "Pembayaran gagal karena kartu ditolak bank. Coba kartu lain atau transfer bank." |

- Never lead with an internal code; put it after the message for support.
- Never promise a cause or fix the system cannot know.
- Privacy, payment, deletion, and lost access are serious: warmth is welcome, jokes are not.

### Empty, loading, success

- **Empty** distinguishes first use, no results, filtered to nothing, no permission, and failure. Each says why and offers the next useful action: "No invoices yet. Create one, or import from a spreadsheet."
- **Loading** names the real operation ("Loading your projects") and sets an honest expectation for long waits. Determinate progress when available; never invented progress.
- **Success** confirms the outcome briefly; mentions the next consequence only when it changes what the user does ("Sent. Budi will get a reminder in 3 days if unpaid.").

### Microcopy

- Helper text answers an implicit question instead of restating the control.
- Tooltips hold supplementary detail, never the only copy of something essential.
- Same concept, same word: if it is "workspace" in the nav it is not "project space" in the settings.
- Sentence case for UI labels unless the brand system says otherwise; never Title Case Everything by default.
- Numbers, dates, and currencies through the locale formatter (`Intl.NumberFormat`, `Intl.DateTimeFormat`); "Rp 150.000" in Indonesian, not "IDR 150,000.00".

### Localization-ready strings

- Write complete messages, never concatenated fragments; keep variables named so translators can reorder them (`{count} invoices due`), and use plural rules from an i18n library.
- Leave room for 30-40% expansion; never size buttons to English text.
- Alt text conveys the image's information; `alt=""` for decoration. Accessible names match visible labels.

---

## Non-English UI copy

Pulupulu's maintainer works in Indonesian, and many products ship in more than one language. The same rules apply in every language, plus these:

- **Write natively, never translate literally.** Draft in the target language from the meaning, not from an English string. "Get started for free" is not "Mulai secara gratis sekarang juga"; it is whatever an Indonesian product would actually say: "Coba gratis 14 hari".
- **Match the register the audience uses.** Indonesian product UI usually takes a friendly, direct register: "kamu" for consumer apps, "Anda" for banking, government, and B2B. Pick one per product, record it in `PRODUCT.md`, and never mix them on one surface.
- **Keep common loanwords where users say them** (login, upload, checkout, dashboard) when the audience uses them daily; translate when the native word is what they say (unduh, keranjang, simpan). Be consistent with the choice.
- **Buzzwords exist in every language.** The Indonesian list in R-16 is banned for the same reason as the English one. Watch for calques of English marketing ("solusi end-to-end", "pengalaman seamless").
- **Generic CTAs exist in every language.** Mulai Sekarang and Selengkapnya are the Indonesian Get Started and Read More (R-15).
- **Formats follow the locale**: `Rp 150.000`, `6 Okt 2026`, `08.30`, decimal comma.
- **The em dash ban applies in every language** (R-02).
- When unsure of a native phrasing, ask the user rather than shipping a stiff translation.

---

## Tone and honesty patterns

| Pattern | Before | After | Rule |
|---|---|---|---|
| Empty AI vocabulary | "Unlock the power of seamless collaboration to elevate your journey." | "Work on the same file with your team." | R-16 |
| Significance inflation | "Marking a pivotal moment in the evolution of productivity." | "Cuts the time spent in status meetings." | R-36 |
| Unbacked social proof | "Trusted by thousands of teams worldwide." | Name real customers, or cut the claim. | R-17, R-36 |
| Weasel attribution | "Experts say this improves conversion." | Name the source, or cut. | R-36 |
| Authority tropes | "At its core, what really matters is speed." | "Speed depends on how fast you can merge." | R-16 |
| Fake-candid openers | "Honestly? It depends." | "It depends on how often you use it." | R-16 |
| Signposting | "Let's dive in. Here's what you need to know." | Start with the content. | R-16 |
| Chatbot closers | "I hope this helps! Let me know..." | Cut. | R-16 |
| Actorless passive | "The pricing page was updated." | "We rewrote the pricing page." (passive is fine when the actor is unknown or irrelevant) | R-02 |
| Inanimate subject, human verb | "The dashboard understands your needs." | "The dashboard opens on the three metrics you check daily." | R-16 |
| Speculative gap-filling | "The founder likely started small." | State only what a source says, or omit. | R-36 |
| Generic positive ending | "The future looks bright." | End on the last concrete fact. | R-16 |
| All-caps emphasis | "WE NEED TO MOVE NOW." | Write the urgency into the sentence. | R-16 |

## Hygiene

- **Bold overuse:** bold the one term the reader must not miss, not every noun.
- **Scare quotes:** quotes for dialogue, real citations, and titles only.
- **Inline-header lists** (`- **Performance:** load times are faster`): write the sentence instead.
- **Emoji in headings and bullets:** remove; meaning goes in words (R-04).
- **Filler phrases:** "in order to" is "to"; "due to the fact that" is "because"; "it is important to note that" is nothing.
- **Hedge stacks:** one qualifier, not "could potentially possibly".

## What not to flag

Do not gut human prose. These are not tells on their own: perfect grammar, mixed registers, plain dry writing, precise formal vocabulary, one "however", curly quotes, one short emphatic sentence, unsourced everyday statements, and text inside quotations, titles, or names. Look for clusters, not single hits.

Preserve signs of a real writer: specific hard-to-invent detail, mixed feelings, era-bound references, varied sentence length, genuine asides.

## Voice calibration

When the user supplies a sample of their writing: note its sentence length, vocabulary, openings, punctuation, and recurring phrases, and match them instead of only deleting tells. Do not upgrade casual words or regularize deliberate quirks. The sample outranks this file's style advice, except R-02, which goes through the R-37 protocol.

## Draft, audit, final

1. **Draft** applying this file.
2. **Audit** with two questions, answered briefly: "What makes this read as AI-generated?" and "Does it state any fact, name, number, date, or citation not in the source?"
3. **Final**: fix both answers. Search for U+2014. Read it aloud.

---

## Copy checklist

All must be **yes**:

- [ ] Every number, name, quote, date, and claim is real or a labeled placeholder (R-17, R-18, R-36, R-38)
- [ ] No buzzwords from the English or Indonesian lists; specific language instead (R-16)
- [ ] No em dash (U+2014) in output; any kept from a user's sample was surfaced and approved (R-02)
- [ ] No aphoristic cadence, forced triplets, or false ranges (R-16)
- [ ] Every CTA is a specific verb plus object; no generic English or Indonesian CTA (R-15)
- [ ] Every error names the problem, the cause when useful, and the recovery
- [ ] Every empty, loading, and success state says what is happening and what to do next (R-27)
- [ ] Labels are persistent; placeholders are examples; terms are consistent across the product
- [ ] Non-English copy is written natively in one register, with locale formats
- [ ] Headlines pass the swap-the-logo test
- [ ] The copy has a voice and reads aloud like a person wrote it
