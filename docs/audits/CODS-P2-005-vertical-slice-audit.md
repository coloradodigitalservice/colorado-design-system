# CODS-P2-005: Vertical slice test and audit summary

**Status:** Draft for accessibility owner review. Automated results are complete; manual evidence, visual baselines, and acceptance are open.
**Gate:** G2 - Vertical slice
**Scope:** Static Site Alert (CODS-P2-001) and interactive Accordion (CODS-P2-002), with their shared fixtures (CODS-P2-003) and documentation (CODS-P2-004).
**Maturity:** both components stay `experimental`. This audit does not approve G2 or any `stable` claim.

## Run environment

| Item                       | Value                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Date                       | 2026-10-06                                                                         |
| Commit                     | `5a52cd3` on branch `CODS-P2-005` (no uncommitted changes)                         |
| OS                         | macOS 27.0.1, Apple Silicon                                                        |
| Toolchain                  | Node 24.21.0, pnpm 12.4.2                                                          |
| Browsers (Playwright 1.63) | Chromium 153.0, Firefox 155.0, WebKit 26.6                                         |
| Automated accessibility    | axe-core 4.13.0 via `@axe-core/playwright` 4.13.0, WCAG 2.0/2.1 A/AA and 2.2 AA    |
| Dependencies under test    | Storybook 10.6.0, `@uswds/uswds` 3.14.0                                            |
| Command                    | `pnpm check` from the repository root; exit code 0, run without environment tweaks |

## Automated results

| Check                                                                | Result                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Workspace boundaries, fixture validation, metadata validation        | Pass                                                                        |
| Token drift                                                          | Pass: 240 validated tokens, 16 contrast pairs                               |
| Format, ESLint, Stylelint, root typecheck                            | Pass                                                                        |
| Unit/DOM tests (Vitest)                                              | Pass: 108 tests in 7 files, including 16 for the Accordion controller       |
| Package, Astro site, Storybook, and static-example builds            | Pass                                                                        |
| Fixture drift check and static example check                         | Pass                                                                        |
| Astro documentation validation                                       | Pass: 4 static pages, links and structural accessibility checks, 0 warnings |
| Browser tests (Playwright), Chromium on the built docs site (`web`)  | Pass: 35 of 35                                                              |
| Browser tests, Firefox on the built docs site (`web-firefox`)        | Pass: 35 of 35                                                              |
| Browser tests, WebKit on the built docs site (`web-webkit`)          | Pass: 35 of 35                                                              |
| Browser tests, Chromium on every built Storybook story (`storybook`) | Pass: 54 of 54                                                              |
| Axe scans of every documentation route and every Storybook story     | Pass; no violations                                                         |
| Skipped tests, `test.fixme`, disabled axe rules, or axe exclusions   | None                                                                        |

Browser tests cover keyboard operation, focus restoration and visible focus, exclusive and multiple-open Accordion state, 320px reflow, reduced motion, forced-colors emulation, Spanish and right-to-left content, no-CSS and no-JavaScript rendering, canonical fixture parity between the package, Storybook, and the docs site, and cascade layer order.

Reviewed warnings that do not affect results:

- The Astro build reports that `./img/usa-icons/warning.svg` is left to resolve at runtime. This is the USWDS icon path and is unchanged by this work.
- The Storybook build reports a chunk-size notice.

## Acceptance criteria status

| Criterion                                                                          | Status  | Evidence and gap                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Automated checks pass or have documented reviewed exceptions                       | Met     | All checks above pass; there are no exceptions.                                                                                                                                                                                                                                                                          |
| Critical browser flows pass in the agreed initial matrix                           | Met     | Chromium, Firefox, and WebKit on the docs site, and Chromium on Storybook. The accessibility owner should confirm this is the agreed matrix.                                                                                                                                                                             |
| Visual baselines are deterministic and reviewed                                    | Open    | No test uses `toHaveScreenshot`. The Accordion browser test attaches review screenshots, which are not regression baselines. Baselines must be generated on the CI platform (Linux), because a macOS baseline does not validate a Linux run ([visual conventions](../../tests/README.md#visual-regression-conventions)). |
| Manual accessibility evidence records methods, versions, findings, and limitations | Partial | Reported results are recorded in both evidence files; see the gaps below.                                                                                                                                                                                                                                                |
| Defects are fixed or explicitly accepted with an owner and release impact          | Partial | No release-blocking defect is known. Two defects found during the slice were fixed and are covered by tests; open items need owners.                                                                                                                                                                                     |

## Manual accessibility evidence

Both evidence files record Eric Swanson's reported manual reviews. The files are the source of record: [Accordion](../../packages/colorado-design-system/src/components/accordion/accessibility/accordion.evidence.md) and [Site Alert](../../packages/colorado-design-system/src/components/site-alert/accessibility/site-alert.evidence.md).

| Area                 | Site Alert                                                                            | Accordion                                                         |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Keyboard             | Reported pass in Safari                                                               | Reported pass; observations not recorded                          |
| Screen reader        | Reported pass with VoiceOver and Safari on macOS; versions not recorded               | Reported pass; pairing, versions, and observations not recorded   |
| 400% zoom and reflow | Reported pass in Firefox; exact zoom, viewport, and version not recorded              | Reported pass; zoom settings and observations not recorded        |
| Reduced motion       | Reported pass                                                                         | Reported pass; no motion is added                                 |
| Forced colors        | Emulation passes; macOS Increase Contrast checked; Windows forced colors not reviewed | Emulation passes; operating system and settings not recorded      |
| Localization         | Spanish and Arabic pronunciation reported appropriate; content review open            | Fixtures and checks in place; translation and content review open |

Limitations: results are human-reported and not reproducible from the files alone until environments and versions are recorded. Automated scans and emulation supplement manual review and do not replace it.

## Defects and findings

| Finding                                                                                          | Status                                                                   | Owner                        |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------- |
| Site Alert: inherited USWDS body background caused emergency link contrast failure               | Fixed; full axe suite passes                                             | Component developer          |
| Accordion: focus inside a closing panel was not returned to its trigger                          | Fixed; DOM and three-browser tests cover it                              | Component developer          |
| Firefox does not launch from apps without Full Disk Access on macOS 27 ([Playwright #42768][pw]) | Environment issue, not a product defect; documented in `tests/README.md` | Aten quality lead            |
| Windows forced-colors review not done (no Windows access)                                        | Open                                                                     | State accessibility reviewer |
| Manual review environments, versions, and individual observations not recorded                   | Open                                                                     | Aten quality lead            |
| Visual regression baselines                                                                      | Open                                                                     | Aten quality lead            |
| Design and content review, including the disabled Accordion fixture that starts expanded         | Open                                                                     | Design and content roles     |
| Translation and representative-reader review for Spanish and right-to-left content               | Open                                                                     | Content owner                |

[pw]: https://github.com/microsoft/playwright/issues/42768

No open item is known to block G2 on release impact, but the accessibility owner decides whether the open items are fixed or accepted. Owners above are proposed from the ticket's ownership section and need confirmation.

## Needed before this ticket closes

1. Decide the visual baseline approach, generate baselines on the CI platform, and review them.
2. Record test environments, versions, and observations for the manual reviews, and complete the Windows forced-colors review.
3. Complete design, content, and translation reviews.
4. Confirm the browser matrix, the defect owners, and the release impact of each open item.
5. Accessibility owner accepts the findings; attach this summary, the Playwright report, and the evidence files to CDS-44.
