# Cross-package tests

Vitest tests (`*.test.ts` / `*.test.mjs`) cover shared tooling and package behavior.
Run them with `pnpm test`. Playwright tests (`tests/browser/**/*.spec.ts`) exercise
built static pages separately; Vitest does not collect them.

## Browser setup and execution (CODS-P1-010 / CDS-34)

From a clean checkout at the repository root:

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm test:browser:install
pnpm check
```

The install script provisions Chromium, Firefox, and WebKit. On Linux use
`pnpm exec playwright install --with-deps chromium firefox webkit` to also install
system libraries (this may require sudo). Re-run installation after a Playwright
upgrade. Local binaries live in Playwright's OS-specific cache outside the repo;
repeat installations reuse the matching browser revisions.

`pnpm check` builds both sites before running browser tests. `pnpm test:browser`
expects those builds to exist and starts/stops local static previews itself.
It never targets a deployed environment. Ports 4321 and 6006 must be free; multi-page previews return real 404s for missing routes. Strict
ports and disabled server reuse prevent accidentally testing a development server.

For a faster scoped run:

```sh
pnpm exec turbo run build --filter=@cods-internal/web...
CODS_BROWSER_TARGET=web pnpm test:browser

pnpm exec turbo run build --filter=@cods-internal/storybook...
CODS_BROWSER_TARGET=storybook pnpm test:browser
```

`CODS_BROWSER_TARGET` selects both the preview and matching projects; other values
fail immediately. Projects are `web` (Chromium, retained for existing commands),
`web-firefox`, `web-webkit`, and `storybook` (Chromium). To narrow further:

```sh
CODS_BROWSER_TARGET=web pnpm test:browser --project=web --grep smoke
CODS_BROWSER_TARGET=web pnpm test:browser --project=web-firefox
pnpm test:browser:report
pnpm exec playwright show-trace test-results/<failed-test>/trace.zip
```

The config uses a 30-second test timeout, 5-second assertion timeout, 60-second
preview startup timeout, two local workers, and one CI worker. CI disallows
`test.only`. Automatic retries are disabled locally and in CI: this static-page
suite is deterministic, so a failure must make the check fail on its first run.

## Interactive browser verification

The pinned `@playwright/test` dependency also provides the interactive CLI. Use
`pnpm exec playwright cli` from the repository root; no global install or new
dependency is needed. `pnpm exec playwright cli --help` lists available commands.

Build a site, then keep its static preview running in one terminal:

```sh
pnpm exec turbo run build --filter=@cods-internal/web...
pnpm exec vite preview --config config/vite.preview.ts --outDir apps/web/dist --host 127.0.0.1 --port 4321 --strictPort
```

For Storybook, build with `--filter=@cods-internal/storybook...` and serve with
`--outDir apps/storybook/storybook-static --port 6006`, keeping the other preview
options above. Use local previews only.

In a second terminal, inspect the page using the already provisioned Firefox:

```sh
pnpm exec playwright cli -s=cods open http://127.0.0.1:4321/ --browser firefox
pnpm exec playwright cli -s=cods snapshot
pnpm exec playwright cli -s=cods console error
pnpm exec playwright cli -s=cods close
```

Snapshots expose element references for commands such as `click` and `fill`;
take a fresh snapshot after navigation or page changes. Add `--headed` to `open`
to watch the browser. Close the session and stop the preview when finished.
`.playwright/` and `.playwright-cli/` are ignored workspace/output directories;
CLI output can include session data and credentials.

The interactive CLI does not start the previews or apply `playwright.config.ts`,
`CODS_BROWSER_TARGET`, or our console/axe fixtures. Use it to investigate, then
capture meaningful findings in `tests/browser/*.spec.ts` using the shared fixture
below. Run `pnpm test:browser` after stopping the interactive preview so the
automated suite can own its ports and enforce its accessibility checks.

Microsoft's [upstream skill](https://playwright.dev/agent-cli/skills) is a
`SKILL.md` and reference guides teaching coding agents the CLI. With this pinned
version, `pnpm exec playwright cli install --skills=agents` writes
`.agents/skills/playwright-cli/` relative to the current directory and initializes
`.playwright/`; it does not write `.github/skills/`, which no longer exists. Without `=agents`, `--skills`
defaults to `.claude/skills/playwright-cli/`. The CLI works without installing a
skill. This repository commits the upstream files unmodified at
`.agents/skills/playwright-cli/`; Prettier excludes this vendored directory.
Re-run the installer from the repository root whenever Playwright is upgraded
and review the regenerated skill files alongside the dependency update. The
[CoDS browser-verification skill](../.agents/skills/cods-browser-verification/SKILL.md)
links to this guide for the repository workflow. `AGENTS.md` remains the source
of repository conventions.

## Extend the foundation

Name built-page tests `web-<feature>.spec.ts` and built-story tests
`storybook-<component>.spec.ts` under `tests/browser/` (subdirectories work too).
Their project globs automatically collect new files. Component unit tests still
belong beside their component; browser integration tests exercise the built site.
Import the shared fixture so console errors and uncaught page exceptions fail the
test, including errors during navigation:

```ts
import { test, expect, expectAccessible } from './fixtures.js';

test('example page is accessible', async ({ page }, testInfo) => {
  const response = await page.goto('/getting-started/');
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectAccessible(page, testInfo);
});
```

Prefer semantic locators (`getByRole`, `getByLabel`) and awaited assertions over
arbitrary sleeps. Wait for the relevant interactive state before scanning. The
Astro suite discovers every built HTML route and gives smoke/skip-link navigation
and accessibility checks separate tests. macOS WebKit uses Option+Tab to reach
links; other browser/platform combinations use Tab. Storybook discovers every built story
and scans its rendered `#storybook-root` after checking it is nonempty.

`expectAccessible` scans WCAG 2.0/2.1 A/AA and WCAG 2.2 AA tags. Omit its optional
selector for a complete page scan; use a selector only for an isolated story.
Failures list rule ID, impact, help link, affected selectors, and remediation
summary. Full axe JSON (including incomplete checks) is attached to the report.
Review incomplete results manually. Do not hide violations with broad exclusions
or disabled rules; any justified exception needs an explicit, reviewed rationale.
Automated scans supplement the component contract's required manual keyboard,
screen-reader, zoom/reflow, forced-colors, and localization evidence.

`web-cascade.spec.ts` serves the built `packages/colorado-design-system/dist` CSS
through a routed fixture and proves the cascade layer order with computed styles
in all three browsers: the order statement leads the stylesheet, a low-specificity
`cods.components` rule beats USWDS, a consumer's unlayered rule beats CoDS, the
color overrides beat USWDS, inverse and disabled outline buttons keep USWDS's
variant colors, no `.usa-*` rule sits outside the `uswds` layer (computed style
cannot see `:visited`), and USWDS fonts still load. Build the design
system (`pnpm build`) before running it. See [ADR-007](../docs/adrs/007-cascade-layer-order.md).

## Visual regression conventions for Phase 2 onward

Use `await expect(page.getByRole(...)).toHaveScreenshot('descriptive-state.png')`
for a component or `await expect(page).toHaveScreenshot('page-state.png',
{ fullPage: true })` for a page. Create separate named tests for focus, open,
error, or other meaningful states. Await `page.evaluate(() => document.fonts.ready)`
and image loading before capture; freeze dates or mock changing data. Mask only
unavoidable dynamic content with a documented reason.

The base config fixes a 1280×720 viewport, en-US locale, America/Denver timezone,
light color scheme, and reduced motion. Screenshot assertions disable animations
and allow zero differing pixels. Change viewports or color schemes explicitly in
a dedicated test group; avoid loosening tolerances to accept unexplained changes.

Baselines are committed under
`tests/browser/__screenshots__/<test-file>/<project>-<platform>/<name>.png`.
Review new/changed baselines alongside the UI change. Generate with
`pnpm test:browser --update-snapshots` using the same OS, browser revision, fonts,
and dependencies as the comparison runner. A macOS baseline does not validate a
Linux CI run. For Linux baselines, use the CI environment or a pinned Playwright
container matching the installed Playwright version. Keep expected, actual, and
diff images available in failure artifacts; never update snapshots automatically
in CI. Actual component visual baselines and broader state/device matrices belong
to later phases and are not introduced by this foundation task.

## CI and failure investigation

The path-selected web job provisions all three browsers and runs the Astro suite
across them. The Storybook job provisions only Chromium for its existing suite.
Both upload `test-results/` and `playwright-report/` for seven days even when a
browser test fails, with console errors, axe attachments, failure screenshots,
and retained failure traces. HTML reports never open automatically.

CI downloads browser binaries rather than restoring a separate shared cache,
following [Playwright's caching guidance](https://playwright.dev/docs/ci#caching-browsers):
restore time is comparable to download time and Linux libraries still require
installation. Scope selection avoids provisioning for docs-only changes, each
app builds once, and the foundation suite is deliberately small. Revisit caching
only with measured evidence; key any future cache by OS/architecture and the
resolved Playwright version, and continue installing Linux system dependencies.

For failure diagnostics, open the HTML report, follow the axe rule's help URL, and
inspect the trace and screenshot. After changing the helper or reporter, verify
the failure path with a temporary spec: emit `console.error` to check console
capture, and render an image without alt text in a real loaded page to check axe
output. Confirm a nonzero exit and attachments, then remove the temporary spec.

See [Foundation CI](../docs/CI.md) for job selection and artifacts.
