---
title: Hero
description: Introduce a page with a prominent heading, optional image, and action.
navLabel: Hero
order: 21
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1964-5570
---

## When to use

Use a Hero at the top of a page when the page needs more introduction than a title alone. Choose an image Hero for a homepage or when an image helps orient visitors, set expectations, or establish the tone. Use a banner when a page needs distinction or a longer introduction but does not need an image. Avoid an image on a lower-level page when it has no strong connection to the content.

Write a clear title of roughly 50 characters or fewer and, when useful, a one- or two-line introduction of roughly 175 characters or fewer. These are writing guidelines, not enforced limits. Include at most one call to action, and make it a clear next step. A breadcrumb is recommended on pages other than the homepage. An optional eyebrow can introduce the title.

## Anatomy

A Hero introduces a page with these parts:

1. **Breadcrumb (optional):** links to parent pages and identifies the current page.
2. **Eyebrow (optional):** provides a short category or context above the title.
3. **Title (required):** names the page using the appropriate heading level.
4. **Introduction (optional):** briefly explains what people can find or do.
5. **Call to action (optional):** one primary button or link to a clear next step.
6. **Image (optional):** supports the page’s purpose; a banner has no image.

The surface can be light blue or dark blue for both image Heroes and banners. The examples below show all four combinations, plus examples without an action and with long right-to-left text.

## Choosing a Hero

Use a Hero sparingly. For a basic page, a clear page title may be enough to orient visitors and get them to the content. Keep the introduction short and avoid a Hero that takes up the whole screen or delays a visitor’s task. Prioritize useful information over decoration, and choose images that help people understand the page.

## Markup and placement

Load the package styles as described in [Getting started](../getting-started/). Use the heading level that fits the page; for a page title, use an `h1`. The examples use `h2` because they appear within this documentation page. Use a primary [Button](../button/) for the optional action and descriptive link text. The component is static and needs no JavaScript.

The breadcrumb example uses a labeled navigation landmark, a list, and `aria-current="page"` for the current page. In a Hero narrower than 768px it presents a previous-level link; at 768px and above it shows the full trail. Use `cods-hero__eyebrow` on a paragraph above the title, not an extra heading.

Use `cods-hero--light` for the light surface and `cods-hero--image` when an image is present. Place the image before the content in the markup. It appears above the content when the Hero is narrower than 1280px and beside it when there is more room. The image is cropped with `object-fit: cover`; check the focal point at every size. Use meaningful alt text for an informative image, or `alt=""` for a decorative image.

Choose a relevant landscape image with a single focal point or full-width scenery. Avoid collages, text in images, and stock imagery that looks like advertising. Prepare 16:9 WebP or JPEG variants near 375, 768, and 1280 pixels wide, use `srcset` and `sizes`, and aim for less than 150 KB per image (500 KB maximum). Replace the example image with one appropriate to the page. The example is a cropped and resized [Downtown Denver photograph by Chachpond](https://commons.wikimedia.org/wiki/File:Downtown_denver.jpg), dedicated to the public domain under CC0.

## Responsive behavior

When the Hero is narrower than 768px, the breadcrumb shows the previous level and the title and introduction use mobile typography. At 768px and above, the full breadcrumb and larger typography are shown. A trail with only the current page remains visible. The image stacks above the content when the Hero itself is narrower than 1280px; when the Hero has at least 1280px of available width, the image moves to the side and the content follows the centered 1280px grid. The Hero grows with longer or translated content.

## Public styling

| Class                                        | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `cods-hero`                                  | Hero container with a dark blue surface by default |
| `cods-hero--light`                           | Light blue surface                                 |
| `cods-hero--image`                           | Image layout                                       |
| `cods-hero__image`                           | Responsive image                                   |
| `cods-hero__content`                         | Centered content region                            |
| `cods-hero__breadcrumbs`                     | Optional breadcrumb navigation                     |
| `cods-hero__eyebrow`                         | Optional text above the title                      |
| `cods-hero__heading`                         | Page title                                         |
| `cods-hero__intro`                           | Optional introduction                              |
| `cods-hero__actions` and `cods-hero__action` | Optional action container and primary Button       |

For breadcrumb list and link classes, use the copyable dark banner example. The `data-cods-fixture-state` attributes identify documentation examples and are not required for a consumer Hero.

## Contrast and accessibility

Text and actions sit on a solid token-based surface, separate from the image. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text. If you customize the surface or place text over imagery, use an opaque surface or a scrim and verify contrast across the entire area behind the text, at every crop and breakpoint. A scrim alone does not guarantee contrast. Check action and focus-indicator contrast as well.

**Experimental, `0.x`.** Human design, screen-reader, actual zoom, forced-colors, and accessibility review remain open. Verify translated and right-to-left content in the consuming application.

## Known limitations and implementation status

Hero is experimental. The documentation column displays image Heroes in their stacked layout; use the [full-width Hero preview](../hero-preview/) to review the desktop side-by-side layout. Automated checks do not replace human design, keyboard, screen-reader, zoom, forced-colors, and accessibility review. Background video, carousels, and image-cropping tools are not part of this component.

## Examples

The examples use the same fixtures as Storybook and the package. Copyable markup follows the examples; replace the sample content, links, and image with your own.
