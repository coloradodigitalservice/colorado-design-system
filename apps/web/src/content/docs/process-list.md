---
title: Process List
description: Show the steps in a process in the order people should complete them.
navLabel: Process List
order: 14
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3914-9831
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader testing, is pending.
---

## Guidance

### When to use

- Use a Process List when people need to understand a sequence of steps, such as applying for a service.
- Keep the process to nine steps or fewer. Split a longer process into smaller parts.

Don't use a Process List when:

- The order does not matter. Use an ordinary unordered list instead.
- People need to expand and collapse content. Use an Accordion instead.
- People need to move between steps or track their progress, such as in a multi-page form. Process List is static content: it doesn't link steps together, mark a current or completed step, or respond to input.

The Accordion Step variant is restricted to specifically approved designs and has accessibility limitations. Contact the design team if you believe it is required; this component does not implement it.

### Writing for process lists

- Put steps in the order they should be completed.
- Use short, action-oriented step headings in sentence case.
- Explain what the person needs to do, and give relevant links or requirements in the supporting text.
- Use a short list within a step when it makes the details easier to scan. Avoid deeply nested lists; consider a table when nesting makes them hard to scan.
- If any list item has two or more sentences, punctuate all items. Otherwise leave sentence fragments and single-sentence items unpunctuated. Don't end items with commas or semicolons.

### Accessibility for process lists

- Process List has no interactive behavior. Links inside a step keep their native keyboard and focus behavior.
- The ordered list carries the sequence. Keep `role="list"` on the `ol`; it preserves list semantics in Safari when list markers are hidden.
- Number icons are decorative. Mark each one `aria-hidden="true"` and `focusable="false"` so step numbers aren't announced twice.
- Give every step a heading, and choose a heading level that fits the page outline. Headings inside a step, such as an In-Page Alert heading, go one level below the step heading.
- The connector line and icons are decorative. Don't use them alone to communicate meaning; the step headings and text must make sense on their own.
- Without CSS, the list falls back to native browser numbering and the decorative icons stay hidden.

## Specifications

### Elements

Pair each CoDS class with its USWDS class where one exists. The `usa-*` classes are the upstream integration markup.

| Class                        | Use                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `cods-process-list`          | Ordered list (`ol`) root with `role="list"`; pair with `usa-process-list`.                                                         |
| `cods-process-list__item`    | One `li` per step; pair with `usa-process-list__item`.                                                                             |
| `cods-process-list__number`  | Decorative numbered icon, placed directly on the `svg` as the first child of the item. CoDS-only; USWDS draws numbers with CSS.    |
| `cods-process-list__content` | Wrapper for the step heading and supporting content, after the icon. CoDS-only.                                                    |
| `cods-process-list__heading` | Step heading at the level your page needs; pair with `usa-process-list__heading`. Supporting paragraphs, lists, and alerts follow. |

### Step numbers and connector

Use the numbered icon that matches each step, in order: `number-circle-one` through `number-circle-nine` from the packaged icon sprite. Set the SVG presentation attribute `display="none"` on each icon so native list numbers are the only numbers shown when component styles are unavailable; the component styles display and size the icons when they load.

```html
<svg
  class="cods-process-list__number"
  aria-hidden="true"
  focusable="false"
  display="none"
  width="32"
  height="32"
  viewBox="0 0 256 256"
>
  <use href="/icons/sprite.svg#number-circle-one"></use>
</svg>
```

Deploy the packaged icon sprite and replace `/icons/sprite.svg` with its public URL. See [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path).

A connector line joins each step to the next; the last step has none. It uses the system text color in forced-colors mode.

To show native list numbers instead of icons, omit or hide the icons and restore the list marker in your own styles:

```css
.cods-process-list {
  list-style: decimal;
  padding-inline-start: 2rem;
}
.cods-process-list__item {
  display: list-item;
}
.cods-process-list__number,
.cods-process-list__item::after {
  display: none;
}
```

### Assets and progressive enhancement

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). Process List requires no JavaScript.

The fixture, metadata, and examples are available from `@coloradodigitalservice/colorado-design-system` under `fixtures/process-list.html`, `metadata/process-list.json`, and `examples/process-list.json`.

### Limitations

- Icons are available for steps one through nine.
- There are no current, completed, or disabled step states, and no step navigation.
- The Accordion Step variant is not implemented.
