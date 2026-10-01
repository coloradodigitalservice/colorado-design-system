---
title: Accordion
description: An experimental, progressively enhanced accordion for related sections of content.
navLabel: Accordion
order: 20
---

## When to use

Use an accordion to organize related, optional sections. Keep information everyone needs visible outside it. Choose heading levels to fit the page outline. The examples above use the package's canonical fixture.

Accordion is **experimental** in the `0.0.x` development series. Manual accessibility review and G2 acceptance remain open.

## Install and initialize

Load the package stylesheet and author the USWDS markup with the CoDS hooks shown above. Give every panel a document-unique ID and point its button's `aria-controls` to that ID. Keep panels visible and `aria-expanded="true"` in server-rendered markup. Set `data-cods-accordion-expanded="true"` or `"false"` on each button for its initial enhanced state. No panel needs a region role or a live region.

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

Initial configuration is read during initialization. Destroy and reinitialize after changing configuration or adding/removing items within an existing root. New roots can be initialized independently. Nested roots are isolated, but avoid nesting accordions when ordinary headings would be clearer.

`aria-expanded` and `hidden` reflect the enhanced state. In single-open mode, the last initially expanded item wins if more than one is declared. Disabled triggers use the native `disabled` attribute, skip the tab order, and cannot be toggled by the public method. Their panel still remains readable without scripting.

Every changed panel dispatches **`cods-accordion:change`** from its root with `bubbles: true`, `composed: false`, and `detail: { panelId: string, expanded: boolean }`. All affected states settle before the events fire. Opening a sibling therefore produces a closing event and an opening event; initialization, redundant operations, and teardown produce no events.

## Keyboard and focus

Tab and Shift+Tab follow the native button/link order. Enter and Space toggle a focused enabled trigger. Focus stays on that trigger after activation. If a public method collapses a panel containing focus, focus returns to its trigger. Escape and arrow keys retain their ordinary browser behavior; there is no modal state, focus trap, or custom arrow navigation.

## Progressive enhancement

Without JavaScript, all panel content is visible and readable; the buttons do not collapse it. Without CSS, semantic headings, buttons, and content still work. Successful initialization applies the declared collapsed states. Destroy restores the original server-rendered presentation. Do not server-render `hidden` on content that needs to remain available without JavaScript.

The controller wraps the pinned [USWDS accordion](https://designsystem.digital.gov/components/accordion/) state/exclusivity functions and adds the CoDS lifecycle, events, and focus safety.

## Appearance and localization

Public classes are `cods-accordion`, `cods-accordion--bordered`, `cods-accordion__heading`, `cods-accordion__trigger`, and `cods-accordion__panel`. Keep the corresponding `usa-*` classes as the private upstream integration markup. Set `--cods-accordion-background`, `--cods-accordion-text`, and `--cods-accordion-border` on a root to customize approved token-based defaults. Preserve readable contrast and visible focus.

Translate heading/body text, set the appropriate `lang`, and use `dir="rtl"` for right-to-left content. Padding and icons use logical positioning. Content wraps without a fixed height; do not place unresponsive tables or media inside panels. Error, loading, and empty states belong to the content rather than this disclosure control.
