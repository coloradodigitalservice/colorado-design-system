---
title: Hero
description: Introduce a page with a prominent heading, optional image, and action.
navLabel: Hero
order: 21
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1964-5570
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.
---

## Guidance

### When to use

Use a Hero at the top of a page when the page needs more introduction than a title alone. Use a Hero sparingly: for a basic page, a clear page title may be enough to orient visitors and get them to the content. Prioritize useful information over decoration, and avoid a Hero that takes up the whole screen or delays a visitor's task.

| Variant | Use when                                                                                            | Don't use when                                                                        |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Image   | The page is a homepage, or an image helps orient visitors, set expectations, or establish the tone. | The page is a lower-level page and the image has no strong connection to its content. |
| Banner  | The page needs distinction or a longer introduction but does not need an image.                     | A clear page title alone is enough to orient visitors.                                |

Both treatments come with a light blue or dark blue surface. Choose the surface that fits the surrounding page; the dark surface is the default.

A Hero can include:

- **Breadcrumb (optional):** links to parent pages and identifies the current page. A breadcrumb is recommended on pages other than the homepage.
- **Eyebrow (optional):** a short category or context above the title.
- **Title (required):** names the page.
- **Introduction (optional):** briefly explains what people can find or do.
- **Call to action (optional):** at most one primary button that links to a clear next step.
- **Image (optional):** supports the page's purpose. A banner has no image.

Choose a relevant landscape image with a single focal point or full-width scenery. Avoid collages, text in images, and stock imagery that looks like advertising.

### Writing for Heroes

- Write a clear title of roughly 50 characters or fewer.
- When useful, add a one- or two-line introduction of roughly 175 characters or fewer.
- Include at most one call to action, and make its text describe a clear next step.

These are writing guidelines, not enforced limits. The Hero grows with longer content.

### Accessibility for Heroes

- Use the heading level that fits the page outline. For a page title, use an `h1`. The preview uses `h2` because it appears within this documentation page.
- Use `cods-hero__eyebrow` on a paragraph above the title, not an extra heading.
- Give an informative image meaningful alt text. Use `alt=""` for a decorative image.
- Use a link styled as a primary [Button](../button/) for the call to action, with link text that makes sense on its own. The Hero is static and adds no keyboard behavior; Tab moves to the breadcrumb links and the action in source order.
- Label the breadcrumb navigation landmark, use a list, and mark the current page with `aria-current="page"`. Below 768px, only the parent link is shown, and its "Previous level:" prefix appears and becomes part of its name.
- Text and actions sit on a solid, token-based surface, separate from the image. If you customize the surface or place text over imagery, use an opaque surface or a scrim and verify at least 4.5:1 contrast for normal text and 3:1 for large text across the entire area behind the text, at every crop and breakpoint. A scrim alone does not guarantee contrast. Check action and focus-indicator contrast as well.

## Specifications

### Variants and elements

Hero is CoDS-authored and has no USWDS equivalent. Its action uses the USWDS-based [Button](../button/) classes.

| Class                            | Use                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `cods-hero`                      | Hero container with a dark blue surface (default).                                         |
| `cods-hero--light`               | Light blue surface.                                                                        |
| `cods-hero--image`               | Image layout. Add it when the Hero contains `cods-hero__image`.                            |
| `cods-hero__image`               | The image. Place it before `cods-hero__content` in the markup.                             |
| `cods-hero__content`             | Content region aligned to the centered grid.                                               |
| `cods-hero__breadcrumbs`         | Optional `nav` for the breadcrumb.                                                         |
| `cods-hero__breadcrumb-list`     | The breadcrumb's `ol`.                                                                     |
| `cods-hero__breadcrumb-item`     | Each breadcrumb `li`. Add `aria-current="page"` to the current page's item.                |
| `cods-hero__breadcrumb-previous` | "Previous level:" prefix inside the parent link, shown only below 768px.                   |
| `cods-hero__eyebrow`             | Optional paragraph above the title.                                                        |
| `cods-hero__heading`             | Page title.                                                                                |
| `cods-hero__intro`               | Optional introduction.                                                                     |
| `cods-hero__actions`             | Optional action container.                                                                 |
| `cods-hero__action`              | The call to action; pair with `usa-button` and `cods-button`. The surface sets its colors. |

Load the package styles as described in [Getting started](../getting-started/). Hero is static and needs no JavaScript. It has no supported custom properties; the surface, text, and action colors come from approved tokens.

### Images

The image is cropped with `object-fit: cover`; check the focal point at every size. Prepare 16:9 WebP or JPEG variants near 375, 768, and 1280 pixels wide, use `srcset` and `sizes`, and aim for less than 150 KB per image (500 KB maximum). Replace the preview image with one appropriate to the page. The preview uses a cropped and resized [Downtown Denver photograph by Chachpond](https://commons.wikimedia.org/wiki/File:Downtown_denver.jpg), dedicated to the public domain under CC0.

### Responsive behavior

Breakpoints respond to the Hero's own width, not the viewport:

- Below 768px, the breadcrumb shows only the previous level and the title and introduction use mobile typography. A trail with only the current page remains visible.
- At 768px and above, the full breadcrumb trail and larger typography are shown.
- Below 1280px, the image stacks above the content.
- At 1280px and above, the image moves beside the content and the content follows the centered 1280px grid.

This page's content column is narrower than 1280px, so the preview shows image Heroes stacked. Use the [full-width Hero preview](../hero-preview/) to review the side-by-side layout.

### Limitations

- Background video, carousels, and image-cropping tools are not part of this component.
- Text is never placed over the image. Overlay treatments are not supported.
