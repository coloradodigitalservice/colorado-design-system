# Registration checklist

After the component directory is complete, register it so the package, Storybook, and the docs site pick it up.

- [ ] Export the controller from `packages/colorado-design-system/src/components/index.ts` as `init<Name>`, `initAll<Name>s`, and `destroy<Name>`.
- [ ] If it wraps USWDS JavaScript, add the `declare module '@uswds/uswds/js/<id>'` entry to `packages/colorado-design-system/src/types.d.ts`.
- [ ] Add a Storybook story at `apps/storybook/src/stories/<name>.stories.ts` that renders the component's own `<name>.fixture.html` (`?raw`) and, for interactive components, calls the controller imported from the built package in a `play` function.
- [ ] Add `tests/browser/storybook-<name>.spec.ts` covering pointer, keyboard, and events. Add a `web-<name>.spec.ts` when a docs page renders the component, so Firefox and WebKit run it.
- [ ] Complete `accessibility/<name>.evidence.md` honestly; leave unverified items unchecked.
- [ ] Set `<name>.metadata.json` `states` and `progressiveEnhancement` to match the fixture.
- [ ] Run `pnpm check`, then the browser suite (`pnpm exec playwright test <name>`).
