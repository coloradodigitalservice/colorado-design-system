---
title: In-Page Alert
description: Contextual information, success, warning, and urgent notices.
navLabel: In-Page Alert
order: 19
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2769-6573
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader announcements, is pending.
---

## Guidance

### When to use

Use an in-page alert beside the form, task, or section its message concerns, such as requirements to review before starting, confirmation that a step is complete, or a problem that needs attention.

Don't use an in-page alert when:

- The message applies to the whole site, such as an outage or emergency. Use [Site Alert](../site-alert/) near the page header instead.
- The message is a brief, transient notification. In-page alerts stay visible until the application replaces or removes them.
- The same notice would appear on every page, or several notices would stack in one place.

Choose the severity that matches the message:

| Variant | Use when                               | Don't use when                      |
| ------- | -------------------------------------- | ----------------------------------- |
| Info    | Explaining requirements or context.    | The message is a warning.           |
| Success | Confirming a task or step is complete. | The task still needs action.        |
| Warning | A condition needs attention.           | The message is urgent.              |
| Urgent  | Rare, time-sensitive service news.     | The message is routine. Use rarely. |

Add a heading when the message is longer than about two lines. Without a heading, the alert uses a compact layout with a smaller icon. The icon can be removed when it would repeat nearby content; the severity wording stays.

In-page alerts are static and can't be dismissed. Dismissal is deferred and isn't part of this release.

### Writing for in-page alerts

- State the severity in words, for example "Warning: deadline approaching." Color and icons only supplement the text.
- Keep messages short and plain.
- Replace example links with a useful service or recovery action.
- Never render an empty alert; include a heading, a message, or both.

### Accessibility for in-page alerts

- Severity is in the text, so the message is understandable without color, icons, CSS, or JavaScript. Icons are decorative and have no accessible name.
- Links use native keyboard behavior and the Colorado focus ring. The alert itself isn't focusable and never moves focus.
- Choose a heading level that fits the surrounding page outline.
- An alert in the initial page render has no live-region role; people encounter it in reading order.
- For a message added or changed after the page loads, follow [Announcing dynamic updates](#announcing-dynamic-updates). Don't add live-region roles to every static notice.
- For a form error summary, link each error to its field, associate inline errors with their controls, and decide focus management at the form level.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                                         | Use                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `cods-in-page-alert cods-in-page-alert--info` | Info alert (default); pair with `usa-alert usa-alert--info`.                   |
| `cods-in-page-alert--success`                 | Success alert; pair with `usa-alert--success`.                                 |
| `cods-in-page-alert--warning`                 | Warning alert; pair with `usa-alert--warning`.                                 |
| `cods-in-page-alert--urgent`                  | Urgent alert; pair with `usa-alert--error`.                                    |
| `cods-in-page-alert--no-icon`                 | Removes the decorative icon and its space; pair with `usa-alert--no-icon`.     |
| `cods-in-page-alert__body`                    | Message container; pair with `usa-alert__body`.                                |
| `cods-in-page-alert__heading`                 | Optional heading at the level your page needs; pair with `usa-alert__heading`. |
| `cods-in-page-alert__text`                    | Message paragraph; pair with `usa-alert__text`.                                |
| `cods-in-page-alert__link`                    | Link in the message; pair with `usa-link`.                                     |

Headed alerts use a 32px icon. Alerts without a heading use a 24px icon and less vertical padding; no extra class is needed.

### Using the package

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). No JavaScript is required. The stylesheet references the shared icon assets, so keep the package's `icons/`, `img/`, and `fonts/` directories beside it when you copy release assets.

### Announcing dynamic updates

| When the message appears                                   | Role                | Application responsibility                                                   |
| ---------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| Initial page render                                        | No live-region role | Place it near the relevant content.                                          |
| Nonurgent update after load (info, success, most warnings) | `role="status"`     | Mount an empty region first, then update its content. Announced politely.    |
| Urgent update that needs immediate attention               | `role="alert"`      | Mount an empty region first, then update its content. Announced assertively. |

Severity alone doesn't decide announcement urgency. A live region inserted with its content already in place may not be announced, so render the empty region with the page and fill it later:

```html
<div
  class="usa-alert usa-alert--success cods-in-page-alert cods-in-page-alert--success"
  role="status"
>
  <div class="usa-alert__body cods-in-page-alert__body">
    <!-- Insert the heading and message here when the update happens. -->
  </div>
</div>
```

Check for duplicate speech when combining focus changes with assertive announcements.

### Variable settings

Set these on the root to adjust the approved token-based styling:

| Custom property                   | Default                                            |
| --------------------------------- | -------------------------------------------------- |
| `--cods-in-page-alert-background` | Surface, `color.bg-alert-info` for Info            |
| `--cods-in-page-alert-accent`     | Leading border, `color.border-alert-info` for Info |
| `--cods-in-page-alert-color`      | Text and icon, `color.text-primary`                |
| `--cods-in-page-alert-padding`    | Body padding, `space.md`                           |
| `--cods-in-page-alert-icon-size`  | Icon size, `space.xl`                              |
| `--cods-in-page-alert-inset`      | Icon inset from the leading edge, `space.sm`       |

Success, Warning, and Urgent set the background and accent to their matching `bg-alert-*` and `border-alert-*` tokens. Keep text, links, icons, and focus readable when you override them.

### Limitations

- There is no dismiss control, controller, timeout, persistence, or custom event.
- The component doesn't announce or move focus by itself; live-region roles and focus management are the application's responsibility.
- Alerts appear without animation.
