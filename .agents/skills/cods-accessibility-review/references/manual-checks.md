# Manual and emulated checks

Commands below use the pinned Playwright 1.63.0 CLI. Forced colors, reduced motion, resize, key press, and `eval` were verified in Chromium; WebKit accepted the same media emulation through the Playwright API.

## Browsers

Run every check below in **Chromium, Firefox, and WebKit**. A check is ticked in the evidence file only when it passed in all three; record the browsers used in its note. Start a session per browser with `--browser chromium`, `--browser firefox`, or `--browser webkit`.

Media emulation can differ by browser, so after emulating, confirm it took effect before trusting a screenshot:

```sh
pnpm exec playwright cli -s=a11y eval "[matchMedia('(forced-colors: active)').matches, matchMedia('(prefers-reduced-motion: reduce)').matches].join()"
```

If a browser cannot be run, leave the item unchecked and list the missing browser under "Open items". Do not substitute another browser's result.

## Setup

Build and serve Storybook as described in [tests/README.md](../../../../tests/README.md#interactive-browser-verification), then open the story iframe URL:

```sh
pnpm exec playwright cli -s=a11y open "http://127.0.0.1:6006/iframe.html?id=<story-id>&viewMode=story" --browser chromium
pnpm exec playwright cli -s=a11y snapshot
```

Find `<story-id>` in `apps/storybook/storybook-static/index.json`. `eval` takes a single expression (no `;`). Close the session and stop the preview when done. Keep to local previews.

## Keyboard and focus

- Press `Tab` repeatedly and after each press read the focused element: `pnpm exec playwright cli -s=a11y press Tab`, then `eval "document.activeElement.outerHTML"`. Order must match the visual and DOM order; focus must always be able to leave the component (no trap).
- Exercise each documented key (Enter, Space, Escape, arrows) and record the result in "Documented keyboard interactions".
- For every state change (open, close, add, remove, error), check where focus lands.
- Take a screenshot of each focusable state and confirm the ring from the focus tokens is visible and not covered by sticky or overlapping content. The token README notes the focus-color check against white does not establish a complete treatment.

## Accessible names and roles

`snapshot` lists roles and names. Fill the evidence table from it, one row per interactive element, and repeat per state (for example expanded and collapsed). If a name comes from `aria-label`, note why visible text is not enough.

## Reduced motion

The test config forces `reduce`. To see motion behavior, turn it off, then confirm the `reduce` setting removes or shortens the animation:

```sh
pnpm exec playwright cli -s=a11y run-code "async page => { await page.emulateMedia({ reducedMotion: 'no-preference' }); }"
pnpm exec playwright cli -s=a11y run-code "async page => { await page.emulateMedia({ reducedMotion: 'reduce' }); }"
```

Mark `N/A — no animation` only after confirming the component has none.

## Forced colors

```sh
pnpm exec playwright cli -s=a11y run-code "async page => { await page.emulateMedia({ forcedColors: 'active' }); }"
pnpm exec playwright cli -s=a11y screenshot
```

Check that boundaries, focus indication, state (selected, disabled, error), and icons remain distinguishable. Emulation approximates Windows High Contrast; a real forced-colors run on Windows is a human follow-up if the component relies on borders or shadows for state.

## Zoom and reflow

400% zoom at 1280px is a 320 CSS px wide viewport:

```sh
pnpm exec playwright cli -s=a11y resize 320 256
```

Confirm no content is clipped, no two-direction scrolling for the component, and no lost function. Also try real browser zoom at 400% (a human or headed check) before ticking the item for complex components.

## Localization

- Expansion: lengthen the visible strings by about 40% (edit text in the fixture or via `eval`) and check wrapping, truncation, and overflow.
- Bidirectional text: `pnpm exec playwright cli -s=a11y eval "(document.documentElement.dir = 'rtl')"`. Required when metadata `localization` is `layout-sensitive`.
- Long content: use the fixture's long-content state.

## Needs a person

Record these under "Open items" unless a human has done them: screen reader and browser pairings with observed announcements (for example VoiceOver with Safari, NVDA with Firefox), real forced-colors on Windows, and real browser zoom for complex components. Write who and what is needed, not guessed results.
