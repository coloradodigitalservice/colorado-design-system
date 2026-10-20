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
import '@coloradodigitalservice/colorado-design-system/styles.css';
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
stylesheet from `@coloradodigitalservice/colorado-design-system/styles.css`.
The extensionless `/styles` path remains a compatibility alias for the same
built stylesheet; prefer `/styles.css` for new imports.

Canonical HTML and metadata are exported as `./fixtures/accordion.html` and
`./metadata/accordion.json`. The reference page at `/accordion/` documents
markup, initial state, keyboard behavior, configuration, and
`cods-accordion:change` events. Storybook's `Components/Accordion` stories use
the same fixture. See
[accessibility evidence](src/components/accordion/accessibility/accordion.evidence.md)
for automated coverage and outstanding manual/G2 review.

## Icon (experimental)

CoDS uses the design-owner-approved Phosphor IDs in
`src/icons/approved-icons.json`, which records the package, pinned version,
license, Regular weight, and approved IDs. The pinned
`@phosphor-icons/core` development dependency provides source SVGs and category
metadata. Run `pnpm icons:build` from the repository root after changing the
manifest or pinned version; it writes the committed
`generated/icons/sprite.svg` and `catalog.json`, which are not edited by hand.
The catalog records source/version/license and per-icon hashes, with Phosphor's
general taxonomy as its sole category source. `pnpm icons:check` fails when outputs are out of date,
and the package build runs it first. The build then writes `dist/icons/` with
the sprite, one `<id>.svg` per approved icon, the catalog, and the upstream
`LICENSE`.

Packaged CSS does not ship USWDS, USA, or Material icon image collections.
Icons referenced by included USWDS CSS are redirected to equivalent approved
Phosphor files in `dist/icons/`; non-icon USWDS images remain under `dist/img/`.

Package exports include `./icons/sprite.svg`, `./icons/*.svg`,
`./icons/catalog.json`, and `./icons/LICENSE`. Use SVG `<use>` references with
`focusable="false"`. Decorative icons use `aria-hidden="true"`; meaningful
standalone SVGs need an accessible name. The `cods-icon--small` and
`cods-icon--medium` classes use the 16px and 24px spacing tokens, respectively,
and `currentColor`, preserving the square aspect ratio. Add
`cods-icon--mirror-in-rtl` only to icons representing logical interface flow;
other directional icons are not mirrored automatically. Update sprite URLs for
the deployment path; for a separate asset origin, account for browser
same-origin and CORS restrictions on external SVG `<use>` references. The
complete catalog and examples are documented on the
[Icon page](../../apps/web/src/content/docs/icon.md).

The package includes Phosphor's MIT license notice at `icons/LICENSE` and
exports it as `@coloradodigitalservice/colorado-design-system/icons/LICENSE`.
The MIT license requires retaining its copyright and permission notice with
copies or substantial portions of the licensed software. Preserve this notice
if you redistribute the icon assets or copies of them.
Phosphor and Phosphor Icons identify the upstream icon project; their use here
does not imply affiliation with or endorsement by Phosphor. The Phosphor name
and branding are not CoDS marks.

## Shared examples

Fixtures, metadata, and generated per-state examples are available through
`./fixtures/*.html`, `./metadata/*.json`, and `./examples/*.json`. The package
build validates canonical source and generates samples for Astro, Storybook,
and the static HTML consumer. See [the shared fixture workflow](../../docs/governance/shared-fixtures.md)
for state mappings, runtime review instructions, and drift checks.
