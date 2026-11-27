# Accessibility Evidence: `cods-button`

**Component maturity:** stable (`0.x`), promoted 2026-11-23
**Review record:** Automated/developer verification and user-confirmed completion of human review
**Date:** 2026-11-23
**Related component metadata:** `button.metadata.json`

The component themes native USWDS 3.14.0 buttons. Navigation examples remain
native links. No controller, generated accessible strings, focus management,
toggle state, loading state, or animation is shipped.

## CODS-P4-013 stabilization — 2026-11-23

The requester verbally confirmed that all outstanding human accessibility
checks and required domain and client approvals are complete. This confirmation
is the source for resolving the remaining checklist items below. The requester
did not provide individual reviewer identities, screen-reader/browser pairing
details, or additional observation notes in the confirmation.

## CODS-P4-013 hardening — 2026-11-18

Developer first pass for CODS-P4-013.
The public page uses the shared preview, matching HTML, and status with guidance
checked against the [Button Figma frame](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=808-2014).
The preview shows primary, secondary, danger, slim, icon-only, decorative icons,
and a navigation link. Figma also depicts a Danger icon-only state. The shipped
fixture and documented support cover Primary and Secondary icon-only examples.
Danger icon-only remains outside the documented and fixture-supported examples.

### Test audit

| Area                                 | Before | After |
| ------------------------------------ | -----: | ----: |
| Button web spec (three engines)      |     21 |    15 |
| Button Storybook spec (Chromium)     |      6 |     6 |
| Shared fixture check (three engines) |      3 |     3 |
| Total                                |     30 |    24 |

The docs check verifies the curated markup and shared sprite. The web checks
cover page structure, accessible names, loaded artwork, native activation,
focus, hover and active states, narrow-screen reflow, forced colors, and
navigation without CSS or JavaScript in three engines. The existing Storybook
suite retains the full fixture checks, including disabled activation and Tab
order, additional size and icon combinations, Spanish wrapping, and RTL. Those
off-preview cases now run in Chromium only. Button has no controller unit tests.

### Automated results

Base: `ba92348`. `pnpm build` passed, including Astro validation and the
generated docs check. Workspace, fixture validation, formatting, lint, and
typecheck passed. `pnpm test` passed all 328 tests. The built-files Playwright
run of `web-button`, `storybook-button`, and `web-shared-fixtures` passed all 93
cases, including the 24 Button cases counted above.

### Manual QA and approval completion

- [x] Native Enter and Space activation, link behavior, disabled controls, Tab
      order, and visible focus were manually verified.
- [x] Accessible names for icon-only buttons and decorative icon exclusion were
      manually checked with a screen reader.
- [x] Contrast and target sizes were checked across supported variants,
      including Slim and icon-only.
- [x] 400% zoom, 320px reflow, long labels, and localization fixtures were checked.
- [x] Forced colors, reduced motion, and CSS/JavaScript-off behavior were verified.
- [x] The requester confirmed that findings, fixes and retests, State domain
      acceptance, and client sign-off were completed for this component.

The requester confirmed completion on 2026-11-23. No additional reviewer,
screen-reader pairing, or observation details were included in that confirmation.

## Keyboard

- [x] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order. Sequential navigation between examples, native activation, focus on every enabled variant, and disabled skipping passed in Chromium, Firefox, and WebKit. The requester confirmed the human Tab-order review was completed on 2026-11-23.
- [x] No keyboard trap: focus can always move away from the component using standard keys. The browser suite moved focus out of buttons and past the entire disabled block in all three engines on 2026-10-06.
- [x] Documented keyboard interactions: Tab/Shift+Tab move focus; Enter/Space activate native buttons; Enter activates navigation links. Disabled buttons do not activate or enter sequential focus. macOS WebKit uses Option+Tab when full keyboard navigation is unavailable.

## Focus

- [x] Visible focus indication uses the approved focus tokens at every focusable state. The treatment is a 4px action-focus outline, 2px offset, and white gap; computed focus assertions passed for every enabled example in all three engines; desktop screenshots confirmed a visible, unobscured ring on 2026-10-06.
- N/A — focus placement on open/close/add/remove/error belongs to the consuming action; this static component neither changes application state nor moves focus.

## Naming and roles

- [x] Accessible name and role documented for each interactive element; native roles/names appeared in the interactive snapshot; all canonical states passed axe in all three engines on 2026-10-06.

  | Element                                  | Role              | Accessible name source                                            |
  | ---------------------------------------- | ----------------- | ----------------------------------------------------------------- |
  | Primary, secondary, danger, slim         | button            | Visible action text                                               |
  | Hover, active, focus examples            | button            | Same visible action text as each variant                          |
  | Disabled variants                        | button (disabled) | Same visible action text; native disabled state                   |
  | Icon-only, including disabled icon       | button            | `aria-label="Add application"`; SVG is decorative                 |
  | Navigation example                       | link              | Visible text “Start an application”                               |
  | Expanded English, Spanish, Arabic labels | button            | Visible localized text; Spanish/Arabic `lang`, Arabic `dir="rtl"` |

- [x] Accessible name/role documented for each state variation. Visual and size variants retain native roles; no toggle or pressed state is implied. Disabled state is native `disabled`, not `aria-disabled`.

## Screen reader verification

- [x] Screen-reader verification was completed, as confirmed by the requester on 2026-11-23. The pairing and detailed observations were not provided in the confirmation.

## Zoom and reflow

- [x] The requester confirmed on 2026-11-23 that the component was verified at 400% zoom and 320px-equivalent reflow without loss of content or function. Automated 320px coverage passed in all three engines, and developer screenshots confirmed expanded/translated label wrapping and square icon targets. Medium is now 40px; Slim has a 32px minimum height with wrapping.

## Motion

- N/A — no animation or transition is authored. The suite checks computed animation names with reduced-motion emulation.

## Forced colors / high contrast

- [x] Component remains usable and distinguishable under a forced-colors mode. Automated media checks and developer screenshots passed in all three engines on 2026-10-06; the requester confirmed the Windows high-contrast review was completed on 2026-11-23. System ButtonFace/ButtonText, GrayText, and Highlight preserve boundaries, disabled text, and focus.

## Localization

- [x] String expansion, truncation, and wrapping behavior noted for long or translated content. Canonical expanded English and Spanish examples use natural wrapping, no fixed height, and no ellipsis; checked at 320px in all three engines on 2026-10-06.
- [x] Bidirectional text behavior noted: the Arabic example has `lang="ar" dir="rtl"`; logical sizing/padding and a centered decorative icon avoid left/right assumptions. The requester confirmed localization review was completed on 2026-11-23.

## Stabilization acceptance

The requester confirmed on 2026-11-23 that the required human accessibility and
domain reviews, design review, and client sign-off are complete. Token values
remain authoritative in Git. Visual regression baselines still need a matching
Linux runner/container workflow before they can gate CI; developer screenshots
supplement computed-style checks and axe scans.

## Stabilization validation — 2026-11-23

- Vitest passed all 330 tests across 17 files.
- Component fixture validation passed.
- Formatting, lint, typecheck, web validation, and `pnpm build` passed. Astro
  reported zero errors and warnings.
- The Button and shared-fixture web browser specs passed all 87 cases across
  Chromium, Firefox, and WebKit. The Button Storybook spec passed all 6 cases
  in Chromium.

## Validation — historical results, superseded

The October 6 counts below describe the earlier revision. They do not validate
the October 21 review fixes. See the current validation section below.

`pnpm check` passed on 2026-10-06 with Node 24.21.0 and pnpm 12.4.2:
workspace/app validation, 240 tokens and 16 contrast pairs with no generated
drift, formatting, ESLint/Stylelint, typechecking, 102 unit tests, all builds,
and 158 browser tests. The initial full run hit overlapping axe scans on the
existing Site Alert Long Content story; that story passed in isolation and the
subsequent full gate passed. No axe rules were suppressed and no retries were added.

Developer inspection used the built local reference page via the pinned
Playwright CLI in Firefox, WebKit, and Chromium (installed Chrome channel).
Desktop, focus, forced-colors emulation, narrow translated labels, and icon-size screenshots were inspected.
Firefox/WebKit reported no console errors; Chrome requested the reference site's
missing favicon (404), unrelated to the component. Human review was completed
after this historical inspection, as recorded in the stabilization section.
Browser checks live in
`tests/browser/button-checks.ts`, invoked on the built documentation in Chromium,
Firefox, and WebKit and the built Storybook in Chromium. The shared harness
captures console/page errors and complete axe results without excluded rules.

## Shared-fixture contract follow-up

On 2026-10-06, current main's shared-fixture contract was integrated following
PR CI validation. Every Button state now declares an example mapping and a
`data-cods-fixture-state` marker; focus setup is flagged for runtime review.
Documentation and isolated Storybook stories consume the generated package
examples, with metadata and matching copyable code. The updated `pnpm check`
passed: 110 unit tests and 201 browser tests, including generated output/export
drift checks, static-consumer checks, and cross-surface example parity.

## Shared Phosphor adoption — 2026-10-21

The handwritten plus was replaced with the shared Phosphor Regular sprite after
the user approved the visibly thinner rounded artwork as the closest shared
match to the live Figma treatment. [Icon sources and geometry](button-icons.md)
record the geometry difference and source inspection. This does not establish
design-owner or accessibility-owner sign-off at that time. The requester later
confirmed the required approvals complete on 2026-11-23. The icon remains
decorative, unfocusable, and named by its button.

## Variant coverage — 2026-10-21

Added decorative start/end/both-icon label examples across Primary, Secondary,
Danger and Medium/Slim, disabled icon-label examples, secondary icon-only,
icon-only/link hover/active/focus, and RTL placement/mirroring coverage.
Icons use the shared sprite with 16px slots and 8px gaps. Secondary boundaries
are inset, so the 2px stroke does not add to the 40px outer dimensions.

The [Slim sizing resolution](button-design-review.md) records the user-authorized correction.
The shared `export` artwork was selected by the user for Upload. Slim now uses 8px vertical padding and a 32px minimum height.
At the time these changes were recorded, screen-reader, actual 400% browser zoom,
Windows high contrast, and owner sign-off were human checks not yet documented
as complete. The requester confirmed them complete on 2026-11-23. Earlier
automated results must be revalidated after changes.

## Current validation

On 2026-10-21 with Node 24.21.0 and pnpm 12.4.2:

- Passed workspace checks, fixture validation, workspace/app validation, token
  drift/inventory checks (354 tokens, 58 contrast pairs), formatting, lint,
  typechecking, all 145 unit tests, production builds, generated fixture/export
  checks, and static-consumer drift checks.
- Passed 182 browser checks: Button regressions, shared fixture parity, all
  documentation smoke/axe scans, and all Storybook smoke/axe scans. The web
  checks ran in Chromium, Firefox, and WebKit; Storybook ran in Chromium.
  This includes 16px loaded sprite artwork, 40px single-line dimensions,
  the reproduced Slim conflict, disabled activation, visible focus, actual
  hover/active styles, RTL order/mirroring, 320px overflow, and forced-colors
  emulation. No axe rules were suppressed.
- Used the repository's built-file routing config without starting servers.
  The server-backed `pnpm check` and HTTP-preview-specific cases were not run.
- Inspected the built local Button page in Firefox via the pinned Playwright
  CLI with file routing; the default button measured 40px high and the console
  had no errors or warnings.

The first unit run's file-watcher timeout passed outside the filesystem sandbox.
The initial browser run exposed a stale single-element RTL locator and the
expected Right to Left Storybook name; both were corrected before the passing
182-test run. The requester confirmed completion of human checks and required
reviewer approvals on 2026-11-23.

## Upload artwork correction — 2026-10-21

The user selected Phosphor Regular `export` after identifying the extra dot in
`upload`. Fixture and copyable markup now use `sprite.svg#export`; naming stays
“Upload,” icons stay decorative at 16px, and non-directional artwork is not
mirrored. The Figma Upload vector (1377:959) has the same box/arrow treatment.

The correction passed production builds, fixture/export/static-consumer checks,
formatting, lint, typechecking, and all 27 Button browser regressions in
Chromium, Firefox, WebKit, and the Chromium Storybook surface on 2026-10-21.
The label-icon checks now specifically require the shared `export` reference.

## Slim sizing correction — 2026-10-21

The user authorized 8px vertical padding to preserve the intended 32px Slim
height. Label text and icons remain 16px; wrapped content can grow. Icon-only
Slim is 40×32px. Regression coverage includes expanded/Spanish Slim labels and
forced-colors dimensions. This records implementation authorization; formal
State design and accessibility sign-off were subsequently confirmed complete on
2026-11-23.

The Slim correction passed all 145 unit tests and 27 Button browser checks in
Chromium, Firefox, WebKit, and Chromium Storybook on 2026-10-21, including
32px single-line height, 40×32px icon-only targets, translated/expanded wrapping,
and forced-colors dimensions. Production builds, fixture/static-consumer checks,
formatting, lint, and typechecking passed with Node 24.21.0 / pnpm 12.4.2. Formal
State design and accessibility sign-off were subsequently confirmed complete on
2026-11-23.
