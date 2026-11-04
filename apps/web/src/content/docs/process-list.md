---
title: Process List
description: Show the steps in a process in the order people should complete them.
navLabel: Process List
order: 14
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3914-9831
---

## When to use

Keep the process to nine steps or fewer; split a longer process into smaller parts. Use a Process List when people need to understand a sequence of steps, such as applying for a service. Use an ordinary unordered list when the order does not matter. Use an Accordion when people need to expand and collapse content.

Process List is **experimental** in the `0.x` development series. The examples and copyable markup come from the package fixture; design and accessibility acceptance remain open.

## Anatomy and markup

Use an ordered list (`ol`) with `usa-process-list cods-process-list` and `role="list"`. Add an `li` with `usa-process-list__item cods-process-list__item` for each step. Inside each item, place a decorative numbered icon followed by a `cods-process-list__content` element containing a heading and supporting content. Pick a heading level that fits the surrounding page. For an In-Page Alert within a step, place its heading one level below the step heading, as in the alert example.

Use the matching numbered icon for each step, in order. The examples cover two through six steps. Set `width="0"` and `height="0"` on each SVG so native numbers remain the only visible numbers without CSS; the component styles size the icons when enabled. Mark each icon `aria-hidden="true"` and `focusable="false"`; the ordered list supplies the sequence to assistive technology. The explicit list role preserves list semantics in Safari when list markers are hidden.

## Writing guidance

Keep lists simple and avoid deeply nested lists; consider a table when nesting makes them difficult to scan. Use sentence case. If any list item has two or more sentences, punctuate all items; otherwise leave sentence fragments or single-sentence items unpunctuated. Do not end items with commas or semicolons. Use short, action-oriented headings. Explain what the person needs to do and provide relevant links or requirements in the supporting text. Put steps in the order they should be completed. Use a short list within a step when it makes the details easier to scan. Do not use the connector or icon alone to communicate meaning.

The Accordion Step variant is restricted to specifically approved designs and has accessibility limitations. Contact the design team if you believe it is required; this component does not implement it.

## Responsive behavior

The list stays in a single column at narrow widths. Text wraps beside the markers, and the connector follows the reading direction. Set `lang` and `dir` when content is translated.

## Assets and progressive enhancement

Deploy the packaged icon sprite and replace `/icons/sprite.svg` with its public URL. See [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path). Process List requires no JavaScript. The underlying ordered list remains available when styles are unavailable.

The fixture, metadata, and examples are available from `@coloradodigitalservice/colorado-design-system` under `fixtures/process-list.html`, `metadata/process-list.json`, and `examples/process-list.json`.

## Accessibility and review status

Keep step headings in a logical hierarchy and ensure the order of the list matches the process. Screen-reader announcements, actual 400% zoom, forced colors, translated content, and design and accessibility-owner review remain open in the [accessibility evidence](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/packages/colorado-design-system/src/components/process-list/accessibility/process-list.evidence.md).

## Examples
