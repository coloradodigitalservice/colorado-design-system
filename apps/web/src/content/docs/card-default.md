---
title: Default Card
description: Group related content or link to a single destination with a default card.
navLabel: Default Card
order: 17
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1624-459
accessibilityStatus: The preview is checked with axe. Manual accessibility review is pending.
---

## Guidance

### When to use

Use a default card to group related content and help people navigate to a service. Keep titles concise and descriptions easy to scan. For a short navigation label with an icon, use an [Icon Card](../card-icon/) instead.

| Variant             | Use when                                                                                                | Don't use when                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Default             | A title and short description lead to a single destination.                                             | The content needs more than one link or action. Use links inside a card instead. |
| With media          | An image helps people recognize the destination.                                                        | The image is the only way the destination is described.                          |
| Flag                | Media should sit beside the content on wider screens. It stacks above the content in narrow containers. | The card is narrow everywhere it appears. Use With media instead.                |
| Media only          | An image alone identifies a single destination, and the link has an accessible name.                    | People need a visible title to understand where the link goes.                   |
| Links inside a card | A topic groups more than one destination, each with its own link.                                       | The whole card leads to one destination. Use a whole-card link instead.          |

Destination type is separate from the link pattern. A whole-card link or a link inside a card can go to an internal or external destination. Use the external indicator, shown in External destination, for destinations outside the site. It does not open a new tab.

Place cards in a card group. The group wraps cards into columns where space allows and stacks them in narrow containers. Avoid overcrowding a row; the design recommends three or four cards at most.

See the [Default Card design in Figma](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1624-459).

### Accessibility for default cards

- Cards use native links. Tab moves to each link, and Enter follows it. A whole-card link is one stop in the tab order; a card with links inside has one stop per link.
- Never put links, buttons, or other interactive controls inside a whole-card link. Nested interactive elements are not accessible.
- A whole-card link's accessible name is its content, so give it a meaningful title. A media-only card has no text, so give its link an `aria-label`. Each link inside a card must describe its own destination.
- Choose the heading level that fits the surrounding page outline. The examples use `h3`, but it is not required.
- Give an image alt text when it conveys information not already in the text. Use `alt=""` for a decorative image, including one that only repeats the linked title.
- The external indicator icon is hidden from assistive technology. Keep the visually hidden "(external site)" text so the link name announces it.
- Hover borders are decorative. The visible focus outline is separate and doesn't depend on the border.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                  | Use                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `cods-card-group`      | A `ul` that lays out cards in a responsive grid; pair with `usa-card-group`.                                                       |
| `cods-card`            | An `li` for each card; pair with `usa-card`.                                                                                       |
| `cods-card--flag`      | Flag layout with media beside the content in containers 25rem wide or wider; pair with `usa-card--flag`.                           |
| `cods-card__container` | The card surface; pair with `usa-card__container`. Use an `a` for a whole-card link, or a `div` when the card has links inside it. |
| `cods-card__link`      | Add to an `a` container for whole-card link hover and focus styles. Don't add it to a `div` container.                             |
| `cods-card__header`    | Wraps the heading; pair with `usa-card__header`.                                                                                   |
| `cods-card__heading`   | The heading element at the level your page needs; pair with `usa-card__heading`.                                                   |
| `cods-card__media`     | Wraps the image; pair with `usa-card__media`. Place it after the header; it displays above the heading.                            |
| `cods-card__image`     | Wraps the `img`; pair with `usa-card__img`.                                                                                        |
| `cods-card__body`      | The description; pair with `usa-card__body`.                                                                                       |
| `cods-card__footer`    | Optional footer, for example for a link inside a card; pair with `usa-card__footer`.                                               |

The external indicator uses the small icon (`cods-icon--small`) from the [CoDS icon sprite](../icon/). Deploy the sprite with your site and point the `use` element at its public URL.

### Setup and limitations

- Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Cards need no JavaScript.
- Choose a suitable image and replace the example image URL.
- Cards don't expose component-level custom properties. Colors, borders, and spacing come from the approved design tokens.
- The package publishes the default card fixtures in `fixtures/card-default.html`, the same file as `fixtures/card.html`.
