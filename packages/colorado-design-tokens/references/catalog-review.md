# CODS-P3-001 token catalog review

This is a reviewable implementation proposal for CDS-48. Git remains the release authority. The Figma observations below are dated evidence, not State approval or a replacement for `design-values.json`. Required reviewers are the Aten design lead, State design owner, accessibility lead, and Aten technical lead. The ticket cannot be marked done until those approvals and the beta release requirement are satisfied.

## Source and coverage

The source is [Colorado Design System](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System), inspected in Chrome and exported with Save local copy on October 8, 2026. No immutable library version was available in the inspected UI. `figma-observed-2026-10-08.json` records the local variable tables; `figma-components-observed-2026-10-08.json` records the selected component roots. Root inspection includes documentation, old variants, and inherited libraries. It is not a claim that every displayed color is a component requirement.

The [dependency inventory](component-token-inventory.json) covers all 28 approved components. The [measured export evidence](figma-variants-observed-2026-10-08.json) replaces the earlier generic foundation proposals with exact matching properties from local component definitions. It records source nodes, variant names, variable names/modes, inherited references, representative paths, and unmapped values. Accordion and Site Alert separately retain independently scanned Git stylesheet dependencies. Table, Side Navigation and Step Indicator remain outside the approved scope.

There are measured definitions for 26 components. Maps has three prototype symbols with raster/vector content and 10px literal spacing, which does not establish a reusable token contract. Videos has documentation and frame examples but no component definition. Both remain in the inventory with explicit design coverage gaps; they have no invented foundation dependencies. The old Header link pointed to Coming soon; the inventory now points to the Header page containing the real definitions.

The audit maps 583 distinct property/token bindings (repeated occurrences are grouped). Button label padding is 16px horizontally and 12px vertically; slim labels still use the standard 16px UI size. Checkbox labels use regular body typography at 16px/24px, rather than the proposed semibold UI role. Breadcrumbs have regular standalone link text, while Footer navigation uses semibold standalone links. Typography family and weight overrides are recorded independently from size and line height.

The export was decoded offline from format 106 with kiwi-schema 0.5.0, pako 3.0.2 and fzstd 0.1.1, using the [decoder source](https://github.com/sunyui/figma-parser/blob/main/scripts/decode_kiwi.cjs). Its SHA-256 is recorded in the evidence. Style-carried variable bindings and ancestor modes are resolved; nested instance children receive path-specific overrides. Documentation, component-set layout, icons and hidden optional children are excluded. This is an audit of stored definitions and their default visible content, not every possible instance configuration or human approval. Evidence groups retain up to three example paths and occurrence counts; the binary export, decoded document and assets are not shipped in this repository.

237 stored property/effect observations remain unmapped, including literal construction spacing, candidate Git value differences, relative line heights, unapproved font weights and component effects. The inventory retains each observation rather than manufacturing a matching alias. Most paragraph-spacing differences are metadata on single-line text; they do not automatically warrant new public tokens. Literal construction dimensions likewise do not automatically become global spacing tokens. Exported font styles can differ from Dev Mode's reported weight, so disputed heading weights need rendered design review. No reviewed Git value was changed to fit the export.

## Implementation and profile decision

The original 54 palette colors and 46 reviewed semantic mappings retain their names and values. The proposal adds two translucent primitives, 56 supplemental color roles, 16 limited component aliases, 80px spacing, 20 missing mobile typography entries, and 17 elevation entries. New color roles preserve observed semantic aliases when present and otherwise alias primitives; component aliases alias semantic color roles. Gray and yellow tag text both preserve the source text/default relationship through color.text-primary, so a shared semantic override reaches those tags. All four generated formats remain reproducible.

The profile now explicitly permits a flat `component` category, using the existing same-type alias mechanism. The limited catalog covers seven Tag variants, Modal background and Toast background. It does not invent separate overrides for every component property. This is a proposed profile expansion under P3-001; it needs technical and design review, with no new JSON schema syntax or generator behavior.

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

The footer spelling `surface/nav/social-container` maps to the same observed `surface/nav/social container` variable. Actual definition bindings retain direct palette references on Tooltip and other components for implementation review; documentation-only colors are separated as page observations. They are not silently promoted into new public semantic roles.

## Contrast evidence

[Contrast report](catalog-contrast-report.json) contains 40 passing opaque pairs: existing controls/focus, all seven tag variants, inline/standalone link states, tinted surfaces and inverse Toast text. Ratios are unrounded; the tests regenerate and compare the report and reject a deliberately failing tag foreground.

The yellow warning accent has only **1.37:1** against the warning tint and **1.46:1** against white. It must not serve as the sole visual control boundary or state cue where 3:1 is required. The report retains those failures for design/accessibility review; they are not converted into passing thresholds. Components need accompanying text/icons and a review of the actual use. Pale decorative borders likewise do not imply accessible control boundaries.

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

Token validation checks dependencies against catalog paths and independently scans current component Sass/CSS references. Each measured foundation mapping must equal the resolved Git value and point to the same value in the export evidence. Missing measurements, incorrect mappings, unknown paths and stale stylesheet dependencies fail validate/build/check. Tests deliberately alter Button padding evidence and its mapped value, remove implementation dependencies, and ensure Videos cannot be relabeled as measured. Empty foundation coverage is permitted only for the explicitly documented Maps/Videos gaps. These checks preserve honest evidence; they do not approve conflicting values or establish component accessibility.

For CSS customization, import `tokens.css` and override semantic properties on `:root`, for example `--cods-color-surface-tag-teal`. Its `--cods-component-tag-teal-background` alias follows the change without editing a palette value. Override the component property on `:root` to change only that component role. Inherited aliases resolve where defined: when scoping a semantic override to a subtree, redeclare the affected component alias there too. Sass/JSON resolve aliases at build time and cannot provide runtime customization.

P2-007 / CDS-46 still supplies the State approval dependency. [P2-010 PR #37](https://github.com/coloradodigitalservice/colorado-design-system/pull/37) adds the USWDS-specific alert/visited aliases and core overrides. The seven overlapping roles use the exact names and declarations from PR #37, with the same visited-link contrast pair. There is one name per shared role; the inventory maps the observed Figma names to these existing implementation conventions. Core USWDS override changes remain in PR #37. Reconcile shared files and regenerate outputs when it merges. No public component stylesheet is changed here.

Record a patch changeset for the development series. A locally packed token archive can support review, but is not an official published beta or approval. After review, resolve the recorded value conflicts, obtain design/accessibility sign-off, merge dependencies, pass the full gate, and cut the beta through the repository release process. Do not close CDS-48 based solely on passing automation.
