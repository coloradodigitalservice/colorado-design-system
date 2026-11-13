---
title: Logos
description: Colorado Design System logo asset, State branding rules, and accessible usage.
navLabel: Logos
order: 31
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1415-600
---

Logos are a separate foundation for State-owned brand marks and their usage.
They are not interchangeable with the [Icon](../icon/) foundation: icons
communicate interface actions or content, while State logos identify an
organization and are subject to State brand rules.

## Ownership and asset inventory

The Colorado C-tree mark and brand are owned and trademarked by the State. You cannot alter or edit the registered trademarked logo. For more, see https://dcs.colorado.gov/ids/state-branding.

The only logo supplied for this foundation is the full-color, horizontal
Colorado Design System lockup shown above. Its source is the project-supplied
SVG, preserved unchanged at `src/assets/logos/cods-logo.svg` in the
design-system package. No alternative sizes, department marks, reversed, or
monochrome variants have been supplied here. The project user confirmed
redistribution for the documentation site, package, and release archives on
November 13, 2026. This does not grant a general trademark license.

## Use the asset

Download the SVG and its trademark notice above, or import
`@coloradodigitalservice/colorado-design-system/logos/cods-logo.svg` with a
bundler that supports asset imports. For plain HTML, copy
`dist/logos/cods-logo.svg` from the package or release archive to your site's
public assets and use its deployed URL. Keep the adjacent
`dist/logos/NOTICE.md` when redistributing the asset. The example paths below
are placeholders for your own deployed location.

The SVG is fixed artwork, not an icon sprite or a design token. Its colors and
shape must not be changed with tokens, CSS filters, masks, or generated
variants. Scale it proportionally without cropping or stretching.

## State brand guidance

Follow the [State's branding guidance](https://dcs.colorado.gov/ids/state-branding)
and [logo specifications](https://dcs.colorado.gov/ids/state-branding-guidelines/the-elements)
for the current rules. In particular:

- Leave a clear zone at least as tall as the `COLORADO` logotype around the
  State logo; leave more space when possible.
- The State's 1/4-inch minimum C height is for high-resolution reproduction,
  **not** a web minimum. Use a larger, legible size on screen and verify the
  actual presentation. A web-specific minimum for this lockup has not been
  supplied.
- Do not place the primary logo on dark, low-contrast, or photographic
  backgrounds. The State specifies a color-reversed logo for those contexts;
  this package does not provide one. Obtain an appropriate approved asset
  rather than recoloring this one.
- Do not stretch, redraw, recolor, add a glow or drop shadow, change the
  relationship of its elements, or combine it into a new lockup.

## Accessible use

When the image is the only content of a link, its alternative text should
describe the destination:

```html
<a href="/">
  <img src="/assets/cods-logo.svg" alt="Colorado Design System home" />
</a>
```

When adjacent text already names the same destination, make the image
decorative with `alt=""` so the name is not repeated:

```html
<a href="/">
  <img src="/assets/cods-logo.svg" alt="" />
  Colorado Design System home
</a>
```

Use a background permitted by State guidance and check the actual logo and
surrounding content for legibility and contrast; logos themselves are exempt
from WCAG's minimum contrast requirements for text and non-text content.
In forced-colors mode an external SVG remains a fixed-color image, so do not
recolor it; check its legibility on the actual background and provide an
accessible link name or adjacent text. At 400% zoom, allow the image to shrink
proportionally within its container and check that both the logo and link
remain usable without horizontal page scrolling. Do not rely on an inaccessible
or unreadably small logo as the only way to identify a destination.
