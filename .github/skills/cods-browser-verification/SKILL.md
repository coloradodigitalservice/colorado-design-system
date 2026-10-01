---
name: cods-browser-verification
description: Verify built CoDS pages or Storybook stories interactively with the pinned Playwright CLI, then turn findings into browser regression tests.
---

# CoDS browser verification

Follow [AGENTS.md](../../../AGENTS.md) for repository conventions and the
[browser testing guide](../../../tests/README.md#interactive-browser-verification)
for commands, configuration, and diagnostics. Use `pnpm exec playwright cli`
from the repository root; Microsoft's
[upstream skill](../../../.agents/skills/playwright-cli/SKILL.md) supplies CLI
command reference material.

- Build the selected app before inspection and serve its static output using
  the guide's strict preview commands. Inspect local previews only: web on
  `127.0.0.1:4321`, Storybook on `127.0.0.1:6006`.
- Close the browser session and stop the interactive preview before running
  automated tests. `CODS_BROWSER_TARGET=web` or `storybook` selects the automated
  suite's preview and projects; it does not configure the interactive CLI.
- Promote useful findings into `tests/browser/web-<feature>.spec.ts` or
  `storybook-<component>.spec.ts`. Import the shared `test`, `expect`, and
  `expectAccessible` helpers from `tests/browser/fixtures.ts`, adjusting the
  relative import for the test's location, so console errors, page exceptions,
  and axe checks use the existing pipeline.
- Follow the guide's extension, accessibility, and visual-baseline conventions.
  Verify the relevant automated tests after adding a regression case;
  interactive inspection alone does not establish automated accessibility coverage.
