# Code comments

Load when writing or cleaning code comments, or when running the `comments` command. Removes comments that read as generated filler, keeps the ones that carry information.

## Scope guardrail

- Change **comments only**. Never touch executable code, identifiers, imports, formatting, indentation, whitespace, control flow, or logic.
- Never remove license headers, legal notices, directives the toolchain reads (`eslint-disable`, `@ts-expect-error`, `pulupulu-disable-next-line`, `# type: ignore`, `//go:build`, shebangs), or doc comments a generator publishes.
- When unsure whether a comment matters, keep it.

## The test

A comment earns its place when it says something the code cannot: **why**, a constraint, a non-obvious behavior, a trap. A comment that says **what** the next line does is removed.

---

## Remove

| Pattern | Example | Fix |
|---|---|---|
| Decorative separators | `// ======== AUTH ========`, `/* ---- ROUTES ---- */`, box drawing | One plain line, or remove |
| Restating the obvious | `// Initialize count` above `let count = 0`; `// User class` above `class User` | Remove |
| Workflow narration | `// Step 1: validate`, `// Step 2: process`, `// Finally...` | Remove; if the flow is hard to follow, that is a structure problem |
| Line-by-line narration | A comment on every trivial statement | At most one comment per logical block, only if needed |
| Empty labels | `// Main logic`, `// Helper function`, `// Error handling`, `// Note: this is important` | Remove unless it states a specific fact |
| Vague TODOs | `// TODO: improve this`, `// Add more validation` | Remove, or rewrite as a specific task with context |
| Signature echo | `@param price The price. @returns The total.` | Remove the echo; keep docs on rules, edge cases, side effects, errors |
| Decorative emoji | `// ✅ Validation`, `// 🚀 Performance` | Plain words, or remove |
| End markers | `} // end if`, `// End processOrder` | Remove |
| Stiff or loud wording | "This function is responsible for validating whether..."; `// MAIN LOGIC` | Short, sentence case, natural voice |
| Over-explained notes | Four lines of history, issue numbers, and version notes around a one-line fact | Cut to the constraint: one line, two only when the second is a new fact |
| Em dashes | U+2014 inside comment prose | Comma, period, colon, or parentheses (style consistency with R-02) |

## Keep

Comments that explain:

- business rules and intent
- architectural decisions and their reason
- security considerations
- performance trade-offs
- concurrency and ordering behavior
- protocol and API contract details
- workarounds (what the workaround avoids, in one line)
- edge cases and assumptions
- licensing and legal notices

```js
// Stripe may retry webhook deliveries for up to three days.
// Ignore duplicates by event ID.
```

Value is not length. A kept comment is still cut to its constraint: the workaround in one line, not its history.

## Writing new comments

- Write one only when the code cannot say it. Prefer a better name over a comment.
- One line, sentence case, plain developer voice: `// Retry only on 5xx; 4xx means the request is wrong.`
- Comments never carry design reasons for UI choices or direction contracts; those belong in the delivery report and `DESIGN.md` (core R-31).
- Never put user-facing copy, secrets, or internal URLs in comments that ship to the browser.

---

## Code comment checklist

All must be **yes**:

- [ ] Every remaining comment adds information the code does not show
- [ ] No decorative separators, ALL CAPS banners, emoji, or end markers
- [ ] No restating, narration, empty labels, or vague TODOs
- [ ] No signature echo; real documentation kept
- [ ] At most one comment per logical block; each one line, two only for a second fact
- [ ] Short, natural, sentence-case wording
- [ ] Tool directives, license headers, and published docs untouched
- [ ] Only comments changed; the code is byte-identical outside comments
