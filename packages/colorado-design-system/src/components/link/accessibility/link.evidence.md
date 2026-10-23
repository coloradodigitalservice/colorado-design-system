# Accessibility evidence: Link

**Maturity:** experimental

**Date:** 2026-10-22

**Review:** automated browser checks and visual inspection; human sign-off pending

## Automated checks

The fixture has 18 states and 22 link-role elements: 17 enabled destinations
and five disabled examples (inline default/Small/Large; standalone default/Small).
Validation uses Node 24.21.0 and pnpm 12.4.2: 149 unit tests, 44 Link browser
checks, 360 validated tokens and 60 contrast pairs.
Tests run in web Chromium, Firefox and WebKit, plus Storybook Chromium.
The shared fixture is used by the docs, stories and shipped examples.

Checks cover axe WCAG 2 A/AA, 2.1 AA and 2.2 AA; names and roles; pointer states;
keyboard order and focus; resolved RTL; inherited leading and hover underline
clearance; 320px reflow; forced colors; download file/filename; navigation without
JavaScript or CSS; and deployment-prefix preservation.

Built-file routing verifies the compiled component without starting a server,
but cannot complete native downloads in Chromium/WebKit. The normal preview
suite additionally checks saved bytes. Native download completion was verified
on the existing port-4321 preview in all three engines. The regular repository
browser gate runs in CI; no local server was started or restarted for this work.

## Keyboard and focus

- [x] All 17 enabled links follow DOM order; the five disabled examples between enabled states are skipped. Tab/Shift+Tab are used, or Option+Tab on macOS WebKit.
- [x] Focus can leave the component. Native Enter navigation works with JavaScript disabled; new-tab navigation preserves the original page.
- [x] Focus has a 2px radius, 2px white gap and 2px blue band. Forced-colors emulation preserves a visible system outline.
- [x] Disabled examples omit `href`, `tabindex` and activation handlers; clicks do not navigate and `focus()` cannot focus them.
- N/A — Managed focus: no controller or dynamic focus movement.

## Names and roles

Decorative icons are `aria-hidden="true"`. Names come from visible text except
for the visually hidden new-tab notice.

| State                               | Role           | Name                                                          |
| ----------------------------------- | -------------- | ------------------------------------------------------------- |
| Default / visited                   | link           | Get started                                                   |
| Standalone / Small / Large / prefix | link           | Read the guide                                                |
| More / hover / active / focus       | link           | Installation guide                                            |
| External                            | link           | U.S. Web Design System (opens in a new tab)                   |
| Phone                               | link           | Contact us; fictional `tel:+13035550123`                      |
| Download                            | link           | Icon catalog (JSON, 47.3 KB)                                  |
| Disabled, five variants             | link, disabled | Installation guide                                            |
| Long content                        | link           | Complete guide description, without truncation                |
| Spanish                             | link           | Leer la guía de instalación del sistema de diseño de Colorado |
| Arabic                              | link           | اقرأ دليل التثبيت                                             |

- [x] Accessible names, roles and disabled semantics checked automatically; browser snapshots do not establish spoken announcements.

## Reflow, motion and forced colors

- [x] All fixture blocks fit 320px without clipping or horizontal overflow. Wrapped hover underlines clear the next line, and all sizes inherit content leading.
- [x] Forced-colors emulation preserves enabled link/visited colors, focus and inherited mask color. Disabled text uses `GrayText` and retains its per-variant decoration.
- N/A — Motion: no animation or transition.

WebKit emulates forced colors without `forced-color-adjust`; that property is
asserted only where supported. Disabled text is contrast-exempt; no axe rules
or enabled-state contrast checks are excluded.

## Localization and design

- [x] Long, Spanish and Arabic content wraps at 320px. Resolved RTL tests cover direct RTL, an LTR override and Arabic `dir="auto"`; only the navigation arrow mirrors.
- [ ] Spanish/Arabic copy and shortened replacements need language review. Existing translations were preserved; no reviewer approval is claimed.

Disabled Figma nodes `38:7910`, `38:7930`, `2630:16281`, `5307:9147` and
`5307:9172` were inspected on 2026-10-22. Inline retains 2px underlines (Small:
1px); standalone has none. Text uses the catalog's disabled role. Shared icon
sources and the intentional upload-to-download change are recorded in
[icon sources](link-icons.md). Technical approval is recorded by role and dated
review link in the token mapping; formal design/accessibility sign-off is open.

## Human checks still required

- [ ] Screen-reader/browser/OS pairings, versions and observed announcements, including disabled and new-tab links.
- [ ] Actual 400% zoom results with browser/OS versions and observations.
- [ ] Windows high-contrast results with browser/OS versions and observations.
- [ ] Visited-state visual review, translated service copy and owner sign-off.

Historical testing completion was confirmed on 2026-10-13 without the required
pairings or detailed observations. That predates the revised examples and does
not complete these checks. Link remains experimental pending acceptance and
CODS-P0-006 scope confirmation.
