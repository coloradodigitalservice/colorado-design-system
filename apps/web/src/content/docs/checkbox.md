---
title: Checkbox
description: Native checkboxes for independent choices, including labeled groups, mixed state, and validation.
navLabel: Checkbox
order: 11
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=72-78
---

## When to use

Use a single checkbox for an independent yes/no choice. Use a related group when people can choose multiple options; use radio buttons when exactly one option is allowed. Every checkbox needs a visible, explicitly associated label. Give every input a document-unique `id` and match the label's `for`. Clicking the label activates its input.

Checkbox is **experimental** in the `0.x` development series. It themes USWDS 3.14.0 native checkbox markup; no component controller or custom events are shipped. The examples and copyable HTML above come from the canonical package fixture.

## Single checkbox

Load the token and component styles as described in [Getting started](../getting-started/). Use `usa-checkbox cods-checkbox` on the wrapper, `usa-checkbox__input cods-checkbox__input` on the native input, and `usa-checkbox__label cods-checkbox__label` on its following label. Set a meaningful `name` and `value` for form submission. Use `checked` for the initial checked state and the DOM `checked` property for runtime state. Unchecked inputs are omitted from form submission.

## Checkbox groups

Related checkboxes **must** be inside a native `<fieldset>` with a visible `<legend>`. Use `usa-fieldset cods-checkbox__group` and `usa-legend cods-checkbox__legend`. The grouped example above shows the required pattern and copyable markup. Inputs can share a name and have distinct values. Each input still needs its own visible label; the legend names the group rather than replacing individual labels. Browser validation of `required` applies to an individual checkbox, not “choose at least one” in a group; implement any group rule in your form validation.

## Indeterminate (mixed) state

The native `indeterminate` **DOM property requires JavaScript**. An HTML `indeterminate` attribute does not set it. Do not add `aria-checked="mixed"` or a visual-only `data-indeterminate` attribute; the native property supplies the accessible mixed state and CSS `:indeterminate` styling together.

The example above uses this consumer code after its markup is mounted:

```js
const input = document.querySelector('#checkbox-indeterminate');
if (input) input.indeterminate = true;
```

This demonstrates the state, not a select-all controller. In a select-all pattern, your application must synchronize parent and child states, including after form reset. User activation clears indeterminate and toggles the native checked state. Indeterminate is independent of `checked` and does not itself determine the submitted value. Without JavaScript the example remains an ordinary unchecked checkbox.

## Validation and disabled states

Use `aria-invalid="true"` with an `aria-describedby` reference to a visible error message (`cods-checkbox__error`). Include the word “Error” so color is not the only cue. Preserve any existing hint IDs in the space-separated `aria-describedby` value. Your form owns validation timing, error clearing, and focus when submitting. Do not mark untouched optional inputs invalid.

Use the native `disabled` attribute to prevent interaction and remove a control from the tab order and form submission. `aria-disabled` alone does not disable a native checkbox. Both disabled unchecked and disabled checked examples are provided.

## Keyboard and progressive enhancement

Tab and Shift+Tab move between enabled controls. Space toggles the focused input; focus stays in place. Labels activate their associated inputs by pointer. On macOS WebKit, use Option+Tab or enable full keyboard navigation to reach all native controls. There is no custom arrow-key navigation or focus management. Listen to native `input` or `change` events and read `checked` and `indeterminate` on the input.

Single, grouped, checked, disabled, and invalid controls remain functional without JavaScript. With CSS disabled they display as native inputs with associated labels, legend, and error text. Only mixed state needs scripting. No initialization or teardown API is needed.

## Appearance and localization

The public classes are `cods-checkbox`, `cods-checkbox__input`, `cods-checkbox__label`, `cods-checkbox__group`, `cods-checkbox__legend`, and `cods-checkbox__error`. Keep the corresponding `usa-*` integration classes. Public custom properties on the wrapper are `--cods-checkbox-background`, `--cods-checkbox-text`, `--cods-checkbox-border`, `--cods-checkbox-selected`, and `--cods-checkbox-card-width`; the color defaults reference semantic tokens. Preserve text, boundary, and focus contrast when overriding them. Check and mixed glyphs come from the shared Phosphor Regular pipeline in regular color modes. Selected controls use white `check`/`minus` artwork against the primary background; disabled selected controls use the shared dark variants against the light disabled background. Forced-colors mode displays the native input and hides the decorative glyph, so the browser supplies checked, mixed, disabled, and focus treatments.

Labels use the measured regular body typography (16px/24px), rather than semibold UI text. Labels and errors wrap without a fixed height. Translate labels, legends, and errors; set the appropriate `lang` and `dir`. The Spanish, long-content, and Arabic RTL examples exercise these patterns. No animation is added.

## Card style

Use `cods-checkbox--card` on the wrapper for a card with a clickable label. Checked and mixed cards use the selected surface; keyboard focus surrounds the card. The card defaults to 240px (15rem) and is constrained to its container. Override `--cods-checkbox-card-width` to fit the layout; labels wrap and height grows with the content.

## Accessibility review

Native input semantics provide checked, disabled, invalid, and mixed states. Authors supply meaningful names, unique IDs, related group legends, error associations, and form validation behavior. Automated checks supplement human review; screen-reader announcements, actual 400% zoom, and platform forced-colors review remain acceptance items in the [evidence file](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/packages/colorado-design-system/src/components/checkbox/accessibility/checkbox.evidence.md). The component remains experimental pending review.
