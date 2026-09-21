# Colorado Design System (CoDS)

## Proposal and Statement of Work for the `1.0.x` Launch

**Prepared for:** Aten Design Group and the State of Colorado  
**Prepared:** September 15, 2026  
**Target launch:** November 30, 2026  
**Target release:** First supported `1.0.x` release  
**Repository:** [colorado-design-system](https://github.com/coloradodigitalservice/colorado-design-system)  
**Governing decision record:** [ADR Acceptance Memo 2026-09-14](../memos/ADR_Acceptance_Memo_2026-09-14.md)

## 1. Proposal summary

This proposal translates the accepted CoDS architecture into an implementation plan for a first supported release by November 30, 2026.

The work will establish a State-owned monorepo and deliver the first supported version of a framework-agnostic design system consisting of:

- semantic HTML, layered CSS, and TypeScript behavior modules;
- DTCG design tokens maintained in the repository;
- an Astro static reference website;
- a separate HTML/Vite Storybook workbench;
- npm packages and a matching release archive;
- automated unit, interaction, accessibility, browser, visual, package, and documentation checks;
- initial governance, ownership, versioning, release, and support practices; and
- a capped set of priority components that can be fully tested and documented before launch.

Web Components, Shadow DOM, Drupal implementation work, framework-specific adapters, and a database-backed or runtime CMS website are outside this release.

## 2. Desired outcome

By November 30, CoDS should have a reproducible, State-owned `1.0.x` release that an agency can evaluate and adopt with confidence.

A `1.0.x` launch means more than publishing a package. The release must have:

- an approved public component contract;
- a documented and tested initial component set;
- stable package names and exports;
- versioned token outputs;
- accessible reference examples;
- a published support and maturity model;
- migration and release guidance;
- an accountable release owner;
- reproducible package and archive artifacts; and
- completed approval gates for design, engineering, accessibility, product, and State ownership.

If any of those readiness conditions cannot be met by November 30, the appropriate response is to preserve the `0.0.x` development channel and move the supported release date, rather than label an incomplete contract as `1.0.x`.

## 3. Scope

### 3.1 Included

#### Platform and repository

- Initialize or align the State-owned `colorado-design-system` monorepo.
- Establish the accepted repository structure for `apps`, `packages`, `examples`, `governance`, scripts, and workflows.
- Configure workspace management, formatting, linting, TypeScript, Sass, package builds, and local development commands.
- Configure branch protection, `CODEOWNERS`, pull-request checks, dependency updates, and release permissions.
- Establish package versioning and changeset or equivalent release metadata.

#### Design tokens

- Inventory the available Figma variables, styles, modes, and component relationships.
- Establish a reviewed primitive, semantic, and component-token taxonomy.
- Store approved token values in the repository using the DTCG format.
- Generate CSS custom properties, Sass maps, normalized JSON, and TypeScript types as needed.
- Document token naming, aliasing, modes, deprecation, and approved customization points.
- Record the mapping between the approved repository token set and the Figma library.

Figma is the display and design-composition surface. The repository is authoritative for released token values and generated outputs. Figma changes must pass review before repository updates are accepted into a release.

#### Canonical component implementation

- Establish the semantic HTML, CSS, and TypeScript component contract.
- Implement the full client-confirmed `1.0.x` component set (2026-09-16 final decision): Accordion, Breadcrumbs, Button, Card (Default and Icon variants), Checkbox, Combo Box, Divider, Footer, Header, Hero, Icon List, Input, In-Page Alert, In-Page Navigation, Language Selector, Link, Maps, Modal, Process List, Radio Buttons, Search, Select (dropdown), Site Alert, Tags, Toasts/Snackbars, Videos, and Tooltip — 27 components in total.
- Include at least one static component and one interactive component in the first vertical slice.
- Provide component fixtures, states, usage guidance, accessibility requirements, and metadata.
- Use namespaced public classes, custom properties, data attributes, and documented controller APIs.
- Preserve progressive enhancement wherever the component pattern permits.
- Build the majority of this set as themed, contract-conforming implementations of the equivalent USWDS component (see "Foundational dependency: U.S. Web Design System" below), reserving fully bespoke implementation effort for components with no USWDS equivalent (Hero, Maps, Videos, Toasts/Snackbars, Divider) or an intentional, documented divergence.

**This expands the originally proposed cap of approximately 8-12 priority components to the client's complete confirmed inventory.** This is accepted as an explicit client-directed scope change, but it changes the delivery-risk profile of Phase 3 and requires the capacity, schedule, and USWDS-dependency confirmations described in section 7 (Scope change and schedule risk) before it can be treated as a committed `1.0.x` launch scope rather than an aspirational target.

#### Foundational dependency: U.S. Web Design System (USWDS)

Most of the confirmed 1.0 component set already exists as an equivalent component in the [U.S. Web Design System](https://designsystem.digital.gov/) (Accordion, Alert/Site Alert, Breadcrumb, Button, Card, Checkbox, Combo Box, Footer, Header, Icon List, In-Page Navigation, Language Selector, Link, Modal, Process List, Radio Buttons, Search, Select, Tag, Tooltip). Reimplementing all of these from first principles would duplicate publicly available, federally maintained, accessibility-reviewed work.

CoDS should instead consume USWDS as a foundational dependency and theme it, following the precedent set by other State/agency design systems built on USWDS, most notably the [VA.gov Design System](https://design.va.gov/): VA's CSS-Library imports USWDS Sass source with VA-specific theme settings and tokens, and VA's own component work is layered on top only where VA's product needs diverge from or extend USWDS. CoDS should adopt the same layering model, without adopting VA's separate Web Component library, since Web Components and Shadow DOM remain out of scope for this release per the accepted ADR.

In practice, this means:

- The `colorado-design-system` core package adds `@uswds/uswds` as a pinned npm dependency and compiles USWDS Sass source alongside CoDS Sass using USWDS's documented Sass load-path convention.
- A CoDS theme-settings file maps approved DTCG tokens (color, spacing, radius, typography, elevation, focus) into USWDS's own Sass theme variables, so USWDS's mixins and functions render Colorado's visual design rather than the federal default theme.
- Components with a USWDS equivalent are implemented as themed, contract-conforming wrappers around USWDS markup and JavaScript behavior, not reimplementations of the same interaction patterns.
- Components with no USWDS equivalent (Hero, Maps, Videos, Toasts/Snackbars, Divider) are authored entirely by CoDS, using the same token and contract conventions.
- A documented component-ownership matrix records, for every 1.0 component, whether it is themed-USWDS, CoDS-authored, or an intentional documented divergence from a USWDS equivalent.

This is a material addition to the architecture accepted in the [ADR Acceptance Memo](../memos/ADR_Acceptance_Memo_2026-09-14.md), which did not previously name USWDS as a dependency. It should be recorded as an ADR amendment before Phase 1 closes, alongside confirmation that USWDS's public-domain licensing is compatible with CoDS's own release and attribution requirements. See [CODS-P1-015](../backlog/phase-1/CODS-P1-015-integrate-uswds-as-foundational-dependency.md) for the corresponding backlog task.

#### Public reference website

- Build the Astro static site in `apps/docs`.
- Establish content collections or an equivalent typed content model.
- Publish the initial site content architecture supplied by the client, with final navigation and page placement subject to design review.
- Publish a home page with the CoDS description, key resource links, implementation highlights, and getting-started paths.
- Publish the four design principles: Accessible, Trustworthy, Empowering, and Adaptable, including their supporting statements.
- Publish foundations for Color, Elevation, Focus States, Grids & Spacing, Icons, Radius, and Typography, matching the client's final confirmed foundations inventory (2026-09-16). Logos was listed as a foundation candidate in earlier planning but is not part of the client's final foundations inventory; State design ownership must confirm whether Logos remains a separate foundation page or folds into brand/Icons guidance before Phase 3 website content work locks its navigation.
- Publish component pages for the full approved 1.0 component set, confirmed against the client's complete Figma inventory (2026-09-16): Accordion, Breadcrumbs, Button, Card (Default and Icon variants), Checkbox, Combo Box, Divider, Footer, Header, Hero, Icon List, Input, In-Page Alert, In-Page Navigation, Language Selector, Link, Maps, Modal, Process List, Radio Buttons, Search, Select (dropdown), Site Alert, Tags, Toasts/Snackbars, Videos, and Tooltip.
- Publish implementation guidance and an implementations gallery for known CoDS consumers, including Colorado Department of Revenue and other approved examples such as Colorado Tax Division and Colorado DMV when their content and imagery are available.
- Publish About content covering who we are, State ownership and stewardship, contact routes, contribution guidance, community links, policies, and attributions.
- Publish distinct getting-started paths for developers and designers. The developer path is dependent on the final package and component APIs; the designer path is dependent on approved Figma content and design ownership.
- Publish accessibility, localization, contribution, governance, release, policy, and attribution guidance where content is approved for 1.0.
- Render examples from canonical fixtures or shared component data.
- Provide copyable markup, package guidance, maturity status, Figma/source links, known limitations, audit status, and implementation status.
- Configure static previews and production deployment to State-approved hosting/CDN.

The client's content inventory was originally a content and information-architecture baseline rather than a component-implementation commitment. As of the 2026-09-16 final decision, the full inventory of 27 components and 7 foundations is the confirmed `1.0.x` component list, closed at G0 per [CODS-P0-006](../backlog/phase-0/CODS-P0-006-select-capped-1-0-component-set.md), and remains capped at this set unless the client explicitly changes the launch scope or date.

#### Storybook workbench

- Build the separate HTML/Vite Storybook application in `apps/storybook`.
- Cover supported component states and contract-approved variations.
- Configure interaction testing, accessibility checks, and visual review.
- Use Storybook as an engineering and QA surface, not as the public documentation site.

#### Distribution and release

- Publish the token package using the approved Colorado Design System naming convention once the npm scope is confirmed.
- Publish the core design-system package with CSS, controllers, fixtures, types, metadata, assets, and licenses.
- Produce a matching release archive with compiled assets, manifest, checksums, and release notes.
- Publish development releases in the `0.0.x` series during implementation.
- Prepare and approve the first supported `1.0.x` release by the target date if all readiness gates pass.
- Document exact-version installation and upgrade guidance.

#### Quality and accessibility

- Add unit and DOM tests for TypeScript behavior.
- Add Storybook interaction tests for meaningful interactive behavior.
- Run axe-core-based automated checks.
- Run Playwright browser and visual checks for the supported release set.
- Validate package exports, types, assets, tarballs, archive contents, and generated-file cleanliness.
- Complete named manual accessibility review for each stable interactive component.
- Record known limitations and the division of responsibility between CoDS and consuming agencies.

### 3.2 Explicitly excluded from this release

- Web Components, Custom Elements, Lit, and Shadow DOM implementation.
- Drupal installation, theme, module, DDEV project, Composer project, Single Directory Components package, or runtime integration.
- CDOR implementation audit or production integration.
- Official React, Vue, or Svelte adapters.
- Package-per-component publishing.
- Database-backed content, runtime CMS, or production Node server.
- Automatic Figma-to-production publishing.
- Full recreation of every Figma component.
- Guaranteed compatibility with every agency platform or assistive technology.
- Long-term support commitments beyond the release policy approved for 1.0.
- Full recreation of every artifact in the Figma file beyond the 27 approved components and 7 approved foundations (for example, unused exploratory variants, internal design-file organization, or components not in the client's final confirmed inventory).

These may become future proposals, but they cannot be allowed to expand the November release scope without an explicit change decision.

## 4. Delivery phases and schedule

The schedule assumes work begins no later than September 15 and that the State, design, accessibility, and engineering decision-makers are available for weekly approvals.

### Phase 0: Mobilization and release contract

**Dates:** September 15-18  
**Gate:** Project kickoff and access readiness

**Activities**

- Confirm State product owner, technical owner, design owner, accessibility owner, content owner, security contact, and release authority.
- Confirm GitHub repository administration, npm scope, domains, hosting, recovery accounts, and required State policies.
- Confirm final public package names and reserve the npm scope.
- Confirm the initial component candidates and acceptance criteria.
- Confirm Figma access and resource availability.
- Create the project backlog, decision log, risk register, and weekly review cadence.

**Deliverables**

- Approved project charter and RACI.
- Access and ownership checklist.
- Initial release-readiness checklist.
- Prioritized candidate component list.
- Confirmed assumptions and dependency register.

**Approval gate**

The project may proceed only when State ownership, repository access, decision-makers, and the November release scope are confirmed.

### Phase 1: Repository, tokens, and delivery foundation

**Dates:** September 21-October 2  
**Gate:** Foundation readiness

**Activities**

- Establish the monorepo skeleton and package boundaries.
- Configure workspace tooling, TypeScript, Sass, Astro, Storybook, tests, linting, and formatting.
- Configure CI path filters, static previews, package builds, and artifact checks.
- Inventory Figma values and propose the DTCG token taxonomy.
- Generate the first token outputs.
- Draft the component contract, maturity model, naming rules, and accessibility evidence template.
- Establish the `0.0.x` development release workflow.

**Deliverables**

- Working monorepo skeleton.
- Initial DTCG token source and generated outputs.
- Initial Astro and Storybook applications.
- CI pull-request validation and preview deployment.
- Package and release conventions.
- Token and component contract documentation.

**Approval gate**

The foundation is accepted when a clean checkout can install, build, test, and produce previewable documentation and workbench artifacts.

### Phase 2: Vertical slice

**Dates:** October 5-16  
**Gate:** Architecture proof

**Activities**

- Implement one static component and one interactive component.
- Carry both components through tokens, HTML/CSS/TypeScript, fixtures, Storybook, Astro documentation, package exports, archive generation, and tests.
- Validate keyboard behavior, progressive enhancement, accessible naming, focus behavior, responsive behavior, and representative content.
- Produce a `0.0.x` development release.
- Conduct design, engineering, accessibility, and product review.

**Deliverables**

- Two complete component implementations.
- Shared fixtures consumed by Storybook and documentation.
- Automated unit, interaction, accessibility, browser, and visual checks for the slice.
- Manual accessibility findings and remediation record.
- Installable package and release archive.
- Architecture adjustments discovered by the proof.

**Approval gate**

The architecture is accepted for scale only if both components can be installed, rendered, documented, tested, and released without framework or Drupal-specific workarounds that conflict with the accepted contract.

### Phase 3: Priority component production

**Dates:** October 19-November 6  
**Gate:** Feature-complete beta

**Activities**

- Implement the remaining approved 1.0 component set.
- Add component states, fixtures, content guidance, accessibility guidance, localization considerations, and metadata.
- Expand Storybook coverage, Astro pages, package exports, and examples.
- Implement the approved website information architecture and content pages from the client inventory, including the home page, principles, foundations, implementations, About, Contact, Contribute, and policies/attributions sections.
- Add approved implementation thumbnails, Figma/GitHub links, contact/community links, and contributor acknowledgements as content becomes available.
- Run targeted browser, visual, interaction, and accessibility checks as each component lands.
- Publish iterative `0.0.x` releases for stakeholder and pilot review.

**Deliverables**

- Feature-complete 1.0 component set.
- Public documentation for all included components and approved foundations.
- Working home, principles, getting-started, implementations, About, Contact, Contribute, policy, and attribution pages using approved client content.
- Updated token catalog and Figma mapping.
- Beta release archive and npm package artifacts.
- Draft migration, support, security, and contribution guidance.

**Approval gate**

The beta is accepted when all included components have documented contracts, test coverage appropriate to their behavior, reviewable accessibility evidence, and no open critical defects.

### Phase 4: Beta validation and release hardening

**Dates:** November 9-20  
**Gate:** Release candidate approval

**Activities**

- Freeze the 1.0 component scope and public API.
- Run the full test and build matrix from a clean checkout.
- Validate package tarballs, archive checksums, generated output, source maps where applicable, asset paths, and documentation links.
- Complete manual accessibility review and remediate release-blocking findings.
- Review content, localization, responsive behavior, forced colors, reduced motion, and representative long content.
- Complete security and dependency review.
- Prepare changelog, migration guidance, release notes, and support policy.
- Publish a `0.0.x` release candidate or equivalent prerelease for final stakeholder review.

**Deliverables**

- Release candidate packages and archive.
- Completed accessibility evidence package.
- Final documentation and migration guidance.
- Release notes and known-limitations list.
- Signed or provenance-backed release process, subject to State account readiness.
- 1.0 go/no-go recommendation.

**Approval gate**

The release candidate requires written approval from State product/technology, design, accessibility, engineering, and release ownership.

### Phase 5: `1.0.x` launch

**Dates:** November 23-30  
**Gate:** Supported release

**Activities**

- Resolve only release-blocking findings.
- Create the protected release tag.
- Publish the first `1.0.x` token and design-system packages using the approved scope.
- Publish the matching archive, checksums, release notes, and immutable documentation.
- Verify installation, downloads, documentation, and representative examples after publication.
- Record the release manifest, owners, support route, and follow-up backlog.

**Deliverables**

- First supported `1.0.x` release.
- Immutable documentation and Storybook deployment as approved.
- npm packages and matching release archive.
- Public changelog and migration guidance.
- Post-launch backlog and support/runbook handoff.

**Approval gate**

The launch is complete when the State-authorized release owner confirms artifact integrity, documentation availability, package installation, and support ownership.

## 5. Proposed MVP backlog structure

The backlog should be organized by outcomes and vertical slices rather than by technology alone.

### Epic A: Product ownership and governance

- Confirm owners, approval roles, and escalation path.
- Establish component maturity and deprecation policy.
- Create contribution, security, accessibility, and release guidance.
- Establish issue templates, ADR process, and change-log conventions.

### Epic B: Monorepo and developer platform

- Create workspace and package structure.
- Configure development commands and local environment.
- Add lint, typecheck, format, unit-test, build, and clean-install jobs.
- Add path-aware CI and preview deployments.
- Configure release metadata and artifact retention.

### Epic C: Token system

- Inventory Figma values.
- Approve primitive and semantic taxonomy.
- Write DTCG source files.
- Generate CSS, Sass, JSON, and types.
- Add alias, schema, contrast, and generated-drift checks.
- Document token usage and customization boundaries.

### Epic D: Canonical component contract

- Define HTML, CSS, TypeScript, metadata, and fixture conventions.
- Define public naming and event rules.
- Define progressive-enhancement and failure behavior.
- Define accessibility evidence requirements.
- Create the static and interactive vertical-slice components.

### Epic E: Public documentation site

- Configure Astro and typed content collections.
- Add site navigation and layouts.
- Add the home page with key resources, implementation highlights, and getting-started entry points.
- Add Design Principles content for Accessible, Trustworthy, Empowering, and Adaptable.
- Add foundation pages for Color, Elevation, Focus States, Grids & Spacing, Icons, Radius, and Typography (Logos status pending State design confirmation; see section 3.1).
- Add component pages for the full approved 1.0 component set confirmed on 2026-09-16 (27 components; see section 3.1), themed from USWDS equivalents where one exists.
- Add implementations, About/Who We Are, Contact, Contribute, policies, and attributions sections.
- Add developer and designer getting-started content, with TBD areas tracked as client content dependencies until approved.
- Add accessibility, localization, governance, release, and contribution guidance.
- Render shared fixtures and code examples.
- Add search, links, metadata, and static previews.

### Epic F: Storybook and quality

- Configure HTML/Vite Storybook.
- Add stories for supported states.
- Add interaction and axe-core checks.
- Add Playwright browser and visual checks.
- Add manual accessibility evidence records.

### Epic G: Distribution and release

- Confirm npm scope and package names.
- Build package exports and assets.
- Generate release archive and checksums.
- Publish `0.0.x` development releases.
- Define `1.0.x` readiness checklist.
- Execute release candidate and supported release workflows.

### Epic H: Full component set

[CODS-P0-006](../backlog/phase-0/CODS-P0-006-select-capped-1-0-component-set.md) closed its final decision on 2026-09-16 against the client's complete Figma inventory: all 27 components and all 7 foundations listed in section 3.1 are approved for `1.0.x`. This replaces the original approach of prioritizing a reduced 8-12 component subset by service need and architectural risk.

Because this is a scope expansion rather than a reduction, the remaining risk-management lever is sequencing and schedule, not component selection: build the highest-risk and most-reused items first (the USWDS foundational dependency, the icon system, and the Phase 2 vertical-slice pair), then the fifteen static-tier and twelve interactive-tier components in parallel, per the Phase 3 backlog. If capacity review during Phase 0/1 shows the full set cannot meet the November 30 gate, the appropriate response is the same one described in section 2: preserve `0.0.x` and move the supported release date, rather than silently drop components without a recorded change decision.

## 6. Assumptions

This schedule depends on the following assumptions:

- Project authorization is complete by September 15.
- State decision-makers are available for weekly reviews and time-boxed approvals.
- GitHub repository access and State ownership can be established during Phase 0.
- The final npm scope is available and can be controlled by the State before publication.
- Figma access and qualified design resources are available by the start of Phase 1.
- USWDS's public-domain licensing terms are compatible with CoDS's own release, attribution, and State-ownership requirements, and a pinned USWDS dependency version can be adopted without introducing unreviewed security or accessibility regressions.
- The expanded 27-component, 7-foundation scope confirmed on 2026-09-16 can be delivered by November 30 given USWDS reuse; this assumption must be validated by an explicit capacity review before Phase 3 begins, with the fallback being a preserved `0.0.x` channel and a revised supported-release date rather than a silent scope reduction.
- A mapping-provider and accessible-fallback decision for the Maps component is made by the State early in Phase 1/2, since it is the one component in the confirmed set with no USWDS equivalent and a third-party runtime dependency risk.

## 7. Scope change and schedule risk

This proposal originally capped the `1.0.x` component set at approximately 8-12 components, selected for architectural risk and service value rather than Figma completeness. The client's 2026-09-16 direction to include the full 27-component, 7-foundation inventory is accepted here as an explicit scope change, on the following conditions:

- **USWDS reuse is the schedule mitigation.** The expanded scope is only realistic within the November 30 gate because most of the added components already exist as USWDS patterns that can be themed rather than built from scratch (see the USWDS foundational-dependency section above and [CODS-P1-015](../backlog/phase-1/CODS-P1-015-integrate-uswds-as-foundational-dependency.md)). Components with no USWDS equivalent (Hero, Maps, Videos, Toasts/Snackbars, Divider) carry disproportionately higher schedule and accessibility risk per component and should be sequenced early enough to surface problems before the release-candidate gate.
- **This requires an ADR amendment.** The accepted ADR (2026-09-14) did not name USWDS as a dependency or approve a 27-component set. Both should be recorded as an ADR amendment, submitted alongside CODS-P1-015, before Phase 1 closes.
- **A capacity checkpoint is required before Phase 3 begins.** If the Phase 0/1 capacity review determines the full set cannot be delivered with adequate accessibility evidence by November 30, the fallback is the same one already described in section 2: keep the `0.0.x` development channel and move the supported `1.0.x` date. Do not quietly drop components from the confirmed list without recording a new change decision.
- **The Maps component needs a State decision, not just engineering time**, because it is the component most likely to require a third-party runtime dependency (a mapping/tile provider) outside the otherwise dependency-light CoDS/USWDS stack.
- The State provides or approves hosting/CDN infrastructure for static docs and release artifacts.
- Accessibility reviewers can participate during the vertical slice and release-hardening phases.
- The initial 1.0 component set is capped and does not expand after the Phase 2 gate without a schedule or scope decision.
- The client will provide or approve final copy, page ownership, navigation labels, implementation descriptions, site thumbnails, Figma links, GitHub links, contact information, community links, and attribution acknowledgements on the schedule required by the content milestones.
- The client will identify an owner for developer getting-started content and a designer or design owner for Figma-based guidance; TBD content will not be treated as an engineering defect.
- The implementations gallery will launch only with projects and imagery that have permission to be listed and displayed.
- The client will decide whether Contact, Contribute, Policies, and Attributions content is maintained in the Astro repository or linked to external State or GitHub pages before content freeze.
- No Drupal implementation, Web Component experiment, or framework adapter is introduced into this release.
- Content, legal, security, and procurement reviews are available within the delivery window.
- Any external research or agency integration needed for component prioritization is provided on schedule.

If these assumptions fail, the project must either reduce the 1.0 scope, add capacity, or move the supported release date. The `0.0.x` development stream can continue while a decision is made.

## 8. Dependencies

| Dependency                                                                   | Needed by         | Owner to confirm                                        |
| ---------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| State-owned GitHub repository administration                                 | Phase 0           | State technology/product                                |
| npm scope and publishing authority                                           | Phase 0 / Phase 5 | State technology/security                               |
| Static hosting and CDN                                                       | Phase 1 / Phase 5 | State technology/hosting                                |
| Figma access and design staffing                                             | Phase 1           | State design/product and Aten                           |
| Initial Figma inventory                                                      | Phase 1           | Design lead                                             |
| Accessibility review capacity                                                | Phase 2 / Phase 4 | State accessibility lead                                |
| Component priority and service needs                                         | Phase 0 / Phase 3 | State product/service representatives                   |
| Website content ownership and final copy                                     | Phase 0 / Phase 3 | State product/content owners                            |
| Figma-based designer guidance                                                | Phase 1 / Phase 3 | State design lead                                       |
| Implementation gallery permissions, thumbnails, and descriptions             | Phase 3           | State product/content owners and participating agencies |
| Contact alias, community links, and social links                             | Phase 0 / Phase 3 | State communications/product owners                     |
| Policies, attributions, and external-link decisions                          | Phase 3 / Phase 4 | State content/legal/product owners                      |
| Security and dependency review                                               | Phase 4           | State security/technology                               |
| USWDS dependency license/attribution confirmation and ADR amendment approval | Phase 1           | State technology/legal                                  |
| Mapping provider and accessible-fallback decision for Maps                   | Phase 1 / Phase 2 | State technology/GIS and product                        |
| Release authority and recovery accounts                                      | Phase 0 / Phase 5 | State technology/product                                |
| Content and legal review                                                     | Phase 3 / Phase 4 | State content/legal                                     |

## 9. Approval gates and decision rights

| Gate                  |       Target | Required approval                                                | Meaning                                                                            |
| --------------------- | -----------: | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| G0: Mobilization      | September 18 | State product, technology, design, accessibility, and Aten leads | Scope, ownership, access, and decision process are ready.                          |
| G1: Foundation        |    October 2 | Engineering, design, and State technical owner                   | The repo, build, token pipeline, docs shell, and workbench are operational.        |
| G2: Vertical slice    |   October 16 | Engineering, design, accessibility, product                      | The architecture works through implementation, docs, tests, and release artifacts. |
| G3: Beta              |   November 6 | Product, engineering, design, accessibility                      | The capped 1.0 component set is feature-complete and reviewable.                   |
| G4: Release candidate |  November 20 | State release owner plus all domain approvers                    | No unresolved release-blocking issues remain.                                      |
| G5: `1.0.x` launch    |  November 30 | State-authorized release owner                                   | Packages, archive, docs, ownership, and support are live and verified.             |

A gate should produce one of three outcomes: approve and proceed, approve with explicitly documented follow-up, or hold and replan. Silence should not count as approval for a release gate.

## 10. Risks and responses

| Risk                                                                                               | Response                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The November date encourages shipping an incomplete 1.0 contract                                   | Cap the component set, enforce G2/G3/G4 gates, and retain `0.0.x` if readiness criteria are not met.                                                                                                                                                                             |
| Figma procurement or inventory is delayed                                                          | Start repository and contract work with placeholder token fixtures while treating approved token mapping as a gate for stable components.                                                                                                                                        |
| Accessibility review becomes the final-week bottleneck                                             | Schedule manual review during the vertical slice and as each component lands, not only during Phase 4.                                                                                                                                                                           |
| Monorepo CI becomes slow or noisy                                                                  | Add path-aware jobs, dependency-aware checks, caching, and a required full suite only at release boundaries.                                                                                                                                                                     |
| Package scope or State ownership is not ready                                                      | Produce development archives locally or in a controlled prerelease environment, but do not claim a public supported release until ownership and publication are verified.                                                                                                        |
| Component requests expand the scope                                                                | Route additions through the backlog owner; defer nonessential components to the next release.                                                                                                                                                                                    |
| Public docs and component behavior diverge                                                         | Require shared fixtures or contract metadata and add representative documentation smoke tests.                                                                                                                                                                                   |
| Website content arrives late or lacks an owner                                                     | Freeze the information architecture first, track missing copy and assets as named dependencies, and publish only approved content in the supported release.                                                                                                                      |
| The client content inventory is mistaken for a commitment to implement every listed component      | Confirm the capped 1.0 component list at G0 and label the remaining inventory as planned or future work.                                                                                                                                                                         |
| The expanded 27-component scope, built on a new USWDS dependency, cannot meet the November 30 gate | Sequence USWDS integration and the highest-risk no-equivalent components (Hero, Maps, Videos, Toasts/Snackbars) early; run the Phase 0/1 capacity checkpoint described in section 7 and preserve `0.0.x` with a revised date if needed rather than silently dropping components. |
| The 0.0.x period creates false expectations of stability                                           | Label every development release clearly and publish known breaking changes.                                                                                                                                                                                                      |

## 11. Backlog planning inputs

This document is the official delivery plan for the current CoDS effort. It does not anticipate a separate commercial proposal or statement of work.

During backlog writing and planning, the team will determine:

- named personnel and role assignments;
- capacity and allocation by phase or backlog area;
- effort estimates and sequencing;
- acceptance criteria for backlog items and approval gates;
- client review windows and response expectations;
- change-control and scope-management procedures;
- hosting, procurement, and third-party service assumptions;
- ownership and licensing details; and
- post-launch support and handoff responsibilities.

The approval gates in this document remain the delivery milestones. Their detailed staffing, estimates, acceptance criteria, and review windows will be recorded in the backlog and associated planning artifacts rather than in a separate commercial document.

This project will be delivered remotely and includes no travel.

## 12. Proposed acceptance criteria for `1.0.x`

The first supported release is ready only when:

- the State owns or controls the repository, package scope, hosting, domains, and release credentials;
- the monorepo builds successfully from a clean checkout;
- the token source validates against the approved DTCG profile and generated output is reproducible;
- all included components have documented contracts, fixtures, usage guidance, and maturity status;
- Storybook covers supported states and the Astro site documents the released component set;
- automated test suites pass with documented exceptions;
- manual accessibility review is complete for stable interactive components;
- package tarballs and release archives install or deploy successfully from clean environments;
- release notes, migration guidance, known limitations, and support ownership are published;
- the approved 1.0 website information architecture and client-provided content are published, with unresolved TBDs explicitly labeled or deferred;
- no Web Component, Drupal, or framework-adapter dependency exists in the release; and
- the State-authorized release owner approves the final `1.0.x` tag.

## 13. Immediate decision requests

Before work begins, the client should confirm:

1. Whether November 30 is a hard public launch date or a target date subject to the G4 readiness gate, given the expanded 27-component scope.
2. Approval of the USWDS foundational-dependency approach and the related ADR amendment (see [CODS-P1-015](../backlog/phase-1/CODS-P1-015-integrate-uswds-as-foundational-dependency.md)).
3. The mapping provider and accessible-fallback approach for the Maps component.
4. The State npm scope and who controls package publishing.
5. The State-approved hosting/CDN and public domain arrangements.
6. Figma resource start date and anticipated design capacity.
7. The stakeholder roles that must participate in accessibility, security, content, and release reviews; named personnel will be assigned during backlog planning.

## Closing recommendation

Proceed with the November 30 target, but treat it as a gated supported-release objective rather than a promise to publish an arbitrary version number. Start with ownership and foundation setup, move quickly to the two-component vertical slice, and protect the final two weeks for accessibility, release, content, and operational hardening. The most important scope decision is to keep `1.0.x` small enough that every included component can carry a complete contract and evidence trail.
