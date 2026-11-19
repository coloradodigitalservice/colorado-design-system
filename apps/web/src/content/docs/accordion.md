---
title: Accordion
description: A list of headings that show or hide related sections of content.
navLabel: Accordion
order: 10
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1387-254
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility checks were completed for all states on November 18, 2026.
---

## Guidance

### When to use

Use an accordion when content can be grouped into related, optional sections, such as supporting details. People can scan the section headings and open only the sections that matter to them.

Don't use an accordion when:

- Everyone needs to see the information, or people must read it in full to complete a task. Keep crucial information visible.
- There are three or fewer sections, or there isn't enough content to warrant condensing. Use headings and keep the content visible.
- The goal is navigation. Use links or another page structure instead.
- You are writing FAQs. Consider organizing the information around what people need to do instead.

Choose a variant that fits the surrounding page:

| Variant            | Use when                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Bordered (default) | The accordion is a standalone container, especially on dense pages, complex forms, or data-heavy content.       |
| Borderless         | The accordion is the main content on a clean page and should look minimal and integrated, such as in a sidebar. |
| White              | The accordion sits on a section or page with a background other than white.                                     |

By default, opening one section closes the others. Allow multiple open sections when people need to compare them.

### Writing for accordions

- Keep crucial information outside collapsed sections.
- Keep the hierarchy flat. Use simple content and links, and avoid tables, subheadings, complex structures, and nested accordions inside sections.
- Write clear, descriptive headings in sentence case using fewer than seven words. Keep them short enough to avoid wrapping.
- Consider simplifying the content, separating it with headings, splitting it across pages, or linking to sections on the same page.

### Accessibility for accordions

- Tab and Shift+Tab move between section headings and any links or controls in open sections. Enter or Space opens or closes the focused section, and focus stays on its heading button.
- Each heading button announces whether its section is expanded or collapsed. There is no arrow-key navigation between headings.
- Put each button inside a real heading element, and choose the heading level that fits the page outline.
- Write heading text that makes sense on its own; it is the button's accessible name.
- Give every panel a unique `id` that matches its button's `aria-controls`.
- Without JavaScript, every section stays open and readable. Don't add `hidden` to panels in server-rendered markup.
- A disabled heading button uses the native `disabled` attribute. It is skipped in the tab order and can't be opened.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                        | Use                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `cods-accordion`             | Bordered accordion root (default); pair with `usa-accordion`.                     |
| `cods-accordion--borderless` | Transparent panels without borders.                                               |
| `cods-accordion--white`      | White headings with 1px borders, for non-white backgrounds.                       |
| `cods-accordion__heading`    | Heading element at the level your page needs; pair with `usa-accordion__heading`. |
| `cods-accordion__trigger`    | Native `type="button"` inside the heading; pair with `usa-accordion__button`.     |
| `cods-accordion__panel`      | Content controlled by the trigger; pair with `usa-accordion__content`.            |

| Attribute                      | Use                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `data-cods-accordion`          | Marks the root the controller initializes.                                                           |
| `data-cods-accordion-trigger`  | Marks each heading button. Also set `aria-controls` and `aria-expanded="true"`.                      |
| `data-cods-accordion-panel`    | Marks each panel.                                                                                    |
| `data-cods-accordion-expanded` | Optional initial state after enhancement (`"true"` or `"false"`); otherwise `aria-expanded` is used. |
| `data-cods-accordion-multiple` | On the root, allows more than one section to be open at once.                                        |

The controller adds `data-cods-accordion-enhanced` to an initialized root. Don't author or change it.

### Allowing multiple open sections

Without `data-cods-accordion-multiple`, opening a section closes its siblings. If more than one section is declared expanded, the last one wins. Any section can also be closed, so all sections may be closed at once.

```html
<div
  class="usa-accordion cods-accordion"
  data-cods-accordion
  data-cods-accordion-multiple
>
  …
</div>
```

### Initializing the controller

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The controller bundles the pinned USWDS accordion behavior, so don't load a separate USWDS script or auto-initializer on these roots.

```js
import {
  initAllAccordions,
  destroyAccordion,
  setAccordionExpanded,
} from '@coloradodigitalservice/colorado-design-system';

initAllAccordions(document);

const root = document.querySelector('[data-cods-accordion]');
setAccordionExpanded(root, 'your-panel-id', true);

// Before removing or replacing an accordion:
destroyAccordion(root);
```

| Function                                        | Behavior                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `initAccordion(root)`                           | Initializes one connected root. Repeated calls are safe. Invalid markup warns once and is left unchanged. |
| `initAllAccordions(container)`                  | Initializes every root in a container (default `document`), including the container itself.               |
| `setAccordionExpanded(root, panelId, expanded)` | Opens or closes a panel. Unknown, uninitialized, and disabled targets are ignored.                        |
| `destroyAccordion(root)`                        | Removes listeners and restores the authored markup. Safe to call repeatedly.                              |

Each changed panel dispatches a bubbling `cods-accordion:change` event from its root with `detail: { panelId, expanded }`. Events fire after every affected panel settles, so opening a section in single-open mode produces a closing event and an opening event. Initialization, redundant calls, and teardown don't dispatch events.

If a panel containing focus is closed by initialization or `setAccordionExpanded`, focus moves to that panel's heading button.

### Variable settings

Set these on a root to adjust the approved token-based colors:

| Custom property               | Default                                          |
| ----------------------------- | ------------------------------------------------ |
| `--cods-accordion-background` | Heading background, `color.bg-surface-secondary` |
| `--cods-accordion-text`       | Heading and panel text, `color.text-primary`     |
| `--cods-accordion-border`     | Panel border, `color.border-accordion-subtle`    |

Keep readable contrast between text and background. The border is decorative; the text, button state, and chevron convey the control.

### Limitations

- Configuration is read once. Destroy and reinitialize after changing configuration or adding or removing sections in an existing root.
- The controller doesn't watch the DOM. Call `initAllAccordions()` after inserting new markup.
- Nested accordions aren't supported. They stay readable but aren't enhanced.
- Sections open and close without animation.
