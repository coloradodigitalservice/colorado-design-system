---
title: Site Alert
description: Static sitewide informational and emergency notices.
navLabel: Site Alert
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2769-6573
---

## When to use

Use Site Alert for a sitewide service update or emergency that applies to every
visitor, such as an outage or closure. Do not use it for messages about one form
or task (put those near the content they affect), for confirmation of a user
action, or for content people must dismiss or act on immediately; this static
notice has no dismissal and is not announced automatically.

Place the notice near the top of the page, after the skip link. Use one alert
per page in production. Write a specific heading and a useful action link.
Prefix urgent headings with “Emergency” so severity does not depend on color.
The example above shows the default notice. More examples below cover the other fixture states.

## Anatomy

1. **Root section** (`cods-site-alert`): a named region.
2. **Surface** (`cods-site-alert__surface`): the inner USWDS alert container.
3. **Body** (`cods-site-alert__body`): padding for the content.
4. **Heading** (`cods-site-alert__heading`): visible name of the region; its ID is referenced by `aria-labelledby`.
5. **Text** (`cods-site-alert__text`): the notice paragraph.
6. **Link** (`cods-site-alert__link`): one native action link.

## Use the package

Follow [Getting started](/getting-started/) to install the development release
and load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and
`@coloradodigitalservice/colorado-design-system/styles.css` once. Author the
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

## Known limitations and implementation status

- **Status:** implemented as a G2 vertical-slice component at **experimental**
  maturity. Automated accessibility checks, Storybook parity checks, and the
  author's manual keyboard, VoiceOver/Safari, Firefox zoom, and reduced-motion
  reviews are recorded in the evidence file. Accessibility lead approval and G2
  sign-off are pending.
- No dismissal, icon, or live-region announcement. The no-icon USWDS option
  avoids a decorative asset dependency.
- No new severity colors: informational and emergency notices share the neutral
  surface, so severity must be stated in the heading text.
- Actual Windows forced-colors review and translated-content review are open.
- Markup, custom properties, and package paths may change before `1.0`.

## Manual review checklist

Use the examples to complete the remaining accessibility review:

- With VoiceOver/Safari or NVDA/Firefox, navigate by regions and headings, check
  distinct names, and verify Spanish and Arabic content uses the expected language.
- At actual 400% browser zoom, confirm all notice text and links remain usable.
- In operating-system high contrast, check readable text, visible boundaries,
  severity wording, and keyboard focus.
- Confirm translated service copy and links with content reviewers.

Record the browser/assistive-technology versions and observations in the
component evidence file before accessibility approval.

## More examples
