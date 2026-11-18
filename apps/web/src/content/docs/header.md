---
title: Header
description: Colorado-themed site identity and primary navigation with a mobile menu.
navLabel: Header
order: 49
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1100-8319
---

## Guidance

### When to use

Use the Header at the top of every page in a site to identify the site and
link to its main sections.

| Use when                                                             | Don't use when                                                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| The site has a handful of top-level sections, ideally seven or fewer | The sections need a second level of links; dropdown and mega-menu navigation is a future pattern   |
| You need the site's or agency's logo linked to its home page         | You want to link to sections of the current page; use [In-Page Navigation](../in-page-navigation/) |
| One header identifies the whole page                                 | A page region needs its own heading bar; use a heading instead of a second Header                  |

### Writing for headers

Navigation labels should be:

- **Clear:** match each label to the title of the page it opens.
- **Concise:** aim for one to three words so labels stay easy to scan in the
  mobile menu. When a page title is long, use a shortened label.
- **Sentence case:** capitalize the first word and proper nouns only.

Name the navigation with a short, unique label such as "Primary". Don't include
the word "navigation"; screen readers already announce the role.

### Accessibility for headers

- Tab and Shift+Tab move through the logo link and navigation links in order.
- Below 1024px, Enter or Space on Menu opens the drawer and moves focus to
  Close. Tab stays inside the open drawer, and Escape, Close, the overlay, or
  following a link closes it and returns focus to Menu.
- Mark the current section's link with `aria-current="page"`. It also gets a
  4px indicator bar and, in the drawer, semibold text, so it doesn't rely on
  color alone.
- Every link and button has a 48px minimum target and a visible focus
  indicator.
- Use one Header per page. A `<header>` that isn't inside `<main>`,
  `<article>`, or another sectioning element is exposed as the page's banner
  landmark.
- Pair the Header with a skip link; see
  [Skip link integration](#skip-link-integration).

## Specifications

### Classes

| Class                      | Use                                                              |
| -------------------------- | ---------------------------------------------------------------- |
| `cods-header`              | The `<header>` element; pair with `usa-header usa-header--basic` |
| `cods-header__home`        | The logo link to the site's home page; carries the `aria-label`  |
| `cods-header__logo-image`  | The logo image, scaled to at most 48px tall                      |
| `cods-header__menu-button` | Opens the drawer below 1024px; pair with `usa-menu-btn`          |
| `cods-header__nav`         | The labelled `<nav>`; pair with `usa-nav`                        |
| `cods-header__link`        | A navigation link; pair with `usa-nav-link`                      |
| `cods-header__close`       | Closes the drawer; pair with `usa-nav__close`                    |
| `cods-header__overlay`     | The page overlay behind the drawer; pair with `usa-overlay`      |

Keep the USWDS classes alongside the `cods-header` classes; the USWDS behavior
selects on them. Mark the current link with `aria-current="page"` and
`usa-current`.

### Use your own logo

The logo is a drop-in slot. Any team using the design system can show its own
approved logo by changing three things in the logo link:

- the image `src` to your logo file (SVG preferred);
- the image `width` and `height` to your file's intrinsic size, so the page
  does not shift while it loads;
- the link's `aria-label` to "&lt;Site or agency name&gt; home".

```html
<a class="cods-header__home" href="/" aria-label="Department of Revenue home">
  <img
    class="cods-header__logo-image"
    src="/assets/dor-logo.svg"
    alt=""
    width="240"
    height="48"
  />
</a>
```

The header scales any logo to at most 48px tall and the available width, so no
CSS changes are needed. Keep the image's `alt` empty: the link's `aria-label`
names it once. Use only logos your agency is approved to use; see
[Logos](../logos/) for brand rules.

### Use the package

Follow [Getting started](../getting-started/) to load
`@coloradodigitalservice/colorado-design-tokens/tokens.css` and
`@coloradodigitalservice/colorado-design-system/styles.css` once. Use the
canonical fixture below as a starting point and keep USWDS's `usa-header`,
`usa-header--basic`, `usa-nav`, and related classes alongside the public
`cods-header` classes; the USWDS behavior selects on them.

Copy `dist/logos/cods-logo.svg` and `dist/icons/sprite.svg` from the package
to your site's public assets and update the example paths. The menu button's
`aria-controls` must name the navigation's `id`, and the navigation needs an
accessible name.

Initialize the header after it is in the document, and destroy it before
removing or replacing the markup:

```ts
import {
  destroyHeader,
  initHeader,
} from '@coloradodigitalservice/colorado-design-system';

const header = document.querySelector('[data-cods-header]');
if (header instanceof HTMLElement) initHeader(header);

// Before removing or replacing the header:
if (header instanceof HTMLElement) destroyHeader(header);
```

Without JavaScript, every navigation link stays visible in the page flow at all
widths and the Menu and Close buttons are hidden. The controller adds
`data-cods-header-enhanced` once the header is enhanced; do not author or
style that attribute.

### Skip link integration

The Header does not include a skip link; it belongs in the page template so
it is the first focusable element on the page. Place it before the header and
target the page's `<main>` landmark:

```html
<a class="usa-skipnav" href="#main-content">Skip to main content</a>
<header class="usa-header usa-header--basic cods-header" data-cods-header>
  …
</header>
<main id="main-content" tabindex="-1">…</main>
```

`tabindex="-1"` lets browsers move focus to `<main>` when the link is
followed, so the next Tab continues from the main content rather than the
header.

### Mobile menu behavior

Below 1024px, the Header uses the pinned USWDS header behavior. Activating
Menu opens the navigation as a drawer over a page overlay, sets the menu
button's `aria-expanded` to `true`, and moves focus to Close. While the drawer
is open:

- Tab and Shift+Tab cycle through the drawer's Close button and links.
- The rest of the page is hidden from assistive technology with `aria-hidden`.
- Escape, Close, the overlay, or following a navigation link closes the drawer
  and returns focus to Menu.
- Widening the window past 1024px closes the drawer.

The drawer keeps focus inside it on purpose. It covers the page like a dialog,
so focus and screen-reader access are confined to the visible drawer instead of
reaching links hidden behind the overlay. This is the explicit,
documented exception to the Header ticket's "no modal-style focus trapping"
default; it reuses USWDS's own behavior rather than reimplementing it.

The Header emits bubbling, non-composed `cods-header:open` and
`cods-header:close` events after the drawer opens or closes. Their `detail` is
`{ open: boolean }`.

### Scope and related navigation

The Header covers site identity, a single level of primary navigation links,
and the mobile menu. These are separate patterns and are not part of this
component:

- **Dropdown and mega-menu navigation** (multi-level primary navigation shown
  in the Figma file): a future navigation pattern.
- **In-page navigation**: use [In-Page Navigation](../in-page-navigation/) to
  link to sections of the current page.
- **Search** in the header: use the [Search](../search/) component on its own
  until a header integration is designed and approved.
- **Translate** link or language selector in the header: pending the Language
  Selector component.

## Known limitations and implementation status

- **Status:** implemented as an experimental component in the `0.x`
  development series.
- USWDS's header behavior keeps module-level state and finds the header with
  document-wide selectors, so it supports one Header per document. `initHeader`
  warns and leaves the markup unchanged when more than one `.usa-header` is
  present.
- The behavior adds classes and inline padding to `<body>` and listens for
  window resize and document key events while the drawer is open. These are
  USWDS's own behavior; `destroyHeader` closes an open drawer and removes the
  listeners.
- The Figma tablet layout (search above the navigation) is not implemented;
  tablets use the mobile drawer below USWDS's 1024px header breakpoint.
- The package ships only the CoDS logo. Agency lockups shown in Figma, such as
  the Department of Revenue, are supplied by each agency through the logo slot
  and are not bundled.
- Screen-reader, actual 400% zoom, and manual forced-colors review, plus design
  approval, remain required before stable maturity.
