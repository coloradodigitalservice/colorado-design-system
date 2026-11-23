---
title: Button
description: Lets people take an action or make a choice with one click or tap.
navLabel: Button
order: 40
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=808-2014
accessibilityStatus: The preview is checked with axe. Manual accessibility checks were completed on November 23, 2026.
---

## Guidance

### When to use

Use a Button to perform an action: submit a form, save changes, or open a dialog.
Use a [Link](../link/) to navigate to another page. A button-styled `<a href>` is appropriate
for a prominent navigation call to action, such as starting an application; it
retains link semantics and Enter activation. Never put `role="button"` on that
anchor. Ordinary navigation belongs to the [Link component](../link/).

| Type      | Use when                                                                   | Don't use when                                                           |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Primary   | One main action moves the user forward                                     | Multiple actions have equal importance                                   |
| Secondary | A supporting or alternative action accompanies a primary action            | Navigation or a low-priority action would be better served by a link     |
| Danger    | An action is irreversible or could cause data loss or serious consequences | The action is routine, reversible, or only needs confirmation            |
| Icon only | A familiar Search, Close, or Add action needs to save horizontal space     | The icon is ambiguous or an accessible name cannot be provided           |
| Slim      | Space is constrained in headers or utility bars                            | The action is the main page call to action or needs a large touch target |

Allow space between targets and prefer Medium for touch-heavy interfaces.
Slim aligns with 32px inputs for single-line labels.

### Writing for buttons

Make labels clear and predictable: users should know what will happen. Lead
with a verb, usually **{verb} + {noun}**. Familiar actions such as Done, Close,
Cancel, and OK are exceptions. Aim for 1–2 words and no more than 3–5. Use sentence
case, no punctuation, and omit unnecessary articles such as a, an, and the.

| Do                    | Don't               |
| --------------------- | ------------------- |
| Log in                | Log In              |
| Add family member     | Add a family member |
| View account settings | Settings            |

### Accessibility for buttons

Use the native `disabled` attribute on `<button>` to prevent activation and remove
it from sequential keyboard focus. `aria-disabled` alone does not stop clicks or
keyboard activation. Anchors have no native disabled state: omit unavailable
navigation or show explanatory text instead of an inert button-styled link.

Tab and Shift+Tab follow document order, skipping disabled buttons. Enter and
Space activate native buttons; Enter activates links. Actions do not move focus
by themselves. Application dialogs, confirmations, and errors must manage focus
and announcements in their own flows.

## Specifications

### Variants and sizing

| CoDS class               | Use                                                               |
| ------------------------ | ----------------------------------------------------------------- |
| `cods-button`            | Primary action; pair with `usa-button`                            |
| `cods-button--secondary` | Transparent outlined alternative; pair with `usa-button--outline` |
| `cods-button--danger`    | Destructive action; pair with `usa-button--secondary`             |
| `cods-button--slim`      | Compact size modifier; 32px minimum height                        |
| `cods-button--icon-only` | Icon action requiring an accessible name                          |
| `cods-button__icon`      | Decorative shared sprite icon, 16px square                        |

Use one visual type at a time. Medium label buttons are 40px tall for a single
line: 12px top padding + 16px line-height + 12px bottom padding. Horizontal
padding is 16px. An inset 2px boundary preserves those outer dimensions.
Medium icon-only buttons are 40×40px, with 12px padding around a 16px icon.
Text can wrap and buttons grow; do not truncate action labels.

Slim label buttons use 8px vertical padding, 16px horizontal padding, and the
same 16px text line and icons: 8 + 16 + 8 = 32px. The 32px height is a minimum;
long or translated labels wrap and increase the height. Slim icon-only buttons
are 40×32px, keeping 12px horizontal padding around the 16px icon.

### Adding icons

Place decorative SVGs before or after the visible label in DOM order. The button
uses an 8px gap and logical start/end ordering, with icons at 16px. The label supplies the accessible name;
icons use `aria-hidden="true"` and `focusable="false"`.

Use the preview code for icon markup. In your app, import the package sprite URL
and use it for each SVG's `<use>` reference. See [Icon](../icon/) for asset setup.

Icon-only buttons need a short action name from `aria-label` or visually hidden
text. The example uses `aria-label="Add application"`. A tooltip alone is
insufficient.

### Variable settings

Hover, active, focus-visible, and disabled styles use the approved action, focus,
and disabled tokens. Secondary uses the secondary action palette; danger uses the danger palette. The `cods-button--hover` and
`cods-button--active` classes in demonstration markup preview states only; use
real pointer and keyboard interactions in production. `data-cods-button-fixture`
labels examples for review and is not a behavior API.

| Custom property               | Default token                                                   |
| ----------------------------- | --------------------------------------------------------------- |
| `--cods-button-background`    | `--cods-color-bg-action-primary`                                |
| `--cods-button-color`         | `--cods-color-text-action-primary`                              |
| `--cods-button-hover`         | `--cods-color-bg-action-primary-hover`                          |
| `--cods-button-active`        | `--cods-color-bg-action-primary-active`                         |
| `--cods-button-padding-block` | `--cods-space-sm`; Slim uses `--cods-space-xs`                  |
| `--cods-button-border`        | Transparent; secondary and disabled states select border tokens |

Variant classes select corresponding palette tokens. Consumer overrides must
preserve text, boundary, and focus contrast on the actual containing surface.
Secondary examples assume a light background. Forced colors preserve
native system colors and visible boundaries. Buttons have no animation.

### Setup and limitations

Load the styles as described in [Getting started](../getting-started/). Keep
`usa-button` alongside `cods-button`. Use `type="button"` for actions and
`type="submit"` for form submission. No JavaScript setup is required.

Toggle buttons, button groups, and loading states are outside this component's
scope.
