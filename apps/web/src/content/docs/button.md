---
title: Button
description: Native action buttons, variants, sizing, and navigation links.
navLabel: Button
order: 40
---

Use a Button to perform an action: submit a form, save changes, or open a dialog.
Use a Link to navigate to another page. A button-styled `<a href>` is appropriate
for a prominent navigation call to action, such as starting an application; it
retains link semantics and Enter activation. Never put `role="button"` on that
anchor. Ordinary navigation belongs to the Link component.

Button is **experimental** in the `0.x` series. It is a static USWDS 3.14.0 themed
component; no controller or JavaScript import is required. Native browser behavior
provides activation and form submission. Toggle buttons, groups, and loading
states are outside this component's scope.

## Use the package

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and
`@coloradodigitalservice/colorado-design-system/styles` once. Retain `usa-button`
alongside `cods-button`. Use `type="button"` for actions and `type="submit"` for
form submission. Provide a descriptive visible label. The examples below and
Storybook use the shipped fixture at
`@coloradodigitalservice/colorado-design-system/fixtures/button.html`; metadata
is available at `@coloradodigitalservice/colorado-design-system/metadata/button.json`.
Expand “View and copy HTML” to copy each example's canonical markup.

## Variants and sizing

| CoDS class               | Usage and paired USWDS class                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `cods-button`            | Primary action; `usa-button`                                      |
| `cods-button--secondary` | Lower emphasis, solid neutral surface; `usa-button--outline`      |
| `cods-button--outline`   | Lower emphasis, transparent surface; `usa-button--outline`        |
| `cods-button--ghost`     | Minimal emphasis; `usa-button--unstyled`                          |
| `cods-button--danger`    | Destructive action with explicit wording; `usa-button--secondary` |
| `cods-button--small`     | Compact spacing and UI text; combine with any visual variant      |
| `cods-button--icon-only` | Square icon action; provide an accessible name                    |
| `cods-button__icon`      | Decorative SVG with `aria-hidden="true"` and `focusable="false"`  |

Use one visual variant at a time. Default buttons have a 48px minimum height;
small buttons have a 32px minimum height, both from the approved spacing scale.
Allow room between targets and choose default size for touch-heavy interfaces.
Text wraps and buttons grow for longer labels; do not truncate action labels.

Icon-only buttons **require** `aria-label` or visually hidden text describing the
action. A tooltip or decorative SVG alone does not provide a name. The canonical
example uses `aria-label="Add application"`; translate that name with the UI.

Use the native `disabled` attribute on `<button>` to prevent activation and remove
it from sequential keyboard focus. `aria-disabled` alone does not stop clicks or
keyboard activation. Anchors have no native disabled state: omit unavailable
navigation or show explanatory text instead of an inert button-styled link.

## States and customization

Hover, active, focus-visible, and disabled styles use the approved action, focus,
and disabled tokens. Secondary, outline, and ghost share the secondary action
palette; danger uses the danger palette. The `cods-button--hover` and
`cods-button--active` classes in demonstration markup preview states only; use
real pointer and keyboard interactions in production. `data-cods-button-fixture`
labels examples for review and is not a behavior API.

| Custom property            | Default token                           |
| -------------------------- | --------------------------------------- |
| `--cods-button-background` | `--cods-color-bg-action-primary`        |
| `--cods-button-color`      | `--cods-color-text-action-primary`      |
| `--cods-button-hover`      | `--cods-color-bg-action-primary-hover`  |
| `--cods-button-active`     | `--cods-color-bg-action-primary-active` |

Variant classes select corresponding palette tokens. Consumer overrides must
preserve text, boundary, and focus contrast on the actual containing surface.
Outline and ghost examples assume a light background. Forced colors preserve
native system colors and visible boundaries. Buttons have no animation.

## Accessibility and review

Tab and Shift+Tab follow document order, skipping disabled buttons. Enter and
Space activate native buttons; Enter activates links. Actions do not move focus
by themselves. Application dialogs, confirmations, and errors must manage focus
and announcements in their own flows.

Long Spanish labels and Arabic RTL content are included below. Translate both
visible text and accessible names, and set the appropriate `lang` and `dir`.
Human screen-reader checks, actual 400% browser zoom, Windows high contrast,
State accessibility approval, and design/content review remain pending. Record
those observations in the Button accessibility evidence before stable approval.

## Examples
