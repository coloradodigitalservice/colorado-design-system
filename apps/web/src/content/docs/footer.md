---
title: Footer
description: Colorado-themed full and compact site footers.
navLabel: Footer
order: 50
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1100-9283
---

## When to use

Use the **Full** footer when visitors benefit from categorized navigation across
a complex site. Use the **Compact** footer when a smaller site, landing page, or
task-focused experience needs a short set of essential links. Replace all
example labels and destinations with links that are relevant to your agency.

## Anatomy

1. **Footer landmark** (`cods-footer`): names the end-of-page navigation for
   assistive technology. A page with more than one footer landmark should give
   each one a distinct accessible name.
2. **Return-to-top link** (`cods-footer__return-to-top`): a native link to the
   page's top anchor.
3. **Primary navigation** (`cods-footer__nav`): groups service links under
   headings in Full; Compact presents a shorter, ungrouped list.
4. **Contact and social links** (`cods-footer__contact`,
   `cods-footer__social`): a headed set of agency contact destinations and
   named social links using approved CoDS icons in Full.
5. **Legal navigation** (`cods-footer__legal-nav`): provides accessibility,
   financial transparency, data terms, and privacy destinations alongside the
   copyright statement.

## Use the package

Follow [Getting started](../getting-started/) to install the development release
and load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and
`@coloradodigitalservice/colorado-design-system/styles.css` once. Use the
canonical fixture below as a starting point; keep USWDS's `usa-footer` classes
alongside the public `cods-footer` classes. Choose `usa-footer--big
cods-footer--full` for categorized navigation or `usa-footer--slim
cods-footer--compact` for the compact variant.

The page's top-level content should provide the `id` targeted by the return to
top link (the example uses `#top`). Keep every navigation label and social link
name meaningful; the social icon itself is decorative and hidden from
assistive technology. Replace the example social destinations with the
agency's actual profiles.

Full uses the pinned USWDS footer behavior to turn its groups into disclosures
below 480px. Include one or more groups, each with a unique, nonempty
`data-cods-footer-group` on a heading inside the primary navigation. Immediately
follow each heading with its panel, using the `usa-list--unstyled` class. Adjust
the USWDS grid classes to fit the desired number of columns; the example uses
four on desktop and wraps additional groups to the next row.

Initialize Full after adding the footer to the document and destroy it before
removing or changing the markup:

```ts
import {
  destroyFooter,
  initFooter,
} from '@coloradodigitalservice/colorado-design-system';

const footer = document.querySelector('[data-cods-footer]');
if (footer instanceof HTMLElement) initFooter(footer);

// Before removing or replacing the footer:
if (footer instanceof HTMLElement) destroyFooter(footer);
```

Without JavaScript, all Full links remain visible. Compact is static and does
not need initialization. USWDS's footer behavior supports one Full footer per
document.

The package exports the canonical markup at
`@coloradodigitalservice/colorado-design-system/fixtures/footer.html` and
metadata at `@coloradodigitalservice/colorado-design-system/metadata/footer.json`.
The component preview above and the expandable examples below both use the
canonical fixture; the examples provide copyable markup for both densities.

The documentation site's own footer uses a static, contact-focused Compact
layout from the [website mockup](https://www.figma.com/design/JLCOTY9jAy5g6vms27Uth4/CDS-Website?node-id=12450-7265).
It includes Contact Us links, State policies, copyright, and the current
development release. The Google Space link is omitted until a destination is
available. Its container aligns with the header and main
content at a maximum of 80rem (1280px), including 32px side gutters.
Links retain 48px touch targets even though the mockup shows tighter rows.
Consumers can choose their own container width;
the fixture's `grid-container` uses the default USWDS width.

## Variants and public classes

| Variant | USWDS modifier     | CoDS modifier          | Use                                                             |
| ------- | ------------------ | ---------------------- | --------------------------------------------------------------- |
| Full    | `usa-footer--big`  | `cods-footer--full`    | Categorized service navigation, contact links, and social links |
| Compact | `usa-footer--slim` | `cods-footer--compact` | A shorter, ungrouped list for smaller or task-focused sites     |

The `cods-footer` class provides responsive layout, Colorado token colors,
link/focus treatment, and touch-sized social links. Social links appear under
Contact Us in Full; Compact has no social links. Group links remain ordinary
HTML anchors. Full group headings become buttons at narrow widths; they use
USWDS's disclosure behavior.

Below 480px, Full groups share single-pixel separators with no space above the
first group. Expanded links align with the heading text, after the chevron and
its gap. Without JavaScript, the links remain visible and align with the static
headings. Below 640px, legal links stack vertically in both variants and in the
documentation site's footer.

The primary and secondary surfaces default to the semantic
`--cods-color-surface-nav-secondary` and `--cods-color-surface-nav-heel` tokens.
Legal links use `--cods-color-text-primary` by default, while the primary
navigation uses the secondary-action text color.
Consumers can override the surfaces on the footer with
`--cods-footer-primary-background` and `--cods-footer-secondary-background`;
check text and focus contrast when changing either surface. Forced-colors mode
uses system colors regardless of these overrides.

## Accessibility and localization

The footer is a contentinfo landmark. Give it a concise accessible name when
another footer landmark exists on the page. Use separately named `<nav>`
landmarks for the primary, social (Full only), and legal links; link text or
accessible names must describe their destinations. Full disclosure buttons
expose `aria-expanded` and `aria-controls` at narrow widths. Section headings
should match the surrounding page's heading hierarchy.

Full emits a bubbling, non-composed `cods-footer:change` event after a group
changes. Its `detail` contains the group key and expanded state.

Link targets have a minimum 48px block size, and visible keyboard focus uses
approved focus tokens. The grids reflow at narrow widths; text wraps without
truncation. Check longer translations and right-to-left content with the
consumer's actual copy. The disclosure behavior has no animation.

## Known limitations and implementation status

- **Status:** implemented as an experimental component in the `0.x`
  development series. The source fixture, package assets, Storybook variants,
  and docs examples share the same full and compact markup.
- USWDS's Footer behavior supports one Full footer per document; `initFooter`
  warns and leaves markup unchanged when multiple Full footers are present.
- The fixture contains illustrative Colorado destinations and social profile
  URLs; consumers must verify and replace them for their agency.
- Screen-reader and actual 400% zoom/manual forced-colors review and design
  approval remain required before stable maturity.
- Markup and package paths may change before `1.0`.

## Manual review checklist

- With VoiceOver/Safari or NVDA/Firefox, navigate the contentinfo and navigation
  landmarks; verify distinct names, heading order, and social link names.
- At 320px-equivalent reflow and actual 400% zoom, check every link and group.
- In operating-system high contrast, check text, link, boundary, and focus
  visibility.
- Review long translated labels and right-to-left content with localization
  and content reviewers.

Record browser and assistive-technology versions and observations in the
component evidence file before accessibility approval.
