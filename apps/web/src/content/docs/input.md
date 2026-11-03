---
title: Input
description: Native text inputs with labels, hints, and validation feedback.
navLabel: Input
order: 13
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=72-76
---

## When to use

Use Input for a short, free-form answer. Choose a native input type that fits the data: text, email, telephone, or number. Use `type="number"` for quantities where incrementing and decrementing make sense, not for identifiers, ZIP codes, or phone numbers. For longer answers use a text area.

Input is **experimental**. The examples and copyable markup use the canonical fixture; design and human accessibility review remain open.

## Anatomy and markup

Load the token and component styles as described in [Getting started](../getting-started/). Pair each `usa-input cods-input__control` with a visible `usa-label cods-input__label` using a unique `id` and matching `for`. Place them in `usa-form-group cods-input`. Use an appropriate `name`, type, and `autocomplete` value. Placeholder text does not replace a label or hint.

Place feedback below the field. Associate visible hints and feedback using `aria-describedby`, listing all relevant IDs separated by spaces. Add native `required` and a visible asterisk when a response is mandatory; explain that the asterisk marks required fields. The example error uses `aria-invalid="true"` and a visible message beginning with “Error” that explains how to fix the problem. Only set invalid after validation. The host application owns validation timing, server validation, focus management, and announcement of dynamically inserted errors.

## States and behavior

Use native `disabled` when the control must not be used; disabled controls are omitted from form submission. Use `readonly` for a value that can be focused and submitted but not edited, and explain why it cannot be changed. A success state uses `usa-input--success cods-input__control--success` on the input and visible text; do not rely on color alone. Labels and feedback wrap, and `dir="rtl"` supports right-to-left content. Set the correct language on translated text.

The default Medium field is 40px high. Use `cods-input__control--small` for the 32px Small field, and a `textarea` with `cods-input__control--large` for the 140px Large field, which can be resized vertically.

Decorative leading or trailing icons can use the `usa-input-group cods-input__group` wrapper, the matching `cods-input__icon--prefix` or `cods-input__icon--suffix` class, and `cods-input__control--prefix`, `cods-input__control--suffix`, or `cods-input__control--icons` for both. Hide decorative icons from assistive technology; keep essential meaning in text. Deploy the shared sprite as described in the [Icon guidance](../icon/#sprite-url-and-deployment-path).

## Keyboard and progressive enhancement

Tab reaches enabled controls, and the browser handles editing, keyboard selection, and native validation. No JavaScript controller is required. The native control, label, and feedback remain available without CSS or JavaScript. Consumers are responsible for announcing errors added dynamically and preserving visible focus.

## Assets and accessibility

Fixtures, metadata, and copyable examples are exported from the design-system package under `fixtures/input.html`, `metadata/input.json`, and `examples/input.json`. Automated tests supplement human review. Screen-reader announcements, actual 400% zoom, forced colors, translation, and design and accessibility-owner review remain open in the [evidence file](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/packages/colorado-design-system/src/components/input/accessibility/input.evidence.md).
