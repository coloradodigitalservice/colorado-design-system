---
title: Select
description: A native single-choice dropdown with a visible label, hint, and validation message.
navLabel: Select
order: 70
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=272-55576
---

Select lets people choose one option from a fixed list. This experimental `0.x`
component uses a native `<select>` with `<option>` children. The browser and
operating system own the popup, keyboard navigation, type-ahead, and selection.
No JavaScript controller or initialization is required.

## When to use

Use Select for a short, familiar list of choices. Keep option text concise and
put choices in a predictable order. Consider radio buttons when showing every
choice at once would help people compare them.

Select is native-only. A future **Combo Box** would provide a separate searchable
or filterable widget with its own accessibility pattern. Multi-select,
async-loaded lists, and custom-rendered dropdown panels are outside this
component's scope. Native type-ahead jumps to matching options; it does not
filter the list.

## Use the package

Follow [Getting started](/getting-started/) to load the token and design-system
stylesheets. Retain the USWDS `usa-form-group`, `usa-label`, `usa-hint`, and
`usa-select` classes alongside the CoDS classes in the examples below. The
chevron uses shared Phosphor Regular `caret-down` artwork, compared against the
original Figma export at 16px and 24px. Its generated foreground variant preserves
the existing `#1b1b1b` text token color; background SVGs cannot inherit a control’s
`currentColor`. Source hashes and comparison notes are in `icons.provenance.json`.
Do not wrap the
select in a custom popup or intercept its keyboard events.

Associate a visible `<label for>` with the select's unique `id`. Use a `name` for
form submission and stable option `value` attributes. Replace all example IDs,
names, and content when composing repeated controls. Listen for native `input`
and `change` events when an application needs the selected value; there are no
CoDS events or methods.

The canonical fixture, metadata, and generated examples are exported at
`@coloradodigitalservice/colorado-design-system/fixtures/select.html`,
`@coloradodigitalservice/colorado-design-system/metadata/select.json`, and
`@coloradodigitalservice/colorado-design-system/examples/select.json`.
This page and Storybook render those same examples.

## States and validation

Default shows a selected value. Placeholder uses a first `<option value="">`
with visible instructional text. It remains selectable so an optional field can
be cleared; add native `required` when an empty value is invalid. Placeholder
text never replaces the visible label.

Use native `disabled` to prevent interaction and remove the control from tab
order and form submission. `aria-disabled` alone does not disable a select.
Keep an explanation in the associated hint when needed.

For validation, use `aria-invalid="true"`, `usa-select--error`, and a visible
`cods-select__error` message prefixed with “Error:”. Include both hint and error
IDs in `aria-describedby`. The error example also uses the USWDS
`usa-form-group--error` wrapper. When correcting an error, remove the error
classes, message reference, and `aria-invalid`. Applications own validation
and any announcement or focus policy for dynamically inserted errors.

Success uses `cods-select--success` on the form group and a visible success hint.
It is an authored application validation result, not automatic `:valid` styling.
Do not combine success with `aria-invalid="true"`.

## Public styling

| Class                  | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `cods-select--success` | Authored successful validation state                         |
| `cods-select`          | Form group and component custom properties                   |
| `cods-select__label`   | Visible associated label                                     |
| `cods-select__hint`    | Description referenced by `aria-describedby`                 |
| `cods-select__error`   | Visible validation message                                   |
| `cods-select__control` | Native select, including disabled, invalid, and focus states |

| Custom property            | Default approved token             |
| -------------------------- | ---------------------------------- |
| `--cods-select-background` | `--cods-color-surface-form`        |
| `--cods-select-color`      | `--cods-color-text-primary`        |
| `--cods-select-border`     | `--cods-color-border-form-default` |
| `--cods-select-radius`     | `--cods-radius-md`                 |

Override these on the form group or use consumer CSS. Hover, invalid, and
disabled states use their semantic form tokens. Keyboard focus uses the approved
focus ring and gap. Native popup styling varies across browsers and platforms.
The `data-cods-select-fixture` and `data-cods-fixture-state` attributes identify
review examples; they are not behavior APIs.

## Accessibility and localization

Tab and Shift+Tab move between controls; arrow keys and type-ahead use the native
platform model. Open and close keys vary by operating system, commonly
Alt+ArrowDown, Space, Enter, and Escape. Disabled controls are skipped. There is
no script that cancels events, moves focus, or changes native selection behavior.
The control remains usable without CSS or JavaScript, and has no animation.

Labels, hints, and errors wrap at narrow widths. Long selected text may be
truncated by the native control; keep option labels concise and put explanatory
text in the hint. Native popup presentation and long-option readability require
platform review. Spanish and Arabic examples are included; inherited `dir="rtl"`
moves the arrow to the inline end. Forced colors restores the platform arrow
and uses system colors.

## Review status

Human screen-reader checks, actual 400% zoom, operating-system high contrast,
translated-content review, and State accessibility sign-off remain pending.
The Select design and its variants were inspected in the Aten Chrome profile
on October 16, 2026, and the live page was revisited in the Aten profile on
October 21. The shared caret retains the original Regular weight, geometry,
alignment, color, and 24px box; export precision introduces only edge antialiasing
differences. Styling uses
the approved Git token catalog and pinned USWDS markup; final design acceptance
remains pending. Maturity remains experimental.

## Canonical examples
