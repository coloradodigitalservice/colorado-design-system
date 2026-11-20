---
title: In-Page Navigation
description: Links that help people jump to sections on the current page.
navLabel: In-Page Navigation
order: 14
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1859-713
accessibilityStatus: Automated accessibility checks (axe) pass for the preview. Manual accessibility review, including screen-reader testing, is pending.
---

## Guidance

### When to use

- Place in-page navigation near the top of a long page with several clearly labeled sections.
- Link to the page’s H2 sections, in the same order they appear on the page.
- Don't use it for short pages, links to other pages, or lower-level subsections.

### Writing for in-page navigation

- Use clear, plain-language labels in sentence case, ideally one to three words.
- When a section heading is long or technical, a shorter, friendlier label can represent it while preserving its meaning. For example, use “Who can apply” for a heading such as “Who is eligible for the program?”
- Use sentence case rather than “WHO CAN APPLY,” and avoid vague labels such as “Click here.”

### Accessibility for in-page navigation

- The `<nav>` is a navigation landmark named by its `aria-label`, such as “On this page.” If a page has more than one navigation landmark, give each a distinct label.
- Tab and Shift+Tab move through the links in order. Enter follows a link to its section. The links are ordinary same-page links and work without JavaScript.
- After enhancement, the link for the section in view has `aria-current="location"`. The current link is also shown by a thicker border and a background, not by color alone.
- The controller never moves focus or scrolls the page. Scrolling only changes which link is marked current.
- Give every target section a visible heading, and label the section with it (`aria-labelledby`).
- If the page has a sticky header, make sure it doesn't cover a section's heading after a jump, for example with `scroll-margin-top` on the sections.
- The controller requests no animation. If your page sets `scroll-behavior: smooth`, turn it off under `prefers-reduced-motion: reduce`.

## Specifications

### Classes and attributes

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                              | Use                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `cods-in-page-navigation`          | The `<nav>` root; pair with `usa-in-page-nav`.                                 |
| `cods-in-page-navigation__heading` | Visible “On this page” label; pair with `usa-in-page-nav__heading`.            |
| `cods-in-page-navigation__list`    | The `<ul>` of section links; pair with `usa-in-page-nav__list`.                |
| `cods-in-page-navigation__item`    | Each `<li>`; pair with `usa-in-page-nav__item`.                                |
| `cods-in-page-navigation__link`    | Each same-page link (`href="#section-id"`); pair with `usa-in-page-nav__link`. |

| Attribute                      | Use                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `data-cods-in-page-navigation` | Marks the root the controller initializes.                                                    |
| `aria-label`                   | Names the navigation landmark. Required.                                                      |
| `aria-current="location"`      | Set by the controller on the current section's link. Authored values are restored on destroy. |

### Linking to sections

- Wrap each target in a `<section>` with a unique, stable `id`, and put its heading inside the section.
- Link to that `id` with `href="#id"`, and list the links in page order.
- Keep IDs stable once published. People bookmark and share links to sections.
- Each link must point to a different `<section>` in the same document. If any link is missing its target, targets something other than a `<section>`, or repeats another link's target, the controller warns in the console and leaves the whole navigation unenhanced. The links still work.

```html
<nav
  class="usa-in-page-nav cods-in-page-navigation"
  aria-label="On this page"
  data-cods-in-page-navigation
>
  …
  <a
    class="usa-in-page-nav__link cods-in-page-navigation__link"
    href="#who-can-apply"
  >
    Who can apply
  </a>
  …
</nav>
<section id="who-can-apply" aria-labelledby="who-can-apply-heading">
  <h2 id="who-can-apply-heading">Who can apply</h2>
  …
</section>
```

### Responsive placement

The navigation is a full-width block in the page flow. It doesn't stick to the screen as people scroll, at any width. Place it where your layout needs it, such as above the content or in a sidebar column.

Below 40rem, only the current link shows its left border. Hover styling applies only on devices that support hover at 40rem and wider.

### Initializing the controller

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Initialize the controller to highlight the current section as the page scrolls.

```js
import {
  initAllInPageNavigation,
  destroyInPageNavigation,
} from '@coloradodigitalservice/colorado-design-system';

initAllInPageNavigation(document);

// Before removing or replacing a navigation:
destroyInPageNavigation(navigation);
```

| Function                             | Behavior                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `initInPageNavigation(root)`         | Initializes one root. Repeated calls are safe. Invalid markup warns and is left unchanged.               |
| `initAllInPageNavigation(container)` | Initializes every root in a container (default `document`), including the container itself.              |
| `destroyInPageNavigation(root)`      | Removes the scroll and resize listeners and restores the authored `aria-current` values. Safe to repeat. |

The current section is the last visible section whose top has scrolled into the top quarter of the viewport, or the first section before any has. At the bottom of the page, the last section is current, so a short final section can still be reached.

When the current section changes during scrolling, the root dispatches a bubbling `cods-in-page-navigation:change` event with `detail: { id }`, the new section's `id`. Initialization and teardown don't dispatch events.

### Limitations

- It tracks scrolling of the page, not independently scrolling containers.
- The controller doesn't watch the DOM. After changing links or section IDs, call `destroyInPageNavigation` for that navigation and initialize it again.
- It doesn't intercept links, change focus, or request animated scrolling.
- It uses an explicit list of links and a CoDS scroll tracker in place of USWDS JavaScript, which would generate a second navigation. This approved Type C divergence is recorded in the [component contract](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/docs/governance/component-contract.md#46-approved-type-c-in-page-navigation). The approval doesn't replace the component's ongoing accessibility evidence requirements.
