# Colorado Design System — Component Ownership Matrix

**Status:** Draft for G1 approval  
**Related work:** CODS-P1-015 — Integrate USWDS as the foundational dependency  
**Effective:** Phase 1.0 (candidate)  
**Last updated:** 2026-09-22

## Overview

This matrix classifies every Colorado Design System 1.0 candidate component according to its implementation strategy:

- **Type A: Themed USWDS** — Component markup, structure, and behavior reused directly from USWDS; CoDS applies theming (color, spacing, typography) via token-mapped Sass variables and custom properties.
- **Type B: CoDS-only** — Component authored entirely within CoDS with no USWDS equivalent; represents new capability or State-specific requirement.
- **Type C: CoDS divergent** — Component intentionally diverges from USWDS equivalent; divergence is documented and approved by State design and engineering leads.

## Component Inventory

| Component          | Type | Ownership  | USWDS Equivalent                                                                        | Notes                                                                                                 |
| ------------------ | ---- | ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Accordion          | A    | Aten/State | [`accordion`](https://designsystem.digital.gov/components/accordion/)                   | Reuse USWDS markup; style with CoDS tokens                                                            |
| Alert (Site Alert) | A    | Aten/State | [`site-alert`](https://designsystem.digital.gov/components/site-alert/)                 | Reuse USWDS markup; remap colors to CoDS severity scale                                               |
| Breadcrumb         | A    | Aten/State | [`breadcrumb`](https://designsystem.digital.gov/components/breadcrumb/)                 | Reuse USWDS markup; style with CoDS tokens                                                            |
| Button             | A    | Aten/State | [`button`](https://designsystem.digital.gov/components/button/)                         | Reuse USWDS markup; apply CoDS primary/secondary/tertiary token colors                                |
| Card               | A    | Aten/State | [`card`](https://designsystem.digital.gov/components/card/)                             | Reuse USWDS markup; style with CoDS spacing and elevation tokens                                      |
| Checkbox           | A    | Aten/State | [`checkbox`](https://designsystem.digital.gov/components/checkbox/)                     | Reuse USWDS markup and interaction; style with CoDS focus and form tokens                             |
| Combo Box          | A    | Aten/State | [`combo-box`](https://designsystem.digital.gov/components/combo-box/)                   | Reuse USWDS JS and ARIA pattern; style with CoDS form tokens                                          |
| Disclosure         | A    | Aten/State | (n/a — custom CoDS)                                                                     | HTML `<details>/<summary>` with minimal enhancement; no USWDS equivalent                              |
| Divider            | B    | Aten/State | (none)                                                                                  | CoDS-authored; visual separator with themeable color/spacing                                          |
| Footer             | A    | Aten/State | [`footer`](https://designsystem.digital.gov/components/footer/)                         | Reuse USWDS markup; adapt to State government footer structure                                        |
| Header             | A    | Aten/State | [`header`](https://designsystem.digital.gov/components/header/)                         | Reuse USWDS markup; adapt to State branding and navigation patterns                                   |
| Hero               | B    | Aten/State | (none)                                                                                  | CoDS-authored; large-scale page-top visual prominence component (no USWDS equivalent)                 |
| Icon List          | A    | Aten/State | [`icon-list`](https://designsystem.digital.gov/components/icon-list/)                   | Reuse USWDS markup; style with CoDS icon and spacing tokens                                           |
| In-Page Navigation | A    | Aten/State | [`in-page-navigation`](https://designsystem.digital.gov/components/in-page-navigation/) | Reuse USWDS markup; style with CoDS typography and link tokens                                        |
| Language Selector  | A    | Aten/State | (component pattern in USWDS)                                                            | Adapt USWDS select component; style with CoDS form tokens                                             |
| Link               | A    | Aten/State | (native HTML)                                                                           | Use semantic `<a>`; style with CoDS link and focus tokens                                             |
| Map                | B    | Aten/State | (none)                                                                                  | CoDS-authored; embedded map container for geographic data visualization                               |
| Modal              | A    | Aten/State | [`modal`](https://designsystem.digital.gov/components/modal/)                           | Reuse USWDS markup and JS; style with CoDS overlay and elevation tokens                               |
| Process List       | A    | Aten/State | [`process-list`](https://designsystem.digital.gov/components/process-list/)             | Reuse USWDS markup; style with CoDS spacing and typography                                            |
| Radio Button       | A    | Aten/State | [`radio-button`](https://designsystem.digital.gov/components/radio-button/)             | Reuse USWDS markup and interaction; style with CoDS focus and form tokens                             |
| Search             | A    | Aten/State | (form component pattern)                                                                | Compose from USWDS form elements; style with CoDS input tokens                                        |
| Select             | A    | Aten/State | [`select`](https://designsystem.digital.gov/components/select/)                         | Reuse USWDS markup; style with CoDS form tokens                                                       |
| Snackbar/Toast     | B    | Aten/State | (none)                                                                                  | CoDS-authored; transient notification with dismissal and optional action (no static USWDS equivalent) |
| Tag                | A    | Aten/State | [`tag`](https://designsystem.digital.gov/components/tag/)                               | Reuse USWDS markup; remap to CoDS status colors                                                       |
| Text Input         | A    | Aten/State | (form input)                                                                            | Use semantic `<input type="text">`; style with CoDS input tokens                                      |
| Text Area          | A    | Aten/State | (form textarea)                                                                         | Use semantic `<textarea>`; style with CoDS input tokens                                               |
| Tooltip            | A    | Aten/State | [`tooltip`](https://designsystem.digital.gov/components/tooltip/)                       | Reuse USWDS markup and JS; style with CoDS elevation and text tokens                                  |
| Video              | B    | Aten/State | (none)                                                                                  | CoDS-authored; responsive video container for embedded media                                          |

## Type A: Themed USWDS Components

**Definition:** These components reuse USWDS's canonical markup, interaction model, and accessibility patterns. CoDS's role is to apply theming via token-mapped Sass variables and custom properties, ensuring visual consistency with Colorado's brand and product tone.

**Approach:**

1. Import USWDS source Sass for the component (e.g., `@use 'uswds-core/packages/button'`).
2. Apply CoDS theme settings (via `_uswds-theme.scss` variable mappings).
3. Add CoDS-specific styling _only_ where product requirements diverge (e.g., additional button variants, spacing adjustments).
4. Ensure all semantic markup, ARIA roles, and event behavior are preserved from USWDS source.

**Benefits:**

- Inherits USWDS accessibility conformance (WCAG 2.0 AA, Section 508).
- Reduces CoDS maintenance burden for common, well-tested patterns.
- Simplifies future USWDS upgrades (security patches, feature additions).
- Ensures consistency with federal design system conventions.

**Responsibility:**

- Aten technical lead: integrate USWDS source and map tokens.
- Aten design-system engineer: validate theming and create fixtures.
- State design owner: approve visual outcome and State-specific variants.
- State accessibility lead: confirm accessibility evidence applies to themed output.

## Type B: CoDS-Authored Components

**Definition:** These components have no USWDS equivalent and are authored entirely within CoDS to meet State-specific requirements or introduce new capability.

**List:**

- **Divider** — Visual separator element; State-specific styling requirement.
- **Hero** — Large-scale page-top banner; not present in USWDS component library.
- **Map** — Geographic data visualization container; specialized to Colorado State products.
- **Snackbar/Toast** — Transient notification pattern; USWDS has no equivalent in the main library.
- **Video** — Responsive media container; State-specific accessibility requirement.

**Approach:**

1. Author markup, Sass, and TypeScript controller following CoDS component contract (CODS-P1-004).
2. Use CoDS tokens (via `@coloradodigitalservice/colorado-design-tokens`) for all design decisions.
3. Compose with USWDS utility classes where appropriate (spacing, typography, focus).
4. Provide full accessibility evidence (Section 6 of component contract).

**Responsibility:**

- Aten design-system engineer: author component and fixtures.
- State design owner: approve visual outcome and State-specific variants.
- State accessibility lead: confirm WCAG 2.0 AA conformance and evidence.

## Type C: CoDS Divergent Components

**Definition:** These components _could_ reuse USWDS markup as a starting point, but intentionally diverge from USWDS design or interaction pattern due to State product requirements or accessibility needs.

**Current list:** None identified in 1.0 candidate set.

**Future divergences** (to be evaluated during Phase 3):

- Potential variants of USWDS components (e.g., Button with additional states or sizing).
- Accessibility improvements beyond USWDS baseline (e.g., enhanced focus styling, improved color contrast).

**Approval process for Type C:**

1. Document the divergence with rationale (e.g., "improved focus indicator width for visual accessibility").
2. Obtain State design owner approval (design.md review).
3. Obtain State accessibility lead sign-off (accessibility.md evidence).
4. Record in component metadata (`divergenceApproved: true`).

## USWDS Version and License

**Version pinned:** @uswds/uswds@3.14.0 (as of 2026-09-22)  
**License:** Public Domain (CC0 1.0 Universal) — U.S. government work product  
**Attribution:** USWDS is in the public domain; attribution is not legally required but is encouraged.

**CoDS attribution statement** (to be included in README.md and release notes):

> CoDS incorporates components and styles from the U.S. Web Design System (USWDS), maintained by the General Services Administration. USWDS is a public-domain design system for U.S. federal government websites and applications. See [designsystem.digital.gov](https://designsystem.digital.gov/) for more information.

## Accessibility & Compliance

**USWDS conformance baseline:**

- WCAG 2.0 AA for all Type A components (inherits from USWDS source).
- Section 508 compliance for federal accessibility requirements.

**CoDS additional requirements:**

- Every component must provide manual accessibility evidence (CODS-P1-004, Section 6).
- Automated testing (Vitest, Playwright) must cover keyboard navigation, focus management, and ARIA attributes.
- Visual accessibility review for color contrast, focus indicators, and motion sickness risks.

**Accessibility lead responsibility:**

- Review Type A component output against USWDS baseline and Colorado-specific requirements.
- Approve accessibility evidence for Type B and C components.
- Document any gaps or enhanced requirements in component metadata.

## Component Metadata Schema

Each component's `metadata.json` includes ownership and USWDS tracking:

```json
{
  "name": "button",
  "displayName": "Button",
  "maturity": "experimental",
  "type": "interactive",
  "uswdsEquivalent": "button",
  "uswdsVersion": "3.14.0",
  "componentType": "A",
  "owners": {
    "responsible": "Aten component lead",
    "accountable": "State technical owner",
    "consulted": "State design owner, accessibility lead",
    "informed": "Component contributors, product owner"
  },
  "divergenceApproved": false,
  "divergenceNotes": null,
  "states": ["default", "hover", "focus", "active", "disabled"],
  "progressiveEnhancement": "full",
  "localization": "text-content-only",
  "description": "A semantic button or link control for user actions."
}
```

## Maintenance & Upgrade Policy

(See separate document: `CODS-USWDS-UPGRADE-POLICY.md`)

**Summary:**

- USWDS version is pinned in `package.json`; upgrades require review cycle.
- Security and accessibility fixes are prioritized for immediate patch review.
- Feature additions are reviewed quarterly per State technical owner approval.
- Breaking changes in USWDS require Architecture Decision Record (ADR) amendment.

## Governance & Decision Log

| Date       | Decision                                                 | Owner                 | Notes                                  |
| ---------- | -------------------------------------------------------- | --------------------- | -------------------------------------- |
| 2026-09-16 | Approved USWDS integration as Phase 1 foundation         | State governance      | See CDS-53 task                        |
| 2026-09-22 | Component inventory and ownership matrix drafted         | Aten technical lead   | This document; awaiting State approval |
| TBD        | Matrix approved; Phase 2 vertical-slice components begin | State technical owner | Blocks Phase 3 component production    |

## Approval Signatures

**To be completed upon State review:**

- [ ] **State Technical Owner:** _____________________ Date: ________
- [ ] **State Design Owner:** _____________________ Date: ________
- [ ] **State Accessibility Lead:** _____________________ Date: ________
- [ ] **Aten Technical Lead:** _____________________ Date: ________

---

**Document ID:** CODS-COMPONENT-OWNERSHIP-MATRIX  
**Maintained by:** Aten Design Group (technical lead)  
**Repository:** `docs/governance/component-ownership-matrix.md`  
**Related:** CODS-P1-004 (component contract), CODS-P1-015 (USWDS integration), USWDS site-alert metadata template
