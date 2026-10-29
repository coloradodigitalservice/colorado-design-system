---
title: Divider
description: Horizontal separators for sections and related items.
navLabel: Divider
order: 17
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1527-636
---

## When to use

Use a section divider between different topics or a transition to new content. It spans the available width. Use an item divider between related items that remain connected; it has an inset and space above and below the line. Do not use an item divider to signal a new topic.

Divider is **experimental** in the `0.x` development series. Design and human accessibility review are pending.

## Markup and accessibility

Load the token and component styles as described in [Getting started](../getting-started/). No JavaScript is needed. Use the semantic `<hr class="cods-divider">` when the break in content is meaningful. For a purely visual line, add `aria-hidden="true"` so assistive technology does not announce a separator. For the inset style, wrap either treatment in a `div` with the `cods-divider--item` class. Do not rely on a line alone to convey essential structure; use headings and semantic grouping as appropriate.

The line uses `--cods-divider-color` and `--cods-divider-width`, which default to the design tokens. Check the result against its surrounding surface if customizing it. The fixture, metadata, and copyable examples are available in the package under `fixtures/divider.html`, `metadata/divider.json`, and `examples/divider.json`.
