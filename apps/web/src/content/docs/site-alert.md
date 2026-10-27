---
title: Site Alert
description: Sitewide informational, warning, and emergency notices.
navLabel: Site Alert
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1809-10566
---

## When to use

Use a Site Alert for a sitewide outage, emergency, closure, or service update that applies to every visitor. Use [In-Page Alert](../in-page-alert/) for a message about a specific form, task, or page. Show one notice per page, keep it short and scannable, and remove it when it expires. The long-content example tests wrapping; it is not recommended production copy.

Informational notices use a pale blue surface; warnings use yellow. Both are text-only, with an inline bold lead-in. Emergency notices use a red surface, a visible heading, and a decorative warning icon. Use clear wording and useful action links so meaning does not depend on color or an icon.

## Placement and landmarks

Place the notice outside a narrow content column, between the skip link and the page header. Keep the skip link first so visitors can bypass the notice and navigation. The notice is a named section, not a second banner landmark. Give each section a unique `aria-labelledby` pointing to its visible lead-in or heading. Choose a heading level that fits the page.

## Use the package

Load token and component styles as described in [Getting started](../getting-started/). Keep the USWDS section, alert surface, and alert body structure and the `usa-` and `cods-` classes in the copyable examples. The fixture, metadata, and examples are available under `fixtures/site-alert.html`, `metadata/site-alert.json`, and `examples/site-alert.json` in the design-system package. No JavaScript is required.

The emergency icon uses the packaged Phosphor Regular `warning.svg` as a decorative CSS mask. Preserve the package's `icons/`, `img/`, and `fonts/` layout when serving CSS directly.

## Initial render and dynamic announcements

Notices present on page load are named regions without a live-region role. They do not move focus or force an announcement. For notices updated after load, mount an empty live region first, then populate it. Use `role="status"` for nonurgent updates and `role="alert"` only for urgent information requiring immediate awareness. Test announcements with the application's screen-reader and browser combinations.

## Public styling and states

| Class                        | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `cods-site-alert`            | Full-width named section              |
| `cods-site-alert--warning`   | Warning surface                       |
| `cods-site-alert--emergency` | Emergency surface and decorative icon |
| `cods-site-alert__surface`   | Inner alert surface                   |
| `cods-site-alert__body`      | Centered content and spacing          |
| `cods-site-alert__heading`   | Visible emergency heading             |
| `cods-site-alert__text`      | Notice text                           |
| `cods-site-alert__link`      | Action link                           |

The examples include long content, Spanish, Arabic/RTL, and keyboard focus. Disabled, loading, and empty notices are not useful states. The content container is centered with a maximum width of 1280px and has 32px desktop and 16px mobile insets.

The root exposes `--cods-site-alert-background`, `--cods-site-alert-color`, `--cods-site-alert-icon-color`, `--cods-site-alert-padding`, `--cods-site-alert-link`, `--cods-site-alert-link-hover`, `--cods-site-alert-link-active`, and `--cods-site-alert-focus` for customization. Check text, link, icon, and focus contrast after customizing them.

## Accessibility and localization

**Experimental, `0.x`.** Human screen-reader, keyboard, actual 400% zoom, operating-system high-contrast, localization, and design review remain open for this revision. Use descriptive links, translate the full notice, and verify bidirectional content with representative readers. Forced colors use system colors; text communicates the notice meaning without relying on color.

## More examples
