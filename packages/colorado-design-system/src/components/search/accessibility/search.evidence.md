# Accessibility Evidence: `cods-search`

**Maturity:** experimental

**Review date:** 2026-11-05

**Metadata:** `search.metadata.json`

## Keyboard and focus

- [ ] Verify Tab reaches the input and submit button in order, and focus can leave the form.
- [ ] Verify Enter submits a query and the approved focus indicators remain visible.
- There is no scripted focus management; submission uses the browser's form behavior.

## Naming and roles

| Element       | Role            | Accessible name source                        |
| ------------- | --------------- | --------------------------------------------- |
| Form          | search landmark | `aria-label`, distinct for each fixture       |
| Input         | searchbox       | Associated visible or visually hidden `label` |
| Submit button | button          | Text, or `aria-label` for the slim variant    |

- [ ] A human must confirm names and roles with a screen reader. Browser assertions checked names and axe in Chromium, Firefox, and WebKit on 2026-11-05.

## Screen reader verification

- [ ] A human reviewer must verify names, landmarks, and operation with a named screen reader and browser. No screen-reader results have been recorded.

## Reflow, motion, and forced colors

- [ ] Check actual 400% zoom. The documentation fixture passed an automated 320px overflow check in Chromium, Firefox, and WebKit on 2026-11-05.
- [ ] Human review of forced colors and focus visibility remains open. Automated tests checked a visible focus outline and control bounds in emulated forced colors and a narrow right-to-left example in Chromium, Firefox, and WebKit on 2026-11-05.
- Motion: N/A — the component adds no animation.

## Localization

- [ ] Check long translations and right-to-left text with a human reviewer. The layout uses logical properties, but its rendered appearance has not been reviewed by a person.
- Right-to-left reflow: the compact and slim labels originally used `usa-sr-only`, which positions hidden text at `left: -999em` and expanded the documentation page to roughly 16,288px under `dir="rtl"` at 320px. They now use `cods-search__label--hidden`, which clips the label in place. An automated full-document right-to-left test checks for horizontal overflow and the accessible names of both variants in Chromium, Firefox, and WebKit.

## Open items

Human design and accessibility review, screen-reader testing, and browser checks remain open. Track this work under CDS-76; do not mark stable until the accessibility owner completes review.
