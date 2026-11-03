---
title: Tags
description: Draw attention to a short category or status label.
navLabel: Tags
order: 22
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4608-1201
---

## When to use

Use a tag sparingly to draw attention to a category or status associated with content. Write a short, specific label that explains its meaning. Avoid using several tags together unless necessary. Avoid generic labels such as “Important,” “Note,” or “Warning”; explain what the tag is drawing attention to. Do not use tags as buttons, links, filters, or removable chips.

## Markup and variants

Load the package styles as described in [Getting started](../getting-started/). Use a text-bearing `span` with both `usa-tag` and `cods-tags`. The default is gray. Add one of these classes for another color: `cods-tags--blue`, `cods-tags--green`, `cods-tags--red`, `cods-tags--yellow`, `cods-tags--plum`, or `cods-tags--teal`. The text must convey the meaning without depending on color. Tags are static and need no JavaScript.

The design specifies one size. Tags can wrap when space is narrow or text is translated. Do not make a tag look like an interactive control by placing it among buttons.

## Accessibility

Keep the label visible and meaningful. If you customize a color, check text contrast against its background. The component is experimental; human design, screen-reader, zoom, and forced-colors review remain open.

## Examples

These examples and the copyable markup come from the component fixture.
