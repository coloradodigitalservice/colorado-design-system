# Token catalog review

Git token sources are authoritative for catalog values. Figma is a design reference, not an input to token validation or a replacement for `design-values.json`. Required reviewers are the Aten design lead, State design owner, accessibility lead, and Aten technical lead. The catalog is not ready for beta until those approvals and the release requirement are satisfied.

## Component inventory and coverage

The [Colorado Design System Figma file](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System) remains a design reference. The repository keeps a compact variable-name reference for semantic-role accounting, but does not store a decoded component export or use exported measurements to validate token values.

The [dependency inventory](component-token-inventory.json) covers all 28 approved components and records their documented token dependencies. Accordion and Site Alert separately retain independently scanned Git stylesheet dependencies. Table, Side Navigation and Step Indicator remain outside the approved scope.

Maps and Videos remain in the inventory with explicit design coverage gaps; no token dependencies are invented for them. The shared Icon foundation is recorded separately in `sharedFoundations`, outside the approved 28-component inventory, with the same stylesheet-dependency validation. Its size tokens and Phosphor assets are supplied by merged PR #67. The inventory documents planned token dependencies and implementation dependencies, not an exhaustive audit of every Figma instance or proof of design approval. Open value conflicts and component treatments are listed below for human review. No token value is changed solely to match Figma.

## Implementation and profile decision

The original 54 palette colors and 46 reviewed semantic mappings retain their names and values. The catalog adds two translucent primitives, 56 supplemental color roles, 16 limited component aliases, 80px spacing, 20 mobile typography entries, and 17 elevation entries. New color roles use semantic aliases where available and otherwise alias primitives; component aliases alias semantic color roles. Gray and yellow tag text both use color.text-primary, so a shared semantic override reaches those tags. All four generated formats remain reproducible.

The profile explicitly permits a flat `component` category, using the existing same-type alias mechanism. The limited catalog covers seven Tag variants, Modal background and Toast background. It does not invent separate overrides for every component property. This profile change uses no new JSON schema syntax or generator behavior and should follow normal technical and design review.

The local Responsive Typography collection has Desktop and Mobile modes. They are represented by explicit `font-*-desktop-*` and `font-*-mobile-*` names, with matching line-height and paragraph-space tokens. Consumers select responsive behavior. No breakpoint or automatic mode switch is introduced. The local semantic color collection has one mode. Dark elevation instructions alone do not establish a complete approved dark theme. Inherited Colorado theme/font collections are not automatically part of this catalog.

Elevation is represented as scalar x/y/blur/spread dimensions plus a translucent shadow color. Flat=0, low=0/4/8/0px, mid=0/8/16/0px, high=0/16/32/0px, black at 12%. `elevation-opacity` is an alternative for composition with the existing opaque `color-shadow`; do not apply it again to `color-elevation-shadow`. Composite DTCG shadow tokens remain outside the profile. The source's dark elevation gray90/70/60/50 and no-shadow guidance is recorded for review, not shipped as a complete dark mode.

## Decisions that remain open

| Public token or source role      | Existing Git value                     | Figma observation                                                   | Proposed handling                                                                                 |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `font-size-mobile-h3`            | 28px                                   | 26px                                                                | Preserve 28px; State owner must choose the authoritative value. Site Alert currently consumes it. |
| `font-size-mobile-body-lg`       | 24px                                   | 20px                                                                | Preserve 24px pending design review.                                                              |
| `line-height-mobile-body-lg`     | 30px                                   | 28px                                                                | Preserve 30px pending design review.                                                              |
| `paragraph-space-mobile-body-lg` | 24px                                   | 20px                                                                | Preserve 24px pending design review.                                                              |
| `color-border-subtle`            | gray/20                                | gray/10                                                             | Preserve gray/20 for Accordion and contract samples; review a migration before re-aliasing.       |
| `radius-full`                    | 9999px, explicit written specification | 999 in variable panel                                               | Preserve the documented written-specification decision.                                           |
| Button focus treatment           | Existing global focus contract         | Exported focus effects and inherited strokes differ across variants | Review the actual focus treatment; matching a spread number does not establish ring width.        |
| Hero `text/inverse`              | No approved dedicated role             | Style not in the local semantic collection                          | Confirm the style and contrast on actual Hero media before adding a role.                         |

Component shadows also diverge from the foundation: Combo Box uses black at 22% with 0/4/8/0 geometry, Modal uses 25% with 0/4/4/0, Toast uses 20% with 0/6/8/0, and Tooltip uses 10% with 0/2/4/0. Do not substitute the new 12% elevation aliases for these effects without design approval.

The footer spelling `surface/nav/social-container` maps to the same observed `surface/nav/social container` variable. Documentation-only colors are not silently promoted into new public semantic roles.

## Contrast evidence

[Contrast report](catalog-contrast-report.json) contains 58 passing opaque pairs: existing controls/focus, the approved icon foreground/surface combinations, all seven tag variants, inline/standalone link states, tinted surfaces, inverse Toast text, visited links on alert tints, and focus colors on alert and secondary surfaces. Ratios are unrounded; the tests regenerate and compare the report and reject a deliberately failing tag foreground.

The yellow warning accent has only **1.37:1** against the warning tint and **1.46:1** against white. It must not serve as the sole visual control boundary or state cue where 3:1 is required. The report retains the ratios as accepted decorative exceptions, not passing pairs; the ratios are not converted into passing thresholds. Components need accompanying text/icons, and pale decorative borders do not imply accessible control boundaries.

### Recorded technical-lead risk acceptance (2026-10-13)

The CoDS technical lead accepts these known warning-accent contrast failures as a documented implementation risk for this catalog. The report classifies the two measurements as `acceptedExceptions`, distinct from passing pairs. This acceptance is limited to the recorded warning-accent uses and does not establish WCAG conformance or permit the accent to be relied on as the sole control boundary or state cue. The measured ratios and 3:1 threshold for any sole visual cue remain in `catalog-contrast-report.json`.

This technical risk decision is not accessibility-owner approval. Accessibility review and approval remain outstanding; reviewers must assess actual component use, including accompanying text/icons and any required boundaries.

`border-bottom` and elevation shadow are translucent. Their contrast depends on the underlying surface; the opaque contrast validator intentionally rejects transparent pairs. They are decorative roles, not substitutes for required boundaries or focus. DTCG retains 8%/12%; generated eight-digit hex rounds alpha to the nearest 8-bit value. No automated pair result establishes component accessibility, screen-reader verification, focus obscuration, forced colors, or human sign-off.

## Migration and dependencies

This change is additive relative to the base package. Seven unpublished names from the earlier draft were replaced with the PR #37 names below; no compatibility aliases are retained for those draft names. Default values are unchanged.

| Earlier draft name                | Shared name from PR #37    |
| --------------------------------- | -------------------------- |
| `text-action-link-inline-visited` | `text-action-link-visited` |
| `surface-info-subtle`             | `bg-alert-info`            |
| `border-info-accent`              | `border-alert-info`        |
| `surface-warning-subtle`          | `bg-alert-warning`         |
| `border-warning-accent`           | `border-alert-warning`     |
| `surface-error-subtle`            | `bg-alert-urgent`          |
| `border-error-accent`             | `border-alert-urgent`      |

Existing link roles, tag sample aliases, shadow base color, focus treatments, and disputed values remain available. New Link implementations should choose inline or standalone roles rather than treating their hover states as interchangeable. Tags can consume `component-tag-<color>-background/text`; Modal and Toast can consume their background aliases. Typography consumers can now select complete mobile body-small/UI/supporting roles.

Token validation checks inventory paths against the Git catalog and independently scans current component Sass/CSS references. Unknown token paths, undocumented or stale stylesheet dependencies, and empty component coverage without an explicit Maps/Videos design gap fail validate/build/check. These checks verify the repository's documented dependencies; they do not establish that the inventory matches every Figma instance, approve conflicting values, or establish component accessibility.

For CSS customization, import `tokens.css` and override semantic properties on `:root`, for example `--cods-color-surface-tag-teal`. Its `--cods-component-tag-teal-background` alias follows the change without editing a palette value. Override the component property on `:root` to change only that component role. Inherited aliases resolve where defined: when scoping a semantic override to a subtree, redeclare the affected component alias there too. Sass/JSON resolve aliases at build time and cannot provide runtime customization.

State approval remains a dependency. [PR #37](https://github.com/coloradodigitalservice/colorado-design-system/pull/37) merged with the USWDS-specific alert/visited aliases and core overrides. The seven overlapping roles use those existing names and declarations, with the same visited-link contrast pair; no shared-file reconciliation is pending. No public component stylesheet is changed here.

Record a patch changeset for the development series. A locally packed token archive can support review, but is not an official published beta or approval. Before beta, resolve the recorded value conflicts, obtain design/accessibility sign-off, merge required dependencies, pass the full gate, and cut the release through the repository process. Passing automation alone is not sufficient for acceptance.
