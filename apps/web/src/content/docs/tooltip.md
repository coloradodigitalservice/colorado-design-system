---
title: Tooltip
description: Supplemental text displayed when a person hovers over or focuses an element.
navLabel: Tooltip
order: 26
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2812-8030
---

## When to use

Use a tooltip to provide a short, helpful explanation of a control when the interface is already understandable without it. For example, it can explain what happens when someone saves a form.

Keep information needed to complete a task visible on the page. Tooltips can be missed, and the native fallback is not consistently available on all devices. Use visible help text for instructions, requirements, errors, and longer explanations. Do not use a tooltip as the only label for a button or link.

### Writing tooltip text

- Keep the message brief and use plain language.
- Add useful context rather than repeating the trigger's label.
- Keep links, buttons, and other interactive content outside the tooltip.
- Test the message in context and provide translations alongside the rest of the interface.

## Anatomy and positions

A tooltip has a focusable trigger, such as a button or link, and a short text description. Hover over or focus each example above to see it. Expand **View top HTML**, **View bottom HTML**, **View left HTML**, or **View right HTML** to copy the corresponding markup.

Set `data-position` to `top`, `bottom`, `left`, or `right`. Top is the default when the attribute is omitted. These are preferred positions: the component may choose another side or adjust the placement when space is limited. Check that tooltips do not cover important content in your layout.

## Use the package

Follow [Getting started](../getting-started/) to load the package styles. Copy an example and keep the USWDS and CoDS classes and the `data-cods-tooltip` and `data-cods-tooltip-trigger` attributes. Set the trigger's `title` to the supplemental text, and give the trigger its own meaningful visible or accessible name. Tooltip text describes the trigger; it does not replace its name.

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

Use `initTooltip(root)` for one root, or `initAllTooltip(container)` for matching roots inside a container. The controller creates the tooltip and connects it to the trigger with `aria-describedby`, preserving any existing description references. It emits bubbling `cods-tooltip:open` and `cods-tooltip:close` events; each event's `detail.trigger` is the trigger element. Do not run a separate USWDS initializer on the same trigger.

## Keyboard and pointer behavior

The tooltip opens when the pointer enters the trigger or the trigger receives keyboard focus. It remains open while the pointer is over the trigger or tooltip, or while the trigger has focus. It closes when the pointer and focus both leave. Press Escape to dismiss it without moving focus; leave and return to the trigger to open it again.

## Accessibility and localization

The tooltip is supplemental text, not a control. Do not place interactive elements inside it or rely on it to explain an unlabeled icon. The trigger must be keyboard reachable and have its own accessible name. Translate both the trigger label and tooltip text, and check long translations and right-to-left content in the page layout.

The enhanced tooltip requires JavaScript in the browser. Without it, the authored `title` remains available as a native browser fallback, but native tooltips are not consistently available to keyboard and touch users. Keep essential content visible regardless of JavaScript.

## Known limitations and implementation status

Tooltip is **experimental**. Human design and accessibility review, including screen-reader announcements, 400% zoom, forced colors, reduced motion, and localization, remains open. Test the component in your service and review the linked accessibility evidence before relying on it. The additional color treatment shown in Figma is not currently implemented.
