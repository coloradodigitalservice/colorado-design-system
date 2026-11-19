---
title: Icon Card
description: Link to a single destination with a short label and a supporting icon.
navLabel: Icon Card
order: 18
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2246-770
accessibilityStatus: The preview is checked with axe. Manual accessibility review is pending.
---

## Guidance

### When to use

Use an icon card when a short, clear label leads to a single navigation destination and an icon supports the label. To group content with a description or image, use a [Default Card](../card-default/) instead.

Don't use an icon card when there is no destination to navigate to, or as a topic heading or banner. Don't rely on the icon to explain the destination; the label must make sense on its own.

Use the external indicator, shown in External destination, for destinations outside the site. It does not open a new tab. Place icon cards in a card group, which wraps them into columns where space allows.

See the [Icon Card design in Figma](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2246-770).

### Accessibility for icon cards

- The whole card is one native link and one stop in the tab order. Enter follows it.
- The link's accessible name is its label, so make the label describe the destination.
- Icons are decorative. Mark them `aria-hidden="true"` and `focusable="false"`, and convey any essential meaning in the label.
- The external indicator icon is hidden from assistive technology. Keep the visually hidden "(external site)" text so the link name announces it.
- Never put other links or controls inside the card.
- Hover borders and the icon background change are decorative. The visible focus outline is separate and doesn't depend on them.

## Specifications

### Variants and elements

| Class                   | Use                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `cods-card-group`       | A `ul` that lays out cards in a responsive grid; pair with `usa-card-group`.          |
| `cods-card--icon`       | Add to the `cods-card` `li` (paired with `usa-card`) for the icon card layout.        |
| `cods-card__container`  | The card's `a`; pair with `usa-card__container`.                                      |
| `cods-card__link`       | Add to the `a` container for hover and focus styles.                                  |
| `cods-card__icon`       | Wraps the icon.                                                                       |
| `cods-card__icon-title` | The label, including the external indicator and its hidden text when the link leaves. |

### Adding icons

Icon cards use the [CoDS icon sprite](../icon/). Use the medium size (`cods-icon--medium`) for the card's icon and the small size (`cods-icon--small`) for the external indicator. Deploy the sprite with your site and point each `use` element at its public URL.

```html
<span class="cods-card__icon"
  ><svg
    class="cods-icon cods-icon--medium"
    aria-hidden="true"
    focusable="false"
  >
    <use href="/path/to/sprite.svg#arrows-clockwise"></use></svg
></span>
```

### Setup and limitations

- Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Cards need no JavaScript.
- Cards don't expose component-level custom properties. Colors, borders, and spacing come from the approved design tokens.
- The package publishes the icon card fixtures in `fixtures/card-icon.html`.
