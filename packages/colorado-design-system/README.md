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

4. Add a subpath export in `package.json`:
   ```json
   {
     "exports": {
       "./component-name": {
         "types": "./dist/components/component-name/component-name.d.ts",
         "default": "./dist/components/component-name/component-name.mjs"
       }
     }
   }
   ```

### Package exports

The package provides several export patterns for consumers:

```typescript
// Main bundle with all components
import { initComponentName } from '@coloradodigitalservice/colorado-design-system';

// Styles
import '@coloradodigitalservice/colorado-design-system/styles';
```

Per-component imports will be available once components are implemented.
