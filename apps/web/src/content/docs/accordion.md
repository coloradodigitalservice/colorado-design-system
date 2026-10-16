---
title: Accordion
description: An experimental, progressively enhanced accordion for related sections of content.
navLabel: Accordion
order: 10
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1387-254
---

## When to use

Use an accordion to organize related, optional sections, such as supporting details or frequently asked questions. Keep information everyone needs visible outside it. Do not use it for a single block of content, for navigation, or for content people must read in full to complete a task. Choose heading levels to fit the page outline. The examples above use the package's canonical fixture.

Accordion is **experimental** in the `0.x` development series. P3-007 builds on the G2 vertical slice; design review, detailed manual accessibility evidence, and owner acceptance remain open.

## Anatomy

1. **Root** (`cods-accordion`, `data-cods-accordion`): owns the lifecycle, configuration, and events.
2. **Heading** (`cods-accordion__heading`): a heading element at the level your page needs.
3. **Trigger** (`cods-accordion__trigger`): a native `button` inside the heading that names and toggles one panel.
4. **Panel** (`cods-accordion__panel`): the content controlled by the trigger through `aria-controls`.

## Install and initialize

Follow [Getting started](/getting-started/) to install the development release and load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once. Author the USWDS markup with the CoDS hooks shown above. Give every panel a document-unique ID and point its button's `aria-controls` to that ID. Keep panels visible and `aria-expanded="true"` in server-rendered markup. Set `data-cods-accordion-expanded="true"` or `"false"` on each button for its initial enhanced state. No panel needs a region role or a live region.

```js
import {
  initAccordion,
  initAllAccordions,
  destroyAccordion,
  setAccordionExpanded,
} from '@coloradodigitalservice/colorado-design-system';

const root = document.querySelector('[data-cods-accordion]');
initAccordion(root);
setAccordionExpanded(root, 'your-panel-id', true);
// Before removing/replacing the component:
destroyAccordion(root);
// After inserting new markup:
initAllAccordions(document);
```

Use the built ES module in a `script type="module"` when consuming without a bundler. USWDS 3.14.0's toggle behavior is bundled into the module; the consumer needs no separate USWDS script. Do not also run a USWDS auto-initializer on these roots. There are no document-level listeners or automatic insertion observers.

## Public API and state

| Hook or method                                  | Meaning                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-cods-accordion`                           | Root with `usa-accordion cods-accordion` classes.                                                                  |
| `data-cods-accordion-trigger`                   | Native `type="button"` with `usa-accordion__button cods-accordion__trigger`, `aria-controls`, and `aria-expanded`. |
| `data-cods-accordion-panel`                     | Associated content panel with `usa-accordion__content cods-accordion__panel`.                                      |
| `data-cods-accordion-expanded`                  | Optional initial state (`true`/`false`); otherwise initialization reads `aria-expanded`.                           |
| `data-cods-accordion-multiple`                  | Presence permits more than one open panel; otherwise opening one closes its siblings.                              |
| `data-cods-accordion-enhanced`                  | Controller-owned marker; do not author it or change it at runtime.                                                 |
| `initAccordion(root)`                           | Initialize a connected root; repeated calls are safe. Invalid pairs warn once and leave markup unchanged.          |
| `initAllAccordions(container)`                  | Initialize roots within a container, including a root container itself. Defaults to `document`.                    |
| `setAccordionExpanded(root, panelId, expanded)` | Set an owned panel's state. Unknown, uninitialized, and disabled targets are ignored.                              |
| `destroyAccordion(root)`                        | Remove listeners and restore authored attributes. Safe before initialization or when called repeatedly.            |

Initial configuration is read during initialization. Destroy and reinitialize after changing configuration or adding/removing items within an existing root. New roots can be initialized independently. Nested accordions are unsupported: initialization warns once per root and leaves nested markup readable without enhancement. Use ordinary headings instead.

`aria-expanded` and `hidden` reflect the enhanced state. In single-open mode, the last initially expanded item wins if more than one is declared. Disabled triggers use the native `disabled` attribute, skip the tab order, and cannot be toggled by the public method. Their panel still remains readable without scripting.

Every changed panel dispatches **`cods-accordion:change`** from its root with `bubbles: true`, `composed: false`, and `detail: { panelId: string, expanded: boolean }`. All affected states settle before the events fire. Opening a sibling therefore produces a closing event and an opening event; initialization, redundant operations, and teardown produce no events.

## Open-panel decision

CODS-P3-007 retains **single-open by default** to preserve the shipped vertical-slice API and USWDS's default behavior. Opening one panel closes its siblings; every panel may also be closed. Add `data-cods-accordion-multiple` to opt into independent panels when people need to compare sections. The Multiple and Expanded stories show both panels open; Mixed shows one open and one closed, and Collapsed shows both closed. No arrow-key roving navigation is included in this release; native Tab navigation keeps every enabled header reachable.

## Keyboard and focus

Tab and Shift+Tab follow the native button/link order. Enter and Space toggle a focused enabled trigger. Focus stays on that trigger after activation. If initialization or a public method collapses a panel containing focus, focus returns to its trigger. Initialization leaves focus in content that remains open. When opening a panel leaves its trigger outside the viewport (for example, after a sibling closes), the delegated USWDS click handler may scroll it into view. This also applies with reduced motion; the wrapper does not request smooth scrolling, but page CSS can affect scrolling behavior. Escape and arrow keys retain their ordinary browser behavior; there is no modal state, focus trap, or custom arrow navigation.

## Progressive enhancement

Without JavaScript, all panel content is visible and readable; the buttons do not collapse it. Without CSS, semantic headings, buttons, and content still work. Successful initialization applies the declared collapsed states. Destroy restores the original server-rendered presentation. Do not server-render `hidden` on content that needs to remain available without JavaScript.

The controller wraps the pinned [USWDS accordion](https://designsystem.digital.gov/components/accordion/) `on`/`off` lifecycle and state/exclusivity functions and adds the CoDS lifecycle, events, and focus safety.

## Appearance and localization

Public classes are `cods-accordion`, `cods-accordion--bordered`, `cods-accordion--white`, `cods-accordion__heading`, `cods-accordion__trigger`, and `cods-accordion__panel`. Keep the corresponding `usa-*` classes as the private upstream integration markup. Use `cods-accordion--bordered` for a gray header and 4px pale panel border, the default class for a borderless panel, and `cods-accordion--white` for white headers and 1px borders. Each appears in the canonical examples and Storybook.

Set `--cods-accordion-background`, `--cods-accordion-text`, and `--cods-accordion-border` on a root to customize approved token-based defaults. The Accordion-specific border mapping uses `color.border-accordion-subtle` (gray/10) without changing the shared `color.border-subtle` (gray/20). White uses `color.border-default`. The pale border is decorative; the text, native button state, and up/down chevron convey the control and state.

Focus follows the inspected Accordion effect: a 2px white gap with blue extending to 4px from the control edge (a 2px blue band). `focus.accordion-outer-spread` controls that extent; it does not redefine the shared focus-ring width used by other components. Forced colors retain a system-color outline and the chevron mask. Preserve readable contrast and visible focus.

Translate heading/body text, set the appropriate `lang`, and use `dir="rtl"` for right-to-left content. Padding and icons use logical positioning. Content wraps without a fixed height; do not place unresponsive tables or media inside panels. Error, loading, and empty states belong to the content rather than this disclosure control.

The shipped fixture is available at `@coloradodigitalservice/colorado-design-system/fixtures/accordion.html` and metadata at `@coloradodigitalservice/colorado-design-system/metadata/accordion.json`. Storybook, the automated tests, and this page use that same fixture.

## Accessibility responsibilities

The component supplies native button semantics, `aria-expanded`/`aria-controls` state, visible focus, reflow, reduced-motion, and forced-colors support. Authors remain responsible for unique panel IDs, heading levels that fit the page outline, meaningful trigger text, translated content, and keeping panel content accessible. Do not hide content that must remain available without JavaScript. Eric reported completing fresh screen-reader, actual 400% zoom, and Windows High Contrast checks on October 16, 2026. Specific environments and announcements were not supplied; the evidence distinguishes that report from automated checks and owner acceptance.

## Known limitations and implementation status

- **Status:** P3-007 extends the G2 vertical slice at **experimental** maturity. Historical manual review is recorded in the evidence file; the lifecycle and style updates need fresh human verification. Domain-owner acceptance and G3 approval are pending. The live Figma file was inspected in Chrome’s Aten profile on October 16, 2026. Chevron artwork, borders, focus geometry, and the white variant follow that observation; Git remains authoritative for released token values.
- Configuration is read once at initialization; destroy and reinitialize after changing configuration or an existing root's items.
- The controller does not observe the DOM; call `initAllAccordions()` after inserting new markup.
- No nested accordions, custom arrow-key navigation, animation, or live-region announcements. State changes are immediate with either reduced-motion preference.
- Approved visual regression baselines are not yet established.
- Markup, custom properties, and controller APIs may change before `1.0`.
