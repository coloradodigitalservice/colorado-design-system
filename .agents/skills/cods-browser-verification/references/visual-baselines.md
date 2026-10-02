# Visual baselines

Conventions are normative in [tests/README.md](../../../../tests/README.md#visual-regression-conventions-for-phase-2-onward). This file is the procedure for adding or changing a baseline; it does not restate those rules. No component baselines exist yet, so check whether an earlier component set a precedent before following this.

## Add a baseline test

1. Create or extend `tests/browser/storybook-<component>.spec.ts` (or `web-<feature>.spec.ts`), importing `test` and `expect` from the shared fixtures so console errors still fail the test.
2. One named test per meaningful state (default, focus, open, error), each ending in `await expect(locator).toHaveScreenshot('<state>.png')`. Before capture, await `page.evaluate(() => document.fonts.ready)` and image loading.
3. Reach the state with real interaction (keyboard `Tab`, click) rather than injected classes, so the screenshot proves the state is reachable.
4. Mask only unavoidable dynamic content and add a comment giving the reason. Never raise `maxDiffPixels` (the base config allows `0`).

## Generate and review

```sh
pnpm exec turbo run build --filter=@cods-internal/storybook...
CODS_BROWSER_TARGET=storybook pnpm test:browser --update-snapshots --grep "<test name>"
```

- Stop any interactive preview first; ports 4321 and 6006 must be free.
- Baselines are written to `tests/browser/__screenshots__/<test-file>/<project>-<platform>/<name>.png`. The platform is part of the path, so a macOS run produces a `darwin` baseline that a Linux CI run does not use.
- Open every new or changed PNG and confirm it shows the intended state. Review the images in the PR alongside the UI change.
- Rerun without `--update-snapshots` and confirm it passes twice in a row; a flaky baseline means the test is not deterministic yet (animation, font loading, timing).

## Open problem: Linux baselines

The CI jobs run on Linux, and the tests README says baselines must come from the same OS, browser revision, fonts, and dependencies as the comparison run. The repository has no workflow or container recipe that produces Linux baselines yet. Until one exists, do not commit `darwin` baselines expecting CI to use them, and do not update snapshots automatically in CI. Raise the question with the technical lead in the PR and record the outcome here.

## When Playwright is upgraded

Browser rendering can change with the browser revision. After a Playwright upgrade, rerun the visual tests, review every diff image, and regenerate baselines deliberately in the same PR. See the [dependency update policy](../../../../docs/governance/dependency-update-policy.md#upgrade-coupling).
