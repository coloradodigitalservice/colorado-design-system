---
title: Footer
description: Colorado-themed full and compact site footers.
navLabel: Footer
order: 50
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1100-9283
accessibilityStatus: Automated accessibility checks (axe) pass for both preview variants. Manual screen-reader, zoom, and forced-colors review is pending.
---

## Guidance

### When to use

Use a footer at the end of every page to give people consistent ways to reach key services, contact information, and required State policies. Replace every example label and destination with links that are relevant to your agency.

Choose the density that fits the site:

| Variant | Use when                                                                                                                           | Don't use when                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Full    | Visitors benefit from categorized navigation across a complex site, plus a Contact Us group with social links.                     | The site has only a few essential links; the groups would be thin or repetitive. |
| Compact | A smaller site, landing page, or task-focused experience needs a short, ungrouped list of essential links. It has no social links. | People need categorized navigation or contact and social links in the footer.    |

Both variants include a Return to top link, a copyright statement, and a legal navigation with accessibility, financial transparency, data terms, and privacy destinations.

### Accessibility for footers

- Place the footer as a direct part of the page, outside `<main>`, `<article>`, and `<section>`, so it is exposed as the contentinfo landmark. Give it a concise `aria-label` when the page has more than one footer landmark, and give every footer a distinct name.
- Give each `<nav>` (primary, social in Full, and legal) its own distinct `aria-label`.
- Link text describes each destination. Social links are named with `aria-label`, such as "Facebook"; the icon is decorative and hidden from assistive technology.
- Tab and Shift+Tab move through the links in document order. Every link keeps a visible focus indicator and a minimum 48px target height.
- Below 480px, Full group headings become buttons. Enter or Space opens or closes a group, focus stays on the button, and each button exposes `aria-expanded` and `aria-controls`. Opening one group closes the others.
- Without JavaScript, every Full link stays visible under its static heading. Compact is static and has no JavaScript behavior.
- Choose the heading level for group headings that fits the page outline. The example uses `<h2>`.
- The Return to top link targets an `id` your page provides near the top of its content. The example uses `#top`.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                            | Use                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `cods-footer`                    | Footer root on a `<footer>` element; pair with `usa-footer`.                                                 |
| `cods-footer--full`              | Full variant with grouped navigation and contact links; pair with `usa-footer--big`.                         |
| `cods-footer--compact`           | Compact variant with one ungrouped list; pair with `usa-footer--slim`.                                       |
| `cods-footer__return-to-top`     | Return to top container; pair with `usa-footer__return-to-top`.                                              |
| `cods-footer__primary-section`   | Primary navigation surface; pair with `usa-footer__primary-section`.                                         |
| `cods-footer__nav`               | Primary `<nav>`; pair with `usa-footer__nav`.                                                                |
| `cods-footer__groups`            | List of navigation groups.                                                                                   |
| `cods-footer__group`             | One group; pair with `usa-footer__primary-content` (and `usa-footer__primary-content--collapsible` in Full). |
| `cods-footer__heading`           | Full group heading; pair with `usa-footer__primary-link`.                                                    |
| `cods-footer__links`             | List of group links; pair with `usa-list usa-list--unstyled`.                                                |
| `cods-footer__contact`           | Full Contact Us group, on the same element as `cods-footer__group`.                                          |
| `cods-footer__panel`             | Contact Us panel that holds the contact links and social navigation; pair with `usa-list--unstyled`.         |
| `cods-footer__social`            | Social `<nav>` inside Contact Us (Full only); pair with `usa-social-nav`.                                    |
| `cods-footer__social-list`       | Social link list; pair with `usa-social-nav__list`.                                                          |
| `cods-footer__social-link`       | Social link with a medium CoDS icon; pair with `usa-social-link`.                                            |
| `cods-footer__secondary-section` | Copyright and legal surface; pair with `usa-footer__secondary-section`.                                      |
| `cods-footer__legal`             | Copyright and legal navigation wrapper.                                                                      |
| `cods-footer__copyright`         | Copyright statement.                                                                                         |
| `cods-footer__legal-nav`         | Legal `<nav>`.                                                                                               |
| `cods-footer__legal-list`        | Legal link list. Links stack vertically below 640px.                                                         |

| Attribute                | Use                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `data-cods-footer`       | Marks a Full footer root for the controller. Compact doesn't need it.                      |
| `data-cods-footer-group` | A unique, nonempty key on each Full group heading. It is reported in `cods-footer:change`. |

### Full footer groups

Full uses the pinned USWDS footer behavior to turn its groups into disclosures below 480px. Include one or more groups inside the primary `<nav>`. Give each heading a unique `data-cods-footer-group`, and immediately follow it with its panel, which carries the `usa-list--unstyled` class. Adjust the USWDS grid classes to fit the number of columns; the example uses four on desktop and wraps additional groups to the next row.

The Contact Us group holds contact links and the social navigation. Replace the example social profiles with the agency's actual profiles, and name each link with `aria-label`.

### Initializing the controller

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The controller bundles the pinned USWDS footer behavior, so don't load a separate USWDS script on these footers. Use the package's icon sprite for the Return to top and social icons.

```js
import {
  initAllFooters,
  destroyFooter,
} from '@coloradodigitalservice/colorado-design-system';

initAllFooters(document);

// Before removing or replacing the footer:
const footer = document.querySelector('[data-cods-footer]');
destroyFooter(footer);
```

| Function                    | Behavior                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `initFooter(root)`          | Initializes one connected Full footer. Repeated calls are safe. Invalid markup warns once and is left unchanged. |
| `initAllFooters(container)` | Initializes every `[data-cods-footer]` root in a container (default `document`), including the container itself. |
| `destroyFooter(root)`       | Removes listeners and restores the authored headings and panel IDs. Safe to call repeatedly.                     |

Each changed group dispatches a bubbling, non-composed `cods-footer:change` event from the root with `detail: { group, expanded }`. Opening a group while another is open produces a closing event and an opening event. Initialization, resizing, and teardown don't dispatch events.

### Variable settings

Set these on a footer root to adjust its surfaces:

| Custom property                      | Default                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| `--cods-footer-primary-background`   | Primary navigation surface, `color.surface-nav-secondary` |
| `--cods-footer-secondary-background` | Copyright and legal surface, `color.surface-nav-heel`     |

Check text and focus contrast when changing either surface. Forced-colors mode uses system colors regardless of these overrides.

### Limitations

- USWDS's footer behavior supports one Full footer per document. `initFooter` warns and leaves markup unchanged when more than one Full footer is present.
- The controller doesn't watch the DOM. Destroy and reinitialize after adding or removing groups.
- The fixture's destinations and social profile URLs are illustrative; verify and replace them for your agency.
- Groups open and close without animation.
