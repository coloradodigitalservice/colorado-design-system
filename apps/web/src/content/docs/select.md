---
title: Select
description: A native single-choice dropdown with a visible label, hint, and validation message.
navLabel: Select
order: 70
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=272-55576
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader and native mobile picker checks, is pending.
---

## Guidance

### When to use

Use Select when people choose one option from 7–15 mutually exclusive options, space is limited, or the choices are predictable or familiar. Keep option text concise and put choices in a predictable order.

Don't use Select for:

- Fewer than 7 options. Use Radio Buttons to show the choices.
- More than 15 options. Use Combo Box to help people filter the list.
- Multiple selections. Use Checkboxes or a Multi-select Tag component.
- Actions such as logging out or deleting. Use a Menu or Button.

Select is a native `<select>`: the browser and operating system own the popup, keyboard navigation, type-ahead, and selection. Type-ahead jumps to a matching option; it does not filter the list. Combo Box is a separate component with a text field that filters its options. Multi-select, async-loaded lists, and custom-rendered dropdown panels are outside Select's scope.

Choose a state that matches the field:

| State    | Use when                                                                | Don't use when                                                   |
| -------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Default  | People can choose or change a value.                                    | —                                                                |
| Disabled | The choice is unavailable until something else on the page is complete. | The field is irrelevant. Remove it instead.                      |
| Error    | The application validated the field and the value is missing or wrong.  | Validation has not run yet.                                      |
| Success  | The application confirmed the value, and showing that helps the person. | Every valid field would show it, or the field also has an error. |

### Empty option and placeholder text

- Start with an empty first option, `<option value="">`, with visible instructional text such as "- Select -". It remains selectable so an optional field can be cleared.
- Add native `required` when an empty value is invalid.
- The empty option never replaces the visible label.

### Accessibility for Select

- Associate a visible `<label for>` with the select's unique `id`. Reference the hint, and the error message when present, with `aria-describedby`.
- Tab and Shift+Tab move between controls. Arrow keys and type-ahead follow the native platform model; open and close keys vary by operating system (commonly Alt+ArrowDown, Space, Enter, and Escape).
- Use native `disabled`. It removes the control from the tab order and form submission; `aria-disabled` alone does not.
- For errors, set `aria-invalid="true"` and show a visible message below the field. Applications own validation and any announcement or focus policy for errors inserted after the page loads.
- Do not wrap the select in a custom popup or intercept its keyboard events.
- Select works without JavaScript or CSS and has no animation. Forced colors restores the platform arrow and uses system colors.

## Specifications

### Classes

Keep the USWDS classes alongside the CoDS classes.

| Class                                         | Use                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `cods-select` with `usa-form-group`           | Form group; sets the component custom properties                             |
| `cods-select__label` with `usa-label`         | Visible associated label                                                     |
| `cods-select__required`                       | Required asterisk inside the label, with `aria-hidden="true"`                |
| `cods-select__hint` with `usa-hint`           | Description referenced by `aria-describedby`                                 |
| `cods-select__control` with `usa-select`      | Native select, including disabled, invalid, and focus states                 |
| `usa-select--error`                           | Error state on the control, with `aria-invalid="true"`                       |
| `cods-select__error` with `usa-error-message` | Visible validation message after the control                                 |
| `cods-select--success`                        | Authored successful validation result on the form group, with a success hint |

### Required and error states

For an error, add `required` when the field is mandatory, `usa-select--error` and `aria-invalid="true"` on the control, a `cods-select__error` message after it, and include both the hint and error IDs in `aria-describedby`. When the error is corrected, remove the error class, the message and its reference, and `aria-invalid`.

Success is an authored application result, not automatic `:valid` styling. Do not combine it with `aria-invalid="true"`.

### Variable settings

Override these on the form group or with consumer CSS. Hover, invalid, and disabled states use their semantic form tokens.

| Custom property            | Default token                      |
| -------------------------- | ---------------------------------- |
| `--cods-select-background` | `--cods-color-surface-form`        |
| `--cods-select-color`      | `--cods-color-text-primary`        |
| `--cods-select-border`     | `--cods-color-border-form-default` |
| `--cods-select-radius`     | `--cods-radius-md`                 |

### Values and events

Give the select a `name` for form submission and stable option `value` attributes. Replace the example IDs, names, and content when composing repeated controls. Listen for native `input` and `change` events to read the selected value; there is no controller, initialization, or CoDS event.

### Limitations

- Native popup appearance varies by browser and platform; the custom popup illustrated in Figma is not implemented.
- The native control may truncate long selected text. Keep option labels concise and put explanatory text in the hint.
- The arrow is a background image with a fixed `#1b1b1b` color, because a background SVG cannot inherit the control's `currentColor`.
