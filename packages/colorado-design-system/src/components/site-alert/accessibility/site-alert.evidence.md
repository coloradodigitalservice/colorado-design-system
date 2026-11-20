# Accessibility evidence: `cods-site-alert`

## CODS-P4-033 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-142). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/site-alert/` now follows the CoDS Website Content outline: title
and description, a curated preview (Informational (default), Warning,
Emergency) with the exact markup that renders it, Component Status, Guidance
(When to use with a variant table, Writing for site alerts, Accessibility for
site alerts), and Specifications (classes, placement relative to the skip link
and header, style and icon loading, variable settings, limitations). The page
explains sitewide versus contextual messaging (In-Page Alert) and states that
Site Alert has no dismissal and saves no dismissed state. The examples
catalogue and public localization/RTL guidance were removed from the page. The
long-content, Spanish, RTL, focus-visible, and informational fixture states
remain in Storybook and its tests. The status makes no conformance claim.
`check-docs-output.mjs` verifies the preview and its code block against the
canonical fixture. The shared preview helper (`preview-markup.mjs`) now strips
the `<div data-cods-fixture-state>` wrapper Site Alert's fixture uses; the
change is the same one used on the CODS-P4-014 branch.

In-scope defect fixed: the docs site's unlayered link focus rule
(`apps/web/src/styles/site.css`) overrode the component's focus ring on the
page, so the Emergency link showed a blue ring on the red surface instead of
the component's white ring. Site Alert links are now excluded from that rule,
like Link and Breadcrumbs links. The new web keyboard test guards it.

### Test audit

Counts are Playwright test runs from `config/playwright.site-alert.ts` (web
runs in Chromium, Firefox, and WebKit; Storybook in Chromium), plus Site
Alert's entries in shared specs. Site Alert has no unit tests.

| Area                                        | Before           | After             |
| ------------------------------------------- | ---------------- | ----------------- |
| `web-site-alert.spec.ts`                    | 5 tests × 3 = 15 | 6 tests × 3 = 18  |
| `storybook-site-alert.spec.ts`              | 15               | 14                |
| `web-component-docs.spec.ts` Site Alert     | 2 tests × 3 = 6  | 0                 |
| `web-in-page-alert.spec.ts` Site Alert test | 1 test × 3 = 3   | 0                 |
| Total browser runs                          | 39               | 32                |
| `web-shared-fixtures.spec.ts` Site Alert    | 1 × 3            | 1 × 3 (unchanged) |
| `storybook-shared-fixtures.spec.ts`         | 8                | 8 (unchanged)     |

Decisions:

- **Added (page):** a page-outline test at 320px covering headings, the three
  preview figures and their code, Component Status and its links, no
  localization text or fixture catalogue, no horizontal overflow, and axe.
  It replaces the old "early example and copyable source" test; the copied
  code is also verified exactly by the build.
- **Moved to web (gains Firefox and WebKit):** the Storybook keyboard focus
  test. It now tabs through the three preview links, checks the 4px solid
  ring, that notices themselves are not focusable, and that the Emergency
  ring is white (the defect above).
- **Kept on web, retargeted to the preview:** no-CSS/no-JS named regions, no
  `role="alert"` and no buttons; 320px forced colors and reflow with axe,
  now also checking the forced-colors top border and narrow insets for each
  preview variant; Phosphor mask alignment and contrast; Figma geometry at
  desktop and mobile. The Informational state uses the same classes as
  Default, so the text-only loops now cover Default and Warning.
- **Moved to Storybook (state not on the page):** the RTL 16px narrow inset
  check joined the Storybook 320px forced-colors/RTL test. It now runs in
  Chromium only.
- **Consolidated:** `web-in-page-alert.spec.ts`'s "Site Alert keeps its
  emergency icon when the shared error mapping changes" test guards a past
  defect. Its assertions (no icon on text-only notices without forced colors,
  emergency mask) were folded into the Site Alert Phosphor mask test, which
  already checked the forced-colors case, so the regression now lives with
  the component.
- **Removed as superseded:** Site Alert's Summary/Anatomy and link/320px
  entries in `web-component-docs.spec.ts`; the page-outline test replaces
  them and the build checks links.
- **Kept in Storybook:** canonical fixture and token styles with axe,
  320px reflow/localization/forced colors across all eight states, public
  customization, USWDS button theme regression, `landmark-unique`, language
  scoping of translated states, the six isolated-story checks, shipped icon
  asset, and skip-link page placement.

### Automated results

Base commit `9f759ee` (`origin/main`), 2026-11-20, local Node 26.5.0 (Node
24.21.0 was not installed on this machine).

- `pnpm build`: passed, including the docs output check (36 pages).
- `pnpm exec playwright test --config config/playwright.site-alert.ts`
  (`web`, `web-webkit`, `storybook`): 26 passed.
- `web-shared-fixtures`, `storybook-shared-fixtures`, `web-in-page-alert`, and
  `web-component-docs` with `config/playwright.built-files.ts` (`web`,
  `web-webkit`, `storybook`): passed. In one full parallel run, other pages'
  `web-component-docs` link checks failed under load; they passed on rerun
  in both browsers and do not involve Site Alert.
- Firefox would not launch locally ("Could not find profile folder"); CI
  covers `web-firefox`.
- The `pnpm check` gates are recorded in the PR.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook
(`pnpm dev:storybook`; long content, Spanish, RTL, focus-visible, and page
placement are Storybook-only). Record browser, assistive technology, and
versions for each result.

- [ ] Announcements and urgency: notices present on load are named regions
      and make no unsolicited announcement; emergency wording conveys urgency.
- [ ] Non-color severity cues: lead-ins and the emergency heading convey
      meaning without color or the icon.
- [ ] Skip-link and navigation order: the skip link comes first and bypasses
      the notice and header (Storybook "Page placement").
- [ ] Dismiss names and focus: N/A. Site Alert ships no dismiss control
      (deferred to CDS-116); confirm the page does not promise one.
- [ ] Long-message reflow: long content wraps without clipping at 320px and
      400% zoom.
- [ ] No-JS and lifecycle: notices are readable without JavaScript or CSS;
      no controller exists.
- [ ] Keyboard and focus: links are reachable in order with a visible ring,
      including the white ring on Emergency.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (N/A, no motion), forced colors (emergency icon, link
      and focus colors).
- [ ] Internal localization and long-text notes (Spanish, Arabic/RTL).

## CODS-P3-006 revision — October 27, 2026

- **Maturity:** experimental; stable and gate approval are pending.
- **Tracking:** [CDS-54 / CODS-P3-006](https://atendesign.atlassian.net/browse/CDS-54).
- **Reviewer:** developer and automated verification. Human review is pending.
- **Source:** pinned USWDS 3.14.0 Site Alert markup; emergency uses the shared Phosphor warning icon.
- **Scope:** static informational, warning, and emergency notices. Informational and warning notices are text-only; sections use unique names from their visible lead-ins or headings. Emergency uses a visible heading and decorative icon. Native links are the only interactive elements. No controller or dismissal is shipped.

### Checklist and open items

- [ ] Keyboard and focus: verify native links, visible focus, skip-link order and no obscured content with a keyboard.
- [ ] Naming and screen reader: verify region names, reading order and links with a named screen-reader/browser pairing. No human announcement result is claimed for this revision.
- [ ] Zoom and reflow: verify actual 400% zoom and long, translated and RTL content without clipping.
- [ ] Forced colors: verify readability, emergency icon and focus with an operating-system high-contrast setting.
- [ ] Localization: review translations, language scoping and bidirectional text with representative readers.
- N/A — no motion or scripted interaction.
- [ ] Design and accessibility owner review remains open. The emergency-only icon direction was requested in PR #54; CDS-54's distinct-icons criterion has not been amended here. Dismissal is deferred until a client need is confirmed; follow-up: [CDS-116](https://atendesign.atlassian.net/browse/CDS-116).

On October 27, 2026, 30 built-file browser checks passed in Chromium, Firefox, WebKit, and Storybook Chromium, including axe, 320px reflow, and forced-colors emulation. Firefox used an isolated temporary application profile. These automated checks do not replace human review. Earlier manual evidence below applies to the previous implementation, not this revision.

---

## Historical G2 evidence (previous implementation)

- Maturity: experimental (`0.x`); not approved as stable.
- Date: October 1, 2026.
- Automated verification: Codex; manual review: Eric Swanson (reported October 1, 2026); accessibility lead approval pending.
- Ticket: CODS-P2-001; Site Alert selected by Eric Swanson in the implementation chat.
- Source: themed USWDS 3.14.0 Site Alert, no-icon option.

## Keyboard and focus

Native action links are the only focusable elements. Notices do not steal focus
or provide dismissal controls. Browser regression checks cover sequential Tab
navigation and the approved 4px focus outline with 2px offset. Real keyboard
focus is exercised rather than a simulated focus class. No keyboard trap is
introduced. Eric reported passing keyboard review in Safari: visible link focus,
document-order navigation without traps, Enter activation, and no unexpected
focus movement on reload. Safari's Advanced setting "Press Tab to highlight
each item on a webpage" was enabled for the check.

## Naming and semantics

Every fixture uses a named `section` linked to its visible heading with
`aria-labelledby`; IDs and region names are unique across states. A dedicated
axe `landmark-unique` regression check covers names as well as IDs. Native links have descriptive
text. Emergency headings explicitly name the emergency. These static notices do
not have `role="alert"` or an assertive live region: they are present on page
load. Applications inserting urgent notices dynamically need separate review of
announcement behavior. Axe scans cover all rendered states.

## Screen reader

Eric reported passing manual VoiceOver/Safari verification on macOS. Each
notice was discoverable as a region named by its heading; heading, body, and
link read in sensible order. Emergency wording conveyed urgency without color,
links had understandable names, and reload did not produce unsolicited urgent
announcements. This is human-reported evidence, not a screen-reader session
performed by automation. Exact OS, Safari, and VoiceOver versions were not
supplied.
After clarifying that urgency comes from the emergency wording rather than
an altered speaking voice, Eric confirmed that the remaining checks passed.

## Zoom and reflow

Browser tests use a 320px viewport (400% equivalent at a 1280px viewport), check
that every notice fits without horizontal overflow, and include long content.
Eric reported completing the instructed Firefox zoom review: no clipped or
overlapping text/links, no horizontal scrolling needed to read notices, and
visible, usable links and focus outlines. The requested procedure was 400%
page zoom at approximately 1280px initial viewport width; the exact zoom,
viewport, Firefox version, and separate 200% text-only result were not recorded.
Text wraps; no fixed height or truncation is used.

## Motion

No animations, transitions, or scripted motion. Reduced-motion emulation is
included in the narrow-viewport browser check.
Eric reported completing reduced-motion review with no motion issues.

## Forced colors

Forced-colors emulation checks visibility and logical border placement. System
Canvas, CanvasText, LinkText, and Highlight colors preserve text, borders, and
focus. Severity remains explicit in wording. Actual operating-system high
forced-colors review remains pending: Eric has no Windows access. Eric tested
macOS Increase Contrast in Safari and reported no apparent color changes or
readability problems. A visible palette change is not required for that setting;
macOS Increase Contrast is not equivalent to forced-colors mode.

## Contrast and tokens

The approved neutral surface, primary text, action link, focus, and primary or
danger border tokens are consumed without introducing new color values. Axe
checks normal rendered text/link contrast; forced-colors scans supplement them.
Any consumer color customization needs a new contrast review.

## Localization

Spanish and Arabic alert sections use language attributes; English workbench
labels remain in the surrounding page language. Arabic also uses
`dir="rtl"`. Logical border/padding and `overflow-wrap: anywhere` avoid reliance
on left alignment or short strings. No strings are generated in JavaScript.
Content owners must translate service copy and link labels, use local time-zone
wording, and confirm RTL presentation with representative readers.
Eric reported appropriate Spanish and Arabic pronunciation with the required
voices available, while English example labels remained English. Translation
and representative-reader content review remain separate open items.

## G2 evidence and open review items

- Canonical fixture is shipped through the package; Storybook and the reference
  page import it. Regression checks compare the shipped file and Storybook DOM.
- Browser tests: `tests/browser/storybook-site-alert.spec.ts` and
  `tests/browser/web-site-alert.spec.ts`; shared smoke tests scan all stories and
  reference pages. Axe JSON and failure traces are attached by the test harness.
- No-CSS/no-JavaScript coverage runs against the statically rendered reference
  page in Chromium, Firefox, and WebKit.
- Required before G2 sign-off: component/fixture review, design and content
  review, actual OS forced-colors review, completion of review environment/zoom
  details, accessibility lead approval, and attachment of run artifacts to the
  gate record. VoiceOver/Safari, keyboard, Firefox zoom, and reduced-motion
  results have been reported by Eric as recorded above.
- This file records automated evidence and Eric's completed manual checks;
  it does not assert State gate approval or completion of the open reviews.

## Validation run

On October 3, 2026, validation was rerun using Node 24.21.0 and pnpm 12.4.2
on macOS. This includes workspace validation, Astro/Storybook validation, token
drift checks (240 tokens, 16 contrast pairs), formatting, ESLint, Stylelint,
root typecheck, 57 unit tests, all package/app builds, and 76 browser tests.
The `pnpm check` run passed through builds; the sandbox blocked local preview
ports at the browser step. `pnpm test:browser` then passed with execution
permission for local previews and Chromium, Firefox, and WebKit.

Follow-up review verified the built Astro example and its native HTML-source
disclosure at desktop and 320px widths with no page overflow. Individual
Storybook states derive from the same canonical fixture; the Emergency story
showed zero violations in the accessibility panel. Regression checks also cover
isolated story markup, language scoping, and source/example parity without
JavaScript.

Interactive Firefox inspection used the built Storybook preview on
`127.0.0.1:6006` at desktop and 320px widths. Screenshots were reviewed for
heading hierarchy, spacing, readable links, severity accents, and wrapping.
The first pass exposed an inherited USWDS body background causing emergency
link contrast failure; body background/color inheritance was corrected and the
full axe suite passed afterward. These developer checks supplement the pending
manual domain reviews above.

CODS-P2-005 rerun on October 6, 2026 (macOS 27.0.1, Node 24.21.0, pnpm 12.4.2,
Playwright 1.63.0 with Chromium 153.0, Firefox 155.0, WebKit 26.6, axe-core
4.13.0): `pnpm check` passed with 108 unit tests, 159 browser tests across
Chromium, Firefox, WebKit, and Storybook, and 240 validated tokens with 16
contrast pairs. No test is skipped and no axe rule is disabled or excluded.
The consolidated results are in the
[vertical-slice audit](../../../../../../docs/audits/CODS-P2-005-vertical-slice-audit.md).
