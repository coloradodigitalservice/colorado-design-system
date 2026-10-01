# Registration and handoff checklist

The scaffold script performs the first three items. Do the rest by hand; none is automated yet.

## Done by the script

- [x] Component directory with metadata, fixture, Sass partial, evidence file (copied from the governance template), and, for interactive components, the controller and its unit test.
- [x] Storybook story at `apps/storybook/src/stories/<name>.stories.ts` that imports the component's own fixture and Sass, so the fixture is the single source (contract section 2).
- [x] Interactive only: controller exports (`init<Name>`, `initAll<Name>`, `destroy<Name>`) appended to `packages/colorado-design-system/src/components/index.ts`.

## Do by hand

- [ ] **Type A interactive:** the behavior must come from USWDS's JavaScript, wrapped by the controller (see [uswds-wrapper.md](./uswds-wrapper.md)). USWDS JavaScript is not ingested yet (CODS-P1-017), so note that dependency in the PR.
- [ ] **Resolve every `TODO`** in the generated files. The scaffold is intentionally incomplete: the empty trigger button fails axe, so the Storybook browser checks fail until the fixture is real.
- [ ] **Add one fixture block per documented state** and list the same states in `metadata.json`.
- [ ] **Sass registration.** There is no convention yet for pulling a component partial into `src/styles/index.scss` (nothing is registered today, and Sass emits forwarded CSS in order, so a layer-order statement at the end of `index.scss` would come after the first layered rule and not set the order; CODS-P1-018 should move it to a partial forwarded first). Check whether an earlier component established one; if not, decide it in the PR and note it here.
- [ ] **Package subpath export.** [BUILD.md](../../../../docs/BUILD.md) says to add a subpath export in `packages/colorado-design-system/package.json` once the component is stable. Skip while `experimental`.
- [ ] **Browser spec.** Add `tests/browser/storybook-<name>.spec.ts` following [tests/README.md](../../../../tests/README.md#extend-the-foundation); see the [browser verification skill](../../cods-browser-verification/SKILL.md).
- [ ] **Accessibility evidence.** Complete the generated file with the [accessibility review skill](../../cods-accessibility-review/SKILL.md). Evidence must have no blank items before `stable`.
- [ ] **Metadata consistency.** `type`, `states`, `uswdsEquivalent`, `uswdsVersion`, and `componentType` agree with the fixture and controller (contract section 5 and the ownership matrix).
- [ ] **Gate.** `pnpm check` exits 0 from the repo root.

## Docs site

The public component page in `apps/web` is not scaffolded: the content collection schema for component pages is not settled. Do not invent one; raise it in the PR.
