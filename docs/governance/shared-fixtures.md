# Shared fixtures and metadata

CODS-P2-003 carries Site Alert and Accordion through one source of example data.
The source is `packages/colorado-design-system/src/components/<name>/`:
`<name>.fixture.html` supplies semantic HTML and `<name>.metadata.json` supplies
identity, owners, maturity, supported states, and example definitions. USWDS
metadata must match the package dependency pin; component classification and
divergence fields follow the component contract. Shared support modules under
`src/components/shared/` are excluded from component discovery. This
extends section 5 of the [component contract](component-contract.md); the contract
remains draft pending the listed domain approvals. Component approval and manual
accessibility sign-off remain separate from automated validation.

Each fixture block has a unique `data-cods-fixture-state` value. Metadata
`examples` contains exactly one entry per supported `states` value:

```json
{
  "state": "collapsed",
  "fixtureState": "default",
  "setup": "collapse",
  "instructions": "Initialize the accordion and collapse its first panel."
}
```

`setup` is `none`, `focus`, `expand`, or `collapse`. Runtime states may reference
another authored block, preserving the no-JavaScript fixture. Their code is
flagged `review-required` with instructions: HTML alone cannot demonstrate
keyboard focus or an enhanced controller state. Authored states are marked
`valid` after structural checks (IDs, ARIA targets, meaningful interactive names,
component roots, supported-state coverage). This label is not a full HTML
conformance, accessibility, or contract-approval certification.

The package build discovers component directories and validates their metadata
before copying fixtures and metadata to `dist/fixtures/<name>.html` and
`dist/metadata/<name>.json`. It generates `dist/examples/<name>.json`, containing
state, fixtureState, setup, HTML, matching code, status, and review instructions.
All three asset directories have package exports. Generated files are uncommitted
build output; edit the canonical source and rebuild.

Astro and Storybook import the exported metadata and examples. Astro displays
code from each example's `code`; Storybook renders its `html` and performs runtime
setup for focused, expanded, or collapsed stories. Both also consume the full
exported fixture. Component unit tests import source fixtures. Browser tests
compare every generated sample against built documentation and every supported
Storybook state against current source content. The plain HTML consumer build
copies package assets and renders the exported fixtures and metadata into
`examples/static-html/dist/index.html`.

From the repository root after `nvm use`:

- `pnpm fixtures:validate` validates source metadata, state mappings, and fixtures.
- `pnpm build` regenerates all consumer output; Astro's build fails on code drift.
- `pnpm fixtures:check` compares package fixtures, metadata, examples, and exports
  against source byte for byte. Missing output fails; it never rebuilds silently.
- `node scripts/build-static-example.mjs --check` checks the consumer HTML.
- `pnpm check` includes these checks, unit tests, and browser verification.

CI runs package drift checks after the relevant package/app builds. A temporary
fixture-edit regression proves that changed text regenerates examples and that
stale fixtures, metadata, samples, or exports fail independently. To verify the
full propagation manually, change fixture content, build, and run browser tests;
the docs code, Storybook content, tests, and static consumer must reflect the
change. No framework wrappers or runtime content store are introduced.
