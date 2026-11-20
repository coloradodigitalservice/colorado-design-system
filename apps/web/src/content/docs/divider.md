---
title: Divider
description: Horizontal separators for sections and related items.
navLabel: Divider
order: 17
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1527-636
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen readers, 400% zoom, and forced colors, is pending.
---

## Guidance

### When to use

Use a divider to separate content with a horizontal line. Choose the variant by what the line separates:

| Variant         | Use when                                                                                              | Don't use when                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Section divider | Content moves to a different topic or transitions to new content. The line spans the available width. | The content before and after the line is about the same topic.                |
| Item divider    | You are separating related items that remain connected, such as entries in a list. The line is inset. | You need to signal a new topic. Use a Section divider, or a heading, instead. |

Don't rely on a line alone to show structure. Use headings and semantic grouping for the page outline, and use a divider only to reinforce it.

### Accessibility for dividers

- A divider is not interactive. It has no keyboard behavior, takes no focus, and adds no tab stop. Don't add `tabindex` to it.
- Use a plain `<hr class="cods-divider">` when the line marks a meaningful thematic break between topics. Assistive technology exposes it as a separator.
- Add `aria-hidden="true"` when the line is purely visual, such as between related items, so assistive technology doesn't announce a separator. The Item divider preview uses this treatment.
- A divider has no text and needs no accessible name. Headings, not the line, should tell people where a new topic starts.
- The line is drawn with a CSS border, so forced-colors mode replaces its color with a system color instead of removing it. If you customize the color or width, check the result against the surrounding surface.

## Specifications

### Variants and elements

Divider is CoDS-authored, so there are no `usa-*` classes to pair with.

| Class                | Use                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------- |
| `cods-divider`       | On an `<hr>`. Draws a full-width horizontal line with no margin (Section divider).  |
| `cods-divider--item` | On a `<div>` wrapping the `<hr>`. Insets the line for related items (Item divider). |

The Item divider wrapper adds `--cods-space-md` (16px) of inline padding and `--cods-space-xs` (8px) above and below the line.

### Variable settings

Set these custom properties on the `hr.cods-divider` element itself; they are declared there, so setting them on a parent has no effect.

| Custom property        | Default                                  | Use                    |
| ---------------------- | ---------------------------------------- | ---------------------- |
| `--cods-divider-color` | `var(--cods-color-border-default)`       | Color of the line.     |
| `--cods-divider-width` | `var(--cods-border-divider-width)` (1px) | Thickness of the line. |

### Meaningful and decorative dividers

Both variants accept either treatment. Choose by meaning, not by variant:

```html
<!-- Meaningful thematic break: exposed as a separator -->
<hr class="cods-divider" />

<!-- Decorative line: hidden from assistive technology -->
<div class="cods-divider--item">
  <hr class="cods-divider" aria-hidden="true" />
</div>
```

No JavaScript is needed. Load the token and component styles as described in [Getting started](../getting-started/).

### Limitations

- Dividers are horizontal only. There is no vertical divider.
- There are no color or weight variants beyond the two variable settings above.
- Spacing around a Section divider comes from the surrounding content; the divider itself has no margin.
