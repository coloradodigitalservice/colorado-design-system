---
title: Radio Buttons
description: Allow users to select exactly one choice from a group.
navLabel: Radio Buttons
order: 16
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4054-121
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader verification, is pending.
---

## Guidance

### When to use

Use Radio Buttons when someone must choose exactly one option from a short, visible list. Selecting an option deselects the others in the same group. Use [Checkbox](../checkbox/) when people can select one or more options, and Select when the list is long and space is limited. Don't use radio buttons as navigation or as segmented buttons.

| Variant | Use when                                                                                                                                                                                                                                                                                                                                                                                    | Don't use when                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default | Space is limited: you have a long list of options (more than 5) and need to minimize vertical scrolling. You are asking for simple data points, like gender, suffix, or a basic "Yes/No" preference. People need to quickly scan several options to find the one that applies to them. The choices are familiar, low-risk, and don't need extensive supporting text or icons to explain.    | The choice leads to a significant change in the person's path or eligibility that needs detailed explanation. The interface is mainly used on mobile, where a larger tap area (like a tile) would improve accessibility. You want to emphasize the choice or make it feel like a "product selection" rather than a form field.   |
| Tile    | You want people to slow down and carefully consider a small set of meaningful options (usually 2–4). Each option needs a sub-label, description, or icon to tell it apart (for example, a pricing tier or service plan). A larger click or touch target helps people with limited motor skills. The selection should feel more interactive and distinct from the rest of a text-heavy form. | Large lists: ten tiles create a "wall of boxes" that is overwhelming and hard to scan. The choice is trivial, such as "Do you agree to the terms?", where a tile adds unnecessary visual weight. Every other selection in the form uses default radio buttons, and switching to a tile for a simple question can confuse people. |

| Component     | Use case                                                               | Number of options   | Selection type                        |
| ------------- | ---------------------------------------------------------------------- | ------------------- | ------------------------------------- |
| Checkboxes    | Independent choices, or a single binary toggle (e.g., "Accept terms"). | 1 to many options   | Multiple selection (or single toggle) |
| Radio buttons | Mutually exclusive choices; all options must be visible at a glance.   | 2 to 5 options      | Single selection                      |
| Dropdowns     | Conserves screen space; hides options until clicked.                   | More than 5 options | Single selection (typically)          |

Leave every option unselected when people should make a deliberate choice; use `checked` only for a sensible default.

### Writing for Radio Buttons

Radio button labels should:

- Be introduced with a colon or a heading.
- Start with a capital letter.
- Not end in punctuation if it’s a single sentence, word, or a fragment.

| Do       | Don’t    |
| -------- | -------- |
| Option 1 | option 1 |
| Red      | Red;     |

### Accessibility for Radio Buttons

- Tab moves into a group at its selected option, or at an enabled option when none is selected. Arrow keys move focus and selection between enabled options, Space selects the focused option, and Tab leaves the group. These are native browser behaviors; no script handles keys.
- Wrap every group in a `fieldset` with a visible `legend`. The legend names the group.
- Give each input a document-unique `id` and a visible `label` whose `for` matches it. Clicking the label selects the option.
- Give all options in one group the same `name`, and give unrelated groups different names.
- For a required group, add native `required` to its inputs and say in the legend or nearby text that an answer is required.
- For an error, link a visible message to the `fieldset` with `aria-describedby`, mark the inputs `aria-invalid="true"`, and explain how to fix it. Validate on the server too. When validation changes dynamically, your application owns error-summary focus and any announcement.
- Use native `disabled` on an input to disable one option, or on the `fieldset` to disable the whole group. Disabled options are skipped by the keyboard and left out of form submission. Keep inputs outside the `legend`.
- Hide decorative tile icons from assistive technology (`aria-hidden="true"`) and put any meaning in the label text.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                     | Use                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `cods-radio`              | Option wrapper (default variant); pair with `usa-radio`.                                    |
| `cods-radio--tile`        | Tile variant; add to each option wrapper alongside `cods-radio`.                            |
| `cods-radio__input`       | Native `type="radio"` input; pair with `usa-radio__input`.                                  |
| `cods-radio__label`       | Visible label following the input; pair with `usa-radio__label`.                            |
| `cods-radio__description` | Optional supporting text in a `span` inside a tile label, so it stays part of the hit area. |
| `cods-radio__group`       | The group's `fieldset`; pair with `usa-fieldset`.                                           |
| `cods-radio__legend`      | The group's `legend`; pair with `usa-legend`.                                               |
| `cods-radio__error`       | Error message referenced by the fieldset's `aria-describedby`.                              |

Radio Buttons ships no JavaScript and dispatches no CoDS events. Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Read the selected value through ordinary form APIs and the native `change` event.

### Adding icons to tiles

Tile labels can start with a decorative icon from the CoDS sprite. Import the sprite URL from the package (`@coloradodigitalservice/colorado-design-system/icons/sprite.svg`) or deploy it and use its public URL, as described in [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path).

### Variable settings

Set these on an option wrapper to adjust the approved token-based colors and tile width:

| Custom property           | Default                                               |
| ------------------------- | ----------------------------------------------------- |
| `--cods-radio-background` | Option background, `color.surface-form`               |
| `--cods-radio-text`       | Label text, `color.text-primary`                      |
| `--cods-radio-border`     | Unselected circle border, `color.border-form-default` |
| `--cods-radio-selected`   | Selected circle fill, `color.bg-action-primary`       |
| `--cods-radio-tile-width` | Tile width, `15rem`, constrained to its container     |

Keep readable contrast and visible focus when changing colors.

### Limitations

- When copying more than one example into a page, replace IDs and group names so they stay unique.
- Without CSS, native radio inputs and labels remain fully operable. In forced-colors mode, the native inputs replace the styled circles.
- There is no animation.
