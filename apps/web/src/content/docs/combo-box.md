---
title: Combo Box
description: A filterable selection control with a native select fallback.
navLabel: Combo Box
order: 11
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4087-4405
---

A combo box helps people find one option in a long list. Use a select for shorter lists and radio buttons when showing all choices helps people compare them.

The component is experimental. Give the select a visible label and a unique ID. Include an empty option when the person must choose a value. Without JavaScript the select remains usable. This implementation does not enhance grouped or individually disabled options; use a native select for those cases.

## Initialize

Load the design system stylesheet and initialize after the markup is in the document:

```js
import {
  initAllComboBox,
  destroyComboBox,
} from '@coloradodigitalservice/colorado-design-system';

initAllComboBox();
// Before removing an enhanced root:
destroyComboBox(document.querySelector('[data-cods-combo-box]'));
```

The controller emits `cods-combo-box:change` with `detail.value` when the native selection changes. Do not run a separate USWDS auto-initializer on the same component. Destroy and reinitialize after changing its options.

## Keyboard

Type to filter, press Down Arrow to enter the results, use the arrow keys to move, and press Enter to select. Escape closes the list. The clear button removes the current choice.
