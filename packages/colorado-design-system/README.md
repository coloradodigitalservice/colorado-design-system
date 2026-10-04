# Core design system

This package boundary will own semantic HTML fixtures, layered CSS, optional TypeScript controllers, metadata, icons, assets, and accessibility evidence for components. It depends on the token package. The P1-002 Sass entry currently emits only the agreed CSS layer order; it is not a distributable package build. Package compilation and public exports are tracked as CODS-P1-009. Every component in this package must follow the [canonical component contract](../../docs/governance/component-contract.md) (CODS-P1-004). The USWDS foundational-dependency decision (CODS-P1-015) requires an ADR amendment before implementation.

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
