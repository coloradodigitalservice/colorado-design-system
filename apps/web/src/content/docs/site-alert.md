---
title: Site Alert
description: A sitewide informational, warning, or emergency notice shown above the page header.
navLabel: Site Alert
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1809-10566
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.
---

## Guidance

### When to use

Use a Site Alert for an outage, emergency, closure, or service update that applies to everyone visiting the site.

Don't use a Site Alert when:

- The message is about a specific form, task, or page. Use [In-Page Alert](../in-page-alert/) for contextual messages instead.
- Another Site Alert is already showing. Show one notice per page.
- The notice has expired. Remove it as soon as it no longer applies.

Choose a variant that matches the urgency of the message:

| Variant                 | Use when                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Informational (default) | Sharing a sitewide service update, such as scheduled maintenance or office hours. Pale blue, text-only.  |
| Warning                 | Visitors need to know about a disruption or change, such as early closures. Yellow, text-only.           |
| Emergency               | Something urgent affects everyone, such as a service interruption. Red, with a heading and warning icon. |

### Writing for site alerts

- Keep the notice short and scannable. Long messages are supported, but they push the page down for everyone.
- Start informational and warning notices with a short bold lead-in that names the topic, such as "Service update:".
- Give emergency notices a heading that names the emergency, such as "Emergency: service interruption".
- Include a link when people can act on the notice or find more information. Write link text that makes sense on its own.

### Accessibility for site alerts

- Place the notice between the skip link and the page header, outside any narrow content column. Keep the skip link first so keyboard and screen-reader users can bypass the notice and navigation.
- Each notice is a `section` named by its visible lead-in or heading. Point `aria-labelledby` at that element and give every notice a unique `id`. The notice is a named region, not a second banner landmark.
- Choose a heading level for the emergency heading that fits the page outline.
- Notices present when the page loads have no live-region role. They don't move focus or force an announcement.
- If your application adds a notice after the page loads, mount an empty live region first, then fill it. Use `role="status"` for nonurgent updates and `role="alert"` only for urgent information. Test announcements with the screen readers and browsers your audience uses.
- Don't rely on color or the icon alone. The lead-in, heading, and message text must communicate the notice's meaning and urgency.
- Links are the only focusable elements. They use the Colorado focus ring, and system colors in forced-colors mode.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                        | Use                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `cods-site-alert`            | Full-width named `section` (informational by default); pair with `usa-site-alert`.                          |
| `cods-site-alert--warning`   | Warning surface; keep `usa-site-alert--info` on the root.                                                   |
| `cods-site-alert--emergency` | Emergency surface and decorative icon; pair with `usa-site-alert--emergency`.                               |
| `cods-site-alert__surface`   | Inner alert surface; pair with `usa-alert`.                                                                 |
| `cods-site-alert__body`      | Centered content, up to 1280px wide, with 32px desktop and 16px mobile insets; pair with `usa-alert__body`. |
| `cods-site-alert__heading`   | Visible emergency heading; pair with `usa-alert__heading`.                                                  |
| `cods-site-alert__text`      | Notice text, including the bold lead-in; pair with `usa-alert__text`.                                       |
| `cods-site-alert__link`      | Action link; pair with `usa-link`.                                                                          |

The root also carries `data-cods-site-alert`. No JavaScript is required.

### Placing the notice

Put the notice directly after the skip link and before the site header:

```html
<a href="#main-content">Skip to main content</a>
<section
  class="usa-site-alert usa-site-alert--info cods-site-alert"
  data-cods-site-alert
  aria-labelledby="site-alert-heading"
>
  …
</section>
<header>…</header>
<main id="main-content" tabindex="-1">…</main>
```

### Loading styles and the icon

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The emergency icon is the packaged Phosphor Regular `warning.svg`, applied as a decorative CSS mask. When serving the CSS directly, keep the package's `icons/`, `img/`, and `fonts/` folders next to it.

### Variable settings

Set these on a root to adjust the approved token-based values:

| Custom property                 | Default                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `--cods-site-alert-background`  | Surface, `color.bg-alert-info` (warning and emergency set their own)          |
| `--cods-site-alert-color`       | Text, `color.text-primary` (emergency uses `color.text-action-primary`)       |
| `--cods-site-alert-link`        | Link, `color.text-action-link`                                                |
| `--cods-site-alert-link-hover`  | Link hover, `color.text-action-link-hover`                                    |
| `--cods-site-alert-link-active` | Link active, `color.text-action-link-active`                                  |
| `--cods-site-alert-icon-color`  | Emergency icon, `color.icon-default` (emergency uses `color.icon-on-primary`) |
| `--cods-site-alert-focus`       | Link focus ring, `color.bg-action-focus`                                      |
| `--cods-site-alert-padding`     | Inline inset, `space.xl` (`space.md` below 48rem)                             |

Check text, link, icon, and focus contrast after changing them.

### Limitations

- Site Alert is static. It has no close button, so notices can't be dismissed and no dismissed state is saved.
- Showing more than one Site Alert at a time isn't supported.
- The component doesn't add or announce notices after page load. Your application manages any live region.
