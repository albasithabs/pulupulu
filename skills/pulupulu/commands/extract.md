# extract

Pull repeated values and components into tokens and shared components. The rendered result must look and behave the same before and after.

**Mode:** during (implied by the command; it edits code).

## When to use

- The same color, spacing, radius, shadow, or type combination is hard-coded in three or more places with the same intent.
- Two or more implementations of the same component exist (three button styles that mean "primary").
- `document` listed drift that the user wants consolidated.

## When not to use

- The user wants the look changed. Extraction is behavior- and appearance-preserving; use `polish`, `build`, or an enhance command.
- A value appears once or twice. Premature abstraction is worse than duplication.
- Two things look alike but serve different purposes. They stay separate.

## Steps

1. **Find the system.** Locate tokens (CSS custom properties, Tailwind theme, theme objects, token files) and the shared component folder. Learn the naming, file layout, and export conventions. If no system exists, ask where tokens and components should live before creating anything.

2. **Capture the baseline.**
   ```bash
   node <skill-dir>/scripts/pulupulu.mjs detect --json <target> > .pulupulu/extract-before.json
   node <skill-dir>/scripts/pulupulu.mjs detect --browser --screenshots .pulupulu/shots/extract-before <url-or-file>
   ```
   Cover every page that uses the code you will touch. Without a browser, say so and rely on code inspection and the project's tests.

3. **Identify candidates.** For each, record the value or pattern, every location, and its intent:
   - hard-coded colors, spacing, radii, shadows, durations, easing;
   - repeated type combinations (size, weight, line height, tracking);
   - repeated components and composition patterns (form rows, toolbars, empty states);
   - near-duplicates (`#6b7280` and `#6c727f`).
   Keep only items used three or more times with the same intent.

4. **Plan and check scope.** List the tokens to create (semantic names that match the project, e.g. `--color-text-muted`, not `--gray-500-ish`), the components to extract with their props and variants, and the migration path. **Merging near-duplicates changes pixels:** list each merge with both values and ask before applying it. Everything else proceeds without a question when it is inside the requested scope.

5. **Extract.** Build tokens with a clear primitive and semantic split where the project already uses one. Build shared components with the variants actually in use, accessibility carried over (labels, roles, focus, keyboard), and no props invented for hypothetical futures.

6. **Migrate.** Replace every instance found in step 3. Delete the old implementations and any now-unused styles. Do not reformat unrelated code.

7. **Verify parity.** Run the same detector commands into `extract-after`. Compare screenshots side by side, viewport by viewport. Any visible difference that is not an approved merge is a regression: fix it. The detector must show no new findings; findings that disappear are fine and worth noting. Run the project's tests and build.

8. **Update the record.** If `DESIGN.md` exists, update its token and component sections and remove resolved items from `## Drift`. Leave unresolved drift listed.

## Output

- New or extended tokens and shared components, with all instances migrated and dead code removed.
- Before and after screenshots in `.pulupulu/shots/extract-before` and `extract-after`.
- A chat summary: what was extracted, instance counts, approved merges, detector diff, and any parity differences found and fixed.

## Done when

- [ ] Every extracted item had three or more same-intent uses.
- [ ] Token and component names follow the project's conventions.
- [ ] Near-duplicate merges were approved by the user before applying.
- [ ] Before and after screenshots match except for approved merges.
- [ ] The detector shows no new findings; tests and build pass.
- [ ] Old implementations are deleted and `DESIGN.md` is updated if it exists.
