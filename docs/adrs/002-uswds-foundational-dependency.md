# ADR-002: Integrate U.S. Web Design System (USWDS) as the foundational component dependency

- **Status:** Proposed for State technical-owner acceptance at G1
- **Date:** 2026-09-22
- **Amends:** Accepted proposal memo of 2026-09-15; ADR-001 (repository structure)
- **Related work:** CODS-P1-015 (task implementation)

## Context

The accepted Colorado Design System proposal of 2026-09-15 outlined a 1.0 component set of ~30 components, with the implementation approach described as "build each component from scratch." The proposal assumed CoDS would author all markup, styling, and interaction patterns independently.

However, the State's finalized 1.0 component and foundation inventory (2026-09-16) reveals substantial overlap with the existing U.S. Web Design System (USWDS) component library. Specifically:

- **USWDS equivalents:** Accordion, Alert/Site Alert, Breadcrumb, Button, Card, Checkbox, Combo Box, Footer, Header, Icon List, In-Page Navigation, Language Selector, Link, Modal, Process List, Radio Buttons, Search, Select, Tag, Tooltip (~20 components).
- **CoDS-only components:** Hero, Maps, Videos, Snackbars/Toasts, Divider (~5 components).

Building all ~20 overlapping components independently from scratch would duplicate substantial work that USWDS already provides, tests, and maintains as a public-domain U.S. government work product. USWDS has been in production since 2015, is WCAG 2.0 AA and Section 508 compliant, and is actively maintained by the General Services Administration (GSA).

## Precedent: VA Design System & design.va.gov

The U.S. Department of Veterans Affairs' design system (VA CSS-Library and VA Web Components) provides a direct precedent for the approach proposed here. VA's architecture:

1. Imports USWDS Sass source partials with custom theme settings (`@use "uswds-core" with (...)`).
2. Remaps USWDS's theme variables to VA-specific color tokens and design tokens.
3. Layers VA-authored components and Web Components _only_ where VA's product needs diverge from or extend USWDS.
4. Inherits USWDS's accessibility baseline without replacing it.

CoDS will follow VA's layering model (theme + extend) but will **not** adopt VA's Web Component / Shadow DOM layer, which remains out of scope per ADR-001.

## Proposed decision

CoDS will integrate the U.S. Web Design System (USWDS) as a pinned npm dependency (`@uswds/uswds@3.14.0`), configured as follows:

### 1. Dependency Integration

- Add `@uswds/uswds` as an npm production dependency of the `@coloradodigitalservice/colorado-design-system` package (not a dev dependency; it is part of the compiled output).
- Pin to a specific semantic version (currently 3.14.0) to ensure reproducible builds and controlled upgrades.

### 2. Build Configuration

- Configure Vite's Sass preprocessor to add USWDS source paths (`node_modules/@uswds/uswds/packages`) to the load path, enabling CoDS Sass to import USWDS partials directly.
- No vendoring or forking of USWDS source; the dependency is consumed via npm.

### 3. Theme Settings

- Author a CoDS theme-settings file (`_uswds-theme.scss`) that maps approved Colorado DTCG tokens (color, spacing, radius, typography, elevation, focus) into USWDS's theme-setting variables.
- USWDS's own mixins and functions will render CoDS's visual design when invoked from component Sass.
- This approach ensures the entire USWDS component set is automatically themed to match Colorado's brand without overriding individual CSS rules.

### 4. Component Strategy

- **Type A: Themed USWDS** (~20 components) — Reuse USWDS's canonical markup, structure, ARIA roles, and interaction patterns; apply CoDS theming via token-mapped Sass.
- **Type B: CoDS-authored** (~5 components) — Hero, Maps, Videos, Snackbars/Toasts, Divider have no USWDS equivalent; author from scratch following CoDS component contract.
- **Type C: CoDS divergent** (TBD) — If a component needs to intentionally diverge from USWDS, divergence is documented and approved by State design and engineering.

### 5. Accessibility Conformance

- Type A components inherit USWDS's WCAG 2.0 AA and Section 508 compliance as a baseline.
- CoDS's own manual accessibility evidence requirements _apply in addition to_ USWDS conformance, not as a replacement.
- Every component must provide accessibility testing evidence (keyboard navigation, focus management, screen reader validation, color contrast).

### 6. License & Attribution

- USWDS is in the public domain (CC0 1.0 Universal); it is a U.S. government work product.
- Attribution to USWDS is not legally required but is encouraged and will be included in CoDS README.md and release notes.
- CoDS's own license (to be determined by State legal/procurement) is separate from USWDS's public domain status.

### 7. Upgrade Policy

- USWDS version is pinned and reviewed quarterly (Jan, Apr, Jul, Oct).
- Security and accessibility fixes are fast-tracked (1–5 business days).
- Breaking changes require Architecture Decision Record (ADR) amendment.
- Full upgrade policy documented in `docs/governance/USWDS-UPGRADE-POLICY.md`.

### 8. Scope & Out of Scope

- **In scope:** Sass theming, CSS styling, component inheritance, USWDS Sass API.
- **Out of scope:** USWDS Web Component layer (Shadow DOM), Drupal/USWDS Drupal theme integration, forking USWDS source.

## Consequences

### Benefits

1. **Reduced maintenance burden:** CoDS avoids authoring and maintaining ~20 components that USWDS already provides and tests.
2. **Faster time to value:** Phase 2 vertical-slice components and Phase 3 component production can proceed with themed USWDS components rather than building from scratch.
3. **Inherited quality:** USWDS's accessibility conformance (WCAG 2.0 AA, Section 508), tested interaction patterns, and active maintenance reduce CoDS's QA and long-term maintenance costs.
4. **Alignment with federal practice:** Design.va.gov and other federal design systems already use this pattern, establishing it as a best practice.
5. **Clear ownership:** USWDS remains the source of truth for Type A component markup and accessibility baseline; CoDS owns theming and State-specific extensions.

### Costs & Risks

1. **New dependency:** CoDS now depends on USWDS's release cycle, maintenance, and compatibility. However, USWDS is a stable, mature project (since 2015) maintained by GSA.
2. **Version pinning discipline:** Consuming projects inherit the pinned USWDS version when they upgrade CoDS. Upgrade policy ensures this is intentional and reviewed.
3. **Divergence risk:** Type A components _should not_ be styled differently than USWDS baseline without explicit deviation (Type C). Developers must resist the temptation to override USWDS styles with inconsistent rules.
4. **Theme settings maintenance:** Colorado DTCG tokens must remain in sync with USWDS's theme variable schema. Major USWDS upgrades may require theme-settings adjustments.

### Mitigations

1. Establish clear component ownership matrix (Type A/B/C classification).
2. Establish upgrade/review policy reviewed quarterly and documented.
3. Provide developer guidance prohibiting ad-hoc USWDS overrides without Type C divergence approval.
4. Maintain automated regression tests to catch unintended visual or behavioral shifts.

## Affected Components & Transition

No existing components have been authored yet (this is Phase 1); the decision applies to the Phase 2 vertical-slice and Phase 3 full component set.

### Phase 2 vertical-slice candidates:

- Button (Type A — themed USWDS)
- Text Input (Type A — themed USWDS)
- Site Alert (Type A — themed USWDS)

These components will serve as proof-of-concept for the USWDS integration and theme-settings approach.

### Phase 3 full set:

All Type A components will follow the theming pattern; Type B and C components follow the CoDS component contract (CODS-P1-004).

## Transition from Original Proposal

The accepted proposal's statement "build each component from scratch" is hereby amended to:

> CoDS components follow three strategies:
>
> - **Themed USWDS (Type A):** Reuse USWDS's canonical markup, structure, and interaction patterns; apply theming via Colorado token-mapped Sass.
> - **CoDS-authored (Type B):** New components with no USWDS equivalent, authored per CODS-P1-004 contract.
> - **CoDS divergent (Type C):** Intentional deviations from USWDS equivalents, documented and approved by State design and engineering.

## Artifacts & Documentation

The following documents are created or amended to support this decision:

1. **Component Ownership Matrix** (`docs/governance/component-ownership-matrix.md`) — Classifies all 1.0 components as Type A/B/C with ownership and USWDS references.
2. **USWDS Upgrade Policy** (`docs/governance/USWDS-UPGRADE-POLICY.md`) — Documents version pinning, quarterly review, security fast-track, and accessibility review processes.
3. **USWDS Theme Settings** (`packages/colorado-design-system/src/styles/_uswds-theme.scss`) — Maps Colorado tokens to USWDS Sass variables.
4. **Build Configuration** (`packages/colorado-design-system/vite.config.ts`) — Adds USWDS load paths to Sass preprocessor.
5. **Component Contract Amendment** (CODS-P1-004 update, pending) — Clarifies that Type A components reuse USWDS markup and accessibility evidence validates themed output, not re-implements from scratch.
6. **Package Dependency** (`packages/colorado-design-system/package.json`) — @uswds/uswds@3.14.0 added as production dependency.

## Governance & Approval

- **Responsible:** Aten technical lead and design-system engineer
- **Accountable:** State technical owner
- **Consulted:** State design owner, accessibility lead, legal/procurement (license verification)
- **Informed:** Component contributors, product owner, consuming projects

This ADR requires **State technical owner approval** before proceeding to Phase 2 and Phase 3 component production.

## Alternatives Considered

### A1. Build all components from scratch (original proposal)

- **Pros:** Total control; no external dependencies; no future USWDS compatibility concerns.
- **Cons:** Duplicates substantial work; extends timeline; increases maintenance burden; loses access to USWDS's accessibility and testing investment.
- **Decision:** Rejected — does not meet cost/timeline goals of Phase 1.

### A2. Fork USWDS into CoDS repository

- **Pros:** Full control; no upstream dependency risk.
- **Cons:** Massive maintenance burden; duplicate all USWDS upgrades, security patches, and accessibility fixes; loses community benefit; impractical for ~20 components.
- **Decision:** Rejected — explicitly out of scope; npm dependency model is standard practice.

### A3. Adopt VA's Web Component layer on top of USWDS

- **Pros:** Encapsulation; shadow DOM scoping; reduced CSS conflicts.
- **Cons:** Adds complexity; requires new component contract and developer training; conflicts with ADR-001 decision to remain with semantic HTML; increases bundle size.
- **Decision:** Rejected — out of scope per ADR-001 and accepted proposal constraints.

### A4. Evaluate Storybook's component library or Material-UI

- **Pros:** Larger ecosystem; more features; different design language.
- **Cons:** USWDS is the _only_ U.S. federal design system with public-domain license and 10+ years of production history; Material-UI and others are not tailored for government use; licensing and compliance concerns.
- **Decision:** Rejected — USWDS is the only appropriate foundation for a State government design system.

## Related Decisions

- **ADR-001:** Repository structure (pnpm, Turborepo, monorepo boundaries) — This ADR is compatible; USWDS is a regular npm dependency.
- **CODS-P1-001:** Monorepo skeleton and dependencies — @uswds/uswds is now a pinned production dependency per this ADR.
- **CODS-P1-004:** Component contract — Amended to clarify Type A components and accessibility evidence expectations.
- **CODS-P0-006:** Approved 1.0 component set — No changes; same 30 components, with new ownership classification.

## Questions & Clarifications

**Q: What if a State consuming project wants to override USWDS styling?**  
A: If the override aligns with Colorado tokens and design language, it should be a Type C divergence (documented and approved). Ad-hoc CSS overrides are discouraged and create technical debt. The component ownership matrix provides the mechanism for deliberate divergences.

**Q: Does this lock us into USWDS forever?**  
A: No. The dependency is pinned, and the relationship is documented. A future ADR amendment could replace or remove USWDS if State needs change. However, the theme-settings approach provides a decoupling layer; CoDS's visual design is not tightly coupled to USWDS's internal CSS implementation.

**Q: What if USWDS goes unmaintained?**  
A: USWDS is maintained by GSA and has been active since 2015. GSA is a permanent federal agency, making abandonment unlikely. If USWDS were to be unmaintained, CoDS would have a clear record of when and why (via CHANGELOG), and could plan a transition or fork (with full disclosure and ADR process). The current licensing (public domain) means CoDS could theoretically maintain a fork if necessary.

**Q: How does this affect consuming projects?**  
A: Consuming projects inherit the pinned USWDS version when they upgrade CoDS. This is transparent (USWDS is bundled into CoDS's built CSS and JS). Consuming projects do not directly depend on USWDS; they only see CoDS's compiled output. CoDS's upgrade/review policy ensures USWDS changes are vetted before they reach consumers.

## Acceptance Criteria

This ADR is ready for State approval when:

1. ✅ Component Ownership Matrix is complete and approved by State design and engineering.
2. ✅ USWDS Upgrade Policy is documented and approved by State technical owner.
3. ✅ License verification is complete (legal/procurement confirms public domain status and any required attribution).
4. ✅ Phase 2 vertical-slice components (Button, Text Input, Site Alert) compile and render correctly with theme settings.
5. ✅ Accessibility review is conducted on Phase 2 components; USWDS accessibility baseline is confirmed.
6. ✅ This ADR is signed by State technical owner and Aten technical lead.

## Sign-Off

- [ ] **State Technical Owner:** _____________________ Date: ________
- [ ] **State Design Owner:** _____________________ Date: ________
- [ ] **State Accessibility Lead:** _____________________ Date: ________
- [ ] **Aten Technical Lead:** _____________________ Date: ________

---

**Document ID:** ADR-002  
**Maintained by:** Aten Design Group (technical lead)  
**Repository:** `docs/adrs/002-uswds-foundational-dependency.md`  
**Related artifacts:** Component Ownership Matrix, USWDS Upgrade Policy, CODS-P1-015 task implementation
