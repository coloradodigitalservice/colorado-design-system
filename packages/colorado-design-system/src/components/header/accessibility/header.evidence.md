# Accessibility Evidence: `cods-header`

**Component maturity at time of review:** experimental  
**Reviewer:** _Pending human accessibility review_  
**Date:** 2026-11-17
**Related component metadata:** `header.metadata.json`

Every checklist item must be checked or explicitly marked "N/A — \<reason>" before the component can be marked `stable`. Leaving an item blank means the evidence is incomplete.

## Review update: 2026-11-19

Changes for Phil Stier's review of PR 107. Automated checks only; the manual
items below remain open.

- The horizontal navigation now shows from 48em (768px), as in the Figma
  tablet frame. The drawer applies only below 48em.
- The Header has the low elevation shadow from 48em.
- A new `full` fixture state shows search, a Language Selector, a dropdown, a
  multi-column mega menu, and a categorized mega menu. Submenus use the pinned
  USWDS navigation behavior. Without JavaScript every submenu link stays visible.
- While the drawer is open, Menu and its ancestors stay in the accessibility
  tree, so its `aria-expanded="true"` is exposed. The logo and the rest of the
  page stay hidden.
- When widening the window closes the drawer, focus stays on the focused
  navigation link, or moves to the first visible navigation control.
- The controller keeps the page's own `<body>` padding: it adds the scrollbar
  width while the drawer is open and restores the inline value on close and on
  `destroyHeader`.

Manual checks to add to the matrix: submenu keyboard and Escape behavior, mega
menu reading order and list names, Menu announced as expanded with VoiceOver
and NVDA, focus after resizing an open drawer, and forced colors for submenus.

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order.
- [ ] No keyboard trap: focus can always move away from the component using standard keys.
      **Decision:** below 48em the open drawer keeps Tab and Shift+Tab inside it
      (USWDS focus trap). Escape, Close, the overlay, or following a link closes
      it and returns focus to Menu, so focus is never stuck. This is the
      explicit, documented exception to CODS-P3-011's "no modal-style focus
      trapping" default, chosen on 2026-11-17 to reuse the USWDS behavior that
      matches the Figma drawer. It needs accessibility-lead confirmation.
- [ ] Documented keyboard interactions: Tab and Shift+Tab move through the logo
      link and navigation links in DOM order on wide screens. Below 48em, Tab
      reaches the logo link and Menu; Enter or Space on Menu opens the drawer and
      focuses Close; Tab and Shift+Tab cycle through Close and the links inside
      the drawer; Escape closes it and returns focus to Menu.

## Focus

- [ ] Visible focus indication uses the approved focus tokens at every focusable state.
- [ ] Focus is placed predictably on open, close, add, remove, and error/validation state changes:
      opening moves focus to Close; closing returns it to Menu; widening the
      window past 48em closes the drawer.

## Naming and roles

- [ ] Accessible name and role documented for each interactive element:

  | Element         | Role       | Accessible name source                          |
  | --------------- | ---------- | ----------------------------------------------- |
  | Header          | banner     | Implicit when `<header>` is a child of `<body>` |
  | Logo link       | link       | `aria-label`; the image has `alt=""`            |
  | Menu            | button     | Visible text; `aria-controls` the navigation    |
  | Navigation      | navigation | `aria-label="Primary"`                          |
  | Close           | button     | `aria-label="Close menu"`; icon is hidden       |
  | Navigation link | link       | Visible text; current page has `aria-current`   |

- [ ] Accessible name/role documented for each state variation: the controller
      sets Menu's `aria-expanded` to `false` or `true`. While the drawer is
      open, USWDS sets `aria-hidden="true"` on page content outside the
      navigation (including Menu); the controller removes it from the header's
      ancestors so the navigation stays exposed when the header is nested.
      Without JavaScript, Menu and Close are hidden and have no expanded state.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested: _e.g., VoiceOver + Safari, NVDA + Firefox_.
- [ ] Observed behavior notes: _describe what was announced and any discrepancies from the expected name/role/value_.

## Zoom and reflow

- [ ] Verified usable at 400% zoom / 320px-equivalent reflow without loss of content or function.
      Automated: at 320px without JavaScript every link is visible, 48px tall,
      and the header does not overflow. Actual 400% zoom is not yet reviewed.

## Motion

- [ ] Animation (if any) respects `prefers-reduced-motion`. USWDS disables
      the drawer slide-in under `prefers-reduced-motion`; the component removes
      the overlay fade. Needs manual confirmation.

## Forced colors / high contrast

- [ ] Component remains usable and distinguishable under a forced-colors mode.
      The current-page indicator is a border, so it renders in a system color;
      other links' transparent indicator borders are set to `Canvas`. Automated
      axe checks ran with forced colors emulated; manual review is pending.

## Localization

- [ ] String expansion, truncation, and wrapping behavior noted for long or translated content. Wide-screen links wrap onto more rows; drawer labels wrap within the 240px drawer. Verify with translated copy.
- [ ] Bidirectional text behavior noted, if the component's `localization` metadata is `layout-sensitive`. Layout uses logical properties; USWDS pins the drawer to the physical right edge. Verify right-to-left behavior with localized copy.

## Open items

List any unresolved findings and their tracking issue. A component with open items here cannot be marked `stable`.

- Accessibility-lead confirmation of the mobile drawer focus trap (see
  Keyboard).
- Human screen-reader verification, actual 400% zoom, forced-colors review,
  and design approval are still required.
- The overlay uses USWDS's default scrim because Figma defines no Colorado
  overlay token.
- The Figma tablet layout and the dropdown, mega-menu, search, and Translate
  variants are out of scope for CODS-P3-011.

## Automated and browser verification

On 2026-11-17, 17 Vitest unit tests covered the lifecycle (idempotent `init`,
`destroy` restoring authored markup, closing an open drawer on `destroy`),
events, every close path, nested-ancestor exposure, and invalid markup. The
Storybook Header suite (Chromium) and the documentation Header suite
(Chromium and WebKit) passed 13 browser tests: wide layout, the drawer's
open and close paths, keyboard focus order and wrap, the overlay, resizing,
the no-JavaScript fallback at 320px with forced colors and reduced motion, and
axe checks in collapsed, expanded, and no-JavaScript states. Firefox could not
launch on the local machine (a Playwright profile error that also affects
existing suites) and needs the CI run.
