# Registration and handoff checklist

The scaffold script performs the first three items. Package builds automatically
copy fixtures and metadata, and wildcard exports expose them. Complete the
remaining registration and review items by hand.

## Done by the script

- [x] Component directory with metadata, fixture, Sass partial, evidence file (copied from the governance template), and, for interactive components, the controller and its unit test.
- [x] Storybook story at `apps/storybook/src/stories/<name>.stories.ts` that imports the component's own fixture (`?raw`) and Sass, so the fixture is the single source (contract section 2). Interactive stories call `initAll` in `play`, once the story root is mounted. The controller is imported from source so `pnpm validate` typechecks without a built `dist/`; check the built bundle separately (see below).
- [x] Interactive only: controller exports (`init<Name>`, `initAll<Name>`, `destroy<Name>`) appended to `packages/colorado-design-system/src/components/index.ts`.

## Automatic package assets

- [x] The build discovers component directories and copies `<name>.fixture.html`
      and `<name>.metadata.json` into `dist/fixtures/<name>.html` and
      `dist/metadata/<name>.json`. The reserved `shared/` support directory is skipped;
      missing either required component file fails the build.
- [x] `./fixtures/*.html` and `./metadata/*.json` wildcard exports expose these
      assets for every maturity, including `experimental`. An exported path does not
      imply stable maturity; consult the component metadata. No per-component Vite
      copy step or fixture/metadata export entry is needed.

## Do by hand

- [ ] **Type A interactive:** replace the generated controller with a thin wrapper over the USWDS behavior, following [uswds-wrapper.md](./uswds-wrapper.md) and contract section 4.5. If it wraps USWDS JavaScript, add the `declare module '@uswds/uswds/js/<id>'` entry to `packages/colorado-design-system/src/types.d.ts`, and check that `dist/colorado-design-system.mjs` has no `require(` and no `uswdsPresent`.
- [ ] **Resolve every `TODO`** in the generated files. The scaffold is intentionally incomplete: the empty trigger button fails axe, so the Storybook browser checks fail until the fixture is real.
- [ ] **Add one fixture block per documented state** and list the same states in `metadata.json`.
- [ ] **Sass registration.** Add `@forward '../components/<name>/<name>';` to `src/styles/index.scss` after the layer-order and theme forwards, following Site Alert. `_cods-layers.scss` is forwarded first; component partials emit their own `cods.components` rules ([ADR-007](../../../../docs/adrs/007-cascade-layer-order.md)). This step remains manual.
- [ ] **Built package imports.** Verify the automatic fixture/metadata paths resolve after `pnpm build`, following [BUILD.md](../../../../docs/BUILD.md). Interactive controller functions use the main bundle; do not add a per-component controller subpath.
- [ ] **Browser specs.** Add `tests/browser/storybook-<name>.spec.ts` covering pointer, keyboard, and events, following [tests/README.md](../../../../tests/README.md#extend-the-foundation); see the [browser verification skill](../../cods-browser-verification/SKILL.md). Add a `web-<name>.spec.ts` when a docs page renders the component, because the Storybook project runs in Chromium only and the web project also runs Firefox and WebKit.
- [ ] **Accessibility evidence.** Complete the generated file with the [accessibility review skill](../../cods-accessibility-review/SKILL.md). Leave unverified items unchecked; evidence must have no blank items before `stable`.
- [ ] **Metadata consistency.** `type`, `states`, `progressiveEnhancement`, `uswdsEquivalent`, `uswdsVersion`, and `componentType` agree with the fixture and controller (contract section 5 and the ownership matrix).
- [ ] **Gate.** `pnpm check` exits 0 from the repo root, which includes the browser suite.

## Docs site

The public component page in `apps/web` is not scaffolded: the content collection schema for component pages is not settled. Do not invent one; raise it in the PR.
