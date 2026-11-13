# ADR-008: Phosphor Regular icon distribution and selective delivery

- **Status:** Proposed; implementation direction accepted by the Senior Developer, State technology-owner approval pending
- **Date:** 2026-11-05
- **Related work:** [Jira CDS-119](https://atendesign.atlassian.net/browse/CDS-119); Icon foundation CODS-P3-036
- **Accountable approver:** State technology owner — pending
- **Consulted:** State design and accessibility owners and component engineering — review pending
- **Implementation owner:** Senior Developer; no separate due date recorded
- **Review trigger:** Phosphor upgrades, a change to the icon delivery contract, or the 1.0 readiness review

## Context

The previous icon pipeline required an internal list of individually approved
Phosphor IDs and shipped a separate SVG for each. The project needs the full
Regular-weight library without maintaining that availability list, while
keeping distributed files and browser payloads small. CoDS must support npm,
static archives, and pages that do not use a public CDN. Availability of
artwork does not approve every design or accessibility use.

Research and the original task history are retained in CDS-119; the original
description is preserved in
[comment 285247](https://atendesign.atlassian.net/browse/CDS-119?focusedCommentId=285247#comment-285247).

## Options

| Option                                                     | Assessment                                                                                                                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retain and expand the curated list                         | Small initial assets, but ongoing per-icon maintenance and incomplete library access. Rejected.                                                                                  |
| Use a public Phosphor CDN                                  | Avoids local hosting but adds a runtime third-party dependency, policy and availability concerns, and browser restrictions on cross-origin SVG `<use>`. Rejected as the default. |
| Ship one complete sprite and always load it                | Simple and self-hosted, but every page downloads artwork it may never use. Retained only as an explicit fallback.                                                                |
| Ship the complete sprite and select from source references | Full availability in the distribution; a build emits only recognized referenced symbols. **Chosen.**                                                                             |

## Decision

1. Replace the curated model with the complete Regular sprite generated from the
   exact pinned `@phosphor-icons/core` source. The committed index contains
   IDs, source/version/license, weight, and the full sprite's SHA-256; it has
   no categories or per-icon approval metadata. Regenerate and review both
   outputs when upgrading Phosphor.
2. Ship the sprite, index, MIT notice, and build-time tools in the design-system
   npm package and static release archive. The sprite embeds the MIT notice so
   a selected subset retains it without a second browser request.
3. Discover supported literal IDs from application and component references,
   validate them, and emit a deterministic, content-hashed subset through the
   Vite plugin. Provide a standalone command for static and other build
   pipelines. The command can also generate standalone SVGs from literal CSS
   `url()` references. Neither path requires a selection manifest.
4. Fail on unknown IDs and recognized unresolved expressions in subset mode.
   The tools do not claim to interpret arbitrary programs, import graphs in the
   standalone command, or external runtime data. An application with dynamic
   IDs must explicitly choose the full sprite and validate IDs at runtime.
   Native `<use>` alone silently renders a missing fragment blank.
5. Generate only standalone SVGs and fixed-color variants actually needed by
   packaged CSS. USWDS replacement mappings and token-verified component
   variants are integration mappings, not an availability list. Preserve
   `currentColor`, accessibility, localization, and forced-colors behavior.
6. Link the public Icon page to Phosphor for browsing rather than rendering a
   local icon gallery. Preserve usage and accessibility guidance.
7. Prefer same-origin hosting. A consumer may host its copy on its own CDN,
   but CORS headers do not guarantee cross-origin SVG `<use>` support in every
   browser. Released assets remain versioned rather than depending on a mutable
   public CDN.

## Consequences

- The package grows because it includes all Regular artwork; a consuming page
  can still fetch one much smaller subset. Full-sprite fallback is larger but
  requires no build. Subsets preserve the license notice.
- This is a deliberate `0.x` breaking change: the old categorized catalog,
  curated manifest, and unneeded individual SVGs disappear. Consumers using
  catalog fields or individual files must update.
- A source scanner can only validate the documented forms. It must not be
  represented as a guarantee for dynamically constructed or unrecognized
  references. Consumers must configure their build and deploy the emitted URL;
  zero-build consumers are responsible for checking IDs.
- Visual suitability, contrast, screen-reader behavior, and component
  accessibility require review in context. This decision does not change
  component maturity or approve State accessibility evidence.

## Implementation measurements

For the `0.2.18` build, the `pnpm pack` tarball increased from 952,577 to
1,081,371 bytes (+128,794 bytes). The full licensed sprite is 747,202 bytes;
the ten-icon benchmark subset is 3,647 bytes, and the built Astro site uses a
7,555-byte subset containing 20 IDs. Offline gzip sizes are 192,688, 1,481,
and 2,570 bytes respectively; these are not observed HTTP transfer sizes.

## Acceptance and outstanding review

- **Senior Developer:** accepted this direction on **2026-11-05**.
- **State technology owner:** approval pending.
- **State design and accessibility owners and component-engineering
  consultees:** review pending; no acceptance is recorded on their behalf.
