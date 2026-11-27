---
title: Elevation
description: Use elevation to communicate hierarchy and separate surfaces.
navLabel: Elevation
section: foundation
order: 28
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2932-176
---

Elevation uses shadows to suggest distance from the background and draw attention to a surface.

## Guidelines

Use elevation sparingly to separate surfaces, signal interactive states, or distinguish overlays. Consider a border for groups of cards instead of elevating every item. Avoid nesting elevated elements, and check that shadows do not make small screens feel crowded.

The [Elevation design reference](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2932-176) suggests flat for backgrounds and inputs, low for cards, mid for menus and tooltips, and high for dialogs and overlays. Built-in components have their own supported styles; these are design suggestions rather than a promise that each component uses a particular shadow.

## Accessibility and dark backgrounds

Do not use shadow alone to communicate an element's boundary, state, or importance. Shadows can disappear in forced colors and may be hard to see in dark themes or for people with low vision. Use visible borders, labels, and other non-shadow cues where needed. Input boundaries and other essential visual indicators must have sufficient contrast against adjacent colors.

The design reference suggests lighter gray surfaces to distinguish elevation on dark backgrounds. The examples below show the shipped light-background shadow tokens; they do not establish an implemented dark theme.

## Use the tokens

The shadow uses horizontal offset, vertical offset, blur and spread tokens together with the elevation shadow color. For example:

```css
.example {
  box-shadow: var(--cods-elevation-low-x) var(--cods-elevation-low-y)
    var(--cods-elevation-low-blur) var(--cods-elevation-low-spread)
    var(--cods-color-elevation-shadow);
}
```

## Elevation examples

The examples show the shipped values. Each level has a text label and a border, so it remains identifiable when shadows are unavailable.
