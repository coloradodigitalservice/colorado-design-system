---
title: In-Page Alert
description: Contextual information, success, warning, and urgent notices.
navLabel: In-Page Alert
order: 19
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2769-6573
---

## When to use

Use In-Page Alert beside the form, task, or section its message concerns. Use
[Site Alert](../site-alert/) for a sitewide outage or emergency near the page header.
Use a toast for transient notifications; in-page alerts remain visible until the
application replaces them. This experimental static component has no dismissal,
controller, timeout, persistence, or custom events.

Info explains requirements; success confirms completion; warning describes a
condition requiring attention; urgent communicates rare, time-sensitive service information.
Use Urgent rarely. Do not use Info for warning or urgent content, or Warning for urgent content.
Always state severity in text, even when omitting the heading. Four distinct
Phosphor Regular icons (`info`, `check-circle`, `warning`, and `warning-circle`) and
token colors supplement that wording. USWDS still supplies the alert structure; the
shared CoDS icon pipeline supplies the artwork. Icons are decorative CSS masks: the message remains
understandable with styles disabled.

## Use the package

Load the token and component stylesheets as described in [Getting started](../getting-started/).
Keep the USWDS root → body → optional heading and paragraph structure in the
copyable examples. Retain both `usa-` and `cods-` classes. Choose a heading level
appropriate to the surrounding content. Heading-only and body-only examples are
provided; never render an empty message. Replace example links with useful service
or recovery actions. No JavaScript import is required.

The package exports the canonical fixture at
`@coloradodigitalservice/colorado-design-system/fixtures/in-page-alert.html`,
examples at `@coloradodigitalservice/colorado-design-system/examples/in-page-alert.json`,
and metadata at `@coloradodigitalservice/colorado-design-system/metadata/in-page-alert.json`.
This page and Storybook share those examples.

## Live regions and dynamic updates

| When the message appears                                | Role                | Application responsibility                                                                  |
| ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| Initial server render                                   | No live-region role | Place it near the relevant content; let people encounter it in reading order.               |
| Nonurgent dynamic update (info, success, most warnings) | `role="status"`     | Mount an empty region first, then update its content; status implies polite announcement.   |
| Urgent dynamic message requiring immediate attention    | `role="alert"`      | Mount an empty region first, then update its content; alert implies assertive announcement. |

Severity alone does not determine announcement urgency. Do not add live-region
roles to every static notice or insert a prepopulated live region and assume it
will announce reliably. The dynamic fixture examples show the final message
markup; the Dynamic Status and Dynamic Alert stories demonstrate the empty-region
then content-update sequence using a button. Actual announcements require human
screen-reader verification. The component never moves focus automatically.

For a form validation summary, link each error to its field and associate inline
errors with their controls. Decide focus management at the form level with an
accessibility reviewer; check for duplicate speech when combining focus with
assertive announcements.

## Public styling

Pair `usa-alert--info`, `--success`, `--warning`, or `--error` with the matching
`cods-in-page-alert--info`, `--success`, `--warning`, or `--urgent` modifier, respectively.
Default uses info. The root is `cods-in-page-alert`; child classes are
`cods-in-page-alert__body`, `__heading`, `__text`, and `__link`.
Fixture data attributes are review labels, not controller hooks.

| Custom property                   | Default                          |
| --------------------------------- | -------------------------------- |
| `--cods-in-page-alert-background` | `--cods-color-bg-alert-info`     |
| `--cods-in-page-alert-accent`     | `--cods-color-border-alert-info` |
| `--cods-in-page-alert-color`      | `--cods-color-text-primary`      |
| `--cods-in-page-alert-padding`    | `--cods-space-md`                |
| `--cods-in-page-alert-icon-size`  | `--cods-space-xl`                |
| `--cods-in-page-alert-inset`      | `--cods-space-sm`                |

Warning uses `bg-alert-warning` / `border-alert-warning`; urgent uses
`bg-alert-urgent` / `border-alert-urgent`. Success uses the existing
`bg-alert-success` / `border-alert-success` aliases. These are implementation mappings
from the extended token catalog, pending design review. Override properties on
the root or classes in consumer CSS, keeping text, links, icons, and focus readable.
The shipped stylesheet references the shared Phosphor Regular assets; preserve the
package's `icons/`, `img/`, and `fonts/` directories beside the stylesheet when
copying release assets. Severity artwork remains decorative and uses the existing
32px headed icon box, 24px compact icon box, logical placement, and foreground tokens.

## Accessibility and review status

Links use native keyboard navigation and approved focus tokens. Logical layout
supports RTL; long words wrap at narrow widths. No animation is introduced.
Forced colors use system colors for boundaries, icons, text, and links.
Spanish and Arabic examples are illustrative and need content review.

Maturity remains **experimental**. Figma was inspected on 2026-10-21 (frame
3583:10290). Headed alerts use 32px icons, 12px leading inset, and 16px vertical
padding; without headings they use 24px icons and 8px vertical padding. The
`cods-in-page-alert--no-icon` modifier removes the decorative icon and its
reserved space; pair it with `usa-alert--no-icon`. The ticket-required success
variant extends the three variants shown in Figma and still needs design review.
Keep messages short and plain; add a heading when the message exceeds roughly
two lines. Avoid stacking notices or showing the same notice on every page. Manual static and dynamic
screen-reader announcements, actual 400% browser zoom, OS high contrast, translated
content, and design/accessibility owner approval remain open. See the component
summary for the evidence file. Dismissal is optional in CDS-52 and is deferred. The Storybook criterion for examples with and without a dismiss control is not applicable until dismissal is implemented.

## More examples
