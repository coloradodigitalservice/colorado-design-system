---
title: Icon List
description: Unordered lists with decorative icons that reinforce each item.
navLabel: Icon List
order: 13
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4179-18151
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.
---

## Guidance

### When to use

- Use an icon list for related, unordered items when an icon helps people scan the content, such as a list of recommendations.
- Add a short bold lead and a supporting paragraph to an item when it needs more explanation.
- Don't use an icon list when icons add no useful context. Use a regular list instead.
- Don't use an icon list when order matters. Use an ordered list or a process list instead.
- Choose Regular-weight icons from [Phosphor Icons](https://phosphoricons.com/) and use them consistently within a list. See the [icon guidance](../icon/) for selection.

### Accessibility for icon lists

- Icon lists have no interactive controls. Links in item content keep their native keyboard behavior and focus styles.
- Write each item so its text conveys the full meaning. Don't rely on the icon, its shape, or its color.
- Icons are decorative. Mark each SVG `aria-hidden="true"` and `focusable="false"`, and don't give it a title or label.
- Keep `role="list"` on the `ul` so Safari and VoiceOver announce it as a list after the list markers are removed.
- Without CSS or the sprite, the content remains a readable native list.

## Specifications

### Elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                     | Use                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `cods-icon-list`          | The `ul` root with `role="list"`; pair with `usa-icon-list`.                                                     |
| `cods-icon-list__item`    | Each `li`; pair with `usa-icon-list__item`.                                                                      |
| `cods-icon-list__icon`    | A `span` holding one decorative `svg.cods-icon`; pair with `usa-icon-list__icon`.                                |
| `cods-icon-list__content` | The item text: direct text, a paragraph, or a `strong` lead and a paragraph; pair with `usa-icon-list__content`. |

### Sizes and spacing

Icons are 16px (`icon.size-small`) on narrow screens and 24px (`icon.size-medium`) on screens at least 768px wide. The gap between icon and text and the space between items use `space.sm` (12px). A supporting paragraph sits `space.xs` (8px) below the lead. Body text is 16px with a 24px line height, and the icon is centered on the first line of text. Long text wraps beside the icon.

Icon List has no component custom properties. Its sizes and spacing come from the design tokens.

### Adding icons

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The component needs no JavaScript.

Reference icons from the packaged SVG sprite by Phosphor name. Deploy the sprite and replace `/icons/sprite.svg` in the example with its public path; see [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path).

```html
<span class="usa-icon-list__icon cods-icon-list__icon"
  ><svg
    class="cods-icon"
    aria-hidden="true"
    focusable="false"
    width="24"
    height="24"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#check-circle"></use></svg
></span>
```

### Limitations

- Icons are decorative only. Icon List doesn't support meaningful or labeled icons.
