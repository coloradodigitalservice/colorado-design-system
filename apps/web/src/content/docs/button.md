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
Expand each HTML disclosure to copy its canonical markup. Example data is
generated at `@coloradodigitalservice/colorado-design-system/examples/button.json`
from the fixture and metadata; focus examples include runtime review instructions.

## Variants and sizing

| CoDS class               | Use                                                               |
| ------------------------ | ----------------------------------------------------------------- |
| `cods-button`            | Primary action; pair with `usa-button`                            |
| `cods-button--secondary` | Transparent outlined alternative; pair with `usa-button--outline` |
| `cods-button--danger`    | Destructive action; pair with `usa-button--secondary`             |
| `cods-button--slim`      | Compact size modifier; final height awaits a design decision      |
| `cods-button--icon-only` | Icon action requiring an accessible name                          |
| `cods-button__icon`      | Decorative shared sprite icon, 16px square                        |

Use one visual type at a time. Medium label buttons are 40px tall for a single
line: 12px top padding + 16px line-height + 12px bottom padding. Horizontal
padding is 16px. An inset 2px boundary preserves those outer dimensions.
Medium icon-only buttons are 40×40px, with 12px padding around a 16px icon.
Text can wrap and buttons grow; do not truncate action labels.

**Slim sizing decision pending:** Figma specifies a 32px height with the same
12px vertical padding and 16px line-height. These requirements conflict. Until
design confirms the intended padding, Slim keeps the shared padding and grows
to 40px for a single line; icon-only Slim currently measures 40×40px rather than
the intended 40×32px. Do not rely on it to align with 32px inputs yet.
The proposed resolution is 8px vertical padding with a 32px minimum height,
allowing translated labels to grow. This proposal has not been approved.

### Choosing a button

| Type      | Use when                                                                   | Don't use when                                                           |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Primary   | One main action moves the user forward                                     | Multiple actions have equal importance                                   |
| Secondary | A supporting or alternative action accompanies a primary action            | Navigation or a low-priority action would be better served by a link     |
| Danger    | An action is irreversible or could cause data loss or serious consequences | The action is routine, reversible, or only needs confirmation            |
| Icon only | A familiar Search, Close, or Add action needs to save horizontal space     | The icon is ambiguous or an accessible name cannot be provided           |
| Slim      | Space is constrained in headers or utility bars                            | The action is the main page call to action or needs a large touch target |

Allow space between targets and prefer Medium for touch-heavy interfaces.
The design's Slim recommendation includes alignment with 32px inputs, which
remains pending the sizing decision above.

### Icons before and after labels

Place decorative SVGs before or after the visible label in DOM order. The button
uses an 8px gap and logical start/end ordering, including in RTL. Keep icons at
16px and add `cods-icon--mirror-in-rtl` to directional arrows only. Do not mirror
non-directional upload or plus artwork. The label supplies the accessible name;
icons use `aria-hidden="true"` and `focusable="false"`.

```html
<button type="button" class="usa-button cods-button">
  <svg
    class="cods-icon cods-icon--small cods-button__icon"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#upload"></use>
  </svg>
  <span>Upload</span>
  <svg
    class="cods-icon cods-icon--small cods-button__icon cods-icon--mirror-in-rtl"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    viewBox="0 0 256 256"
  >
    <use href="/icons/sprite.svg#arrow-right"></use>
  </svg>
</button>
```

Omit either icon for start-only or end-only placement. The canonical examples
below include all three placements for Primary, Secondary, and Danger in both
sizes, with copyable markup. The shared Phosphor `upload` glyph is provisional
pending design confirmation against Figma's legacy icon.

Icon-only buttons **require** an `aria-label` or visually hidden action label.
A tooltip alone is insufficient. Translate the name with the UI. The canonical
example uses `aria-label="Add application"` and the shared Phosphor Regular
`plus`. At the 16px slot size its visible span is 12px with 1px bars, matching
the Figma plus dimensions. Keep the sprite's 256×256 viewBox.
Deploy the package's `icons/` assets and adapt `/icons/sprite.svg` to your public
asset path. See [Icon](../icon/) for deployment and color guidance.

## Writing for buttons

Make labels clear and predictable: users should know what will happen. Lead
with a verb, usually **{verb} + {noun}**. Familiar actions such as Done, Close,
Cancel, and OK are exceptions. Aim for 1–2 words and no more than 3–5. Use sentence
case, no punctuation, and omit unnecessary articles such as a, an, and the.

| Do                    | Don't               |
| --------------------- | ------------------- |
| Log in                | Log In              |
| Add family member     | Add a family member |
| View account settings | Settings            |

Use the native `disabled` attribute on `<button>` to prevent activation and remove
it from sequential keyboard focus. `aria-disabled` alone does not stop clicks or
keyboard activation. Anchors have no native disabled state: omit unavailable
navigation or show explanatory text instead of an inert button-styled link.

## States and customization

Hover, active, focus-visible, and disabled styles use the approved action, focus,
and disabled tokens. Secondary uses the secondary action palette; danger uses the danger palette. The `cods-button--hover` and
`cods-button--active` classes in demonstration markup preview states only; use
real pointer and keyboard interactions in production. `data-cods-button-fixture`
labels examples for review and is not a behavior API.

| Custom property            | Default token                                                   |
| -------------------------- | --------------------------------------------------------------- |
| `--cods-button-background` | `--cods-color-bg-action-primary`                                |
| `--cods-button-color`      | `--cods-color-text-action-primary`                              |
| `--cods-button-hover`      | `--cods-color-bg-action-primary-hover`                          |
| `--cods-button-active`     | `--cods-color-bg-action-primary-active`                         |
| `--cods-button-border`     | Transparent; secondary and disabled states select border tokens |

Variant classes select corresponding palette tokens. Consumer overrides must
preserve text, boundary, and focus contrast on the actual containing surface.
Secondary examples assume a light background. Forced colors preserve
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
