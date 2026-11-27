---
title: Grids & Spacing
description: Use spacing tokens and responsive layouts to organize content.
navLabel: Grids & Spacing
section: foundation
order: 30
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=696-3181
---

Consistent spacing groups related content and creates room between sections. Grids help content adapt to the space available while preserving its reading order.

## Spacing scale

Use the shipped spacing custom properties for gaps, padding, and margins. Smaller values help group related items; larger values separate sections. The labels below come from the current generated tokens. Some names in the [design reference](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=696-3181) differ from the names shipped in code, so use the names shown here when implementing a page.

## Responsive grids

Choose columns based on the available space and the content, and let them stack when there is not enough room. Keep the source order meaningful so keyboard and screen-reader users encounter content in a logical sequence. Check layouts at narrow and intermediate widths and at 400% zoom; avoid clipping and unintentional horizontal scrolling.

The design reference illustrates desktop, tablet, and mobile layouts. Those examples are design guidance, not a promise that every page uses the same fixed grid or breakpoint. The example below uses CSS Grid and the shipped spacing tokens; resize the browser to see its columns reflow.

```css
.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--cods-space-md);
}
```

## Examples

The spacing examples show each shipped token and its value. The grid example keeps items in source order as columns change.
