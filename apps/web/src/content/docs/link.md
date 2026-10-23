---
title: Link
description: Native navigation links with inline, standalone, and external variants.
navLabel: Link
order: 50
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

## Anatomy

A link has descriptive text and a destination. An optional decorative icon
appears before or after the text. Links that open a new tab include a text
notice in their accessible name; icons alone do not supply that notice.

## Use the package

Load the CSS as described in [Getting started](../getting-started/). Keep
`usa-link cods-link` on enabled `<a href>` elements. Copy the HTML examples above and replace their text and destinations.

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
overrides inside RTL content. Other icons do not mirror.

## Link text

Use short, descriptive text that identifies the destination. Aim for 1–2 words;
do not exceed 3–5 words. Use sentence case and avoid “click here,” bare URLs or
ambiguous “read more” labels. Include the file type and size when known for
downloads, even when that makes the label longer.

Prefer opening links in the current tab. When a new tab is necessary, use
`target="_blank"`, `rel="noopener noreferrer"` and a text notice such as
“(opens in a new tab).” Include the notice in the accessible name and translate
it along with the label. An external icon alone does not communicate this.

For downloads, link to the file and add the `download` attribute. Use a
same-origin file URL; browsers may restrict cross-origin downloads.

## States and accessibility

Inline links stay underlined; standalone links gain an underline on hover.
All sizes inherit line-height from the surrounding content. Inline visited
links change color; standalone visited links retain their default color.

Tab and Shift+Tab move through enabled links; Enter follows the destination.
Keyboard focus has a visible ring. Forced-colors mode uses system colors for
links and focus. Decorative icons are hidden from assistive technology.

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
`--cods-color-text-disabled`, or `GrayText` in forced colors.

## Known limitations and implementation status

Link is **experimental**. Human screen-reader, 400% zoom, Windows high-contrast
and language reviews remain incomplete. See the Evidence file in the Summary
for current verification and outstanding checks.

RTL arrow mirroring requires native `:dir()` support. Test keyboard navigation,
focus, wrapping and translated content in your service before release.
