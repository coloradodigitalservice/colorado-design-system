---
title: Radius
description: Corner-radius tokens for Colorado digital services.
navLabel: Radius
section: foundation
order: 32
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1700-11746
---

Radius controls how rounded an element's corners appear. The Colorado Design System provides five radius tokens, from square corners to a fully rounded shape.

## Guidelines

Use square or low-radius corners for structural elements where a more formal appearance is appropriate. Subtle rounding can make interactive elements feel approachable. Choose a radius that suits the component and use its existing styles where available; a token does not change a component's supported variants.

The [Radius design reference](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1700-11746) describes suggested uses for each size. For built-in components, use their existing styles rather than applying a token separately.

- **None (0px):** square corners, such as the site header.
- **Small (2px):** subtle rounding, as used by Tags.
- **Medium (4px):** buttons, text inputs, accordions, and cards.
- **Large (8px):** larger rounding, as used by Modal.
- **Full (9999px):** fully rounded shapes such as pills and circles.

## Use the tokens

Use the generated CSS custom properties when styling a custom element. For example:

```css
.example {
  border-radius: var(--cods-radius-md);
}
```

The values below come from the design system's generated token output. `radius-full` uses a large value to create a pill or circle; its visible shape also depends on the element's dimensions.

## Radius examples

Each example is labeled with its token name and value so the options remain identifiable without relying only on shape.
