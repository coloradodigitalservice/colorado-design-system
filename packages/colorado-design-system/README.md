# Core design system

This package owns semantic HTML fixtures, layered CSS, optional TypeScript controllers, metadata, icons, assets, and accessibility evidence for components. It depends on the token package and on a pinned USWDS release ([ADR-002](../../docs/adrs/002-uswds-foundational-dependency.md)). Every component in this package must follow the [canonical component contract](../../docs/governance/component-contract.md).

## Build & Development

### Building the package

The design system uses [Vite](https://vitejs.dev/) in library mode to compile TypeScript components and Sass/CSS into distributable ESM and CSS bundles.

```bash
# One-time production build
pnpm run build

# Watch mode for development
pnpm run build:watch
```

### Build outputs

After running `pnpm run build`, the `dist/` directory contains:

- **`colorado-design-system.mjs`** – ESM bundle with all component controllers and exports
- **`colorado-design-system.css`** – Compiled CSS from `src/styles/index.scss`
- **`index.d.ts`** – TypeScript type declarations for the main entry point
- **`components/*.d.ts`** – Type declarations for individual components (as they are added)

### Adding a new component

1. Create a component directory under `src/components/<component-name>/`:

   ```
   src/components/<component-name>/
   ├── <component-name>.metadata.json
   ├── <component-name>.fixture.html
   ├── <component-name>.scss
   ├── <component-name>.ts              (if interactive)
   └── accessibility/
       └── <component-name>.evidence.md
   ```

2. For interactive components, export the controller in `src/components/<component-name>/<component-name>.ts`:

   ```typescript
   export function init(root: HTMLElement) {
     // Initialize component
   }

   export function destroy(root: HTMLElement) {
     // Clean up
   }
   ```

3. Add an export in `src/components/index.ts`:

   ```typescript
   export {
     init as initComponentName,
     destroy as destroyComponentName,
   } from './component-name/component-name.js';
   ```

4. Forward the component Sass partial in `src/styles/index.scss`. The build
   automatically copies every component's fixture and metadata, and wildcard
   exports expose `./fixtures/<name>.html` and `./metadata/<name>.json` for all
   maturities. The reserved `shared/` directory is skipped; missing either asset
   in a component directory fails the build. No export entry is needed for each
   component. Controller functions are exported from the main bundle.

### Package exports

The package provides several export patterns for consumers:

```typescript
// Main bundle with all components
import { initComponentName } from '@coloradodigitalservice/colorado-design-system';

// Styles
import '@coloradodigitalservice/colorado-design-system/styles';
```

Fixtures and metadata are exported through `./fixtures/*.html` and
`./metadata/*.json`, including experimental components. Consult the metadata
for maturity; an exported path does not imply stability. Per-component
controller subpaths are not exported.

### Site Alert (experimental)

The first static vertical slice is `cods-site-alert`, a themed USWDS Site Alert.
Load the package stylesheet and use the canonical fixture structure. It requires
no JavaScript controller. Package exports include `./fixtures/site-alert.html`
and `./metadata/site-alert.json`; both are copied from component source at build
time. Public usage and customization are documented in
[`apps/web/src/content/docs/site-alert.md`](../../apps/web/src/content/docs/site-alert.md).
Accessibility review status is recorded beside the component in
`src/components/site-alert/accessibility/site-alert.evidence.md`.

USWDS CSS and its Colorado brand overrides are emitted together in `uswds`.
The layer order is `uswds`, `cods.reset`, `cods.base`, `cods.components`,
then `cods.utilities`. CoDS component rules live in `cods.components`, so normal
rules override upstream styles without raising selector specificity. Consumers
may use `cods.utilities` for their own overrides. Unlayered consumer CSS takes
precedence over normal layered rules. USWDS utilities using `!important` cannot
be overridden by normal declarations.

## Accordion (experimental)

CODS-P2-002 selects Accordion as the interactive vertical slice. Import
`initAccordion`, `initAllAccordions`, `destroyAccordion`, and
`setAccordionExpanded` from the package root. Its USWDS toggle behavior is
bundled; consumers do not need a second runtime script. Import the compiled
stylesheet from `@coloradodigitalservice/colorado-design-system/styles`.

Canonical HTML and metadata are exported as `./fixtures/accordion.html` and
`./metadata/accordion.json`. The reference page at `/accordion/` documents
markup, initial state, keyboard behavior, configuration, and
`cods-accordion:change` events. Storybook's `Components/Accordion` stories use
the same fixture. See
[accessibility evidence](src/components/accordion/accessibility/accordion.evidence.md)
for automated coverage and outstanding manual/G2 review.

## Shared examples

Fixtures, metadata, and generated per-state examples are available through
`./fixtures/*.html`, `./metadata/*.json`, and `./examples/*.json`. The package
build validates canonical source and generates samples for Astro, Storybook,
and the static HTML consumer. See [the shared fixture workflow](../../docs/governance/shared-fixtures.md)
for state mappings, runtime review instructions, and drift checks.
