---
title: Icon
description: The approved Phosphor icon catalog, asset pipeline, sizing, and accessible usage patterns.
navLabel: Icon
order: 30
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=235-551
---

## The approved set

CoDS uses the Regular weight from the approved Phosphor set. The catalog below
is generated from the design-owner-provided Phosphor IDs and the pinned
`@phosphor-icons/core` metadata. The source manifest records the package,
version, license, weight, and approved IDs; the generated catalog records the
same source details, per-icon hashes, and Phosphor-supplied category metadata.
Repeated IDs are listed once. Icons are grouped by Phosphor's general taxonomy,
which is the sole source of categories for this catalog. Figma-library
categorization is not used. The taxonomy is source metadata, not a substitute
for choosing an icon that matches the content and task.

The package generates `icons/sprite.svg` and one SVG per approved ID from
`@phosphor-icons/core` at build time. The SVG artwork is not maintained by
hand. Deploy the generated `icons/` assets with the design-system package. The
package includes the Phosphor MIT license notice at `icons/LICENSE` (also
exported as `@coloradodigitalservice/colorado-design-system/icons/LICENSE`).
The MIT license requires its copyright and permission notice to accompany
copies or substantial portions of the licensed software. If you redistribute
these icon assets or copies of them, retain the included license notice with
your distribution.

Inline SVG `<use>` icons inherit `currentColor` from the page; standalone SVGs
loaded through `<img>` or CSS `background-image` do not. See
[Choosing a technique](#choosing-a-technique) before using an icon outside the
sprite.

Phosphor and Phosphor Icons identify the upstream icon project; their use here
does not imply affiliation with or endorsement by Phosphor. The Phosphor name
and branding are not CoDS marks.

### Sprite URL and deployment path

Each `<use href>` must point to the public URL of the deployed sprite, followed
by `#` and the icon ID. The examples use a root-hosted URL:

```html
<use href="/icons/sprite.svg#house"></use>
```

If the site is hosted under a path prefix, include that prefix:

```html
<use href="/my-app/icons/sprite.svg#house"></use>
```

For a sprite hosted on another origin, use its full URL:

```html
<use href="https://static.example.gov/cods/icons/sprite.svg#house"></use>
```

External SVG `<use>` references can be restricted by browser same-origin and
CORS policies. Prefer serving the sprite from the same origin as the page. If
using a separate asset origin, configure it to allow the consuming site and
verify the icons in supported browsers. Preserve the `#<icon-id>` fragment in
every URL.

## Sizing and color

Use only the **Regular** weight. Keep the viewBox and aspect ratio unchanged:
never stretch an icon or assign different width and height values. Choose one
of the two Figma sizes:

| Size                         | Dimensions | Intended use                                   |
| ---------------------------- | ---------- | ---------------------------------------------- |
| Small (`cods-icon--small`)   | 16 × 16    | Dense data tables, breadcrumbs, or inline text |
| Medium (`cods-icon--medium`) | 24 × 24    | Buttons and navigation bars                    |

The size modifiers use the dedicated `icon-size-small` (16px) and
`icon-size-medium` (24px) tokens. The SVG keeps a square CSS box and the
Phosphor viewBox, so its artwork is never stretched. Icons inherit their color
from `currentColor`; use an appropriate semantic icon color, such as
`--cods-color-icon-default` or `--cods-color-icon-form-success`, and verify it
against the actual background. The token package checks defined icon color
pairs at 3:1 or better, but those checks do not cover arbitrary inherited
colors or every component surface. Functional icons that convey information
or state must meet at least 3:1 non-text contrast.

Set `width="24"` and `height="24"` on each SVG as a default for use without the
CoDS stylesheet. The size modifier overrides this default when the stylesheet
is loaded; without it, both Small and Medium icons render at the largest Figma
size, 24 × 24.

The icon's 16px or 24px visual size does not define the interactive target for
an icon-only control. The consuming button or link must provide its own
adequate hit area and spacing (at least 24 × 24 CSS pixels unless an exception
in [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
applies); verify that target on the consuming component.

## Choosing a technique

How an icon is drawn decides whether it can follow the page's color. Choose in
this order:

1. **Icons in markup: use the sprite.** Inline `<svg>` with `<use>` inherits
   `currentColor`, so it follows semantic icon tokens, hover and disabled
   states, and forced colors. This is the default for every component.
2. **Icons drawn from CSS (for example a `::before` or `::after`): use a
   mask.** A mask uses only the shape of the SVG; the color comes from
   `background-color`, so it can follow tokens and `currentColor`.
3. **A fixed-color image only when a mask does not fit:** a glyph whose color
   differs from the layer it sits on (such as the white check on a selected
   checkbox), or artwork with more than one color.

Standalone SVGs loaded through `<img>` or CSS `background-image` are separate
images and do not inherit the consuming element's `currentColor`; unmasked, a
Phosphor file renders in the browser's default dark color. Do not use them for
themeable icons.

### CSS masks

Use the per-icon file from the package. The `url()` must be relative to the
stylesheet (see [Sprite URL and deployment path](#sprite-url-and-deployment-path)
for hosting).

```css
.example::before {
  content: '';
  display: inline-block;
  inline-size: var(--cods-icon-size-medium);
  block-size: var(--cods-icon-size-medium);
  background-color: currentColor;
  mask: url('./icons/caret-down.svg') center / contain no-repeat;
}

@media (forced-colors: active) {
  .example::before {
    background-color: ButtonText;
  }
}
```

- Keep a square box and `contain` so the artwork is not stretched.
- Set a system color in `forced-colors: active`. Forced colors overrides
  author `background-color`, so name a system color such as `ButtonText`
  (or `CanvasText` for non-control content) explicitly.
- Include the `-webkit-mask` equivalent if the supported-browser list requires
  it; check current support before relying on the unprefixed property.
- An external image used as a mask is fetched with CORS rules, unlike a plain
  background image. Serve it from the same origin as the stylesheet, or send
  the appropriate CORS headers from the asset origin.
- Mask-based icons are decorative by default: keep the meaning in text or in
  the control's accessible name.

### Explicit-color variants

The package generates `<id>--<hex>.svg` variants (for example
`check--ffffff.svg`) for the USWDS CSS replacements listed in
`build/uswds-icon-variants.json` and exceptional fixed-color component backgrounds
in `build/component-icon-variants.json`. The USWDS variants retain the foreground
colors of the pinned assets, including separate light and dark checkbox marks.
Component variants must match an existing Git token; the native Select background
uses `caret-down--1b1b1b.svg` to preserve its original dark foreground because a
select cannot reliably host a pseudo-element mask. They are
integration assets, not additional approved icon IDs and not a general theming
mechanism.

Before adding a variant for a new component, confirm a mask cannot do the job.
If a variant is needed, add it to the variants file with the color taken from
the source asset and cover the rendered result: assert the exact variant file
is used and sample the pixels on the real background for each state (checked,
indeterminate, disabled, forced colors). Existing examples are in
`tests/browser/checkbox-assets.ts`.

## Right-to-left layouts

Directional icons are not mirrored automatically. Add
`cods-icon--mirror-in-rtl` only when an icon represents logical interface flow,
such as a next-step arrow. The modifier flips the icon horizontally when it is
inside an element with RTL direction; physical directions and diagrams keep
their original orientation unless a particular usage should follow text flow.
A nearer explicit `dir="ltr"` keeps an opted-in icon unmirrored within an RTL
ancestor.

```html
<p dir="rtl">
  Next
  <svg
    class="cods-icon cods-icon--medium cods-icon--mirror-in-rtl"
    aria-hidden="true"
    focusable="false"
    width="24"
    height="24"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#arrow-right"></use>
  </svg>
</p>
```

## Decorative icons

An icon is decorative when nearby text already communicates the same
information or when it is purely aesthetic. Hide it from assistive technology
and do not give it an accessible name:

```html
<p>
  <svg
    class="cods-icon cods-icon--small"
    aria-hidden="true"
    focusable="false"
    width="24"
    height="24"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#house"></use>
  </svg>
  Home
</p>
```

## Meaningful icons and icon-only controls

A standalone icon that communicates information needs an accessible name.
Inline SVG uses `role="img"` and a name, for example with `aria-labelledby`:

```html
<svg
  class="cods-icon cods-icon--medium"
  role="img"
  aria-labelledby="search-icon-title"
  focusable="false"
  width="24"
  height="24"
  viewBox="0 0 256 256"
>
  <title id="search-icon-title">Search</title>
  <use href="/icons/sprite.svg#magnifying-glass"></use>
</svg>
```

Do not use `alt` on inline SVG. When an icon is inside an icon-only control,
name the control; the SVG is then decorative to avoid duplicate announcements:

```html
<button type="button" aria-label="Search">
  <svg
    class="cods-icon cods-icon--medium"
    aria-hidden="true"
    focusable="false"
    width="24"
    height="24"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#magnifying-glass"></use>
  </svg>
</button>
```

Use icon shapes that match the action or status, and do not rely on color alone
to communicate meaning. Confirm the actual icon/background combination meets
the 3:1 contrast requirement in the consuming component.

## Approved icon catalog

Each preview is decorative because its Phosphor ID is shown beside it. The
code sample gives copyable markup for that icon.
