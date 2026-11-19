---
title: Checkbox
description: Allows users to select one or more options from a list. Compare with Radio Buttons, which allow users to select exactly one choice from a group.
navLabel: Checkbox
order: 11
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=72-78
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader, 400% zoom, and Windows High Contrast checks, is pending.
---

## Guidance

### When to use

| Variant | Use when                                                                                                                                                                                                                                     | Don't use when                                                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default | You need users to select simple attributes, preferences, filters, or add-ons. Users already understand the options without extra explanation. The task should be quick to scan and low-risk or easily reversible.                            | The choice determines a pathway, eligibility, or next step. Options need descriptions, guidance, or comparison to understand. Accuracy and careful consideration matter more than speed. |
| Card    | You need users to choose between a small set of meaningful service or application options (about 2–5). Each option needs supporting text to explain differences or consequences. You want users to slow down and make a deliberate decision. | There are many options or it's a routine settings or filter list. Options are obvious without explanation. The added visual weight would make a simple task feel heavy or slow.          |

Compare similar components:

| Component     | Use case                                                         | Number of options | Selection type                        |
| ------------- | ---------------------------------------------------------------- | ----------------- | ------------------------------------- |
| Checkboxes    | Independent choices, or a single binary toggle ("Accept terms"). | 1 to many         | Multiple selection (or single toggle) |
| Radio buttons | Mutually exclusive choices; all options visible at a glance.     | 2 to 5            | Single selection                      |
| Dropdowns     | Conserves screen space; hides options until clicked.             | More than 5       | Single selection (typically)          |

Use mixed (indeterminate) state only for a parent checkbox whose child options are partly selected, such as select all.

### Writing for checkboxes

- Use sentence case, starting with a capital letter: "Option 1", not "option 1".
- Don't put punctuation at the end of each option: "Red", not "Red;" or "Red,".
- Use the first person when the checkbox asks people to agree to terms: "I agree to the Terms of Service", not "You agree to the Terms of Service".

### Accessibility for checkboxes

- Every checkbox needs a visible label associated by matching the input's unique `id` and the label's `for`. Clicking the label toggles its input.
- Put related checkboxes in a native `<fieldset>` with a visible `<legend>`. The legend names the group; it doesn't replace each checkbox's own label.
- Tab and Shift+Tab move between enabled checkboxes. Space toggles the focused checkbox, and focus stays in place. There is no arrow-key navigation. On macOS WebKit, use Option+Tab or turn on full keyboard navigation.
- Associate hints and errors with `aria-describedby`. Keep any existing hint IDs in the space-separated value when you add an error ID.
- Mark an invalid checkbox with `aria-invalid="true"`, and begin the visible error text with "Error" so color isn't the only cue. Don't mark untouched optional inputs invalid.
- Use the native `disabled` attribute. It removes the checkbox from the tab order and from form submission. `aria-disabled` alone doesn't disable a native checkbox.
- Set mixed state with the native `indeterminate` property, which also supplies the accessible mixed state. Don't add `aria-checked="mixed"`.
- Single, grouped, checked, disabled, and invalid checkboxes work without JavaScript. Only mixed state needs scripting.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                   | Use                                                                               |
| ----------------------- | --------------------------------------------------------------------------------- |
| `cods-checkbox`         | Wrapper for one checkbox and its label; pair with `usa-checkbox`.                 |
| `cods-checkbox--card`   | Card style on the wrapper, with the label as the clickable card.                  |
| `cods-checkbox__input`  | Native `type="checkbox"` input; pair with `usa-checkbox__input`.                  |
| `cods-checkbox__label`  | Label immediately after its input; pair with `usa-checkbox__label`.               |
| `cods-checkbox__group`  | Native `<fieldset>` around related checkboxes; pair with `usa-fieldset`.          |
| `cods-checkbox__legend` | Visible `<legend>` that names the group; pair with `usa-legend`.                  |
| `cods-checkbox__error`  | Visible error text after the label, referenced by the input's `aria-describedby`. |

Use `checked` for the initial checked state and `disabled` for a disabled checkbox. Give each input a meaningful `name` and `value`; grouped inputs can share a `name` with distinct values. Unchecked inputs aren't submitted.

### Setting the indeterminate state

The HTML `indeterminate` attribute doesn't exist; set the DOM property with JavaScript after the markup is in the page:

```js
const input = document.querySelector('#checkbox-indeterminate');
if (input) input.indeterminate = true;
```

Activating the checkbox clears mixed state and toggles `checked`. Mixed state doesn't change the submitted value. CoDS doesn't ship a select-all controller: your application keeps the parent and child checkboxes in sync, including after a form reset. Listen to the native `input` or `change` events and read `checked` and `indeterminate`. Without JavaScript, the checkbox is an ordinary unchecked checkbox.

### Validation

Your form owns validation timing, error clearing, and moving focus on submit. The browser's `required` validation applies to an individual checkbox. A "choose at least one" rule for a group must be implemented in your form validation.

### Variable settings

Set these on a `cods-checkbox` wrapper:

| Custom property              | Default                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `--cods-checkbox-background` | Unchecked box background, `color.surface-form`              |
| `--cods-checkbox-text`       | Label text, `color.text-primary`                            |
| `--cods-checkbox-border`     | Unchecked box border, `color.border-form-default`           |
| `--cods-checkbox-selected`   | Checked and mixed box background, `color.bg-action-primary` |
| `--cods-checkbox-card-width` | Card width, `15rem` (240px), constrained to its container   |

Keep text, boundary, and focus contrast when overriding colors. Card labels wrap and the card grows with its content.

### Limitations

- There is no JavaScript controller, initialization, or custom event; checkboxes use native browser behavior.
- In Windows High Contrast and other forced-colors modes, the browser draws the native checkbox and its checked, mixed, disabled, and focus states.
- No animation is added.
