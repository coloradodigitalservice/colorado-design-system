---
title: Radio Buttons
description: Native single-selection radio groups with explicit labels, validation, and disabled states.
navLabel: Radio Buttons
order: 16
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4054-121
---

## When to use

Use Radio Buttons when someone must choose one option from a short, visible list. Use Select for a longer list where space is limited; use Checkbox when multiple independent choices are allowed. Keep essential information visible. Do not use radios as navigation or as segmented buttons.

Radio Buttons is **experimental** in the `0.x` development series. The examples and copyable markup above come from the package's canonical fixture. Human accessibility and design acceptance remain pending.

## Markup and grouping

Load the token stylesheet and the design system stylesheet as described in [Getting started](../getting-started/). No JavaScript initialization or controller is needed.

Wrap every group in a `fieldset` with a visible `legend`. Give each input a document-unique `id`, a meaningful `value`, and an explicitly associated visible `label`. All options in one group share a `name`; unrelated groups must use different names. Preserve the `usa-radio`, `usa-radio__input`, `usa-radio__label`, `usa-fieldset`, and `usa-legend` classes alongside the CoDS classes.

`checked` sets an initial selection. Leave it off when users should make a deliberate choice. Selecting an option deselects the other option in the same group. Use a form's native submission and reset behavior; read the selected value through ordinary form APIs and the native `change` event.

## Keyboard and focus

Tab enters a group at its selected option, or an enabled option if none is selected. Arrow keys move focus and selection between enabled options; Space selects the focused option. Tab leaves the group. Browser behavior determines entry direction and right-to-left navigation. No script intercepts these keys. Disabled options are skipped.

## Errors and disabled states

Link a visible error message to the **fieldset** with `aria-describedby`. Mark invalid options with `aria-invalid="true"`; apply native `required` for a required group. Validate on the server as well as in the browser. Explain how to fix the error in text. When validation changes dynamically, the host application owns error-summary focus and any live announcements; this CSS component does not move focus or announce updates.

Use native `disabled` on an input to disable one option, or on the fieldset to disable the entire group. Disabled values are omitted from form submission. Keep inputs outside the legend so the HTML fieldset exception does not leave controls enabled. The disabled-group example preserves a selected option so the selection remains visible.

## Appearance and localization

Public classes are `cods-radio`, `cods-radio__input`, `cods-radio__label`, `cods-radio__group`, `cods-radio__legend`, and `cods-radio__error`. Set `--cods-radio-background`, `--cods-radio-text`, `--cods-radio-border`, and `--cods-radio-selected` on each option root to customize their semantic-token defaults. Preserve contrast and focus visibility.

Labels use the measured body typography (16px/24px, regular). Logical spacing supports `dir="rtl"`, translated legends and labels wrap, and no fixed height truncates content. Set the appropriate `lang` and translate all visible content and error messages. In forced colors, visible native radio inputs replace the decorative circles, preserving selection and disabling. There is no animation.

## Progressive enhancement and assets

Native inputs work with JavaScript disabled and remain operable when CSS is unavailable. The component ships no controller and no CoDS custom events. Its metadata type is `static`, describing the absence of scripted behavior.

Canonical assets are exported as `@coloradodigitalservice/colorado-design-system/fixtures/radio.html`, `metadata/radio.json`, and `examples/radio.json`. When copying multiple examples, replace IDs and group names so they remain unique in the destination document.

## Accessibility responsibilities and status

Authors own meaningful group legends, label association, unique IDs and names, required-state instructions, server validation, and dynamic error handling. Screen-reader group/legend and error announcements, actual 400% zoom, and human forced-colors review remain open in the evidence file. This component must remain experimental until the accessibility owner approves that evidence. P0-006 scope confirmation and P2-007 design acceptance remain dependencies.

## Default

**Use when:**

- Space is limited: You have a long list of options (more than 5) and need to minimize vertical scrolling.
- Simple attributes: You are asking for simple data points like gender, suffix, or basic "Yes/No" preferences.
- Scanning is priority: The user needs to quickly scan through several options to find the one that applies to them.
- Low-risk decisions: The choices are familiar, easy to understand, and do not require extensive supporting text or iconography to explain.

**Don’t use when:**

- Complex consequences: The choice leads to a significant change in the user's path or eligibility that requires detailed explanation.
- Touch targets need to be large: The interface is primarily used on mobile devices where a larger "tap" area (like a tile) would improve accessibility.
- Visual distinction is needed: You want to emphasize the importance of the choice or make it feel like a "product selection" rather than a form field.

## Tile

**Use when:**

- High-impact decisions: You want the user to slow down and carefully consider a small set of meaningful options (usually 2–4).
- Supporting content is required: Each option needs a sub-label, description, or icon to help the user distinguish between choices (e.g., selecting a pricing tier or a service plan).
- Enhanced accessibility: You want to provide a larger click/touch target for users with limited motor skills.
- Visual Hierarchy: You want to make the selection process feel more modern, interactive, and distinct from the rest of a standard text-heavy form.

**Don’t use when:**

- Large lists: Using tiles for a list of 10 items will create "wall of boxes" that is visually overwhelming and difficult to scan.
- The choice is trivial: If the question is as simple as "Do you agree to the terms?", a tile adds unnecessary visual weight and "noise" to the page.
- Consistency is broken: If every other selection in your form uses default radio buttons, switching to a tile for a simple question can confuse the user's mental model of the interface.

Apply `cods-radio--tile` to each option. Place optional supporting text in a `cods-radio__description` span within the label so it remains part of the clickable option. Decorative icons should be hidden from assistive technology; include any meaning in text. For the icon in the Tile example, deploy the sprite and replace the example URL with its public URL, as described in [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path). The tile defaults to 15rem wide, constrained to its container; set `--cods-radio-tile-width` to fit the layout.

## Compare Similar Components

| Component     | Use case                                                               | Number of options   | Selection type                        |
| ------------- | ---------------------------------------------------------------------- | ------------------- | ------------------------------------- |
| Checkboxes    | Independent choices, or a single binary toggle (e.g., "Accept terms"). | 1 to many options   | Multiple selection (or single toggle) |
| Radio buttons | Mutually exclusive choices; all options must be visible at a glance.   | 2 to 5 options      | Single selection                      |
| Dropdowns     | Conserves screen space; hides options until clicked.                   | More than 5 options | Single selection (typically)          |

The option counts in this table differ from the Default guidance above. This discrepancy needs design review.

## Writing for Radio Buttons

Radio button labels should:

- Be introduced with a colon or a heading.
- Start with a capital letter.
- Not end in punctuation if it’s a single sentence, word, or a fragment.

| Do       | Don’t    |
| -------- | -------- |
| Option 1 | option 1 |
| Red      | Red;     |
