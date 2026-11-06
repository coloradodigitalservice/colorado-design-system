---
title: Combo Box
description: A filterable selection control with a native select fallback.
navLabel: Combo Box
order: 11
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4087-4405
---

## When to use

Use a Combo Box when people need to choose one option from a long, predictable list, especially when there are more than 15 options. Typing narrows the list so people can find a familiar choice without scrolling through every option.

For a shorter list, use [Select](../select/). When showing all choices helps people compare them, use [Radio Buttons](../radio/). A Combo Box accepts one choice from the supplied list; it does not support multiple selections, free-text responses, or options loaded from a remote source.

Write a clear label that describes the choice. Keep option names concise and use a predictable order. Group related options when the list contains distinct categories.

## Anatomy

A Combo Box has a visible label, an input for filtering, a button to open or close the list, and a list of options. A clear button appears when the input has content. Optional group headings organize related options; the headings are not choices. A required field can also include a visible error message.

The examples above show the default, disabled, grouped, and required error states. Expand an example to copy its markup.

## Use the package

Follow [Getting started](../getting-started/) to load the stylesheets. Start with the native `<select>` markup in the examples and retain the USWDS and CoDS classes. Give each select a unique `id` and associate it with a visible label using `for`. Give the select a `name` for form submission and use unique, non-empty values for its choices. The ID must start with a letter and contain only letters, digits, hyphens, or underscores.

Include an empty option when the person must make a choice. Use native `<optgroup>` elements for grouped options. Replace example IDs, names, and option text when adding the control to a page.

Initialize after the markup is in the document:

```js
import {
  initAllComboBox,
  destroyComboBox,
} from '@coloradodigitalservice/colorado-design-system';

initAllComboBox();
// Before removing an enhanced root:
destroyComboBox(document.querySelector('[data-cods-combo-box]'));
```

Use `initComboBox(root)` to initialize one root, or `initAllComboBox(container)` to initialize matching roots within a container. The controller emits the bubbling `cods-combo-box:change` event with the selected value in `event.detail.value`; clearing sends an empty value. Destroy and reinitialize the component after changing its options. Do not run a separate USWDS auto-initializer on the same component.

## States and validation

Use the native `disabled` attribute to disable the whole control. Disabled controls are skipped during form submission. Individually disabled options or groups are not enhanced; use a native Select when those are needed.

For a required choice, add `required` to the select and show a required indicator beside its label. When reporting an error, provide a visible message, set `aria-invalid="true"`, and reference the message from `aria-describedby`. The application is responsible for displaying and clearing its validation message.

Typing filters the available options. If no options match, the list reports that there are no results. Text that does not match the current selection prevents form submission until the person chooses an option or returns to the selected value. A form reset restores the original selection.

## Keyboard and focus

Type to filter the list. Press Down Arrow to open it and highlight a result; use the arrow keys to move between results and Enter to select. Focus stays in the input so typing can continue. Escape closes the list and restores the selected value. The clear button removes the current choice.

## Accessibility and localization

The native select remains usable when JavaScript is unavailable. The enhanced control keeps the visible label and connects error descriptions to the input. Group names are included in option names so they can be distinguished when announced. Do not rely on color alone to communicate an error.

Authors are responsible for meaningful labels and option text, unique IDs and values, clear validation messages, and testing the component in their service. Test translated and right-to-left content in context.

## Known limitations and implementation status

Combo Box is **experimental**. The generated button labels, result counts, and status messages are currently in English. Screen-reader announcements, actual 400% browser zoom, operating-system high contrast, translated content, and design and accessibility-owner review remain open. See the Evidence file in the Summary for the current review status.
