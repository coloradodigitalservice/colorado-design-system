---
title: Tags
description: Draw attention to a short category or status label.
navLabel: Tags
order: 22
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4608-1201
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.
---

## Guidance

### When to use

- Use a tag sparingly to draw attention to a category or status associated with content.
- Write a short, specific label that explains the tag's meaning.
- Avoid using several tags together unless necessary.
- Don't use generic labels such as “Important,” “Note,” or “Warning.” Explain what the tag is drawing attention to.
- Don't use tags as buttons, links, filters, or removable chips. Tags are static labels; CoDS doesn't provide an interactive or dismissible tag.
- Don't place tags among buttons or style them to look like controls.

Tags come in one size and seven colors: gray (the default), blue, green, red, yellow, plum, and teal.

### Accessibility for tags

- Tags are static text. They have no keyboard interaction and are not in the tab order. Don't add `tabindex`, `role="button"`, or click handlers.
- The label text must convey the meaning on its own. Color is supplemental; don't rely on it to distinguish one tag from another.
- Keep the label visible. Don't replace it with an icon or hide it from assistive technology.
- Place a tag next to the content it describes, such as inside or after a heading, so it is read in context.
- Tags wrap onto more lines when space is narrow or the label is long.

## Specifications

### Colors

Use a text-bearing `span` with both `usa-tag` and `cods-tags`. Add one modifier class for a color other than gray. The `usa-tag` class is the upstream integration markup.

| Class               | Use                                      |
| ------------------- | ---------------------------------------- |
| `cods-tags`         | Gray tag (default); pair with `usa-tag`. |
| `cods-tags--blue`   | Blue tag; add to `usa-tag cods-tags`.    |
| `cods-tags--green`  | Green tag; add to `usa-tag cods-tags`.   |
| `cods-tags--red`    | Red tag; add to `usa-tag cods-tags`.     |
| `cods-tags--yellow` | Yellow tag; add to `usa-tag cods-tags`.  |
| `cods-tags--plum`   | Plum tag; add to `usa-tag cods-tags`.    |
| `cods-tags--teal`   | Teal tag; add to `usa-tag cods-tags`.    |

```html
<h3>
  Sales tax increases to 2.2%
  <span class="usa-tag cods-tags cods-tags--blue">Update</span>
</h3>
```

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Tags need no JavaScript.

### Variable settings

Each color reads a pair of component tokens, `--cods-component-tag-<color>-background` and `--cods-component-tag-<color>-text`, where `<color>` is `gray`, `blue`, `green`, `red`, `yellow`, `plum`, or `teal`. For example, `--cods-component-tag-blue-background` defaults to `color.surface-tag-blue`. If you override a pair, check the text contrast against its background.

### Limitations

- Tags come in one size.
- Tags are not interactive. Removable, selectable, and linked tags aren't supported.
