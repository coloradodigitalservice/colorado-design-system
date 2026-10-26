# Accessibility evidence: `cods-site-alert`

## CODS-P3-006 review — October 14, 2026

- **Maturity:** experimental (`0.x`); stable and gate approval are pending.
- **Tracking:** [CDS-54 / CODS-P3-006](https://atendesign.atlassian.net/browse/CDS-54).
- **Reviewer:** Codex, developer/automated verification. Human review is pending.
- **Source:** pinned USWDS 3.14.0 Site Alert markup and information/error icons.
- **Changes requiring renewed review:** severity surfaces/icons, H5 headings,
  top boundary and logical spacing, optional page-local dismissal and focus handoff.
  The historical G2 manual findings below describe the older no-icon static
  implementation and do not establish conformance of this revision.

### Keyboard and focus

- [ ] Native links and dismissal buttons follow document order without traps.
      Chromium Storybook checks passed for Tab/Enter, pointer dismissal, link/button
      focus rings, and the page-placement skip link. Human review and Firefox remain open.
- [ ] Dismissal moves focus to an explicit external destination before hiding
      the notice. Chromium and WebKit docs assertions passed. Missing, removed,
      disabled, internal, or unfocusable destinations leave content readable;
      failure paths and instance isolation are covered by unit tests. Initialization
      does not move focus. Human keyboard/obscuration review remains open.
- Keyboard model: Tab/Shift-Tab traverse native links/buttons; Enter activates
  links and native dismissal buttons; Space also activates native buttons.
  No custom key handling, global listener, or focus trap is introduced.

### Names, roles, and announcements

- [x] Accessible names/roles are documented and asserted by browser checks:

  | Element                   | Role   | Name source                                                                                                                  |
  | ------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
  | Notice section            | region | Visible heading via unique `aria-labelledby`                                                                                 |
  | Service action link       | link   | Visible service-specific text                                                                                                |
  | Optional dismissal button | button | `aria-label="Dismiss informational site notice"` or `"Dismiss emergency site notice"`, containing the visible “Dismiss” text |
  | Example focus destination | link   | Visible “Continue to service content” text                                                                                   |
  | Placement skip link       | link   | Visible “Skip to main content” text                                                                                          |

- [x] Static notices have no live-region role. Icons are decorative CSS masks;
      explicit severity headings convey meaning without CSS or color. Each example
      region has a unique name; the dedicated axe landmark-unique check passed.
- [ ] Human VoiceOver/Safari and NVDA/Firefox verification of initial reading,
      skip-link navigation, and dismissal focus is required. No audible announcement
      is claimed. Docs distinguish initially rendered regions from pre-mounted
      `role="status"` or `role="alert"` regions updated by the consuming application.

### Reflow, motion, forced colors, and localization

- [ ] 320px-equivalent reflow passed for all nine examples in Chromium and
      WebKit, including long text, Spanish, Arabic/RTL, and dismissal. Actual 400%
      browser zoom, Firefox, and human readability/obscuration review remain open.
- N/A — no motion, transition, timer, timeout, or auto-dismiss. Reduced-motion
  emulation accompanies narrow-width checks.
- [ ] Forced-colors emulation passed in Chromium and WebKit. System Canvas,
      CanvasText, LinkText, and Highlight preserve boundaries, wording, icons, and
      focus. Actual Windows high contrast and Firefox remain open.
- [ ] Spanish and Arabic language scoping and RTL wrapping passed automated
      checks. RTL icons move to the logical start (32px right inset). Human translation,
      bidirectional-content review, and Firefox remain open.

### Progressive enhancement and lifecycle

- [x] No CSS/JavaScript checks passed in Chromium and WebKit: messages stay
      named/readable, links remain usable, and both enhancement buttons stay hidden.
- [x] Unit tests cover repeated initialization/destruction, restored authored DOM,
      fresh-page visibility, missing targets, failed focus, disabled dismissal, and
      independent instances. Dismissal uses no storage or cross-page persistence.
- [x] `cods-site-alert:dismiss` bubbles with `composed: false` and
      `{ focusTargetId }`; browser checks cover events, focus handoff, and reload.
- USWDS Site Alert has no JavaScript behavior to wrap. CoDS supplies only the
  optional dismissal lifecycle; markup/style remain based on the pinned source.

### Validation and open items

- Node 24.21.0, pnpm 12.4.2, Playwright 1.64.0, USWDS 3.14.0.
  `nvm` was unavailable; the existing pinned Node binary was placed on PATH.
- Workspace/fixture validation, Astro/Storybook validation, token drift
  (352 tokens / 47 contrast pairs), formatting, lint, typecheck, 134 unit tests,
  package/app builds, packaged examples, and static consumer checks passed.
- 29 browser checks passed: 19 Chromium Storybook checks and five docs checks
  each in Chromium and WebKit, including axe with no exclusions/disabled rules.
  Rendered masks were compared with the packaged information/error SVG paths.
- Firefox 157 exits before tests with “Could not find profile folder,” including
  a fresh `/private/tmp` retry. Its five docs checks remain unverified and enabled.
- Browser tests route built files without a local server. Reproduce after
  `pnpm build` with `pnpm exec playwright test --config config/playwright.site-alert.ts`.
  Full `pnpm check` browser-stage execution was not run because it starts preview
  servers, prohibited by the user's instructions. CI retains the full gate.
- Playwright CLI inspected built-file-routed docs at desktop and 320px widths.
  Emergency and RTL screenshots were reviewed for readable text, icon placement,
  and dismissal controls; keyboard dismissal returned focus to the documented
  destination. This is developer verification, not human screen-reader evidence.
- CodeRabbit review reported no findings. Developer source/lifecycle review
  supplements browser checks.
- Exact Figma alignment and State design/content review remain open. One connected
  Figma account lacked file access; the other required reauthentication. Existing
  repository measurements informed 32px icons/insets, a 16px gap, 18px vertical
  padding, H5 typography, and the emergency surface token. No new token values
  were introduced.
- Human screen-reader, actual zoom, keyboard/obscuration, Windows high-contrast,
  localization, and accessibility-owner approval remain required. No stable
  maturity, G3 approval, multiple-alert stacking, or dismissal persistence is claimed.

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

## Follow-up review — 2026-10-21

Figma frame 3770:786 was inspected. Emergency notices now use the shared
Phosphor warning triangle, 16px heading/body gap, no decorative top border,
and a centered 1280px content container. Desktop insets remain 32px; mobile
insets are 16px. A yellow text-only warning example and an optional
`cods-site-alert--no-icon` informational example match Figma. CDS-54 explicitly
requires an informational icon, so that canonical variant retains it. Design
review must reconcile that ticket/Figma difference; both treatments are available
without changing announcement, dismissal, or keyboard behavior. Visually hidden
headings preserve the text-only examples' distinct section names.

149 unit tests and 40 component browser checks passed across Chromium, Firefox,
WebKit, and Storybook Chromium. Added assertions cover mobile/desktop insets,
emergency artwork, heading gap, content maximum width, warning surface and
icon-free spacing. Workspace, Astro/Storybook validation, lint, type checks,
token drift, builds, fixture output and static-consumer checks passed. Formatting
passed excluding the pre-existing unrelated AGENTS.md edit, which is preserved
and excluded from this commit. Built-file routing started no servers. These
automated checks do not complete outstanding human or design sign-off.

### Review update — 2026-10-26

The Site Alert Figma page (1809:10566) was inspected in the Aten Chrome profile. Info and Warning are text-only; Emergency uses a warning triangle. CDS-54 requires distinct Info and Emergency icons, so the default Info example retains its info icon and a text-only Info example is provided. This difference requires design-owner and ticket-owner reconciliation; it is not a claim of design approval. The emergency comparison image now shows the packaged Phosphor warning triangle.

The built-file Site Alert suite passed 40 checks on 2026-10-26 across Chromium, Firefox, WebKit, and Storybook Chromium, including visible default Info and Emergency icons, text-only examples, forced-color emulation, dismissal, and focus handoff. Firefox used an isolated temporary application profile. A separate build with the proposed PR #53 shared error-icon mapping passed the same 40 checks; PR #53 itself remains unmerged. Human screen-reader, actual 400% zoom, operating-system high contrast, localization, and design/accessibility review remain open.
