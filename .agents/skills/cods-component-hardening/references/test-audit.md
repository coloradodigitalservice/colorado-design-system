# Test audit guide

Goal from CDS-85: keep the tests that protect distinct behavior, remove demonstrable duplicates, and record why. There is no reduction quota.

## Where each kind of test belongs

**Web specs run in Chromium, Firefox, and WebKit. Storybook specs run in
Chromium only.** Moving a test from web to Storybook drops two browser engines,
so only move tests that cannot run on the page.

| Concern                                                                                                                 | Home                                                                |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Controller state, lifecycle, events, validation                                                                         | Unit tests (`<name>.test.ts`)                                       |
| Engine-sensitive behavior: keyboard, focus rings, forced colors, hover, reflow, no-JS — for states shown in the preview | `web-<name>.spec.ts`, against the preview's variants                |
| The docs page itself: outline, status, preview enhancement, axe                                                         | `web-<name>.spec.ts`                                                |
| States the curated preview does not show (Spanish, RTL, disabled, long content, single item, and so on)                 | `storybook-<name>.spec.ts`, using `all-states` or per-state stories |
| Geometry, tokens, and artwork checks that already live in Storybook                                                     | `storybook-<name>.spec.ts`                                          |

Choose preview variants so the engine-sensitive tests keep running in all
three browsers. When a test must move to Storybook, record in the evidence file
that it now runs in Chromium only. When the same assertion exists in both web
and Storybook, keep the web copy.

Storybook is a development tool and is not deployed with PR previews; QA reviews
the docs page on the Netlify preview.

## Shared specs that cover every component

Check these on every ticket; Accordion missed the first one at first.

- `tests/browser/web-shared-fixtures.spec.ts`: checks generated code on each page. Pages with a curated preview are checked against it automatically.
- `tests/browser/web-component-docs.spec.ts`: legacy required headings (Summary, Anatomy, Known limitations). Remove the component from its `pages` list once the page follows the new outline; the component's own page-outline test replaces it.
- `scripts/check-docs-output.mjs` (run by `pnpm build`): docs code drift, links, landmarks.
- `tests/component-fixtures.test.ts`: fixture and metadata generation; usually unaffected.

## Decisions

- **Keep:** distinct behavior or state, keyboard/focus, accessibility, lifecycle and no-JS, visual/geometry, and any test that guards a past defect (look for review comments in the test or evidence file).
- **Consolidate:** the same scenario with different inputs (use `it.each` or a loop); a smoke test fully contained in a fuller test; screenshot-only "visual review" attachments (fold into the nearest asserting test).
- **Remove:** identical assertions on identical markup in two places (for example the same focus-ring test in web and Storybook). Keep the web copy so all three browsers still run it.
- **Do not:** loosen selectors, tolerances, or axe rules; delete a past-defect regression; or cap component tests.

## Counting

Count Playwright runs, not functions: web specs run in three browsers (`web`, `web-firefox`, `web-webkit`); Storybook specs run once. Use `--list`:

```bash
pnpm exec playwright test --list --project web tests/browser/web-<name>.spec.ts
```

Record unit cases, web tests × browsers, Storybook tests, and the component's entries in shared specs, before and after, in a table.
