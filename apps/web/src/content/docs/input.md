---
title: Input
description: Native text inputs with labels, hints, and validation feedback.
navLabel: Input
order: 13
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=72-76
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.
---

## Guidance

### When to use

Use Input for a short, free-form answer, such as a name, an email address, or a number of people. Use a Large field for a longer answer.

Don't use Input when:

- People choose from a known list of options. Use radio buttons, checkboxes, a select, or a combo box instead.
- The answer is a ZIP code, phone number, or identifier. Use a text or `tel` input, not `type="number"`.

Choose a size and type that fit the expected answer:

| Variant          | Use when                                                                                     | Don't use when                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Medium (default) | Most single-line answers.                                                                    | —                                                                      |
| Small            | A more compact field is needed.                                                              | —                                                                      |
| Large            | The answer may run to several lines. Large uses a `textarea` that can be resized vertically. | A single line is enough.                                               |
| Email            | Collecting an email address (`type="email"`).                                                | —                                                                      |
| Number           | Quantities where incrementing and decrementing make sense (`type="number"`).                 | ZIP codes, phone numbers, card numbers, or other identifiers.          |
| Decorative icons | An icon helps people recognize the expected answer at a glance.                              | The icon carries meaning that is not also in the label, hint, or text. |

Use these states to show what people can do with a field:

- **Required:** add native `required` and a visible asterisk, and explain near the top of the form that the asterisk marks required fields.
- **Error and success:** show feedback after validation, below the field. Error and success use a 2px border and visible text; don't rely on color alone.
- **Disabled:** the field cannot be used. Disabled fields are skipped by the keyboard and left out of form submission.
- **Read-only:** the value can be focused, copied, and submitted but not edited. Explain why it cannot be changed.

### Accessibility for Input

- Give every field a visible label. Pair the `label`'s `for` with the input's unique `id`. Placeholder text does not replace a label or hint.
- Link hints and feedback to the field with `aria-describedby`, listing every relevant ID separated by spaces.
- Set `aria-invalid="true"` only after validation fails, and start the visible message with “Error:” followed by how to fix the problem.
- Use an appropriate `name`, `type`, and `autocomplete` value so browsers and assistive technology can help people fill in the field.
- Tab reaches enabled fields and the browser handles editing and native validation. No JavaScript is required.
- Hide decorative icons from assistive technology with `aria-hidden="true"`, and keep essential meaning in text.
- The host application owns validation timing, server validation, moving focus to errors, and announcing errors that are added dynamically.

## Specifications

### Variant classes

Place each field in a `usa-form-group cods-input` wrapper. Use `usa-form-group--error` on the wrapper of a field with an error.

| Class                                                                | Use                                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `usa-label cods-input__label`                                        | The visible label.                                                    |
| `usa-hint cods-input__hint`                                          | Hint text above the field.                                            |
| `usa-input cods-input__control`                                      | The Medium (default) input, 40px high.                                |
| `cods-input__control--small`                                         | The Small input, 32px high.                                           |
| `cods-input__control--large`                                         | The Large field on a `textarea`, 140px high and resizable vertically. |
| `usa-input--error` with `aria-invalid="true"`                        | An input that failed validation.                                      |
| `usa-input--success cods-input__control--success`                    | An input that passed validation.                                      |
| `usa-error-message cods-input__feedback cods-input__feedback--error` | Error feedback below the field.                                       |
| `cods-input__feedback cods-input__feedback--success`                 | Success feedback below the field.                                     |
| `cods-input__required`                                               | The visible required asterisk, hidden from assistive technology.      |

### Variable settings

| Custom property                        | Default | Use                                               |
| -------------------------------------- | ------- | ------------------------------------------------- |
| `--cods-border-input-width`            | `1px`   | Border width of default and disabled fields.      |
| `--cods-border-input-validation-width` | `2px`   | Border width of enabled error and success fields. |

Set these on `.cods-input` so the field and any icons use the same values.

### Adding icons

Wrap the field in `usa-input-group cods-input__group` and add a decorative icon in a `span` with `usa-input-prefix cods-input__icon cods-input__icon--prefix` or `usa-input-suffix cods-input__icon cods-input__icon--suffix`. Add the matching padding class to the field:

| Class                         | Use                        |
| ----------------------------- | -------------------------- |
| `cods-input__control--prefix` | A leading icon.            |
| `cods-input__control--suffix` | A trailing icon.           |
| `cods-input__control--icons`  | Both leading and trailing. |

Icons take the error, success, or disabled color when the field changes state. On a Large field, icons align with the first line of text. Deploy the shared sprite as described in the [Icon guidance](../icon/#sprite-url-and-deployment-path).
