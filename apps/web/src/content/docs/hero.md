---
title: Hero
description: Introduce a page with a prominent heading, optional image, and actions.
navLabel: Hero
order: 21
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1964-5570
---

## When to use

Use a Hero at the top of a page to introduce its purpose. Keep the heading and supporting copy concise. Use one or two actions when they help people take a clear next step. A Hero can use a dark blue or light blue surface, with or without an image.

## Markup and placement

Load the package styles as described in [Getting started](../getting-started/). Use the heading level that fits the page; for a page title, use an `h1`. The examples use `h2` because they appear within this documentation page. Use the existing [Button](../button/) classes for actions and descriptive link text. The component is static and needs no JavaScript.

Use `cods-hero--light` for the light surface and `cods-hero--image` when an image is present. Place the image before the content in the markup. On smaller screens it appears above the content; at 1280px and wider it appears beside it. Images use `object-fit: cover` and are cropped to fit. Supply a pre-cropped image suitable for both layouts, and check its focal point at each size. Use meaningful alt text for an informative image, or `alt=""` for a decorative image. The example image is for illustration; replace its URL with your own image.

## Contrast and accessibility

Text and actions sit on a solid token-based surface, separate from the image. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text. If you customize the surface or place text over imagery, use an opaque surface or a scrim and verify contrast across the entire area behind the text, at every crop and breakpoint. A scrim alone does not guarantee contrast. Check action and focus-indicator contrast as well.

**Experimental, `0.x`.** Human design, screen-reader, actual zoom, forced-colors, and accessibility review remain open. Verify translated and right-to-left content in the consuming application.

## Examples

These examples show a light surface, an image, two actions, and longer right-to-left content. The markup can be copied below each example.
