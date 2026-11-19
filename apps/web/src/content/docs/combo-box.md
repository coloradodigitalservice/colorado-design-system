---
title: Combo Box
description: A filterable selection control with a native select fallback.
navLabel: Combo Box
order: 11
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4087-4405
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state, including the open no-results list. Manual keyboard, screen-reader, zoom, and forced-colors review is pending.
---

## Guidance

### When to use

Use a combo box when people need to choose one option from a long, predictable list, especially when there are more than 15 options. Typing narrows the list so people can find a familiar choice without scrolling through every option.

Don't use a combo box when:

- The list is short. Use [Select](../select/).
- Seeing every choice at once helps people compare them. Use [Radio Buttons](../radio/).
- People need to choose more than one option, enter their own answer, or search options loaded from a remote source. A combo box accepts one choice from the options in its markup.
- Individual options or groups must be disabled. Use a native [Select](../select/); disabled options are not enhanced.

Compared with a native select, a combo box adds a text input that filters the options, a button that opens or closes the list, and a clear button. When JavaScript is unavailable, people use the native select instead.

Write a clear label that describes the choice. Keep option names concise and use a predictable order. Group related options with `<optgroup>` when the list contains distinct categories; the group headings are not choices.

### Accessibility for combo boxes

- Typing filters the list. Down Arrow opens the list and highlights a result, the arrow keys move between results, and Enter selects the highlighted result. Focus stays in the input so typing can continue.
- Escape closes the list and restores the selected value. Tab leaves the control without moving focus into the list.
- The clear button removes the current choice and returns focus to the input.
- A status message reports result counts, "No results.", the selected option, and "Selection cleared." These generated messages and button labels are in English.
- Group names are included in each grouped option's accessible name so options can be told apart when announced.
- Associate the select with a visible `<label for>`. The enhanced input keeps that label and copies `aria-describedby`, `aria-invalid`, and `aria-errormessage` from the select.
- Show a visible error message and reference it from `aria-describedby`. Don't rely on color alone to communicate an error.
- Without JavaScript, the native select remains fully usable.

## Specifications

### Elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                      | Use                                                                  |
| -------------------------- | -------------------------------------------------------------------- |
| `cods-combo-box`           | Wrapper around the native select; pair with `usa-combo-box`.         |
| `cods-combo-box__select`   | The native `<select>`; pair with `usa-select`.                       |
| `cods-combo-box__label`    | Visible label associated with the select; pair with `usa-label`.     |
| `cods-combo-box__required` | Required indicator inside the label. Mark it `aria-hidden="true"`.   |
| `cods-combo-box__error`    | Visible error message referenced by the select's `aria-describedby`. |

| Attribute             | Use                                           |
| --------------------- | --------------------------------------------- |
| `data-cods-combo-box` | Marks the wrapper the controller initializes. |

The controller adds `cods-combo-box__input`, `cods-combo-box__toggle`, `cods-combo-box__clear`, and `cods-combo-box__list` to the generated controls. Don't author them.

### Markup requirements

- Give each select a unique `id` that starts with a letter and contains only letters, digits, hyphens, or underscores, and a `name` for form submission.
- Use unique, non-empty option values. Include an empty first option when people must make a choice.
- Use native `<optgroup>` elements for grouped options.
- Use the native `disabled` attribute to disable the whole control. Disabled controls are skipped during form submission.
- For a required choice, add `required` to the select and show the required indicator beside its label. When reporting an error, set `aria-invalid="true"` and reference the visible message from `aria-describedby`. The application displays and clears its own validation message.

Markup that doesn't meet these requirements is left as a native select, and the controller logs one warning.

### Initializing the controller

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The controller bundles the pinned USWDS combo box behavior, so don't run a separate USWDS auto-initializer on these roots.

```js
import {
  initAllComboBox,
  destroyComboBox,
} from '@coloradodigitalservice/colorado-design-system';

initAllComboBox();

// Before removing or replacing an enhanced root:
destroyComboBox(document.querySelector('[data-cods-combo-box]'));
```

| Function                     | Behavior                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `initComboBox(root)`         | Enhances one connected root. Repeated calls are safe. Invalid markup warns once and is unchanged. |
| `initAllComboBox(container)` | Enhances every root in a container (default `document`), including the container itself.          |
| `destroyComboBox(root)`      | Removes generated controls and listeners and restores the native select with its current value.   |

When the selection changes, the root dispatches a bubbling `cods-combo-box:change` event with `detail: { value }`. Clearing sends an empty value.

### Filtering and validation

- If no options match the typed text, the list shows "No results found".
- Text that doesn't match an option keeps the control invalid and prevents form submission until the person chooses an option or presses Escape to return to the selected value.
- A form reset restores the original selection.

### Limitations

- The controller doesn't watch the DOM. Destroy and reinitialize after changing options, and call `initAllComboBox()` after inserting new markup.
- Only single selection from the supplied options is supported.
- Generated button labels, result counts, and status messages are in English.
