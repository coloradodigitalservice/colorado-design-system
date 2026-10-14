---
title: Link
description: Native navigation links with inline, standalone, and external variants.
navLabel: Link
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=828-3253&m=dev
---

## When to use

Use a Link to navigate to another page, a section, or a resource. Use a native
`<button>` for actions such as submitting a form, opening a dialog, or changing
page state. A navigation link may use button styling when it is the primary
call to action; keep its `<a href>` semantics and do not add `role="button"`.
An action styled like a text link still needs a `<button>`.

Prefer opening links in the current tab. When a service requires a new tab, add
`target="_blank"`, `rel="noopener noreferrer"`, a decorative external icon, and
localized text that tells users it opens in a new tab. An external destination
does not automatically require a new tab. Use the inline variant in prose and
`cods-link--standalone` for a separate navigation call to action. Its optional
trailing arrow does not replace meaningful link text.

## Anatomy

Keep `usa-link cods-link` on a native `<a href="…">`. The `href` supplies the
destination; visible text supplies its accessible name. `cods-link__icon` is a decorative element with `aria-hidden="true"`.
The external, globe, and arrow modifiers use the exact local Figma SVG resources as
CSS masks, preserving their 16 × 16 geometry. They require no runtime asset fetch. For new-tab
links, `usa-sr-only cods-link__new-tab` hides the behavior text visually while
keeping it in the accessible name. Without CSS the text becomes visible.
The package uses USWDS's native link styles; no controller or JavaScript is needed.

## Use the package

Import the token CSS and design-system CSS as described in
[Getting started](/getting-started/). Expand “View default HTML” or “View external HTML” above to copy the complete
canonical example. Replace its text and destination, and retain the new-tab
notice if using `target="_blank"`.
Fixtures, metadata, and generated examples are exported at
`@coloradodigitalservice/colorado-design-system/fixtures/link.html`,
`@coloradodigitalservice/colorado-design-system/metadata/link.json`, and
`@coloradodigitalservice/colorado-design-system/examples/link.json`.

| Public class            | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `cods-link`             | Underlined native navigation link              |
| `cods-link--standalone` | Standalone link with semibold text             |
| `cods-link__icon`       | Decorative 16px icon slot                      |
| `cods-link__new-tab`    | New-tab behavior text; pair with `usa-sr-only` |

Additional public modifiers are `cods-link--small` for inline or standalone
small text, `cods-link--large` for large inline text,
`cods-link__icon--external`, `cods-link__icon--globe`,
`cods-link__icon--prefix`, and `cods-link__icon--arrow`.
Prefix icons appear before the text; only directional arrows mirror with the
link's resolved direction, including `dir="auto"` and mixed-direction content.
No component custom properties, public data attributes, events, or controller
methods are required. Link color, hover, active, spacing, and focus use approved
CoDS tokens. Inline visited color uses the shared supplemental plum alias. Standalone
visited links keep their default navy color, matching the standalone design. Override component classes in consumer CSS and verify
contrast and focus visibility. The fixture state attributes are review labels.

## Write descriptive link text

Describe the destination so the link makes sense when read alone: “Read the
installation guide” or “Apply for a Colorado fishing license.” Avoid “click
here,” bare URLs, and repeated “read more” labels with different destinations.
Keep the same text for links to the same destination. Include essential context
in the link text rather than relying on a `title` attribute or surrounding prose.

For downloads, state the document name, file type, and size when known, for
example “Download the application form (PDF, 240 KB).” The `download` attribute
is a browser hint; verify the actual response and cross-origin behavior.

## States and accessibility

Inline links remain underlined. Figma's standalone links use semibold text,
separate placement, and a hover underline; keep them outside running prose so
purpose does not depend on color alone. Use the inline variant inside sentences.
Default inline underlines are 2px with 2px offset; hover increases thickness to
4px. Standalone hover uses a 4px underline with 3px offset. Active standalone
links return to the un-underlined treatment. Tab and Shift+Tab follow native document
order; Enter follows the link. Keyboard focus follows Link’s rounded Figma treatment: 2px white spread
plus 4px total blue spread, creating a 2px blue band. A system-color outline
replaces shadows in forced colors. Language Selector focus tokens are unchanged.
Disabled, loading, error, and empty states do not apply: do not invent disabled
anchors or omit `href` for a usable link.

Hover and active examples require pointer interaction. To review visited styling,
follow the example and use the browser Back command; scripts cannot reliably
inspect visited colors because browsers protect navigation history. The focused
Storybook example applies focus, while keyboard testing verifies `:focus-visible`.

Long text wraps at narrow widths. Spanish and right-to-left examples are supplied;
translate the new-tab notice along with the link text. The standalone navigation
arrow mirrors in right-to-left content. There is no animation. Forced colors use
system link and focus colors. All destinations work without JavaScript, and
new-tab behavior remains understandable without CSS.

## Known limitations and implementation status

Link is **experimental** in the `0.x` development series. The client priority
set awaits CODS-P0-006 confirmation. Human screen-reader, actual 400% browser
zoom, and high-contrast testing completion was confirmed by the user on 2026-10-13.
Translated-content review and design/accessibility sign-off remain open in the
evidence file. The supplemental Link aliases and decoration dimensions record the inspected
Figma source without changing existing generic token mappings. Markup and styling may change before supported release.

## Manual review checklist

- Navigate every example with Tab, Shift+Tab, and Enter; confirm visible focus.
- With VoiceOver/Safari or NVDA/Firefox, verify link names and the new-tab notice.
- Follow a visited example and return with Back; inspect its visited presentation.
- At actual 400% zoom and in operating-system high contrast, verify text,
  underlines, icons, and keyboard focus remain usable.
- Review descriptive link purpose out of context and translated service copy.
