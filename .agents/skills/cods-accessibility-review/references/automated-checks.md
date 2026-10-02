# Automated accessibility checks

## What runs

- `expectAccessible(page, testInfo, include?)` in `tests/browser/fixtures.ts` runs axe-core with the tags `wcag2a`, `wcag2aa`, `wcag21aa`, and `wcag22aa`, attaches the full axe JSON (including incomplete checks) to the report, and fails on any violation.
- The Storybook suite discovers every built story and scans its `#storybook-root` after confirming it is not empty. A new story is covered automatically.
- `apps/storybook/.storybook/preview.ts` sets the a11y addon to `test: 'error'`, so violations also surface in Storybook itself.
- The Playwright base config sets `reducedMotion: 'reduce'`, `colorScheme: 'light'`, and a 1280×720 viewport. Motion-enabled states need an explicit override in the test.
- The `storybook` Playwright project runs in Chromium only. Firefox and WebKit coverage of a component's stories therefore comes from the interactive pass in the [manual checks](./manual-checks.md#browsers) until a Firefox Storybook project exists. Firefox is required for acceptance either way.

## Run it

```sh
pnpm exec turbo run build --filter=@cods-internal/storybook...
CODS_BROWSER_TARGET=storybook pnpm test:browser
pnpm test:browser:report
```

Ports 6006 and 4321 must be free and no interactive preview may be running (see the browser verification skill). Open the HTML report for the axe attachment of any failing story.

## Triage

| Result                    | Action                                                                                                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Violation                 | Fix the markup or style in the component. Follow the rule's help URL. Do not exclude the rule or the element.                                                                                                                          |
| Incomplete                | Review each manually; axe could not decide (often contrast over images or hidden content). Record the conclusion in the evidence file.                                                                                                 |
| Violation in USWDS markup | Check whether the pinned USWDS version produces it. If so, this is a type C divergence or an upstream issue; escalate rather than overriding silently ([ownership matrix](../../../../docs/governance/component-ownership-matrix.md)). |
| Fails only in a scaffold  | A freshly scaffolded component has an empty button; resolve the `TODO`s first.                                                                                                                                                         |

## Contrast

`packages/colorado-design-tokens/references/contrast-pairs.json` lists 16 selected pairs (text, link, button, form border, status icon, focus color) with minimum ratios, checked by `pnpm tokens:validate`. They cover documented roles on form and white surfaces only. A component using other combinations, or text over a non-token background, needs its own contrast check. Disabled states are excluded from the pairs. To add a pair, use the token change skill.

## What automation cannot show

Keyboard order meaning, whether focus is obscured, announcement quality, reflow usability, and forced-colors rendering need the manual and emulated checks.
