---
title: Focus States
description: Help keyboard users see which interactive element is selected.
navLabel: Focus States
section: foundation
order: 29
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=6063-557
---

A focus indicator shows which interactive element will receive keyboard input. Press Tab to move between controls, and Shift+Tab to move backward.

## When to use it

Every interactive element needs a visible focus indicator, including buttons, links, form controls, and navigation. Keep the indicator visible without clipping it or hiding it behind other content. Do not use a change in color alone to show focus.

## Focus styles

CoDS components provide their own focus styles. For example, the button below uses `--cods-focus-ring-width` (4px), `--cods-focus-ring-offset` (2px), `--cods-color-bg-action-focus` for its outline, and `--cods-color-focus-gap` for the space around the control. Other components may use different treatments to suit their context.

Test the indicator against adjacent colors and in forced colors. Ensure it remains visible on dark and light surfaces and isn't obscured by sticky elements or cut off by a container. The [Focus States design reference](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=6063-557) illustrates focus across several components.

## Try it

Use the Tab key to reach this button and see its focus indicator. The button is an example and does not perform an action.
