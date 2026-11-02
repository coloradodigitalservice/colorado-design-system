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

Load the token and component stylesheets as described in [Getting started](../getting-started/).
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

## Responsive behavior and separators

At widths below 40rem, show a link to the immediate parent using the localized
“Previous level” label. Include the parent name in the link's accessible name,
as shown in the fixture. Add the localized previous-level span to the immediate
parent link and keep its ancestor-name span. A single-level trail continues to
show the current page.
At wider widths, the full trail is visible and long labels can wrap. Do not use
USWDS's truncation modifier.

Separators are decorative CSS masks using the packaged Phosphor Regular
`caret-right` icon. The mobile back caret points left in left-to-right text and
mirrors in right-to-left text. No external icon service is required.

## Public styling

| Class                        | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `cods-breadcrumbs`           | Named navigation root                  |
| `cods-breadcrumbs__list`     | Ordered wrapping list                  |
| `cods-breadcrumbs__item`     | Ancestor or non-linked current item    |
| `cods-breadcrumbs__link`     | Native ancestor link                   |
| `cods-breadcrumbs__previous` | Localized mobile link label            |
| `cods-breadcrumbs__ancestor` | Parent name, visually hidden on mobile |

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
not a tab stop. Links have underlines and token-based focus rings. Hover removes the underline; on light surfaces it also changes the link color. No focus moves
automatically and no animation is used. All text and links remain available with
CSS and JavaScript disabled. Localized labels, long strings, and Arabic/right-to-left
content are included for review.

## Known limitations and implementation status

Typography and spacing use regular Open Sans, 16px text, 4px item gaps and
12px vertical padding. Line height inherits from surrounding content so wrapped
labels have room to breathe. The inverse variant provides the dark treatment.
Design review must confirm the separator and focus treatment.

Human screen-reader verification (current-page announcement, reading order and
separator exclusion), real browser 400% zoom, Windows high-contrast review, and
translated-content review remain open. Accessibility-owner approval is required
before stable maturity. Record results in the component's accessibility evidence.

### Figma follow-up

Use `cods-breadcrumbs--inverse` for a navy background and white text and
separators. The background is customizable with `--cods-breadcrumbs-background`;
verify contrast for every interaction state. The mobile previous-level and hover
behaviors follow the requested review changes. Design and accessibility review
remain open.
