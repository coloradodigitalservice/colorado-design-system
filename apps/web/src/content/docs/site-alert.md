---
title: Site Alert
description: Static sitewide informational and emergency notices.
navLabel: Site Alert
order: 20
---

Site Alert communicates a sitewide service update or emergency. It is the
static vertical slice selected for CODS-P2-001 on October 1, 2026.
Its maturity is **experimental** in the `0.0.x` development series.

Place the notice near the top of the page, after the skip link. Use one alert
per page in production. Write a specific heading and a useful action link.
Prefix urgent headings with “Emergency” so severity does not depend on color.
The examples below show all fixture states together for review.

## Use the package

Load `@coloradodigitalservice/colorado-design-system/styles` once. Author the
USWDS section → alert surface → alert body structure shown in the canonical
fixture, retaining both the `usa-` structural classes and the `cods-` public
classes. There is no JavaScript import, controller, dismissal, or custom event.
Use `aria-labelledby` with a unique heading ID and choose the heading level
that fits your page. The static region intentionally has no live-region role;
if your application inserts urgent content at runtime, review announcement
behavior separately with accessibility reviewers.

The shipped examples are available at
`@coloradodigitalservice/colorado-design-system/fixtures/site-alert.html` and
metadata at `@coloradodigitalservice/colorado-design-system/metadata/site-alert.json`.
Storybook and this page import that same package fixture. Replace example
content and links with service-specific copy; use unique IDs if repeating it.

## States and public customization

Default and informational notices share the same presentation. Add
`cods-site-alert--emergency` alongside `usa-site-alert--emergency` for an
emergency; otherwise use `usa-site-alert--info`. This slice uses USWDS's
`usa-site-alert--no-icon` option, avoiding a decorative asset dependency.
Long content, Spanish, Arabic/right-to-left, and keyboard focus are included.
Disabled, loading, empty, and dismissed states do not apply to this static notice.

| Public class                 | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `cods-site-alert`            | Root section                                           |
| `cods-site-alert--emergency` | Emergency accent; pair with explicit emergency wording |
| `cods-site-alert__surface`   | Inner USWDS alert container                            |
| `cods-site-alert__body`      | Content padding                                        |
| `cods-site-alert__heading`   | Visible region heading                                 |
| `cods-site-alert__text`      | Notice paragraph                                       |
| `cods-site-alert__link`      | Native action link with focus indication               |

| Custom property                | Default approved token                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `--cods-site-alert-background` | `--cods-color-bg-surface-secondary`                                                      |
| `--cods-site-alert-color`      | `--cods-color-text-primary`                                                              |
| `--cods-site-alert-accent`     | `--cods-color-border-action-secondary`; emergency uses `--cods-color-border-form-danger` |
| `--cods-site-alert-padding`    | `--cods-space-lg`                                                                        |

Set these properties on the root or override classes in `cods.utilities`.
Keep customized text, links, and focus indicators accessible against the chosen
background. Both severities use the approved neutral surface: no new severity
color values are introduced. Internal `usa-` classes and the
`data-cods-site-alert-fixture` review labels are not behavior APIs.

## Accessibility and localization

The named section remains readable with CSS and JavaScript disabled. Only links
receive keyboard focus; the notice never takes focus automatically. There is no
animation. Logical borders and wrapping support narrow widths, translated text,
and right-to-left content. Forced colors use system text, link, and border colors.
Manual screen-reader and actual 400% zoom verification, content/design review,
and G2 approval remain required before stable maturity or gate sign-off.

## Rendered canonical fixture
