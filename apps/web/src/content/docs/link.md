---
title: Link
description: Native navigation links with inline, standalone, and external variants.
navLabel: Link
order: 50
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=828-3253&m=dev
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen reader, 400% zoom, and Windows high contrast checks, is pending.
---

## Guidance

### When to use

Use a link to navigate to a page, a section of a page, or a file. Use a
[Button](../button/) for actions such as submitting a form, opening a dialog, or
uploading a file. A prominent navigation link can use button styling while
keeping `<a href>` semantics; never add `role="button"` to it.

| Variant     | Use when                                          | Don't use when                                            |
| ----------- | ------------------------------------------------- | --------------------------------------------------------- |
| Inline      | Linking within a sentence or paragraph            | The control performs an action                            |
| Standalone  | Separate, low-emphasis navigation                 | The control changes the page in place or is the main task |
| Small       | Supporting navigation, such as a footer           | Normal-size text fits the context                         |
| Prefix icon | The icon clarifies category or purpose            | It adds clutter or redundant information                  |
| Suffix icon | An external destination or download needs context | Ordinary navigation needs no extra indication             |

Use disabled links sparingly. Prefer explaining when a destination will be
available.

### Writing for links

- Use short, descriptive text that identifies the destination. Aim for 1–2
  words; don't exceed 3–5 words.
- Use sentence case. Avoid “click here,” bare URLs, and ambiguous “read more”
  labels.
- For downloads, include the file type and size when known, even when that makes
  the label longer.
- Prefer opening links in the current tab. When a new tab is necessary, add a
  text notice such as “(opens in a new tab)”.

### Accessibility for links

- Tab and Shift+Tab move through enabled links in page order; Enter follows the
  destination. Keyboard focus shows a visible ring, and forced-colors mode uses
  system link and focus colors.
- Inline links stay underlined so they are not identified by color alone.
  Standalone links sit apart from prose and gain an underline on hover.
- The link text is the accessible name. Write text that makes sense out of
  context, such as in a list of links.
- Icons are decorative and hidden with `aria-hidden="true"`. An icon never
  replaces text: a link that opens a new tab needs the text notice in its
  accessible name, not only the external icon.
- A disabled link has no `href` and no tab stop. `aria-disabled` alone does not
  prevent navigation, so remove the `href`.

## Specifications

### Variants and elements

Load the CSS as described in [Getting started](../getting-started/). Pair each
CoDS class with the USWDS `usa-link` class on an enabled `<a href>` element.

| Class                     | Use                                                             |
| ------------------------- | --------------------------------------------------------------- |
| `cods-link`               | Underlined inline link; pair with `usa-link`.                   |
| `cods-link--standalone`   | Separate, semibold navigation without an underline until hover. |
| `cods-link--small`        | Small inline or standalone text.                                |
| `cods-link--large`        | Large inline text.                                              |
| `cods-link__icon`         | Decorative 16px icon slot; add one icon modifier.               |
| `cods-link__icon--prefix` | Places the icon before the label.                               |
| `cods-link__new-tab`      | New-tab notice inside the link; pair with `usa-sr-only`.        |

All sizes inherit line height from the surrounding content. Inline visited links
change color; standalone visited links keep their default color.

### Adding icons

Add an empty `<span>` with `cods-link__icon`, one icon modifier, and
`aria-hidden="true"` inside the link. Put it after the label for a suffix, or
before the label with `cods-link__icon--prefix`. The icon inherits the link's
text color.

| Icon modifier               | Use                                   |
| --------------------------- | ------------------------------------- |
| `cods-link__icon--arrow`    | Trailing navigation arrow             |
| `cods-link__icon--external` | External destination suffix           |
| `cods-link__icon--globe`    | Prefix for a site or language context |
| `cods-link__icon--phone`    | Prefix for a `tel:` link              |
| `cods-link__icon--download` | Suffix for a file download            |

Deploy the package's `icons/` directory with its stylesheet so the icon mask
URLs resolve; see [Icon](../icon/).

### New-tab and download links

For a link that opens a new tab, add `target="_blank"`,
`rel="noopener noreferrer"`, and the visually hidden notice, as in the External
link preview. Translate the notice along with the label.

For a download, link to the file and add the `download` attribute, optionally
with a suggested filename. Use a same-origin file URL; browsers may ignore
`download` for cross-origin files. Add the download icon suffix and name the file type and size in the label.

### Disabled links

Remove `href`, omit `tabindex` and activation handlers, and add `role="link"`
with `aria-disabled="true"`, as in the Disabled preview. Disabled inline links
keep their underline; standalone links have none, including on hover and press.
Text uses `--cods-color-text-disabled`, or `GrayText` in forced colors.

### Package files and limitations

- Fixtures, metadata, and generated examples are exported as
  `@coloradodigitalservice/colorado-design-system/fixtures/link.html`,
  `metadata/link.json`, and `examples/link.json`.
- Link has no JavaScript controller, public data attributes, or events.
- Link is **experimental**. Test keyboard navigation, focus, and wrapping with
  your service's content before release.
