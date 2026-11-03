---
title: Icon List
description: Unordered lists with decorative icons that reinforce each item.
navLabel: Icon List
order: 13
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4179-18151
---

## When to use

Use Icon List for related, unordered items when an icon helps people scan the content, such as a list of recommendations. Use a regular list when icons add no useful context. Use an ordered list when sequence matters.

Icon List is **experimental** in the `0.x` development series. The examples and copyable HTML come from the canonical package fixture. Design and accessibility acceptance remain open.

## Anatomy and markup

Load the token and component styles as described in [Getting started](../getting-started/). Use a `ul` with `usa-icon-list cods-icon-list`; give each `li` the `usa-icon-list__item cods-icon-list__item` classes. Place a decorative icon in `usa-icon-list__icon cods-icon-list__icon` and its text in `usa-icon-list__content cods-icon-list__content`. A short bold lead and supporting paragraph can appear together in the content area.

Choose icons from the [approved icon catalog](../icon/) and use them consistently. Each item must convey its meaning in text without relying on the icon, its shape, or color. Mark SVG icons `aria-hidden="true"` and `focusable="false"`.

## Sizes and layout

Icons are 16px on mobile and 24px on screens at least 768px wide. Spacing uses existing CoDS tokens. Long content wraps and the layout follows the page direction; set `lang` and `dir` for translated content. The examples show short and long text and a right-to-left list.

## Assets and progressive enhancement

Deploy the packaged SVG sprite and replace the example URL with its public path. For details, see [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path). The component requires no JavaScript. Without CSS, the content remains a native list; the appearance of decorative icons depends on the sprite being available.

Canonical assets are available as `@coloradodigitalservice/colorado-design-system/fixtures/icon-list.html`, `metadata/icon-list.json`, and `examples/icon-list.json`.

## Accessibility and review status

Authors are responsible for meaningful text, suitable icons, and the language and direction of translated content. Automated accessibility checks do not replace human review. Screen-reader announcements, actual 400% zoom, forced colors, translated content, and design and accessibility-owner review remain open in the [accessibility evidence](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/packages/colorado-design-system/src/components/icon-list/accessibility/icon-list.evidence.md). The component remains experimental.
