# Test audit guide

Goal from CDS-85: keep the tests that protect distinct behavior, remove demonstrable duplicates, and record why. There is no reduction quota.

## Where each kind of test belongs

| Concern                                                                                                                                                                        | Home                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Controller state, lifecycle, events, validation                                                                                                                                | Unit tests (`<name>.test.ts`)                                            |
| Component behavior in a real browser across **every** fixture state (keyboard, focus, multiple/disabled states, 320px reflow, forced colors, reduced motion, geometry, tokens) | `storybook-<name>.spec.ts`, using the `all-states` and per-state stories |
| The docs page itself: outline, status, preview enhancement, axe, no-JS readability, page-load timing                                                                           | `web-<name>.spec.ts`                                                     |

After the page shows only a curated preview, web tests that relied on fixture states missing from the page must move to Storybook with their assertions intact.

## Shared specs that cover every component

Check these on every ticket; Accordion missed the first one at first.

- `tests/browser/web-shared-fixtures.spec.ts`: checks generated code on each page. Pages with a curated preview are checked against it automatically.
- `tests/browser/web-component-docs.spec.ts`: legacy required headings (Summary, Anatomy, Known limitations). Remove the component from its `pages` list once the page follows the new outline; the component's own page-outline test replaces it.
- `scripts/check-docs-output.mjs` (run by `pnpm build`): docs code drift, links, landmarks.
- `tests/component-fixtures.test.ts`: fixture and metadata generation; usually unaffected.

## Decisions

- **Keep:** distinct behavior or state, keyboard/focus, accessibility, lifecycle and no-JS, visual/geometry, and any test that guards a past defect (look for review comments in the test or evidence file).
- **Consolidate:** the same scenario with different inputs (use `it.each` or a loop); a smoke test fully contained in a fuller test; screenshot-only "visual review" attachments (fold into the nearest asserting test).
- **Remove:** identical assertions on identical markup in two places (for example the same focus-ring test in web and Storybook). Keep the copy closest to the component.
- **Do not:** loosen selectors, tolerances, or axe rules; delete a past-defect regression; or cap component tests.

## Counting

Count Playwright runs, not functions: web specs run in three browsers (`web`, `web-firefox`, `web-webkit`); Storybook specs run once. Use `--list`:

```bash
pnpm exec playwright test --list --project web tests/browser/web-<name>.spec.ts
```

Record unit cases, web tests × browsers, Storybook tests, and the component's entries in shared specs, before and after, in a table.
