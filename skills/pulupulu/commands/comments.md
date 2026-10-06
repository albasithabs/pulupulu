# comments

Remove generic slop comments from code and keep the ones that carry information. Only comments change; the code never does. Full rule set: [code-comments.md](../rules/code-comments.md).

## When to use

- Generated code is full of narration, banners, restated lines, or emoji comments.
- Before a review or a release, to make comments worth reading again.

## When not to use

- The user wants documentation written or rewritten (README, API docs). That is a writing task, not this cleanup.
- Comments are wrong because the code changed. Flag them; fixing behavior is out of scope.

## Scope guardrail

Change comments only. Never touch executable code, identifiers, imports, strings, formatting, indentation, blank lines between statements, control flow, or logic. Never remove license headers, legal notices, directives (`eslint-disable`, `@ts-expect-error`, `pulupulu-disable`, `# type: ignore`, `//go:build`, shebangs, `"use client"`), or doc comments that tooling reads for public APIs unless they only echo the signature. When unsure whether a comment is functional, keep it.

## Steps

1. **Set the target.** Use the paths the user gave; otherwise the files changed in this session or branch. Skip vendored, generated, and minified files.
2. **Scan.** For each file, list every comment with its line number. Use the language's comment syntax (`//`, `/* */`, `#`, `<!-- -->`, `{/* */}`, docstrings).
3. **Classify each comment.**

   **Remove** (slop):
   - Narration of the next line or block: `// Initialize the counter`, `// Loop through items`, `// Return the result`.
   - Restating the code or signature: `// User class`, `// This function validates the user`, a JSDoc that only repeats `@param price The price`.
   - "This function...", "This component...", "Here we..." openers that describe what the code plainly shows.
   - Step narration: `// Step 1: ...`, `// First...`, `// Finally...`.
   - Changelog in comments: `// Updated to fix bug`, `// Changed from X to Y`, `// Added new feature`, `// Refactored`. History belongs in version control.
   - Decorative banners and separators: `// ===== AUTH =====`, ALL CAPS section labels, box drawing.
   - Emoji in comments: `// ✅ Validation`, `// 🚀 Fast path`.
   - Empty labels and vague TODOs: `// Main logic`, `// Helper`, `// TODO: improve this`.
   - End markers: `} // end if`.
   - Commented-out code with no reason attached (list it separately; ask before removing large blocks).

   **Keep** (value):
   - Why: intent, business rules, the reason for a non-obvious choice.
   - Constraints: protocol rules, ordering requirements, concurrency, performance trade-offs, security notes.
   - Workarounds, ideally with a link to the issue or upstream bug.
   - Edge cases and assumptions the code depends on.
   - TODO or FIXME with an owner or a concrete task: `// TODO(rina): drop after API v2 ships`.
   - Public API docs that add behavior, errors thrown, side effects, or units.

   **Shorten** (value buried in padding): cut a kept comment to the fact itself, one line, two only when the second line is a new fact. Rewrite stiff or shouting wording into a short sentence-case note. Do not change its meaning.
4. **Edit.** Delete removed comments, including the comment line itself, without disturbing surrounding code or blank-line structure. Apply shortenings in place.
5. **Check the code is untouched.** Compare the diff: only comment lines changed. If a formatter or linter runs in the project, run it in check mode only and confirm nothing besides comments differs.

## Output

Per file, then totals:

| File | Removed | Shortened | Kept | Notes |
|---|---|---|---|---|
| src/api/orders.ts | 14 | 2 | 5 | 1 commented-out block left, ask |

- Removed comments grouped by kind (narration, restating, changelog, banners, emoji, vague TODO, end markers), with counts.
- Comments flagged as possibly outdated (they contradict the code), left in place for the user to decide.
- Commented-out code blocks found and whether you removed them.
- A one-line confirmation that no code changed.

## Done when

- Every remaining comment tells the reader something the code does not.
- No banners, emoji, narration, or changelog comments remain in the target.
- The diff contains comment changes only, and the per-file counts are reported.
