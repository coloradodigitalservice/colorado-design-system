# Accessibility evidence: `cods-site-alert`

- Maturity: experimental (`0.0.x`); not approved as stable.
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
