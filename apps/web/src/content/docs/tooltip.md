---
title: Tooltip
description: Supplemental text displayed when a person hovers over or focuses an element.
navLabel: Tooltip
order: 26
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2812-8030
---

## When to use

Use a tooltip to provide a short, helpful explanation of a control when the interface is already understandable without it. For example, it can explain what happens when someone saves a form.

Prefer visible content when there is space for it. Keep information needed to complete a task visible on the page: tooltips can be missed, and the native fallback is not consistently available on all devices. Use visible help text for instructions, requirements, errors, and longer explanations. Do not use a tooltip as the only label for a button or link.

Use tooltips consistently. If one control in a group has a tooltip, people will look for them on similar controls, so give comparable controls the same treatment or none.

### Writing tooltip text

- Aim for no more than four lines, or roughly 125 characters. This is a recommendation, not a limit the component enforces; if the message needs more, it probably belongs on the page.
- Keep the message brief and use plain language.
- Add useful context rather than repeating the trigger's label.
- Keep links, buttons, and other interactive content outside the tooltip.
- Test the message in context and provide translations alongside the rest of the interface.

## Anatomy, positions, and treatments

A tooltip has a focusable trigger, such as a button or link, and a short text description with an arrow that points at the trigger. Hover over or focus each example above to see it. Expand an example's **View HTML** disclosure to copy its markup.

Set `data-position` to `top`, `bottom`, `left`, or `right`. Top is the default when the attribute is omitted. These are preferred positions: when the preferred side has no room, the tooltip tries the opposite side and then the remaining sides. If it shifts along the trigger to stay on screen, the arrow keeps pointing at the trigger. The tooltip never covers its trigger: when no side has room, such as at high zoom in a short window, it opens below the trigger, wraps to the viewport width, and the page can be scrolled to read the rest. An open tooltip follows its trigger as the page or a container scrolls. Check that tooltips do not cover important content in your layout.

The default treatment is a dark surface with white text and a soft elevation shadow. Add `cods-tooltip--light` to the root for the light treatment shown in Figma: a white surface, primary text, a subtle border, and the same shadow. Both treatments meet text contrast requirements on their own surface. Choose the treatment that gives the tooltip at least 3:1 contrast against the surrounding background. Use the light treatment on dark surfaces and the default treatment on light surfaces.

## Use the package

Follow [Getting started](../getting-started/) to load the package styles. Copy an example and keep the `cods-tooltip` classes and the `data-cods-tooltip` and `data-cods-tooltip-trigger` attributes. Set the trigger's `title` to the supplemental text, and give the trigger its own meaningful visible or accessible name. Tooltip text describes the trigger; it does not replace its name. The `usa-button` class in the examples only styles the example button.

Initialize after adding the markup to the document:

```js
import {
  initAllTooltip,
  destroyTooltip,
} from '@coloradodigitalservice/colorado-design-system';

initAllTooltip();

// Before removing an enhanced tooltip root:
const root = document.querySelector('[data-cods-tooltip]');
if (root) destroyTooltip(root);
```

Use `initTooltip(root)` for one root, or `initAllTooltip(container)` for matching roots inside a container. The controller adds the tooltip inside the root, next to the trigger, and connects it with `aria-describedby`, preserving any existing description references. The trigger is not moved, so it keeps focus if it is focused when you initialize or destroy the tooltip. The controller emits bubbling `cods-tooltip:open` and `cods-tooltip:close` events; each event's `detail.trigger` is the trigger element.

Tooltip replaces the USWDS tooltip script. Do not add the `usa-tooltip` class or run the USWDS tooltip initializer on the same trigger.

## Keyboard and pointer behavior

The tooltip opens when the pointer enters the trigger or the trigger receives keyboard focus. It remains open while the pointer is over the trigger or tooltip, or while the trigger has focus, and closes when the pointer and focus both leave. Press Escape to dismiss it without moving focus. Any fresh interaction reopens it: moving the pointer onto the trigger or focusing the trigger again, even if the other one is still active.

## Accessibility and localization

The tooltip is supplemental text, not a control. Do not place interactive elements inside it or rely on it to explain an unlabeled icon. The trigger must be keyboard reachable and have its own accessible name. Translate both the trigger label and tooltip text, and check long translations and right-to-left content in the page layout.

The enhanced tooltip requires JavaScript in the browser. Without it, the authored `title` remains available as a native browser fallback, but native tooltips are not consistently available to keyboard and touch users. Keep essential content visible regardless of JavaScript. In forced-colors mode the tooltip uses a system-color border and hides the arrow.

## Known limitations and implementation status

Tooltip is **experimental** and a **Type C (CoDS divergent)** component. It keeps the USWDS authoring model (`title` text and `data-position`) but uses a CoDS controller and styles in place of the USWDS tooltip. The CoDS version keeps focus on the trigger, works inside scaled containers, avoids covering the trigger, follows scrolling, keeps the arrow on the trigger, reopens consistently after Escape, and adds the light treatment and CoDS elevation. This direction was approved in design-system review; State design and accessibility review of the result remains open.

The tooltip is positioned inside its root, so an ancestor with `overflow: hidden` can clip it. Human review, including screen-reader announcements, 400% zoom, forced colors, reduced motion, and localization, remains open. Test the component in your service and review the linked accessibility evidence before relying on it.
