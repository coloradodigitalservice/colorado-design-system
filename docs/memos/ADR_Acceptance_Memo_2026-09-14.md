# Colorado Design System (CoDS)

## ADR Acceptance Memo

**Prepared for:** Aten Design Group and the State of Colorado  
**Decision date:** September 14, 2026  
**Repository:** [colorado-design-system](https://github.com/coloradodigitalservice/colorado-design-system)  
**Status:** Accepted architecture direction; implementation planning may proceed

## Purpose

This memo records the architectural decisions approved during the client review of the CoDS research and architecture recommendations. It is the decision record to use when translating the architecture into a proposal, statement of work, implementation backlog, and delivery plan.

The accepted direction is a State-owned, framework-agnostic design system delivered from a monorepo. The system will prioritize a durable browser contract and reproducible releases over any particular consumer framework.

## Accepted decisions

| Area                     | Accepted decision                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository               | Use the State-owned [`colorado-design-system`](https://github.com/coloradodigitalservice/colorado-design-system) GitHub repository as the home for the CoDS product.                                          |
| Repository structure     | Accept the proposed monorepo structure, including the token package, core component implementation, Astro documentation site, Storybook workbench, examples, governance, tests, scripts, and CI/CD workflows. |
| Canonical implementation | Use semantic HTML, layered CSS, and TypeScript behavior modules as the framework-agnostic browser contract.                                                                                                   |
| Documentation site       | Use Astro for the static public reference website.                                                                                                                                                            |
| Component workbench      | Use Storybook as a separate engineering, testing, and visual-review workbench.                                                                                                                                |
| Distribution             | Use npm packages and a matching release archive for non-npm consumers.                                                                                                                                        |
| Design tokens            | Store and maintain token values in the repository using the DTCG format.                                                                                                                                      |
| Figma                    | Use Figma as the display and design-composition surface. Figma is not the production source of token values. Repository token files are updated using the DTCG standard and then built into consumer formats. |
| Web Components           | Defer Web Components and Shadow DOM. They are not part of the initial implementation scope.                                                                                                                   |
| Drupal                   | Defer all Drupal scope, including a supported Drupal theme, runtime integration, and Drupal-specific implementation work. Any future Drupal work requires separate approval and scope.                        |
| Release progression      | During development, publish releases using the `0.0.x` series. When CoDS is ready for its first supported release, begin the `1.0.x` series.                                                                  |

## Amendment: final `1.0.x` inventory and USWDS foundation

**Amendment date:** September 16, 2026  
**Decision owner:** State product owner, with client-directed scope confirmation

The client supplied a complete Figma inventory of components and foundations and directed that the full inventory be included in `1.0.x`. This amendment supersedes the previously assumed cap of approximately 8-12 priority components and closes the open scoring and selection work for the final inventory. No component in the final inventory is deferred.

### Approved foundations

The approved `1.0.x` foundations are:

- Color
- Elevation
- Focus States
- Grids & Spacing
- Icons
- Radius
- Typography

Logos was listed as a foundation candidate in the original proposal but is not part of the client's final foundations inventory. State design ownership must confirm whether Logos remains a separate foundation page or folds into brand or Icons guidance.

### Approved components

The approved `1.0.x` component set contains 27 components. Card's Default and Icon variants are grouped as one component:

Accordion, Breadcrumbs, Button, Card (Default and Icon variants), Checkbox, Combo Box, Divider, Footer, Header, Hero, Icon List, Input, In-Page Alert, In-Page Navigation, Language Selector, Link, Maps, Modal, Process List, Radio Buttons, Search, Select (dropdown), Site Alert, Tags, Toasts/Snackbars, Videos, and Tooltip.

The two vertical-slice components implemented in Phase 2 remain the architecture proof and are not revisited by this amendment.

### Related architecture decision

CoDS will build on the U.S. Web Design System (USWDS) as a foundational dependency. The core package will consume a pinned USWDS dependency, theme its Sass and assets with approved CoDS tokens, and reuse its markup and interaction patterns where an equivalent exists. Components without a suitable USWDS equivalent, or with a documented intentional divergence, remain CoDS-authored. Web Components and Shadow DOM remain out of scope.

This is a material amendment to the canonical implementation decision above and must be implemented and recorded through [CODS-P1-015](../backlog/phase-1/CODS-P1-015-integrate-uswds-as-foundational-dependency.md), including confirmation that USWDS licensing and attribution requirements are compatible with the CoDS release model.

### Scope and schedule conditions

The expanded inventory is accepted as an explicit client-directed scope change, but the November 30, 2026 supported-release target remains conditional. Before the date is treated as committed, the delivery team must complete a capacity and schedule review at the expanded component count. If the review does not support the date, the State must make an explicit date or scope tradeoff decision. An incomplete contract must remain in the `0.0.x` development channel rather than be labeled `1.0.x`.

Phase 3 work for the newly added components and the Icons foundation is tracked in [CODS-P3-018](../backlog/phase-3/CODS-P3-018-implement-breadcrumbs-component.md) through [CODS-P3-036](../backlog/phase-3/CODS-P3-036-implement-icon-system-and-asset-pipeline.md). The Phase 3 rollups must use this final inventory and must not describe these items as candidates or deferred work.

## Naming convention

The repository and project name are now **Colorado Design System**, represented by `colorado-design-system` in infrastructure and URLs.

The recommended package names are:

- `@coloradodigitalservice/colorado-design-tokens`
- `@coloradodigitalservice/colorado-design-system`

This follows the owning GitHub organization and project naming convention more closely than the earlier unscoped or shortened names. The final npm scope must be confirmed as available and owned by the State before package publication. If the State establishes a dedicated npm scope, that scope should replace `@coloradodigitalservice` while retaining the `colorado-design-*` package names.

The same naming convention should be applied to the monorepo package directories, documentation references, release archives, and public examples wherever practical:

```text
colorado-design-system/
├── apps/
│   ├── docs/
│   └── storybook/
├── packages/
│   ├── colorado-design-tokens/
│   └── colorado-design-system/
├── examples/
├── governance/
└── .github/workflows/
```

Directory names may remain shorter inside the repository when that improves local ergonomics, but published package names, repository URLs, and public documentation should be consistent and unambiguous.

## Release policy

CoDS will use a deliberately conservative release progression:

### Development releases: `0.0.x`

The `0.0.x` series is for active architecture and implementation development. Consumers may use these releases for internal testing and vertical-slice validation, but the public contract is not yet considered stable. Markup, tokens, CSS custom properties, controller APIs, fixtures, and package boundaries may change between releases.

Every development release should still include:

- a versioned changelog;
- a clear description of known breaking changes;
- the commit or tag from which the artifacts were built;
- checksums for release archives; and
- the test and accessibility status appropriate to the changed components.

### Supported releases: `1.0.x`

The `1.0.x` series begins when the State approves the initial supported public contract. At that point, the project should have a defined component maturity model, public API, accessibility evidence, migration guidance, release ownership, and consumer upgrade process.

The transition to `1.0.x` is not simply a version-number change. It is a readiness gate requiring approval of the initial supported component set and the operating model for maintaining it.

## Monorepo traffic and performance question

### Short answer

A monorepo can increase traffic and workload for repository users and CI systems, but it does **not** make the public website receive repository traffic. The deployed Astro website is a set of static files served from the State-approved hosting and CDN layer. End users request those built files; they do not request the GitHub repository or the monorepo.

The relevant distinction is:

```text
Contributor or CI traffic
        |
        v
GitHub repository -> build workflows -> static Astro output -> hosting/CDN -> website visitors
```

Website traffic ends at the hosting/CDN layer. It does not cause GitHub clones, repository builds, or monorepo reads for each visitor.

### Actual monorepo downsides

#### 1. Larger checkout and clone costs

A monorepo can contain the docs site, Storybook, packages, examples, tests, and governance files in one checkout. As the system grows, a fresh clone may take longer and consume more local disk space than a narrowly scoped repository.

**Mitigations:** use a workspace package manager with filtering, shallow clones where appropriate, sparse checkout for specialized contributors, and cached dependencies in CI.

#### 2. CI can run too much work

A token change does not necessarily need a full website, Storybook, visual-regression, and cross-browser test run. Without path-aware workflows, every pull request can trigger every job, increasing build minutes and feedback time.

**Mitigations:** use path filters and dependency-aware workflow rules. For example, docs-only changes can run content, link, and Astro checks; component changes can run component, Storybook, accessibility, and visual tests; token changes can additionally run affected package and visual checks. Full-suite validation should still run on release candidates and protected release branches.

#### 3. More coupling in pull requests

Because tokens, components, docs, stories, and tests live together, a change can touch many surfaces in one pull request. That is valuable when the surfaces genuinely need to change together, but it can make review larger and harder to isolate.

**Mitigations:** use clear package ownership, `CODEOWNERS`, changesets, small vertical slices, and required checks scoped to affected areas. Keep generated artifacts out of ordinary source review when they can be reproduced in CI.

#### 4. Broader access boundaries

A monorepo makes it easier for contributors with repository access to see more of the product. It can also make it harder to give different teams narrowly scoped repository permissions if the project later includes sensitive or separately governed material.

**Mitigations:** keep secrets and sensitive agency implementation code out of the public product repository, use GitHub teams and `CODEOWNERS`, and split a package or application into another repository only when it develops an independent security, ownership, or release boundary.

#### 5. Release coordination can become complex

The tokens package, design-system package, docs site, and Storybook may not all need to release at the same time. A monorepo requires deliberate versioning and dependency rules so a token change does not accidentally publish unrelated packages or leave documentation pointing to incompatible artifacts.

**Mitigations:** use Changesets or an equivalent release mechanism, explicit package dependencies, package-level versioning, release manifests, and exact package-to-documentation mappings. The initial `0.0.x` period is an appropriate time to establish these rules before `1.0.x`.

#### 6. Repository tooling becomes important infrastructure

A monorepo benefits from workspace management, task orchestration, caching, path filtering, and package-level ownership. Those tools add configuration and require maintainers to understand the repository conventions.

**Mitigations:** keep the initial workspace simple, document the few commands contributors need, prefer standard npm workspace behavior where possible, and avoid introducing a heavy build orchestrator until measured scale requires it.

### What the monorepo does not imply

The monorepo does not require:

- one deployment for the entire repository;
- one build for every website request;
- one release version for every package and application;
- one JavaScript framework for consumers;
- one hosting environment for docs, packages, and Storybook; or
- publishing every internal source file to npm.

The repository is a coordination and source-control boundary. Deployment and publishing remain separate package- and application-level operations.

### Recommended operating model

For the initial CoDS scale, the monorepo's coordination benefits outweigh these costs because tokens, component contracts, implementation, docs, Storybook stories, tests, and examples need to evolve together. The monorepo should be reconsidered only if one area develops a genuinely independent security boundary, ownership group, release cadence, or operational burden.

The website should be deployed from the `apps/docs` build output. A visitor should receive cached static assets from the hosting/CDN layer, not trigger access to GitHub, npm, Storybook, or any other part of the monorepo.

## Immediate next steps

1. Confirm State ownership of the GitHub organization, repository administration, npm scope, domains, hosting, and recovery credentials.
2. Confirm the final npm scope and reserve the approved package names before implementation reaches publication.
3. Translate the accepted decisions into a proposal or statement of work with phases, deliverables, assumptions, dependencies, and approval gates.
4. Procure or assign Figma design resources and begin the Figma inventory while engineering establishes the token and repository conventions.
5. Maintain the full confirmed `1.0.x` backlog while prioritizing the two-component vertical slice as the first delivery gate: one static component and one interactive component.
6. Establish the monorepo skeleton, CI path filters, package versioning, changesets, and static preview deployments before scaling component production.
7. Define the readiness criteria for the transition from `0.0.x` development releases to the first `1.0.x` supported release.

## Acceptance

The decisions in this memo, as amended on September 16, 2026, are accepted as the working architecture and delivery direction for CoDS. The final `1.0.x` inventory and USWDS foundation decision are subject to the capacity, schedule, licensing, and ownership follow-ups identified in the amendment. Any further change should be recorded through a new ADR or an amendment to this memo, with the affected scope and migration consequences identified.
