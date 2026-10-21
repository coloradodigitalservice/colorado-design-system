---
title: Breadcrumbs
description: An ordered trail of ancestor links and the current page.
navLabel: Breadcrumbs
order: 40
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2403-561
---

## When to use

Use breadcrumbs on pages within a hierarchy to help people reach ancestor pages.
Place one trail before the main page heading. Use the site's hierarchy, not the
visitor's browsing history. Consumers supply URLs and labels; this component does
not generate routes. A single-level trail is supported, though a home page usually
does not need breadcrumbs.

The examples above use the same canonical fixture as Storybook and the package.
Replace the demonstration links with your service's ancestor URLs. Each example
has its own navigation label so the documentation's repeated landmarks are distinct;
a production trail can use `aria-label="Breadcrumbs"` (translate that label).

## Use the package

Load the token and component stylesheets as described in [Getting started](/getting-started/).
No JavaScript is needed. Retain both the `usa-breadcrumb*` structural classes and
`cods-breadcrumbs*` classes shown in the copyable markup above.

Use a named `<nav>` containing an `<ol>`. Each ancestor is a linked `<li>`;
the final `<li class="usa-breadcrumb__list-item cods-breadcrumbs__item usa-current">`
uses `aria-current="page"` and contains plain text in a `<span>`, with no link.
Keep the text span inside each ancestor link for USWDS compatibility.

Package exports:

- `@coloradodigitalservice/colorado-design-system/fixtures/breadcrumbs.html`
- `@coloradodigitalservice/colorado-design-system/metadata/breadcrumbs.json`
- `@coloradodigitalservice/colorado-design-system/examples/breadcrumbs.json`

## Anatomy

The root navigation names the trail; the ordered list holds ancestor links and
the current item. CSS adds a decorative separator after every ancestor.

## Wrapping and separators

Trails wrap between items; exceptionally long labels can also wrap within an item.
Every ancestor link and the current page stay visible at narrow widths. Do not add
USWDS's truncation modifier: clipped links would defeat this component's wrapping
contract. There is no overflow menu or scripted collapsing behavior.

Separators are empty CSS pseudo-elements using the packaged USWDS `navigate_next`
icon. They add no text to the accessibility tree and disappear with CSS disabled.
No external icon service or Figma asset URL is required. Right-to-left trails
follow DOM order and mirror the directional separator.

## Public styling

| Class                    | Purpose                             |
| ------------------------ | ----------------------------------- |
| `cods-breadcrumbs`       | Named navigation root               |
| `cods-breadcrumbs__list` | Ordered wrapping list               |
| `cods-breadcrumbs__item` | Ancestor or non-linked current item |
| `cods-breadcrumbs__link` | Native ancestor link                |

| Custom property                      | Default token                              |
| ------------------------------------ | ------------------------------------------ |
| `--cods-breadcrumbs-color`           | `--cods-color-text-secondary`              |
| `--cods-breadcrumbs-link-color`      | `--cods-color-text-action-link-standalone` |
| `--cods-breadcrumbs-separator-color` | `--cods-color-icon-default`                |
| `--cods-breadcrumbs-gap`             | `--cods-space-2xs`                         |

Set these on the root or override the public classes in consumer CSS. Check
contrast, focus, wrapping, and link visibility after customization. The fixture
review labels (`data-cods-fixture-state`) are not a behavior API. Disabled,
loading, error, and empty states do not apply to this static navigation pattern.

## Accessibility

Breadcrumbs is **experimental** in the `0.x` development series. Tab and Shift+Tab
move through ancestor links in order; Enter follows a link. The current page is
not a tab stop. Links have underlines and token-based focus rings. No focus moves
automatically and no animation is used. All text and links remain available with
CSS and JavaScript disabled. Localized labels, long strings, and Arabic/right-to-left
content are included for review.

## Known limitations and implementation status

Typography and spacing use the recorded Figma measurements from the base token
catalog: regular Open Sans, 16px UI text/line height, 4px item gaps and 12px vertical
padding. This implementation uses the shared Phosphor Regular `caret-right` asset and wraps all levels;
the Figma mobile parent-only and dark variants are not claimed as implemented.
Design review must confirm that treatment, the separator shape and the approved
focus treatment. The committed October 8 measurement evidence is the design reference.

Human screen-reader verification (current-page announcement, reading order and
separator exclusion), real browser 400% zoom, Windows high-contrast review, and
translated-content review remain open. Accessibility-owner approval is required
before stable maturity. Record results in the component's accessibility evidence.
