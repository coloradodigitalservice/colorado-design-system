---
title: Link
description: Native navigation links with inline, standalone, and external variants.
navLabel: Link
order: 50
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=828-3253&m=dev
---

## When to use

Use a Link to navigate to a page, section, or file. Use a [Button](../button/)
for actions such as submitting a form, opening a dialog, or uploading a file.
A prominent navigation link can use button styling while retaining `<a href>`
semantics; never add `role="button"` to it.

| Variant     | Use when                                          | Don't use when                                            |
| ----------- | ------------------------------------------------- | --------------------------------------------------------- |
| Inline      | Linking within a sentence or paragraph            | The control performs an action                            |
| Standalone  | Separate, low-emphasis navigation                 | The control changes the page in place or is the main task |
| Small       | Supporting navigation, such as a footer           | Normal-size text fits the context                         |
| Prefix icon | The icon clarifies category or purpose            | It adds clutter or redundant information                  |
| Suffix icon | An external destination or download needs context | Ordinary navigation needs no extra indication             |

## Use the package

Load the CSS as described in [Getting started](../getting-started/). Keep
`usa-link cods-link` on enabled `<a href>` elements. The examples above use the
shipped fixture and provide copyable HTML. Replace example text and destinations.

| Public class                            | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `cods-link`                             | Underlined inline link                       |
| `cods-link--standalone`                 | Separate, semibold navigation                |
| `cods-link--small` / `cods-link--large` | Small inline/standalone or large inline text |
| `cods-link__icon`                       | Decorative 16px mask                         |
| `cods-link__icon--prefix`               | Place the icon before the label              |
| `cods-link__new-tab`                    | New-tab notice; pair with `usa-sr-only`      |

Icon modifiers are `cods-link__icon--arrow`, `cods-link__icon--external`,
`cods-link__icon--globe`, `cods-link__icon--phone` and `cods-link__icon--download`.

Fixtures, metadata and generated examples are exported under
`@coloradodigitalservice/colorado-design-system/fixtures/link.html`,
`metadata/link.json` and `examples/link.json` respectively.
Deploy the package's `icons/` directory with its stylesheet so mask URLs resolve;
see [Icon](../icon/). No JavaScript controller, public data attributes or events
are required.

The public property `--cods-link-rtl-transform` defaults to `none` on `.cods-link`
and becomes `scaleX(-1)` with `.cods-link:dir(rtl)`. Only the navigation arrow
consumes it. Native `:dir()` support is required, including `dir="auto"` and LTR
overrides inside RTL content. Other icons do not mirror. Storybook preserves
native selectors with `cssTarget: 'esnext'`.

## Text and destinations

Use descriptive text that makes sense alone. Follow Figma's wording:
“Aim for 1–2 words; do not exceed 3–5 words.” Use sentence case, avoid unnecessary
articles, and avoid “click here,” bare URLs or ambiguous repeated “read more”
labels. Preserve essential file metadata. The long-content example is a stress
test, not recommended production copy.

Prefer the current tab. For a required new tab, use `target="_blank"`,
`rel="noopener noreferrer"`, a decorative external icon and localized text such
as “(opens in a new tab).” An external destination alone does not require a new
tab. The notice stays in the accessible name and becomes visible without CSS.

Download labels name the file type and size when known. The canonical example
saves the actual icon catalog (JSON, 47.3 KB) as `cods-icon-catalog.json` using
`download`. Docs and Storybook resolve the package asset during build; consumers
must deploy `icons/catalog.json` and adjust the relative fixture URL. The browser
may restrict cross-origin downloads. The phone example uses a fictional number.

## States and accessibility

Inline links stay underlined; standalone links gain an underline on hover.
Default underlines are 2px, increasing to 4px on hover; Small uses 1px/3px.
Inline offset is 2px; standalone hover offset is 3px. Active standalone links
have no underline. Every size inherits leading from its surrounding content.
Standalone visited links retain their default navy; inline visited links use
the catalog's plum alias. Browser privacy prevents scripted visited-color checks.

Tab/Shift+Tab move through enabled links; Enter follows the destination.
Keyboard focus uses a 2px white gap and 2px blue band with a 2px radius.
Forced colors use system link, visited and focus colors. There is no animation.

### Disabled links

Use disabled links sparingly; prefer explaining when a destination is available.
Remove `href`, omit `tabindex` and activation handlers, and expose disabled link
semantics:

```html
<a class="usa-link cods-link" role="link" aria-disabled="true"
  >Installation guide</a
>
```

`aria-disabled` alone does not prevent navigation. This static pattern has no
destination or tab stop. Disabled inline links retain their default underline;
standalone links have none, including hover/press. Text uses
`--cods-color-text-disabled`, or `GrayText` in forced colors. Disabled text is
contrast-exempt. Loading, error and empty states do not apply.

Link remains **experimental**. Human screen-reader, actual 400% zoom, Windows
high-contrast and design/accessibility-owner sign-off remain open in the evidence
file. Existing Spanish/Arabic translations are preserved pending language review;
translate notices with the label. Review keyboard operation, descriptive names,
wrapping, focus and translated content before using the component in a service.
