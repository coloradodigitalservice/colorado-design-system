---
title: Breadcrumbs
description: An ordered trail of ancestor links and the current page.
navLabel: Breadcrumbs
order: 40
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2403-561
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen readers, 400% zoom, and forced colors, is in progress.
---

## Guidance

### When to use

Use breadcrumbs on pages within a hierarchy to help people reach ancestor pages.

- Place one trail before the main page heading.
- Build the trail from the site's hierarchy, not the visitor's browsing history.
- A single-level trail is supported, though a home page usually doesn't need breadcrumbs.

| Variant | Use when                                                                       |
| ------- | ------------------------------------------------------------------------------ |
| Default | The trail sits on a light background.                                          |
| Inverse | The trail sits on a dark navy surface, with white text, links, and separators. |

### Accessibility for breadcrumbs

- Wrap the trail in a `<nav>` with an accessible name such as `aria-label="Breadcrumbs"`, and translate that label. The preview uses a different label for each example so the page's landmarks stay distinct.
- Use an ordered list. Each ancestor is a link, in order from the top of the hierarchy.
- Mark the last item with `aria-current="page"` and leave it unlinked. The current page is not a tab stop.
- Tab and Shift+Tab move through the ancestor links in order, and Enter follows a link.
- Separators are decorative CSS and aren't announced by screen readers.
- On narrow screens only the immediate parent is shown, labeled "Previous level: _parent name_". Keep the parent name in the link so it stays part of the accessible name, and translate "Previous level".
- All links and the current page remain readable without CSS or JavaScript.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-breadcrumb*` classes are the upstream integration markup.

| Class                        | Use                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `cods-breadcrumbs`           | Named navigation root; pair with `usa-breadcrumb`.                                                      |
| `cods-breadcrumbs--inverse`  | White text, links, and separators on a navy surface.                                                    |
| `cods-breadcrumbs__list`     | Ordered, wrapping list; pair with `usa-breadcrumb__list`.                                               |
| `cods-breadcrumbs__item`     | Ancestor or current item; pair with `usa-breadcrumb__list-item`. Add `usa-current` to the current item. |
| `cods-breadcrumbs__link`     | Ancestor link; pair with `usa-breadcrumb__link`. Keep the text in a `<span>`.                           |
| `cods-breadcrumbs__previous` | Localized "Previous level: " label inside the immediate parent's link.                                  |
| `cods-breadcrumbs__ancestor` | The immediate parent's name; visually hidden on narrow screens.                                         |

The immediate parent's link contains both spans, as in the preview code:

```html
<a class="usa-breadcrumb__link cods-breadcrumbs__link" href="/services/"
  ><span class="cods-breadcrumbs__previous">Previous level: </span
  ><span class="cods-breadcrumbs__ancestor">Services</span></a
>
```

No JavaScript is needed. Load the token and component stylesheets as described in [Getting started](../getting-started/).

### Narrow screens and long trails

Below 40rem, the trail shows only a link to the immediate parent, with a back caret before it. A single-level trail keeps showing the current page. At wider widths the full trail is visible and long labels wrap. Don't use the USWDS truncation modifier.

### Variable settings

Set these on the root to adjust the approved token-based colors and spacing:

| Custom property                      | Default token                               |
| ------------------------------------ | ------------------------------------------- |
| `--cods-breadcrumbs-background`      | `transparent` (navy on the inverse variant) |
| `--cods-breadcrumbs-color`           | `--cods-color-text-secondary`               |
| `--cods-breadcrumbs-link-color`      | `--cods-color-text-action-link-standalone`  |
| `--cods-breadcrumbs-separator-color` | `--cods-color-icon-default`                 |
| `--cods-breadcrumbs-gap`             | `--cods-space-2xs`                          |

Check contrast, focus, wrapping, and link visibility for every interaction state after customizing.

### Limitations

- You supply the URLs and labels; the component doesn't generate routes.
- Disabled, loading, error, and empty states don't apply to this static navigation.
- Markup and custom properties may change before `1.0`.
