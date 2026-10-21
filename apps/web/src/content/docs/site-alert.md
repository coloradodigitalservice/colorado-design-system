---
title: Site Alert
description: Full-width sitewide informational and emergency notices with optional dismissal.
navLabel: Site Alert
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1809-10566
---

## When to use

Use Site Alert for a sitewide outage, emergency, closure, or service update that
applies to every visitor. Use In-Page Alert for a message about
one form, task, or page section. A Site Alert fills its containing width; place
it outside a narrow content column to create a full-width banner. Show one site
alert per page. Multiple-alert stacking and cross-page dismissal persistence
are outside this component's scope.

Informational notices use the shared Phosphor Regular `info` icon and pale blue
surface. Emergency notices use `x-circle` and a bold red surface with white text.
USWDS supplies the alert structure; the CoDS pipeline supplies the decorative SVG
masks in the existing 32px icon boxes. Write an explicit
“Information” or “Emergency” heading so severity remains understandable without
color or icons. Use specific service copy and useful action links.

## Placement and landmarks

Keep this document and keyboard order:

1. Skip link, pointing directly to the main content.
2. Site Alert, a named section outside the header and main landmarks.
3. Page header and primary navigation.
4. Main content, with a stable ID and `tabindex="-1"` when it is a focus destination.
5. Footer.

Keep the skip link first and visible when focused. A visitor who follows it
should bypass the banner and navigation without being forced to dismiss a
notice. The section's `aria-labelledby` names the region using its visible
heading; it is not a second `banner` landmark. Choose a heading level that fits
the page and use unique heading and destination IDs.

The documentation renders multiple examples inside its article for comparison;
that workbench arrangement is not production placement guidance.

## Use the package

Load the token and component styles as described in [Getting started](../getting-started/).
Keep the USWDS section → alert surface → alert body structure and both `usa-`
and `cods-` classes from the copyable examples. Packaged fixtures, metadata, and
per-state examples are available under `fixtures/site-alert.html`,
`metadata/site-alert.json`, and `examples/site-alert.json` in
`@coloradodigitalservice/colorado-design-system`.

The stylesheet uses shared Phosphor Regular `info.svg` and `x-circle.svg` masks.
Preserve the package's `icons/`, `img/`, and `fonts/` layout when serving CSS directly.
Icons are decorative CSS masks; the visible severity wording communicates meaning
with CSS or JavaScript disabled.

## Initial render and dynamic announcements

Notices present when the page loads are named regions with no live-region role.
They are available in normal reading, heading, and region navigation. An emergency
color does not justify moving focus or forcing an assertive announcement on reload.
Human screen-reader testing must confirm the page's initial reading experience.

For a notice updated after page load, mount an empty live region first, then
populate it. Use `role="status"` for a nonurgent service update and `role="alert"`
only for urgent information requiring immediate awareness. Do not add a duplicate
live-region role to both the section and its body, and do not rely on inserting
an already populated live region to announce reliably. Test actual announcements
with the application's screen-reader/browser pairings. Dynamic insertion belongs
to the consuming application; the dismissal controller does not generate messages.

## Optional dismissal

Both severities have static and dismissible examples. Keep the native dismissal
button's `hidden` attribute in authored markup. The content remains fully readable
and action links work without JavaScript; the inactive control stays out of the
keyboard order. Initialize after the markup is attached to the document:

```js
import { initAllSiteAlerts } from '@coloradodigitalservice/colorado-design-system';
initAllSiteAlerts();
```

Set `data-cods-site-alert-focus-target` on the root to the ID of a focusable
external element, normally the main content with `tabindex="-1"` or a meaningful
service link after the banner. The example destinations demonstrate that handoff.
The target must be present, enabled, visible, and outside the alert. Initialization
leaves the control hidden and warns once if the destination is missing or invalid.
If a target disappears or cannot receive focus at dismissal time, the notice stays
visible. Focus moves before hiding the banner; initialization never moves focus.

Dismissal lasts only for the current rendered page. No cookies, storage, timers,
or cross-page persistence are used. Avoid making safety-critical content dismissible
unless the service/content owner approves that choice.

| Public API                            | Purpose                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `initSiteAlert(root)`                 | Initialize one attached root; repeated calls are safe                          |
| `initAllSiteAlerts(scope = document)` | Initialize roots in a scope, including a matching root scope                   |
| `destroySiteAlert(root)`              | Remove the listener and restore authored `hidden` attributes                   |
| `data-cods-site-alert`                | Initialization root hook                                                       |
| `data-cods-site-alert-dismiss`        | Native button hook                                                             |
| `data-cods-site-alert-focus-target`   | External focus destination ID                                                  |
| `cods-site-alert:dismiss`             | Bubbling event after dismissal; `detail: { focusTargetId }`, `composed: false` |

There is no USWDS Site Alert JavaScript behavior to wrap. CoDS supplies only the
optional dismissal lifecycle. `destroySiteAlert` restores the readable authored
notice; it does not move focus or emit dismissal events.

## Anatomy

The named section wraps an alert surface and body. Its decorative icon precedes
the visible heading and message; a native action link and optional dismissal
button follow the text.

## Public styling and states

| Public class                 | Purpose                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `cods-site-alert`            | Full-width named section                                                       |
| `cods-site-alert--emergency` | Emergency surface, icon, and foreground; pair with `usa-site-alert--emergency` |
| `cods-site-alert__surface`   | Inner alert surface and top severity boundary                                  |
| `cods-site-alert__body`      | Logical content padding and decorative icon                                    |
| `cods-site-alert__heading`   | Visible section name                                                           |
| `cods-site-alert__text`      | Notice paragraph                                                               |
| `cods-site-alert__link`      | Action link with visible focus                                                 |
| `cods-site-alert__dismiss`   | Optional native dismissal button                                               |

Informational/default examples pair with `usa-site-alert--info`. Do not use
`usa-site-alert--no-icon` in these examples. Long content, Spanish, Arabic/RTL,
keyboard focus, and dismissible variants are included. Disabled, loading, and
empty notices have no useful message and are not component states.

| Custom property                 | Informational default; emergency override                                  |
| ------------------------------- | -------------------------------------------------------------------------- |
| `--cods-site-alert-background`  | `--cods-color-bg-alert-info`; `--cods-color-surface-error-bold`            |
| `--cods-site-alert-color`       | `--cods-color-text-primary`; `--cods-color-text-action-primary`            |
| `--cods-site-alert-accent`      | `--cods-color-border-alert-info`; `--cods-color-surface-error-bold`        |
| `--cods-site-alert-icon-color`  | `--cods-color-icon-default`; `--cods-color-icon-on-primary`                |
| `--cods-site-alert-padding`     | `--cods-space-xl` horizontal inset                                         |
| `--cods-site-alert-link`        | `--cods-color-text-action-link`; `--cods-color-text-action-primary`        |
| `--cods-site-alert-link-hover`  | `--cods-color-text-action-link-hover`; `--cods-color-text-action-primary`  |
| `--cods-site-alert-link-active` | `--cods-color-text-action-link-active`; `--cods-color-text-action-primary` |
| `--cods-site-alert-focus`       | `--cods-color-bg-action-focus`; `--cods-color-text-action-primary`         |

Set properties on the root or override styles in `cods.utilities`. Check text,
links, icons, and focus contrast again after customization. Internal USWDS classes
and fixture labels are not behavior APIs. Git token values remain authoritative.

## Accessibility and localization

**Experimental, `0.x`.** The revised surfaces, typography, icons, and dismissal
require fresh human screen-reader, keyboard, actual 400% zoom, OS high-contrast,
and localization review. Earlier vertical-slice manual evidence applies to that
older implementation only. No stable maturity or gate sign-off is claimed.

Logical padding and icon placement support RTL; text wraps without fixed heights.
Only native links and enhanced dismissal buttons enter keyboard navigation. There
is no motion, auto-dismissal, or timeout. Forced colors use system text/link/focus
colors, retaining both severity wording and the decorative icons.

## Known limitations and implementation status

Exact current Figma alignment remains a design review item: both connected
accounts were blocked during this task. Repository measurements informed the
32px icon and inset, 16px icon gap, 18px vertical padding, and H5 heading. State
design, content, and accessibility owners must review the final examples.

## More examples
